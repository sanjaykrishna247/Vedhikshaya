import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortal } from '../../../portal/PortalContext';
import { KASHAYAS } from '../../../portal/portalData';
import {
  complianceStats,
  doctorStats,
  scheduleSummary,
} from '../../../portal/portalLogic';
import { PortalShell, Modal, Loading, personInitials, useToast } from '../shared';
import { useDoctorNav } from './useDoctorNav';
import '../portal.css';

const BLANK_SCHEDULE = {
  morning: { on: true, time: '6:00 AM', food: 'before' },
  afternoon: { on: false, time: '1:00 PM', food: 'after' },
  night: { on: true, time: '8:00 PM', food: 'after' },
};

export default function DoctorDashboard() {
  const nav = useDoctorNav();
  const navigate = useNavigate();
  const toast = useToast();
  const { patients, addPatient, alerts, dismissAlert, tick } = usePortal();

  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [creds, setCreds] = useState(null);

  // simulate the initial fetch + 30s auto refresh (tick drives re-render)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {}, [tick]);

  const active = useMemo(() => patients.filter((p) => p.active), [patients]);
  const inactive = useMemo(() => patients.filter((p) => !p.active), [patients]);
  const stats = useMemo(() => doctorStats(patients), [patients, tick]);

  return (
    <PortalShell variant="doctor" nav={nav}>
      <div className="pt__page-head pt__row">
        <div>
          <h1 className="pt__h1">Patients</h1>
          <p className="pt__sub">Auto-refreshing every 30s · {active.length} active</p>
        </div>
        <button className="pt__btn pt__btn--primary" onClick={() => setShowAdd(true)}>
          + Add patient
        </button>
      </div>

      {alerts.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          {alerts.map((a) => (
            <div key={a.id} className="pt__alert">
              <span>
                <strong>{a.patientName}</strong> — {a.type} · {new Date(a.at).toLocaleTimeString()}
              </span>
              <button className="pt__btn pt__btn--sm" onClick={() => dismissAlert(a.id)}>
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <Loading label="Fetching patients…" />
      ) : (
        <>
          <div className="pt__stats">
            <Stat label="Active patients" value={stats.total} />
            <Stat label="Compliant today" value={stats.compliantToday} tone="good" />
            <Stat label="Missed doses today" value={stats.missedToday} tone={stats.missedToday ? 'bad' : 'good'} />
            <Stat label="Pending (not yet due)" value={stats.pendingToday} tone="warn" />
          </div>

          <h2 className="pt__h2">Active caseload</h2>
          <div className="pt__patients">
            {active.map((p) => {
              const c = complianceStats(p);
              return (
                <button key={p.id} className="pt__pcard" onClick={() => navigate(`/doctor/patient/${p.id}`)}>
                  <div className="pt__pcard-top">
                    <span className="pt__pcard-avatar">{personInitials(p.name)}</span>
                    <span>
                      <span className="pt__pcard-name">{p.name}</span>
                      <br />
                      <span className="pt__pcard-id">
                        {p.id} · {p.online ? '🟢 online' : '⚫ offline'}
                      </span>
                    </span>
                  </div>
                  <div className="pt__pcard-cond">{p.condition}</div>
                  <div className="pt__pcard-foot">
                    <span className="pt__pill pt__pill--muted">{p.prescription.kashaya}</span>
                    <span>{c.pct}%</span>
                  </div>
                  <div className="pt__mini-bar">
                    <span style={{ width: `${c.pct}%` }} />
                  </div>
                </button>
              );
            })}
          </div>

          {inactive.length > 0 && (
            <>
              <h2 className="pt__h2">History</h2>
              <div className="pt__table-wrap">
                <table className="pt__table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Kashaya</th>
                      <th>Condition</th>
                      <th>Ended</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {inactive.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name} · {p.id}</td>
                        <td>{p.prescription.kashaya}</td>
                        <td>{p.condition}</td>
                        <td>{p.endedAt ? new Date(p.endedAt).toLocaleDateString() : '—'}</td>
                        <td>
                          <button className="pt__linkbtn" onClick={() => navigate(`/doctor/patient/${p.id}`)}>
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {showAdd && (
        <AddPatientModal
          onClose={() => setShowAdd(false)}
          onDone={(result) => {
            setShowAdd(false);
            setCreds(result);
            toast('Patient added');
          }}
          addPatient={addPatient}
        />
      )}

      {creds && (
        <Modal title="Patient Added Successfully" size="sm" onClose={() => setCreds(null)}>
          <p className="pt__modal-sub">Share these credentials with the patient — the password is shown once.</p>
          <div className="pt__cred">
            <div className="pt__cred-row">
              <span className="pt__cred-key">Username</span>
              <span className="pt__cred-val">{creds.username}</span>
            </div>
            <div className="pt__cred-row">
              <span className="pt__cred-key">Password</span>
              <span className="pt__cred-val">{creds.temp_password}</span>
            </div>
          </div>
          <div className="pt__modal-actions">
            <button
              className="pt__btn"
              onClick={() => {
                navigator.clipboard?.writeText(`${creds.username} / ${creds.temp_password}`);
                toast('Copied');
              }}
            >
              Copy
            </button>
            <button className="pt__btn pt__btn--primary" onClick={() => setCreds(null)}>
              Done
            </button>
          </div>
        </Modal>
      )}
    </PortalShell>
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

function AddPatientModal({ onClose, onDone, addPatient }) {
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    condition: '',
    kashaya: KASHAYAS[0].name,
    durationWeeks: '8',
    notes: '',
    schedule: structuredClone(BLANK_SCHEDULE),
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setSlot = (slot, key, v) =>
    setForm((f) => ({
      ...f,
      schedule: { ...f.schedule, [slot]: { ...f.schedule[slot], [key]: v } },
    }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.condition.trim()) return;
    onDone(addPatient(form));
  };

  return (
    <Modal title="Add new patient" sub="Credentials are generated automatically on save." onClose={onClose}>
      <form onSubmit={submit}>
        <div className="pt__form-grid">
          <div className="pt__field">
            <span className="pt__label">Full name</span>
            <input className="pt__input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </div>
          <div className="pt__field">
            <span className="pt__label">Phone number</span>
            <input className="pt__input" value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
          </div>
          <div className="pt__field">
            <span className="pt__label">Age</span>
            <input className="pt__input" type="number" min="0" value={form.age} onChange={(e) => set('age', e.target.value)} />
          </div>
          <div className="pt__field">
            <span className="pt__label">Gender</span>
            <select className="pt__select" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div className="pt__field pt__col-2">
            <span className="pt__label">Medical condition</span>
            <input className="pt__input" value={form.condition} onChange={(e) => set('condition', e.target.value)} required />
          </div>
          <div className="pt__field">
            <span className="pt__label">Kashaya</span>
            <select className="pt__select" value={form.kashaya} onChange={(e) => set('kashaya', e.target.value)}>
              {KASHAYAS.map((k) => (
                <option key={k.id}>{k.name}</option>
              ))}
            </select>
          </div>
          <div className="pt__field">
            <span className="pt__label">Duration (weeks)</span>
            <input
              className="pt__input"
              type="number"
              min="1"
              value={form.durationWeeks}
              onChange={(e) => set('durationWeeks', e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <span className="pt__label">Dose schedule</span>
          {['morning', 'afternoon', 'night'].map((slot) => (
            <div key={slot} className="pt__sched-row">
              <button
                type="button"
                className="pt__sched-toggle"
                onClick={() => setSlot(slot, 'on', !form.schedule[slot].on)}
              >
                <span className={`pt__switch ${form.schedule[slot].on ? 'is-on' : ''}`} />
                {slot[0].toUpperCase() + slot.slice(1)}
              </button>
              <input
                className="pt__input"
                value={form.schedule[slot].time}
                disabled={!form.schedule[slot].on}
                onChange={(e) => setSlot(slot, 'time', e.target.value)}
                placeholder="6:00 AM"
              />
              <select
                className="pt__select"
                value={form.schedule[slot].food}
                disabled={!form.schedule[slot].on}
                onChange={(e) => setSlot(slot, 'food', e.target.value)}
              >
                <option value="before">Before food</option>
                <option value="after">After food</option>
              </select>
            </div>
          ))}
        </div>

        <div className="pt__field" style={{ marginTop: 14 }}>
          <span className="pt__label">Special notes for patient</span>
          <textarea
            className="pt__textarea"
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Dietary advice, precautions…"
          />
        </div>

        <div className="pt__modal-actions">
          <button type="button" className="pt__btn pt__btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="pt__btn pt__btn--primary">
            Create patient
          </button>
        </div>
      </form>
    </Modal>
  );
}

export { scheduleSummary };
