import { useState } from 'react';
import { IconPod, IconThermo, IconChat, IconHistory, IconChevronRight } from './icons';

const NAV = [
  { icon: IconPod, label: 'Brew Status', active: true, expandable: true },
  { icon: IconThermo, label: 'Sensors', expandable: true },
  { icon: IconChat, label: 'AI Assistant' },
  { icon: IconHistory, label: 'Brew History', expandable: true },
];

export default function Sidebar({ open = true }) {
  const [drMode, setDrMode] = useState(false);

  return (
    <aside className={`d-sidebar ${open ? '' : 'd-sidebar--collapsed'}`}>
      <div className="d-sidebar__section-label">
        <IconPod className="d-sidebar__section-icon" />
        Main navigation
      </div>

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

      <div className="d-sidebar__section-label d-sidebar__section-label--apps">Applications</div>

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
      </div>

      <button className="d-sidebar__drmode" onClick={() => setDrMode((v) => !v)}>
        <span className="d-sidebar__avatar">Dr</span>
        <span className="d-sidebar__drmode-label">Dr. Mode</span>
        <span className={`d-toggle ${drMode ? 'd-toggle--on' : ''}`}>
          <span className="d-toggle__knob" />
        </span>
      </button>
    </aside>
  );
}
