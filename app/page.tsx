import Link from 'next/link';
import Experience from '@/components/Experience';

export default function Home() {
  return (
    <>
      <Experience />
      <noscript>
        <div className="noscript">
          <h1>Marlon Romero Gomez — The Worlds Within</h1>
          <p>The immersive experience needs JavaScript. The complete archive does not.</p>
          <Link href="/collection/">Enter the collection</Link> · <Link href="/artist/">The artist</Link>
        </div>
      </noscript>
    </>
  );
}
