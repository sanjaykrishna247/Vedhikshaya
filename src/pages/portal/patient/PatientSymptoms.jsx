import { useMemo, useState } from 'react';
import { SYMPTOM_OPTIONS, todayYmd } from '../../../portal/portalData';
import { usePortal } from '../../../portal/PortalContext';
import { Loading, useToast, ago } from '../shared';
import { useDashLang } from '../../dashboard/dashI18n';
import PatientShell from './PatientShell';
import { usePatient } from './usePatientNav';
import '../portal.css';

const optByValue = (v) => SYMPTOM_OPTIONS.find((o) => o.value === v);

export default function PatientSymptoms() {
  const patient = usePatient();
  const toast = useToast();
  const { t } = useDashLang();
  const { logSymptom, tick } = usePortal();
  const symLabel = (v) => t(`sym.${v}`);
  const [feeling, setFeeling] = useState(null);
  const [note, setNote] = useState('');

  const today = todayYmd();
  const todayLog = patient?.symptoms?.[today] || null;

  const history = useMemo(() => {
    if (!patient) return [];
    return Object.entries(patient.symptoms)
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .slice(0, 14);
  }, [patient, tick]);

  if (!patient) return <PatientShell><Loading /></PatientShell>;

  const submit = () => {
    if (!feeling) return;
    logSymptom(patient.id, feeling, note);
    toast("Today's check-in saved");
  };

  return (
    <PatientShell>
      <div className="pt__page-head">
        <h1 className="pt__h1">{t('ps.title')}</h1>
        <p className="pt__sub">{t('ps.sub')}</p>
      </div>

      {todayLog ? (
        <div className="pt__card">
          <div style={{ fontSize: '2rem' }}>{optByValue(todayLog.feeling)?.emoji}</div>
          <div style={{ fontWeight: 700, marginTop: 4 }}>{symLabel(todayLog.feeling)}</div>
          {todayLog.note && (
            <p style={{ color: 'var(--pt-body)', fontSize: '0.9rem', marginTop: 8 }}>"{todayLog.note}"</p>
          )}
          <p className="pt__sub" style={{ marginTop: 8 }}>{t('ps.loggedAgo', { t: ago(todayLog.at) })}</p>
        </div>
      ) : (
        <div className="pt__card">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {SYMPTOM_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setFeeling(o.value)}
                className={`pt__badge-card ${feeling === o.value ? '' : 'is-locked'}`}
                style={{ cursor: 'pointer', flex: '1 1 120px' }}
              >
                <div className="pt__badge-emoji">{o.emoji}</div>
                <div className="pt__badge-title">{symLabel(o.value)}</div>
              </button>
            ))}
          </div>
          <div className="pt__field" style={{ marginTop: 14 }}>
            <span className="pt__label">{t('ps.optionalNote')}</span>
            <textarea
              className="pt__textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('ps.notePlaceholder')}
            />
          </div>
          <button className="pt__btn pt__btn--primary" style={{ marginTop: 12 }} disabled={!feeling} onClick={submit}>
            {t('ps.submit')}
          </button>
        </div>
      )}

      <h2 className="pt__h2">{t('ps.recent')}</h2>
      <div className="pt__table-wrap">
        <table className="pt__table">
          <thead>
            <tr>
              <th>{t('ps.colDate')}</th>
              <th>{t('ps.colFeeling')}</th>
              <th>{t('ps.colNote')}</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 && (
              <tr>
                <td colSpan={3} style={{ color: 'var(--pt-muted)' }}>{t('ps.noCheckins')}</td>
              </tr>
            )}
            {history.map(([date, s]) => (
              <tr key={date}>
                <td>{date}</td>
                <td>
                  {optByValue(s.feeling)?.emoji} {symLabel(s.feeling)}
                </td>
                <td>{s.note || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PatientShell>
  );
}
