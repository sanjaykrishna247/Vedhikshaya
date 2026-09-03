import { useState } from 'react';
import AIChat from './AIChat';

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

      <button
        className={`d-floatchat__launcher ${open ? 'd-floatchat__launcher--open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close Vedikshaya AI chat' : 'Open Vedikshaya AI chat'}
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-8Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
            <span className="d-floatchat__dot" />
          </>
        )}
      </button>
    </div>
  );
}
