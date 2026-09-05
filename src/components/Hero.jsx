import logo from '../assets/logo.svg';
import './Hero.css';

export default function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="container hero__content">
        <div className="hero__brand">
          <img src={logo} alt="" className="hero__logo-img" aria-hidden="true" />
          <span className="hero__brand-name">
            Vediks<span>haya</span>
          </span>
        </div>
        <p className="eyebrow hero__eyebrow">Smart Ayurvedic Brewing</p>
        <h1 className="hero__title">
          Vedik<span className="glow-text">shaya</span>
        </h1>
        <p className="hero__subtitle">Ancient Wisdom. Brewed by Intelligence.</p>
        <p className="hero__desc">
          A pod-based Kwatha maker that reduces classical Ayurvedic formulations to
          pharmacopoeia-grade precision — every dose, every time.
        </p>
        <div className="hero__actions">
          <a href="#about" className="btn btn-primary">
            Discover the Future of Kadha
          </a>
          <a href="#how-it-works" className="btn btn-outline">
            See How It Works
          </a>
        </div>
      </div>

      <a href="#about" className="hero__scroll" aria-label="Scroll to next section">
        <span />
      </a>
    </section>
  );
}
