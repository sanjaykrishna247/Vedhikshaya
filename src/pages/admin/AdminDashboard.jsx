import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import {
  HOSPITALS,
  DOCTORS,
  PATIENTS,
  COMPLAINTS,
  KASHAYA_OPTIONS,
  uid,
} from './adminData';
import './AdminDashboard.css';

const TABS = ['Overview', 'Hospitals', 'Doctors', 'Patients', 'Payments', 'Reports', 'Complaints'];
const inr = (n) => `₹${n.toLocaleString('en-IN')}`;

export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview');
  const [hospitals, setHospitals] = useState(HOSPITALS);
  const [doctors, setDoctors] = useState(DOCTORS);
  const [patients, setPatients] = useState(PATIENTS);
  const [complaints, setComplaints] = useState(COMPLAINTS);

  const [showHForm, setShowHForm] = useState(false);
  const [showDForm, setShowDForm] = useState(false);
  const [showPForm, setShowPForm] = useState(false);
  const [docHospital, setDocHospital] = useState('all');
  const [patHospital, setPatHospital] = useState('all');
  const [reportHospital, setReportHospital] = useState('all');
  const [toast, setToast] = useState('');

  const hName = (id) => hospitals.find((h) => h.id === id)?.name ?? '—';
  const dName = (id) => doctors.find((d) => d.id === id)?.name ?? '—';

  const flash = (msg) => {
    setToast(msg);
    window.clearTimeout(flash._t);
    flash._t = window.setTimeout(() => setToast(''), 2600);
  };

  // ---- CRUD ----
  const addHospital = (e) => {
    e.preventDefault();
    const f = e.target;
    const h = {
      id: uid('h'),
      name: f.name.value.trim(),
      city: f.city.value.trim(),
      tier: f.tier.value,
      joined: new Date().toISOString().slice(0, 10),
      pods: Number(f.pods.value) || 0,
    };
    if (!h.name) return;
    setHospitals((s) => [h, ...s]);
    setShowHForm(false);
    f.reset();
    flash(`Hospital "${h.name}" added`);
  };
  const removeHospital = (id) => {
    setHospitals((s) => s.filter((h) => h.id !== id));
    setDoctors((s) => s.filter((d) => d.hospitalId !== id));
    setPatients((s) => s.filter((p) => p.hospitalId !== id));
    setComplaints((s) => s.filter((c) => c.hospitalId !== id));
    flash('Hospital and its linked records removed');
  };

  const addDoctor = (e) => {
    e.preventDefault();
    const f = e.target;
    const d = {
      id: uid('d'),
      name: f.name.value.trim(),
      hospitalId: f.hospitalId.value,
      speciality: f.speciality.value.trim() || 'General',
      reg: f.reg.value.trim() || '—',
    };
    if (!d.name || !d.hospitalId) return;
    setDoctors((s) => [d, ...s]);
    setShowDForm(false);
    f.reset();
    flash(`Doctor "${d.name}" added`);
  };
  const removeDoctor = (id) => {
    setDoctors((s) => s.filter((d) => d.id !== id));
    flash('Doctor removed');
  };

  const addPatient = (e) => {
    e.preventDefault();
    const f = e.target;
    const p = {
      id: uid('p'),
      name: f.name.value.trim(),
      hospitalId: f.hospitalId.value,
      doctorId: f.doctorId.value,
      kashaya: f.kashaya.value,
      lastDose: new Date().toISOString().slice(0, 10),
      payment: f.payment.value,
      amount: Number(f.amount.value) || 0,
    };
    if (!p.name || !p.hospitalId) return;
    setPatients((s) => [p, ...s]);
    setShowPForm(false);
    f.reset();
    flash(`Patient "${p.name}" added`);
  };
  const removePatient = (id) => {
    setPatients((s) => s.filter((p) => p.id !== id));
    flash('Patient record removed');
  };
  const togglePayment = (id) =>
    setPatients((s) =>
      s.map((p) => (p.id === id ? { ...p, payment: p.payment === 'Paid' ? 'Pending' : 'Paid' } : p)),
    );

  const routeComplaint = (id) => {
    setComplaints((s) =>
      s.map((c) => (c.id === id ? { ...c, status: 'Routed → Customer Care' } : c)),
    );
    flash('Complaint routed to the customer-care queue');
  };

  // ---- derived ----
  const overview = useMemo(() => {
    const revenueCollected = patients.filter((p) => p.payment === 'Paid').reduce((a, p) => a + p.amount, 0);
    const revenuePending = patients.filter((p) => p.payment !== 'Paid').reduce((a, p) => a + p.amount, 0);
    const openComplaints = complaints.filter((c) => !c.status.startsWith('Routed')).length;
    return {
      hospitals: hospitals.length,
      doctors: doctors.length,
      patients: patients.length,
      revenueCollected,
      revenuePending,
      openComplaints,
    };
  }, [hospitals, doctors, patients, complaints]);

  const report = useMemo(() => {
    const inScope = (id) => reportHospital === 'all' || id === reportHospital;
    const pts = patients.filter((p) => inScope(p.hospitalId));
    const docs = doctors.filter((d) => inScope(d.hospitalId));
    const collected = pts.filter((p) => p.payment === 'Paid').reduce((a, p) => a + p.amount, 0);
    const pending = pts.filter((p) => p.payment !== 'Paid').reduce((a, p) => a + p.amount, 0);
    const byKashaya = KASHAYA_OPTIONS.map((k) => ({
      k,
      n: pts.filter((p) => p.kashaya === k).length,
    }));
    return { pts, docs, collected, pending, byKashaya };
  }, [patients, doctors, reportHospital]);

  const filteredDoctors = doctors.filter((d) => docHospital === 'all' || d.hospitalId === docHospital);
  const filteredPatients = patients.filter((p) => patHospital === 'all' || p.hospitalId === patHospital);

  return (
    <div className="adm">
      <header className="adm__topbar">
        <Link to="/home" className="adm__brand">
          <img src={logo} alt="" className="adm__logo" aria-hidden="true" />
          <span className="adm__wordmark">
            Vediks<span>haya</span>
          </span>
          <span className="adm__badge">Admin Console</span>
        </Link>
        <Link to="/home" className="adm__exit">
          Exit
        </Link>
      </header>

      <div className="adm__shell">
        <nav className="adm__rail">
          {TABS.map((t) => (
            <button
              key={t}
              className={`adm__tab ${tab === t ? 'adm__tab--on' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
              {t === 'Complaints' && overview.openComplaints > 0 && (
                <span className="adm__tab-dot">{overview.openComplaints}</span>
              )}
            </button>
          ))}
        </nav>

        <main className="adm__main">
          {toast && <div className="adm__toast">{toast}</div>}

          {tab === 'Overview' && (
            <section>
              <h1 className="adm__h1">Network overview</h1>
              <div className="adm__stats">
                <Stat label="Hospitals" value={overview.hospitals} />
                <Stat label="Doctors" value={overview.doctors} />
                <Stat label="Patients" value={overview.patients} />
                <Stat label="Revenue collected" value={inr(overview.revenueCollected)} tone="good" />
                <Stat label="Revenue pending" value={inr(overview.revenuePending)} tone="warn" />
                <Stat label="Open complaints" value={overview.openComplaints} tone={overview.openComplaints ? 'warn' : 'good'} />
              </div>

              <h2 className="adm__h2">Hospitals at a glance</h2>
              <div className="adm__table-wrap">
                <table className="adm__table">
                  <thead>
                    <tr>
                      <th>Hospital</th><th>City</th><th>Doctors</th><th>Patients</th><th>Collected</th><th>Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hospitals.map((h) => {
                      const hp = patients.filter((p) => p.hospitalId === h.id);
                      return (
                        <tr key={h.id}>
                          <td>{h.name}</td>
                          <td>{h.city}</td>
                          <td>{doctors.filter((d) => d.hospitalId === h.id).length}</td>
                          <td>{hp.length}</td>
                          <td className="adm__num">{inr(hp.filter((p) => p.payment === 'Paid').reduce((a, p) => a + p.amount, 0))}</td>
                          <td className="adm__num">{inr(hp.filter((p) => p.payment !== 'Paid').reduce((a, p) => a + p.amount, 0))}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === 'Hospitals' && (
            <section>
              <div className="adm__head">
                <h1 className="adm__h1">Hospitals <span>{hospitals.length}</span></h1>
                <button className="adm__btn" onClick={() => setShowHForm((v) => !v)}>
                  {showHForm ? 'Cancel' : '+ Add hospital'}
                </button>
              </div>
              {showHForm && (
                <form className="adm__form" onSubmit={addHospital}>
                  <input name="name" placeholder="Hospital name" required />
                  <input name="city" placeholder="City" />
                  <select name="tier" defaultValue="Partner">
                    <option>Partner</option><option>Flagship</option>
                  </select>
                  <input name="pods" type="number" min="0" placeholder="Pods" />
                  <button className="adm__btn adm__btn--primary" type="submit">Add</button>
                </form>
              )}
              <div className="adm__table-wrap">
                <table className="adm__table">
                  <thead>
                    <tr><th>Name</th><th>City</th><th>Tier</th><th>Pods</th><th>Joined</th><th></th></tr>
                  </thead>
                  <tbody>
                    {hospitals.map((h) => (
                      <tr key={h.id}>
                        <td>{h.name}</td>
                        <td>{h.city}</td>
                        <td><span className="adm__pill">{h.tier}</span></td>
                        <td>{h.pods}</td>
                        <td>{h.joined}</td>
                        <td><button className="adm__link-danger" onClick={() => removeHospital(h.id)}>Remove</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === 'Doctors' && (
            <section>
              <div className="adm__head">
                <h1 className="adm__h1">Doctors <span>{filteredDoctors.length}</span></h1>
                <div className="adm__head-right">
                  <select value={docHospital} onChange={(e) => setDocHospital(e.target.value)}>
                    <option value="all">All hospitals</option>
                    {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                  <button className="adm__btn" onClick={() => setShowDForm((v) => !v)}>
                    {showDForm ? 'Cancel' : '+ Add doctor'}
                  </button>
                </div>
              </div>
              {showDForm && (
                <form className="adm__form" onSubmit={addDoctor}>
                  <input name="name" placeholder="Doctor name" required />
                  <select name="hospitalId" required defaultValue="">
                    <option value="" disabled>Hospital…</option>
                    {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                  <input name="speciality" placeholder="Speciality" />
                  <input name="reg" placeholder="Reg. no." />
                  <button className="adm__btn adm__btn--primary" type="submit">Add</button>
                </form>
              )}
              <div className="adm__table-wrap">
                <table className="adm__table">
                  <thead><tr><th>Name</th><th>Hospital</th><th>Speciality</th><th>Reg. no.</th><th>Patients</th><th></th></tr></thead>
                  <tbody>
                    {filteredDoctors.map((d) => (
                      <tr key={d.id}>
                        <td>{d.name}</td>
                        <td>{hName(d.hospitalId)}</td>
                        <td>{d.speciality}</td>
                        <td>{d.reg}</td>
                        <td>{patients.filter((p) => p.doctorId === d.id).length}</td>
                        <td><button className="adm__link-danger" onClick={() => removeDoctor(d.id)}>Remove</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === 'Patients' && (
            <section>
              <div className="adm__head">
                <h1 className="adm__h1">Patient records <span>{filteredPatients.length}</span></h1>
                <div className="adm__head-right">
                  <select value={patHospital} onChange={(e) => setPatHospital(e.target.value)}>
                    <option value="all">All hospitals</option>
                    {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                  <button className="adm__btn" onClick={() => setShowPForm((v) => !v)}>
                    {showPForm ? 'Cancel' : '+ Add patient'}
                  </button>
                </div>
              </div>
              {showPForm && (
                <form className="adm__form adm__form--wide" onSubmit={addPatient}>
                  <input name="name" placeholder="Patient name" required />
                  <select name="hospitalId" required defaultValue="">
                    <option value="" disabled>Hospital…</option>
                    {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                  <select name="doctorId" defaultValue="">
                    <option value="">Doctor…</option>
                    {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <select name="kashaya" defaultValue={KASHAYA_OPTIONS[0]}>
                    {KASHAYA_OPTIONS.map((k) => <option key={k}>{k}</option>)}
                  </select>
                  <input name="amount" type="number" min="0" placeholder="Amount ₹" />
                  <select name="payment" defaultValue="Pending"><option>Pending</option><option>Paid</option></select>
                  <button className="adm__btn adm__btn--primary" type="submit">Add</button>
                </form>
              )}
              <div className="adm__table-wrap">
                <table className="adm__table">
                  <thead><tr><th>Patient</th><th>Hospital</th><th>Doctor</th><th>Kashaya</th><th>Last dose</th><th>Payment</th><th></th></tr></thead>
                  <tbody>
                    {filteredPatients.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{hName(p.hospitalId)}</td>
                        <td>{dName(p.doctorId)}</td>
                        <td>{p.kashaya}</td>
                        <td>{p.lastDose}</td>
                        <td><span className={`adm__tag adm__tag--${p.payment === 'Paid' ? 'ok' : 'warn'}`}>{p.payment}</span></td>
                        <td><button className="adm__link-danger" onClick={() => removePatient(p.id)}>Remove</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === 'Payments' && (
            <section>
              <h1 className="adm__h1">Payment status</h1>
              <div className="adm__stats adm__stats--3">
                <Stat label="Collected" value={inr(overview.revenueCollected)} tone="good" />
                <Stat label="Pending" value={inr(overview.revenuePending)} tone="warn" />
                <Stat
                  label="Collection rate"
                  value={`${Math.round((overview.revenueCollected / Math.max(1, overview.revenueCollected + overview.revenuePending)) * 100)}%`}
                />
              </div>
              <div className="adm__table-wrap">
                <table className="adm__table">
                  <thead><tr><th>Patient</th><th>Hospital</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {patients.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{hName(p.hospitalId)}</td>
                        <td className="adm__num">{inr(p.amount)}</td>
                        <td><span className={`adm__tag adm__tag--${p.payment === 'Paid' ? 'ok' : 'warn'}`}>{p.payment}</span></td>
                        <td>
                          <button className="adm__link" onClick={() => togglePayment(p.id)}>
                            Mark {p.payment === 'Paid' ? 'Pending' : 'Paid'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === 'Reports' && (
            <section>
              <div className="adm__head">
                <h1 className="adm__h1">Reports</h1>
                <select value={reportHospital} onChange={(e) => setReportHospital(e.target.value)}>
                  <option value="all">All hospitals</option>
                  {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <p className="adm__report-scope">
                {reportHospital === 'all'
                  ? `Aggregated across ${hospitals.length} hospitals`
                  : `Scoped to ${hName(reportHospital)}`}
              </p>
              <div className="adm__stats">
                <Stat label="Patients treated" value={report.pts.length} />
                <Stat label="Doctors" value={report.docs.length} />
                <Stat label="Revenue collected" value={inr(report.collected)} tone="good" />
                <Stat label="Revenue pending" value={inr(report.pending)} tone="warn" />
              </div>
              <h2 className="adm__h2">Doses by formulation</h2>
              <div className="adm__bars">
                {report.byKashaya.map(({ k, n }) => {
                  const max = Math.max(1, ...report.byKashaya.map((x) => x.n));
                  return (
                    <div className="adm__bar-row" key={k}>
                      <span className="adm__bar-label">{k}</span>
                      <span className="adm__bar-track">
                        <span className="adm__bar-fill" style={{ width: `${(n / max) * 100}%` }} />
                      </span>
                      <span className="adm__bar-val">{n}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {tab === 'Complaints' && (
            <section>
              <h1 className="adm__h1">User complaints</h1>
              <div className="adm__table-wrap">
                <table className="adm__table">
                  <thead><tr><th>From</th><th>Hospital</th><th>Subject</th><th>Priority</th><th>Opened</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {complaints.map((c) => {
                      const routed = c.status.startsWith('Routed');
                      return (
                        <tr key={c.id}>
                          <td>{c.from}</td>
                          <td>{hName(c.hospitalId)}</td>
                          <td>{c.subject}</td>
                          <td><span className={`adm__pill adm__pill--${c.priority.toLowerCase()}`}>{c.priority}</span></td>
                          <td>{c.opened}</td>
                          <td><span className={`adm__tag ${routed ? 'adm__tag--routed' : 'adm__tag--warn'}`}>{c.status}</span></td>
                          <td>
                            <button className="adm__btn adm__btn--sm" disabled={routed} onClick={() => routeComplaint(c.id)}>
                              {routed ? 'Routed' : 'Route to customer care'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div className={`adm__stat ${tone ? `adm__stat--${tone}` : ''}`}>
      <span className="adm__stat-value">{value}</span>
      <span className="adm__stat-label">{label}</span>
    </div>
  );
}
