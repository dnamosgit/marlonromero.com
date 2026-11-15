import Link from 'next/link';
import SiteNav from './SiteNav';
import InspectButton from './InspectButton';
import { artName, catLabel, worldOf, SITE, type Artwork } from '@/lib/data';

/** Shareable page for one painting or object: image, zoom, and whatever details are on record. */
export default function WorkDetail({ art, list, base, section }: { art: Artwork; list: Artwork[]; base: string; section: 'collection' | 'objects' }) {
  const i = list.indexOf(art), world = worldOf(art);
  const prev = list[(i - 1 + list.length) % list.length], next = list[(i + 1) % list.length];
  const facts: [string, string | undefined][] = [['Category', catLabel(art.category)], [section === 'objects' ? 'Materials' : 'Medium', art.medium], ['Dimensions', art.size], ['Year', art.year]];
  return (
    <>
      <SiteNav current={section} />
      <main className="page work">
        <div className="work-stage"><InspectButton art={art} /></div>
        <aside className="work-info">
          <p className="label"><Link href={`${base}?c=${art.category}`}>{catLabel(art.category)}</Link> — {String(i + 1).padStart(2, '0')} / {String(list.length).padStart(2, '0')}</p>
          <h1>{artName(art)}</h1>
          {art.description && <p className="work-desc">{art.description}</p>}
          <dl>{facts.filter(([, v]) => v).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          {world && <p><Link className="text-link" href={`/?w=${world.key}&a=${art.id}`}>See it in {world.name}</Link></p>}
          {section === 'objects' && SITE.contact.email && <p><a className="text-link" href={`mailto:${SITE.contact.email}?subject=${encodeURIComponent(artName(art))}`}>Inquire about this piece</a></p>}
          <nav className="work-nav" aria-label="More">
            <Link href={`${base}${prev.id}/`}>← Previous</Link>
            <Link href={base}>{section === 'objects' ? 'All pieces' : 'All works'}</Link>
            <Link href={`${base}${next.id}/`}>Next →</Link>
          </nav>
        </aside>
      </main>
    </>
  );
}
