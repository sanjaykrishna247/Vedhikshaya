import { kashayaByName } from '../../../portal/portalData';
import { activeSlots } from '../../../portal/portalLogic';
import { Loading, ago } from '../shared';
import { useDashLang } from '../../dashboard/dashI18n';
import PatientShell from './PatientShell';
import { usePatient } from './usePatientNav';
import '../portal.css';

export default function PatientPrescription() {
  const patient = usePatient();
  const { t, lang } = useDashLang();
  if (!patient) return <PatientShell><Loading /></PatientShell>;

  const rx = patient.prescription;
  const k = kashayaByName(rx.kashaya);
  const slots = activeSlots(rx.schedule);
  const weeksLeft = Math.max(0, rx.durationWeeks - rx.weekOf);

  return (
    <PatientShell>
      <section className="pt-rx__hero">
        <div className="pt-rx__hero-main">
          <p className="pt-rx__eyebrow">{t('pp.yourPrescription')}</p>
          <h1 className="pt-rx__name">{k.name}</h1>
          {/* the native name is stored in Devanagari only, so it's shown for Hindi */}
          {lang === 'hi' && k.sanskrit && <p className="pt-rx__native">{k.sanskrit}</p>}
          <p className="pt-rx__meta">
            {t('pp.prescribedBy', { name: rx.updatedBy })}
            {rx.updatedAt ? ` · ${t('pp.updated', { t: ago(rx.updatedAt) })}` : ''}
          </p>
        </div>

        <div className="pt-rx__course">
          <p className="pt-rx__course-label">
            <b>{t('pp.weekN', { n: rx.weekOf })}</b> {t('pp.of', { n: rx.durationWeeks })}
          </p>
          <div className="pt-rx__weeks" aria-hidden="true">
            {Array.from({ length: rx.durationWeeks }, (_, i) => (
              <i
                key={i}
                className={i + 1 < rx.weekOf ? 'is-done' : i + 1 === rx.weekOf ? 'is-now' : ''}
              />
            ))}
          </div>
          <p className="pt-rx__course-left">{t('pp.weeksLeft', { n: weeksLeft })}</p>
        </div>
      </section>

      <div className="pt-rx">
        <div className="pt-rx__main">
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
                    <span className="pt-rx__slot">
                      <b>{t(`slot.${s}`)}</b>
                      <small>{t(rx.schedule[s].food === 'before' ? 'slot.beforeFood' : 'slot.afterFood')}</small>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          {rx.notes && (
            <section className="pt-rx__note">
              <p className="pt-rx__note-label">{t('pp.doctorNotes')}</p>
              <p className="pt-rx__note-text">{rx.notes}</p>
              <p className="pt-rx__note-by">— {rx.updatedBy}</p>
            </section>
          )}

          <section className="pt__card">
            <h2 className="pt-sec__title">{t('pp.whatItDoes')}</h2>
            <p className="pt-sec__text">{k.benefit}</p>
          </section>
        </div>

        <aside className="pt__card pt-rx__details">
          <div className="pt-rx__detail">
            <h2 className="pt-rx__detail-title">
              {t('pp.ingredients')}
              <span>{k.ingredients.length}</span>
            </h2>
            <ul className="pt-rx__ingredients">
              {k.ingredients.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>

          <div className="pt-rx__detail pt-rx__detail--warn">
            <h2 className="pt-rx__detail-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3.5 2.8 19.5h18.4z" />
                <path d="M12 10v4.2M12 17.2h.01" />
              </svg>
              {t('pp.contra')}
            </h2>
            <p className="pt-sec__text pt-sec__text--sm">{k.contraindications}</p>
          </div>

          <div className="pt-rx__detail">
            <h2 className="pt-rx__detail-title">{t('pp.afiSpec')}</h2>
            <p className="pt-sec__text pt-sec__text--sm">{k.afi}</p>
          </div>
        </aside>
      </div>
    </PatientShell>
  );
}
