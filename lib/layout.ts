import type { Artwork, World } from './data';

export type Place = { x: number; y: number; z: number; rotY: number; w: number; h: number };

export const EYE = 1.6;
const LEAD = 4;   // distance from the entrance to the first painting
const TAIL = 6;

/** Where a painting stands in its world. Size always follows the file's own proportions. */
export function place(world: World, art: Artwork, i: number): Place {
  const L = world.layout, aspect = art.w / art.h;
  let h = L.height, w = h * aspect;
  const maxW = L.height * 1.9;
  if (w > maxW) { w = maxW; h = w / aspect; }
  const side = i % 2 ? 1 : -1;
  return { x: side * (L.x + w * 0.18), y: Math.max(1.75, h / 2 + 0.35), z: -i * L.spacing - LEAD, rotY: -side * L.angle, w, h };
}

export const pathLength = (world: World, n: number) => Math.max(1, (n - 1) * world.layout.spacing + LEAD + TAIL);
export const START_Z = 6;

/** Travel progress (0–1) at which painting i is comfortably in view. */
export const progressFor = (world: World, n: number, i: number) =>
  Math.min(1, Math.max(0, (i * world.layout.spacing + 1) / pathLength(world, n)));

export const nearestIndex = (world: World, n: number, p: number) =>
  Math.min(n - 1, Math.max(0, Math.round((p * pathLength(world, n) - 1) / world.layout.spacing)));

/** Camera distance at which a painting fills the view without being cut off. */
export function fitDistance(pl: Place, fovDeg: number, viewAspect: number) {
  const t = Math.tan((fovDeg * Math.PI) / 360);
  const margin = viewAspect < 1 ? 1.12 : 1.3;
  return Math.max(pl.h / 2 / t, pl.w / 2 / (t * viewAspect)) * margin;
}
