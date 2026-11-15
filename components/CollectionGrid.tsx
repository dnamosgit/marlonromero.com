'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { artName, catLabel, type Artwork, type CategoryKey } from '@/lib/data';
import ArtImage from './ArtImage';

type Filter = CategoryKey | 'all';
type Props = { items: Artwork[]; categories: { key: CategoryKey; label: string }[]; base: string; allLabel?: string };

/** Filterable grid used by the painting archive and by Jewelry & Bags. The filter lives in the URL (?c=…). */
export default function CollectionGrid({ items, categories, base, allLabel = 'All works' }: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  useEffect(() => {
    const read = () => { const v = new URLSearchParams(location.search).get('c'); setFilter(categories.some((c) => c.key === v) ? (v as CategoryKey) : 'all'); };
    read(); addEventListener('popstate', read);
    return () => removeEventListener('popstate', read);
  }, [categories]);
  const pick = (f: Filter) => { setFilter(f); history.pushState(null, '', f === 'all' ? base : `${base}?c=${f}`); };
  const list = items.filter((a) => filter === 'all' || a.category === filter);
  const count = (f: Filter) => String(items.filter((a) => f === 'all' || a.category === f).length).padStart(2, '0');

  return (
    <>
      <div className="tabs" role="group" aria-label="Filter by category">
        {([{ key: 'all', label: allLabel }, ...categories] as { key: Filter; label: string }[]).map((c) => (
          <button type="button" key={c.key} aria-pressed={filter === c.key} onClick={() => pick(c.key)}>{c.label}<sup>{count(c.key)}</sup></button>
        ))}
      </div>
      <div className="masonry" key={filter}>
        {list.map((a) => (
          <figure key={a.id}>
            <Link href={`${base}${a.id}/`} className="tile" aria-label={`${artName(a)} — ${catLabel(a.category)}`}><ArtImage art={a} sizes="(max-width: 520px) 100vw, (max-width: 1024px) 50vw, 33vw" /></Link>
            <figcaption><b>{artName(a)}</b><span>{[catLabel(a.category), a.year].filter(Boolean).join(' · ')}</span></figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
