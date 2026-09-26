import { Fragment, useMemo } from 'react';
import { lastNDates } from '../../../portal/portalData';
import {
  activeSlots,
  complianceStats,
  currentStreak,
  doseStatus,
} from '../../../portal/portalLogic';
import { usePortal } from '../../../portal/PortalContext';
import { Loading } from '../shared';
import { useDashLang } from '../../dashboard/dashI18n';
import PatientShell from './PatientShell';
import { usePatient } from './usePatientNav';
import '../portal.css';

const LEGEND = [
  ['taken', 'ppd.legendTaken'],
  ['due', 'ppd.legendDue'],
  ['missed', 'ppd.legendMissed'],
  ['upcoming', 'ppd.legendUpcoming'],
  ['unlogged', 'ppd.legendNotLogged'],
];

export default function PatientCompliance() {
  const patient = usePatient();
  const { t } = useDashLang();
  const { tick } = usePortal();
  const stats = useMemo(() => (patient ? complianceStats(patient) : null), [patient, tick]);
  const streak = useMemo(() => (patient ? currentStreak(patient) : 0), [patient, tick]);
  const days = lastNDates(7);

  if (!patient) return <PatientShell><Loading /></PatientShell>;

  const slots = activeSlots(patient.prescription.schedule);
  const todayStr = days[days.length - 1];

  return (
    <PatientShell>
      <div className="pt__page-head">
        <h1 className="pt__h1">{t('pc.thisWeek')}</h1>
        <p className="pt__sub">{t('pc.sub')}</p>
      </div>

      <div className="pt__stats">
        <div className="pt__stat pt__stat--good">
          <span className="pt__stat-value">{stats.pct}%</span>
          <span className="pt__stat-label">{t('pc.weeklyCompliance')}</span>
        </div>
        <div className="pt__stat">
          <span className="pt__stat-value">{stats.taken}/{stats.scheduled}</span>
          <span className="pt__stat-label">{t('ppd.dosesTaken')}</span>
        </div>
        <div className="pt__stat">
          <span className="pt__stat-value">{streak}{t('ppd.dayShort')}</span>
          <span className="pt__stat-label">{t('pc.currentStreak')}</span>
        </div>
        <div className="pt__stat">
          <span className="pt__stat-value">{Math.max(streak, patient.bestStreak)}{t('ppd.dayShort')}</span>
          <span className="pt__stat-label">{t('pc.personalBest')}</span>
        </div>
      </div>

      <div className="pt__card" style={{ marginTop: 14 }}>
        <div className="pt__grid" style={{ gridTemplateColumns: `96px repeat(${days.length}, minmax(0, 1fr))` }}>
          <div className="pt__grid-h" />
          {days.map((d) => {
            const dt = new Date(`${d}T00:00:00`);
            return (
              <div key={d} className={`pt__grid-h ${d === todayStr ? 'is-today' : ''}`}>
                <small>{dt.toLocaleDateString([], { weekday: 'short' })}</small>
                <b>{dt.getDate()}</b>
              </div>
            );
          })}
          {slots.map((slot) => (
            <Fragment key={slot}>
              <div className="pt__grid-rowlabel">{t(`slot.${slot}`)}</div>
              {days.map((d) => {
                const raw = doseStatus(patient, d, slot);
                const st = raw === 'pending' ? 'unlogged' : raw;
                return <div key={`${slot}-${d}`} className={`pt__cell pt__cell--${st}`} title={`${d} · ${st}`} />;
              })}
            </Fragment>
          ))}
        </div>

        <div className="pt__grid-foot">
          <span className="pt__legend">
            {LEGEND.map(([k, key]) => (
              <span key={k}>
                <i className={`pt__legend-dot is-${k}`} />
                {t(key)}
              </span>
            ))}
          </span>
          {stats.mostMissed && (
            <span className="pt__grid-note">{t('pc.mostMissed', { slot: t(`slot.${stats.mostMissed}`) })}</span>
          )}
        </div>
      </div>
    </PatientShell>
  );
}
