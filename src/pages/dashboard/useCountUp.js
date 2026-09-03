import { useEffect, useState } from 'react';

export default function useCountUp(target, { duration = 1400, decimals = 0, delay = 0 } = {}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf;
    let timeout;
    const start = () => {
      const startTime = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(target * eased);
        if (progress < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    timeout = setTimeout(start, delay);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, delay]);

  return decimals > 0 ? value.toFixed(decimals) : Math.round(value);
}
