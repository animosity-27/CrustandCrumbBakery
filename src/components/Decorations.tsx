type IconProps = { className?: string };

/* Wheat sheaf icon */
export function Wheat({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 22V4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12 8C10 8 8.5 6.5 8.5 4.5C10.5 4.8 12 6 12 8ZM12 8C14 8 15.5 6.5 15.5 4.5C13.5 4.8 12 6 12 8Z" fill="currentColor" />
      <path d="M12 13C10 13 8.5 11.5 8.5 9.5C10.5 9.8 12 11 12 13ZM12 13C14 13 15.5 11.5 15.5 9.5C13.5 9.8 12 11 12 13Z" fill="currentColor" />
      <path d="M12 18C10 18 8.5 16.5 8.5 14.5C10.5 14.8 12 16 12 18ZM12 18C14 18 15.5 16.5 15.5 14.5C13.5 14.8 12 16 12 18Z" fill="currentColor" />
    </svg>
  );
}

export function GarlicClove({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 32" className={className} fill="none" aria-hidden="true">
      <path d="M12 2C16.5 7 18.5 12.5 18.5 19C18.5 25 15 30 12 30C9 30 5.5 25 5.5 19C5.5 12.5 7.5 7 12 2Z" fill="#F5EFE7" stroke="#C08A55" strokeWidth="0.9" />
      <path d="M12 2L12 6" stroke="#74836A" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M9 15C10.5 16.5 13.5 16.5 15 15" stroke="#D2BD9F" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M12 6L12 28" stroke="#E0CDB8" strokeWidth="0.5" opacity="0.7" />
    </svg>
  );
}

export function ParsleySprig({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <path d="M16 30L16 8" stroke="#5F6C57" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M16 20C12 20 8.5 17.5 7.5 14C10.5 14.5 14 16.5 16 20Z" fill="#8D9C7C" />
      <path d="M16 16C20 16 23.5 13.5 24.5 10C21.5 10.5 18 12.5 16 16Z" fill="#9CAB8B" />
      <path d="M16 12C13 12 10.5 10 10 7C12.5 7.5 15 9 16 12Z" fill="#74836A" />
      <path d="M16 9C18.5 9 20.5 7 20.5 4.5C18.5 5 16.5 6.5 16 9Z" fill="#8D9C7C" />
    </svg>
  );
}

/* Baker's scoring slash icon — two diagonal cuts */
export function ScoreSlash({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M3 16L9 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M11 18L19 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

/* ============================================================
   WAX-STAMP SEAL — circular hand-stamped bakery seal.
   Now with paper grain, ink texture, and rough edges.
   ============================================================ */
export function StampSeal({
  className = '',
  text = 'CRUST & CRUMB · ARTISAN BAKERY · ',
  color = '#3e2723',
  size = 120,
  children,
}: {
  className?: string;
  text?: string;
  color?: string;
  size?: number;
  children?: React.ReactNode;
}) {
  const id = 'seal-' + text.length + '-' + size;
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      
      {/* PAPER / KRAFT BACKGROUND CIRCLE */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          backgroundColor: '#ede0d4',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundBlendMode: 'multiply',
          transform: 'rotate(-2deg)',
          boxShadow: 'inset 0 0 0 1px rgba(62,39,35,0.15)',
        }}
      />

      {/* INK STAMP SVG - roughened with displacement filter */}
      <svg 
        viewBox="0 0 120 120" 
        width={size} 
        height={size} 
        aria-hidden="true"
        className="relative z-10"
        style={{ 
          transform: 'rotate(-3deg)',
          filter: 'url(#ink-bleed)',
        }}
      >
        <defs>
          <path id={id} d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
          
          {/* INK BLEED FILTER: makes the ink edges rough */}
          <filter id="ink-bleed">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* outer ring */}
        <circle cx="60" cy="60" r="56" fill="none" stroke={color} strokeWidth="2" opacity="0.6" />
        <circle cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="3.5" opacity="0.85" />
        
        {/* inner ring */}
        <circle cx="60" cy="60" r="34" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6" />
        
        {/* rotating text */}
        <text fill={color} fontSize="8.5" fontWeight="800" letterSpacing="1.5" fontFamily="Nunito, sans-serif" opacity="0.9">
          <textPath href={`#${id}`} startOffset="0%">{text}</textPath>
        </text>
        
        {/* tick marks around inner ring */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const x1 = 60 + Math.cos(angle) * 34;
          const y1 = 60 + Math.sin(angle) * 34;
          const x2 = 60 + Math.cos(angle) * 30;
          const y2 = 60 + Math.sin(angle) * 30;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.5" opacity="0.5" />;
        })}
      </svg>

      {/* center icon */}
      {children && (
        <div className="absolute inset-0 grid place-items-center z-20" style={{ pointerEvents: 'none' }}>
          {children}
        </div>
      )}
    </div>
  );
}