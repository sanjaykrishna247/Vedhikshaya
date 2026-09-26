const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const SLOT_ICON = {
  morning: (
    <svg viewBox="0 0 24 24" {...S}>
      <circle cx="12" cy="12" r="3.6" />
      <path d="M12 3.5v2.4M12 18.1v2.4M4.4 4.4l1.7 1.7M17.9 17.9l1.7 1.7M3.5 12h2.4M18.1 12h2.4M4.4 19.6l1.7-1.7M17.9 6.1l1.7-1.7" />
    </svg>
  ),
  afternoon: (
    <svg viewBox="0 0 24 24" {...S}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2M4.9 4.9l1.4 1.4M2.5 12h2M19.1 6.3l1.4-1.4" />
    </svg>
  ),
  night: (
    <svg viewBox="0 0 24 24" {...S}>
      <path d="M20.2 14.7A8.4 8.4 0 1 1 9.3 3.8a6.7 6.7 0 0 0 10.9 10.9z" />
    </svg>
  ),
};
