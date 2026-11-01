import React from 'react';
import { 
  Clock, 
  Calendar, 
  Tv, 
  QrCode, 
  UserCheck, 
  ChevronDown, 
  Sliders, 
  GraduationCap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatIndonesianDate } from '../utils/date';
import { SCHOOL_INFO } from '../data/initialData';

interface HeaderProps {
  onOpenScanner: () => void;
  onOpenTvMode: () => void;
  onToggleSimulator: () => void;
  showSimulator: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenScanner,
  onOpenTvMode,
  onToggleSimulator,
  showSimulator,
}) => {
  const { 
    currentUser, 
    setCurrentUser, 
    users, 
    currentTimeString, 
    currentDateString, 
    currentDayName, 
    activePeriod,
    simulatedTime
  } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Branding & School Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-sky-400 p-0.5 shadow-md flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm sm:text-base tracking-wide text-white leading-tight">
                SIMATIK PRESENSI
              </h1>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                WITA (UTC+8)
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium truncate max-w-[220px] sm:max-w-xs md:max-w-md">
              {SCHOOL_INFO.name}
            </p>
          </div>
        </div>

        {/* Center: Live Clock & Active Period */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-800/80 px-4 py-1.5 rounded-xl border border-slate-700/60 shadow-inner">
          <div className="flex items-center gap-2 text-slate-300 text-xs">
            <Calendar className="w-4 h-4 text-sky-400" />
            <span>{currentDayName}, {formatIndonesianDate(currentDateString)}</span>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-2 font-mono font-bold text-sm text-amber-300">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{currentTimeString} WITA</span>
            {simulatedTime && (
              <span className="text-[10px] bg-amber-500/30 text-amber-300 px-1.5 py-0.2 rounded font-sans uppercase">
                Simulasi
              </span>
            )}
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-300 font-semibold">
              {activePeriod ? activePeriod.name : 'Di Luar Jam KBM'}
            </span>
            {activePeriod && (
              <span className="text-slate-400 text-[11px]">
                ({activePeriod.startTime} - {activePeriod.endTime})
              </span>
            )}
          </div>
        </div>

        {/* Right: Quick Actions & User Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Time simulation toggle */}
          <button
            onClick={onToggleSimulator}
            title="Pengaturan Simulasi Jam Pembelajaran"
            className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
              showSimulator || simulatedTime
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span className="hidden xl:inline">Simulasi Waktu</span>
          </button>

          {/* TV Display Mode Button */}
          <button
            onClick={onOpenTvMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition-all"
            title="Buka TV Dashboard Display Ruang Guru & Kamad"
          >
            <Tv className="w-4 h-4" />
            <span className="hidden sm:inline">TV Display</span>
          </button>

          {/* Quick Scan Button */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-sm shadow-emerald-900/40 transition-all active:scale-95"
            title="Buka Pemindai Barcode / QR Code"
          >
            <QrCode className="w-4 h-4" />
            <span className="font-semibold">Scan QR</span>
          </button>

          {/* User Role Switcher Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 py-1 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all text-left">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-sky-400"
              />
              <div className="hidden md:block leading-tight pr-1">
                <div className="text-xs font-semibold text-white truncate max-w-[110px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-sky-300 font-medium flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  <span>{currentUser.roleLabel}</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu to switch active testing role */}
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 hidden group-hover:block group-focus-within:block z-50">
              <div className="px-3 py-1.5 border-b border-slate-800">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Ganti Hak Akses Pengguna
                </p>
                <p className="text-xs text-slate-300 font-medium">
                  Uji coba semua peran (RBAC)
                </p>
              </div>
              <div className="max-h-72 overflow-y-auto py-1">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setCurrentUser(u)}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-slate-800 transition-colors ${
                      currentUser.id === u.id ? 'bg-slate-800/80 text-sky-400 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-7 h-7 rounded-md object-cover ring-1 ring-slate-700"
                    />
                    <div className="truncate">
                      <div className="text-xs font-medium truncate text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.roleLabel}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
