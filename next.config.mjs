import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
// On Vercel the site runs as a regular Next.js app (image optimisation, edge caching).
// Anywhere else `npm run build` still writes a plain static site to out/.
const onVercel = !!process.env.VERCEL;

/** @type {import('next').NextConfig} */
export default {
  ...(onVercel ? {} : { output: 'export' }),
  trailingSlash: true,
  images: onVercel
    ? { formats: ['image/avif', 'image/webp'], deviceSizes: [480, 768, 1080, 1440, 1920, 2560], minimumCacheTTL: 2678400 }
    : { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: root,
  webpack(config) { config.resolve.alias['@'] = root; return config; },
};
