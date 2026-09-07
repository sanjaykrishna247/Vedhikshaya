import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortal } from '../../../portal/PortalContext';
import { BADGES, KASHAYAS } from '../../../portal/portalData';
import {
  activeSlots,
  badgeProgress,
  canStartBrew,
  complianceStats,
  currentStreak,
  doseStatus,
  humanCountdown,
  minutesUntil,
  slotLabel,
} from '../../../portal/portalLogic';
import { Modal, Loading, useToast, useNow } from '../shared';
import { useBrewSim } from '../../dashboard/BrewSim';
import PatientShell from './PatientShell';
import { usePatient } from './usePatientNav';
import '../portal.css';

export default function PatientDashboard() {
  const patient = usePatient();
  const navigate = useNavigate();
  const toast = useToast();
  const now = useNow(1000);
  const { markDose, tick } = usePortal();
  const { start: startBrew } = useBrewSim();

  const [confirm, setConfirm] = useState(null); // { slot, scheduled, late }
  const [brew, setBrew] = useState(null); // { slot }

  const stats = useMemo(() => (patient ? complianceStats(patient) : null), [patient, tick]);
  const streak = useMemo(() => (patient ? currentStreak(patient) : 0), [patient, tick]);
  const badges = badgeProgress(streak);

  if (!patient) return <PatientShell><Loading label="Loading your dashboard…" /></PatientShell>;

  const slots = activeSlots(patient.prescription.schedule);
  const today = new Date().toISOString().slice(0, 10);

  const doMark = (slot, scheduledTime, brewId) => {
    markDose(patient.id, slot, { scheduledTime, takenAt: Date.now(), brewSessionId: brewId || null });
    setConfirm(null);
    toast(`${slotLabel(slot)} dose logged`);
  };

  return (
    <PatientShell>
      <div className="pt__page-head">
        <h1 className="pt__h1">Today's doses</h1>
        <p className="pt__sub">
          {patient.prescription.kashaya} · Week {patient.prescription.weekOf} of {patient.prescription.durationWeeks}
        </p>
      </div>

      <div className="pt__doses">
        {slots.map((slot) => {
          const sched = patient.prescription.schedule[slot];
          const st = doseStatus(patient, today, slot, now);
          const meta = patient.compliance?.[today]?.[`${slot}_meta`];
          const mins = minutesUntil(sched.time, now);
          const armed = canStartBrew(patient, slot, now);

          return (
            <div key={slot} className={`pt__dose ${st === 'due' ? 'pt__dose--due' : ''} ${st === 'taken' ? 'pt__dose--taken' : ''}`}>
              <span className="pt__dose-slot">{slotLabel(slot)}</span>
              <span className="pt__dose-kashaya">{patient.prescription.kashaya}</span>
              <span className="pt__dose-meta">
                {sched.time} · {sched.food} food
              </span>

              {st === 'upcoming' && (
                <>
                  <span className="pt__dose-countdown">in {humanCountdown(mins)}</span>
                  <button
                    className="pt__btn pt__btn--primary pt__btn--block"
                    disabled={!armed}
                    onClick={() => setBrew({ slot })}
                  >
                    {armed ? 'Start Brew' : 'Start Brew (opens 30 min before)'}
                  </button>
                </>
              )}

              {st === 'due' && (
                <>
                  <span className="pt__pill pt__pill--warn">
                    Overdue by {humanCountdown(-mins)}
                  </span>
                  <button
                    className="pt__btn pt__btn--primary pt__btn--block"
                    onClick={() =>
                      setConfirm({ slot, scheduled: sched.time, late: true })
                    }
                  >
                    Mark as Taken (Late)
                  </button>
                </>
              )}

              {st === 'taken' && (
                <>
                  <span className="pt__pill pt__pill--good">
                    ✓ Taken{meta?.taken_at ? ` at ${new Date(meta.taken_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : ''}
                  </span>
                  {meta?.brew_session_id && (
                    <span className="pt__dose-meta">Brewed this session</span>
                  )}
                </>
              )}

              {st === 'missed' && <span className="pt__pill pt__pill--bad">Missed</span>}
            </div>
          );
        })}
      </div>

      <h2 className="pt__h2">Your streak</h2>
      <div className="pt__stats">
        <div className="pt__stat">
          <span className="pt__stat-value">🔥 {streak}d</span>
          <span className="pt__stat-label">Current streak</span>
        </div>
        <div className="pt__stat">
          <span className="pt__stat-value">{Math.max(streak, patient.bestStreak)}d</span>
          <span className="pt__stat-label">Personal best</span>
        </div>
        <div className="pt__stat pt__stat--good">
          <span className="pt__stat-value">{stats.pct}%</span>
          <span className="pt__stat-label">This week</span>
        </div>
        <div className="pt__stat">
          <span className="pt__stat-value">
            {badges.next ? `${badges.toNext}d` : 'Maxed'}
          </span>
          <span className="pt__stat-label">
            {badges.next ? `to ${badges.next.icon} ${badges.next.title}` : 'all badges earned'}
          </span>
        </div>
      </div>

      <h2 className="pt__h2">Badges</h2>
      <div className="pt__badges">
        {BADGES.map((b) => {
          const earned = streak >= b.days;
          return (
            <div key={b.days} className={`pt__badge-card ${earned ? '' : 'is-locked'}`}>
              <div className="pt__badge-emoji">{b.icon}</div>
              <div className="pt__badge-title">{b.title}</div>
              <div className="pt__badge-days">{b.days}-day streak</div>
            </div>
          );
        })}
      </div>

      {confirm && (
        <Modal title={`Mark ${slotLabel(confirm.slot)} dose as taken?`} size="sm" onClose={() => setConfirm(null)}>
          <div className="pt__cred">
            <div className="pt__cred-row">
              <span className="pt__cred-key">Scheduled</span>
              <span className="pt__cred-val">{confirm.scheduled}</span>
            </div>
            <div className="pt__cred-row">
              <span className="pt__cred-key">Current</span>
              <span className="pt__cred-val">
                {now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>
          </div>
          <div className="pt__modal-actions">
            <button className="pt__btn pt__btn--ghost" onClick={() => setConfirm(null)}>
              Cancel
            </button>
            <button className="pt__btn pt__btn--primary" onClick={() => doMark(confirm.slot, confirm.scheduled)}>
              Confirm
            </button>
          </div>
        </Modal>
      )}

      {brew && (
        <BrewModal
          prescribed={patient.prescription.kashaya}
          onClose={() => setBrew(null)}
          onStart={(kashaya) => {
            startBrew(kashaya);
            toast('Brew session started');
            setBrew(null);
            navigate('/dashboard');
          }}
        />
      )}
    </PatientShell>
  );
}

function BrewModal({ prescribed, onClose, onStart }) {
  const [pick, setPick] = useState(prescribed);
  return (
    <Modal title="Start your brew" sub="Your prescribed kashaya is pre-selected." onClose={onClose}>
      <div className="pt__badges" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {KASHAYAS.map((k) => (
          <button
            key={k.id}
            className={`pt__badge-card ${pick === k.name ? '' : 'is-locked'}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setPick(k.name)}
          >
            <div className="pt__badge-emoji">🌿</div>
            <div className="pt__badge-title">{k.name}</div>
          </button>
        ))}
      </div>
      <div className="pt__modal-actions">
        <button className="pt__btn pt__btn--ghost" onClick={onClose}>
          Cancel
        </button>
        <button className="pt__btn pt__btn--primary" onClick={() => onStart(pick)}>
          Confirm & open brew console
        </button>
      </div>
    </Modal>
  );
}
