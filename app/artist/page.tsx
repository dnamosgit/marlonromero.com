import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import ArtImage from '@/components/ArtImage';
import Reveal from '@/components/Reveal';
import Mandala from '@/components/Mandala';
import { CHAPTERS, SITE, artById } from '@/lib/data';

export const metadata: Metadata = {
  title: 'The Artist',
  description: 'Marlon Romero Gomez — painter from Pucallpa, Peru. A visionary and environmental artist working in oil and acrylic.',
};

export default function Artist() {
  const c = SITE.contact;
  return (
    <>
      <SiteNav current="artist" />
      <main className="story">
        <section className="chapter intro">
          <Mandala className="page-mandala" />
          <Reveal>
            <p className="label">The Artist</p>
            <h1>Marlon Romero <em>Gomez</em></h1>
            <p className="label">Painter · Peru</p>
          </Reveal>
        </section>
        {CHAPTERS.map((ch, i) => {
          const art = artById(ch.art);
          return (
            <section className={`chapter ${i % 2 ? 'flip' : ''}`} key={ch.numeral}>
              {/* Diffused colour from the painting fills the room; the painting itself hangs uncropped beside the text. */}
              {art?.src && <div className="chapter-wash" style={{ backgroundImage: `url(${art.src})` }} aria-hidden />}
              <Reveal className="chapter-art">{art && <Link href={`/collection/${art.id}/`}><ArtImage art={art} /></Link>}</Reveal>
              <Reveal className="chapter-text">
                <p className="chapter-num">{ch.numeral}</p>
                <h2>{ch.title}</h2>
                <span className="beads" aria-hidden />
                <p>{ch.text}</p>
              </Reveal>
            </section>
          );
        })}
        <section className="chapter outro">
          <Reveal>
            <h2>Enter the work</h2>
            <p className="outro-links"><Link className="text-link" href="/">The Experience</Link><Link className="text-link" href="/collection/">The Collection</Link></p>
            {(c.email || c.instagram || c.facebook) && (
              <p className="contact-line">
                {c.email && <a href={`mailto:${c.email}`}>{c.email}</a>}
                {c.instagram && <a href={c.instagram} rel="noopener">Instagram</a>}
                {c.facebook && <a href={c.facebook} rel="noopener">Facebook</a>}
              </p>
            )}
          </Reveal>
        </section>
      </main>
    </>
  );
}
