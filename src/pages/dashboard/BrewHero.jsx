import { IconClock } from './icons';
import { PhaseSoak, PhaseBoil, PhaseStir, PhaseDispense } from './phaseIcons';
import { useKashaya } from '../../auth/KashayaContext';
import { useBrewSim, fmtClock } from './BrewSim';
import { useDashLang } from './dashI18n';

const STEP_ICON = {
  Soaking: <PhaseSoak />,
  Boil: <PhaseStir />,
  Stirring: <PhaseBoil />,
  Dispense: <PhaseDispense />,
};

const STEP_CHECK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13l4 4 10-10" />
  </svg>
);

const STEPS = ['Soaking', 'Boil', 'Stirring', 'Dispense'];
const STEP_LABEL_KEY = {
  Soaking: 'phase.soaking',
  Boil: 'phase.boil',
  Stirring: 'phase.stirring',
  Dispense: 'phase.dispense',
};

export default function BrewHero() {
  const { kashaya } = useKashaya();
  const { t } = useDashLang();
  const { status, remaining, phaseIndex, tempC, waterMl, start, reset } = useBrewSim();

  const clock = status === 'idle' ? fmtClock(20 * 60) : fmtClock(remaining);
  const temp = Math.round(tempC);

  const sub =
    status === 'idle'
      ? t('hero.subIdle')
      : status === 'done'
        ? t('hero.subDone', { ml: Math.round(waterMl) })
        : phaseIndex === 0
          ? t('hero.subSoak')
          : phaseIndex === 1
            ? t('hero.subBoil', { t: temp })
            : phaseIndex === 2
              ? t('hero.subStir', { t: temp })
              : t('hero.subDispense');

  const timerLabel =
    status === 'idle' ? t('timer.pressStart') : status === 'done' ? t('timer.complete') : t('timer.remaining');

  return (
    <div className="d-hero">
      <div className="d-hero__blob d-hero__blob--1" aria-hidden="true" />
      <div className="d-hero__blob d-hero__blob--2" aria-hidden="true" />

      <div className="d-hero__top">
        <div>
          <h2 className="d-hero__title">{kashaya}</h2>
          <p className="d-hero__sub">{sub}</p>
        </div>

        <div className="d-hero__timer">
          <IconClock className="d-hero__timer-icon" />
          <div>
            <div className="d-hero__timer-value">{clock}</div>
            <div className="d-hero__timer-label">{timerLabel}</div>
          </div>
        </div>
      </div>

      <div className="d-hero__phases">
        {STEPS.map((step, i) => {
          const state =
            status === 'done' || i < phaseIndex
              ? 'done'
              : status === 'running' && i === phaseIndex
                ? 'current'
                : 'upcoming';
          return (
            <div key={step} className={`d-hero__phase d-hero__phase--${state}`}>
              <span className="d-hero__phase-icon">{STEP_ICON[step]}</span>
              <span className="d-hero__phase-label">{t(STEP_LABEL_KEY[step])}</span>
              {state === 'done' && <span className="d-hero__phase-check">{STEP_CHECK}</span>}
            </div>
          );
        })}
      </div>

      <div className="d-hero__control">
        {status !== 'done' ? (
          <button
            type="button"
            className="d-hero__start"
            onClick={() => start(kashaya)}
            disabled={status === 'running'}
          >
            {status === 'running' ? `${t('phase.' + ['soaking', 'boil', 'stirring', 'dispense'][phaseIndex])} · ${fmtClock(remaining)}` : t('btn.start')}
          </button>
        ) : (
          <button type="button" className="d-hero__start d-hero__start--reset" onClick={reset}>
            {t('btn.reset')}
          </button>
        )}
      </div>
    </div>
  );
}
