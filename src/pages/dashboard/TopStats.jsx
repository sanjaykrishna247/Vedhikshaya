import { useBrewSim, fmtClock } from './BrewSim';
import { useDashLang } from './dashI18n';

const STIR_TOTAL = 10;

const GREEN = [90, 158, 47];
const YELLOW = [229, 201, 61];
const RED = [229, 73, 61];
const lerp = (a, b, t) => Math.round(a + (b - a) * t);
const mix = (c1, c2, t) => `rgb(${lerp(c1[0], c2[0], t)}, ${lerp(c1[1], c2[1], t)}, ${lerp(c1[2], c2[2], t)})`;
const dotColor = (i) => {
  const t = i / (STIR_TOTAL - 1);
  return t < 0.5 ? mix(GREEN, YELLOW, t / 0.5) : mix(YELLOW, RED, (t - 0.5) / 0.5);
};

const PHASE_KEY = ['phase.soaking', 'phase.boil', 'phase.stirring', 'phase.dispense'];

export default function TopStats() {
  const { t } = useDashLang();
  const { status, phaseIndex, stir, elapsed, TOTAL_SECONDS } = useBrewSim();

  const filled = Math.max(0, Math.min(STIR_TOTAL, Math.round(stir)));
  const phaseLabel = status === 'idle' ? t('stats.notStarted') : t(PHASE_KEY[phaseIndex]);
  const foot =
    status === 'running'
      ? t('stats.active')
      : status === 'done'
        ? t('stats.doneState')
        : t('stats.idleState');
  const stirWord = filled >= 7 ? t('temp.high') : filled >= 4 ? 'Mid' : t('temp.low');

  return (
    <div className="d-card d-tri">
      <div className="d-tri__item">
        <div className="d-tri__label">{t('stats.brewPhase')}</div>
        <div className="d-tri__value">{phaseLabel}</div>
        <div className="d-tri__foot">
          <span className={`d-live-dot d-live-dot--sm ${status !== 'running' ? 'is-idle' : ''}`} /> {foot}
        </div>
      </div>

      <div className="d-tri__item">
        <div className="d-tri__label">{t('stats.stirIntensity')}</div>
        <div className="d-tri__row">
          <span className="d-segs" role="img" aria-label={`Stir intensity ${filled} of ${STIR_TOTAL}`}>
            {Array.from({ length: STIR_TOTAL }).map((_, i) => (
              <span
                key={i}
                className={`d-segs__dot ${i < filled ? 'is-on' : ''}`}
                style={{ '--dc': dotColor(i), '--i': i }}
              />
            ))}
          </span>
          <span className="d-tri__value d-tri__value--sm">{stirWord}</span>
        </div>
        <div className="d-tri__foot">
          {t('stats.speed')} {filled} / {STIR_TOTAL}
        </div>
      </div>

      <div className="d-tri__item">
        <div className="d-tri__label">{t('stats.elapsed')}</div>
        <div className="d-tri__value" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {fmtClock(elapsed)}
        </div>
        <div className="d-tri__foot">
          {t('stats.of')} {fmtClock(TOTAL_SECONDS)}
        </div>
      </div>
    </div>
  );
}
