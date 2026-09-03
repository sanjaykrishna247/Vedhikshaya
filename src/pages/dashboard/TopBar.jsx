import { Link } from 'react-router-dom';
import {
  IconLeaf,
  IconMenu,
  IconSearch,
  IconSliders,
  IconGlobe,
  IconCloud,
  IconExpand,
  IconGrid,
  IconChat,
  IconBell,
  IconChevronDown,
} from './icons';

export default function TopBar({ onMenuClick }) {
  return (
    <header className="d-topbar">
      <div className="d-topbar__left">
        <button className="d-topbar__icon-btn d-topbar__burger" aria-label="Toggle sidebar" onClick={onMenuClick}>
          <IconMenu />
        </button>

        <Link to="/" className="d-topbar__brand">
          <span className="d-topbar__mark">
            <IconLeaf />
          </span>
          <span className="d-topbar__brandtext">
            <span className="d-topbar__name">Vedikshaya</span>
            <span className="d-topbar__tag">Brew Console</span>
          </span>
        </Link>
      </div>

      <div className="d-topbar__search">
        <IconSearch className="d-topbar__search-icon" />
        <input type="text" placeholder="Search pods, sensors, brews..." />
        <IconSliders className="d-topbar__search-filter" />
      </div>

      <div className="d-topbar__right">
        <button className="d-topbar__icon-btn d-topbar__icon-btn--text">EN</button>
        <button className="d-topbar__icon-btn" aria-label="Translate">
          <IconGlobe />
        </button>
        <button className="d-topbar__icon-btn" aria-label="Sync status">
          <IconCloud />
        </button>
        <button className="d-topbar__icon-btn" aria-label="Fullscreen">
          <IconExpand />
        </button>
        <button className="d-topbar__icon-btn" aria-label="Apps">
          <IconGrid />
        </button>
        <button className="d-topbar__icon-btn d-topbar__icon-btn--badge" aria-label="Messages">
          <IconChat />
          <span className="d-topbar__badge">3</span>
        </button>
        <button className="d-topbar__icon-btn d-topbar__icon-btn--badge" aria-label="Notifications">
          <IconBell />
          <span className="d-topbar__badge d-topbar__badge--alert" />
        </button>

        <button className="d-topbar__profile">
          <span className="d-topbar__profile-avatar">VS</span>
          <span className="d-topbar__profile-info">
            <span className="d-topbar__profile-name">Vaidya Sharma</span>
            <span className="d-topbar__profile-loc">Bengaluru, IN</span>
          </span>
          <IconChevronDown className="d-topbar__profile-chevron" />
        </button>
      </div>
    </header>
  );
}
