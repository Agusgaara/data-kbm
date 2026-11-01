import React from 'react';
import { 
  LayoutDashboard, 
  UserCheck2, 
  QrCode, 
  Users, 
  FileSpreadsheet, 
  GraduationCap, 
  Database, 
  Printer, 
  Tv, 
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export type ActiveTab = 
  | 'dashboard'
  | 'monitoring_guru'
  | 'scan'
  | 'monitoring_siswa'
  | 'rekap_siswa'
  | 'rekap_guru'
  | 'master_data'
  | 'laporan'
  | 'tv_mode';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { 
    currentUser, 
    teacherAttendances, 
    currentDateString, 
    activePeriod, 
    resetToDemoData,
    backupDatabase,
    restoreDatabase
  } = useApp();

  // Calculate late or pending teachers for notification badge
  const pendingOrLateCount = React.useMemo(() => {
    const today = currentDateString;
    const period = activePeriod?.period || 1;
    return teacherAttendances.filter(
      (a) => a.date === today && a.period === period && (a.status === 'belum_masuk' || a.status === 'terlambat')
    ).length;
  }, [teacherAttendances, currentDateString, activePeriod]);

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard Utama',
      icon: LayoutDashboard,
      badge: null,
      allowedRoles: ['admin', 'kepala_madrasah', 'operator', 'guru_piket', 'guru_mapel', 'wali_kelas'],
    },
    {
      id: 'monitoring_guru' as ActiveTab,
      label: 'Monitoring Guru Kelas',
      icon: UserCheck2,
      badge: pendingOrLateCount > 0 ? `${pendingOrLateCount} Perhatian` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      allowedRoles: ['admin', 'kepala_madrasah', 'operator', 'guru_piket', 'guru_mapel', 'wali_kelas'],
    },
    {
      id: 'scan' as ActiveTab,
      label: 'Scan Barcode / QR',
      icon: QrCode,
      badge: 'Kamera & USB',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      allowedRoles: ['admin', 'operator', 'guru_piket', 'guru_mapel', 'wali_kelas'],
    },
    {
      id: 'monitoring_siswa' as ActiveTab,
      label: 'Monitoring Siswa / Jam',
      icon: Users,
      badge: null,
      allowedRoles: ['admin', 'kepala_madrasah', 'operator', 'guru_piket', 'guru_mapel', 'wali_kelas'],
    },
    {
      id: 'rekap_siswa' as ActiveTab,
      label: 'Rekap Kehadiran Siswa',
      icon: FileSpreadsheet,
      badge: null,
      allowedRoles: ['admin', 'kepala_madrasah', 'operator', 'guru_piket', 'wali_kelas'],
    },
    {
      id: 'rekap_guru' as ActiveTab,
      label: 'Rekap Kehadiran Guru',
      icon: GraduationCap,
      badge: null,
      allowedRoles: ['admin', 'kepala_madrasah', 'operator', 'guru_piket'],
    },
    {
      id: 'master_data' as ActiveTab,
      label: 'Kelola Master Data',
      icon: Database,
      badge: 'Cetak Kartu',
      badgeColor: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
      allowedRoles: ['admin', 'operator'],
    },
    {
      id: 'laporan' as ActiveTab,
      label: 'Laporan & Cetak Resmi',
      icon: Printer,
      badge: 'PDF / Excel',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
      allowedRoles: ['admin', 'kepala_madrasah', 'operator', 'guru_piket'],
    },
    {
      id: 'tv_mode' as ActiveTab,
      label: 'TV Dashboard Display',
      icon: Tv,
      badge: 'Kiosk',
      badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      allowedRoles: ['admin', 'kepala_madrasah', 'operator', 'guru_piket', 'guru_mapel', 'wali_kelas'],
    },
  ];

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          const ok = restoreDatabase(content);
          if (ok) {
            alert('Basis data berhasil dipulihkan dari berkas cadangan!');
          } else {
            alert('Format berkas cadangan tidak valid!');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset data ke kondisi awal demo madrasah? Semua presensi baru akan disegarkan.')) {
      resetToDemoData();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 lg:top-[61px] left-0 h-screen lg:h-[calc(100vh-61px)] w-72 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between z-40 transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <div className="p-4 overflow-y-auto space-y-1">
          <div className="px-3 pb-3 pt-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Menu Utama Navigasi
            </span>
          </div>

          {navItems.map((item) => {
            const isAllowed = item.allowedRoles.includes(currentUser.role);
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
                disabled={!isAllowed}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : isAllowed
                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    : 'text-slate-600 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom system status & backup utility */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
          {/* Active user status card */}
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="text-[11px] leading-tight truncate">
              <div className="text-white font-medium truncate">{currentUser.name}</div>
              <div className="text-slate-400">{currentUser.roleLabel}</div>
            </div>
          </div>

          {/* Backup, Restore, and Reset Buttons */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              onClick={backupDatabase}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
              title="Unduh cadangan data JSON"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Backup</span>
            </button>

            <label className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors cursor-pointer" title="Pulihkan data dari berkas JSON">
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Restore</span>
              <input type="file" accept=".json" onChange={handleFileRestore} className="hidden" />
            </label>
          </div>

          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] text-slate-400 hover:text-amber-300 hover:bg-slate-800/50 rounded-lg transition-colors border border-dashed border-slate-700"
          >
            <RotateCcw className="w-3 h-3 text-amber-400" />
            <span>Reset Data Demo Madrasah</span>
          </button>
        </div>
      </aside>
    </>
  );
};
