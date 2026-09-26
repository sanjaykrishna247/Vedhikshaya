import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { kashayaByName } from '../../../portal/portalData';
import { activeSlots } from '../../../portal/portalLogic';
import { usePortal } from '../../../portal/PortalContext';
import { Loading } from '../shared';
import { useDashLang } from '../../dashboard/dashI18n';
import PatientShell from './PatientShell';
import { usePatient } from './usePatientNav';
import { SLOT_ICON } from './slotIcons';
import '../portal.css';

const fmtDate = (ts) => new Date(ts).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });

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

  return (
    <PatientShell>
      <div className="rxc">
        <section className="rxc__card rxc__medicine">
          <p className="rxc__label">{t('pp.medicine')}</p>
          <h1 className="rxc__med-name">{k.name}</h1>
          {/* the native name is stored in Devanagari only, so it's shown for Hindi */}
          {lang === 'hi' && k.sanskrit && <p className="rxc__med-native">{k.sanskrit}</p>}
          <p className="rxc__text">{k.benefit}</p>
          <div className="rxc__med-facts">
            <span>{t('pp.dosesDaily', { n: slots.length })}</span>
            <span>{t('pp.courseLabel', { n: rx.durationWeeks })}</span>
          </div>
        </section>

        <section className="rxc__card rxc__condition">
          <p className="rxc__label">{t('pp.yourCondition')}</p>
          <p className="rxc__condition-name">{patient.condition}</p>
          {clinical?.symptoms?.length ? (
            <>
              <p className="rxc__sublabel">{t('pp.notedBy', { name: clinical.notedBy })}</p>
              <ul className="rxc__symptoms">
                {clinical.symptoms.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="rxc__muted">{t('pp.notRecorded')}</p>
          )}
        </section>

        <section className="rxc__card rxc__doctor">
          <p className="rxc__label">{t('pp.yourDoctor')}</p>
          <div className="rxc__doctor-row">
            <span className="rxc__avatar">{initials}</span>
            <div>
              <p className="rxc__doctor-name">{rx.updatedBy}</p>
              <p className="rxc__muted">{doctor.speciality}</p>
            </div>
          </div>
          <p className="rxc__muted rxc__hospital">{doctor.hospitalName}</p>
          <div className="rxc__doctor-foot">
            <span className={`rxc__presence ${doctor.available ? 'is-on' : ''}`}>
              <i />
              {doctor.available ? t('pt.available') : t('pt.busy')}
            </span>
            <Link to="/patient/chat" className="rxc__btn rxc__btn--ghost">{t('pp.message')}</Link>
          </div>
        </section>

        <section className="rxc__card rxc__schedule">
          <p className="rxc__label">{t('pp.howToTake')}</p>
          <div className="rxc__doses">
            {slots.map((s) => {
              const [clock, ampm] = rx.schedule[s].time.split(' ');
              return (
                <div key={s} className={`rxc__dose is-${s}`}>
                  <span className="rxc__dose-icon">{SLOT_ICON[s]}</span>
                  <div>
                    <p className="rxc__dose-slot">{t(`slot.${s}`)}</p>
                    <p className="rxc__dose-time">
                      {clock} <small>{ampm}</small>
                    </p>
                    <p className="rxc__dose-food">
                      {t(rx.schedule[s].food === 'before' ? 'slot.beforeFood' : 'slot.afterFood')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rxc__card rxc__notes">
          <p className="rxc__label">{t('pp.doctorNotes')}</p>
          <p className="rxc__notes-text">{rx.notes}</p>
          <p className="rxc__muted">— {rx.updatedBy}</p>
        </section>

        <section className="rxc__card rxc__course">
          <p className="rxc__label">{t('pp.courseLabel', { n: rx.durationWeeks })}</p>
          <p className="rxc__course-now">
            {t('pp.weekN', { n: rx.weekOf })} <small>{t('pp.of', { n: rx.durationWeeks })}</small>
          </p>
          <ol className="rxc__weeks" aria-hidden="true">
            {Array.from({ length: rx.durationWeeks }, (_, i) => (
              <li key={i} className={i + 1 < rx.weekOf ? 'is-done' : i + 1 === rx.weekOf ? 'is-now' : ''} />
            ))}
          </ol>
          <p className="rxc__muted">{t('pp.weeksLeft', { n: weeksLeft })}</p>
        </section>

        <section className="rxc__card rxc__caution">
          <p className="rxc__label">{t('pp.contra')}</p>
          <p className="rxc__text">{k.contraindications}</p>
        </section>

        <section className="rxc__card rxc__afi">
          <p className="rxc__label">{t('pp.afiSpec')}</p>
          <p className="rxc__text rxc__text--sm">{k.afi}</p>
        </section>

        <div className="rxc__section-head">
          <h2>{t('pp.vitals')}</h2>
          {vitals?.recordedAt && <p>{t('pp.recordedOn', { d: fmtDate(vitals.recordedAt) })}</p>}
        </div>

        {vitals ? (
          <>
            <Vital label={t('pp.height')} value={vitals.heightCm} unit="cm" />
            <Vital label={t('pp.weight')} value={vitals.weightKg} unit="kg" />
            <Vital
              label={t('pp.bp')}
              value={vitals.bp}
              unit="mmHg"
              note={t(bpCategory(vitals.bp)[0])}
              tone={bpCategory(vitals.bp)[1]}
            />
            <Vital
              label={t('pp.bmi')}
              value={bmi ? bmi.toFixed(1) : '—'}
              note={bmi ? t(bmiCategory(bmi)[0]) : undefined}
              tone={bmi ? bmiCategory(bmi)[1] : undefined}
            />
          </>
        ) : (
          <section className="rxc__card rxc__vitals-empty">
            <p className="rxc__muted">{t('pp.notRecorded')}</p>
          </section>
        )}

        <section className="rxc__card rxc__paper">
          <div>
            <p className="rxc__paper-title">{t('pp.paper')}</p>
            <p className="rxc__muted">{t('pp.paperSub')}</p>
          </div>
          <button type="button" className="rxc__btn" onClick={() => setPaperOpen(true)}>
            {t('pp.viewPaper')}
          </button>
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

function Vital({ label, value, unit, note, tone }) {
  return (
    <section className="rxc__card rxc__vital">
      <p className="rxc__label">{label}</p>
      <p className="rxc__vital-value">
        {value}
        {unit && <small>{unit}</small>}
      </p>
      {note && <p className={`rxc__vital-note is-${tone}`}>{note}</p>}
    </section>
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
          <button type="button" className="rxc__btn" onClick={() => window.print()}>{t('pp.print')}</button>
          <button type="button" className="rxc__btn rxc__btn--ghost" onClick={onClose}>{t('pp.close')}</button>
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
