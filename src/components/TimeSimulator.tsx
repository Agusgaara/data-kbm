import React, { useState } from 'react';
import { Clock, Play, RotateCcw, X, Sliders, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STANDARD_PERIODS } from '../utils/date';

interface TimeSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TimeSimulator: React.FC<TimeSimulatorProps> = ({ isOpen, onClose }) => {
  const { simulatedTime, setSimulatedTime, currentTimeString, activePeriod } = useApp();
  const [customInput, setCustomInput] = useState('07:25');

  if (!isOpen) return null;

  const presets = [
    { label: 'Jam 1 (07:15 - Tepat)', time: '07:15' },
    { label: 'Jam 1 (07:28 - Terlambat)', time: '07:28' },
    { label: 'Jam 3 (08:40 - KBM Pagi)', time: '08:40' },
    { label: 'Istirahat I (09:20)', time: '09:20' },
    { label: 'Jam 4 (09:45 - KBM Siang)', time: '09:45' },
    { label: 'Dzuhur (11:50)', time: '11:50' },
    { label: 'Jam 7 (12:35 - KBM Akhir)', time: '12:35' },
  ];

  return (
    <div className="bg-slate-900 border-b border-amber-500/30 text-white px-4 sm:px-6 py-2.5 transition-all shadow-lg animate-in slide-in-from-top-2">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-300">SIMULATOR WAKTU KBM</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                Aktif: {currentTimeString}
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Pilih waktu simulasi untuk menguji status guru masuk kelas &amp; jam pelajaran aktif.
            </p>
          </div>
        </div>

        {/* Preset buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {presets.map((preset) => {
            const isSelected = simulatedTime?.startsWith(preset.time);
            return (
              <button
                key={preset.time}
                onClick={() => setSimulatedTime(`${preset.time}:00`)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {preset.label}
              </button>
            );
          })}

          {/* Custom Time */}
          <div className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
            <input
              type="time"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="bg-transparent text-xs text-white outline-none w-20 font-mono"
            />
            <button
              onClick={() => setCustomInput(customInput ? `${customInput}:00` : '07:30:00')}
              className="p-1 hover:text-emerald-400 text-slate-300"
              title="Terapkan Jam Kustom"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reset to live clock */}
          {simulatedTime && (
            <button
              onClick={() => setSimulatedTime(null)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Gunakan Jam Nyata</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Tutup Panel Simulasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
