import { IconDroplet } from './icons';

export default function ReductionLiquid() {
  const startMl = 400;
  const currentMl = 280;
  const targetMl = 100;
  const pct = Math.round(((startMl - currentMl) / (startMl - targetMl)) * 100);

  return (
    <div className="d-card d-card--liquid">
      <div className="d-card__head">
        <div className="d-card__title">
          <span className="d-card__icon">
            <IconDroplet />
          </span>
          <h3>Reduction Progress</h3>
        </div>
        <span className="d-badge">{pct}%</span>
      </div>

      <div className="liquid-wrap">
        <div className="liquid-tube">
          <div className="liquid-tube__fill">
            <span className="bubble b1" />
            <span className="bubble b2" />
            <span className="bubble b3" />
            <span className="bubble b4" />
            <span className="liquid-tube__wave" />
          </div>
          <div className="liquid-tube__mark" style={{ bottom: '25%' }}>
            <span>100 mL</span>
          </div>
          <div className="liquid-tube__mark" style={{ bottom: '100%' }}>
            <span>400 mL</span>
          </div>
        </div>

        <div className="liquid-info">
          <div className="liquid-info__value">{currentMl} mL</div>
          <div className="liquid-info__label">remaining</div>
          <div className="liquid-info__status">Evaporation in Progress</div>
        </div>
      </div>
    </div>
  );
}
