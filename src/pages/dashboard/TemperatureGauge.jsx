import { useEffect, useState } from 'react';
import useCountUp from './useCountUp';
import { IconThermo } from './icons';

const MIN = 60;
const MAX = 100;
const TEMP = 87;
const BAND = [85, 90]; // optimal range

// viewBox geometry (0 0 260 268)
const VB_W = 260;
const VB_H = 268;
const TUBE_X = 118;
const TUBE_W = 28;
const TUBE_TOP = 22;
const TUBE_BOTTOM = 214;
const TUBE_H = TUBE_BOTTOM - TUBE_TOP;
const SCALE_TOP = 104; // value at tube top  (headroom so 100 sits inside)
const SCALE_BOT = 56; //  value at tube bottom

const yFor = (t) => TUBE_BOTTOM - ((t - SCALE_BOT) / (SCALE_TOP - SCALE_BOT)) * TUBE_H;

export default function TemperatureGauge() {
  const value = useCountUp(TEMP, { duration: 1600 });
  const [sweep, setSweep] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSweep(true), 60);
    return () => clearTimeout(t);
  }, []);

  const fillPct = (TUBE_BOTTOM - yFor(TEMP)) / TUBE_H;
  const levelY = yFor(TEMP);
  const levelTopPct = (levelY / VB_H) * 100;

  const status =
    TEMP < BAND[0]
      ? { key: 'low', label: 'Low' }
      : TEMP > BAND[1]
        ? { key: 'high', label: 'High' }
        : { key: 'ok', label: 'Optimal' };

  return (
    <div className="d-card d-card--temp">
      <div className="d-card__head">
        <div className="d-card__title">
          <span className="d-card__icon">
            <IconThermo />
          </span>
          <h3>Temperature</h3>
        </div>
      </div>

      <div className="therm">
        {/* left: status indicator, aligned to the reading */}
        <div
          className={`therm__status therm__status--${status.key}`}
          style={{ top: `${levelTopPct}%` }}
        >
          <span className="therm__status-dot" />
          {status.label}
        </div>

        <svg className="therm__svg" viewBox={`0 0 ${VB_W} ${VB_H}`} aria-hidden="true">
          <defs>
            <linearGradient id="thermScale" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e5493d" />
              <stop offset="0.36" stopColor="#f0923c" />
              <stop offset="0.6" stopColor="#e9c53c" />
              <stop offset="1" stopColor="#7cc142" />
            </linearGradient>
            <clipPath id="thermTube">
              <rect x={TUBE_X} y={TUBE_TOP} width={TUBE_W} height={TUBE_H} rx="14" />
            </clipPath>
          </defs>

          {/* faint full scale */}
          <rect
            x={TUBE_X}
            y={TUBE_TOP}
            width={TUBE_W}
            height={TUBE_H}
            rx="14"
            fill="url(#thermScale)"
            opacity="0.2"
          />

          {/* mercury fill */}
          <g clipPath="url(#thermTube)">
            <rect
              className={`therm__mercury ${sweep ? 'is-filled' : ''}`}
              x={TUBE_X}
              y={TUBE_TOP}
              width={TUBE_W}
              height={TUBE_H}
              fill="url(#thermScale)"
              style={{ '--fill': fillPct }}
            />
          </g>

          {/* optimal band markers on the tube edge */}
          {BAND.map((t) => (
            <line
              key={t}
              x1={TUBE_X + TUBE_W}
              y1={yFor(t)}
              x2={TUBE_X + TUBE_W + 6}
              y2={yFor(t)}
              stroke="rgba(1,47,19,0.35)"
              strokeWidth="1.5"
            />
          ))}

          {/* neck + bulb (same colour as the scale's cool end so it merges) */}
          <rect x={TUBE_X} y={TUBE_BOTTOM - 20} width={TUBE_W} height="28" fill="#7cc142" />
          <circle cx={TUBE_X + TUBE_W / 2} cy="224" r="18" fill="#7cc142" />

          {/* single continuous dark outline: tube flaring into the bulb */}
          {(() => {
            const cx = TUBE_X + TUBE_W / 2;
            const right = TUBE_X + TUBE_W;
            const halfW = TUBE_W / 2;
            const bulbR = 18;
            const bulbCy = 224;
            const topCy = TUBE_TOP + halfW;
            const meetY = bulbCy - Math.sqrt(bulbR * bulbR - halfW * halfW);
            return (
              <path
                d={`M ${TUBE_X} ${topCy}
                    A ${halfW} ${halfW} 0 0 1 ${right} ${topCy}
                    L ${right} ${meetY.toFixed(2)}
                    A ${bulbR} ${bulbR} 0 1 1 ${TUBE_X} ${meetY.toFixed(2)}
                    Z`}
                fill="none"
                stroke="rgba(1,47,19,0.35)"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
            );
          })()}

          {/* scale ticks */}
          {[60, 70, 80, 90, 100].map((t) => {
            const y = yFor(t);
            return (
              <g key={t} className="therm__tick">
                <line x1={TUBE_X - 12} y1={y} x2={TUBE_X - 2} y2={y} />
                <text x={TUBE_X - 18} y={y + 3.5} textAnchor="end">
                  {t}
                </text>
              </g>
            );
          })}

          {/* current-level marker line (dark) */}
          <g className={`therm__level ${sweep ? 'is-filled' : ''}`}>
            <line
              x1={TUBE_X + TUBE_W}
              y1={levelY}
              x2={TUBE_X + TUBE_W + 70}
              y2={levelY}
              strokeDasharray="4 4"
            />
            <circle cx={TUBE_X + TUBE_W + 70} cy={levelY} r="3.5" />
          </g>
        </svg>

        {/* right: reading, next to the marker line */}
        <div className="therm__readout" style={{ top: `${levelTopPct}%` }}>
          <span className="therm__readout-value">{value}°C</span>
          <span className="therm__readout-sub">holding</span>
        </div>
      </div>

      <div className="d-card__range">
        <span>Target range</span>
        <span>85–90°C</span>
      </div>
    </div>
  );
}
