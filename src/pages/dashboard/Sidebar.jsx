import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  IconBrewStatus,
  IconSensors,
  IconRobot,
  IconHistory,
  IconChevronRight,
  IconLogout,
} from './icons';
import { useAuth } from '../../auth/AuthContext';
import { useKashaya } from '../../auth/KashayaContext';
import { useDashLang } from './dashI18n';

const NAV = [
  { icon: IconBrewStatus, key: 'nav.brewStatus', to: '/dashboard', expandable: true },
  { icon: IconSensors, key: 'nav.sensors', to: '/sensors', expandable: true },
  { icon: IconRobot, key: 'nav.assistant', to: '/chatbot' },
  { icon: IconHistory, key: 'nav.history', to: '/brew-history', expandable: true },
];

const POD_INGREDIENTS = [
  'Bilva',
  'Agnimantha',
  'Shyonaka',
  'Gambhari',
  'Patala',
  'Shalaparni',
  'Prishniparni',
  'Brihati',
  'Kantakari',
  'Gokshura',
];

export default function Sidebar({ open = true }) {
  const [drMode, setDrMode] = useState(false);
  const { logout } = useAuth();
  const { kashaya } = useKashaya();
  const { t } = useDashLang();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  return (
    <aside className={`d-sidebar ${open ? '' : 'd-sidebar--collapsed'}`}>
      <div className="d-sidebar__profile">
        <span className="d-sidebar__profile-avatar">VS</span>
        <span className="d-sidebar__profile-info">
          <span className="d-sidebar__profile-name">Vaidya Sharma</span>
          <span className="d-sidebar__profile-loc">Bengaluru, IN</span>
        </span>
      </div>
      <div className="d-sidebar__divider" />

      <div className="d-sidebar__group">
        <nav className="d-sidebar__nav">
          {NAV.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className={`d-sidebar__link ${location.pathname === item.to ? 'd-sidebar__link--active' : ''}`}
            >
              <span className="d-sidebar__icon">
                <item.icon />
              </span>
              <span className="d-sidebar__linklabel">{t(item.key)}</span>
              {item.expandable && <IconChevronRight className="d-sidebar__chevron" />}
            </Link>
          ))}
        </nav>
      </div>

      <div className="d-sidebar__divider" />

      <div className="d-sidebar__group">
        <div className="d-sidebar__pod">
          <div className="d-sidebar__pod-top">
            <div>
              <div className="d-sidebar__pod-label">{t('pod.current')}</div>
              <div className="d-sidebar__pod-name">{kashaya}</div>
            </div>
          </div>
          <span className="d-badge">{t('pod.afiCertified')}</span>

          <div className="d-sidebar__pod-ingredients">
            <div className="d-sidebar__pod-sublabel">
              {t('pod.ingredients')} · {POD_INGREDIENTS.length} {t('pod.roots')}
            </div>
            <div className="d-sidebar__pod-chips">
              {POD_INGREDIENTS.map((name) => (
                <span key={name} className="d-sidebar__pod-chip">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="d-sidebar__spacer" />

      <div className="d-sidebar__group">
        <div className="d-sidebar__divider" />
        <button className="d-sidebar__drmode" onClick={() => setDrMode((v) => !v)}>
          <span className="d-sidebar__avatar">Dr</span>
          <span className="d-sidebar__drmode-label">{t('pod.drMode')}</span>
          <span className={`d-toggle ${drMode ? 'd-toggle--on' : ''}`}>
            <span className="d-toggle__knob" />
          </span>
        </button>
        <button className="d-sidebar__logout" onClick={handleLogout}>
          <IconLogout className="d-sidebar__logout-icon" />
          <span>{t('pod.logout')}</span>
        </button>
      </div>
    </aside>
  );
}
