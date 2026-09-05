import { useEffect, useState } from 'react';
import TopBar from '../dashboard/TopBar';
import Sidebar from '../dashboard/Sidebar';
import ConsistencyRing from '../dashboard/ConsistencyRing';
import TemperatureGauge from '../dashboard/TemperatureGauge';
import ReductionLiquid from '../dashboard/ReductionLiquid';
import PhLevel from '../dashboard/PhLevel';
import FloatingChat from '../dashboard/FloatingChat';
import '../dashboard/DashboardPage.css';

export default function SensorsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        </main>
      </div>

      <FloatingChat />
    </div>
  );
}
