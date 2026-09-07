import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import { IconMenu, IconSearch, IconSliders, IconTranslateHi, IconBell } from './icons';
import { LANGS, useDashLang } from './dashI18n';

const IconCheck = (p) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}>
    <path d="M5 13l4 4 10-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ALERTS = [
  { dot: 'green', text: 'Soaking complete — boil started', time: '9 min ago' },
  { dot: 'yellow', text: 'Stir mechanism active', time: '3 min ago' },
  { dot: 'green', text: 'pH within AFI range', time: 'Just now' },
];

export default function TopBar({ onMenuClick }) {
  const { lang, setLang } = useDashLang();
  const [notifOpen, setNotifOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const notifRef = useRef(null);
  const langRef = useRef(null);

  useEffect(() => {
    if (!notifOpen && !langOpen) return undefined;
    const onDocClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setNotifOpen(false);
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [notifOpen, langOpen]);

  return (
    <header className="d-topbar">
      <div className="d-topbar__left">
        <button className="d-topbar__icon-btn d-topbar__burger" aria-label="Toggle sidebar" onClick={onMenuClick}>
          <IconMenu />
        </button>

        <Link to="/" className="d-topbar__brand">
          <img src={logo} alt="" className="d-topbar__logo-img" aria-hidden="true" />
          <span className="d-topbar__brandtext">
            <span className="d-topbar__name">
              Vediks<span>haya</span>
            </span>
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
        <div className="d-topbar__lang" ref={langRef}>
          <button
            className={`d-topbar__icon-btn d-topbar__icon-btn--lg ${langOpen ? 'is-open' : ''}`}
            aria-label="Language"
            aria-expanded={langOpen}
            onClick={() => setLangOpen((v) => !v)}
          >
            <IconTranslateHi />
          </button>

          {langOpen && (
            <div className="d-notif d-lang" role="dialog" aria-label="Choose language">
              <div className="d-notif__head">
                <span>Language</span>
              </div>
              <div className="d-notif__list">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    className={`d-lang__item ${lang === l.code ? 'is-selected' : ''}`}
                    onClick={() => {
                      setLang(l.code);
                      setLangOpen(false);
                    }}
                  >
                    <span className="d-lang__native">{l.native}</span>
                    <span className="d-lang__label">{l.label}</span>
                    {lang === l.code && <IconCheck className="d-lang__check" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="d-topbar__notif" ref={notifRef}>
          <button
            className={`d-topbar__icon-btn d-topbar__icon-btn--lg d-topbar__icon-btn--badge ${
              notifOpen ? 'is-open' : ''
            }`}
            aria-label="Notifications"
            aria-expanded={notifOpen}
            onClick={() => setNotifOpen((v) => !v)}
          >
            <IconBell />
            <span className="d-topbar__badge d-topbar__badge--alert" />
          </button>

          {notifOpen && (
            <div className="d-notif" role="dialog" aria-label="Notifications">
              <div className="d-notif__head">
                <span>Notifications</span>
                <span className="d-notif__count">{ALERTS.length}</span>
              </div>
              <div className="d-notif__list">
                {ALERTS.map((a, i) => (
                  <div key={i} className="d-notif__item">
                    <span className={`d-notif__dot d-notif__dot--${a.dot}`} />
                    <span className="d-notif__text">{a.text}</span>
                    <span className="d-notif__time">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
