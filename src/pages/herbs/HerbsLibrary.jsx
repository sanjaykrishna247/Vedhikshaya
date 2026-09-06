import { Link } from 'react-router-dom';
import { IconChevronRight } from '../dashboard/icons';
import BotanicalIcon from './BotanicalIcon';
import { KASHAYAS } from './herbsData';
import logo from '../../assets/logo.svg';
import './HerbsLibrary.css';

export default function HerbsLibrary() {
  return (
    <div className="hl">
      <header className="hl__header">
        <Link to="/home" className="hl__brand">
          <img src={logo} alt="" className="hl__logo-img" aria-hidden="true" />
          <span className="hl__wordmark">
            Vediks<span>haya</span>
          </span>
        </Link>
        <Link to="/home" className="hl__back">
          ← Home
        </Link>
      </header>

      <main className="hl__main">
        <div className="hl__intro">
          <BotanicalIcon className="hl__watermark" aria-hidden="true" />
          <span className="hl__eyebrow">
            <span className="hl__eyebrow-dot" /> Herbs Library
          </span>
          <h1 className="hl__title">The formulations, and the plants inside them</h1>
          <p className="hl__sub">
            Every Vedikshaya pod encodes a classical Ayurvedic or Siddha formulation. Open one to see
            the herbs it contains, what each does, and where the recipe comes from.
          </p>
        </div>

        <div className="hl__grid">
          {KASHAYAS.map((k) => (
            <Link key={k.slug} to={`/herbs/${k.slug}`} className="hl__card">
              <span className="hl__card-mark">
                <BotanicalIcon />
              </span>
              <span className="hl__card-body">
                <span className="hl__card-tradition">{k.tradition}</span>
                <h3 className="hl__card-name">{k.name}</h3>
                <p className="hl__card-tagline">{k.tagline}</p>
                <span className="hl__card-count">{k.ingredients.length} herbs</span>
              </span>
              <span className="hl__card-cta" aria-hidden="true">
                <IconChevronRight />
              </span>
            </Link>
          ))}
        </div>
      </main>

      <footer className="hl__footer">
        <span>Vedikshaya</span>
        <span className="hl__footer-dot">•</span>
        <span>Sourced to classical texts &amp; AYUSH guidance</span>
      </footer>
    </div>
  );
}
