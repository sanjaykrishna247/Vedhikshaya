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
import { useDashLang } from '../../dashboard/dashI18n';
import PatientShell from './PatientShell';
import { usePatient } from './usePatientNav';
import '../portal.css';

export default function PatientDashboard() {
  const patient = usePatient();
  const navigate = useNavigate();
  const toast = useToast();
  const now = useNow(1000);
  const { t } = useDashLang();
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
        <h1 className="pt__h1">{t('ppd.todayDoses')}</h1>
        <p className="pt__sub">
          {patient.prescription.kashaya} · {t('pd.week', { a: patient.prescription.weekOf, b: patient.prescription.durationWeeks })}
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
              <span className="pt__dose-slot">{t(`slot.${slot}`)}</span>
              <span className="pt__dose-kashaya">{patient.prescription.kashaya}</span>
              <span className="pt__dose-meta">
                {sched.time} · {t(sched.food === 'before' ? 'slot.beforeFood' : 'slot.afterFood')}
              </span>

              {st === 'upcoming' && (
                <>
                  <span className="pt__dose-countdown">{t('ppd.in', { t: humanCountdown(mins) })}</span>
                  <button
                    className="pt__btn pt__btn--primary pt__btn--block"
                    disabled={!armed}
                    onClick={() => setBrew({ slot })}
                  >
                    {armed ? t('ppd.startBrew') : t('ppd.startBrewLocked')}
                  </button>
                </>
              )}

              {st === 'due' && (
                <>
                  <span className="pt__pill pt__pill--warn">
                    {t('ppd.overdueBy', { t: humanCountdown(-mins) })}
                  </span>
                  <button
                    className="pt__btn pt__btn--primary pt__btn--block"
                    onClick={() =>
                      setConfirm({ slot, scheduled: sched.time, late: true })
                    }
                  >
                    {t('ppd.markLate')}
                  </button>
                </>
              )}

              {st === 'taken' && (
                <>
                  <span className="pt__pill pt__pill--good">
                    {meta?.taken_at
                      ? t('ppd.takenAt', { t: new Date(meta.taken_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) })
                      : t('ppd.taken')}
                  </span>
                  {meta?.brew_session_id && (
                    <span className="pt__dose-meta">{t('ppd.brewedThis')}</span>
                  )}
                </>
              )}

              {st === 'missed' && <span className="pt__pill pt__pill--bad">{t('ppd.missed')}</span>}
            </div>
          );
        })}
      </div>

      <h2 className="pt__h2">{t('ppd.yourStreak')}</h2>
      <div className="pt__stats">
        <div className="pt__stat">
          <span className="pt__stat-value">🔥 {streak}{t('ppd.dayShort')}</span>
          <span className="pt__stat-label">{t('pd.currentStreak')}</span>
        </div>
        <div className="pt__stat">
          <span className="pt__stat-value">{Math.max(streak, patient.bestStreak)}{t('ppd.dayShort')}</span>
          <span className="pt__stat-label">{t('ppd.personalBest')}</span>
        </div>
        <div className="pt__stat pt__stat--good">
          <span className="pt__stat-value">{stats.pct}%</span>
          <span className="pt__stat-label">{t('ppd.thisWeek')}</span>
        </div>
        <div className="pt__stat">
          <span className="pt__stat-value">
            {badges.next ? `${badges.toNext}${t('ppd.dayShort')}` : t('ppd.maxed')}
          </span>
          <span className="pt__stat-label">
            {badges.next ? t('ppd.toNext', { icon: badges.next.icon, title: t(`badge.${badges.next.days}`) }) : t('ppd.allBadges')}
          </span>
        </div>
      </div>

      <h2 className="pt__h2">{t('ppd.badges')}</h2>
      <div className="pt__badges">
        {BADGES.map((b) => {
          const earned = streak >= b.days;
          return (
            <div key={b.days} className={`pt__badge-card ${earned ? '' : 'is-locked'}`}>
              <div className="pt__badge-emoji">{b.icon}</div>
              <div className="pt__badge-title">{t(`badge.${b.days}`)}</div>
              <div className="pt__badge-days">{t('badge.streakDays', { n: b.days })}</div>
            </div>
          );
        })}
      </div>

      {confirm && (
        <Modal title={t('ppd.markTitle', { slot: t(`slot.${confirm.slot}`) })} size="sm" onClose={() => setConfirm(null)}>
          <div className="pt__cred">
            <div className="pt__cred-row">
              <span className="pt__cred-key">{t('ppd.scheduled')}</span>
              <span className="pt__cred-val">{confirm.scheduled}</span>
            </div>
            <div className="pt__cred-row">
              <span className="pt__cred-key">{t('ppd.currentTime')}</span>
              <span className="pt__cred-val">
                {now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>
          </div>
          <div className="pt__modal-actions">
            <button className="pt__btn pt__btn--ghost" onClick={() => setConfirm(null)}>
              {t('p.cancel')}
            </button>
            <button className="pt__btn pt__btn--primary" onClick={() => doMark(confirm.slot, confirm.scheduled)}>
              {t('p.confirm')}
            </button>
          </div>
        </Modal>
      )}

      {brew && (
        <BrewModal
          t={t}
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

function BrewModal({ t, prescribed, onClose, onStart }) {
  const [pick, setPick] = useState(prescribed);
  return (
    <Modal title={t('ppd.startYourBrew')} sub={t('ppd.prescribedPreselect')} onClose={onClose}>
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
          {t('p.cancel')}
        </button>
        <button className="pt__btn pt__btn--primary" onClick={() => onStart(pick)}>
          {t('ppd.confirmOpen')}
        </button>
      </div>
    </Modal>
  );
}
