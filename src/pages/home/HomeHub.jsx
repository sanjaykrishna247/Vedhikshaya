import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { IconScan, IconHistory, IconLeaf, IconLogout, IconChevronRight } from '../dashboard/icons';
import RobotDoctor from '../../components/RobotDoctor';
import logo from '../../assets/logo.svg';
import './HomeHub.css';

const OPTIONS = [
  {
    to: '/scan',
    icon: IconScan,
    title: 'Scan the Pod',
    desc: 'Point your camera at a Vedikshaya pod to identify it and start brewing.',
    accent: '#8BC53D',
    tint: 'rgba(139, 197, 61, 0.14)',
  },
  {
    to: '/chatbot',
    icon: null,
    title: 'Ask the AI Doctor',
    desc: 'Describe your symptoms and get Kashaya recommendations from our assistant.',
    accent: '#27a567',
    tint: 'rgba(39, 165, 103, 0.14)',
  },
  {
    to: '/brew-history',
    icon: IconHistory,
    title: 'Brew History',
    desc: 'Review your past brews, doses, and formulations.',
    accent: '#0b7a3b',
    tint: 'rgba(11, 122, 59, 0.14)',
  },
  {
    to: '/herbs',
    icon: IconLeaf,
    title: 'Herbs Library',
    desc: 'Explore each Kashaya — the herbs inside it, what they do, and where the recipe comes from.',
    accent: '#4c7a1f',
    tint: 'rgba(76, 122, 31, 0.14)',
  },
];

export default function HomeHub() {
  const { user, logout } = useAuth();
  const firstName = user?.name ? user.name.split(' ')[0] : null;

  return (
    <div className="hub">
      <div className="hub__aura" aria-hidden="true" />

      <header className="hub__header">
        <Link to="/" className="hub__brand">
          <img src={logo} alt="" className="hub__logo-img" aria-hidden="true" />
          <span className="hub__wordmark">
            Vediks<span>haya</span>
          </span>
        </Link>
        <button className="hub__logout" onClick={logout}>
          <IconLogout />
          Log out
        </button>
      </header>

      <main className="hub__main">
        <h1 className="hub__title">
          {firstName ? `Hello, ${firstName}.` : 'Hello.'} What would you like to do?
        </h1>
        <p className="hub__sub">
          Scan a pod to start brewing, ask the AI doctor for a recommendation, or look back through your brews.
        </p>

        <div className="hub__grid">
          {OPTIONS.map((opt) => (
            <Link
              key={opt.to}
              to={opt.to}
              className="hub__card"
              style={{ '--accent': opt.accent, '--tint': opt.tint }}
            >
              <span className="hub__card-icon">
                {opt.icon ? <opt.icon /> : <RobotDoctor size={42} mono />}
              </span>
              <span className="hub__card-body">
                <h3 className="hub__card-title">{opt.title}</h3>
                <p className="hub__card-desc">{opt.desc}</p>
              </span>
              <span className="hub__card-cta" aria-hidden="true">
                <IconChevronRight />
              </span>
            </Link>
          ))}
        </div>
      </main>

      <footer className="hub__footer">
        <span>Vedikshaya</span>
        <span className="hub__footer-dot">•</span>
        <span>Ancient Wisdom, Brewed by Intelligence</span>
      </footer>
    </div>
  );
}
