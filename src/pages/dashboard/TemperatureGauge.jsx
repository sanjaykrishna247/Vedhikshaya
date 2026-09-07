import { IconThermo } from './icons';
import { useBrewSim } from './BrewSim';
import { useDashLang } from './dashI18n';

const BAND = [85, 90]; // optimal draw range

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

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const yFor = (t) => TUBE_BOTTOM - ((clamp(t, SCALE_BOT, SCALE_TOP) - SCALE_BOT) / (SCALE_TOP - SCALE_BOT)) * TUBE_H;

export default function TemperatureGauge() {
  const { t } = useDashLang();
  const { tempC } = useBrewSim();

  const value = Math.round(tempC);
  const fillPct = (TUBE_BOTTOM - yFor(tempC)) / TUBE_H;
  const levelY = yFor(tempC);
  const levelTopPct = (levelY / VB_H) * 100;

  const status =
    tempC < BAND[0]
      ? { key: 'low', label: t('temp.low') }
      : tempC > BAND[1]
        ? { key: 'high', label: t('temp.high') }
        : { key: 'ok', label: t('temp.optimal') };

  return (
    <div className="d-card d-card--temp">
      <div className="d-card__head">
        <div className="d-card__title">
          <span className="d-card__icon">
            <IconThermo />
          </span>
          <h3>{t('card.temperature')}</h3>
        </div>
      </div>

      <div className="therm">
        <div
          className={`therm__status therm__status--${status.key}`}
          style={{ top: `${levelTopPct}%`, transition: 'top 0.5s var(--ease)' }}
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

          <rect
            x={TUBE_X}
            y={TUBE_TOP}
            width={TUBE_W}
            height={TUBE_H}
            rx="14"
            fill="url(#thermScale)"
            opacity="0.2"
          />

          <g clipPath="url(#thermTube)">
            <rect
              className="therm__mercury is-filled"
              x={TUBE_X}
              y={TUBE_TOP}
              width={TUBE_W}
              height={TUBE_H}
              fill="url(#thermScale)"
              style={{ '--fill': fillPct, transition: 'transform 0.55s var(--ease)' }}
            />
          </g>

          {BAND.map((b) => (
            <line
              key={b}
              x1={TUBE_X + TUBE_W}
              y1={yFor(b)}
              x2={TUBE_X + TUBE_W + 6}
              y2={yFor(b)}
              stroke="rgba(1,47,19,0.35)"
              strokeWidth="1.5"
            />
          ))}

          <rect x={TUBE_X} y={TUBE_BOTTOM - 20} width={TUBE_W} height="28" fill="#7cc142" />
          <circle cx={TUBE_X + TUBE_W / 2} cy="224" r="18" fill="#7cc142" />

          {(() => {
            const cx = TUBE_X + TUBE_W / 2;
            const right = TUBE_X + TUBE_W;
            const halfW = TUBE_W / 2;
            const bulbR = 18;
            const bulbCy = 224;
            const topCy = TUBE_TOP + halfW;
            const meetY = bulbCy - Math.sqrt(bulbR * bulbR - halfW * halfW);
            void cx;
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

          {[60, 70, 80, 90, 100].map((tick) => {
            const y = yFor(tick);
            return (
              <g key={tick} className="therm__tick">
                <line x1={TUBE_X - 12} y1={y} x2={TUBE_X - 2} y2={y} />
                <text x={TUBE_X - 18} y={y + 3.5} textAnchor="end">
                  {tick}
                </text>
              </g>
            );
          })}

          <g className="therm__level is-filled" style={{ transition: 'none' }}>
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

        <div
          className="therm__readout"
          style={{ top: `${levelTopPct}%`, transition: 'top 0.5s var(--ease)', animation: 'none', opacity: 1 }}
        >
          <span className="therm__readout-value">{value}°C</span>
          <span className="therm__readout-sub">{t('temp.holding')}</span>
        </div>
      </div>

      <div className="d-card__range">
        <span>{t('temp.targetRange')}</span>
        <span>85–90°C</span>
      </div>
    </div>
  );
}
