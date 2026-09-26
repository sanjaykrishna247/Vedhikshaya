import { Fragment, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortal } from '../../../portal/PortalContext';
import { KASHAYAS, lastNDates, todayYmd } from '../../../portal/portalData';
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
  const today = todayYmd();

  const doMark = (slot, scheduledTime, brewId) => {
    markDose(patient.id, slot, { scheduledTime, takenAt: Date.now(), brewSessionId: brewId || null });
    setConfirm(null);
    toast(`${slotLabel(slot)} dose logged`);
  };

  return (
    <PatientShell>
      <div className="pt-today">
      <header className="pt-today__head">
        <div>
          <p className="pt-today__eyebrow">
            {now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="pt-today__title">{t('ppd.todayDoses')}</h1>
          <p className="pt-today__lede">{patient.prescription.kashaya}</p>
        </div>
        <div className="pt-today__course">
          <span>{t('pd.week', { a: patient.prescription.weekOf, b: patient.prescription.durationWeeks })}</span>
          <div className="pt-today__course-bar">
            <i style={{ width: `${Math.min(100, (patient.prescription.weekOf / patient.prescription.durationWeeks) * 100)}%` }} />
          </div>
        </div>
      </header>

      <div className="pt-today__doses">
        {slots.map((slot) => {
          const sched = patient.prescription.schedule[slot];
          const st = doseStatus(patient, today, slot, now);
          const meta = patient.compliance?.[today]?.[`${slot}_meta`];
          const mins = minutesUntil(sched.time, now);
          const armed = canStartBrew(patient, slot, now);
          const [clock, ampm] = sched.time.split(' ');

          let statusText = t('ppd.missed');
          if (st === 'upcoming') statusText = t('ppd.in', { t: humanCountdown(mins) });
          if (st === 'due') statusText = t('ppd.overdueBy', { t: humanCountdown(-mins) });
          if (st === 'taken') {
            statusText = meta?.taken_at
              ? t('ppd.takenAt', { t: new Date(meta.taken_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) })
              : t('ppd.taken');
          }

          return (
            <article key={slot} className={`pt-today__dose is-${st}`}>
              <div className="pt-today__dose-time">
                <b>{clock}</b>
                <small>{ampm}</small>
              </div>

              <div className="pt-today__dose-body">
                <span className="pt-today__dose-slot">{t(`slot.${slot}`)}</span>
                <span className="pt-today__dose-note">
                  {t(sched.food === 'before' ? 'slot.beforeFood' : 'slot.afterFood')}
                  {st === 'taken' && meta?.brew_session_id ? ` · ${t('ppd.brewedThis')}` : ''}
                </span>
                <span className={`pt-today__dose-status is-${st}`}>{statusText}</span>
              </div>

              {st === 'upcoming' && (
                <button
                  className="pt-today__btn"
                  disabled={!armed}
                  title={armed ? undefined : t('ppd.startBrewLocked')}
                  onClick={() => setBrew({ slot })}
                >
                  {t('ppd.startBrew')}
                </button>
              )}
              {st === 'due' && (
                <button
                  className="pt-today__btn"
                  onClick={() => setConfirm({ slot, scheduled: sched.time, late: true })}
                >
                  {t('ppd.markLate')}
                </button>
              )}
            </article>
          );
        })}
      </div>

      <div className="pt-today__overview">
        <WeekHeatmap patient={patient} slots={slots} now={now} t={t} />
        <WeekSummary patient={patient} slots={slots} now={now} stats={stats} t={t} />
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
const STATUS_LABEL_KEY = {
  taken: 'ppd.legendTaken',
  due: 'ppd.legendDue',
  missed: 'ppd.legendMissed',
  upcoming: 'ppd.legendUpcoming',
  unlogged: 'ppd.legendNotLogged',
};

// Past 'pending' means nothing was logged that day — it isn't "upcoming",
// so it gets its own neutral dashed style instead of the future-dose grey.
function cellStatus(patient, date, slot, now) {
  const raw = doseStatus(patient, date, slot, now);
  return raw === 'pending' ? 'unlogged' : raw;
}

function useWeekCells(patient, slots, now) {
  const days = useMemo(() => lastNDates(HEATMAP_DAYS), []);
  const rows = slots.map((slot) => ({
    slot,
    cells: days.map((date) => ({ date, status: cellStatus(patient, date, slot, now) })),
  }));
  return { days, rows };
}

function WeekHeatmap({ patient, slots, now, t }) {
  const { days, rows } = useWeekCells(patient, slots, now);
  const todayStr = days[days.length - 1];
  const [sel, setSel] = useState(null); // { date, slot, status }

  const selMeta = sel ? patient.compliance?.[sel.date]?.[`${sel.slot}_meta`] : null;
  const selDate = sel ? new Date(`${sel.date}T00:00:00`) : null;

  return (
    <section className="pt-today__card pt-today__hm">
      <header className="pt-today__card-head">
        <h2 className="pt-today__card-title">{t('ppd.weeklyOverview')}</h2>
        <p className="pt-today__card-sub">{t('ppd.weeklyOverviewSub')}</p>
      </header>

      <div className="pt-today__hm-grid" style={{ '--hm-cols': days.length }}>
        <span />
        {days.map((d) => {
          const dt = new Date(`${d}T00:00:00`);
          return (
            <span key={d} className={`pt-today__hm-day ${d === todayStr ? 'is-today' : ''}`}>
              <small>{dt.toLocaleDateString([], { weekday: 'short' })}</small>
              <b>{dt.getDate()}</b>
            </span>
          );
        })}

        {rows.map(({ slot, cells }) => (
          <Fragment key={slot}>
            <span className="pt-today__hm-slot">
              <i>{SLOT_ICON[slot]}</i>
              <span>{t(`slot.${slot}`)}</span>
            </span>
            {cells.map(({ date, status }) => {
              const active = sel && sel.date === date && sel.slot === slot;
              return (
                <button
                  key={date}
                  type="button"
                  className={`pt-today__hm-cell is-${status} ${active ? 'is-active' : ''}`}
                  aria-label={`${t(`slot.${slot}`)} ${date}: ${t(STATUS_LABEL_KEY[status])}`}
                  onClick={() => setSel(active ? null : { date, slot, status })}
                />
              );
            })}
          </Fragment>
        ))}
      </div>

      <div className={`pt-today__hm-detail ${sel ? `is-${sel.status}` : ''}`} aria-live="polite">
        {sel ? (
          <>
            <i className={`pt-today__dot is-${sel.status}`} />
            <span>
              <b>
                {selDate.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' })} · {t(`slot.${sel.slot}`)}
              </b>
              {' — '}
              {t(STATUS_LABEL_KEY[sel.status])}
              {sel.status === 'taken' && selMeta?.taken_at
                ? ` · ${new Date(selMeta.taken_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                : ''}
            </span>
          </>
        ) : (
          <span className="pt-today__hm-legend">
            {['taken', 'due', 'missed', 'unlogged'].map((k) => (
              <span key={k}>
                <i className={`pt-today__dot is-${k}`} />
                {t(STATUS_LABEL_KEY[k])}
              </span>
            ))}
          </span>
        )}
      </div>
    </section>
  );
}

function WeekSummary({ patient, slots, now, stats, t }) {
  const { rows } = useWeekCells(patient, slots, now);
  const counts = { taken: 0, missed: 0, due: 0 };
  rows.forEach((r) => r.cells.forEach((c) => {
    if (c.status in counts) counts[c.status] += 1;
  }));
  const total = counts.taken + counts.missed + counts.due || 1;

  return (
    <section className="pt-today__card pt-today__sum">
      <header className="pt-today__card-head">
        <h2 className="pt-today__card-title">{t('ppd.adherence')}</h2>
        <p className="pt-today__card-sub">{t('ppd.last7')}</p>
      </header>

      <div className="pt-today__sum-figure">
        {stats.pct}
        <span>%</span>
      </div>

      <div className="pt-today__sum-bar" aria-hidden="true">
        {['taken', 'due', 'missed'].map((k) =>
          counts[k] ? <i key={k} className={`is-${k}`} style={{ flexGrow: counts[k] / total }} /> : null
        )}
      </div>

      <dl className="pt-today__sum-stats">
        {[
          ['taken', 'ppd.legendTaken'],
          ['missed', 'ppd.legendMissed'],
          ['due', 'ppd.legendDue'],
        ].map(([k, key]) => (
          <div key={k}>
            <dt>
              <i className={`pt-today__dot is-${k}`} />
              {t(key)}
            </dt>
            <dd>{counts[k]}</dd>
          </div>
        ))}
      </dl>
    </section>
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
