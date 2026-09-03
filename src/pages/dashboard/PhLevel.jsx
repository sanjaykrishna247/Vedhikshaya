import { useEffect, useState } from 'react';
import { IconFlask } from './icons';

export default function PhLevel() {
  const ph = 6.2;
  const pct = (ph / 14) * 100;
  const [slid, setSlid] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSlid(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="d-card d-card--ph">
      <div className="ph-row">
        <div className="ph-row__info">
          <div className="d-card__title">
            <span className="d-card__icon">
              <IconFlask />
            </span>
            <h3>pH Level</h3>
          </div>
          <div className="ph-row__value">{ph}</div>
          <span className="d-badge d-badge--ok">Within Range</span>
          <p className="ph-row__note">Mildly Acidic — Within range</p>
        </div>

        <div className="ph-row__bar">
          <div className="ph-bar">
            <div className="ph-bar__track" />
            <div className="ph-bar__needle" style={{ left: slid ? `${pct}%` : '0%' }}>
              <span className="ph-bar__value">{ph}</span>
              <span className="ph-bar__glow" />
            </div>
          </div>
          <div className="ph-bar__labels">
            <span>Acidic</span>
            <span>Neutral</span>
            <span>Alkaline</span>
          </div>
        </div>
      </div>
    </div>
  );
}
