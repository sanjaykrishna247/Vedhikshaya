const VARIANTS = {
  waveDown: (fill) => (
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
      <path
        d="M0,32 C240,110 480,0 720,40 C960,80 1200,10 1440,48 L1440,120 L0,120 Z"
        fill={fill}
      />
    </svg>
  ),
  waveUp: (fill) => (
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
      <path
        d="M0,88 C240,10 480,120 720,80 C960,40 1200,110 1440,72 L1440,0 L0,0 Z"
        fill={fill}
      />
    </svg>
  ),
  leaf: (fill) => (
    <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
      <path
        d="M0,60 C180,10 320,90 500,50 C680,10 820,80 1000,40 C1180,0 1320,60 1440,30 L1440,100 L0,100 Z"
        fill={fill}
      />
    </svg>
  ),
};

export default function Divider({ variant = 'waveDown', fill = '#012F13', flip = false }) {
  return (
    <div className="divider" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      {VARIANTS[variant](fill)}
    </div>
  );
}
