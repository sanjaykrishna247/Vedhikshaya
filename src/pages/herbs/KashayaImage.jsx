// Illustrated depictions of each brewed kashaya — a real render of the drink
// itself (cup, liquid colour, characteristic garnish), not a generic leaf
// glyph. No photograph exists that's both authentic to these exact classical
// formulations and safely licensed for use here, so these are drawn instead:
// each liquid colour, vessel and garnish is accurate to the real preparation.

const STEAM = (x) => (
  <g opacity="0.55" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" fill="none">
    <path d={`M${x} 14c-2 -3 2 -4 0 -7`} />
    <path d={`M${x + 5} 15c-2 -3 2 -4 0 -7`} />
  </g>
);

function NilavembuArt() {
  return (
    <svg viewBox="0 0 64 64" fill="none" role="img" aria-label="Nilavembu Kudineer — bitter green Siddha decoction in a kudam">
      <defs>
        <linearGradient id="nv-liquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a8f3a" />
          <stop offset="1" stopColor="#4c5c22" />
        </linearGradient>
        <linearGradient id="nv-pot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c97a4a" />
          <stop offset="1" stopColor="#9a5630" />
        </linearGradient>
      </defs>
      {STEAM(24)}
      {/* squat clay kudam (Siddha kudineer pot) */}
      <path d="M18 30c0-6 6-9 14-9s14 3 14 9v13c0 7-6.5 12-14 12s-14-5-14-12z" fill="url(#nv-pot)" />
      <ellipse cx="32" cy="30" rx="14" ry="4.4" fill="url(#nv-liquid)" />
      <path d="M18.4 30c0 2.4 6.1 4.4 13.6 4.4s13.6-2 13.6-4.4" stroke="#3d4a1a" strokeWidth="1" opacity="0.5" />
      <path d="M22 20c1-3 4-4 4-4M40 20c-1-3-4-4-4-4" stroke="#7a4326" strokeWidth="2.4" strokeLinecap="round" />
      {/* bitter herb sprig resting on the rim */}
      <g transform="translate(37 22) rotate(18)">
        <path d="M0 10 L2 0" stroke="#4b6b23" strokeWidth="1.6" strokeLinecap="round" />
        <ellipse cx="0" cy="1" rx="2.6" ry="1.3" fill="#6a8f34" transform="rotate(-20 0 1)" />
        <ellipse cx="2.5" cy="3.5" rx="2.4" ry="1.2" fill="#7a9e3f" transform="rotate(25 2.5 3.5)" />
      </g>
    </svg>
  );
}

function TulsiKadhaArt() {
  return (
    <svg viewBox="0 0 64 64" fill="none" role="img" aria-label="Tulsi-Dalchini-Sunthi-Marich Kadha — spiced reddish-brown kadha in a copper tumbler">
      <defs>
        <linearGradient id="tk-liquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c1652f" />
          <stop offset="1" stopColor="#7a3413" />
        </linearGradient>
        <linearGradient id="tk-cup" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e8b06a" />
          <stop offset="1" stopColor="#b97a35" />
        </linearGradient>
      </defs>
      {STEAM(30)}
      {/* copper tumbler (lota-style) */}
      <path d="M20 26h24l-2.4 22a4 4 0 0 1-4 3.6H26.4a4 4 0 0 1-4-3.6z" fill="url(#tk-cup)" />
      <ellipse cx="32" cy="26" rx="12" ry="3.6" fill="url(#tk-liquid)" />
      <path d="M20.6 26c0 2 5.1 3.6 11.4 3.6s11.4-1.6 11.4-3.6" stroke="#5c260f" strokeWidth="1" opacity="0.5" />
      {/* cinnamon stick leaning on the rim */}
      <g transform="translate(38 14) rotate(35)">
        <rect x="-1.6" y="0" width="3.2" height="15" rx="1.6" fill="#a9683a" />
        <rect x="-1.6" y="0" width="3.2" height="15" rx="1.6" fill="none" stroke="#7a4423" strokeWidth="0.7" />
      </g>
      {/* tulsi leaf */}
      <g transform="translate(23 15) rotate(-15)">
        <path d="M0 6C-3 2 -1 -4 4 -5 C6 0 4 5 0 6Z" fill="#3f7d33" />
        <path d="M2 -4 L1 5" stroke="#2c5a24" strokeWidth="0.7" />
      </g>
      {/* peppercorns */}
      <circle cx="27" cy="24" r="1.6" fill="#2c2013" />
      <circle cx="31.5" cy="25.5" r="1.6" fill="#2c2013" />
      <circle cx="36" cy="24" r="1.6" fill="#2c2013" />
    </svg>
  );
}

function ShadangaArt() {
  return (
    <svg viewBox="0 0 64 64" fill="none" role="img" aria-label="Shadanga Paniya — the pale amber six-herb medicated water in a clay tumbler">
      <defs>
        <linearGradient id="sp-liquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e7c877" />
          <stop offset="1" stopColor="#c99a3f" />
        </linearGradient>
        <linearGradient id="sp-cup" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2d3b8" />
          <stop offset="1" stopColor="#b79b74" />
        </linearGradient>
      </defs>
      {/* tall clay tumbler, no steam — traditionally served cool */}
      <path d="M21 22h22l-1.8 26.4a4 4 0 0 1-4 3.6H26.8a4 4 0 0 1-4-3.6z" fill="url(#sp-cup)" />
      <ellipse cx="32" cy="22" rx="11" ry="3.4" fill="url(#sp-liquid)" />
      <path d="M21.5 22c0 1.9 4.7 3.4 10.5 3.4s10.5-1.5 10.5-3.4" stroke="#8a6c3f" strokeWidth="1" opacity="0.5" />
      <path d="M23 18.5c-1-3 0-6 2-7M41 18.5c1-3 0-6-2-7" stroke="#9a7b4a" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {/* six small herb sprigs / petals floating — "six-limbed" water */}
      {[[26, 30], [32, 33], [38, 30], [29, 36], [35, 36], [32, 26]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.3" fill={i % 2 ? '#7a9e3f' : '#c9d98a'} opacity="0.9" />
      ))}
    </svg>
  );
}

const ART = {
  'nilavembu-kudineer': NilavembuArt,
  'tulsi-dalchini-sunthi-marich': TulsiKadhaArt,
  'shadanga-paniya': ShadangaArt,
};

export default function KashayaImage({ slug, className, style }) {
  const Art = ART[slug];
  if (!Art) return null;
  return (
    <span className={className} style={style}>
      <Art />
    </span>
  );
}
