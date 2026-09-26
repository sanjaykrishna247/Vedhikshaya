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
const CALENDAR_ICON = (
  <svg viewBox="0 0 24 24" {...HM_ICON_S}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 9.5h17M8 3v3.4M16 3v3.4" />
  </svg>
);
const glyph = (d, stroke, w = 2.8) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);
const CELL_GLYPH = {
  taken: glyph(<path d="M5 12.5l4.2 4.2L19 6.3" />, '#ffffff'),
  due: glyph(<><circle cx="12" cy="12" r="8" /><path d="M12 7.5V12l3 2.2" /></>, '#7a5600', 2.4),
  missed: glyph(<path d="M7 7l10 10M17 7L7 17" />, '#ffffff'),
  upcoming: null,
  unlogged: null,
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
        <span className="pt-today__card-icon">{CALENDAR_ICON}</span>
        <div>
          <h3 className="pt-today__card-title">{t('ppd.weeklyOverview')}</h3>
          <p className="pt-today__card-sub">{t('ppd.weeklyOverviewSub')}</p>
        </div>
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
                >
                  {CELL_GLYPH[status]}
                </button>
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
  const pct = stats.pct;
  const R = 38;
  const C = 2 * Math.PI * R;
  const tone = pct >= 80 ? 'good' : pct >= 50 ? 'warn' : 'bad';

  return (
    <section className="pt-today__card pt-today__sum">
      <header className="pt-today__card-head">
        <div>
          <h3 className="pt-today__card-title">{t('ppd.adherence')}</h3>
          <p className="pt-today__card-sub">{t('ppd.last7')}</p>
        </div>
      </header>

      <div className="pt-today__sum-body">
        <div className={`pt-today__ring is-${tone}`}>
          <svg viewBox="0 0 96 96">
            <circle cx="48" cy="48" r={R} className="pt-today__ring-track" />
            <circle
              cx="48"
              cy="48"
              r={R}
              className="pt-today__ring-fill"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - pct / 100)}
            />
          </svg>
          <span className="pt-today__ring-value">
            {pct}
            <small>%</small>
          </span>
        </div>

        <ul className="pt-today__sum-list">
          <li>
            <i className="pt-today__dot is-taken" />
            <span>{t('ppd.legendTaken')}</span>
            <b>{counts.taken}</b>
          </li>
          <li>
            <i className="pt-today__dot is-missed" />
            <span>{t('ppd.legendMissed')}</span>
            <b>{counts.missed}</b>
          </li>
          <li>
            <i className="pt-today__dot is-due" />
            <span>{t('ppd.legendDue')}</span>
            <b>{counts.due}</b>
          </li>
        </ul>
      </div>
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
