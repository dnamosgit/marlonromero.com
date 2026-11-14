'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import gsap from 'gsap';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WORLDS, artById, artMeta, artName, artsOf, worldByKey, SITE, type World } from '@/lib/data';
import { fitWorld, isPortrait, nearestIndex, pathLength, progressFor } from '@/lib/layout';
import type { Rig, StageHandle } from './Stage';
import ArtImage from './ArtImage';
import Inspector from './Inspector';
import Mandala from './Mandala';

const Stage = dynamic(() => import('./Stage'), { ssr: false }); // WebGL is fetched separately, never in the first load

type Phase = 'boot' | 'opening' | 'hub' | 'world';
const clamp = (v: number) => Math.min(1, Math.max(0, v));

export default function Experience() {
  const [phase, setPhase] = useState<Phase>('boot');
  const [worldKey, setWorldKey] = useState<string | null>(null);
  const [focus, setFocus] = useState(-1);
  const [lite, setLite] = useState(false);     // no WebGL or reduced motion: same content, plain presentation
  const [mobile, setMobile] = useState(false);
  const [menu, setMenu] = useState(false);
  const [inspect, setInspect] = useState(false);
  const [idle, setIdle] = useState(false);
  const [portrait, setPortrait] = useState(false);
  const portraitRef = useRef(false);
  const stage = useRef<StageHandle | null>(null);
  const rig = useRef<Rig>({ target: 0, focus: -1, snap: false, mx: 0, my: 0 });
  const opening = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  const base = worldByKey(worldKey);
  const world = useMemo(() => (base ? fitWorld(base, portrait) : null), [base, portrait]);
  const arts = useMemo(() => (world ? artsOf(world.category) : []), [world]);
  const art = focus >= 0 ? arts[focus] : null;
  const openingArt = artById(SITE.openingArt);
  const veilOf = (w: World, i = 0) => { const a = artsOf(w.category)[i]; return a ? { art: a, tint: w.glow } : null; };

  const setProgress = useCallback((p: number) => {
    rig.current.target = clamp(p);
    if (bar.current) bar.current.style.transform = `scaleX(${rig.current.target})`;
  }, []);

  /* ---- state changes ---- */
  const show = useCallback((key: string | null, artId?: string | null) => {
    const raw = worldByKey(key), w = raw ? fitWorld(raw, portraitRef.current) : null, list = w ? artsOf(w.category) : [];
    const f = artId ? list.findIndex((a) => a.id === artId) : -1;
    rig.current.focus = f; rig.current.snap = true;
    setWorldKey(w ? w.key : null); setFocus(f); setPhase(w ? 'world' : 'hub'); setMenu(false); setInspect(false);
    setProgress(w && f >= 0 ? progressFor(w, list.length, f) : 0);
  }, [setProgress]);

  const travel = useCallback((key: string | null) => {
    const to = worldByKey(key), from = worldByKey(worldKey);
    const fromArt = from ? veilOf(from, Math.max(0, rig.current.focus)) : null;
    const apply = () => { show(key); history.pushState(null, '', key ? `/?w=${key}` : '/'); };
    setMenu(false);
    if (stage.current && !lite) stage.current.veil(apply, fromArt, to ? veilOf(to) : fromArt); else apply();
  }, [worldKey, lite, show]);

  const focusOn = useCallback((i: number) => { rig.current.focus = i; setFocus(i); }, []);
  const release = useCallback(() => {
    if (world && rig.current.focus >= 0) setProgress(progressFor(world, arts.length, rig.current.focus));
    rig.current.focus = -1; setFocus(-1);
  }, [world, arts.length, setProgress]);
  const step = useCallback((d: number) => {
    if (!world || !arts.length) return;
    const cur = rig.current.focus, n = (cur + d + arts.length) % arts.length;
    const apply = () => { rig.current.focus = n; rig.current.snap = true; setFocus(n); };
    if (stage.current && !lite) stage.current.veil(apply, { art: arts[cur], tint: world.glow }, { art: arts[n], tint: world.glow }); else apply();
  }, [world, arts, lite]);

  const enter = useCallback(() => {
    try { sessionStorage.setItem('entered', '1'); } catch {}
    const done = () => setPhase('hub');
    if (opening.current && !lite) gsap.to(opening.current, { opacity: 0, scale: 1.04, duration: 1.5, ease: 'power2.inOut', onComplete: done }); else done();
  }, [lite]);

  /* ---- boot: capabilities + deep links (/?w=origin&a=<id>) ---- */
  useEffect(() => {
    let gl = false;
    try { const c = document.createElement('canvas'); gl = !!(c.getContext('webgl2') || c.getContext('webgl')); } catch {}
    setLite(!gl || matchMedia('(prefers-reduced-motion: reduce)').matches);
    setMobile(matchMedia('(max-width: 820px), (pointer: coarse)').matches);
    const shape = () => { const pt = isPortrait(innerWidth / innerHeight); portraitRef.current = pt; setPortrait(pt); };
    shape(); addEventListener('resize', shape);
    const read = () => {
      const q = new URLSearchParams(location.search), w = q.get('w');
      let seen = false; try { seen = !!sessionStorage.getItem('entered'); } catch {}
      if (worldByKey(w)) show(w, q.get('a')); else if (seen) show(null); else setPhase('opening');
    };
    read();
    addEventListener('popstate', read);
    return () => { removeEventListener('popstate', read); removeEventListener('resize', shape); };
  }, [show]);

  /* ---- input: wheel / touch / keyboard / pointer ---- */
  useEffect(() => {
    const blocked = () => menu || inspect || lite;
    const per = () => (world ? world.layout.spacing / pathLength(world, arts.length) : 0); // one painting's worth of travel
    let timer = 0;
    const wake = () => { setIdle(false); clearTimeout(timer); timer = window.setTimeout(() => setIdle(true), 3500); };

    const wheel = (e: WheelEvent) => {
      if (phase !== 'world' || blocked() || rig.current.focus >= 0) return;
      setProgress(rig.current.target + (e.deltaY / 320) * per());
    };
    const pointer = (e: PointerEvent) => {
      wake();
      if (e.pointerType !== 'mouse') return;
      rig.current.mx = (e.clientX / innerWidth) * 2 - 1; rig.current.my = -((e.clientY / innerHeight) * 2 - 1);
      document.documentElement.style.setProperty('--mx', String(rig.current.mx));
      document.documentElement.style.setProperty('--my', String(rig.current.my));
    };
    let t0: { x: number; y: number; p: number } | null = null;
    const ts = (e: TouchEvent) => { wake(); t0 = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY, p: rig.current.target } : null; };
    const tm = (e: TouchEvent) => {
      if (!t0 || phase !== 'world' || blocked() || rig.current.focus >= 0) return;
      const dx = e.touches[0].clientX - t0.x, dy = e.touches[0].clientY - t0.y;
      const d = Math.abs(dx) > Math.abs(dy) ? dx : dy;               // drag in either direction to travel
      setProgress(t0.p - (d / innerHeight) * per() * 2.2);
    };
    const te = (e: TouchEvent) => {
      if (!t0 || phase !== 'world' || blocked() || rig.current.focus < 0) return;
      const dx = e.changedTouches[0].clientX - t0.x;
      if (Math.abs(dx) > 70) step(dx < 0 ? 1 : -1);                  // swipe between paintings
    };
    const key = (e: KeyboardEvent) => {
      if (inspect) return;
      if (e.key === 'Escape') {
        if (menu) setMenu(false); else if (phase === 'world' && rig.current.focus >= 0) release(); else if (phase === 'world') travel(null);
        return;
      }
      if (phase !== 'world' || blocked() || (e.target as HTMLElement).closest?.('a,button') && e.key === 'Enter') return;
      const f = rig.current.focus;
      if (f >= 0) {
        if (e.key === 'ArrowRight') step(1); else if (e.key === 'ArrowLeft') step(-1); else if (e.key === 'i') setInspect(true);
      } else if (world) {
        if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(e.key)) { e.preventDefault(); setProgress(rig.current.target + per() / 2); }
        else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); setProgress(rig.current.target - per() / 2); }
        else if (e.key === 'Enter') focusOn(nearestIndex(world, arts.length, rig.current.target));
      }
    };
    addEventListener('wheel', wheel, { passive: true }); addEventListener('pointermove', pointer);
    addEventListener('touchstart', ts, { passive: true }); addEventListener('touchmove', tm, { passive: true }); addEventListener('touchend', te);
    addEventListener('keydown', key);
    wake();
    return () => {
      clearTimeout(timer);
      removeEventListener('wheel', wheel); removeEventListener('pointermove', pointer);
      removeEventListener('touchstart', ts); removeEventListener('touchmove', tm); removeEventListener('touchend', te);
      removeEventListener('keydown', key);
    };
  }, [phase, world, arts.length, menu, inspect, lite, step, release, travel, focusOn, setProgress]);

  if (phase === 'boot') return <div className="xp" />;

  return (
    <div className={`xp ${focus >= 0 ? 'focused' : ''} ${idle && focus >= 0 && !mobile ? 'idle' : ''}`}>
      {!lite && <div className="xp-canvas"><Stage handle={stage} world={phase === 'world' ? world : null} arts={arts} rig={rig} onSelect={focusOn} mobile={mobile} hub={WORLDS[0]} /></div>}

      {/* ---------- Opening ---------- */}
      {phase === 'opening' && (
        <section className="opening" ref={opening} aria-label="Introduction">
          <div className="opening-art">{openingArt?.src && <ArtImage art={openingArt} eager />}</div>
          <div className="opening-text">
            <h1>Marlon Romero Gomez</h1>
            <p className="opening-sub">The Worlds Within</p>
            <span className="beads" aria-hidden />
            <button type="button" className="enter" onClick={enter} autoFocus>Enter experience</button>
            <Link className="skip-intro" href="/collection/">Skip — go to the collection</Link>
          </div>
        </section>
      )}

      {/* ---------- Persistent, discreet controls ---------- */}
      {phase !== 'opening' && (
        <header className="xp-top chrome">
          <button type="button" className="xp-brand" onClick={() => (phase === 'world' ? travel(null) : undefined)} aria-label="Marlon Romero Gomez — return to the gateways">MRG</button>
          <button type="button" className="xp-menu-btn" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>{menu ? 'Close' : 'Menu'}</button>
        </header>
      )}
      <nav className={`xp-menu ${menu ? 'open' : ''}`} aria-label="Experience" aria-hidden={!menu}>
        {WORLDS.map((w) => (
          <button type="button" key={w.key} tabIndex={menu ? 0 : -1} onClick={() => travel(w.key)} aria-current={w.key === worldKey || undefined}>
            <small>{w.numeral}</small>{w.name}
          </button>
        ))}
        <Link href="/artist/" tabIndex={menu ? 0 : -1}><small>V</small>The Artist</Link>
        <Link href="/collection/" tabIndex={menu ? 0 : -1}><small>VI</small>The Collection</Link>
      </nav>

      {/* ---------- Gateways ---------- */}
      {phase === 'hub' && (
        <section className="hub" aria-label="Choose a world">
          <Mandala className="hub-mandala" />
          <span className="orb o1" aria-hidden /><span className="orb o2" aria-hidden /><span className="orb o3" aria-hidden />
          <p className="label hub-title">The Worlds Within</p>
          <div className="portals">
            {WORLDS.map((w, i) => {
              const a = artsOf(w.category)[0];
              return (
                <button type="button" key={w.key} className="portal" style={{ ['--d' as string]: i, ['--glow' as string]: w.glow, ['--mote' as string]: w.mote }} onClick={() => travel(w.key)}>
                  <span className="portal-arch">
                    {/* Colour drawn from the painting, heavily diffused: an environmental layer, not the artwork itself. */}
                    {a?.src ? <span className="portal-wash" style={{ backgroundImage: `url(${a.src})` }} /> : <span className="portal-wash empty" />}
                  </span>
                  <span className="portal-num">{w.numeral}</span>
                  <span className="portal-name">{w.name}</span>
                  <span className="portal-line">{w.line}</span>
                </button>
              );
            })}
          </div>
          <p className="hub-links"><Link href="/artist/">The Artist</Link><Link href="/collection/">The Collection</Link></p>
        </section>
      )}

      {/* ---------- Inside a world ---------- */}
      {phase === 'world' && world && !lite && (
        <>
          <div className="world-head chrome" key={world.key}>
            <span className="label">{world.numeral} — {world.line}</span>
            <h2>{world.name}</h2>
          </div>
          {focus < 0 && (
            <div className="world-foot chrome">
              <span className="label">{mobile ? 'Drag to travel · tap a painting' : 'Scroll to travel · select a painting'}</span>
              <span className="world-bar"><span ref={bar} style={{ transform: `scaleX(${rig.current.target})` }} /></span>
              <button type="button" className="label linkish" onClick={() => travel(null)}>Leave this world</button>
            </div>
          )}
          {art && (
            <div className="focus-ui chrome">
              <div className="focus-cap" aria-live="polite">
                <span className="label">{String(focus + 1).padStart(2, '0')} / {String(arts.length).padStart(2, '0')}</span>
                <h3>{artName(art)}</h3>
                {artMeta(art) && <p className="label">{artMeta(art)}</p>}
                {art.description && <p className="focus-desc">{art.description}</p>}
              </div>
              <div className="focus-btns">
                <button type="button" onClick={() => step(-1)}>← Previous</button>
                <button type="button" onClick={() => step(1)}>Next →</button>
                <button type="button" onClick={() => setInspect(true)}>Inspect</button>
                <Link href={`/collection/${art.id}/`}>Details</Link>
                <button type="button" onClick={release}>Return</button>
              </div>
            </div>
          )}
          <ul className="sr-only" aria-label={`Paintings in ${world.name}`}>
            {arts.map((a, i) => <li key={a.id}><button type="button" onClick={() => focusOn(i)}>View {artName(a)} ({i + 1} of {arts.length})</button></li>)}
          </ul>
        </>
      )}

      {/* ---------- Plain presentation: reduced motion or no WebGL ---------- */}
      {phase === 'world' && world && lite && (
        <section className="lite">
          <p className="label">{world.numeral} — {world.line}</p>
          <h2>{world.name}</h2>
          {arts.map((a, i) => (
            <figure key={a.id}>
              <button type="button" className="lite-art" onClick={() => { focusOn(i); setInspect(true); }} aria-label={`Inspect ${artName(a)}`}><ArtImage art={a} /></button>
              <figcaption><Link href={`/collection/${a.id}/`}>{artName(a)}</Link><span className="label">{artMeta(a)}</span></figcaption>
            </figure>
          ))}
        </section>
      )}

      {inspect && art && <Inspector art={art} onClose={() => { setInspect(false); if (lite) release(); }} />}
    </div>
  );
}
