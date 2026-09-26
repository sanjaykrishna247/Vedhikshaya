import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { kashayaByName } from '../../../portal/portalData';
import { activeSlots } from '../../../portal/portalLogic';
import { usePortal } from '../../../portal/PortalContext';
import { Loading, ago } from '../shared';
import { useDashLang } from '../../dashboard/dashI18n';
import PatientShell from './PatientShell';
import { usePatient } from './usePatientNav';
import { SLOT_ICON } from './slotIcons';
import '../portal.css';

const fmtDate = (ts) => new Date(ts).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
const ICON = {
  doc: <svg viewBox="0 0 24 24" {...S}><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></svg>,
  chat: <svg viewBox="0 0 24 24" {...S}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5z" /></svg>,
};

function bmiOf(v) {
  if (!v?.heightCm || !v?.weightKg) return null;
  const m = v.heightCm / 100;
  return v.weightKg / (m * m);
}
function bmiCategory(b) {
  if (b < 18.5) return ['bmi.under', 'warn'];
  if (b < 25) return ['bmi.normal', 'good'];
  if (b < 30) return ['bmi.over', 'warn'];
  return ['bmi.obese', 'bad'];
}
// ACC/AHA categories
function bpCategory(bp) {
  const [sys, dia] = String(bp).split('/').map(Number);
  if (sys >= 140 || dia >= 90) return ['bp.high2', 'bad'];
  if (sys >= 130 || dia >= 80) return ['bp.high1', 'warn'];
  if (sys >= 120) return ['bp.elevated', 'warn'];
  return ['bp.normal', 'good'];
}
function pulseCategory(p) {
  if (p < 60 || p > 100) return ['pulse.out', 'warn'];
  return ['bp.normal', 'good'];
}

function CardHead({ title, aside }) {
  return (
    <header className="rxp__head">
      <h2 className="rxp__head-title">{title}</h2>
      {aside && <span className="rxp__head-aside">{aside}</span>}
    </header>
  );
}

export default function PatientPrescription() {
  const patient = usePatient();
  const { doctor } = usePortal();
  const { t, lang } = useDashLang();
  const [paperOpen, setPaperOpen] = useState(false);
  if (!patient) return <PatientShell><Loading /></PatientShell>;

  const rx = patient.prescription;
  const k = kashayaByName(rx.kashaya);
  const slots = activeSlots(rx.schedule);
  const weeksLeft = Math.max(0, rx.durationWeeks - rx.weekOf);
  const initials = rx.updatedBy.replace(/^Dr\.?\s*/i, '').split(' ').map((w) => w[0]).slice(0, 2).join('');
  const vitals = patient.vitals;
  const bmi = bmiOf(vitals);
  const clinical = patient.clinical;
  const startedAt = clinical?.notedAt || vitals?.recordedAt;

  return (
    <PatientShell>
      <div className="rxp">
        <header className="rxp__page">
          <div>
            <div className="rxp__page-title">
              <h1>{t('pp.title')}</h1>
              <span className="rxp__status">{t('pp.active')}</span>
            </div>
            <p className="rxp__page-sub">
              {startedAt ? `${t('pp.started', { d: fmtDate(startedAt) })} · ` : ''}
              {t('pp.updated', { t: ago(rx.updatedAt || Date.now()) })}
            </p>
          </div>
          <div className="rxp__page-actions">
            <Link to="/patient/chat" className="rxp__btn rxp__btn--ghost">
              {ICON.chat}
              {t('pp.messageDoctor')}
            </Link>
            <button type="button" className="rxp__btn" onClick={() => setPaperOpen(true)}>
              {ICON.doc}
              {t('pp.viewPaper')}
            </button>
          </div>
        </header>

        <section className="rxp__card rxp__medicine">
          <CardHead title={t('pp.medicine')} />
          <div className="rxp__med-body">
            <div className="rxp__med-main">
              <p className="rxp__med-name">{k.name}</p>
              {/* the native name is stored in Devanagari only, so it's shown for Hindi */}
              {lang === 'hi' && k.sanskrit && <p className="rxp__med-native">{k.sanskrit}</p>}
              <p className="rxp__text">{k.benefit}</p>

              <dl className="rxp__facts">
                <div>
                  <dt>{t('pp.dosesPerDay')}</dt>
                  <dd>{slots.length}</dd>
                </div>
                <div>
                  <dt>{t('pp.duration')}</dt>
                  <dd>{t('pp.weeksN', { n: rx.durationWeeks })}</dd>
                </div>
                <div>
                  <dt>{t('pp.progress')}</dt>
                  <dd>{t('pp.weekN', { n: rx.weekOf })}</dd>
                </div>
              </dl>

              <div className="rxp__course">
                <p className="rxp__sub-title">
                  {t('pp.courseLabel', { n: rx.durationWeeks })}
                  <span>{t('pp.weeksLeft', { n: weeksLeft })}</span>
                </p>
                <ol className="rxp__weeks" aria-label={`${t('pp.weekN', { n: rx.weekOf })} ${t('pp.of', { n: rx.durationWeeks })}`}>
                  {Array.from({ length: rx.durationWeeks }, (_, i) => (
                    <li key={i} className={i + 1 < rx.weekOf ? 'is-done' : i + 1 === rx.weekOf ? 'is-now' : ''}>
                      {i + 1}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="rxp__schedule">
              <p className="rxp__sub-title">{t('pp.howToTake')}</p>
              <ul>
                {slots.map((s) => (
                  <li key={s} className={`is-${s}`}>
                    <span className="rxp__slot-icon">{SLOT_ICON[s]}</span>
                    <span className="rxp__slot-name">{t(`slot.${s}`)}</span>
                    <span className="rxp__slot-time">{rx.schedule[s].time}</span>
                    <span className="rxp__slot-food">
                      {t(rx.schedule[s].food === 'before' ? 'slot.beforeFood' : 'slot.afterFood')}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="rxp__prep">
                <b>{t('pp.preparation')}</b> {k.afi}
              </p>
            </div>
          </div>
        </section>

        <section className="rxp__card rxp__doctor">
          <CardHead title={t('pp.yourDoctor')} />
          <div className="rxp__doc-id">
            <span className="rxp__avatar">{initials}</span>
            <div>
              <p className="rxp__doc-name">{rx.updatedBy}</p>
              <p className="rxp__muted">{doctor.speciality}</p>
            </div>
          </div>
          <dl className="rxp__rows">
            <div>
              <dt>{t('pp.hospital')}</dt>
              <dd>{doctor.hospitalName}</dd>
            </div>
            <div>
              <dt>{t('pp.statusLabel')}</dt>
              <dd>
                <span className={`rxp__presence ${doctor.available ? 'is-on' : ''}`}>
                  <i />
                  {doctor.available ? t('pt.available') : t('pt.busy')}
                </span>
              </dd>
            </div>
            <div>
              <dt>{t('pp.lastReview')}</dt>
              <dd>{fmtDate(rx.updatedAt || Date.now())}</dd>
            </div>
          </dl>
        </section>

        <section className="rxp__card rxp__third">
          <CardHead title={t('pp.yourCondition')} />
          <p className="rxp__condition">{patient.condition}</p>
          {clinical?.symptoms?.length ? (
            <>
              <p className="rxp__sub-title">{t('pp.notedBy', { name: clinical.notedBy })}</p>
              <ul className="rxp__bullets">
                {clinical.symptoms.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="rxp__muted">{t('pp.notRecorded')}</p>
          )}
        </section>

        <section className="rxp__card rxp__third">
          <CardHead title={t('pp.doctorNotes')} />
          <p className="rxp__note">{rx.notes}</p>
          <p className="rxp__sign">— {rx.updatedBy}</p>
        </section>

        <section className="rxp__card rxp__third rxp__warn">
          <CardHead title={t('pp.contra')} />
          <p className="rxp__text">{k.contraindications}</p>
        </section>

        <section className="rxp__card rxp__vitals">
          <CardHead title={t('pp.vitals')}
            aside={vitals?.recordedAt ? t('pp.recordedOn', { d: fmtDate(vitals.recordedAt) }) : null}
          />
          {vitals ? (
            <div className="rxp__vitals-grid">
              <Vital label={t('pp.height')} value={vitals.heightCm} unit="cm" />
              <Vital label={t('pp.weight')} value={vitals.weightKg} unit="kg" />
              <Vital
                label={t('pp.bp')}
                value={vitals.bp}
                unit="mmHg"
                status={bpCategory(vitals.bp)}
                range={t('pp.refBp')}
                t={t}
              />
              <Vital
                label={t('pp.pulse')}
                value={vitals.pulse}
                unit="bpm"
                status={pulseCategory(vitals.pulse)}
                range={t('pp.refPulse')}
                t={t}
              />
              <Vital
                label={t('pp.bmi')}
                value={bmi ? bmi.toFixed(1) : '—'}
                unit="kg/m²"
                status={bmi ? bmiCategory(bmi) : null}
                range={t('pp.refBmi')}
                t={t}
              />
            </div>
          ) : (
            <p className="rxp__muted">{t('pp.notRecorded')}</p>
          )}
        </section>
      </div>

      {paperOpen && (
        <PrescriptionPaper
          patient={patient}
          doctor={doctor}
          kashaya={k}
          slots={slots}
          bmi={bmi}
          lang={lang}
          t={t}
          onClose={() => setPaperOpen(false)}
        />
      )}
    </PatientShell>
  );
}

function Vital({ label, value, unit, status, range, t }) {
  return (
    <div className="rxp__vital">
      <p className="rxp__vital-label">{label}</p>
      <p className="rxp__vital-value">
        {value}
        <small>{unit}</small>
      </p>
      {status && <span className={`rxp__chip is-${status[1]}`}>{t(status[0])}</span>}
      {range && <p className="rxp__vital-range">{range}</p>}
    </div>
  );
}

function PrescriptionPaper({ patient, doctor, kashaya: k, slots, bmi, lang, t, onClose }) {
  const rx = patient.prescription;
  const v = patient.vitals;

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  // rendered at <body> so it sits above the sticky portal top bar;
  // pt--patient carries the colour tokens the paper uses
  return createPortal(
    <div className="pt--patient rx-paper-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="rx-paper-wrap" role="dialog" aria-modal="true" aria-label={t('pp.paper')}>
        <div className="rx-paper-actions">
          <button type="button" className="rxp__btn" onClick={() => window.print()}>{t('pp.print')}</button>
          <button type="button" className="rxp__btn rxp__btn--ghost" onClick={onClose}>{t('pp.close')}</button>
        </div>

        <article className="rx-paper">
          <header className="rx-paper__head">
            <div>
              <p className="rx-paper__hospital">{doctor.hospitalName}</p>
              <p className="rx-paper__doctor">{rx.updatedBy} · {doctor.speciality}</p>
            </div>
            <p className="rx-paper__date">{fmtDate(rx.updatedAt || Date.now())}</p>
          </header>

          <dl className="rx-paper__grid">
            <div><dt>{t('pp.patientLabel')}</dt><dd>{patient.name}</dd></div>
            <div><dt>{t('pp.idLabel')}</dt><dd>{patient.id}</dd></div>
            <div><dt>{t('pp.ageSex')}</dt><dd>{patient.age} · {patient.gender}</dd></div>
            <div><dt>{t('pp.conditionLabel')}</dt><dd>{patient.condition}</dd></div>
          </dl>

          {v && (
            <dl className="rx-paper__grid rx-paper__grid--vitals">
              <div><dt>{t('pp.height')}</dt><dd>{v.heightCm} cm</dd></div>
              <div><dt>{t('pp.weight')}</dt><dd>{v.weightKg} kg</dd></div>
              <div><dt>{t('pp.bp')}</dt><dd>{v.bp} mmHg</dd></div>
              <div><dt>{t('pp.pulse')}</dt><dd>{v.pulse} /min</dd></div>
              {bmi && <div><dt>{t('pp.bmi')}</dt><dd>{bmi.toFixed(1)}</dd></div>}
            </dl>
          )}

          {patient.clinical?.symptoms?.length > 0 && (
            <section className="rx-paper__block">
              <h3>{t('pp.symptomsLabel')}</h3>
              <ul>
                {patient.clinical.symptoms.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </section>
          )}

          <section className="rx-paper__block">
            <h3><span className="rx-paper__rx">℞</span> {k.name}{lang === 'hi' && k.sanskrit ? ` (${k.sanskrit})` : ''}</h3>
            <table className="rx-paper__table">
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
            <p className="rx-paper__small">
              {t('pp.courseLabel', { n: rx.durationWeeks })} · {t('pp.weekN', { n: rx.weekOf })}
            </p>
          </section>

          {rx.notes && (
            <section className="rx-paper__block">
              <h3>{t('pp.doctorNotes')}</h3>
              <p>{rx.notes}</p>
            </section>
          )}

          <section className="rx-paper__block">
            <h3>{t('pp.contra')}</h3>
            <p>{k.contraindications}</p>
          </section>

          <footer className="rx-paper__sign">
            <span>{rx.updatedBy}</span>
            <small>{doctor.speciality}</small>
          </footer>
        </article>
      </div>
    </div>,
    document.body,
  );
}
