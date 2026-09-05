export default function RobotDoctor({ size = 44, className = '', mono = false }) {
  // In mono mode the whole mascot collapses to a single-colour line drawing
  // that inherits `currentColor` from its parent.
  const ink = mono ? 'currentColor' : '#012F13';
  const lime = mono ? 'currentColor' : '#00DC4F';
  const soft = mono ? 'none' : '#E2F0CC';
  const screen = mono ? 'none' : '#FFFFFF';

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* antenna */}
      <line x1="50" y1="10" x2="50" y2="20" stroke={ink} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="50" cy="8" r="5" fill={lime} stroke={ink} strokeWidth="2" />

      {/* head */}
      <rect x="18" y="20" width="64" height="52" rx="20" fill={soft} stroke={ink} strokeWidth="3.5" />

      {/* ears */}
      <rect x="10" y="38" width="9" height="16" rx="4.5" fill={lime} stroke={ink} strokeWidth="3" />
      <rect x="81" y="38" width="9" height="16" rx="4.5" fill={lime} stroke={ink} strokeWidth="3" />

      {/* face screen */}
      <rect x="27" y="30" width="46" height="32" rx="12" fill={screen} stroke={ink} strokeWidth="2.5" />

      {/* eyes */}
      <circle cx="40" cy="46" r="5.5" fill={ink} />
      <circle cx="60" cy="46" r="5.5" fill={ink} />
      <circle cx="42" cy="44" r="1.6" fill={screen === 'none' ? soft : '#FFFFFF'} />
      <circle cx="62" cy="44" r="1.6" fill={screen === 'none' ? soft : '#FFFFFF'} />

      {/* smile */}
      <path d="M40 54c3 3 17 3 20 0" stroke={lime} strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* cheeks */}
      {!mono && <circle cx="32" cy="52" r="3" fill="#00DC4F" opacity="0.5" />}
      {!mono && <circle cx="68" cy="52" r="3" fill="#00DC4F" opacity="0.5" />}

      {/* stethoscope */}
      <path
        d="M33 72c0 10 8 16 17 16s17-6 17-16"
        stroke={ink}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="33" cy="72" r="3.5" fill={soft} stroke={ink} strokeWidth="2.5" />
      <circle cx="67" cy="72" r="3.5" fill={soft} stroke={ink} strokeWidth="2.5" />
      <circle cx="50" cy="90" r="7" fill={lime} stroke={ink} strokeWidth="3" />
    </svg>
  );
}
