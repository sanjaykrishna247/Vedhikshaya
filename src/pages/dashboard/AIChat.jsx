import { useEffect, useRef, useState } from 'react';

const SEED_MESSAGES = [
  { role: 'bot', text: 'Brew started. Dashamoola Kwatha detected. Estimated time: 14 min.' },
  { role: 'bot', text: 'Temperature stabilized at 87°C. Reduction at 30%.' },
  { role: 'user', text: 'Is this brew safe for evening use?' },
  {
    role: 'bot',
    text: 'Yes — Dashamoola is recommended post-sunset. Avoid food 30 min before consuming.',
  },
];

const SYSTEM_PROMPT =
  'You are Vedikshaya AI, an Ayurvedic brew assistant. Answer only about the current brew, ' +
  'herb formulations, usage timing, dosage, and Ayurvedic guidance. Be concise, warm, and knowledgeable.';

// Placeholder for a real backend call. Never call api.anthropic.com directly from the
// browser with an embedded key — route this through your own server, which holds the
// key server-side and forwards { systemPrompt, messages } to the Claude API.
async function askVedikshayaAI(messages) {
  // const res = await fetch('/api/brew-assistant', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ system: SYSTEM_PROMPT, messages }),
  // });
  // const data = await res.json();
  // return data.reply;

  await new Promise((r) => setTimeout(r, 700 + Math.random() * 500));
  const last = messages[messages.length - 1]?.text.toLowerCase() ?? '';
  if (last.includes('dose') || last.includes('how much')) {
    return 'A standard dose is 100 mL, once daily unless your practitioner advises otherwise.';
  }
  if (last.includes('time') || last.includes('when')) {
    return 'Best taken 30 minutes before or after meals, ideally at the same time each day.';
  }
  return "I'm monitoring this brew closely — ask me about dosage, timing, or the herbs in this formulation.";
}

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    setMessages(SEED_MESSAGES);
  }, []);

  useEffect(() => {
    if (visibleCount >= messages.length) return;
    const t = setTimeout(() => setVisibleCount((c) => c + 1), 420);
    return () => clearTimeout(t);
  }, [visibleCount, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [visibleCount, thinking]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || thinking) return;

    const next = [...messages, { role: 'user', text }];
    setMessages(next);
    setVisibleCount(next.length);
    setInput('');
    setThinking(true);

    const reply = await askVedikshayaAI(next);

    setMessages((m) => {
      const updated = [...m, { role: 'bot', text: reply }];
      setVisibleCount(updated.length);
      return updated;
    });
    setThinking(false);
  };

  return (
    <div className="d-chat">
      <div className="d-chat__head">
        <span>Vedikshaya AI</span>
        <span className="d-live-dot d-live-dot--sm" />
      </div>

      <div className="d-chat__window" ref={scrollRef}>
        {messages.slice(0, visibleCount).map((m, i) => (
          <div key={i} className={`d-chat__msg d-chat__msg--${m.role} d-chat__msg--in`}>
            {m.text}
          </div>
        ))}
        {thinking && (
          <div className="d-chat__msg d-chat__msg--bot d-chat__msg--in d-chat__typing">
            <span />
            <span />
            <span />
          </div>
        )}
      </div>

      <form className="d-chat__input" onSubmit={handleSend}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your brew..."
        />
        <button type="submit" aria-label="Send message" disabled={!input.trim() || thinking}>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
    </div>
  );
}
