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
import PatientShell from './PatientShell';
import { usePatient } from './usePatientNav';
import '../portal.css';

const MARK = { taken: '✓', missed: '✗', pending: '●', upcoming: '●', due: '!' };

export default function PatientCompliance() {
  const patient = usePatient();
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
        <h1 className="pt__h1">This week</h1>
        <p className="pt__sub">Every scheduled dose taken keeps your streak alive.</p>
      </div>

      <div className="pt__stats">
        <div className="pt__stat pt__stat--good">
          <span className="pt__stat-value">{stats.pct}%</span>
          <span className="pt__stat-label">Weekly compliance</span>
        </div>
        <div className="pt__stat">
          <span className="pt__stat-value">🔥 {streak}d</span>
          <span className="pt__stat-label">Current streak</span>
        </div>
        <div className="pt__stat">
          <span className="pt__stat-value">{Math.max(streak, patient.bestStreak)}d</span>
          <span className="pt__stat-label">Personal best</span>
        </div>
        <div className="pt__stat">
          <span className="pt__stat-value">{perfect ? '🏅' : '—'}</span>
          <span className="pt__stat-label">{perfect ? 'Perfect Week' : 'Keep going'}</span>
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
              <div className="pt__grid-rowlabel">{slotLabel(slot)}</div>
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
        ✓ taken · ✗ missed · ● upcoming · ! overdue
        {stats.mostMissed && ` · most missed slot: ${slotLabel(stats.mostMissed)}`}
      </p>
    </PatientShell>
  );
}
