import { kashayaByName } from '../../../portal/portalData';
import { activeSlots } from '../../../portal/portalLogic';
import { usePortal } from '../../../portal/PortalContext';
import { Loading } from '../shared';
import { useDashLang } from '../../dashboard/dashI18n';
import PatientShell from './PatientShell';
import { usePatient } from './usePatientNav';
import '../portal.css';

export default function PatientPrescription() {
  const patient = usePatient();
  const { doctor } = usePortal();
  const { t, lang } = useDashLang();
  if (!patient) return <PatientShell><Loading /></PatientShell>;

  const rx = patient.prescription;
  const k = kashayaByName(rx.kashaya);
  const slots = activeSlots(rx.schedule);
  const weeksLeft = Math.max(0, rx.durationWeeks - rx.weekOf);
  const issued = new Date(rx.updatedAt || Date.now()).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <PatientShell>
      <article className="rx-slip">
        <header className="rx-slip__letterhead">
          <div>
            <p className="rx-slip__hospital">{doctor.hospitalName}</p>
            <p className="rx-slip__doctor">
              {rx.updatedBy}
              {doctor.speciality ? ` · ${doctor.speciality}` : ''}
            </p>
          </div>
          <p className="rx-slip__date">{issued}</p>
        </header>

        <dl className="rx-slip__patient">
          <div>
            <dt>{t('pp.patientLabel')}</dt>
            <dd>
              {patient.name}
              <span>
                {patient.age} · {patient.gender} · {patient.id}
              </span>
            </dd>
          </div>
          <div>
            <dt>{t('pp.conditionLabel')}</dt>
            <dd>{patient.condition}</dd>
          </div>
        </dl>

        <section className="rx-slip__body">
          <span className="rx-slip__mark" aria-hidden="true">℞</span>
          <div className="rx-slip__med">
            <h1 className="rx-slip__name">{k.name}</h1>
            {/* the native name is stored in Devanagari only, so it's shown for Hindi */}
            {lang === 'hi' && k.sanskrit && <p className="rx-slip__native">{k.sanskrit}</p>}
            <p className="rx-slip__benefit">{k.benefit}</p>

            <table className="rx-slip__table">
              <thead>
                <tr>
                  <th>{t('pp.colDose')}</th>
                  <th>{t('pp.colTime')}</th>
                  <th>{t('pp.colFood')}</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((s) => (
                  <tr key={s}>
                    <td>{t(`slot.${s}`)}</td>
                    <td className="rx-slip__time">{rx.schedule[s].time}</td>
                    <td>{t(rx.schedule[s].food === 'before' ? 'slot.beforeFood' : 'slot.afterFood')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="rx-slip__course">
              <p>
                {t('pp.courseLabel', { n: rx.durationWeeks })}
                <span>
                  {t('pp.weekN', { n: rx.weekOf })} · {t('pp.weeksLeft', { n: weeksLeft })}
                </span>
              </p>
              <ol className="rx-slip__weeks" aria-hidden="true">
                {Array.from({ length: rx.durationWeeks }, (_, i) => (
                  <li key={i} className={i + 1 < rx.weekOf ? 'is-done' : i + 1 === rx.weekOf ? 'is-now' : ''}>
                    {i + 1}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {rx.notes && (
          <section className="rx-slip__notes">
            <h2>{t('pp.doctorNotes')}</h2>
            <p className="rx-slip__notes-text">{rx.notes}</p>
            <p className="rx-slip__sign">{rx.updatedBy}</p>
          </section>
        )}

        <footer className="rx-slip__fine">
          <div>
            <h2>{t('pp.ingredients')}</h2>
            <p>{k.ingredients.join(', ')}</p>
          </div>
          <div className="rx-slip__caution">
            <h2>{t('pp.contra')}</h2>
            <p>{k.contraindications}</p>
          </div>
          <div>
            <h2>{t('pp.afiSpec')}</h2>
            <p>{k.afi}</p>
          </div>
        </footer>
      </article>
    </PatientShell>
  );
}
