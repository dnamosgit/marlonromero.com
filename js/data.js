/* ------------------------------------------------------------------
   SITE CONTENT — the single file to edit.

   Everything marked PENDING could not be copied from marlonromero.com
   and must be filled in from the original site. Nothing here is invented:
   empty values are simply not rendered.
------------------------------------------------------------------- */
window.SITE = {
  /* Contact form: a JSON-accepting form endpoint (Formspree, Web3Forms,
     Netlify/Cloudflare function, …). The form reports an error until set. */
  formEndpoint: '',

  /* PENDING — verified contact details from the original site. */
  contact: {
    email: '',
    phone: '',
    location: '',
    instagram: '', // full URL
    facebook: ''   // full URL
  },

  /* PENDING — image paths, e.g. 'images/hero.jpg'. */
  hero: '',       // strongest painting, used full-screen on the homepage
  introArt: '',   // large painting beside the introduction
  portrait: '',   // photograph of the artist
  aboutArt: '',   // secondary painting in the About section

  /* PENDING — copy from the original site, e.g.
     { year: '2019', title: 'Exhibition name', venue: 'Museum', place: 'City, Country' } */
  exhibitions: [],

  /* PENDING — replace with the real paintings.
     category: 'landscapes' | 'visionary' | 'still-life' | 'murals'
     src:      path to the untouched original file (never cropped or filtered)
     w / h:    pixel dimensions of that file (keeps layout stable while loading)
     title, year, medium, size, description: optional, shown when present */
  artworks: [
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
    { id: 'm4', category: 'murals', src: '', w: 1800, h: 1000 }
  ],

  /* Six works shown on the homepage, in order:
     1 full-width · 2–3 offset pair · 4 isolated · 5–6 asymmetric pair */
  featured: ['l4', 'v1', 'l3', 'v2', 's1', 'm1']
};

window.CATEGORIES = [
  { key: 'landscapes', label: 'Landscapes' },
  { key: 'visionary', label: 'Visionary' },
  { key: 'still-life', label: 'Still Life' },
  { key: 'murals', label: 'Murals' }
];
