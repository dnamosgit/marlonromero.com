import type { MetadataRoute } from 'next';
import { ARTWORKS, OBJECTS, SITE } from '@/lib/data';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (p: string, priority: number) => ({ url: `${SITE.url}${p}`, changeFrequency: 'monthly' as const, priority });
  // Only paintings that actually have an image are listed.
  return [page('/', 1), page('/collection/', 0.9), page('/artist/', 0.8), page('/jewelry-bags/', 0.8),
    ...ARTWORKS.filter((a) => a.src).map((a) => page(`/collection/${a.id}/`, 0.7)), ...OBJECTS.filter((a) => a.src).map((a) => page(`/jewelry-bags/${a.id}/`, 0.7))];
}
