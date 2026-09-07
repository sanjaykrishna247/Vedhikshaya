import { useEffect, useState } from 'react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import BrewHero from './BrewHero';
import TopStats from './TopStats';
import TemperatureGauge from './TemperatureGauge';
import ReductionLiquid from './ReductionLiquid';
import ConsistencyRing from './ConsistencyRing';
import FloatingChat from './FloatingChat';
import { BrewSimProvider } from './BrewSim';
import { DashLangProvider } from './dashI18n';
import './DashboardPage.css';

function DashboardInner() {
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
          </div>
        </main>
      </div>

      <FloatingChat />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashLangProvider>
      <BrewSimProvider>
        <DashboardInner />
      </BrewSimProvider>
    </DashLangProvider>
  );
}
