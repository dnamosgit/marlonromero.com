import type { Metadata } from 'next';
import SiteNav from '@/components/SiteNav';
import CollectionGrid from '@/components/CollectionGrid';
import { OBJECTS, OBJECT_CATEGORIES } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Jewelry & Bags',
  description: 'Jewelry and bags by Marlon Romero.',
};

export default function Objects() {
  return (
    <>
      <SiteNav current="objects" />
      <main className="page">
        <p className="label">By Marlon Romero</p>
        <h1 className="page-title">Jewelry <em>&amp;</em> Bags</h1>
        <CollectionGrid items={OBJECTS} categories={OBJECT_CATEGORIES} base="/jewelry-bags/" allLabel="All pieces" />
      </main>
    </>
  );
}
