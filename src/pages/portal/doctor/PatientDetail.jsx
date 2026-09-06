import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePortal } from '../../../portal/PortalContext';
import { KASHAYAS, lastNDates } from '../../../portal/portalData';
import {
  activeSlots,
  complianceStats,
  currentStreak,
  doseStatus,
  slotLabel,
} from '../../../portal/portalLogic';
import { exportPatientReport } from '../../../portal/report';
import { PortalShell, Modal, personInitials, useToast, clockTime } from '../shared';
import { useDoctorNav } from './useDoctorNav';
import '../portal.css';

const CELL_MARK = { taken: '✓', missed: '✗', pending: '●', upcoming: '●', due: '!' };

export default function PatientDetail() {
  const { id } = useParams();
  const nav = useDoctorNav();
  const navigate = useNavigate();
  const toast = useToast();
  const { patients, doctor, updatePrescription, endTreatment, getChat, tick } = usePortal();

  const patient = patients.find((p) => p.id === id);
  const [showEdit, setShowEdit] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  const stats = useMemo(() => (patient ? complianceStats(patient) : null), [patient, tick]);
  const streak = useMemo(() => (patient ? currentStreak(patient) : 0), [patient, tick]);
  const unread = patient ? getChat(patient.id).filter((m) => m.sender === 'patient' && !m.read).length : 0;
  const days = lastNDates(7);

  if (!patient) {
    return (
      <PortalShell variant="doctor" nav={nav}>
        <div className="pt__empty">
          Patient not found.
          <div style={{ marginTop: 12 }}>
            <button className="pt__btn" onClick={() => navigate('/doctor/dashboard')}>
              Back to patients
            </button>
          </div>
        </div>
      </PortalShell>
    );
  }

  const slots = activeSlots(patient.prescription.schedule);

  return (
    <PortalShell variant="doctor" nav={nav}>
      <button className="pt__linkbtn" onClick={() => navigate('/doctor/dashboard')} style={{ marginBottom: 12 }}>
        ← All patients
      </button>

      <div className="pt__page-head pt__row">
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <span className="pt__pcard-avatar" style={{ width: 52, height: 52, fontSize: '1.05rem' }}>
            {personInitials(patient.name)}
          </span>
          <div>
            <h1 className="pt__h1">{patient.name}</h1>
            <p className="pt__sub">
              {patient.id} · {patient.age} · {patient.gender} · {patient.phone}
              {!patient.active && ' · treatment completed'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="pt__btn" onClick={() => (exportPatientReport(patient, doctor) ? toast('Opening report…') : toast('Allow pop-ups to export'))}>
            Export report
          </button>
          <button className="pt__btn" onClick={() => navigate('/doctor/chat', { state: { patientId: patient.id } })}>
            Message{unread > 0 ? ` (${unread})` : ''}
          </button>
          {patient.active && (
            <>
              <button className="pt__btn pt__btn--primary" onClick={() => setShowEdit(true)}>
                Edit prescription
              </button>
              <button className="pt__btn pt__btn--danger" onClick={() => setShowEnd(true)}>
                End treatment
              </button>
            </>
          )}
        </div>
      </div>

      <div className="pt__stats">
        <Stat label="Weekly compliance" value={`${stats.pct}%`} tone={stats.pct >= 80 ? 'good' : stats.pct >= 60 ? 'warn' : 'bad'} />
        <Stat label="Current streak" value={`${streak}d`} />
        <Stat label="Doses taken / scheduled" value={`${stats.taken}/${stats.scheduled}`} />
        <Stat label="Most missed slot" value={stats.mostMissed ? slotLabel(stats.mostMissed) : '—'} tone={stats.mostMissed ? 'warn' : 'good'} />
      </div>

      <h2 className="pt__h2">Compliance — last 7 days</h2>
      <div className="pt__card">
        <div className="pt__grid">
          <div className="pt__grid-h" />
          {days.map((d) => (
            <div key={d} className="pt__grid-h">
              {d.slice(5)}
            </div>
          ))}
          {slots.map((slot) => (
            <Row key={slot} slot={slot} patient={patient} days={days} />
          ))}
        </div>
      </div>

      <h2 className="pt__h2">Current prescription</h2>
      <div className="pt__card">
        <dl style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '8px 16px', margin: 0, fontSize: '0.88rem' }}>
          <dt style={dt}>Kashaya</dt>
          <dd style={dd}>{patient.prescription.kashaya}</dd>
          <dt style={dt}>Schedule</dt>
          <dd style={dd}>
            {slots.map((s) => (
              <div key={s}>
                {slotLabel(s)} — {patient.prescription.schedule[s].time} ({patient.prescription.schedule[s].food} food)
              </div>
            ))}
          </dd>
          <dt style={dt}>Duration</dt>
          <dd style={dd}>
            Week {patient.prescription.weekOf} of {patient.prescription.durationWeeks}
          </dd>
          <dt style={dt}>Notes</dt>
          <dd style={dd}>{patient.prescription.notes}</dd>
          <dt style={dt}>Last updated</dt>
          <dd style={dd}>
            {new Date(patient.prescription.updatedAt).toLocaleString()} · {patient.prescription.updatedBy}
          </dd>
        </dl>
      </div>

      <h2 className="pt__h2">Recent brew sessions</h2>
      <div className="pt__table-wrap">
        <table className="pt__table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Kashaya</th>
              <th>Consistency</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {patient.brews.length === 0 && (
              <tr>
                <td colSpan={4} style={{ color: 'var(--pt-muted)' }}>
                  No brew sessions recorded yet.
                </td>
              </tr>
            )}
            {patient.brews.map((b) => (
              <tr key={b.id}>
                <td>{new Date(b.startedAt).toLocaleDateString()}</td>
                <td>{b.kashaya}</td>
                <td>{b.score}%</td>
                <td>{b.durationMin} min</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showEdit && (
        <EditPrescriptionModal
          patient={patient}
          onClose={() => setShowEdit(false)}
          onSave={(next) => {
            updatePrescription(patient.id, next);
            setShowEdit(false);
            toast('Prescription updated · patient notified');
          }}
        />
      )}

      {showEnd && (
        <Modal title={`End treatment for ${patient.name}?`} size="sm" onClose={() => setShowEnd(false)}>
          <p className="pt__modal-sub">
            The patient moves to History and is removed from your active caseload. They'll be asked to book a review.
          </p>
          <EndTreatmentForm
            onCancel={() => setShowEnd(false)}
            onConfirm={(reason) => {
              endTreatment(patient.id, reason);
              setShowEnd(false);
              toast('Treatment ended · patient notified');
              navigate('/doctor/dashboard');
            }}
          />
        </Modal>
      )}
    </PortalShell>
  );
}

const dt = { fontWeight: 700, color: 'var(--pt-muted)' };
const dd = { margin: 0, color: 'var(--pt-body)' };

function Row({ slot, patient, days }) {
  return (
    <>
      <div className="pt__grid-rowlabel">{slotLabel(slot)}</div>
      {days.map((d) => {
        const st = doseStatus(patient, d, slot);
        return (
          <div key={d} className={`pt__cell pt__cell--${st}`} title={`${d} · ${slotLabel(slot)} · ${st}`}>
            {CELL_MARK[st] || '·'}
          </div>
        );
      })}
    </>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div className={`pt__stat ${tone ? `pt__stat--${tone}` : ''}`}>
      <span className="pt__stat-value">{value}</span>
      <span className="pt__stat-label">{label}</span>
    </div>
  );
}

function EndTreatmentForm({ onCancel, onConfirm }) {
  const [reason, setReason] = useState('Course completed');
  return (
    <>
      <div className="pt__field">
        <span className="pt__label">Reason</span>
        <input className="pt__input" value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>
      <div className="pt__modal-actions">
        <button className="pt__btn pt__btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button className="pt__btn pt__btn--danger" onClick={() => onConfirm(reason)}>
          End treatment
        </button>
      </div>
    </>
  );
}

function EditPrescriptionModal({ patient, onClose, onSave }) {
  const [kashaya, setKashaya] = useState(patient.prescription.kashaya);
  const [schedule, setSchedule] = useState(structuredClone(patient.prescription.schedule));
  const [durationWeeks, setDurationWeeks] = useState(String(patient.prescription.durationWeeks));
  const [notes, setNotes] = useState(patient.prescription.notes);

  const setSlot = (slot, key, v) =>
    setSchedule((s) => ({ ...s, [slot]: { ...s[slot], [key]: v } }));

  return (
    <Modal title="Edit prescription" sub="Saving pushes a notification to the patient." onClose={onClose}>
      <div className="pt__field">
        <span className="pt__label">Kashaya</span>
        <select className="pt__select" value={kashaya} onChange={(e) => setKashaya(e.target.value)}>
          {KASHAYAS.map((k) => (
            <option key={k.id}>{k.name}</option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: 14 }}>
        <span className="pt__label">Dose timings & food</span>
        {['morning', 'afternoon', 'night'].map((slot) => (
          <div key={slot} className="pt__sched-row">
            <button
              type="button"
              className="pt__sched-toggle"
              onClick={() => setSlot(slot, 'on', !schedule[slot].on)}
            >
              <span className={`pt__switch ${schedule[slot].on ? 'is-on' : ''}`} />
              {slotLabel(slot)}
            </button>
            <input
              className="pt__input"
              value={schedule[slot].time}
              disabled={!schedule[slot].on}
              onChange={(e) => setSlot(slot, 'time', e.target.value)}
            />
            <select
              className="pt__select"
              value={schedule[slot].food}
              disabled={!schedule[slot].on}
              onChange={(e) => setSlot(slot, 'food', e.target.value)}
            >
              <option value="before">Before food</option>
              <option value="after">After food</option>
            </select>
          </div>
        ))}
      </div>

      <div className="pt__form-grid" style={{ marginTop: 14 }}>
        <div className="pt__field">
          <span className="pt__label">Duration (weeks)</span>
          <input
            className="pt__input"
            type="number"
            min="1"
            value={durationWeeks}
            onChange={(e) => setDurationWeeks(e.target.value)}
          />
        </div>
      </div>

      <div className="pt__field" style={{ marginTop: 14 }}>
        <span className="pt__label">Notes</span>
        <textarea className="pt__textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="pt__modal-actions">
        <button className="pt__btn pt__btn--ghost" onClick={onClose}>
          Cancel
        </button>
        <button
          className="pt__btn pt__btn--primary"
          onClick={() =>
            onSave({
              kashaya,
              schedule,
              durationWeeks: Number(durationWeeks) || patient.prescription.durationWeeks,
              notes,
            })
          }
        >
          Save & notify
        </button>
      </div>
    </Modal>
  );
}

export { clockTime };
