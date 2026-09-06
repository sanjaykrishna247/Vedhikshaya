import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortal } from '../../../portal/PortalContext';
import { PortalShell, useToast } from '../shared';
import { useDoctorNav } from './useDoctorNav';
import '../portal.css';

const ERROR_LABEL = {
  TEMP_HIGH: 'Temperature too high',
  TEMP_LOW: 'Temperature too low',
  DRY_RUN: 'Dry run — no water detected',
  BOIL_OVER: 'Boil over',
  SENSOR_FAIL: 'Sensor failure',
};

export default function BrewMonitor() {
  const nav = useDoctorNav();
  const navigate = useNavigate();
  const toast = useToast();
  const { brewFeed, patients, alerts, allAlerts, dismissAlert, triggerAlert, tick } = usePortal();

  const rows = useMemo(
    () =>
      brewFeed.map((b) => ({
        ...b,
        patient: patients.find((p) => p.id === b.patientId),
      })),
    [brewFeed, patients, tick],
  );

  return (
    <PortalShell variant="doctor" nav={nav}>
      <div className="pt__page-head">
        <h1 className="pt__h1">Brew Monitor</h1>
        <p className="pt__sub">Live decoction sessions across your caseload · {rows.length} brewing now</p>
      </div>

      {alerts.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          {alerts.map((a) => (
            <div key={a.id} className="pt__alert">
              <span>
                <strong>{a.patientName}</strong> — {ERROR_LABEL[a.type] || a.type} ·{' '}
                {new Date(a.at).toLocaleTimeString()}
              </span>
              <button className="pt__btn pt__btn--sm" onClick={() => dismissAlert(a.id)}>
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="pt__empty">No patients are brewing right now.</div>
      ) : (
        <div className="pt__patients" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {rows.map((b) => (
            <div key={b.patientId} className={`pt__brewcard ${b.error ? 'has-error' : ''}`}>
              <div className="pt__row">
                <div>
                  <div className="pt__pcard-name">{b.patient?.name || b.patientId}</div>
                  <div className="pt__pcard-id">
                    {b.patientId} · {b.kashaya}
                  </div>
                </div>
                <span className={`pt__pill ${b.error ? 'pt__pill--bad' : 'pt__pill--good'}`}>
                  {b.error ? ERROR_LABEL[b.error] || b.error : b.phase}
                </span>
              </div>

              <div className="pt__brew-metrics">
                <div>
                  <div className="pt__brew-metric-label">Temp</div>
                  <div className="pt__brew-metric-value">{b.tempC}°C</div>
                </div>
                <div>
                  <div className="pt__brew-metric-label">Phase</div>
                  <div className="pt__brew-metric-value">{b.phase}</div>
                </div>
                <div>
                  <div className="pt__brew-metric-label">Remaining</div>
                  <div className="pt__brew-metric-value">{Math.ceil(b.remainingMin)}m</div>
                </div>
                <div>
                  <div className="pt__brew-metric-label">Consistency</div>
                  <div className="pt__brew-metric-value">{b.score}%</div>
                </div>
              </div>

              <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  className="pt__btn pt__btn--sm"
                  onClick={() => navigate(`/doctor/patient/${b.patientId}`)}
                >
                  Open patient
                </button>
                {b.error && (
                  <button
                    className="pt__btn pt__btn--sm pt__btn--danger"
                    onClick={() => {
                      triggerAlert(b.patientId, b.error, `${b.error} during brew session.`);
                      toast('Alert logged');
                    }}
                  >
                    Log alert
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="pt__h2">Alert log</h2>
      <div className="pt__table-wrap">
        <table className="pt__table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Error</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {allAlerts.length === 0 && (
              <tr>
                <td colSpan={4} style={{ color: 'var(--pt-muted)' }}>
                  No alerts logged.
                </td>
              </tr>
            )}
            {allAlerts.map((a) => (
              <tr key={a.id}>
                <td>{a.patientName}</td>
                <td>{ERROR_LABEL[a.type] || a.type}</td>
                <td>{new Date(a.at).toLocaleString()}</td>
                <td>
                  <span className={`pt__pill ${a.dismissed ? 'pt__pill--muted' : 'pt__pill--bad'}`}>
                    {a.dismissed ? 'Dismissed' : 'Open'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}
