import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortal } from '../../../portal/PortalContext';
import { PortalShell, useToast } from '../shared';
import { useDoctorNav } from './useDoctorNav';
import { useDashLang } from '../../dashboard/dashI18n';
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
  const { t } = useDashLang();
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
        <h1 className="pt__h1">{t('bm.title')}</h1>
        <p className="pt__sub">{t('bm.sub', { n: rows.length })}</p>
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
                {t('bm.dismiss')}
              </button>
            </div>
          ))}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="pt__empty">{t('bm.noBrewing')}</div>
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
                  <div className="pt__brew-metric-label">{t('bm.temp')}</div>
                  <div className="pt__brew-metric-value">{b.tempC}°C</div>
                </div>
                <div>
                  <div className="pt__brew-metric-label">{t('bm.phase')}</div>
                  <div className="pt__brew-metric-value">{b.phase}</div>
                </div>
                <div>
                  <div className="pt__brew-metric-label">{t('bm.remaining')}</div>
                  <div className="pt__brew-metric-value">{Math.ceil(b.remainingMin)}m</div>
                </div>
                <div>
                  <div className="pt__brew-metric-label">{t('bm.consistency')}</div>
                  <div className="pt__brew-metric-value">{b.score}%</div>
                </div>
              </div>

              <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  className="pt__btn pt__btn--sm"
                  onClick={() => navigate(`/doctor/patient/${b.patientId}`)}
                >
                  {t('bm.openPatient')}
                </button>
                {b.error && (
                  <button
                    className="pt__btn pt__btn--sm pt__btn--danger"
                    onClick={() => {
                      triggerAlert(b.patientId, b.error, `${b.error} during brew session.`);
                      toast('Alert logged');
                    }}
                  >
                    {t('bm.logAlert')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="pt__h2">{t('bm.alertLog')}</h2>
      <div className="pt__table-wrap">
        <table className="pt__table">
          <thead>
            <tr>
              <th>{t('dd.colPatient')}</th>
              <th>{t('bm.colError')}</th>
              <th>{t('bm.colTime')}</th>
              <th>{t('bm.colStatus')}</th>
            </tr>
          </thead>
          <tbody>
            {allAlerts.length === 0 && (
              <tr>
                <td colSpan={4} style={{ color: 'var(--pt-muted)' }}>
                  {t('bm.noAlerts')}
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
                    {a.dismissed ? t('bm.dismissed') : t('bm.open')}
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
