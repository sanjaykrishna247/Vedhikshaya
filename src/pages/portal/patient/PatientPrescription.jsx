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

  return (
    <PatientShell>
      <div className="pt__page-head">
        <h1 className="pt__h1">{k.name}</h1>
        <p className="pt__sub">{k.sanskrit} · {t('pp.prescribedBy', { name: rx.updatedBy })}</p>
      </div>

      <div className="pt__card">
        <h2 className="pt__h2" style={{ marginTop: 0 }}>{t('pp.whatItDoes')}</h2>
        <p style={{ color: 'var(--pt-body)', fontSize: '0.9rem', lineHeight: 1.6 }}>{k.benefit}</p>
      </div>

      <h2 className="pt__h2">{t('pp.howToTake')}</h2>
      <div className="pt__table-wrap">
        <table className="pt__table">
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
                <td>{rx.schedule[s].time}</td>
                <td>{t(rx.schedule[s].food === 'before' ? 'slot.beforeFood' : 'slot.afterFood')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt__stats" style={{ marginTop: 18 }}>
        <div className="pt__stat">
          <span className="pt__stat-value">{t('pp.weekN', { n: rx.weekOf })}</span>
          <span className="pt__stat-label">{t('pp.of', { n: rx.durationWeeks })}</span>
        </div>
        <div className="pt__stat">
          <span className="pt__stat-value">{weeksLeft}w</span>
          <span className="pt__stat-label">{t('pp.remaining')}</span>
        </div>
      </div>

      <h2 className="pt__h2">{t('pp.doctorNotes')}</h2>
      <div className="pt__card">
        <p style={{ margin: 0, color: 'var(--pt-body)', fontSize: '0.9rem', lineHeight: 1.6 }}>{rx.notes}</p>
      </div>

      <h2 className="pt__h2">{t('pp.ingredients')}</h2>
      <div className="pt__card">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {k.ingredients.map((i) => (
            <span key={i} className="pt__pill pt__pill--muted">{i}</span>
          ))}
        </div>
      </div>

      <h2 className="pt__h2">{t('pp.contra')}</h2>
      <div className="pt__card">
        <p style={{ margin: 0, color: 'var(--pt-body)', fontSize: '0.9rem', lineHeight: 1.6 }}>{k.contraindications}</p>
      </div>

      <h2 className="pt__h2">{t('pp.afiSpec')}</h2>
      <div className="pt__card">
        <p style={{ margin: 0, color: 'var(--pt-body)', fontSize: '0.9rem', lineHeight: 1.6 }}>{k.afi}</p>
      </div>
    </PatientShell>
  );
}
