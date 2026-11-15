'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ARTWORKS, CATEGORIES, artName, catLabel, type CategoryKey } from '@/lib/data';
import ArtImage from './ArtImage';

type Filter = CategoryKey | 'all';
const valid = (v: string | null): Filter => (CATEGORIES.some((c) => c.key === v) ? (v as CategoryKey) : 'all');

export default function CollectionGrid() {
  const [filter, setFilter] = useState<Filter>('all');
  useEffect(() => {
    const read = () => setFilter(valid(new URLSearchParams(location.search).get('c')));
    read(); addEventListener('popstate', read);
    return () => removeEventListener('popstate', read);
  }, []);
  const pick = (f: Filter) => { setFilter(f); history.pushState(null, '', f === 'all' ? '/collection/' : `/collection/?c=${f}`); };
  const list = ARTWORKS.filter((a) => filter === 'all' || a.category === filter);
  const count = (f: Filter) => String(ARTWORKS.filter((a) => f === 'all' || a.category === f).length).padStart(2, '0');

  return (
    <>
      <div className="tabs" role="group" aria-label="Filter by category">
        {([{ key: 'all', label: 'All works' }, ...CATEGORIES] as { key: Filter; label: string }[]).map((c) => (
          <button type="button" key={c.key} aria-pressed={filter === c.key} onClick={() => pick(c.key)}>{c.label}<sup>{count(c.key)}</sup></button>
        ))}
      </div>
      <div className="masonry" key={filter}>
        {list.map((a) => (
          <figure key={a.id}>
            <Link href={`/collection/${a.id}/`} className="tile" aria-label={`${artName(a)} — ${catLabel(a.category)}`}><ArtImage art={a} sizes="(max-width: 520px) 100vw, (max-width: 1024px) 50vw, 33vw" /></Link>
            <figcaption><b>{artName(a)}</b><span>{[catLabel(a.category), a.year].filter(Boolean).join(' · ')}</span></figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
