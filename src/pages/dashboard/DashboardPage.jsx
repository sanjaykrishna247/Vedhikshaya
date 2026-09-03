import { useState } from 'react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import BrewHero from './BrewHero';
import TopStats from './TopStats';
import TemperatureGauge from './TemperatureGauge';
import ReductionLiquid from './ReductionLiquid';
import PhLevel from './PhLevel';
import ConsistencyRing from './ConsistencyRing';
import QuickAlerts from './QuickAlerts';
import FloatingChat from './FloatingChat';
import './DashboardPage.css';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="d-app">
      <TopBar onMenuClick={() => setSidebarOpen((v) => !v)} />

      <div className="d-shell">
        <Sidebar open={sidebarOpen} />

        <main className="d-main">
          <DashboardHeader />

          <div className="d-bento">
            <div className="d-col-8">
              <BrewHero />
            </div>
            <div className="d-col-4">
              <ConsistencyRing />
            </div>

            <div className="d-col-12">
              <TopStats />
            </div>

            <div className="d-col-7">
              <TemperatureGauge />
            </div>
            <div className="d-col-5">
              <ReductionLiquid />
            </div>

            <div className="d-col-12">
              <PhLevel />
            </div>

            <div className="d-col-12">
              <QuickAlerts />
            </div>
          </div>
        </main>
      </div>

      <FloatingChat />
    </div>
  );
}
