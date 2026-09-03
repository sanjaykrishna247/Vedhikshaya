import Reveal from './Reveal';
import Divider from './Divider';
import './Compliance.css';

const BADGES = ['AFI Compliant', 'API Standardized', 'PCIM&H Certified', 'AIIA Validated'];

export default function Compliance() {
  return (
    <section id="compliance" className="compliance">
      <Divider variant="waveDown" fill="#012F13" />

      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow" style={{ justifyContent: 'center' }}>Compliance & Standards</p>
          <h2 className="section-title">Trusted by Standard, Built for Precision</h2>
        </Reveal>

        <Reveal delay={100} className="compliance__badges">
          {BADGES.map((badge) => (
            <div key={badge} className="compliance__badge">
              {badge}
            </div>
          ))}
        </Reveal>

        <Reveal delay={200} className="compliance__subtext">
          Every dose brewed to pharmacopoeia specification.
        </Reveal>
      </div>
    </section>
  );
}
