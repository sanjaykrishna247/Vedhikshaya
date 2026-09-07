import { useEffect, useMemo, useRef, useState } from 'react';
import { usePortal } from '../../../portal/PortalContext';
import { todayYmd } from '../../../portal/portalData';
import { Loading, clockTime } from '../shared';
import { useDashLang } from '../../dashboard/dashI18n';
import PatientShell from './PatientShell';
import { usePatient } from './usePatientNav';
import '../portal.css';

const QUERY_TEMPLATE_KEYS = ['qt.missedDose', 'qt.withFood', 'qt.sideEffects', 'qt.appointment'];

export default function PatientChat() {
  const patient = usePatient();
  const { t } = useDashLang();
  const { doctor, getChat, sendMessage, markChatRead, tick } = usePortal();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);

  const messages = useMemo(() => (patient ? getChat(patient.id) : []), [patient, tick]);

  useEffect(() => {
    if (patient) markChatRead(patient.id, 'patient');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  if (!patient) return <PatientShell><Loading /></PatientShell>;

  const send = (text) => {
    const value = text.trim();
    if (!value) return;
    sendMessage(patient.id, { sender: 'patient', text: value });
    setDraft('');
  };

  const attachSymptom = () => {
    const log = patient.symptoms?.[todayYmd()];
    if (!log) {
      send(t('pch.noSymptomYet'));
      return;
    }
    const label = t(`sym.${log.feeling}`);
    send(`${t('pch.feeling', { label })}${log.note ? ` — ${log.note}` : ''}`);
  };

  return (
    <PatientShell>
      <div className="pt__page-head">
        <h1 className="pt__h1">{t('pch.title')}</h1>
      </div>

      <div className="pt__chat" style={{ gridTemplateColumns: '1fr' }}>
        <div className="pt__chat-panel">
          <div className="pt__chat-head">
            <div>
              <div className="pt__chat-head-name">{doctor.name}</div>
              <div className="pt__chat-head-sub">{doctor.hospitalName}</div>
            </div>
            <span className={`pt__pill ${doctor.available ? 'pt__pill--good' : 'pt__pill--bad'}`}>
              {doctor.available ? `🟢 ${t('pt.available')}` : `🔴 ${t('pt.busy')}`}
            </span>
          </div>

          <div className="pt__chat-scroll" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="pt__notif-empty">{t('dc.noMsgsPatient')}</div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`pt__msg ${m.sender === 'patient' ? 'pt__msg--me' : 'pt__msg--them'} ${m.auto ? 'pt__msg--auto' : ''}`}
              >
                {m.message}
                <span className="pt__msg-time">
                  {clockTime(m.timestamp)}
                  {m.sender === 'patient' && (m.read ? ` · ✓✓ ${t('p.read')}` : ` · ✓ ${t('p.sent')}`)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt__quick">
            {QUERY_TEMPLATE_KEYS.map((key) => (
              <button key={key} onClick={() => send(t(key))}>
                {t(key)}
              </button>
            ))}
            <button onClick={attachSymptom}>{t('pch.attachSymptom')}</button>
          </div>

          <form
            className="pt__chat-compose"
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
          >
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t('p.typeMessage')} />
            <button className="pt__btn pt__btn--primary" type="submit">
              {t('p.send')}
            </button>
          </form>
        </div>
      </div>
    </PatientShell>
  );
}
