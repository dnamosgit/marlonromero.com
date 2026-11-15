import Link from 'next/link';

/** Standard navigation for the archive and artist pages. */
export default function SiteNav({ current }: { current?: 'artist' | 'collection' | 'objects' }) {
  return (
    <header className="site-nav">
      <Link className="brand" href="/collection/" aria-label="Marlon Romero">Marlon Romero</Link>
      <nav aria-label="Primary">
        <Link href="/">The Experience</Link>
        <Link href="/artist/" aria-current={current === 'artist' ? 'page' : undefined}>The Artist</Link>
        <Link href="/collection/" aria-current={current === 'collection' ? 'page' : undefined}>The Collection</Link>
        <Link href="/jewelry-bags/" aria-current={current === 'objects' ? 'page' : undefined}>Jewelry &amp; Bags</Link>
      </nav>
    </header>
  );
}
