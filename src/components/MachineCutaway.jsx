// Flat technical cutaway of the Vedikshaya brewer, drawn to match the
// hardware render: black casing, side water tank + fan, insulated steel
// vessel with stirrer and pod filter, heater underneath, PSU at the base.
// The left side panel uses a skew so parts on it sit in perspective.
const SIDE = 'matrix(-1 -0.3846 0 1 170 0)'; // (u = depth, v = height) -> screen

function Marker({ x, y, n }) {
  return (
    <g className="mc__marker">
      <circle cx={x} cy={y} r="11" />
      <text x={x} y={y + 4} textAnchor="middle">{n}</text>
    </g>
  );
}

export default function MachineCutaway() {
  return (
    <svg className="mc" viewBox="60 20 460 530" role="img" aria-label="Cutaway view of the Vedikshaya brewing machine">
      <defs>
        <linearGradient id="mcSteel" x1="0" x2="1">
          <stop offset="0" stopColor="#aab2b8" />
          <stop offset="0.45" stopColor="#e4e8eb" />
          <stop offset="1" stopColor="#9aa3aa" />
        </linearGradient>
        <linearGradient id="mcTube" x1="0" x2="1">
          <stop offset="0" stopColor="#d9dde0" />
          <stop offset="0.5" stopColor="#f7f8f8" />
          <stop offset="1" stopColor="#cfd4d7" />
        </linearGradient>
        <pattern id="mcPerf" width="7" height="7" patternUnits="userSpaceOnUse">
          <rect width="7" height="7" fill="#bcc3c8" />
          <circle cx="3.5" cy="3.5" r="1.5" fill="#6f777d" />
        </pattern>
        <pattern id="mcFibre" width="9" height="9" patternUnits="userSpaceOnUse">
          <rect width="9" height="9" fill="#e7dec3" />
          <circle cx="2" cy="3" r="0.8" fill="#cbbf9c" />
          <circle cx="6.5" cy="7" r="0.7" fill="#d3c8a8" />
        </pattern>
      </defs>

      {/* feet */}
      <rect x="188" y="518" width="26" height="12" rx="2" fill="#111416" />
      <rect x="448" y="518" width="26" height="12" rx="2" fill="#111416" />
      <rect x="98" y="488" width="20" height="11" rx="2" fill="#111416" />

      {/* top face */}
      <path d="M170 90 H490 L412 60 H92 Z" fill="#3a4147" stroke="#15181a" strokeWidth="1.5" strokeLinejoin="round" />

      {/* left side face */}
      <path d="M170 90 L92 60 V490 L170 520 Z" fill="#2b3136" stroke="#15181a" strokeWidth="1.5" />
      <g transform={SIDE}>
        {/* cooling fan */}
        <rect x="10" y="150" width="32" height="32" rx="3" fill="#191c1f" stroke="#0c0e0f" />
        <circle cx="26" cy="166" r="12" fill="#101213" stroke="#3b4247" />
        <path d="M14 166h24M26 154v24M17.5 157.5l17 17M34.5 157.5l-17 17" stroke="#3b4247" strokeWidth="1" />
        <circle cx="26" cy="166" r="3.5" fill="#2b3136" />
        {/* water tank */}
        <rect x="44" y="132" width="28" height="336" rx="4" fill="rgba(18,26,31,0.72)" stroke="#0b0d0e" />
        <rect x="47" y="300" width="22" height="164" rx="2" fill="rgba(96,146,176,0.55)" />
        <path d="M47 300h22" stroke="#9cc6de" strokeWidth="1.2" />
        <rect x="52" y="120" width="12" height="12" rx="2" fill="#9aa3aa" />
      </g>

      {/* front: casing frame + cutaway cavity */}
      <rect x="170" y="90" width="320" height="430" rx="12" fill="#23282c" stroke="#15181a" strokeWidth="1.5" />
      <rect x="186" y="106" width="288" height="398" rx="4" fill="#121517" />
      <rect x="186" y="106" width="288" height="292" fill="#181b1e" />

      {/* shelves and lower compartments */}
      <rect x="186" y="398" width="288" height="10" fill="#2b3035" />
      <rect x="186" y="408" width="46" height="32" fill="#1b1e21" />
      <rect x="428" y="408" width="46" height="32" fill="#1b1e21" />
      <rect x="186" y="440" width="288" height="8" fill="#2b3035" />

      {/* insulation jacket */}
      <rect x="214" y="196" width="232" height="198" rx="8" fill="url(#mcFibre)" stroke="#c9bc97" />

      {/* steel vessel + decoction */}
      <rect x="238" y="204" width="184" height="176" rx="3" fill="url(#mcSteel)" stroke="#8f989f" />
      <rect x="242" y="268" width="176" height="108" fill="#b7d4e3" opacity="0.85" />
      <path d="M242 268h176" stroke="#eaf5fb" strokeWidth="1.5" />

      {/* heating plate + temperature sensor */}
      <rect x="240" y="381" width="180" height="7" rx="3" fill="#b8692e" />
      <path d="M248 384.5h164" stroke="#e39a5c" strokeWidth="1" strokeDasharray="6 4" />
      <circle cx="272" cy="385" r="8" fill="#df8a33" stroke="#a45d1b" />

      {/* drive under the vessel */}
      <rect x="306" y="394" width="30" height="40" rx="3" fill="url(#mcSteel)" stroke="#6f777d" />

      {/* stirrer */}
      <rect x="314" y="80" width="8" height="272" fill="#2a4fa8" />
      <rect x="282" y="348" width="72" height="9" rx="4.5" fill="#2446a0" />
      <circle cx="318" cy="352" r="6" fill="#1b3680" />

      {/* pod filter + vapour tube + vent */}
      <rect x="370" y="68" width="28" height="170" fill="url(#mcTube)" stroke="#c3c8cc" />
      <rect x="366" y="236" width="36" height="132" rx="4" fill="url(#mcPerf)" stroke="#8c949a" />
      <rect x="368" y="50" width="32" height="20" fill="url(#mcSteel)" stroke="#7c848a" />
      <ellipse cx="384" cy="50" rx="16" ry="4.5" fill="#dde1e4" stroke="#7c848a" />
      <ellipse cx="384" cy="50" rx="9" ry="2.4" fill="#4a5157" />

      {/* water inlet */}
      <path d="M198 128 H254 Q264 128 264 138 V252" fill="none" stroke="#0c0e10" strokeWidth="12" strokeLinejoin="round" />
      <circle cx="196" cy="128" r="9" fill="#9aa3aa" stroke="#5a6268" />
      <circle cx="196" cy="128" r="4.5" fill="#2e3338" />

      {/* wiring + power supply / control board */}
      <path d="M318 434 V462 M328 434 V462" stroke="#c0392b" strokeWidth="1.5" />
      <path d="M338 434 V462" stroke="#2f6fd0" strokeWidth="1.5" />
      <rect x="244" y="458" width="176" height="42" rx="3" fill="#b3babf" stroke="#7c848a" />
      <path d="M352 466v26M360 466v26M368 466v26M376 466v26M384 466v26M392 466v26M400 466v26M408 466v26" stroke="#8d959b" strokeWidth="1.5" />
      <rect x="252" y="465" width="88" height="28" rx="2" fill="#1f6b3a" />
      <path d="M258 472h10M258 478h16M258 485h12M284 470v18M296 470v18M310 472h22M310 480h14" stroke="#e0b64a" strokeWidth="2" />

      {/* part markers — keep numbering in sync with PARTS in HowItWorks */}
      <Marker x={404} y={40} n={1} />
      <Marker x={410} y={258} n={2} />
      <Marker x={276} y={338} n={3} />
      <Marker x={232} y={146} n={4} />
      <Marker x={226} y={300} n={5} />
      <Marker x={436} y={384} n={6} />
      <Marker x={112} y={300} n={7} />
      <Marker x={144} y={124} n={8} />
      <Marker x={232} y={478} n={9} />
    </svg>
  );
}
