import Image from 'next/image';
import type { CSSProperties } from 'react';
import { artName, type Artwork } from '@/lib/data';

type Props = {
  art: Artwork; eager?: boolean; className?: string; style?: CSSProperties;
  /** Serve the original file untouched (used for zoom and inspection). */
  full?: boolean;
  /** How wide the image is shown, so the right size is delivered. */
  sizes?: string;
};

/**
 * A painting in the page, always at its own proportions. On Vercel it is delivered resized to the screen
 * (never cropped or recoloured); `full` bypasses that. Shows a neutral tile until the file is added.
 */
export default function ArtImage({ art, eager, className, style, full, sizes = '(max-width: 720px) 100vw, (max-width: 1024px) 90vw, 60vw' }: Props) {
  if (!art.src)
    return <div className={`ph ${className ?? ''}`} style={{ aspectRatio: `${art.w} / ${art.h}`, ['--ar' as string]: art.w / art.h, ...style }}>Image pending</div>;
  return (
    <Image className={className} style={style} src={art.src} width={art.w} height={art.h} alt={artName(art)} sizes={sizes}
      quality={90} priority={eager} unoptimized={full} draggable={false} />
  );
}
