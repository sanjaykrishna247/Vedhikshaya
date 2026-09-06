import { Link, useParams, Navigate } from 'react-router-dom';
import BotanicalIcon from './BotanicalIcon';
import { getKashaya } from './herbsData';
import logo from '../../assets/logo.svg';
import './HerbsLibrary.css';

export default function KashayaDetail() {
  const { slug } = useParams();
  const k = getKashaya(slug);

  if (!k) return <Navigate to="/herbs" replace />;

  return (
    <div className="hl">
      <header className="hl__header">
        <Link to="/home" className="hl__brand">
          <img src={logo} alt="" className="hl__logo-img" aria-hidden="true" />
          <span className="hl__wordmark">
            Vediks<span>haya</span>
          </span>
        </Link>
        <Link to="/herbs" className="hl__back">
          ← Herbs Library
        </Link>
      </header>

      <main className="hl__main hl__detail">
        <div className="hl__hero">
          <BotanicalIcon className="hl__watermark hl__watermark--hero" aria-hidden="true" />
          <span className="hl__eyebrow">
            <span className="hl__eyebrow-dot" /> {k.tradition}
          </span>
          <h1 className="hl__title">{k.name}</h1>
          <p className="hl__sub">{k.tagline}</p>
          <p className="hl__lead">{k.summary}</p>
        </div>

        <section className="hl__section">
          <h2 className="hl__h2">
            <BotanicalIcon /> Herbs used ({k.ingredients.length})
          </h2>
          <div className="hl__herbs">
            {k.ingredients.map((h, i) => (
              <article key={h.name} className="hl__herb">
                <span className="hl__herb-num">{String(i + 1).padStart(2, '0')}</span>
                <div className="hl__herb-head">
                  <h3 className="hl__herb-name">{h.name}</h3>
                  <span className="hl__herb-botanical">{h.botanical}</span>
                </div>
                <p className="hl__herb-part">
                  <span>Part used</span> {h.part}
                </p>
                <p className="hl__herb-role">{h.role}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="hl__section">
          <h2 className="hl__h2">History &amp; origin</h2>
          {k.history.map((para, i) => (
            <p key={i} className="hl__para">
              {para}
            </p>
          ))}
        </section>

        <section className="hl__section">
          <h2 className="hl__h2">Why it matters today</h2>
          <p className="hl__para">{k.modern}</p>
        </section>

        <section className="hl__section">
          <h2 className="hl__h2">How it&apos;s prepared</h2>
          <p className="hl__para">{k.prep}</p>
        </section>

        <section className="hl__section">
          <h2 className="hl__h2">References</h2>
          <ul className="hl__refs">
            {k.references.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>

        <Link to="/herbs" className="hl__detail-back">
          ← Back to all formulations
        </Link>
      </main>
    </div>
  );
}
