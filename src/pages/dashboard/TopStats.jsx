import { useEffect, useState } from 'react';
import useCountUp from './useCountUp';

const STIR_TOTAL = 10;
const STIR_FILLED = 7;
const TDS_NOW = 1240;
const TDS_TARGET = 2000;

const GREEN = [90, 158, 47];
const YELLOW = [229, 201, 61];
const RED = [229, 73, 61];
const lerp = (a, b, t) => Math.round(a + (b - a) * t);
const mix = (c1, c2, t) => `rgb(${lerp(c1[0], c2[0], t)}, ${lerp(c1[1], c2[1], t)}, ${lerp(c1[2], c2[2], t)})`;
const dotColor = (i) => {
  const t = i / (STIR_TOTAL - 1);
  return t < 0.5 ? mix(GREEN, YELLOW, t / 0.5) : mix(YELLOW, RED, (t - 0.5) / 0.5);
};

export default function TopStats() {
  const ppm = useCountUp(TDS_NOW, { duration: 1400, delay: 200 });
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setGrown(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="d-card d-tri">
      <div className="d-tri__item">
        <div className="d-tri__label">Brew Phase</div>
        <div className="d-tri__value">Stirring</div>
        <div className="d-tri__foot">
          <span className="d-live-dot d-live-dot--sm" /> Active · On schedule
        </div>
      </div>

      <div className="d-tri__item">
        <div className="d-tri__label">Stir Intensity</div>
        <div className="d-tri__row">
          <span
            className="d-segs"
            role="img"
            aria-label={`Stir intensity ${STIR_FILLED} of ${STIR_TOTAL}`}
          >
            {Array.from({ length: STIR_TOTAL }).map((_, i) => (
              <span
                key={i}
                className={`d-segs__dot ${grown && i < STIR_FILLED ? 'is-on' : ''}`}
                style={{ '--dc': dotColor(i), '--i': i }}
              />
            ))}
          </span>
          <span className="d-tri__value d-tri__value--sm">High</span>
        </div>
        <div className="d-tri__foot">speed {STIR_FILLED} / {STIR_TOTAL}</div>
      </div>

      <div className="d-tri__item">
        <div className="d-tri__label">Extract Building</div>
        <div className="d-tri__row">
          <span className="d-meter d-meter--amber">
            <span
              className="d-meter__fill"
              style={{ width: grown ? `${(TDS_NOW / TDS_TARGET) * 100}%` : '0%' }}
            />
          </span>
          <span className="d-tri__value d-tri__value--sm">{ppm} ppm</span>
        </div>
        <div className="d-tri__foot">↑ rising</div>
      </div>
    </div>
  );
}
