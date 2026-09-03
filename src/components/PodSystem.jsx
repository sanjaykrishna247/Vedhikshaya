import Reveal from './Reveal';
import './PodSystem.css';

const FEATURES = [
  'AFI/API Standardized Formula',
  'Single-dose, disposable',
  'Encoded formulation profile',
  'Zero cross-contamination',
];

export default function PodSystem() {
  return (
    <section id="pod-system" className="pod-system">
      <div className="container pod-system__grid">
        <Reveal className="pod-system__visual">
          <div className="pod3d">
            <div className="pod3d__cap" />
            <div className="pod3d__body">
              <div className="pod3d__band" />
              <div className="pod3d__chip" />
            </div>
            <div className="pod3d__glow" />
          </div>
        </Reveal>

        <Reveal delay={120} className="pod-system__content">
          <p className="eyebrow">Smart Pod System</p>
          <h2 className="section-title">Engineered for Consistency</h2>
          <p className="section-sub">
            Every Vedikshaya pod carries an encoded formulation profile, telling the machine
            exactly how to brew it — the same precision, dose after dose.
          </p>

          <ul className="pod-system__features">
            {FEATURES.map((feature) => (
              <li key={feature}>
                <span className="pod-system__check">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
