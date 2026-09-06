import { kashayaByName } from '../../../portal/portalData';
import { activeSlots, slotLabel } from '../../../portal/portalLogic';
import { Loading } from '../shared';
import PatientShell from './PatientShell';
import { usePatient } from './usePatientNav';
import '../portal.css';

export default function PatientPrescription() {
  const patient = usePatient();
  if (!patient) return <PatientShell><Loading /></PatientShell>;

  const rx = patient.prescription;
  const k = kashayaByName(rx.kashaya);
  const slots = activeSlots(rx.schedule);
  const weeksLeft = Math.max(0, rx.durationWeeks - rx.weekOf);

  return (
    <PatientShell>
      <div className="pt__page-head">
        <h1 className="pt__h1">{k.name}</h1>
        <p className="pt__sub">{k.sanskrit} · prescribed by {rx.updatedBy}</p>
      </div>

      <div className="pt__card">
        <h2 className="pt__h2" style={{ marginTop: 0 }}>What it does for your body</h2>
        <p style={{ color: 'var(--pt-body)', fontSize: '0.9rem', lineHeight: 1.6 }}>{k.benefit}</p>
      </div>

      <h2 className="pt__h2">How to take it</h2>
      <div className="pt__table-wrap">
        <table className="pt__table">
          <thead>
            <tr>
              <th>Dose</th>
              <th>Time</th>
              <th>Food</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((s) => (
              <tr key={s}>
                <td>{slotLabel(s)}</td>
                <td>{rx.schedule[s].time}</td>
                <td>{rx.schedule[s].food === 'before' ? 'Before food' : 'After food'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt__stats" style={{ marginTop: 18 }}>
        <div className="pt__stat">
          <span className="pt__stat-value">Week {rx.weekOf}</span>
          <span className="pt__stat-label">of {rx.durationWeeks}</span>
        </div>
        <div className="pt__stat">
          <span className="pt__stat-value">{weeksLeft}w</span>
          <span className="pt__stat-label">remaining</span>
        </div>
      </div>

      <h2 className="pt__h2">Doctor's notes</h2>
      <div className="pt__card">
        <p style={{ margin: 0, color: 'var(--pt-body)', fontSize: '0.9rem', lineHeight: 1.6 }}>{rx.notes}</p>
      </div>

      <h2 className="pt__h2">Ingredients</h2>
      <div className="pt__card">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {k.ingredients.map((i) => (
            <span key={i} className="pt__pill pt__pill--muted">{i}</span>
          ))}
        </div>
      </div>

      <h2 className="pt__h2">Contraindications</h2>
      <div className="pt__card">
        <p style={{ margin: 0, color: 'var(--pt-body)', fontSize: '0.9rem', lineHeight: 1.6 }}>{k.contraindications}</p>
      </div>

      <h2 className="pt__h2">AFI specification</h2>
      <div className="pt__card">
        <p style={{ margin: 0, color: 'var(--pt-body)', fontSize: '0.9rem', lineHeight: 1.6 }}>{k.afi}</p>
      </div>
    </PatientShell>
  );
}
