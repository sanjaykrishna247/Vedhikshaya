import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__logo">
          Vediks<span>haya</span>
        </div>
        <p className="footer__tagline">
          Bridging Classical Ayurveda and Modern Precision
        </p>
        <div className="footer__meta">
          <span>SIH 2025</span>
          <span className="dot">•</span>
          <span>Ministry of AYUSH</span>
          <span className="dot">•</span>
          <span>All India Institute of Ayurveda</span>
        </div>
        <p className="footer__copy">© 2026 Vedikshaya. All rights reserved.</p>
      </div>
    </footer>
  );
}
