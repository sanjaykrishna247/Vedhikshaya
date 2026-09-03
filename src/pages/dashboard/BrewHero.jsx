import { useEffect, useState } from 'react';
import useCountUp from './useCountUp';
import { IconClock } from './icons';

export default function BrewHero() {
  const totalSeconds = 8 * 60 + 24;
  const seconds = useCountUp(totalSeconds, { duration: 1200 });
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  const overallPct = 62;
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGrown(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="d-hero">
      <div className="d-hero__blob d-hero__blob--1" aria-hidden="true" />
      <div className="d-hero__blob d-hero__blob--2" aria-hidden="true" />

      <div className="d-hero__top">
        <div>
          <div className="d-hero__eyebrow">
            <span className="d-live-dot d-live-dot--sm" /> Live Brew Session
          </div>
          <h2 className="d-hero__title">Dashamoola Kwatha</h2>
          <p className="d-hero__sub">Reduction phase — temperature holding at 87°C</p>
        </div>

        <div className="d-hero__timer">
          <IconClock className="d-hero__timer-icon" />
          <div>
            <div className="d-hero__timer-value">
              {mm}:{ss}
            </div>
            <div className="d-hero__timer-label">time remaining</div>
          </div>
        </div>
      </div>

      <div className="d-hero__progress">
        <div className="d-hero__progress-track">
          <div className="d-hero__progress-fill" style={{ width: grown ? `${overallPct}%` : '0%' }} />
        </div>
        <div className="d-hero__progress-labels">
          <span>Soaking</span>
          <span>Boil</span>
          <span className="d-hero__progress-current">Reduction</span>
          <span>Dispense</span>
        </div>
      </div>
    </div>
  );
}
