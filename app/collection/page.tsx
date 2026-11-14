import type { Metadata } from 'next';
import SiteNav from '@/components/SiteNav';
import CollectionGrid from '@/components/CollectionGrid';

export const metadata: Metadata = {
  title: 'The Collection',
  description: 'The complete archive of paintings by Marlon Romero Gomez: landscapes, visionary works, still life and murals.',
};

export default function Collection() {
  return (
    <>
      <SiteNav current="collection" />
      <main className="page">
        <p className="label">Complete archive</p>
        <h1 className="page-title">The Collection</h1>
        <CollectionGrid />
      </main>
    </>
  );
}
