import { useEffect, useState } from 'react';
import useCountUp from './useCountUp';
import { IconThermo } from './icons';

export default function TemperatureGauge() {
  const value = useCountUp(87, { duration: 1600 });
  const [sweep, setSweep] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSweep(true), 60);
    return () => clearTimeout(t);
  }, []);

  const min = 60;
  const max = 100;
  const pct = Math.min(Math.max((87 - min) / (max - min), 0), 1);
  const circumference = 251.2;
  const offset = circumference - pct * circumference;

  return (
    <div className="d-card d-card--temp">
      <div className="d-card__head">
        <div className="d-card__title">
          <span className="d-card__icon">
            <IconThermo />
          </span>
          <h3>Temperature</h3>
        </div>
        <span className="d-badge d-badge--ok">Optimal Range ✓</span>
      </div>

      <div className="gauge-wrap">
        <svg viewBox="0 0 160 100" className="gauge2">
          <path
            d="M14 90 A66 66 0 0 1 146 90"
            fill="none"
            stroke="rgba(1,47,19,0.08)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M14 90 A66 66 0 0 1 146 90"
            fill="none"
            stroke="url(#tempGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={sweep ? offset : circumference}
            className="gauge2__arc"
          />
          <defs>
            <linearGradient id="tempGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8BC53D" />
              <stop offset="100%" stopColor="#012F13" />
            </linearGradient>
          </defs>
        </svg>
        <div className="gauge2__center">
          <div className="gauge2__value">{value}°C</div>
        </div>
      </div>

      <div className="d-card__range">
        <span>85°C</span>
        <span>90°C</span>
      </div>
    </div>
  );
}
