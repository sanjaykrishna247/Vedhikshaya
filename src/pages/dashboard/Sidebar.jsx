import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconPod, IconThermo, IconChat, IconHistory, IconChevronRight, IconLogout } from './icons';
import { useAuth } from '../../auth/AuthContext';

const NAV = [
  { icon: IconPod, label: 'Brew Status', active: true, expandable: true },
  { icon: IconThermo, label: 'Sensors', expandable: true },
  { icon: IconChat, label: 'AI Assistant' },
  { icon: IconHistory, label: 'Brew History', expandable: true },
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
  const navigate = useNavigate();

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
            <a
              key={item.label}
              href="#"
              className={`d-sidebar__link ${item.active ? 'd-sidebar__link--active' : ''}`}
              onClick={(e) => e.preventDefault()}
            >
              <span className="d-sidebar__icon">
                <item.icon />
              </span>
              <span className="d-sidebar__linklabel">{item.label}</span>
              {item.expandable && <IconChevronRight className="d-sidebar__chevron" />}
            </a>
          ))}
        </nav>
      </div>

      <div className="d-sidebar__divider" />

      <div className="d-sidebar__group">
        <div className="d-sidebar__pod">
          <div className="d-sidebar__pod-top">
            <span className="d-sidebar__pod-mark">
              <IconPod />
            </span>
            <div>
              <div className="d-sidebar__pod-label">Current Pod</div>
              <div className="d-sidebar__pod-name">Dashamoola Kwatha</div>
            </div>
          </div>
          <span className="d-badge">AFI Certified</span>

          <div className="d-sidebar__pod-ingredients">
            <div className="d-sidebar__pod-sublabel">
              Ingredients · {POD_INGREDIENTS.length} roots
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
          <span className="d-sidebar__drmode-label">Dr. Mode</span>
          <span className={`d-toggle ${drMode ? 'd-toggle--on' : ''}`}>
            <span className="d-toggle__knob" />
          </span>
        </button>
        <button className="d-sidebar__logout" onClick={handleLogout}>
          <IconLogout className="d-sidebar__logout-icon" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
