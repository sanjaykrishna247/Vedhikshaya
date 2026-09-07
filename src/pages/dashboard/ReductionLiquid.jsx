import { useBrewSim } from './BrewSim';
import { useDashLang } from './dashI18n';

// visual fill band inside the tube (%) for a given mL reading
const fillFor = (ml, lo, hi) => 12 + 84 * ((ml - lo) / (hi - lo));

export default function ReductionLiquid() {
  const { t } = useDashLang();
  const { status, waterMl, WATER_START, WATER_END } = useBrewSim();

  const ml = Math.round(waterMl);
  const pct = fillFor(waterMl, WATER_END, WATER_START);

  const statusLabel =
    status === 'idle' ? t('water.ready') : status === 'done' ? t('water.done') : t('water.evap');

  return (
    <div className="d-card d-card--liquid">
      <div className="d-card__head">
        <div className="d-card__title">
          <h3>{t('card.waterLevel')}</h3>
        </div>
      </div>

      <div className="liquid-wrap">
        <span className="liquid-info__status">{statusLabel}</span>

        <div className="liquid-tube">
          <div
            className="liquid-tube__fill"
            style={{ height: `${pct}%`, animation: 'none', transition: 'height 0.55s var(--ease)' }}
          >
            <span className="bubble b1" />
            <span className="bubble b2" />
            <span className="bubble b3" />
            <span className="bubble b4" />
            <span className="liquid-tube__wave" />
          </div>
          <div className="liquid-tube__mark" style={{ bottom: `${fillFor(300, WATER_END, WATER_START)}%` }}>
            <span>300 mL</span>
          </div>
          <div className="liquid-tube__mark" style={{ bottom: `${fillFor(WATER_START, WATER_END, WATER_START)}%` }}>
            <span>600 mL</span>
          </div>
        </div>

        <div className="liquid-info">
          <div className="liquid-info__value" style={{ transition: 'color 0.3s' }}>
            {ml} mL
          </div>
          <div className="liquid-info__label">{t('water.remaining')}</div>
        </div>
      </div>
    </div>
  );
}
