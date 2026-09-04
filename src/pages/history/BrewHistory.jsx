import { Link } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import { IconLeaf } from '../dashboard/icons';
import './BrewHistory.css';

const PALETTE = [
  ['#5a9e2f', 'rgba(90, 158, 47, 0.12)'],
  ['#27a567', 'rgba(39, 165, 103, 0.12)'],
  ['#0b7a3b', 'rgba(11, 122, 59, 0.12)'],
  ['#6b9e2f', 'rgba(107, 158, 47, 0.12)'],
  ['#3f8f6a', 'rgba(63, 143, 106, 0.12)'],
  ['#417c9e', 'rgba(65, 124, 158, 0.12)'],
];

const HISTORY = [
  { date: 'Sep 3, 2026', name: 'Dashamoola Kwatha', dose: '100 mL', consistency: '97.4%', status: 'Completed' },
  { date: 'Sep 2, 2026', name: 'Ashwagandha Kwatha', dose: '100 mL', consistency: '96.1%', status: 'Completed' },
  { date: 'Sep 1, 2026', name: 'Triphala Kwatha', dose: '100 mL', consistency: '98.0%', status: 'Completed' },
  { date: 'Aug 31, 2026', name: 'Guduchi Kwatha', dose: '95 mL', consistency: '94.6%', status: 'Completed' },
  { date: 'Aug 30, 2026', name: 'Dashamoola Kwatha', dose: '100 mL', consistency: '97.8%', status: 'Completed' },
  { date: 'Aug 29, 2026', name: 'Triphala Kwatha', dose: '80 mL', consistency: '—', status: 'Interrupted' },
  { date: 'Aug 28, 2026', name: 'Ashwagandha Kwatha', dose: '100 mL', consistency: '95.7%', status: 'Completed' },
  { date: 'Aug 27, 2026', name: 'Dashamoola Kwatha', dose: '100 mL', consistency: '98.2%', status: 'Completed' },
  { date: 'Aug 26, 2026', name: 'Punarnava Kwatha', dose: '90 mL', consistency: '93.9%', status: 'Completed' },
  { date: 'Aug 25, 2026', name: 'Triphala Kwatha', dose: '100 mL', consistency: '97.1%', status: 'Completed' },
  { date: 'Aug 24, 2026', name: 'Rasna Kwatha', dose: '100 mL', consistency: '96.5%', status: 'Completed' },
  { date: 'Aug 23, 2026', name: 'Guduchi Kwatha', dose: '85 mL', consistency: '—', status: 'Interrupted' },
  { date: 'Aug 22, 2026', name: 'Dashamoola Kwatha', dose: '100 mL', consistency: '97.9%', status: 'Completed' },
  { date: 'Aug 21, 2026', name: 'Ashwagandha Kwatha', dose: '100 mL', consistency: '96.8%', status: 'Completed' },
  { date: 'Aug 20, 2026', name: 'Triphala Kwatha', dose: '100 mL', consistency: '98.4%', status: 'Completed' },
  { date: 'Aug 19, 2026', name: 'Bala Kwatha', dose: '95 mL', consistency: '94.2%', status: 'Completed' },
  { date: 'Aug 18, 2026', name: 'Dashamoola Kwatha', dose: '100 mL', consistency: '97.6%', status: 'Completed' },
  { date: 'Aug 17, 2026', name: 'Shatavari Kwatha', dose: '100 mL', consistency: '96.3%', status: 'Completed' },
];

export default function BrewHistory() {
  const completed = HISTORY.filter((h) => h.status === 'Completed').length;
  const interrupted = HISTORY.length - completed;

  const readings = HISTORY.map((h) => parseFloat(h.consistency)).filter((n) => !Number.isNaN(n));
  const avgConsistency = (readings.reduce((a, b) => a + b, 0) / readings.length).toFixed(1);

  const counts = HISTORY.reduce((acc, h) => {
    acc[h.name] = (acc[h.name] || 0) + 1;
    return acc;
  }, {});
  const [topName, topCount] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

  const uniqueNames = [...new Set(HISTORY.map((h) => h.name))];
  const colorFor = (name) => PALETTE[uniqueNames.indexOf(name) % PALETTE.length];

  return (
    <div className="bh">
      <header className="bh__header">
        <Link to="/home" className="bh__brand">
          <img src={logo} alt="" className="bh__logo-img" aria-hidden="true" />
          <span className="bh__wordmark">
            Vediks<span>haya</span>
          </span>
        </Link>
        <Link to="/home" className="bh__back">
          ← Home
        </Link>
      </header>

      <main className="bh__main">
        <aside className="bh__aside">
          <div>
            <h1 className="bh__title">Brew History</h1>
            <p className="bh__sub">A log of your past Kashaya brews.</p>
          </div>

          <div className="bh__stats">
            <div className="bh__stat bh__stat--hero">
              <span className="bh__stat-value">{HISTORY.length}</span>
              <span className="bh__stat-label">Brews logged</span>
            </div>
            <div className="bh__stat-row">
              <div className="bh__stat">
                <span className="bh__stat-value">{completed}</span>
                <span className="bh__stat-label">Completed</span>
              </div>
              <div className="bh__stat">
                <span className="bh__stat-value">{interrupted}</span>
                <span className="bh__stat-label">Interrupted</span>
              </div>
            </div>
            <div className="bh__stat">
              <span className="bh__stat-value">{avgConsistency}%</span>
              <span className="bh__stat-label">Average consistency</span>
            </div>
            <div className="bh__stat bh__stat--text">
              <span className="bh__stat-label">Most brewed</span>
              <span className="bh__stat-name">{topName}</span>
              <span className="bh__stat-sub">{topCount} brews</span>
            </div>
          </div>
        </aside>

        <section className="bh__content">
          <div className="bh__scroll">
            {HISTORY.map((h, i) => {
              const [color, tint] = colorFor(h.name);
              const done = h.status === 'Completed';
              return (
                <article key={i} className="bh__row">
                  <span className="bh__badge" style={{ '--c': color, '--ct': tint }}>
                    <IconLeaf />
                  </span>

                  <div className="bh__info">
                    <span className="bh__name">{h.name}</span>
                    <span className="bh__meta">
                      <span>{h.date}</span>
                      <i className="bh__dot" />
                      <span>{h.dose}</span>
                      <i className="bh__dot" />
                      <span>{done ? `${h.consistency} consistency` : 'no consistency reading'}</span>
                    </span>
                  </div>

                  <span className={`bh__status bh__status--${done ? 'ok' : 'warn'}`}>
                    <span className="bh__status-dot" />
                    {h.status}
                  </span>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
