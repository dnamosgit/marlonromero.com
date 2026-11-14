'use client';
import { useState } from 'react';
import type { Artwork } from '@/lib/data';
import { artName } from '@/lib/data';
import ArtImage from './ArtImage';
import Inspector from './Inspector';

/** The artwork itself is the button: select it to zoom and inspect. */
export default function InspectButton({ art }: { art: Artwork }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="work-art" onClick={() => setOpen(true)} aria-label={`Zoom and inspect ${artName(art)}`}><ArtImage art={art} eager /></button>
      <button type="button" className="text-link" onClick={() => setOpen(true)}>Zoom &amp; inspect</button>
      {open && <Inspector art={art} onClose={() => setOpen(false)} />}
    </>
  );
}
