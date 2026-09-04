import { useState } from 'react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import BrewHero from './BrewHero';
import TopStats from './TopStats';
import TemperatureGauge from './TemperatureGauge';
import ReductionLiquid from './ReductionLiquid';
import PhLevel from './PhLevel';
import ConsistencyRing from './ConsistencyRing';
import FloatingChat from './FloatingChat';
import './DashboardPage.css';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="d-app">
      <TopBar onMenuClick={() => setSidebarOpen((v) => !v)} />

      <div className="d-shell">
        <Sidebar open={sidebarOpen} />
        {sidebarOpen && (
          <div className="d-scrim" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        )}

        <main className="d-main">
          <div className="d-bento">
            <div className="d-col-12">
              <BrewHero />
            </div>

            <div className="d-col-12">
              <TopStats />
            </div>

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
