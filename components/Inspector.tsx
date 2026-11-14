'use client';

import { useEffect, useRef } from 'react';
import { artName, type Artwork } from '@/lib/data';
import ArtImage from './ArtImage';

/** Full-screen detail inspection: wheel / pinch to zoom, drag to pan, double-click to toggle. */
export default function Inspector({ art, onClose }: { art: Artwork; onClose: () => void }) {
  const stage = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const s = useRef({ k: 1, x: 0, y: 0 });

  const apply = () => {
    const v = s.current;
    if (v.k <= 1.001) { v.k = 1; v.x = 0; v.y = 0; }
    if (inner.current) inner.current.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.k})`;
    if (stage.current) stage.current.style.cursor = v.k > 1 ? 'grab' : 'zoom-in';
  };
  const zoomAt = (cx: number, cy: number, next: number) => {
    const el = stage.current!, r = el.getBoundingClientRect(), v = s.current;
    const k = Math.min(8, Math.max(1, next)), px = cx - r.left - r.width / 2, py = cy - r.top - r.height / 2;
    v.x = px - ((px - v.x) * k) / v.k; v.y = py - ((py - v.y) * k) / v.k; v.k = k; apply();
  };
  const zoomBy = (f: number) => { const r = stage.current!.getBoundingClientRect(); zoomAt(r.left + r.width / 2, r.top + r.height / 2, s.current.k * f); };

  useEffect(() => {
    const el = stage.current!, pts = new Map<number, { x: number; y: number }>();
    let pinch = 0;
    const wheel = (e: WheelEvent) => { e.preventDefault(); zoomAt(e.clientX, e.clientY, s.current.k * Math.exp(-e.deltaY * 0.0016)); };
    const down = (e: PointerEvent) => { el.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); pinch = 0; };
    const move = (e: PointerEvent) => {
      const p = pts.get(e.pointerId); if (!p) return;
      const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
      if (pts.size === 1 && s.current.k > 1) { s.current.x += dx; s.current.y += dy; apply(); }
      else if (pts.size === 2) {
        const [a, b] = [...pts.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, (s.current.k * d) / pinch);
        pinch = d;
      }
    };
    const up = (e: PointerEvent) => { pts.delete(e.pointerId); pinch = 0; };
    const dbl = (e: MouseEvent) => zoomAt(e.clientX, e.clientY, s.current.k > 1 ? 1 : 3);
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
      else if (e.key === '+' || e.key === '=') zoomBy(1.5);
      else if (e.key === '-') zoomBy(1 / 1.5);
    };
    el.addEventListener('wheel', wheel, { passive: false });
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('dblclick', dbl);
    window.addEventListener('keydown', key, true);
    closeBtn.current?.focus();
    return () => {
      el.removeEventListener('wheel', wheel); el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); el.removeEventListener('dblclick', dbl);
      window.removeEventListener('keydown', key, true);
    };
  }, [onClose]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="inspector" role="dialog" aria-modal="true" aria-label={`Inspecting ${artName(art)}`}>
      <div className="inspector-stage" ref={stage}>
        <div className="inspector-inner" ref={inner}><ArtImage art={art} eager /></div>
      </div>
      <div className="inspector-bar">
        <span className="label">Scroll or pinch to zoom · drag to move</span>
        <span className="inspector-btns">
          <button type="button" onClick={() => zoomBy(1 / 1.5)} aria-label="Zoom out">−</button>
          <button type="button" onClick={() => zoomBy(1.5)} aria-label="Zoom in">+</button>
          <button type="button" onClick={() => { s.current.k = 1; apply(); }}>Reset</button>
          <button type="button" ref={closeBtn} onClick={onClose}>Close</button>
        </span>
      </div>
    </div>
  );
}
