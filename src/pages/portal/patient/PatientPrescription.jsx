import { kashayaByName } from '../../../portal/portalData';
import { activeSlots } from '../../../portal/portalLogic';
import { usePortal } from '../../../portal/PortalContext';
import { Loading } from '../shared';
import { useDashLang } from '../../dashboard/dashI18n';
import PatientShell from './PatientShell';
import { usePatient } from './usePatientNav';
import { SLOT_ICON } from './slotIcons';
import '../portal.css';

const LEAF = (
  <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
    <path d="M20 104C24 58 52 24 104 16c-4 50-34 84-84 88Z" />
    <path d="M20 104 78 44M44 80c8-2 18-2 28 1M56 66c6-3 14-4 22-3M34 92c6-1 12 0 18 2" />
  </svg>
);

const WARN = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3.5 2.8 19.5h18.4z" />
    <path d="M12 10v4.2M12 17.2h.01" />
  </svg>
);

export default function PatientPrescription() {
  const patient = usePatient();
  const { doctor } = usePortal();
  const { t, lang } = useDashLang();
  if (!patient) return <PatientShell><Loading /></PatientShell>;

  const rx = patient.prescription;
  const k = kashayaByName(rx.kashaya);
  const slots = activeSlots(rx.schedule);
  const weeksLeft = Math.max(0, rx.durationWeeks - rx.weekOf);
  const initials = rx.updatedBy.replace(/^Dr\.?\s*/i, '').split(' ').map((w) => w[0]).slice(0, 2).join('');

  return (
    <PatientShell>
      <div className="rxb">
        <section className="rxb__card rxb__hero">
          <span className="rxb__hero-leaf">{LEAF}</span>
          <p className="rxb__hero-kicker">{t('pp.patientLabel')}: {patient.name} · {patient.condition}</p>
          <h1 className="rxb__hero-name">{k.name}</h1>
          {/* the native name is stored in Devanagari only, so it's shown for Hindi */}
          {lang === 'hi' && k.sanskrit && <p className="rxb__hero-native">{k.sanskrit}</p>}
          <p className="rxb__hero-benefit">{k.benefit}</p>
          <div className="rxb__doctor">
            <span className="rxb__doctor-avatar">{initials}</span>
            <span>
              <b>{t('pp.prescribedBy', { name: rx.updatedBy })}</b>
              <small>{doctor.speciality} · {doctor.hospitalName}</small>
            </span>
          </div>
        </section>

        <section className="rxb__card rxb__course">
          <h2 className="rxb__title">{t('pp.courseLabel', { n: rx.durationWeeks })}</h2>
          <p className="rxb__course-now">
            {t('pp.weekN', { n: rx.weekOf })}
            <span>{t('pp.of', { n: rx.durationWeeks })}</span>
          </p>
          <ol className="rxb__weeks" aria-hidden="true">
            {Array.from({ length: rx.durationWeeks }, (_, i) => (
              <li key={i} className={i + 1 < rx.weekOf ? 'is-done' : i + 1 === rx.weekOf ? 'is-now' : ''}>
                {i + 1}
              </li>
            ))}
          </ol>
          <p className="rxb__muted">{t('pp.weeksLeft', { n: weeksLeft })}</p>
        </section>

        <section className="rxb__card rxb__schedule">
          <h2 className="rxb__title">{t('pp.howToTake')}</h2>
          <div className="rxb__doses">
            {slots.map((s) => {
              const [clock, ampm] = rx.schedule[s].time.split(' ');
              return (
                <div key={s} className={`rxb__dose is-${s}`}>
                  <span className="rxb__dose-icon">{SLOT_ICON[s]}</span>
                  <span className="rxb__dose-slot">{t(`slot.${s}`)}</span>
                  <span className="rxb__dose-time">
                    {clock}
                    <small>{ampm}</small>
                  </span>
                  <span className="rxb__dose-food">
                    {t(rx.schedule[s].food === 'before' ? 'slot.beforeFood' : 'slot.afterFood')}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {rx.notes && (
          <section className="rxb__card rxb__note">
            <h2 className="rxb__title">{t('pp.doctorNotes')}</h2>
            <p className="rxb__note-text">{rx.notes}</p>
            <p className="rxb__note-by">— {rx.updatedBy}</p>
          </section>
        )}

        <section className="rxb__card rxb__ingredients">
          <h2 className="rxb__title">
            {t('pp.ingredients')}
            <span className="rxb__count">{k.ingredients.length}</span>
          </h2>
          <ul>
            {k.ingredients.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </section>

        <section className="rxb__card rxb__caution">
          <h2 className="rxb__title">
            <span className="rxb__caution-icon">{WARN}</span>
            {t('pp.contra')}
          </h2>
          <p>{k.contraindications}</p>
        </section>

        <section className="rxb__card rxb__afi">
          <h2 className="rxb__title">{t('pp.afiSpec')}</h2>
          <p>{k.afi}</p>
        </section>
      </div>
    </PatientShell>
  );
}
