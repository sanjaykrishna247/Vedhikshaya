import { IconTarget } from './icons';

const SCORE = 97.4;

// gauge centre / radii  (viewBox "-15 -50 430 225")
const CX = 190;
const CY = 155;
const PIVOT_Y = 137;
const R_BAND = 145; // coloured band centreline

const deg = (v) => 180 - v * 1.8; // value 0 -> 180°(left), 100 -> 0°(right)
const rad = (d) => (d * Math.PI) / 180;
const pt = (v, r) => [CX + r * Math.cos(rad(deg(v))), CY - r * Math.sin(rad(deg(v)))];

const arcPath = (v1, v2, r) => {
  const [x1, y1] = pt(v1, r);
  const [x2, y2] = pt(v2, r);
  return `M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 0,1 ${x2.toFixed(2)},${y2.toFixed(2)}`;
};

const ZONES = [
  { id: 0, label: 'POOR', from: 0, to: 25, color: '#e5484d' },
  { id: 1, label: 'WEAK', from: 25, to: 50, color: '#f2740c' },
  { id: 2, label: 'FAIR', from: 50, to: 75, color: '#f5c518' },
  { id: 3, label: 'GREAT', from: 75, to: 100, color: '#46c04a' },
];

const MAJORS = [0, 25, 50, 75, 100];
const finalRot = -90 + (SCORE / 100) * 180;

export default function ConsistencyRing() {
  const minorTicks = [];
  for (let v = 0; v <= 100; v += 2.5) {
    if (v % 25 === 0) continue;
    const [x1, y1] = pt(v, 168);
    const [x2, y2] = pt(v, 171.5);
    const emph = v % 12.5 === 0;
    minorTicks.push(
      <line
        key={v}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={emph ? 'rgba(1,47,19,0.55)' : 'rgba(1,47,19,0.22)'}
        strokeWidth="1.6"
        strokeLinecap="round"
      />,
    );
  }

  return (
    <div className="d-card d-card--ring">
      <div className="d-card__head">
        <div className="d-card__title">
          <span className="d-card__icon">
            <IconTarget />
          </span>
          <h3>Brew Consistency Score</h3>
        </div>
      </div>

      <div className="gm">
        <svg className="gm__svg" viewBox="-15 -50 430 225" aria-hidden="true">
          <defs>
            {ZONES.map((z) => (
              <filter key={z.id} id={`gmGlow${z.id}`} x="-60%" y="-60%" width="220%" height="220%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.4" floodColor="rgba(1,47,19,0.35)" floodOpacity="1" />
              </filter>
            ))}
            {ZONES.map((z) => {
              const [x1, y1] = pt(z.from, R_BAND);
              const [x2, y2] = pt(z.to, R_BAND);
              return (
                <linearGradient
                  key={z.id}
                  id={`gmZG${z.id}`}
                  gradientUnits="userSpaceOnUse"
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                >
                  <stop offset="0%" stopColor={z.color} stopOpacity="0.9" />
                  <stop offset="50%" stopColor={z.color} stopOpacity="1" />
                  <stop offset="100%" stopColor={z.color} stopOpacity="0.9" />
                </linearGradient>
              );
            })}
            {ZONES.map((z) => (
              <path key={z.id} id={`gmArc${z.id}`} d={arcPath(z.from, z.to, R_BAND)} />
            ))}
          </defs>

          {/* coloured band */}
          <g filter="url(#gmGlow3)">
            {ZONES.map((z) => (
              <path
                key={z.id}
                d={arcPath(z.from, z.to, R_BAND)}
                fill="none"
                stroke={`url(#gmZG${z.id})`}
                strokeWidth="46"
                strokeLinecap="butt"
              />
            ))}
          </g>

          {/* rims */}
          <path d={arcPath(0, 100, R_BAND + 23)} fill="none" stroke="rgba(1,47,19,0.14)" strokeWidth="3" />
          <path d={arcPath(0, 100, R_BAND - 23)} fill="none" stroke="rgba(1,47,19,0.14)" strokeWidth="3" />

          {/* ticks */}
          {minorTicks}
          {MAJORS.map((v) => {
            const [x1, y1] = pt(v, 167);
            const [x2, y2] = pt(v, 175);
            const [tx, ty] = pt(v, 188);
            return (
              <g key={v}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(1,47,19,0.7)" strokeWidth="2.4" strokeLinecap="round" />
                <text
                  x={tx}
                  y={ty}
                  fill="#0f1c13"
                  fontSize="10"
                  fontWeight="800"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  letterSpacing="0.3"
                >
                  {v}
                </text>
              </g>
            );
          })}

          {/* zone dividers */}
          {[25, 50, 75].map((v) => {
            const [x1, y1] = pt(v, R_BAND - 23);
            const [x2, y2] = pt(v, R_BAND + 23);
            return <line key={v} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff" strokeWidth="3.5" />;
          })}

          {/* zone labels */}
          {ZONES.map((z) => (
            <text key={z.id} className="gm__zlabel" fill="#ffffff" fontSize="9.5" fontWeight="800" letterSpacing="0.9">
              <textPath href={`#gmArc${z.id}`} startOffset="50%" textAnchor="middle" dominantBaseline="middle">
                {z.label}
              </textPath>
            </text>
          ))}

          {/* needle */}
          <polygon className="gm__needle" points={`${CX},-8 ${CX - 7},142 ${CX + 7},142`} fill="#111111">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values={`-90,${CX},${PIVOT_Y}; 90,${CX},${PIVOT_Y}; -90,${CX},${PIVOT_Y}; ${finalRot.toFixed(1)},${CX},${PIVOT_Y}`}
              keyTimes="0; 0.36; 0.68; 1"
              calcMode="spline"
              keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.12 0 0.22 1"
              dur="3s"
              fill="freeze"
            />
          </polygon>

          {/* hub */}
          <circle cx={CX} cy={PIVOT_Y} r="15" fill="#111111" />
          <circle cx={CX} cy={PIVOT_Y} r="6" fill="#ffffff" />
        </svg>

        <div className="gm__center">
          <span className="gm__score">{SCORE}%</span>
          <span className="gm__cap">Consistency Score</span>
        </div>
      </div>

      <p className="gm__afi">Matching AFI Specification</p>
    </div>
  );
}
