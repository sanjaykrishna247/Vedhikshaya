import Reveal from './Reveal';
import Divider from './Divider';
import './About.css';

const STATS = [
  { value: '4:1 Ratio', label: 'Perfect Reduction' },
  { value: '85–90°C', label: 'Pharmacopoeia-grade Temperature' },
  { value: '< 30 min', label: 'Fresh Dose, On Demand' },
];

export default function About() {
  return (
    <section id="about" className="about">
      <Divider variant="waveDown" fill="#012F13" />

      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow" style={{ justifyContent: 'center' }}>What is Vedikshaya</p>
          <h2 className="section-title">Precision Ayurveda, Automated</h2>
          <p className="section-sub" style={{ margin: '0 auto' }}>
            Vedikshaya is a smart pod-based appliance that brews classical Kwatha (Kadha)
            formulations with exact temperature control and reduction ratios — turning a process
            that once took hours of manual attention into a consistent, on-demand dose grounded
            in AFI and API standards.
          </p>
        </Reveal>

        <div className="about__stats">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 120} className="glass about__stat">
              <div className="about__stat-value">{stat.value}</div>
              <div className="about__stat-label">{stat.label}</div>
            </Reveal>
          ))}
        </div>
      </div>

      <Divider variant="waveUp" fill="#011207" />
    </section>
  );
}
