import { useState } from 'react';
import AIChat from './AIChat';
import AnimatedDoctor from '../../components/AnimatedDoctor';

export default function FloatingChat() {
  const [open, setOpen] = useState(false);

  return (
    <div className="d-floatchat">
      {open && (
        <div className="d-floatchat__panel">
          <button className="d-floatchat__close" aria-label="Close chat" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
          <AIChat />
        </div>
      )}

      {!open && (
        <div className="d-floatchat__hint" aria-hidden="true">
          Ask the AI brew assistant
        </div>
      )}

      <button
        className={`d-floatchat__launcher ${
          open ? 'd-floatchat__launcher--open' : 'd-floatchat__launcher--bot'
        }`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close Vedikshaya AI chat' : 'Open Vedikshaya AI chat'}
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        ) : (
          <>
            <AnimatedDoctor size={96} />
            <span className="d-floatchat__dot" />
          </>
        )}
      </button>
    </div>
  );
}
