import useCountUp from './useCountUp';
import { IconClock } from './icons';
import { PhaseSoak, PhaseBoil, PhaseStir, PhaseDispense } from './phaseIcons';

const STEP_ICON = {
  Soaking: <PhaseSoak />,
  Boil: <PhaseBoil />,
  Stirring: <PhaseStir />,
  Dispense: <PhaseDispense />,
};

const STEP_CHECK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13l4 4 10-10" />
  </svg>
);

const STEPS = ['Soaking', 'Boil', 'Stirring', 'Dispense'];
const CURRENT_STEP = 2;

export default function BrewHero() {
  const totalSeconds = 8 * 60 + 24;
  const seconds = useCountUp(totalSeconds, { duration: 1200 });
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className="d-hero">
      <div className="d-hero__blob d-hero__blob--1" aria-hidden="true" />
      <div className="d-hero__blob d-hero__blob--2" aria-hidden="true" />

      <div className="d-hero__top">
        <div>
          <h2 className="d-hero__title">Dashamoola Kwatha</h2>
          <p className="d-hero__sub">Stirring phase — temperature holding at 87°C</p>
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

      <div className="d-hero__phases">
        {STEPS.map((step, i) => {
          const state = i < CURRENT_STEP ? 'done' : i === CURRENT_STEP ? 'current' : 'upcoming';
          return (
            <div key={step} className={`d-hero__phase d-hero__phase--${state}`}>
              <span className="d-hero__phase-icon">{STEP_ICON[step]}</span>
              <span className="d-hero__phase-label">{step}</span>
              {state === 'done' && <span className="d-hero__phase-check">{STEP_CHECK}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
