import { useState } from 'react';
import { usePortal } from '../../../portal/PortalContext';
import { COMPLAINT_CATEGORIES } from '../../../portal/portalData';
import { useDashLang } from '../../dashboard/dashI18n';
import { Loading, useToast } from '../shared';
import PatientShell from './PatientShell';
import { usePatient } from './usePatientNav';
import '../portal.css';

const PRIORITIES = ['Low', 'Medium', 'High'];
const PRIORITY_TONE = { Low: 'good', Medium: 'warn', High: 'bad' };

const STATUS_KEY = {
  Open: 'pr.statusOpen',
  'In Review': 'pr.statusReview',
  'Routed → Customer Care': 'pr.statusRouted',
  Resolved: 'pr.statusResolved',
};
const STATUS_TONE = {
  Open: 'warn',
  'In Review': 'info',
  'Routed → Customer Care': 'info',
  Resolved: 'good',
};

export default function PatientReport() {
  const patient = usePatient();
  const { t } = useDashLang();
  const toast = useToast();
  const { submitComplaint, patientComplaints, tick } = usePortal();

  const [category, setCategory] = useState(COMPLAINT_CATEGORIES[0]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');

  if (!patient) return <PatientShell><Loading /></PatientShell>;

  const history = patientComplaints(patient.id);
  void tick; // re-render when the shared store ticks (e.g. status updated by staff)

  const submit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    submitComplaint(patient.id, { category, subject, description, priority });
    setSubject('');
    setDescription('');
    setPriority('Medium');
    toast(t('pr.submitted'));
  };

  return (
    <PatientShell>
      <div className="pt__page-head">
        <h1 className="pt__h1">{t('pr.title')}</h1>
        <p className="pt__sub">{t('pr.sub')}</p>
      </div>

      <form className="pt__card" onSubmit={submit} style={{ marginBottom: 24 }}>
        <div className="pt__form-grid">
          <div className="pt__field">
            <span className="pt__label">{t('pr.category')}</span>
            <select className="pt__select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {COMPLAINT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`cat.${c}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="pt__field">
            <span className="pt__label">{t('pr.priority')}</span>
            <select className="pt__select" value={priority} onChange={(e) => setPriority(e.target.value)}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="pt__field pt__col-2">
            <span className="pt__label">{t('pr.subject')}</span>
            <input
              className="pt__input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('pr.subjectPlaceholder')}
              maxLength={120}
              required
            />
          </div>
          <div className="pt__field pt__col-2">
            <span className="pt__label">{t('pr.description')}</span>
            <textarea
              className="pt__textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('pr.descriptionPlaceholder')}
              style={{ minHeight: 120 }}
              required
            />
          </div>
        </div>
        <div className="pt__modal-actions" style={{ justifyContent: 'flex-start', marginTop: 16 }}>
          <button type="submit" className="pt__btn pt__btn--primary" disabled={!subject.trim() || !description.trim()}>
            {t('pr.submit')}
          </button>
        </div>
      </form>

      <h2 className="pt__h2">{t('pr.history')}</h2>
      <div className="pt__table-wrap">
        <table className="pt__table">
          <thead>
            <tr>
              <th>{t('pr.colDate')}</th>
              <th>{t('pr.colCategory')}</th>
              <th>{t('pr.colSubject')}</th>
              <th>{t('pr.colPriority')}</th>
              <th>{t('pr.colStatus')}</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 && (
              <tr>
                <td colSpan={5} style={{ color: 'var(--pt-muted)' }}>
                  {t('pr.noHistory')}
                </td>
              </tr>
            )}
            {history.map((c) => (
              <tr key={c.id}>
                <td>{new Date(c.openedAt).toLocaleDateString()}</td>
                <td>{t(`cat.${c.category}`)}</td>
                <td>{c.subject}</td>
                <td>
                  <span className={`pt__pill pt__pill--${PRIORITY_TONE[c.priority] || 'muted'}`}>{c.priority}</span>
                </td>
                <td>
                  <span className={`pt__pill pt__pill--${STATUS_TONE[c.status] || 'muted'}`}>
                    {t(STATUS_KEY[c.status]) || c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PatientShell>
  );
}
