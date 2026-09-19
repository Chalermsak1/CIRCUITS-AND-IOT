import React, { useState } from 'react';
import { SystemProvider } from './context/SystemContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, type PageId } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { DashboardPage } from './pages/DashboardPage';
import { ControlPage } from './pages/ControlPage';
import { SensorsPage } from './pages/SensorsPage';
import { SystemPage } from './pages/SystemPage';
import { HistoryPage } from './pages/HistoryPage';
import { DevicesPage } from './pages/DevicesPage';
import { WifiPage } from './pages/WifiPage';
import { SettingsPage } from './pages/SettingsPage';

export const AppContent: React.FC = () => {
  const [activePage, setActivePage] = useState<PageId>('dashboard');

  React.useEffect(() => {
    const handleNav = (e: Event) => {
      const customEvent = e as CustomEvent<PageId>;
      if (customEvent.detail) {
        setActivePage(customEvent.detail);
      }
    };
    window.addEventListener('app:navigate', handleNav);
    return () => window.removeEventListener('app:navigate', handleNav);
  }, []);

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage onNavigateToControl={() => setActivePage('control')} />;
      case 'control':
        return <ControlPage />;
      case 'sensors':
        return <SensorsPage />;
      case 'system':
        return <SystemPage />;
      case 'devices':
        return <DevicesPage />;
      case 'wifi':
        return <WifiPage />;
      case 'history':
        return <HistoryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigateToControl={() => setActivePage('control')} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Persistent System Header */}
      <Navbar />

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop / Tablet Sidebar */}
        <Sidebar activePage={activePage} onSelectPage={setActivePage} />

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation (<640px) */}
      <BottomNav activePage={activePage} onSelectPage={setActivePage} />
    </div>
  );
};

export default function App() {
  return (
    <SystemProvider>
      <AppContent />
    </SystemProvider>
  );
}
