import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import WorkDetail from '@/components/WorkDetail';
import { ARTWORKS, artById, artName, catLabel } from '@/lib/data';

type P = { params: Promise<{ id: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => ARTWORKS.map((a) => ({ id: a.id }));

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const art = artById((await params).id);
  if (!art) return {};
  const description = art.description || [catLabel(art.category), art.medium, art.size, art.year].filter(Boolean).join(' · ');
  return { title: artName(art), description, alternates: { canonical: `/collection/${art.id}/` }, openGraph: { title: artName(art), description, images: art.src ? [art.src] : undefined } };
}

export default async function Page({ params }: P) {
  const art = artById((await params).id);
  if (!art) notFound();
  return <WorkDetail art={art} list={ARTWORKS.filter((a) => a.category === art.category)} base="/collection/" section="collection" />;
}
