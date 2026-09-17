// A designed streak flame — layered gradients + a soft glow, instead of the
// flat OS fire emoji. Dims to a grey ember when the streak is at 0.
export default function FlameIcon({ size = 40, lit = true, className }) {
  const uid = 'sf' + Math.round(Math.random() * 1e6);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="58%" r="50%">
          <stop offset="0%" stopColor={lit ? '#ffb020' : '#8a9382'} stopOpacity="0.55" />
          <stop offset="100%" stopColor={lit ? '#ffb020' : '#8a9382'} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-outer`} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor={lit ? '#ff8a3d' : '#b7bdad'} />
          <stop offset="55%" stopColor={lit ? '#f9542b' : '#9aa290'} />
          <stop offset="100%" stopColor={lit ? '#d6231f' : '#7d8574'} />
        </linearGradient>
        <linearGradient id={`${uid}-inner`} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor={lit ? '#fff3b0' : '#e4e7dc'} />
          <stop offset="60%" stopColor={lit ? '#ffce4a' : '#cbd0c1'} />
          <stop offset="100%" stopColor={lit ? '#ff9d33' : '#a9b09b'} />
        </linearGradient>
      </defs>

      <circle cx="20" cy="22" r="18" fill={`url(#${uid}-glow)`} />

      <path
        d="M20 3c1.2 4.4-1.8 6.8-3.6 9.4-1.9 2.7-3 5.3-3 8.1 0 6.2 4.9 10.9 10.9 10.5 6.6-.4 10.8-6.6 9.1-12.8-.6-2.3-2.1-4-3.7-5.6.4 2.4-.4 4.3-1.8 5.3-.2-4.6-2.1-8.1-4.4-10.6C22.4 6.1 21.2 4.6 20 3Z"
        fill={`url(#${uid}-outer)`}
      />
      <path
        d="M19.6 13.4c1.1 2 1.6 3.9 1.4 5.9-.2 1.7-1.1 2.9-2.3 3.9-1.3 1.1-2 2.3-2 3.8 0 2.6 2.1 4.6 4.7 4.5-2.8 1.1-6.2-.2-7.5-3.1-1.2-2.6-.4-5.2 1.2-7.2 1.7-2.1 3.5-4.3 4.5-7.8Z"
        fill={`url(#${uid}-inner)`}
        opacity="0.95"
      />
    </svg>
  );
}
