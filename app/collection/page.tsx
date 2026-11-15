import type { Metadata } from 'next';
import Mandala from '@/components/Mandala';
import SiteNav from '@/components/SiteNav';
import CollectionGrid from '@/components/CollectionGrid';
import { ARTWORKS, CATEGORIES } from '@/lib/data';

export const metadata: Metadata = {
  title: 'The Collection',
  description: 'The complete archive of paintings by Marlon Romero: landscapes, visionary works, still life and murals.',
};

export default function Collection() {
  return (
    <>
      <SiteNav current="collection" />
      <main className="page has-mandala">
        <Mandala className="page-mandala" />
        <p className="label">Complete archive</p>
        <h1 className="page-title">The Collection</h1>
        <CollectionGrid items={ARTWORKS} categories={CATEGORIES} base="/collection/" />
      </main>
    </>
  );
}
