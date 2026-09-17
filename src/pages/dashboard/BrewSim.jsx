import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { logBrewComplete, logBrewInterrupted, logBrewStart } from '../history/brewLog';

// ---------------------------------------------------------------------------
// Live brew simulation. One clock drives every card on the dashboard so the
// numbers stay consistent with each other and move like a real batch would.
//
//   • 20 min total, 4 phases of 5 min each (Soak → Boil → Stir → Dispense)
//   • water reduces 400 mL → ~101-102 mL, never dropping below 100 mL
//   • temperature is held in the 85–90 °C draw band with small deflection
//   • consistency score builds as the extract concentrates
// ---------------------------------------------------------------------------

export const TOTAL_SECONDS = 20 * 60;
export const PHASE_SECONDS = 5 * 60;
export const WATER_START = 400;
export const WATER_END = 101;
export const WATER_FLOOR = 100; // hard floor — the reading must never read below this

const STORAGE_KEY = 'vedikshaya_brew_started_at';
const WATER_END_KEY = 'vedikshaya_brew_water_end';
const TICK_MS = 500;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const noise = (amp) => (Math.random() - 0.5) * 2 * amp;
// smootherstep — 0 at p=0, 1 at p=1, flat slope at both ends
const smoother = (p) => {
  const x = clamp(p, 0, 1);
  return x * x * x * (x * (x * 6 - 15) + 10);
};

// --- realistic curves as a function of progress p ∈ [0,1] -----------------

function baseTemp(p) {
  if (p < 0.14) return 29 + (87 - 29) * (p / 0.14); // heat-up to the draw band
  if (p > 0.9) return 87 - 1.4 * ((p - 0.9) / 0.1); // easing off, stays in band
  return 87 + Math.sin(p * Math.PI * 5.5) * 0.9; // gentle hold around 87 °C
}

function baseWater(p, endTarget) {
  // slow while it heats, quicker through the rolling reduction, lands exactly
  // on the session's end target (101 or 102 mL) at p = 1
  return WATER_START - (WATER_START - endTarget) * Math.pow(clamp(p, 0, 1), 1.32);
}

// picked once per brew so the batch consistently lands on 101 or 102, never
// exactly the same every time but never below the 100 mL floor
const pickWaterEndTarget = () => (Math.random() < 0.5 ? 101 : 102);

function baseConsistency(p) {
  // extract concentration — near zero early, plateaus at ~97.4 %
  return 97.4 * smoother(clamp(p * 1.04, 0, 1));
}

function baseStir(p) {
  if (p < 0.25) return 2 + 6 * (p / 0.25); // easing in during the soak
  if (p < 0.75) return 8 + 1.5 * ((p - 0.25) / 0.5); // full stir through the boil
  return 6 - 4 * ((p - 0.75) / 0.25); // winding down for dispense
}

const IDLE = { tempC: 28.5, waterMl: WATER_START, consistency: 0, stir: 0 };

function sample(p, jitter, endTarget = WATER_END) {
  return {
    tempC: clamp(baseTemp(p) + (jitter ? noise(0.5) : 0), 24, 94),
    // hard floor at WATER_FLOOR (100 mL) — the reading must never read below it,
    // regardless of jitter or which end target this session landed on
    waterMl: clamp(baseWater(p, endTarget) + (jitter ? noise(0.7) : 0), WATER_FLOOR, WATER_START),
    consistency: clamp(baseConsistency(p) + (jitter ? noise(0.45) : 0), 0, 99),
    stir: clamp(Math.round(baseStir(p) + (jitter ? noise(0.35) : 0)), 0, 10),
  };
}

const BrewSimContext = createContext(null);

export function BrewSimProvider({ children }) {
  const [startedAt, setStartedAt] = useState(() => {
    const s = Number(localStorage.getItem(STORAGE_KEY));
    // keep a finished batch on screen for up to an hour after it completes
    return s && Date.now() - s < TOTAL_SECONDS * 1000 + 3_600_000 ? s : null;
  });
  const [nowTs, setNowTs] = useState(() => Date.now());
  const [sensors, setSensors] = useState(IDLE);
  const [waterEndTarget, setWaterEndTarget] = useState(() => {
    const saved = Number(localStorage.getItem(WATER_END_KEY));
    return saved === 101 || saved === 102 ? saved : WATER_END;
  });
  const intervalRef = useRef(null);
  const loggedDoneRef = useRef(false);

  const elapsed = startedAt ? clamp((nowTs - startedAt) / 1000, 0, TOTAL_SECONDS) : 0;
  const status = !startedAt ? 'idle' : elapsed >= TOTAL_SECONDS ? 'done' : 'running';
  const progress = elapsed / TOTAL_SECONDS;
  const phaseIndex = Math.min(3, Math.floor(elapsed / PHASE_SECONDS));

  // run the clock only while a batch is live
  useEffect(() => {
    if (status !== 'running') {
      clearInterval(intervalRef.current);
      // freeze the final reading once the batch completes + log it once
      if (status === 'done') {
        setSensors(sample(1, false, waterEndTarget));
        if (!loggedDoneRef.current) {
          loggedDoneRef.current = true;
          const final = sample(1, false, waterEndTarget);
          logBrewComplete({ consistencyPct: final.consistency, doseMl: final.waterMl });
        }
      }
      return undefined;
    }
    loggedDoneRef.current = false;
    const startTs = startedAt;
    const tick = () => {
      const now = Date.now();
      setNowTs(now);
      const p = clamp((now - startTs) / 1000, 0, TOTAL_SECONDS) / TOTAL_SECONDS;
      setSensors(sample(p, true, waterEndTarget));
    };
    tick();
    intervalRef.current = setInterval(tick, TICK_MS);
    return () => clearInterval(intervalRef.current);
  }, [status, startedAt, waterEndTarget]);

  const start = (label) => {
    const t = Date.now();
    const endTarget = pickWaterEndTarget();
    localStorage.setItem(STORAGE_KEY, String(t));
    localStorage.setItem(WATER_END_KEY, String(endTarget));
    loggedDoneRef.current = false;
    logBrewStart(label || 'Kashaya Kwatha');
    setWaterEndTarget(endTarget);
    setStartedAt(t);
    setNowTs(t);
    setSensors(sample(0, true, endTarget));
  };

  const reset = () => {
    if (status === 'running') logBrewInterrupted();
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(WATER_END_KEY);
    loggedDoneRef.current = false;
    setStartedAt(null);
    setSensors(IDLE);
  };

  const value = {
    status,
    elapsed,
    remaining: Math.max(0, TOTAL_SECONDS - elapsed),
    progress,
    phaseIndex,
    tempC: sensors.tempC,
    waterMl: sensors.waterMl,
    consistency: sensors.consistency,
    stir: sensors.stir,
    start,
    reset,
    TOTAL_SECONDS,
    WATER_START,
    WATER_END: waterEndTarget, // this session's actual floor — 101 or 102 mL
  };

  return <BrewSimContext.Provider value={value}>{children}</BrewSimContext.Provider>;
}

export function useBrewSim() {
  const ctx = useContext(BrewSimContext);
  if (!ctx) throw new Error('useBrewSim must be used within a BrewSimProvider');
  return ctx;
}

export const fmtClock = (secs) => {
  const s = Math.max(0, Math.round(secs));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
