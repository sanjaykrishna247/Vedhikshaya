import Reveal from './Reveal';
import useReveal from '../hooks/useReveal';
import './Dashboard.css';

export default function Dashboard() {
  const [ref, visible] = useReveal();

  return (
    <section id="dashboard" className="dash">
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow" style={{ justifyContent: 'center' }}>Intelligent Brew Monitoring</p>
          <h2 className="section-title">AI Monitoring Dashboard</h2>
          <p className="section-sub" style={{ margin: '0 auto' }}>
            Every brew is tracked in real time — temperature, reduction, and dose consistency,
            continuously validated against pharmacopoeia specification.
          </p>
        </Reveal>

        <div ref={ref} className={`dash__panel glass ${visible ? 'dash__panel--active' : ''}`}>
          <div className="dash__panel-head">
            <span className="dash__live-dot" />
            Live Brew Session
            <span className="dash__phase">Reduction Phase</span>
          </div>

          <div className="dash__grid">
            <div className="dash__card">
              <div className="dash__label">Temperature</div>
              <div className="gauge">
                <svg viewBox="0 0 120 70" className="gauge__svg">
                  <path d="M10 65 A50 50 0 0 1 110 65" fill="none" stroke="rgba(226,240,204,0.15)" strokeWidth="8" strokeLinecap="round" />
                  <path
                    className="gauge__arc"
                    d="M10 65 A50 50 0 0 1 110 65"
                    fill="none"
                    stroke="#8BC53D"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <line x1="60" y1="65" x2="60" y2="24" className="gauge__needle" stroke="#E2F0CC" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="60" cy="65" r="4.5" fill="#E2F0CC" />
                </svg>
                <div className="gauge__value">87°C</div>
              </div>
              <div className="dash__note">Target range 85–90°C</div>
            </div>

            <div className="dash__card">
              <div className="dash__label">Reduction Progress</div>
              <div className="dash__progress-value">75%</div>
              <div className="progress-track">
                <div className="progress-fill" />
              </div>
              <div className="dash__note">400 mL → 100 mL target</div>
            </div>

            <div className="dash__card">
              <div className="dash__label">Dose Consistency Score</div>
              <div className="dash__score">98.4<span>%</span></div>
              <div className="dash__note dash__note--good">Within specification</div>
            </div>

            <div className="dash__card dash__card--phase">
              <div className="dash__label">Current Phase</div>
              <div className="dash__phase-timeline">
                {['Fill', 'Heat', 'Reduction', 'Dispense'].map((p, i) => (
                  <div key={p} className={`dash__phase-step ${i === 2 ? 'active' : i < 2 ? 'done' : ''}`}>
                    <span className="dot" />
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
