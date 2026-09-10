type StampMarkProps = {
  label?: string;
  sublabel?: string;
  className?: string;
};

export default function StampMark({
  label = "ONAYLANDI",
  sublabel = "TENTAMARK · AI",
  className = "",
}: StampMarkProps) {
  const filterId = "stamp-texture";

  return (
    <svg
      viewBox="0 0 200 200"
      className={`text-mint -rotate-[8deg] ${className}`}
      aria-hidden="true"
    >
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" />
        </filter>
        <path id="stamp-arc-top" d="M 22,100 A 78,78 0 1,1 178,100" fill="none" />
        <path id="stamp-arc-bottom" d="M 178,108 A 78,78 0 1,1 22,108" fill="none" />
      </defs>
      <g filter={`url(#${filterId})`} fill="none" stroke="currentColor">
        <circle cx="100" cy="100" r="90" strokeWidth="3" />
        <circle cx="100" cy="100" r="78" strokeWidth="1.5" />
        <text fontSize="15" letterSpacing="3.5" fill="currentColor" fontFamily="var(--font-mono)">
          <textPath href="#stamp-arc-top" startOffset="50%" textAnchor="middle">
            {label}
          </textPath>
        </text>
        <text fontSize="11" letterSpacing="3" fill="currentColor" fontFamily="var(--font-mono)">
          <textPath href="#stamp-arc-bottom" startOffset="50%" textAnchor="middle">
            {sublabel}
          </textPath>
        </text>
        <g transform="translate(100,103)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M -22,2 L -6,18 L 24,-20" />
        </g>
      </g>
    </svg>
  );
}
