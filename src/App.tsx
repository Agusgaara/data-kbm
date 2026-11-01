import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { TimeSimulator } from './components/TimeSimulator';
import { DashboardView } from './components/DashboardView';
import { MonitoringGuruView } from './components/MonitoringGuruView';
import { ScannerView } from './components/ScannerView';
import { MonitoringSiswaView } from './components/MonitoringSiswaView';
import { RekapSiswaView } from './components/RekapSiswaView';
import { RekapGuruView } from './components/RekapGuruView';
import { MasterDataView } from './components/MasterDataView';
import { LaporanView } from './components/LaporanView';
import { TvDashboardView } from './components/TvDashboardView';
import { Menu, ShieldAlert, GraduationCap } from 'lucide-react';
import { SCHOOL_INFO } from './data/initialData';

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

  // If TV Mode is active, render fullscreen kiosk
  if (activeTab === 'tv_mode') {
    return <TvDashboardView onExit={() => setActiveTab('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        onOpenScanner={() => setActiveTab('scan')}
        onOpenTvMode={() => setActiveTab('tv_mode')}
        onToggleSimulator={() => setShowSimulator((prev) => !prev)}
        showSimulator={showSimulator}
      />

      {/* Collapsible Time Simulator */}
      <TimeSimulator isOpen={showSimulator} onClose={() => setShowSimulator(false)} />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-4 min-w-0">
          {/* Mobile hamburger bar */}
          <div className="lg:hidden flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2 text-xs font-semibold shadow-sm"
            >
              <Menu className="w-4 h-4 text-blue-600" />
              <span>Menu Navigasi</span>
            </button>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              {SCHOOL_INFO.name}
            </span>
          </div>

          {/* Active Tab Router */}
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenScanner={() => setActiveTab('scan')}
            />
          )}

          {activeTab === 'monitoring_guru' && <MonitoringGuruView />}

          {activeTab === 'scan' && <ScannerView onNavigateTab={(tab) => setActiveTab(tab)} />}

          {activeTab === 'monitoring_siswa' && <MonitoringSiswaView />}

          {activeTab === 'rekap_siswa' && <RekapSiswaView />}

          {activeTab === 'rekap_guru' && <RekapGuruView />}

          {activeTab === 'master_data' && <MasterDataView />}

          {activeTab === 'laporan' && <LaporanView />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
