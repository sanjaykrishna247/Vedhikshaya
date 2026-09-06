import { useEffect, useMemo, useRef, useState } from 'react';
import { usePortal } from '../../../portal/PortalContext';
import { PATIENT_QUERY_TEMPLATES, SYMPTOM_OPTIONS, todayYmd } from '../../../portal/portalData';
import { Loading, clockTime } from '../shared';
import PatientShell from './PatientShell';
import { usePatient } from './usePatientNav';
import '../portal.css';

export default function PatientChat() {
  const patient = usePatient();
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
    const t = text.trim();
    if (!t) return;
    sendMessage(patient.id, { sender: 'patient', text: t });
    setDraft('');
  };

  const attachSymptom = () => {
    const log = patient.symptoms?.[todayYmd()];
    if (!log) {
      send('I have not logged my symptom check-in yet today.');
      return;
    }
    const label = SYMPTOM_OPTIONS.find((o) => o.value === log.feeling)?.label || log.feeling;
    send(`Feeling: ${label} today${log.note ? ` — ${log.note}` : ''}`);
  };

  return (
    <PatientShell>
      <div className="pt__page-head">
        <h1 className="pt__h1">Chat with your doctor</h1>
      </div>

      <div className="pt__chat" style={{ gridTemplateColumns: '1fr' }}>
        <div className="pt__chat-panel">
          <div className="pt__chat-head">
            <div>
              <div className="pt__chat-head-name">{doctor.name}</div>
              <div className="pt__chat-head-sub">{doctor.hospitalName}</div>
            </div>
            <span className={`pt__pill ${doctor.available ? 'pt__pill--good' : 'pt__pill--bad'}`}>
              {doctor.available ? '🟢 Available' : '🔴 Busy'}
            </span>
          </div>

          <div className="pt__chat-scroll" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="pt__notif-empty">No messages yet. Use a template below or type your question.</div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`pt__msg ${m.sender === 'patient' ? 'pt__msg--me' : 'pt__msg--them'} ${m.auto ? 'pt__msg--auto' : ''}`}
              >
                {m.message}
                <span className="pt__msg-time">
                  {clockTime(m.timestamp)}
                  {m.sender === 'patient' && (m.read ? ' · ✓✓ Read' : ' · ✓ Sent')}
                </span>
              </div>
            ))}
          </div>

          <div className="pt__quick">
            {PATIENT_QUERY_TEMPLATES.map((q) => (
              <button key={q} onClick={() => send(q)}>
                {q}
              </button>
            ))}
            <button onClick={attachSymptom}>📎 Attach today's symptom</button>
          </div>

          <form
            className="pt__chat-compose"
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
          >
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message…" />
            <button className="pt__btn pt__btn--primary" type="submit">
              Send
            </button>
          </form>
        </div>
      </div>
    </PatientShell>
  );
}
