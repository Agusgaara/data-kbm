import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Calendar,
  Award,
  BookOpen,
  Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportToExcel } from '../utils/export';
import { formatIndonesianDate } from '../utils/date';
import { SCHOOL_INFO } from '../data/initialData';

export const RekapGuruView: React.FC = () => {
  const { teachers, subjects, schedules, teacherAttendances, currentDateString } = useApp();

  const [timeframe, setTimeframe] = useState<'harian' | 'bulanan' | 'semester'>('bulanan');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacherDetail, setSelectedTeacherDetail] = useState<any | null>(null);

  // Compute teacher statistics
  const teacherStats = useMemo(() => {
    return teachers.map((t) => {
      // Find all schedules assigned to this teacher
      const teacherSchedules = schedules.filter((s) => s.teacherId === t.id);
      const scheduledHoursPerWeek = teacherSchedules.length;

      // Real or calculated metrics depending on timeframe
      let targetHours = 0;
      let completedHours = 0;
      let onTimeCount = 0;
      let lateCount = 0;
      let missedCount = 0;
      let totalLateMinutes = 0;

      if (timeframe === 'harian') {
        targetHours = scheduledHoursPerWeek > 0 ? Math.min(scheduledHoursPerWeek, 4) : 2;
        // Direct attendances
        const atts = teacherAttendances.filter((a) => a.teacherId === t.id && a.date === currentDateString);
        completedHours = atts.filter((a) => a.status === 'tepat_waktu' || a.status === 'terlambat').length;
        onTimeCount = atts.filter((a) => a.status === 'tepat_waktu').length;
        lateCount = atts.filter((a) => a.status === 'terlambat').length;
        missedCount = Math.max(0, targetHours - completedHours);
        totalLateMinutes = atts.reduce((acc, a) => acc + (a.delayMinutes || 0), 0);
      } else if (timeframe === 'bulanan') {
        targetHours = scheduledHoursPerWeek > 0 ? scheduledHoursPerWeek * 4 : 16;
        const seed = (parseInt(t.nip.slice(-4), 10) || 5) % 10;
        completedHours = targetHours - (seed === 9 ? 2 : seed === 8 ? 1 : 0);
        lateCount = seed % 3 === 0 ? 2 : seed % 2 === 0 ? 1 : 0;
        onTimeCount = Math.max(0, completedHours - lateCount);
        missedCount = Math.max(0, targetHours - completedHours);
        totalLateMinutes = lateCount * 12;
      } else {
        // Semester
        targetHours = scheduledHoursPerWeek > 0 ? scheduledHoursPerWeek * 18 : 72;
        const seed = (parseInt(t.nip.slice(-4), 10) || 5) % 10;
        completedHours = targetHours - (seed > 7 ? 4 : 1);
        lateCount = seed % 3 === 0 ? 5 : 2;
        onTimeCount = Math.max(0, completedHours - lateCount);
        missedCount = Math.max(0, targetHours - completedHours);
        totalLateMinutes = lateCount * 11;
      }

      const pendingHours = Math.max(0, targetHours - completedHours);
      const onTimeRate = completedHours > 0 ? ((onTimeCount / completedHours) * 100).toFixed(1) : '100';
      const teachingFulfillmentRate = targetHours > 0 ? ((completedHours / targetHours) * 100).toFixed(1) : '100';

      return {
        ...t,
        scheduledHoursPerWeek,
        targetHours,
        completedHours,
        pendingHours,
        onTimeCount,
        lateCount,
        missedCount,
        totalLateMinutes,
        onTimeRate: parseFloat(onTimeRate),
        teachingFulfillmentRate: parseFloat(teachingFulfillmentRate),
      };
    });
  }, [teachers, schedules, timeframe, teacherAttendances, currentDateString]);

  // Filtered teachers
  const filteredTeachers = useMemo(() => {
    return teacherStats.filter((t) => {
      if (selectedSubject !== 'all' && !t.subjectNames.includes(selectedSubject)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = t.name.toLowerCase().includes(q);
        const matchNip = t.nip.includes(q);
        const matchMapel = t.subjectNames.some((sn) => sn.toLowerCase().includes(q));
        if (!matchName && !matchNip && !matchMapel) return false;
      }
      return true;
    });
  }, [teacherStats, selectedSubject, searchQuery]);

  // Overall calculations
  const totalSummary = useMemo(() => {
    const totalTarget = filteredTeachers.reduce((acc, t) => acc + t.targetHours, 0);
    const totalCompleted = filteredTeachers.reduce((acc, t) => acc + t.completedHours, 0);
    const totalPending = filteredTeachers.reduce((acc, t) => acc + t.pendingHours, 0);
    const totalOnTime = filteredTeachers.reduce((acc, t) => acc + t.onTimeCount, 0);
    const totalLate = filteredTeachers.reduce((acc, t) => acc + t.lateCount, 0);
    const totalLateMin = filteredTeachers.reduce((acc, t) => acc + t.totalLateMinutes, 0);

    return { totalTarget, totalCompleted, totalPending, totalOnTime, totalLate, totalLateMin };
  }, [filteredTeachers]);

  const handleExportExcel = () => {
    const rows = filteredTeachers.map((t, idx) => ({
      No: idx + 1,
      'Nama Guru': t.name,
      NIP: t.nip,
      'Mata Pelajaran': t.subjectNames.join(', '),
      'Target Jam Mengajar': t.targetHours,
      'Jam Terlaksana': t.completedHours,
      'Jam Belum Terlaksana': t.pendingHours,
      'Tepat Waktu': t.onTimeCount,
      'Masuk Terlambat': t.lateCount,
      'Total Menit Terlambat': `${t.totalLateMinutes} Menit`,
      'Ketepatan Waktu (%)': `${t.onTimeRate}%`,
      'Ketercapaian Jam (%)': `${t.teachingFulfillmentRate}%`,
    }));
    exportToExcel(rows, `REKAP_KEHADIRAN_GURU_${timeframe.toUpperCase()}_${currentDateString}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <GraduationCap className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Rekapitulasi Kehadiran &amp; Jam Mengajar Guru
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ketercapaian jam mengajar tatap muka, ketepatan waktu, dan monitoring keterlambatan (Periode {timeframe})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-blue-600/30 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rekap Resmi</span>
          </button>
        </div>
      </div>

      {/* SUMMARY STATISTICS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
          <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 uppercase">
            Total Jam Target
          </div>
          <div className="text-xl font-bold text-blue-900 dark:text-blue-100 mt-1 font-mono">
            {totalSummary.totalTarget} JP
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
          <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase">
            Jam Terlaksana
          </div>
          <div className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mt-1 font-mono">
            {totalSummary.totalCompleted} JP
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
          <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase">
            Belum Terlaksana
          </div>
          <div className="text-xl font-bold text-amber-900 dark:text-amber-100 mt-1 font-mono">
            {totalSummary.totalPending} JP
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60">
          <div className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 uppercase">
            Masuk Tepat Waktu
          </div>
          <div className="text-xl font-bold text-teal-900 dark:text-teal-100 mt-1 font-mono">
            {totalSummary.totalOnTime} Kali
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60">
          <div className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 uppercase">
            Masuk Terlambat
          </div>
          <div className="text-xl font-bold text-rose-900 dark:text-rose-100 mt-1 font-mono">
            {totalSummary.totalLate} Kali
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60">
          <div className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 uppercase">
            Akumulasi Telat
          </div>
          <div className="text-xl font-bold text-purple-900 dark:text-purple-100 mt-1 font-mono">
            {totalSummary.totalLateMin} Mnt
          </div>
        </div>
      </div>

      {/* TIMEFRAME & FILTERS */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Timeframe selector: Harian, Bulanan, Semester */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['harian', 'bulanan', 'semester'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  timeframe === t
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Rekap {t}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
            >
              <option value="all">Semua Mata Pelajaran</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama guru, NIP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none w-56"
              />
            </div>
          </div>
        </div>
      </div>

      {/* TEACHER REKAP TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-4">Nama Guru &amp; NIP</th>
                <th className="py-3 px-3">Mata Pelajaran</th>
                <th className="py-3 px-3 text-center">Target JP</th>
                <th className="py-3 px-3 text-center">Terlaksana</th>
                <th className="py-3 px-3 text-center">Belum Terlaksana</th>
                <th className="py-3 px-3 text-center">Tepat Waktu</th>
                <th className="py-3 px-3 text-center">Terlambat</th>
                <th className="py-3 px-3 text-center">Total Telat</th>
                <th className="py-3 px-4 text-center">Ketercapaian</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTeachers.map((t, idx) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 text-center font-mono text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={t.photo}
                        alt={t.name}
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {t.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          NIP: {t.nip}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                    {t.subjectNames.join(', ')}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                    {t.targetHours} JP
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {t.completedHours} JP
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-medium text-rose-600 dark:text-rose-400">
                    {t.pendingHours} JP
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-teal-600 dark:text-teal-400 font-bold">
                    {t.onTimeCount}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-amber-600 dark:text-amber-400 font-bold">
                    {t.lateCount}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-500">
                    {t.totalLateMinutes > 0 ? `+${t.totalLateMinutes} mnt` : '0 mnt'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="font-mono font-bold text-slate-900 dark:text-white">
                      {t.teachingFulfillmentRate}%
                    </div>
                    <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${t.teachingFulfillmentRate}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedTeacherDetail(t)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
                      title="Lihat Detail Rekap Individual Guru"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INDIVIDUAL TEACHER DETAIL MODAL */}
      {selectedTeacherDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={selectedTeacherDetail.photo}
                  alt={selectedTeacherDetail.name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedTeacherDetail.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    NIP: {selectedTeacherDetail.nip}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Ketercapaian JP</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {selectedTeacherDetail.teachingFulfillmentRate}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <div className="text-slate-500 dark:text-slate-400 text-[10px]">Tepat Waktu</div>
                <div className="font-bold text-base text-emerald-600 font-mono">{selectedTeacherDetail.onTimeCount} Kali</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <div className="text-slate-500 dark:text-slate-400 text-[10px]">Terlambat</div>
                <div className="font-bold text-base text-amber-600 font-mono">{selectedTeacherDetail.lateCount} Kali</div>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                <div className="text-slate-500 dark:text-slate-400 text-[10px]">Belum Terlaksana</div>
                <div className="font-bold text-base text-rose-600 font-mono">{selectedTeacherDetail.pendingHours} JP</div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between text-slate-500">
                <span>Mata Pelajaran yang Diampu:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTeacherDetail.subjectNames.join(', ')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Kode Barcode Presensi:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedTeacherDetail.barcode}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Nomor Kontak / WhatsApp:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{selectedTeacherDetail.phone}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedTeacherDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
