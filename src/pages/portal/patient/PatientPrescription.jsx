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
  const progress = Math.min(100, (rx.weekOf / rx.durationWeeks) * 100);

  return (
    <PatientShell>
      <div className="rxs">
        <header className="rxs__head">
          <div>
            <h1 className="rxs__name">{k.name}</h1>
            {/* the native name is stored in Devanagari only, so it's shown for Hindi */}
            {lang === 'hi' && k.sanskrit && <p className="rxs__native">{k.sanskrit}</p>}
            <p className="rxs__by">
              {t('pp.prescribedBy', { name: rx.updatedBy })}
              {doctor.speciality ? `, ${doctor.speciality}` : ''} · {doctor.hospitalName}
            </p>
          </div>
          <div className="rxs__progress">
            <p>
              <b>{t('pp.weekN', { n: rx.weekOf })} {t('pp.of', { n: rx.durationWeeks })}</b>
              <span>{t('pp.weeksLeft', { n: weeksLeft })}</span>
            </p>
            <div className="rxs__bar"><i style={{ width: `${progress}%` }} /></div>
          </div>
        </header>

        <div className="rxs__grid">
          <div className="rxs__col">
            <section className="rxs__card">
              <h2 className="rxs__label">{t('pp.howToTake')}</h2>
              <ul className="rxs__doses">
                {slots.map((s) => (
                  <li key={s}>
                    <span className="rxs__dose-slot">{t(`slot.${s}`)}</span>
                    <span className="rxs__dose-time">{rx.schedule[s].time}</span>
                    <span className="rxs__dose-food">
                      {t(rx.schedule[s].food === 'before' ? 'slot.beforeFood' : 'slot.afterFood')}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {rx.notes && (
              <section className="rxs__card">
                <h2 className="rxs__label">{t('pp.doctorNotes')}</h2>
                <p className="rxs__text rxs__text--lg">{rx.notes}</p>
                <p className="rxs__meta">{rx.updatedBy}</p>
              </section>
            )}

            <section className="rxs__card">
              <h2 className="rxs__label">{t('pp.whatItDoes')}</h2>
              <p className="rxs__text">{k.benefit}</p>
            </section>
          </div>

          <div className="rxs__col">
            <section className="rxs__card">
              <h2 className="rxs__label">{t('pp.ingredients')}</h2>
              <ul className="rxs__ingredients">
                {k.ingredients.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </section>

            <section className="rxs__card rxs__card--warn">
              <h2 className="rxs__label">{t('pp.contra')}</h2>
              <p className="rxs__text">{k.contraindications}</p>
            </section>

            <section className="rxs__card">
              <h2 className="rxs__label">{t('pp.afiSpec')}</h2>
              <p className="rxs__text rxs__text--sm">{k.afi}</p>
            </section>
          </div>
        </div>
      </div>
    </PatientShell>
  );
}
