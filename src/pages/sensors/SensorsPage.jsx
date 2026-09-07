import { useEffect, useRef, useState } from 'react';
import TopBar from '../dashboard/TopBar';
import Sidebar from '../dashboard/Sidebar';
import FloatingChat from '../dashboard/FloatingChat';
import SensorChart from './SensorChart';
import { IconDroplet, IconGauge, IconRotate, IconWave } from '../dashboard/icons';
import { useBrewSim } from '../dashboard/BrewSim';
import { useDashLang } from '../dashboard/dashI18n';
import '../dashboard/DashboardPage.css';
import './SensorsPage.css';

const POINTS = 40;
const STEP_MS = 2000;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const noise = (a) => (Math.random() - 0.5) * 2 * a;

// Each sensor's live value is a function of the shared brew simulation, so the
// charts actually track what the brew is doing rather than drifting randomly.
const SENSORS = [
  {
    id: 'humidity',
    key: 'sensor.humidity',
    unit: '%',
    color: '#3fa9dc',
    icon: IconDroplet,
    decimals: 0,
    // steam load rises with temperature
    read: ({ boil }) => clamp(50 + 27 * boil + noise(1.4), 44, 82),
  },
  {
    id: 'pressure',
    key: 'sensor.pressure',
    unit: 'kPa',
    color: '#e0a73c',
    icon: IconGauge,
    decimals: 1,
    read: ({ boil }) => clamp(101.3 + 1.5 * boil + noise(0.12), 100.8, 103.2),
  },
  {
    id: 'rpm',
    key: 'sensor.rpm',
    unit: 'RPM',
    color: '#8bc53d',
    icon: IconRotate,
    decimals: 0,
    // directly follows the stirrer intensity (0–10 → 0–90 RPM)
    read: ({ stir }) => clamp(stir * 8.6 + (stir > 0 ? noise(3) : 0), 0, 96),
  },
  {
    id: 'flow',
    key: 'sensor.flow',
    unit: 'mL/min',
    color: '#5a7fd6',
    icon: IconWave,
    decimals: 1,
    // trickle of condensate normally; opens up during the dispense phase
    read: ({ boil, dispensing }) =>
      dispensing ? clamp(38 + noise(4), 26, 48) : clamp(1.4 + 5.4 * boil + noise(0.5), 0.4, 9),
  },
];

const readingCtx = (sim) => ({
  boil: clamp((sim.tempC - 45) / 45, 0, 1),
  stir: sim.status === 'running' ? sim.stir : 0,
  dispensing: sim.status === 'running' && sim.phaseIndex === 3,
});

export default function SensorsPage() {
  const { t } = useDashLang();
  const sim = useBrewSim();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [series, setSeries] = useState(() => {
    const ctx = readingCtx(sim);
    const now = Date.now();
    const seed = {};
    SENSORS.forEach((s) => {
      seed[s.id] = Array.from({ length: POINTS }, (_, i) => ({
        date: now - (POINTS - 1 - i) * STEP_MS,
        value: s.read(ctx),
      }));
    });
    return seed;
  });

  // keep the latest sim in a ref so the interval always reads fresh values
  const simRef = useRef(sim);
  simRef.current = sim;

  useEffect(() => {
    const tick = () => {
      const ctx = readingCtx(simRef.current);
      const now = Date.now();
      setSeries((prev) => {
        const next = {};
        SENSORS.forEach((s) => {
          const arr = prev[s.id].slice(1);
          arr.push({ date: now, value: s.read(ctx) });
          next[s.id] = arr;
        });
        return next;
      });
    };
    const iv = setInterval(tick, STEP_MS);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <div className="d-app">
      <TopBar onMenuClick={() => setSidebarOpen((v) => !v)} />

      <div className="d-shell">
        <Sidebar open={sidebarOpen} />
        {sidebarOpen && (
          <div className="d-scrim" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        )}

        <main className="d-main">
          <div className="d-page-head">
            <h1>{t('sensor.pageTitle')}</h1>
            <p>{t('sensor.pageSub')}</p>
          </div>

          <div className="d-bento">
            {SENSORS.map((s) => (
              <div className="d-col-6" key={s.id}>
                <SensorChart
                  title={t(s.key)}
                  unit={s.unit}
                  color={s.color}
                  icon={s.icon}
                  data={series[s.id]}
                  decimals={s.decimals}
                />
              </div>
            ))}
          </div>
        </main>
      </div>

      <FloatingChat />
    </div>
  );
}
