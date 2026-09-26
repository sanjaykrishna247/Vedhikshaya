import { Fragment, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortal } from '../../../portal/PortalContext';
import { KASHAYAS, lastNDates } from '../../../portal/portalData';
import {
  activeSlots,
  canStartBrew,
  complianceStats,
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
      <div className="pt-today">
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

      <div className="pt-today__stats-pair">
        <div className="pt-today__stat">
          <span className="pt-today__stat-value">{stats.taken}/{stats.scheduled}</span>
          <span className="pt-today__stat-label">{t('ppd.dosesTaken')}</span>
        </div>
        <div className="pt-today__stat pt-today__stat--good">
          <span className="pt-today__stat-value">{stats.pct}%</span>
          <span className="pt-today__stat-label">{t('ppd.thisWeek')}</span>
        </div>
      </div>

      <WeekHeatmap patient={patient} slots={slots} now={now} t={t} />

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
      </div>
    </PatientShell>
  );
}

const HEATMAP_DAYS = 7;

const HM_ICON_S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
const SLOT_ICON = {
  morning: (
    <svg viewBox="0 0 24 24" {...HM_ICON_S}>
      <circle cx="12" cy="12" r="3.6" />
      <path d="M12 3.5v2.4M12 18.1v2.4M4.4 4.4l1.7 1.7M17.9 17.9l1.7 1.7M3.5 12h2.4M18.1 12h2.4M4.4 19.6l1.7-1.7M17.9 6.1l1.7-1.7" />
    </svg>
  ),
  afternoon: (
    <svg viewBox="0 0 24 24" {...HM_ICON_S}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2M4.9 4.9l1.4 1.4M2.5 12h2M19.1 6.3l1.4-1.4" />
    </svg>
  ),
  night: (
    <svg viewBox="0 0 24 24" {...HM_ICON_S}>
      <path d="M20.2 14.7A8.4 8.4 0 1 1 9.3 3.8a6.7 6.7 0 0 0 10.9 10.9z" />
    </svg>
  ),
};
const CALENDAR_ICON = (
  <svg viewBox="0 0 24 24" {...HM_ICON_S}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 9.5h17M8 3v3.4M16 3v3.4" />
  </svg>
);
const CELL_GLYPH = {
  taken: (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.2 4.2L19 6.3" />
    </svg>
  ),
  due: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#805d00" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7.5V12l3 2.2" />
    </svg>
  ),
  missed: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </svg>
  ),
  upcoming: null,
};

function WeekHeatmap({ patient, slots, now, t }) {
  const days = useMemo(() => lastNDates(HEATMAP_DAYS), []);
  const todayStr = days[days.length - 1];

  return (
    <div className="pt-today__heatmap-card">
      <div className="pt-today__hm-head">
        <span className="pt-today__hm-head-icon">{CALENDAR_ICON}</span>
        <div>
          <div className="pt-today__hm-head-title">{t('ppd.weeklyOverview')}</div>
          <div className="pt-today__hm-head-sub">{t('ppd.weeklyOverviewSub')}</div>
        </div>
      </div>

      <div className="pt-today__heatmap-scroll">
        <div
          className="pt-today__heatmap-grid"
          style={{ gridTemplateColumns: `104px repeat(${days.length}, minmax(42px, 1fr))` }}
        >
          <div className="pt-today__hm-corner" />
          {days.map((d) => {
            const dt = new Date(`${d}T00:00:00`);
            return (
              <div key={d} className={`pt-today__hm-daylabel ${d === todayStr ? 'is-today' : ''}`}>
                <span className="pt-today__hm-daylabel-name">{dt.toLocaleDateString([], { weekday: 'short' })}</span>
                <span className="pt-today__hm-daylabel-num">{dt.getDate()}</span>
              </div>
            );
          })}

          {slots.map((slot) => (
            <Fragment key={slot}>
              <div className="pt-today__hm-sessionlabel">
                <span className="pt-today__hm-sessionlabel-icon">{SLOT_ICON[slot]}</span>
                {t(`slot.${slot}`)}
              </div>
              {days.map((d) => {
                // 'pending' (a grace/unlogged state from seed data) reads the
                // same as 'upcoming' everywhere else in the app (see
                // complianceStats) — treat it the same here so it isn't a
                // blank, uncolored cell.
                const raw = doseStatus(patient, d, slot, now);
                const st = raw === 'pending' ? 'upcoming' : raw;
                return (
                  <div
                    key={d}
                    className={`pt-today__hm-cell pt-today__hm-cell--${st}`}
                    title={`${t(`slot.${slot}`)} · ${d}`}
                  >
                    {CELL_GLYPH[st]}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="pt-today__hm-legend">
        <span className="pt-today__hm-legend-item">
          <i className="pt-today__hm-swatch pt-today__hm-cell--taken" />
          {t('ppd.legendTaken')}
        </span>
        <span className="pt-today__hm-legend-item">
          <i className="pt-today__hm-swatch pt-today__hm-cell--due" />
          {t('ppd.legendDue')}
        </span>
        <span className="pt-today__hm-legend-item">
          <i className="pt-today__hm-swatch pt-today__hm-cell--missed" />
          {t('ppd.legendMissed')}
        </span>
        <span className="pt-today__hm-legend-item">
          <i className="pt-today__hm-swatch pt-today__hm-cell--upcoming" />
          {t('ppd.legendUpcoming')}
        </span>
      </div>
    </div>
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
