import type { CSSProperties } from 'react';
import { artName, type Artwork } from '@/lib/data';

/** A painting in the page, always at its own proportions. Shows a neutral tile until the file is added. */
export default function ArtImage({ art, eager, className, style }: { art: Artwork; eager?: boolean; className?: string; style?: CSSProperties }) {
  if (!art.src)
    return <div className={`ph ${className ?? ''}`} style={{ aspectRatio: `${art.w} / ${art.h}`, ...style }}>Image pending</div>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className} style={style} src={art.src} width={art.w} height={art.h} alt={artName(art)}
      loading={eager ? 'eager' : 'lazy'} decoding="async" draggable={false} />
  );
}
