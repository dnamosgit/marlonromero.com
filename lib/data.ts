/* ------------------------------------------------------------------
   SITE CONTENT — the single file to edit.

   Everything marked PENDING could not be copied from marlonromero.com
   and must be filled in from the original site. Nothing is invented:
   empty values are simply not rendered.
------------------------------------------------------------------- */

export type CategoryKey = 'landscapes' | 'visionary' | 'still-life' | 'murals';

export type Artwork = {
  id: string;            // used in the shareable URL: /collection/<id>/
  category: CategoryKey;
  src: string;           // e.g. '/art/selva.jpg' — the untouched original file
  w: number;             // pixel width of that file
  h: number;             // pixel height of that file
  title?: string;
  year?: string;
  medium?: string;
  size?: string;         // physical dimensions
  description?: string;
};

export const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: 'landscapes', label: 'Landscapes' },
  { key: 'visionary', label: 'Visionary' },
  { key: 'still-life', label: 'Still Life' },
  { key: 'murals', label: 'Murals' },
];

/* PENDING — replace with the real paintings (files go in /public/art). */
export const ARTWORKS: Artwork[] = [
  { id: 'l1', category: 'landscapes', src: '', w: 1600, h: 1000 },
  { id: 'l2', category: 'landscapes', src: '', w: 1200, h: 1500 },
  { id: 'l3', category: 'landscapes', src: '', w: 1600, h: 1200 },
  { id: 'l4', category: 'landscapes', src: '', w: 1800, h: 900 },
  { id: 'l5', category: 'landscapes', src: '', w: 1200, h: 1200 },
  { id: 'v1', category: 'visionary', src: '', w: 1200, h: 1600 },
  { id: 'v2', category: 'visionary', src: '', w: 1600, h: 1100 },
  { id: 'v3', category: 'visionary', src: '', w: 1300, h: 1300 },
  { id: 'v4', category: 'visionary', src: '', w: 1100, h: 1500 },
  { id: 'v5', category: 'visionary', src: '', w: 1700, h: 1000 },
  { id: 's1', category: 'still-life', src: '', w: 1200, h: 1400 },
  { id: 's2', category: 'still-life', src: '', w: 1500, h: 1200 },
  { id: 's3', category: 'still-life', src: '', w: 1200, h: 1200 },
  { id: 's4', category: 'still-life', src: '', w: 1100, h: 1500 },
  { id: 'm1', category: 'murals', src: '', w: 2000, h: 900 },
  { id: 'm2', category: 'murals', src: '', w: 1600, h: 1100 },
  { id: 'm3', category: 'murals', src: '', w: 1200, h: 1500 },
  { id: 'm4', category: 'murals', src: '', w: 1800, h: 1000 },
];

export const SITE = {
  url: 'https://www.marlonromero.com',
  openingArt: 'l4',                // painting revealed in the opening
  /* PENDING — verified contact details from the original site. */
  contact: { email: '', instagram: '', facebook: '' },
};

/* ------------------------------------------------------------------
   The four worlds. Each is the same engine with its own space, light
   and atmosphere; the paintings come from the matching category.
------------------------------------------------------------------- */
export type World = {
  key: string;
  numeral: string;
  name: string;
  category: CategoryKey;
  line: string;
  bg: string;    // environment colour
  glow: string;  // light behind and beneath the paintings
  mote: string;  // particle colour
  layout: { spacing: number; x: number; angle: number; height: number; bob: number; sway: number };
  motes: { rise: number; drift: number; size: number; twinkle: number };
};

export const WORLDS: World[] = [
  {
    key: 'origin', numeral: 'I', name: 'The Origin', category: 'landscapes',
    line: 'Landscapes of the Amazon rainforest',
    bg: '#050806', glow: '#3f6140', mote: '#e6cc7e',
    layout: { spacing: 9, x: 3.4, angle: 0.55, height: 3.4, bob: 0, sway: 0.55 },
    motes: { rise: 0.02, drift: 0.55, size: 1, twinkle: 1 },
  },
  {
    key: 'vision', numeral: 'II', name: 'The Vision', category: 'visionary',
    line: 'Visionary paintings',
    bg: '#07050c', glow: '#553c78', mote: '#bca6ea',
    layout: { spacing: 10, x: 2.7, angle: 0.36, height: 3.7, bob: 0.22, sway: 1.1 },
    motes: { rise: 0.28, drift: 0.85, size: 1.25, twinkle: 0.45 },
  },
  {
    key: 'observation', numeral: 'III', name: 'The Observation', category: 'still-life',
    line: 'Still life',
    bg: '#0a0806', glow: '#7a5429', mote: '#f1dfb6',
    layout: { spacing: 6, x: 2.2, angle: 0.7, height: 2.1, bob: 0, sway: 0.2 },
    motes: { rise: -0.03, drift: 0.16, size: 0.6, twinkle: 0.1 },
  },
  {
    key: 'expansion', numeral: 'IV', name: 'The Expansion', category: 'murals',
    line: 'Murals',
    bg: '#04060a', glow: '#2f4a63', mote: '#d2dbe3',
    layout: { spacing: 18, x: 7.2, angle: 0.5, height: 7.5, bob: 0, sway: 0.8 },
    motes: { rise: 0.012, drift: 0.3, size: 1.8, twinkle: 0.2 },
  },
];

export const worldByKey = (k: string | null) => WORLDS.find((w) => w.key === k) ?? null;
export const worldOf = (a: Artwork) => WORLDS.find((w) => w.category === a.category)!;
export const artsOf = (c: CategoryKey) => ARTWORKS.filter((a) => a.category === c);
export const artById = (id: string) => ARTWORKS.find((a) => a.id === id) ?? null;
export const catLabel = (c: CategoryKey) => CATEGORIES.find((x) => x.key === c)!.label;
export const artName = (a: Artwork) => a.title || 'Untitled entry';
export const artMeta = (a: Artwork) => [a.medium, a.size, a.year].filter(Boolean).join(' · ');

/* The artist's story — written only from verified facts. */
export const CHAPTERS: { numeral: string; title: string; text: string; art: string }[] = [
  { numeral: 'I', title: 'Pucallpa', art: 'l1',
    text: 'Marlon Romero Gomez is a painter from Peru. He was born in Pucallpa, a city near the Amazon rainforest.' },
  { numeral: 'II', title: 'The rainforest', art: 'l3',
    text: 'He is a visionary and environmental artist, and the landscapes of the Amazon rainforest are a central subject of his paintings.' },
  { numeral: 'III', title: 'Formation', art: 's1',
    text: 'Both self-taught and trained, he works primarily in oil and acrylic, developing a practice that moves between landscape, still life, murals and visionary painting.' },
  { numeral: 'IV', title: 'Belief', art: 'v1',
    text: 'His visionary work explores indigenous and mestizo religious belief systems, spirituality and Peruvian culture — the meeting of nature, imagination and the human experience.' },
  { numeral: 'V', title: 'Beyond the forest', art: 'm1',
    text: 'His work has been presented in museums, galleries, conservation programs and international exhibitions, and his paintings have been featured and sold internationally.' },
];
