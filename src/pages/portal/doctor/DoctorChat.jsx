import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { usePortal } from '../../../portal/PortalContext';
import { DOCTOR_QUICK_REPLIES } from '../../../portal/portalData';
import { PortalShell, personInitials, clockTime, Icon } from '../shared';
import { useDoctorNav } from './useDoctorNav';
import '../portal.css';

export default function DoctorChat() {
  const nav = useDoctorNav();
  const location = useLocation();
  const { patients, doctor, getChat, sendMessage, markChatRead, tick } = usePortal();

  const active = useMemo(() => patients.filter((p) => p.active || getChat(p.id).length), [patients, tick]);

  // Start on the conversation list (WhatsApp-style). Opening from a patient's
  // "Message" button jumps straight into that thread.
  const [selected, setSelected] = useState(location.state?.patientId || null);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);

  const threads = useMemo(() => {
    return active
      .map((p) => {
        const msgs = getChat(p.id);
        const last = msgs[msgs.length - 1];
        const unread = msgs.filter((m) => m.sender === 'patient' && !m.read).length;
        return { p, last, unread, ts: last?.timestamp || p.createdAt };
      })
      .sort((a, b) => b.ts - a.ts);
  }, [active, tick]);

  // On a wide screen, land on the most recent conversation so the panel
  // isn't empty; on phones keep the list showing until one is tapped.
  useEffect(() => {
    const wide = typeof window !== 'undefined' && window.matchMedia('(min-width: 1081px)').matches;
    if (!selected && wide && threads.length) setSelected(threads[0].p.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = active.find((p) => p.id === selected);
  const messages = current ? getChat(current.id) : [];

  useEffect(() => {
    if (current) markChatRead(current.id, 'doctor');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, selected]);

  const send = (text) => {
    const t = text.trim();
    if (!t || !current) return;
    sendMessage(current.id, { sender: 'doctor', text: t });
    setDraft('');
  };

  return (
    <PortalShell variant="doctor" nav={nav}>
      <div className="pt__page-head pt__row">
        <div>
          <h1 className="pt__h1">Chat</h1>
          <p className="pt__sub">
            You are {doctor.available ? 'Available' : 'Busy'} — patients see this in real time.
          </p>
        </div>
      </div>

      <div className="pt__chat">
        <div className={`pt__chat-list ${selected ? 'is-hidden-mobile' : ''}`}>
          {threads.length === 0 && <div className="pt__notif-empty">No conversations yet.</div>}
          {threads.map(({ p, last, unread }) => (
            <button
              key={p.id}
              className={`pt__chat-listitem ${selected === p.id ? 'is-active' : ''}`}
              onClick={() => setSelected(p.id)}
            >
              <span className="pt__pcard-avatar" style={{ width: 34, height: 34, fontSize: '0.72rem' }}>
                {personInitials(p.name)}
              </span>
              <div className="pt__chat-listitem-body">
                <div className="pt__chat-listitem-name">
                  {p.name}
                  <span className="pt__online-dot">{p.online ? '🟢' : '⚫'}</span>
                </div>
                <div className="pt__chat-listitem-preview">
                  {last ? last.message.slice(0, 40) : 'No messages yet'}
                </div>
              </div>
              <div className="pt__chat-listitem-meta">
                {last && <span>{clockTime(last.timestamp)}</span>}
                {unread > 0 && <span className="pt__navlink-badge">{unread}</span>}
              </div>
            </button>
          ))}
        </div>

        <div className={`pt__chat-panel ${selected ? '' : 'is-hidden-mobile'}`}>
          {!current ? (
            <div className="pt__notif-empty" style={{ margin: 'auto' }}>
              Select a patient to start chatting.
            </div>
          ) : (
            <>
              <div className="pt__chat-head">
                <button className="pt__chat-back pt__linkbtn" onClick={() => setSelected(null)}>
                  {Icon.back} Back
                </button>
                <div style={{ flex: 1 }}>
                  <div className="pt__chat-head-name">{current.name}</div>
                  <div className="pt__chat-head-sub">
                    {current.id} · {current.online ? '🟢 Online' : '⚫ Offline'}
                  </div>
                </div>
              </div>

              <div className="pt__chat-scroll" ref={scrollRef}>
                {messages.length === 0 && (
                  <div className="pt__notif-empty">No messages yet — say hello.</div>
                )}
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`pt__msg ${m.sender === 'doctor' ? 'pt__msg--me' : 'pt__msg--them'} ${
                      m.auto ? 'pt__msg--auto' : ''
                    }`}
                  >
                    {m.message}
                    <span className="pt__msg-time">
                      {clockTime(m.timestamp)}
                      {m.sender === 'doctor' && (m.read ? ' · ✓✓ Read' : ' · ✓ Sent')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt__quick">
                {DOCTOR_QUICK_REPLIES.map((q) => (
                  <button key={q} onClick={() => send(q)}>
                    {q}
                  </button>
                ))}
              </div>

              <form
                className="pt__chat-compose"
                onSubmit={(e) => {
                  e.preventDefault();
                  send(draft);
                }}
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message…"
                />
                <button className="pt__btn pt__btn--primary" type="submit">
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </PortalShell>
  );
}
