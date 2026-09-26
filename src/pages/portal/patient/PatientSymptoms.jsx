import { useMemo, useState } from 'react';
import { SYMPTOM_OPTIONS, lastNDates, todayYmd } from '../../../portal/portalData';
import { usePortal } from '../../../portal/PortalContext';
import { Loading, useToast, ago } from '../shared';
import { useDashLang } from '../../dashboard/dashI18n';
import PatientShell from './PatientShell';
import { usePatient } from './usePatientNav';
import '../portal.css';

const optByValue = (v) => SYMPTOM_OPTIONS.find((o) => o.value === v);
const TREND_DAYS = 14;

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

  const trendDays = useMemo(() => lastNDates(TREND_DAYS), []);

  if (!patient) return <PatientShell><Loading /></PatientShell>;

  const submit = () => {
    if (!feeling) return;
    logSymptom(patient.id, feeling, note);
    toast("Today's check-in saved");
  };

  const fmtDate = (d) => new Date(`${d}T00:00:00`).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <PatientShell>
      <div className="pt__page-head">
        <h1 className="pt__h1">{t('ps.title')}</h1>
        <p className="pt__sub">{t('ps.sub')}</p>
      </div>

      {todayLog ? (
        <section className="pt__card pt-sym__logged">
          <span className={`pt-sym__score is-s${optByValue(todayLog.feeling)?.score}`} />
          <div>
            <div className="pt-sym__logged-label">{symLabel(todayLog.feeling)}</div>
            {todayLog.note && <p className="pt-sym__logged-note">“{todayLog.note}”</p>}
            <p className="pt-sym__logged-meta">{t('ps.loggedAgo', { t: ago(todayLog.at) })}</p>
          </div>
        </section>
      ) : (
        <section className="pt__card">
          <div className="pt-sym__scale" role="radiogroup" aria-label={t('ps.colFeeling')}>
            {[...SYMPTOM_OPTIONS].reverse().map((o) => (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={feeling === o.value}
                onClick={() => setFeeling(o.value)}
                className={`pt-sym__opt is-s${o.score} ${feeling === o.value ? 'is-on' : ''}`}
              >
                <i />
                {symLabel(o.value)}
              </button>
            ))}
          </div>
          <div className="pt__field" style={{ marginTop: 18 }}>
            <span className="pt__label">{t('ps.optionalNote')}</span>
            <textarea
              className="pt__textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('ps.notePlaceholder')}
            />
          </div>
          <button className="pt__btn pt__btn--primary" style={{ marginTop: 14 }} disabled={!feeling} onClick={submit}>
            {t('ps.submit')}
          </button>
        </section>
      )}

      <h2 className="pt__h2">{t('ps.recent')}</h2>
      <section className="pt__card">
        <div className="pt-sym__trend" aria-hidden="true">
          {trendDays.map((d) => {
            const s = optByValue(patient.symptoms?.[d]?.feeling)?.score;
            return (
              <span key={d} className="pt-sym__trend-col" title={fmtDate(d)}>
                <i className={s ? `is-s${s}` : 'is-empty'} style={{ height: s ? `${s * 20}%` : undefined }} />
                <small>{new Date(`${d}T00:00:00`).getDate()}</small>
              </span>
            );
          })}
        </div>

        {history.length === 0 ? (
          <p className="pt-sec__text" style={{ color: 'var(--tk-muted)', marginTop: 16 }}>{t('ps.noCheckins')}</p>
        ) : (
          <ul className="pt-sym__list">
            {history.map(([date, s]) => (
              <li key={date}>
                <span className="pt-sym__list-date">{fmtDate(date)}</span>
                <span className="pt-sym__list-feel">
                  <i className={`pt-sym__dot is-s${optByValue(s.feeling)?.score}`} />
                  {symLabel(s.feeling)}
                </span>
                <span className="pt-sym__list-note">{s.note || '—'}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PatientShell>
  );
}
