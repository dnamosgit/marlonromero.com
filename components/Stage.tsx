'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import type { Artwork, World } from '@/lib/data';
import { EYE, START_Z, fitDistance, fovFor, pathLength, place, type Place } from '@/lib/layout';
import { artTexture, glowTexture } from '@/lib/textures';

export type Rig = { target: number; focus: number; snap: boolean; mx: number; my: number };
export type VeilArt = { art: Artwork; tint: string } | null;
export type StageHandle = { veil: (mid: () => void, from?: VeilArt, to?: VeilArt) => void };

const NOISE = /* glsl */ `
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for(int i=0;i<4;i++){ s += a*noise(p); p *= 2.03; a *= .5; } return s; }`;

/* ---------- Environment colour ---------- */
function Backdrop({ color }: { color: string }) {
  const { scene } = useThree();
  const target = useMemo(() => new THREE.Color(color), [color]);
  useEffect(() => { if (!scene.background) scene.background = new THREE.Color(color); }, [scene, color]);
  useFrame((_, dt) => { (scene.background as THREE.Color | null)?.lerp(target, 1 - Math.exp(-dt * 1.6)); });
  return null;
}

/* ---------- Particles: fireflies, rising embers, dust or slow snow, by world ---------- */
function Motes({ cfg, color, color2, count }: { cfg: World['motes']; color: string; color2: string; count: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const target = useMemo(() => new THREE.Color(color), [color]);
  const target2 = useMemo(() => new THREE.Color(color2), [color2]);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry(), p = new Float32Array(count * 3), s = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 26; p[i * 3 + 1] = Math.random() * 9; p[i * 3 + 2] = -Math.random() * 60;
      for (let k = 0; k < 4; k++) s[i * 4 + k] = Math.random();
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(s, 4));
    return g;
  }, [count]);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uCamZ: { value: 0 }, uPx: { value: 6 }, uColor: { value: new THREE.Color(color) }, uColor2: { value: new THREE.Color(color2) },
    uRise: { value: cfg.rise }, uDrift: { value: cfg.drift }, uSize: { value: cfg.size }, uTwinkle: { value: cfg.twinkle },
  }), []); // eslint-disable-line react-hooks/exhaustive-deps
  useFrame((s, dt) => {
    const u = mat.current.uniforms, k = 1 - Math.exp(-dt * 1.5);
    u.uTime.value = s.clock.elapsedTime; u.uCamZ.value = s.camera.position.z;
    u.uPx.value = (s.size.height * s.viewport.dpr) / 150;
    (u.uColor.value as THREE.Color).lerp(target, k); (u.uColor2.value as THREE.Color).lerp(target2, k);
    u.uRise.value += (cfg.rise - u.uRise.value) * k; u.uDrift.value += (cfg.drift - u.uDrift.value) * k;
    u.uSize.value += (cfg.size - u.uSize.value) * k; u.uTwinkle.value += (cfg.twinkle - u.uTwinkle.value) * k;
  });
  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial ref={mat} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending}
        vertexShader={/* glsl */ `
          attribute vec4 aSeed; uniform float uTime, uCamZ, uRise, uDrift, uSize, uTwinkle, uPx; varying float vA; varying float vMix;
          void main(){
            vMix = step(.68, aSeed.w);
            vec3 p = position;
            p.y = mod(p.y + uTime * uRise * (.5 + aSeed.x), 9.) - .8;
            p.x += sin(uTime * .2 * (.5 + aSeed.y) + aSeed.z * 6.28) * uDrift;
            p.z += cos(uTime * .17 * (.5 + aSeed.x) + aSeed.w * 6.28) * uDrift;
            p.z = uCamZ + 6. - mod(uCamZ + 6. - p.z, 60.);
            vec4 mv = modelViewMatrix * vec4(p, 1.);
            gl_Position = projectionMatrix * mv;
            float tw = 1. - uTwinkle * (.5 + .5 * sin(uTime * (1. + aSeed.z * 2.) + aSeed.w * 40.));
            vA = tw * smoothstep(55., 18., -mv.z) * smoothstep(.3, 2.5, -mv.z) * (.3 + .7 * aSeed.y);
            gl_PointSize = uSize * uPx * (2. + 6. * aSeed.x) / max(-mv.z, .5);
          }`}
        fragmentShader={/* glsl */ `
          uniform vec3 uColor, uColor2; varying float vA; varying float vMix;
          void main(){ float a = smoothstep(.5, 0., length(gl_PointCoord - .5)); gl_FragColor = vec4(mix(uColor, uColor2, vMix), a * a * vA * .85); }`}
      />
    </points>
  );
}

/* ---------- Interactive painting ---------- */
function Painting({ art, pl, index, world, rig, onSelect }: {
  art: Artwork; pl: Place; index: number; world: World; rig: MutableRefObject<Rig>; onSelect: (i: number) => void;
}) {
  const group = useRef<THREE.Group>(null!);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const halo = useRef<THREE.MeshBasicMaterial>(null!);
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const b = useRef(0), bob = useRef(1);
  const pos = useMemo(() => new THREE.Vector3(pl.x, pl.y, pl.z), [pl]);
  const glow = useMemo(() => glowTexture(), []);

  useFrame((s, dt) => {
    const dist = s.camera.position.distanceTo(pos), f = rig.current.focus;
    if (!tex && dist < 48) setTex(artTexture(art, world.glow)); // lazy: only load paintings the visitor approaches
    const ready = !!tex && tex.userData.ready;
    let t = f === index ? 1 : f >= 0 ? 0.12 : THREE.MathUtils.clamp(1 - (dist - 8) / 30, 0.1, 1);
    if (!ready) t = 0;
    b.current += (t - b.current) * (1 - Math.exp(-dt * 3));
    // Distance dimming is atmosphere only: a focused painting is shown at exactly its own colours.
    if (mat.current) mat.current.color.setScalar(f === index && b.current > 0.985 ? 1 : b.current);
    halo.current.opacity = 0.42 * b.current * (f >= 0 && f !== index ? 0.3 : 1);
    bob.current += ((f === index ? 0 : 1) - bob.current) * (1 - Math.exp(-dt * 2));
    group.current.position.y = pl.y + Math.sin(s.clock.elapsedTime * 0.35 + index * 1.7) * world.layout.bob * bob.current;
  });

  return (
    <group ref={group} position={[pl.x, pl.y, pl.z]} rotation-y={pl.rotY}>
      <mesh position-z={-0.4}>
        <planeGeometry args={[pl.w * 2.1, pl.h * 2.1]} />
        <meshBasicMaterial ref={halo} map={glow} color={world.glow} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh position={[0, -pl.y + 0.02, 0.8]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[pl.w * 1.8, 4.5]} />
        <meshBasicMaterial map={glow} color={world.glow} transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh
        onClick={(e) => { e.stopPropagation(); if (e.delta < 8) onSelect(index); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = ''; }}
      >
        <planeGeometry args={[pl.w, pl.h]} />
        <meshBasicMaterial key={tex ? 'art' : 'empty'} ref={mat} map={tex} color="#000" toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ---------- A world: paintings in space + the travelling / approaching camera ---------- */
function WorldScene({ world, arts, rig, onSelect }: { world: World; arts: Artwork[]; rig: MutableRefObject<Rig>; onSelect: (i: number) => void }) {
  const places = useMemo(() => arts.map((a, i) => place(world, a, i)), [world, arts]);
  const len = pathLength(world, arts.length);
  const cur = useRef(rig.current.target);
  const v = useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3(), lookCur: new THREE.Vector3(0, EYE, -8), n: new THREE.Vector3() }), []);
  useEffect(() => () => { document.body.style.cursor = ''; }, []);

  useFrame((s, dt) => {
    const r = rig.current, cam = s.camera as THREE.PerspectiveCamera, sway = world.layout.sway;
    cur.current = r.snap ? r.target : cur.current + (r.target - cur.current) * (1 - Math.exp(-dt * 2.6));
    const pl = r.focus >= 0 ? places[r.focus] : null;
    if (pl) {
      // Camera approach: glide to face the painting square-on; the pointer shifts the viewpoint slightly for depth.
      const d = fitDistance(pl, cam.fov, s.size.width / s.size.height);
      v.n.set(Math.sin(pl.rotY), 0, Math.cos(pl.rotY));
      v.pos.set(pl.x, pl.y, pl.z).addScaledVector(v.n, d);
      v.pos.x += Math.cos(pl.rotY) * r.mx * d * 0.02; v.pos.z -= Math.sin(pl.rotY) * r.mx * d * 0.02; v.pos.y += r.my * d * 0.015;
      v.look.set(pl.x, pl.y, pl.z);
    } else {
      const z = START_Z - cur.current * len;
      v.pos.set(Math.sin(z * 0.11) * sway + r.mx * 0.35, EYE + r.my * 0.18, z);
      v.look.set(Math.sin((z - 9) * 0.11) * sway * 0.5 + r.mx * 1.4, EYE + 0.25 + r.my * 0.6, z - 9);
    }
    const k = r.snap ? 1 : 1 - Math.exp(-dt * 2.2);
    cam.position.lerp(v.pos, k); v.lookCur.lerp(v.look, k); cam.lookAt(v.lookCur);
    r.snap = false;
  });

  return <>{arts.map((a, i) => <Painting key={a.id} art={a} pl={places[i]} index={i} world={world} rig={rig} onSelect={onSelect} />)}</>;
}

/* ---------- Lens follows the screen shape (rotation, split view, resize) ---------- */
function Lens() {
  useFrame((s) => {
    const cam = s.camera as THREE.PerspectiveCamera, f = fovFor(s.size.width / s.size.height);
    if (cam.fov !== f) { cam.fov = f; cam.updateProjectionMatrix(); }
  });
  return null;
}

function HubCamera({ rig }: { rig: MutableRefObject<Rig> }) {
  const look = useMemo(() => new THREE.Vector3(0, EYE, -8), []);
  useFrame((s, dt) => {
    const k = 1 - Math.exp(-dt * 1.5), r = rig.current;
    s.camera.position.x += (r.mx * 0.5 - s.camera.position.x) * k;
    s.camera.position.y += (EYE + r.my * 0.25 - s.camera.position.y) * k;
    s.camera.position.z += (START_Z - s.camera.position.z) * k;
    s.camera.lookAt(look);
  });
  return null;
}

/* ---------- Signature transition: the painting's own colours flood the view, then part to reveal what is next ---------- */
type VeilApi = { play: StageHandle['veil'] };
function Veil({ api }: { api: MutableRefObject<VeilApi | null> }) {
  const mesh = useRef<THREE.Mesh>(null!);
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const size = useThree((s) => s.size);
  const initial = useMemo(() => ({
    uTex: { value: null as THREE.Texture | null }, uHas: { value: 0 }, uTint: { value: new THREE.Color('#1a1f1a') },
    uP: { value: 0 }, uZoom: { value: 1 }, uTime: { value: 0 }, uStyle: { value: 0 }, uTexAspect: { value: 1 }, uViewAspect: { value: 1 },
  }), []);
  const busy = useRef(false), style = useRef(0);

  useEffect(() => {
    const uniforms = mat.current.uniforms; // always the live material's uniforms
    const set = (v?: VeilArt) => {
      if (!v) { uniforms.uHas.value = 0; return; }
      const t = artTexture(v.art, v.tint);
      uniforms.uTex.value = t; uniforms.uHas.value = t.userData.ready ? 1 : 0;
      uniforms.uTexAspect.value = v.art.w / v.art.h; uniforms.uTint.value.set(v.tint).multiplyScalar(0.5);
    };
    api.current = {
      play(mid, from, to) {
        if (busy.current) { mid(); return; }
        busy.current = true; style.current = (style.current + 1) % 3;
        mesh.current.visible = true;
        uniforms.uStyle.value = style.current; uniforms.uP.value = 0; uniforms.uZoom.value = 1; set(from ?? to);
        gsap.timeline({ onComplete: () => { busy.current = false; mesh.current.visible = false; } })
                    .to(uniforms.uP, { value: 1, duration: 1.15, ease: 'power2.inOut' }, 0)
          .to(uniforms.uZoom, { value: 0.22, duration: 1.15, ease: 'power2.in' }, 0)
          .add(() => { mid(); if (to) set(to); uniforms.uStyle.value = (style.current + 1) % 3; uniforms.uZoom.value = 0.3; })
          .to(uniforms.uP, { value: 0, duration: 1.5, ease: 'power2.inOut' }, '+=0.3')
          .to(uniforms.uZoom, { value: 0.14, duration: 1.5, ease: 'power1.out' }, '<');
      },
    };
    return () => { api.current = null; };
  }, [api]);

  useFrame((s) => { const u = mat.current.uniforms; u.uTime.value = s.clock.elapsedTime; u.uViewAspect.value = size.width / size.height; });

  return (
    <mesh ref={mesh} visible={false} frustumCulled={false} renderOrder={1000}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} uniforms={initial} transparent depthTest={false} depthWrite={false}
        vertexShader={/* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`}
        fragmentShader={/* glsl */ `
          uniform sampler2D uTex; uniform float uP, uZoom, uTime, uTexAspect, uViewAspect, uHas; uniform int uStyle; uniform vec3 uTint;
          varying vec2 vUv;
          ${NOISE}
          void main(){
            vec2 q = vec2(vUv.x * uViewAspect, vUv.y);
            float n = fbm(q * 2.2 + uTime * .05);
            float thr = n;                                                                   // 0: organic dissolve
            if (uStyle == 1) thr = length(q - vec2(.5 * uViewAspect, .5)) * .85 + n * .35;   // 1: bloom from the centre
            else if (uStyle == 2) thr = vUv.y * .7 + n * .45;                                // 2: rising mist
            float e = uP * 1.6 - thr;
            float a = smoothstep(0., .14, e);
            vec2 c = vUv - .5; float r = uViewAspect / uTexAspect;
            if (r > 1.) c.y /= r; else c.x *= r;
            vec2 flow = vec2(fbm(q * 1.5 + uTime * .08), fbm(q * 1.5 - uTime * .07 + 7.)) - .5;
            vec3 col = mix(uTint * (.6 + n), texture2D(uTex, .5 + c * uZoom + flow * .14 * (1.2 - uZoom)).rgb, uHas);
            col += (a - smoothstep(.06, .3, e)) * vec3(.075, .05, .012);                       // warm light on the advancing edge
            gl_FragColor = vec4(col, a);
            #include <colorspace_fragment>
          }`}
      />
    </mesh>
  );
}

/* ---------- Stage ---------- */
type Props = { world: World | null; arts: Artwork[]; rig: MutableRefObject<Rig>; onSelect: (i: number) => void; mobile: boolean; hub: World; handle: MutableRefObject<StageHandle | null> };

export default function Stage({ world, arts, rig, onSelect, mobile, hub, handle }: Props) {
  const api = useRef<VeilApi | null>(null);
  // A plain ref prop (not forwardRef) so the handle survives the lazy import boundary.
  useEffect(() => {
    handle.current = { veil: (mid, from, to) => (api.current ? api.current.play(mid, from, to) : mid()) };
    return () => { handle.current = null; };
  }, [handle]);
  const env = world ?? hub;
  return (
    <Canvas flat dpr={[1, mobile ? 1.5 : 2]} camera={{ fov: 50, near: 0.1, far: 140, position: [0, EYE, START_Z] }}
      gl={{ antialias: !mobile, powerPreference: 'high-performance' }} aria-hidden>
      <Lens />
      <Backdrop color={env.bg} />
      <Motes cfg={env.motes} color={env.mote} color2={env.mote2} count={mobile ? 320 : 900} />
      {world ? <WorldScene key={world.key} world={world} arts={arts} rig={rig} onSelect={onSelect} /> : <HubCamera rig={rig} />}
      <Veil api={api} />
    </Canvas>
  );
}
