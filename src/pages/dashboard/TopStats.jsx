import useCountUp from './useCountUp';
import { IconDroplet, IconYield, IconClock } from './icons';

function ElapsedTime() {
  const totalEstimateSeconds = 14 * 60;
  const remainingSeconds = 8 * 60 + 24;
  const elapsedSeconds = totalEstimateSeconds - remainingSeconds;
  const seconds = useCountUp(elapsedSeconds, { duration: 1200 });
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return (
    <span>
      {mm}:{ss}
    </span>
  );
}

function Sparkline({ bars }) {
  return (
    <div className="d-sparkline">
      {bars.map((h, i) => (
        <span key={i} className="d-sparkline__bar" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

export default function TopStats() {
  const doseYield = useCountUp(67, { duration: 1400, delay: 200 });

  return (
    <div className="d-topstats">
      <div className="d-card d-stat">
        <div className="d-stat__row">
          <span className="d-stat__icon">
            <IconDroplet />
          </span>
          <span className="d-trend d-trend--flat">On schedule</span>
        </div>
        <div className="d-stat__label">Brew Phase</div>
        <div className="d-stat__value">Reduction ↓</div>
        <div className="d-stat__foot">
          <span className="d-live-dot d-live-dot--sm" /> Active
        </div>
      </div>

      <div className="d-card d-stat">
        <div className="d-stat__row">
          <span className="d-stat__icon">
            <IconClock />
          </span>
          <Sparkline bars={[30, 45, 40, 60, 55, 70, 62]} />
        </div>
        <div className="d-stat__label">Elapsed Time</div>
        <div className="d-stat__value d-stat__value--mono">
          <ElapsedTime />
        </div>
        <div className="d-stat__foot">of ~14 min estimate</div>
      </div>

      <div className="d-card d-stat">
        <div className="d-stat__row">
          <span className="d-stat__icon">
            <IconYield />
          </span>
          <span className="d-trend d-trend--up">↑ 12%</span>
        </div>
        <div className="d-stat__label">Dose Yield</div>
        <div className="d-stat__value">{doseYield} mL</div>
        <div className="d-stat__foot">/ 100 mL target</div>
      </div>
    </div>
  );
}
