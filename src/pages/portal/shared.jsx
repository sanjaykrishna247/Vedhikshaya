import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import { usePortal } from '../../portal/PortalContext';
import { LANGS, useDashLang } from '../dashboard/dashI18n';

// ---------------------------------------------------------------------------
// icons (stroke, 24 grid) — match the dashboard sidebar weight
// ---------------------------------------------------------------------------
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
export const Icon = {
  patients: (<svg viewBox="0 0 24 24" {...S}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><path d="M16 11a3 3 0 1 0 0-6M18 19a5.5 5.5 0 0 0-3-4.9" /></svg>),
  brew: (<svg viewBox="0 0 24 24" {...S}><path d="M6 8h12l-1 9a3 3 0 0 1-3 2.6H10A3 3 0 0 1 7 17z" /><path d="M9 8V5.5M12 8V4M15 8V5.5" /></svg>),
  chat: (<svg viewBox="0 0 24 24" {...S}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5z" /></svg>),
  today: (<svg viewBox="0 0 24 24" {...S}><rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9.5h18M8 3v3M16 3v3" /><circle cx="12" cy="14.5" r="2.2" /></svg>),
  compliance: (<svg viewBox="0 0 24 24" {...S}><path d="M4 20V4M4 20h16" /><rect x="7" y="12" width="3" height="5" /><rect x="13" y="8" width="3" height="9" /></svg>),
  rx: (<svg viewBox="0 0 24 24" {...S}><path d="M6 20V5a1 1 0 0 1 1-1h5a4 4 0 0 1 0 8H6" /><path d="M11 12l6 8M13 15l4-4" /></svg>),
  symptom: (<svg viewBox="0 0 24 24" {...S}><circle cx="12" cy="12" r="9" /><path d="M8.5 10h.01M15.5 10h.01M8.5 15a4 4 0 0 0 7 0" /></svg>),
  bell: (<svg viewBox="0 0 24 24" {...S}><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2.5h-15z" /><path d="M10 19a2 2 0 0 0 4 0" /></svg>),
  logout: (<svg viewBox="0 0 24 24" {...S}><path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" /><path d="M16 17l5-5-5-5M21 12H9" /></svg>),
  back: (<svg viewBox="0 0 24 24" {...S}><path d="M15 5l-7 7 7 7" /></svg>),
  translate: (<svg viewBox="0 0 24 24" {...S}><path d="M4 5h9M8.5 3v2M6 5c0 5 2.5 8 6 9M11 5c0 4-3 8-7 9" /><path d="M13 20l4-9 4 9M14.4 17h5.2" /></svg>),
  check: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4 10-10" /></svg>),
};

// ---------------------------------------------------------------------------
// toast
// ---------------------------------------------------------------------------
const ToastCtx = createContext(() => {});
export function ToastHost({ children }) {
  const [msg, setMsg] = useState('');
  const timer = useRef();
  const flash = useCallback((text) => {
    setMsg(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(''), 2800);
  }, []);
  return (
    <ToastCtx.Provider value={flash}>
      {children}
      {msg && <div className="pt__toast">{msg}</div>}
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

// ---------------------------------------------------------------------------
// modal
// ---------------------------------------------------------------------------
export function Modal({ title, sub, children, onClose, size }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="pt__modal-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`pt__modal ${size === 'sm' ? 'pt__modal--sm' : ''}`} role="dialog" aria-modal="true">
        {title && <div className="pt__modal-title">{title}</div>}
        {sub && <div className="pt__modal-sub">{sub}</div>}
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// relative time
// ---------------------------------------------------------------------------
export function ago(ts) {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}
export function clockTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

// ---------------------------------------------------------------------------
// top-bar icon menus — same language switcher + notifications as the main
// dashboard, restyled to sit flush (no boxed background)
// ---------------------------------------------------------------------------
function NotifBell({ items, onOpen }) {
  const [open, setOpen] = useState(false);
  const unread = items.filter((n) => !n.read).length;
  return (
    <div className="pt__iconwrap">
      <button
        className="pt__iconbtn"
        aria-label="Notifications"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) onOpen?.();
        }}
      >
        {Icon.bell}
        {unread > 0 && <span className="pt__bell-count">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 39 }} onClick={() => setOpen(false)} />
          <div className="pt__notif-panel">
            <div className="pt__notif-head">Notifications</div>
            {items.length === 0 && <div className="pt__notif-empty">You're all caught up.</div>}
            {items.map((n) => (
              <div key={n.id} className={`pt__notif-item ${n.read ? '' : 'is-unread'}`}>
                {n.text}
                <span className="pt__notif-time">{ago(n.at)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function LangMenu() {
  const { lang, setLang } = useDashLang();
  const [open, setOpen] = useState(false);
  return (
    <div className="pt__iconwrap">
      <button className="pt__iconbtn" aria-label="Language" onClick={() => setOpen((v) => !v)}>
        {Icon.translate}
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 39 }} onClick={() => setOpen(false)} />
          <div className="pt__notif-panel pt__lang-panel">
            <div className="pt__notif-head">Language</div>
            {LANGS.map((l) => (
              <button
                key={l.code}
                className={`pt__lang-item ${lang === l.code ? 'is-active' : ''}`}
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
              >
                <span>{l.native}</span>
                <small>{l.label}</small>
                {lang === l.code && <span className="pt__lang-check">{Icon.check}</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// portal shell — topbar + sidebar + main
// ---------------------------------------------------------------------------
// hamburger icon — matches the dashboard's IconMenu weight
const IconMenu = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export function PortalShell({ variant, nav, children }) {
  const { session, portalLogout, doctor, setDoctorAvailability, doctorNotifications, patientNotifications, markNotificationsRead } = usePortal();
  const { t } = useDashLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isDoctor = variant === 'doctor';
  const notifItems = isDoctor ? doctorNotifications : patientNotifications(session?.id);

  // close the drawer on navigation
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // lock background scroll while the drawer is open (same as the dashboard)
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const handleLogout = () => {
    portalLogout();
    navigate('/login', { replace: true });
  };

  const initials = (session?.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="pt">
      <header className="pt__topbar">
        <div className="pt__topbar-left">
          <button
            className="pt__iconbtn pt__burger"
            aria-label="Toggle menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((v) => !v)}
          >
            {IconMenu}
          </button>
          <Link to={isDoctor ? '/doctor/dashboard' : '/patient/dashboard'} className="pt__brand">
            <img src={logo} className="pt__logo" alt="" aria-hidden="true" />
            <span className="pt__wordmark">Vediks<span>haya</span></span>
            <span className="pt__badge">{isDoctor ? 'Doctor' : 'Patient'} Portal</span>
          </Link>
        </div>

        <div className="pt__topbar-right">
          {isDoctor && (
            <button
              className={`pt__avail ${doctor.available ? 'pt__avail--on' : 'pt__avail--off'}`}
              onClick={() => setDoctorAvailability(!doctor.available)}
            >
              <span className="pt__avail-dot" />
              <span className="pt__avail-text">{doctor.available ? t('pt.available') : t('pt.busy')}</span>
            </button>
          )}
          <LangMenu />
          <NotifBell items={notifItems} onOpen={() => markNotificationsRead(isDoctor ? 'doctor' : session?.id)} />
        </div>
      </header>

      <div className="pt__shell">
        <aside className={`pt__side ${drawerOpen ? 'is-open' : ''}`}>
          <div className="pt__profile">
            <span className="pt__profile-avatar">{initials}</span>
            <span className="pt__profile-info">
              <span className="pt__profile-name">{session?.name}</span>
              <span className="pt__profile-sub">{session?.hospital_name}</span>
            </span>
          </div>
          <div className="pt__side-divider" />
          <nav className="pt__nav">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setDrawerOpen(false)}
                className={({ isActive }) => `pt__navlink ${isActive ? 'is-active' : ''}`}
              >
                <span className="pt__navlink-ic">{item.icon}</span>
                <span className="pt__navlink-label">{item.label}</span>
                {item.badge > 0 && <span className="pt__navlink-badge">{item.badge}</span>}
              </NavLink>
            ))}
          </nav>
          <div className="pt__side-spacer" />
          <button className="pt__logout" onClick={handleLogout}>
            {Icon.logout}
            <span>{t('pod.logout')}</span>
          </button>
        </aside>

        {drawerOpen && <div className="pt__scrim" onClick={() => setDrawerOpen(false)} aria-hidden="true" />}

        <main className="pt__main">{children}</main>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// countdown hook — ticks each second
// ---------------------------------------------------------------------------
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(iv);
  }, [intervalMs]);
  return now;
}

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="pt__loading">
      <div className="pt__spinner" />
      {label}
    </div>
  );
}

// small helper: format a patient's initials
export const personInitials = (name) =>
  String(name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export const useMemoNav = (fn, deps) => useMemo(fn, deps); // re-export sugar
