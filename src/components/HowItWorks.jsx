import Reveal from './Reveal';
import Divider from './Divider';
import './HowItWorks.css';

const STEPS = [
  {
    title: 'Insert Pod',
    desc: 'Place the single-dose herb pod into the brewing chamber.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <rect x="17" y="6" width="14" height="30" rx="7" stroke="currentColor" strokeWidth="2.5" />
        <path d="M17 22h14" stroke="currentColor" strokeWidth="2.5" />
        <path d="M24 36v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Add Water',
    desc: 'Measured 400 mL water is added for a precise 4:1 reduction.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <path d="M24 6c8 10 13 17 13 24a13 13 0 1 1-26 0c0-7 5-14 13-24z" stroke="currentColor" strokeWidth="2.5" />
      </svg>
    ),
  },
  {
    title: 'Machine Brews',
    desc: 'AI-controlled heating maintains 85–90°C through the reduction phase.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="17" stroke="currentColor" strokeWidth="2.5" />
        <path d="M24 14v10l7 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Drink Fresh',
    desc: 'A 100 mL dose is dispensed — fresh, consistent, ready in minutes.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <path d="M13 10h22l-3 26a4 4 0 0 1-4 3.6H20A4 4 0 0 1 16 36z" stroke="currentColor" strokeWidth="2.5" />
        <path d="M13 10h22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="how">
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow" style={{ justifyContent: 'center', color: 'var(--forest)' }}>
            How It Works
          </p>
          <h2 className="section-title" style={{ color: 'var(--forest)' }}>
            Four Steps to Your Kwatha
          </h2>
          <p className="section-sub" style={{ margin: '0 auto', color: 'rgba(1,47,19,0.75)' }}>
            From pod to cup, Vedikshaya automates the entire classical brewing process.
          </p>
        </Reveal>

        <div className="how__flow">
          <div className="how__line" aria-hidden="true" />
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 140} className="how__step">
              <div className="how__step-number">{String(i + 1).padStart(2, '0')}</div>
              <div className="how__step-card glass-light">
                <div className="how__step-icon">{step.icon}</div>
                <h3 className="how__step-title">{step.title}</h3>
                <p className="how__step-desc">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <Divider variant="leaf" fill="#011207" />
    </section>
  );
}
