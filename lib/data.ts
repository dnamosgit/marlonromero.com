/* ------------------------------------------------------------------
   SITE CONTENT — the single file to edit.

   Everything marked PENDING could not be copied from marlonromero.com
   and must be filled in from the original site. Nothing is invented:
   empty values are simply not rendered.
------------------------------------------------------------------- */

export type CategoryKey = 'landscapes' | 'visionary' | 'still-life' | 'murals' | 'jewelry' | 'bags';

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

/* Entries with an empty src are PENDING — replace with the real paintings (files go in /public/art). */
export const ARTWORKS: Artwork[] = [
  { id: 'l1', category: 'landscapes', src: '/art/el-achuni.jpg', w: 1426, h: 1068, title: 'El Achuni', medium: 'Acrylic on canvas', size: '28 × 18 in', description: 'Sold.' },
  { id: 'l2', category: 'landscapes', src: '/art/landscape-lake.jpg', w: 1990, h: 1500 },   // title and details PENDING
  { id: 'l3', category: 'landscapes', src: '/art/landscape-sunset.jpg', w: 1396, h: 1060 }, // title and details PENDING (small source photo, enlarged)
  { id: 'l4', category: 'landscapes', src: '/art/macaw.jpg', w: 1068, h: 1424 },            // title and details PENDING (small source photo, enlarged)
  { id: 'v1', category: 'visionary', src: '/art/visionary-01.jpg', w: 1448, h: 1084 },      // title and details PENDING
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

/* Jewelry and bags. PENDING — replace with the real pieces (files go in /public/objects).
   Same fields as a painting: src, pixel w/h, and optionally title, year, medium (materials), size, description. */
export const OBJECT_CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: 'jewelry', label: 'Jewelry' },
  { key: 'bags', label: 'Bags' },
];
export const OBJECTS: Artwork[] = [
  { id: 'j1', category: 'jewelry', src: '', w: 1200, h: 1200 },
  { id: 'j2', category: 'jewelry', src: '', w: 1200, h: 1500 },
  { id: 'j3', category: 'jewelry', src: '', w: 1200, h: 1200 },
  { id: 'b1', category: 'bags', src: '', w: 1200, h: 1400 },
  { id: 'b2', category: 'bags', src: '', w: 1400, h: 1200 },
  { id: 'b3', category: 'bags', src: '', w: 1200, h: 1200 },
];

export const SITE = {
  name: 'Marlon Romero',
  url: 'https://www.marlonromero.com',
  openingArt: 'v1',                // painting revealed in the opening
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
  mote2: string; // second particle colour (a minority of particles)
  layout: { spacing: number; x: number; angle: number; height: number; bob: number; sway: number };
  motes: { rise: number; drift: number; size: number; twinkle: number };
};

/* Colours are sampled from the artist's visionary painting (public/art/visionary-01.jpg):
   night indigo #100e1c · leaf #5aaf3e · lime #a8c73d · sunset amber #a97d2d · ember #b15426 ·
   clay #86553b · river blue #1876af · violet orb #4a3775 / #5b508d. */
export const WORLDS: World[] = [
  {
    key: 'origin', numeral: 'I', name: 'The Origin', category: 'landscapes',
    line: 'Landscapes of the Amazon rainforest',
    bg: '#060b08', glow: '#2f7a38', mote: '#a8c73d', mote2: '#d9a23a',
    layout: { spacing: 9, x: 3.4, angle: 0.55, height: 3.4, bob: 0, sway: 0.55 },
    motes: { rise: 0.02, drift: 0.55, size: 1, twinkle: 1 },
  },
  {
    key: 'vision', numeral: 'II', name: 'The Vision', category: 'visionary',
    line: 'Visionary paintings',
    bg: '#0a0814', glow: '#4a3775', mote: '#8d7fd0', mote2: '#7fd04e',
    layout: { spacing: 10, x: 2.7, angle: 0.36, height: 3.7, bob: 0.22, sway: 1.1 },
    motes: { rise: 0.28, drift: 0.85, size: 1.5, twinkle: 0.45 },
  },
  {
    key: 'observation', numeral: 'III', name: 'The Observation', category: 'still-life',
    line: 'Still life',
    bg: '#0c0807', glow: '#86553b', mote: '#e0a94a', mote2: '#d0612c',
    layout: { spacing: 6, x: 2.2, angle: 0.7, height: 2.1, bob: 0, sway: 0.2 },
    motes: { rise: -0.03, drift: 0.16, size: 0.6, twinkle: 0.1 },
  },
  {
    key: 'expansion', numeral: 'IV', name: 'The Expansion', category: 'murals',
    line: 'Murals',
    bg: '#050912', glow: '#1876af', mote: '#9cc7e6', mote2: '#8d7fd0',
    layout: { spacing: 18, x: 7.2, angle: 0.5, height: 7.5, bob: 0, sway: 0.8 },
    motes: { rise: 0.012, drift: 0.3, size: 1.8, twinkle: 0.2 },
  },
];

export const worldByKey = (k: string | null) => WORLDS.find((w) => w.key === k) ?? null;
export const worldOf = (a: Artwork) => WORLDS.find((w) => w.category === a.category);
export const artsOf = (c: CategoryKey) => ARTWORKS.filter((a) => a.category === c);
export const artById = (id: string) => ARTWORKS.find((a) => a.id === id) ?? null;
export const objectById = (id: string) => OBJECTS.find((a) => a.id === id) ?? null;
export const catLabel = (c: CategoryKey) => [...CATEGORIES, ...OBJECT_CATEGORIES].find((x) => x.key === c)!.label;
export const artName = (a: Artwork) => a.title || 'Untitled entry';
export const artMeta = (a: Artwork) => [a.medium, a.size, a.year].filter(Boolean).join(' · ');

/* The artist's story — written only from verified facts. */
export const CHAPTERS: { numeral: string; title: string; text: string[]; art: string }[] = [
  { numeral: 'I', title: 'About the artist', art: 'v1', text: [
    'Marlon was born in Pucallpa, Peru, the base of the Amazon rainforest jungle, and has lived in San Francisco for the last 12 years. His paintings give insights into the Amazon life of Peru, Costa Rica and San Francisco.',
    'Marlon has developed a method of painting nature that is healing and transcendent. His “visions” of the world reveal part reality and part mythology.' ] },
  { numeral: 'II', title: 'The paintings', art: 'l2', text: [
    'He enjoys painting with vibrant colors in acrylic, oil and watercolor and uses great detail to translate the beauty of the Amazon and the Costa Rican jungle into images. His colors combine his love for traditional plant medicine and nature.',
    'The paintings reflect his own life experiences, spiritual world and insights into the indigenous and mestizo beliefs. Combining his love of painting and nature, his vast portfolio includes paintings of realistic landscapes of the rainforest, still life, landscapes of the Bay Area and detailed stories about healing from traditional plant medicine.' ] },
  { numeral: 'III', title: 'Previous expositions', art: 'l1', text: [
    'Marlon has presented his paintings around the world in museums, galleries and conservation programs. His paintings have been featured and sold in Peru, Costa Rica, Brazil, Norway, Finland and the U.S.',
    'His latest exhibits in the U.S. include the San Francisco Peruvian Consulate (CA) (2007, 2009 and 2015), San Francisco North Beach Art in the Alley (CA) (juried, 2006), San Francisco Mission Cultural Center (CA), Evanston Ethnic Art Festival (IL) (juried) and the Women’s Building at the University of San Francisco (CA) (2016).',
    'He has completed large murals at the Tenderloin Family Housing Center and at hotels in the Bay Area, Costa Rica and Peru. Marlon’s paintings have been purchased by private collectors, including high-level Peruvian government officials.' ] },
  { numeral: 'IV', title: 'Education', art: 'l4', text: [
    'Marlon is self-taught and began painting when he was 6 years old, when he was recruited to come paint with the famous Don Pablo Amaringo from the USKO Ayar School of Painting in Pucallpa, Peru.',
    'He was also a resident artist in the Osa Peninsula, Costa Rica, and taught art to children in Pucallpa, Peru, and in Costa Rica. Since coming to the Bay Area, he has studied with several well-known master teachers and artists throughout the Bay Area.' ] },
];
