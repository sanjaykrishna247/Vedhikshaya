import { kashayaByName } from '../../../portal/portalData';
import { activeSlots } from '../../../portal/portalLogic';
import { Loading } from '../shared';
import { useDashLang } from '../../dashboard/dashI18n';
import PatientShell from './PatientShell';
import { usePatient } from './usePatientNav';
import '../portal.css';

export default function PatientPrescription() {
  const patient = usePatient();
  const { t } = useDashLang();
  if (!patient) return <PatientShell><Loading /></PatientShell>;

  const rx = patient.prescription;
  const k = kashayaByName(rx.kashaya);
  const slots = activeSlots(rx.schedule);
  const weeksLeft = Math.max(0, rx.durationWeeks - rx.weekOf);
  const progress = Math.min(100, (rx.weekOf / rx.durationWeeks) * 100);

  return (
    <PatientShell>
      <div className="pt__page-head">
        <h1 className="pt__h1">{k.name}</h1>
        <p className="pt__sub">{k.sanskrit} · {t('pp.prescribedBy', { name: rx.updatedBy })}</p>
      </div>

      <div className="pt-rx">
        <div className="pt-rx__main">
          <section className="pt__card">
            <h2 className="pt-sec__title">{t('pp.whatItDoes')}</h2>
            <p className="pt-sec__text">{k.benefit}</p>
          </section>

          <section className="pt__card">
            <h2 className="pt-sec__title">{t('pp.howToTake')}</h2>
            <ul className="pt-rx__schedule">
              {slots.map((s) => {
                const [clock, ampm] = rx.schedule[s].time.split(' ');
                return (
                  <li key={s}>
                    <span className="pt-rx__time">
                      <b>{clock}</b>
                      <small>{ampm}</small>
                    </span>
                    <span className="pt-rx__slot">{t(`slot.${s}`)}</span>
                    <span className="pt-rx__food">
                      {t(rx.schedule[s].food === 'before' ? 'slot.beforeFood' : 'slot.afterFood')}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="pt__card pt-rx__note">
            <h2 className="pt-sec__title">{t('pp.doctorNotes')}</h2>
            <p className="pt-rx__note-text">{rx.notes}</p>
            <p className="pt-rx__note-by">— {rx.updatedBy}</p>
          </section>
        </div>

        <aside className="pt-rx__side">
          <section className="pt__card">
            <div className="pt-rx__course-top">
              <span className="pt-rx__course-week">{t('pp.weekN', { n: rx.weekOf })}</span>
              <span className="pt-rx__course-of">{t('pp.of', { n: rx.durationWeeks })}</span>
            </div>
            <div className="pt-rx__bar"><i style={{ width: `${progress}%` }} /></div>
            <p className="pt-rx__course-left">{weeksLeft}w {t('pp.remaining')}</p>
          </section>

          <section className="pt__card">
            <h2 className="pt-sec__title">{t('pp.ingredients')}</h2>
            <div className="pt-rx__chips">
              {k.ingredients.map((i) => (
                <span key={i}>{i}</span>
              ))}
            </div>
          </section>

          <section className="pt__card pt-rx__warn">
            <h2 className="pt-sec__title">{t('pp.contra')}</h2>
            <p className="pt-sec__text">{k.contraindications}</p>
          </section>

          <section className="pt__card">
            <h2 className="pt-sec__title">{t('pp.afiSpec')}</h2>
            <p className="pt-sec__text pt-sec__text--sm">{k.afi}</p>
          </section>
        </aside>
      </div>
    </PatientShell>
  );
}
