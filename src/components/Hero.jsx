import './Hero.css';

export default function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero__orb" aria-hidden="true" />
      <div className="hero__grid" aria-hidden="true" />

      <div className="hero__pod hero__pod--left" aria-hidden="true">
        <div className="pod-shape">
          <div className="pod-shape__band" />
        </div>
      </div>
      <div className="hero__pod hero__pod--right" aria-hidden="true">
        <div className="pod-shape pod-shape--alt">
          <div className="pod-shape__band" />
        </div>
      </div>

      <div className="container hero__content">
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
