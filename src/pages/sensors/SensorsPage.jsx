import { useEffect, useMemo, useState } from 'react';
import TopBar from '../dashboard/TopBar';
import Sidebar from '../dashboard/Sidebar';
import ConsistencyRing from '../dashboard/ConsistencyRing';
import TemperatureGauge from '../dashboard/TemperatureGauge';
import ReductionLiquid from '../dashboard/ReductionLiquid';
import PhLevel from '../dashboard/PhLevel';
import FloatingChat from '../dashboard/FloatingChat';
import SensorChart from './SensorChart';
import { generateSeries } from './sensorData';
import { IconDroplet, IconGauge, IconRotate, IconWave } from '../dashboard/icons';
import '../dashboard/DashboardPage.css';
import './SensorsPage.css';

const DUMMY_SENSORS = [
  {
    id: 'humidity',
    title: 'Ambient Humidity',
    unit: '%',
    color: '#3fa9dc',
    icon: IconDroplet,
    decimals: 0,
    series: { seed: 11, base: 58, variance: 3, drift: 0.05 },
  },
  {
    id: 'pressure',
    title: 'Vessel Pressure',
    unit: 'kPa',
    color: '#e0a73c',
    icon: IconGauge,
    decimals: 1,
    series: { seed: 22, base: 101.3, variance: 0.4, drift: 0 },
  },
  {
    id: 'rpm',
    title: 'Stirrer Speed',
    unit: 'RPM',
    color: '#8bc53d',
    icon: IconRotate,
    decimals: 0,
    series: { seed: 33, base: 42, variance: 4, drift: 0 },
  },
  {
    id: 'flow',
    title: 'Flow Rate',
    unit: 'mL/min',
    color: '#5a7fd6',
    icon: IconWave,
    decimals: 1,
    series: { seed: 44, base: 12.5, variance: 1.2, drift: -0.02 },
  },
];

export default function SensorsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sensorSeries = useMemo(
    () => DUMMY_SENSORS.map((s) => ({ ...s, data: generateSeries(s.series) })),
    []
  );

  // Lock background scroll while the mobile drawer is open — otherwise the
  // page underneath fights the drawer for scroll and only part of it is
  // reachable.
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
            <h1>Sensors</h1>
            <p>Live readings from the pod's onboard sensors.</p>
          </div>

          <div className="d-bento">
            <div className="d-col-4">
              <ConsistencyRing />
            </div>
            <div className="d-col-4">
              <TemperatureGauge />
            </div>
            <div className="d-col-4">
              <ReductionLiquid />
            </div>

            <div className="d-col-12">
              <PhLevel />
            </div>
          </div>

          <div className="d-page-head d-page-head--sub">
            <h2>Additional Sensors</h2>
            <p>Supplementary telemetry streamed from the pod's sensor array.</p>
          </div>

          <div className="d-bento">
            {sensorSeries.map((sensor) => (
              <div className="d-col-6" key={sensor.id}>
                <SensorChart
                  title={sensor.title}
                  unit={sensor.unit}
                  color={sensor.color}
                  icon={sensor.icon}
                  data={sensor.data}
                  decimals={sensor.decimals}
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
