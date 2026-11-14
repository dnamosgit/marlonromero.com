import * as THREE from 'three';
import type { Artwork } from './data';

const cache = new Map<string, THREE.Texture>();
let loader: THREE.TextureLoader | null = null;
let glow: THREE.Texture | null = null;

/** Neutral stand-in used only until the real file is added. Never shown in place of a real painting. */
function placeholder(art: Artwork, tint: string) {
  const s = 640 / Math.max(art.w, art.h);
  const c = document.createElement('canvas');
  c.width = Math.round(art.w * s); c.height = Math.round(art.h * s);
  const g = c.getContext('2d')!;
  g.fillStyle = '#151614'; g.fillRect(0, 0, c.width, c.height);
  const a = g.createRadialGradient(c.width * 0.8, c.height * 0.9, 0, c.width * 0.8, c.height * 0.9, c.width);
  a.addColorStop(0, tint); a.addColorStop(1, 'rgba(0,0,0,0)');
  g.globalAlpha = 0.55; g.fillStyle = a; g.fillRect(0, 0, c.width, c.height); g.globalAlpha = 1;
  g.fillStyle = 'rgba(236,230,216,.4)'; g.font = '500 13px Helvetica, Arial, sans-serif';
  g.fillText('I M A G E   P E N D I N G', 22, c.height - 24);
  const t = new THREE.CanvasTexture(c);
  t.userData.ready = true;
  return t;
}

/** Texture for a painting, loaded on first request and cached. Colours are passed through untouched. */
export function artTexture(art: Artwork, tint: string): THREE.Texture {
  const hit = cache.get(art.id);
  if (hit) return hit;
  let t: THREE.Texture;
  if (art.src) {
    loader ??= new THREE.TextureLoader();
    t = loader.load(art.src, (tex) => { tex.userData.ready = true; });
    t.userData.ready = false;
  } else t = placeholder(art, tint);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(art.id, t);
  return t;
}

/** Soft radial light used behind and beneath paintings (a separate layer, never on the artwork). */
export function glowTexture() {
  if (glow) return glow;
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.45, 'rgba(255,255,255,.28)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 256, 256);
  glow = new THREE.CanvasTexture(c);
  return glow;
}
