/**
 * Ornament in the spirit of the geometric star-flowers and beadwork in the paintings.
 * It is original interface geometry — an environmental layer, never a copy of any artwork.
 */
export default function Mandala({ className = '' }: { className?: string }) {
  const ring = (n: number, r: number, size: number, cls: string) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return <circle key={`${cls}${i}`} className={cls} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={size} />;
    });
  return (
    <svg className={`mandala ${className}`} viewBox="-100 -100 200 200" aria-hidden focusable="false">
      <g fill="none" strokeWidth=".7">
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i} transform={`rotate(${i * 45})`}>
            <ellipse className="m-a" cx="0" cy="-46" rx="11" ry="30" />
            <path className="m-b" d="M0 -78 L7 -62 L0 -54 L-7 -62 Z" />
            <line className="m-c" x1="0" y1="-16" x2="0" y2="-30" />
          </g>
        ))}
        <rect className="m-c" x="-27" y="-27" width="54" height="54" />
        <rect className="m-c" x="-27" y="-27" width="54" height="54" transform="rotate(45)" />
        <circle className="m-b" r="13" />
      </g>
      {ring(8, 13, 1.6, 'd-a')}
      {ring(24, 88, 1.5, 'd-b')}
      {ring(48, 96, 0.8, 'd-c')}
      <circle className="d-a" r="3" />
    </svg>
  );
}
