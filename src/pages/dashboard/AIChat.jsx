import { useEffect, useRef, useState } from 'react';
import { useKashaya } from '../../auth/KashayaContext';
import { useBrewSim, fmtClock } from './BrewSim';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
const PHASE_NAMES = ['Soaking', 'Boil', 'Stirring', 'Dispense'];

// Questions about the live batch — answered instantly from the running
// simulation instead of round-tripping to the LLM, so it's always accurate.
const STATUS_RE = /\b(status|remaining|time left|how (much|long)|almost (done|ready)|when.*(ready|done|finish)|brewing progress|still brewing)\b/i;

function describeBrewStatus(sim, kashaya) {
  if (sim.status === 'idle') {
    return 'No brew is running right now — scan a pod or hit Start Brew and I can track it for you.';
  }
  if (sim.status === 'done') {
    return `Your batch is done — ${Math.round(sim.waterMl)} mL ready at ${sim.consistency.toFixed(1)}% consistency. Reset the console when you're ready to start another.`;
  }
  return (
    `${kashaya} is in the **${PHASE_NAMES[sim.phaseIndex]}** phase — ${Math.round(sim.tempC)}°C, ` +
    `${sim.consistency.toFixed(1)}% consistency, about **${fmtClock(sim.remaining)}** remaining.`
  );
}

function brewContextLine(sim, kashaya) {
  if (sim.status === 'idle') return null;
  if (sim.status === 'done') {
    return `Live brew status: batch complete — ${kashaya}, ${Math.round(sim.waterMl)} mL, ${sim.consistency.toFixed(1)}% consistency.`;
  }
  return (
    `Live brew status: ${kashaya}, phase ${PHASE_NAMES[sim.phaseIndex]}, ${Math.round(sim.tempC)}°C, ` +
    `${sim.consistency.toFixed(1)}% consistency, ${fmtClock(sim.remaining)} remaining of 20:00 total.`
  );
}

function seedMessages(sim, kashaya) {
  if (sim.status === 'idle') {
    return [{ role: 'bot', text: `Ready when you are — scan a ${kashaya} pod or hit Start Brew and I'll track it live.` }];
  }
  return [{ role: 'bot', text: `Brew started. ${kashaya} detected.` }, { role: 'bot', text: describeBrewStatus(sim, kashaya) }];
}

// Local keyword fallback — used if the AI service is unreachable.
function buildReply(userText) {
  const last = userText.toLowerCase();
  if (last.includes('dose') || last.includes('how much')) {
    return 'A standard dose is 100 mL, once daily unless your practitioner advises otherwise.';
  }
  if (last.includes('time') || last.includes('when')) {
    return 'Best taken 30 minutes before or after meals, ideally at the same time each day.';
  }
  return "I'm monitoring this brew closely — ask me about dosage, timing, or the current status.";
}

// Ask the backend (grounds the reply in physician-reviewed notes + live brew data).
async function askVedikshayaAI(history, brewContext) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 35000);
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: history.map((m) => ({ role: m.role, text: m.text })),
        brewContext: brewContext || undefined,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`chat ${res.status}`);
    const data = await res.json();
    if (data?.reply) return data.reply;
    throw new Error('empty reply');
  } catch {
    return buildReply(history[history.length - 1]?.text || '');
  }
}

export default function AIChat() {
  const { kashaya } = useKashaya();
  const brewSim = useBrewSim();
  const [messages, setMessages] = useState([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    setMessages(seedMessages(brewSim, kashaya));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kashaya, brewSim.status]);

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

    // fast path: a live-status question, answered instantly from the running
    // brew — accurate and works even if the AI backend is unreachable
    if (brewSim.status !== 'idle' && STATUS_RE.test(text)) {
      setMessages((m) => {
        const updated = [...m, { role: 'bot', text: describeBrewStatus(brewSim, kashaya) }];
        setVisibleCount(updated.length);
        return updated;
      });
      return;
    }

    setThinking(true);
    const reply = await askVedikshayaAI(next, brewContextLine(brewSim, kashaya));

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
          <div
            key={i}
            className={`d-chat__msg d-chat__msg--${m.role} d-chat__msg--in`}
            dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }}
          />
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
