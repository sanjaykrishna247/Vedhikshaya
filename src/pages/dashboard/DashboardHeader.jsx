import { useState } from 'react';

const RANGES = ['Today', 'Week', 'Month'];

export default function DashboardHeader() {
  const [range, setRange] = useState('Today');

  return (
    <div className="d-header">
      <div>
        <h1 className="d-header__title">Brew Status</h1>
        <p className="d-header__sub">Monitoring Dashamoola Kwatha — Pod #204</p>
      </div>

      <div className="d-header__right">
        <div className="d-segmented">
          {RANGES.map((r) => (
            <button
              key={r}
              className={`d-segmented__btn ${range === r ? 'd-segmented__btn--active' : ''}`}
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="d-avatars">
          <span className="d-avatars__item">Dr</span>
          <span className="d-avatars__item">RS</span>
          <span className="d-avatars__more">+2</span>
        </div>
      </div>
    </div>
  );
}
