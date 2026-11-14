import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteNav from '@/components/SiteNav';
import InspectButton from '@/components/InspectButton';
import { ARTWORKS, artById, artName, artsOf, catLabel, worldOf } from '@/lib/data';

type P = { params: Promise<{ id: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => ARTWORKS.map((a) => ({ id: a.id }));

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const art = artById((await params).id);
  if (!art) return {};
  const description = art.description || [catLabel(art.category), art.medium, art.size, art.year].filter(Boolean).join(' · ');
  return { title: artName(art), description, alternates: { canonical: `/collection/${art.id}/` }, openGraph: { title: artName(art), description, images: art.src ? [art.src] : undefined } };
}

export default async function Work({ params }: P) {
  const art = artById((await params).id);
  if (!art) notFound();
  const list = artsOf(art.category), i = list.indexOf(art), world = worldOf(art);
  const prev = list[(i - 1 + list.length) % list.length], next = list[(i + 1) % list.length];
  const facts: [string, string | undefined][] = [['Category', catLabel(art.category)], ['Medium', art.medium], ['Dimensions', art.size], ['Year', art.year]];
  return (
    <>
      <SiteNav current="collection" />
      <main className="page work">
        <div className="work-stage"><InspectButton art={art} /></div>
        <aside className="work-info">
          <p className="label"><Link href={`/collection/?c=${art.category}`}>{catLabel(art.category)}</Link> — {String(i + 1).padStart(2, '0')} / {String(list.length).padStart(2, '0')}</p>
          <h1>{artName(art)}</h1>
          {art.description && <p className="work-desc">{art.description}</p>}
          <dl>{facts.filter(([, v]) => v).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          <p><Link className="text-link" href={`/?w=${world.key}&a=${art.id}`}>See it in {world.name}</Link></p>
          <nav className="work-nav" aria-label="More works">
            <Link href={`/collection/${prev.id}/`}>← Previous</Link>
            <Link href="/collection/">All works</Link>
            <Link href={`/collection/${next.id}/`}>Next →</Link>
          </nav>
        </aside>
      </main>
    </>
  );
}
