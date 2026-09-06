import { useMemo, useState } from 'react';
import { SYMPTOM_OPTIONS, todayYmd } from '../../../portal/portalData';
import { usePortal } from '../../../portal/PortalContext';
import { Loading, useToast, ago } from '../shared';
import PatientShell from './PatientShell';
import { usePatient } from './usePatientNav';
import '../portal.css';

const optByValue = (v) => SYMPTOM_OPTIONS.find((o) => o.value === v);

export default function PatientSymptoms() {
  const patient = usePatient();
  const toast = useToast();
  const { logSymptom, tick } = usePortal();
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
        <h1 className="pt__h1">How are you feeling today?</h1>
        <p className="pt__sub">One check-in per day — your doctor sees the trend.</p>
      </div>

      {todayLog ? (
        <div className="pt__card">
          <div style={{ fontSize: '2rem' }}>{optByValue(todayLog.feeling)?.emoji}</div>
          <div style={{ fontWeight: 700, marginTop: 4 }}>{optByValue(todayLog.feeling)?.label}</div>
          {todayLog.note && (
            <p style={{ color: 'var(--pt-body)', fontSize: '0.9rem', marginTop: 8 }}>"{todayLog.note}"</p>
          )}
          <p className="pt__sub" style={{ marginTop: 8 }}>Logged {ago(todayLog.at)} · come back tomorrow.</p>
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
                <div className="pt__badge-title">{o.label}</div>
              </button>
            ))}
          </div>
          <div className="pt__field" style={{ marginTop: 14 }}>
            <span className="pt__label">Optional note</span>
            <textarea
              className="pt__textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything you want your doctor to know…"
            />
          </div>
          <button className="pt__btn pt__btn--primary" style={{ marginTop: 12 }} disabled={!feeling} onClick={submit}>
            Submit check-in
          </button>
        </div>
      )}

      <h2 className="pt__h2">Recent check-ins</h2>
      <div className="pt__table-wrap">
        <table className="pt__table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Feeling</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 && (
              <tr>
                <td colSpan={3} style={{ color: 'var(--pt-muted)' }}>No check-ins yet.</td>
              </tr>
            )}
            {history.map(([date, s]) => (
              <tr key={date}>
                <td>{date}</td>
                <td>
                  {optByValue(s.feeling)?.emoji} {optByValue(s.feeling)?.label}
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
