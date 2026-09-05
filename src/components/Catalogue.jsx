import Reveal from './Reveal';
import './Catalogue.css';

const PODS = [
  {
    name: 'Nilavembu Kudineer Chooranam',
    tagline: 'Classical antipyretic formulation for fever and immunity',
  },
  {
    name: 'Tulsi Dalchini Sunthi Marich',
    tagline: 'Warming blend for cold, cough and respiratory comfort',
  },
  {
    name: 'Tulsi-Dalchini-Sunthi-Marich',
    tagline: 'Warming blend for cold, cough and respiratory comfort',
  },
];

export default function Catalogue() {
  return (
    <section id="formulations" className="catalogue">
      <div className="container">
        <Reveal className="section-head left">
          <p className="eyebrow">Formulations</p>
          <h2 className="section-title">Pod Catalogue</h2>
          <p className="section-sub">
            A growing library of classical Kwatha formulations, each encoded for exact brewing
            parameters.
          </p>
        </Reveal>
      </div>

      <Reveal className="catalogue__row">
        {PODS.map((pod) => (
          <div key={pod.name} className="pod-card glass">
            <div className="pod-card__badge">Available in Pod</div>
            <div className="pod-card__visual">
              <div className="pod-card__cap" />
              <div className="pod-card__body" />
            </div>
            <h3 className="pod-card__name">{pod.name}</h3>
            <p className="pod-card__tagline">{pod.tagline}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
