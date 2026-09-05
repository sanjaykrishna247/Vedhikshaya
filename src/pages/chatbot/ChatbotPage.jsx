import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AnimatedDoctor from '../../components/AnimatedDoctor';
import { findRecommendation, KASHAYA_CATALOGUE } from './kashayaData';
import logo from '../../assets/logo.svg';
import './ChatbotPage.css';

const WELCOME = {
  role: 'bot',
  text: "Hi, I'm Dr. Vedik — your Ayurvedic assistant. Tell me what you're experiencing (e.g. \"I have a cold and body ache\") and I'll suggest a Kashaya for it.",
};

function buildReply(userText) {
  const match = findRecommendation(userText);
  if (match) {
    return `Based on what you've described, I'd recommend **${match.name}**. ${match.note}`;
  }
  return "I don't have a specific match for that yet — could you tell me more, or mention symptoms like fever, digestion, immunity, or stress?";
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const send = async (text) => {
    if (!text.trim() || thinking) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setThinking(true);

    await new Promise((r) => setTimeout(r, 600 + Math.random() * 500));

    setMessages((m) => [...m, { role: 'bot', text: buildReply(text) }]);
    setThinking(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className="cb">
      <header className="cb__header">
        <Link to="/home" className="cb__brand">
          <img src={logo} alt="" className="cb__logo-img" aria-hidden="true" />
          <span className="cb__wordmark">
            Vediks<span>haya</span>
          </span>
        </Link>
        <Link to="/home" className="cb__back">
          ← Home
        </Link>
      </header>

      <div className="cb__body">
        <main className="cb__chat">
          <div className="cb__chat-head">
            <AnimatedDoctor size={52} animated={false} />
            <div>
              <div className="cb__chat-title">Dr. Vedik</div>
              <div className="cb__chat-sub">
                <span className="cb__dot" /> AI Ayurvedic Assistant
              </div>
            </div>
          </div>

          <div className="cb__window" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`cb__msg cb__msg--${m.role}`}>
                {m.role === 'bot' && (
                  <span className="cb__msg-avatar">
                    <AnimatedDoctor size={34} animated={false} />
                  </span>
                )}
                <span
                  className="cb__msg-bubble"
                  dangerouslySetInnerHTML={{
                    __html: m.text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'),
                  }}
                />
              </div>
            ))}
            {thinking && (
              <div className="cb__msg cb__msg--bot">
                <span className="cb__msg-avatar">
                  <AnimatedDoctor size={34} animated={false} />
                </span>
                <span className="cb__msg-bubble cb__typing">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            )}
          </div>

          <form className="cb__input" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your symptoms…"
            />
            <button type="submit" disabled={!input.trim() || thinking}>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </main>

        <aside className="cb__sidebar">
          <h3 className="cb__sidebar-title">Kashaya Catalogue</h3>
          <p className="cb__sidebar-sub">Ask about any of these, or describe your symptoms directly.</p>
          <div className="cb__list">
            {KASHAYA_CATALOGUE.map((k) => (
              <button key={k.name} className="cb__list-item" onClick={() => send(`Tell me about ${k.name}`)}>
                <div className="cb__list-name">{k.name}</div>
                <div className="cb__list-tags">{k.for.slice(0, 3).join(' · ')}</div>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
