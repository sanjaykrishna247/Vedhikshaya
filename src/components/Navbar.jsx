import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const LINKS = [
  { href: '#about', label: 'About' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#pod-system', label: 'Pod System' },
  { href: '#dashboard', label: 'Dashboard' },
  { href: '#formulations', label: 'Formulations' },
  { href: '#compliance', label: 'Compliance' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLinkClick = () => setOpen(false);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        <a href="#hero" className="navbar__logo">
          Vediks<span>haya</span>
        </a>

        <nav className={`navbar__links ${open ? 'navbar__links--open' : ''}`}>
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={handleLinkClick}>
              {link.label}
            </a>
          ))}
          <Link to="/dashboard" className="btn btn-primary navbar__cta" onClick={handleLinkClick}>
            Live Dashboard
          </Link>
        </nav>

        <button
          className={`navbar__burger ${open ? 'navbar__burger--open' : ''}`}
          aria-label="Toggle navigation menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
