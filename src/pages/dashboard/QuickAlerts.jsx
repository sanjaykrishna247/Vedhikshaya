import { IconBell } from './icons';

const ALERTS = [
  { dot: 'green', text: 'Soaking complete — boil started', time: '9 min ago' },
  { dot: 'yellow', text: 'Stir mechanism active', time: '3 min ago' },
  { dot: 'green', text: 'pH within AFI range', time: 'Just now' },
];

export default function QuickAlerts() {
  return (
    <div className="d-card d-card--alerts">
      <div className="d-card__head">
        <div className="d-card__title">
          <span className="d-card__icon">
            <IconBell />
          </span>
          <h3>Quick Alerts</h3>
        </div>
      </div>
      <div className="d-alerts">
        {ALERTS.map((a, i) => (
          <div key={i} className="d-alert">
            <span className={`d-alert__dot d-alert__dot--${a.dot}`} />
            <span className="d-alert__text">{a.text}</span>
            <span className="d-alert__time">{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
