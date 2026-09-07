import { Fragment, useMemo } from 'react';
import { lastNDates } from '../../../portal/portalData';
import {
  activeSlots,
  complianceStats,
  currentStreak,
  doseStatus,
  isPerfectWeek,
  slotLabel,
} from '../../../portal/portalLogic';
import { usePortal } from '../../../portal/PortalContext';
import { Loading } from '../shared';
import { useDashLang } from '../../dashboard/dashI18n';
import PatientShell from './PatientShell';
import { usePatient } from './usePatientNav';
import '../portal.css';

const MARK = { taken: '✓', missed: '✗', pending: '●', upcoming: '●', due: '!' };

export default function PatientCompliance() {
  const patient = usePatient();
  const { t } = useDashLang();
  const { tick } = usePortal();
  const stats = useMemo(() => (patient ? complianceStats(patient) : null), [patient, tick]);
  const streak = useMemo(() => (patient ? currentStreak(patient) : 0), [patient, tick]);
  const days = lastNDates(7);

  if (!patient) return <PatientShell><Loading /></PatientShell>;

  const slots = activeSlots(patient.prescription.schedule);
  const perfect = isPerfectWeek(patient);

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
          <span className="pt__stat-value">🔥 {streak}{t('ppd.dayShort')}</span>
          <span className="pt__stat-label">{t('pc.currentStreak')}</span>
        </div>
        <div className="pt__stat">
          <span className="pt__stat-value">{Math.max(streak, patient.bestStreak)}{t('ppd.dayShort')}</span>
          <span className="pt__stat-label">{t('pc.personalBest')}</span>
        </div>
        <div className="pt__stat">
          <span className="pt__stat-value">{perfect ? '🏅' : '—'}</span>
          <span className="pt__stat-label">{perfect ? t('pc.perfectWeek') : t('pc.keepGoing')}</span>
        </div>
      </div>

      <div className="pt__card" style={{ marginTop: 18 }}>
        <div className="pt__grid">
          <div className="pt__grid-h" />
          {days.map((d) => (
            <div key={d} className="pt__grid-h">
              {new Date(d).toLocaleDateString([], { weekday: 'short' })}
              <br />
              {d.slice(8)}
            </div>
          ))}
          {slots.map((slot) => (
            <Fragment key={slot}>
              <div className="pt__grid-rowlabel">{t(`slot.${slot}`)}</div>
              {days.map((d) => {
                const st = doseStatus(patient, d, slot);
                return (
                  <div key={`${slot}-${d}`} className={`pt__cell pt__cell--${st}`} title={`${d} · ${st}`}>
                    {MARK[st] || '·'}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      <p className="pt__sub" style={{ marginTop: 14 }}>
        {t('pc.legend')}
        {stats.mostMissed && ` · ${t('pc.mostMissed', { slot: t(`slot.${stats.mostMissed}`) })}`}
      </p>
    </PatientShell>
  );
}
