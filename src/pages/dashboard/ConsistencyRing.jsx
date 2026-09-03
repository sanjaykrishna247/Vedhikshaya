import { useEffect, useState } from 'react';
import useCountUp from './useCountUp';
import { IconTarget } from './icons';

export default function ConsistencyRing() {
  const score = useCountUp(97.4, { duration: 1600, decimals: 1 });
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 80);
    return () => clearTimeout(t);
  }, []);

  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (97.4 / 100) * circumference;

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

      <div className="ring-wrap">
        <svg viewBox="0 0 120 120" className="ring">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(1,47,19,0.08)" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={drawn ? offset : circumference}
            className="ring__arc"
            transform="rotate(-90 60 60)"
          />
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8BC53D" />
              <stop offset="100%" stopColor="#012F13" />
            </linearGradient>
          </defs>
        </svg>
        <div className="ring__center">
          <div className="ring__value">{score}%</div>
        </div>
      </div>

      <p className="d-card__note">Matching AFI Specification</p>

      <div className="ring-legend">
        <span>Extract Density ✓</span>
        <span>Temp ✓</span>
        <span>pH ✓</span>
      </div>
    </div>
  );
}
