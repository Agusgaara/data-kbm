import React, { useState, useMemo } from 'react';
import { 
  UserCheck2, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Edit3, 
  QrCode,
  Download,
  Building
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STANDARD_PERIODS, formatIndonesianDate } from '../utils/date';
import { exportToExcel } from '../utils/export';
import { TeacherAttendanceStatus } from '../types';

export const MonitoringGuruView: React.FC = () => {
  const { 
    teachers, 
    classrooms, 
    subjects, 
    schedules, 
    teacherAttendances, 
    currentDateString, 
    currentTimeString, 
    currentDayName, 
    activePeriod,
    manualUpdateTeacherStatus,
    scanClassroomQR
  } = useApp();

  const [selectedPeriod, setSelectedPeriod] = useState<number>(activePeriod?.period || 1);
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Editing dialog state
  const [editingAttendance, setEditingAttendance] = useState<{
    id: string;
    teacherName: string;
    className: string;
    status: TeacherAttendanceStatus;
    notes: string;
  } | null>(null);

  // Construct comprehensive monitoring rows for each class for the selected period
  const monitoringRows = useMemo(() => {
    return classrooms.map((cls) => {
      // Find scheduled lesson
      const schedule = schedules.find(
        (s) => s.classroomId === cls.id && (s.day === currentDayName || true) && s.period === selectedPeriod
      ) || schedules.find((s) => s.classroomId === cls.id && s.period === selectedPeriod);

      const teacher = schedule ? teachers.find((t) => t.id === schedule.teacherId) : null;
      const subject = schedule ? subjects.find((s) => s.id === schedule.subjectId) : null;

      // Find attendance record for today & this period
      const attendance = teacherAttendances.find(
        (a) => a.date === currentDateString && a.classroomId === cls.id && a.period === selectedPeriod
      );

      const periodObj = STANDARD_PERIODS.find((p) => p.period === selectedPeriod) || STANDARD_PERIODS[0];

      // Determine computed status
      let status: TeacherAttendanceStatus = 'belum_masuk';
      let delayMinutes = 0;
      let timeIn: string | undefined = undefined;
      let notes = 'Belum melakukan scan masuk kelas';

      if (attendance) {
        status = attendance.status;
        delayMinutes = attendance.delayMinutes;
        timeIn = attendance.timeIn;
        notes = attendance.notes || '-';
      }

      return {
        classroomId: cls.id,
        className: cls.name,
        grade: cls.grade,
        qrCode: cls.qrCode,
        location: cls.buildingLocation,
        teacherId: teacher?.id || '',
        teacherName: teacher?.name || 'Belum Ditentukan',
        teacherNip: teacher?.nip || '-',
        teacherPhoto: teacher?.photo || '',
        subjectCode: subject?.code || '-',
        subjectName: subject?.name || 'Mata Pelajaran',
        period: selectedPeriod,
        periodName: periodObj.name,
        periodTime: `${periodObj.startTime} - ${periodObj.endTime}`,
        status,
        timeIn,
        delayMinutes,
        notes,
        attendanceId: attendance?.id,
      };
    });
  }, [classrooms, schedules, currentDayName, selectedPeriod, teachers, subjects, teacherAttendances, currentDateString]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return monitoringRows.filter((row) => {
      if (selectedGrade !== 'all' && row.grade !== selectedGrade) return false;
      if (selectedStatus !== 'all' && row.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = row.teacherName.toLowerCase().includes(q);
        const matchNip = row.teacherNip.toLowerCase().includes(q);
        const matchClass = row.className.toLowerCase().includes(q);
        const matchSubject = row.subjectName.toLowerCase().includes(q);
        if (!matchName && !matchNip && !matchClass && !matchSubject) return false;
      }
      return true;
    });
  }, [monitoringRows, selectedGrade, selectedStatus, searchQuery]);

  // Export to Excel
  const handleExport = () => {
    const exportData = filteredRows.map((r, index) => ({
      No: index + 1,
      Tanggal: currentDateString,
      'Jam Pelajaran': r.periodName,
      'Waktu KBM': r.periodTime,
      Kelas: r.className,
      'Nama Guru': r.teacherName,
      NIP: r.teacherNip,
      'Mata Pelajaran': r.subjectName,
      'Jam Masuk': r.timeIn || 'Belum Masuk',
      Status: r.status === 'tepat_waktu' ? 'Sudah Masuk (Tepat Waktu)' : r.status === 'terlambat' ? `Terlambat (${r.delayMinutes} mnt)` : 'Belum Masuk',
      'Keterangan': r.notes,
    }));
    exportToExcel(exportData, `MONITORING_GURU_MASUK_KELAS_${currentDateString}_JAM_${selectedPeriod}`);
  };

  const handleSimulateQuickScan = (qrCode: string, teacherId?: string) => {
    const res = scanClassroomQR(qrCode, teacherId);
    alert(res.message);
  };

  const handleSaveModal = () => {
    if (!editingAttendance) return;
    if (editingAttendance.id) {
      manualUpdateTeacherStatus(editingAttendance.id, editingAttendance.status, editingAttendance.notes);
    }
    setEditingAttendance(null);
  };

  return (
    <div className="space-y-6">
      {/* Header and Control Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <UserCheck2 className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Monitoring Guru Masuk Kelas
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pantau kehadiran dan ketepatan waktu guru di setiap ruang kelas per jam pelajaran ({currentDayName}, {formatIndonesianDate(currentDateString)})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExport}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Ekspor Excel</span>
          </button>
        </div>
      </div>

      {/* FILTER BUTTONS & CONTROLS */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Period Selector Tabs (Jam Ke-1 s/d Jam Ke-8) */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Pilih Jam Pelajaran:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
              const p = STANDARD_PERIODS.find((sp) => sp.period === num);
              const isActive = selectedPeriod === num;
              return (
                <button
                  key={num}
                  onClick={() => setSelectedPeriod(num)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>Jam Ke-{num}</span>
                  {p && <span className="text-[10px] opacity-80">({p.startTime})</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari nama guru, NIP, kelas, mapel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Grade filter */}
          <div>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Tingkat (Kelas VII, VIII, IX)</option>
              <option value="7">Kelas VII Saja</option>
              <option value="8">Kelas VIII Saja</option>
              <option value="9">Kelas IX Saja</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Status Kehadiran</option>
              <option value="tepat_waktu">Hijau - Sudah Masuk (Tepat Waktu)</option>
              <option value="terlambat">Kuning - Terlambat Masuk</option>
              <option value="belum_masuk">Merah - Belum Masuk Kelas</option>
              <option value="selesai">Abu-abu - Jam Selesai</option>
            </select>
          </div>
        </div>
      </div>

      {/* STATUS COLOR LEGEND BANNER */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
        <span className="font-bold text-slate-600 dark:text-slate-400 text-[11px] uppercase tracking-wider">
          Indikator Warna Status:
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">Hijau: Sudah Masuk (Tepat Waktu)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">Kuning: Terlambat Masuk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">Merah: Belum Masuk Kelas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-slate-400" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">Abu-abu: Jam Selesai</span>
        </div>
      </div>

      {/* MAIN MONITORING TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Ruang Kelas</th>
                <th className="py-3 px-4">Guru Pengajar &amp; NIP</th>
                <th className="py-3 px-4">Mata Pelajaran</th>
                <th className="py-3 px-4">Jadwal &amp; Jam Masuk</th>
                <th className="py-3 px-4">Status Kehadiran</th>
                <th className="py-3 px-4">Keterlambatan &amp; Catatan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada data kelas yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  let statusBadgeClass = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30';
                  let statusText = 'Belum Masuk Kelas';
                  let statusDot = 'bg-rose-500';

                  if (row.status === 'tepat_waktu') {
                    statusBadgeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
                    statusText = 'Sudah Masuk (Tepat Waktu)';
                    statusDot = 'bg-emerald-500';
                  } else if (row.status === 'terlambat') {
                    statusBadgeClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30';
                    statusText = `Terlambat ${row.delayMinutes} Menit`;
                    statusDot = 'bg-amber-500';
                  } else if (row.status === 'selesai') {
                    statusBadgeClass = 'bg-slate-500/10 text-slate-500 border border-slate-500/30';
                    statusText = 'Jam Selesai';
                    statusDot = 'bg-slate-400';
                  }

                  return (
                    <tr
                      key={row.classroomId}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Kelas */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900">
                            {row.className.replace('Kelas ', '')}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {row.className}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {row.location}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Guru */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {row.teacherPhoto ? (
                            <img
                              src={row.teacherPhoto}
                              alt={row.teacherName}
                              className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 font-bold text-slate-600">
                              G
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {row.teacherName}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">
                              NIP: {row.teacherNip}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Mapel */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {row.subjectName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Kode: {row.subjectCode}
                        </div>
                      </td>

                      {/* Jadwal & Jam Masuk */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-800 dark:text-slate-200">
                          {row.periodTime}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Masuk: <strong className="font-mono">{row.timeIn || '—'}</strong>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusBadgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                          <span>{statusText}</span>
                        </span>
                      </td>

                      {/* Keterlambatan & Catatan */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 dark:text-slate-300 max-w-xs truncate">
                          {row.notes}
                        </div>
                        {row.delayMinutes > 0 && (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                            Keterlambatan: +{row.delayMinutes} menit
                          </div>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick test scan button */}
                          <button
                            onClick={() => handleSimulateQuickScan(row.qrCode, row.teacherId)}
                            title="Simulasikan Scan QR Ruang Kelas Ini"
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 transition-colors"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit manual */}
                          <button
                            onClick={() =>
                              setEditingAttendance({
                                id: row.attendanceId || '',
                                teacherName: row.teacherName,
                                className: row.className,
                                status: row.status,
                                notes: row.notes,
                              })
                            }
                            title="Ubah Status Manual (Guru Piket / Operator)"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Edit Modal */}
      {editingAttendance && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Penyesuaian Status Guru Masuk Kelas
            </h3>
            <p className="text-xs text-slate-500">
              {editingAttendance.teacherName} • {editingAttendance.className}
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Status Kehadiran
                </label>
                <select
                  value={editingAttendance.status}
                  onChange={(e) =>
                    setEditingAttendance({
                      ...editingAttendance,
                      status: e.target.value as TeacherAttendanceStatus,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                >
                  <option value="tepat_waktu">Tepat Waktu (Hijau)</option>
                  <option value="terlambat">Terlambat Masuk (Kuning)</option>
                  <option value="belum_masuk">Belum Masuk Kelas (Merah)</option>
                  <option value="tidak_hadir">Tidak Hadir / Izin</option>
                  <option value="selesai">Jam Selesai (Abu-abu)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Keterangan / Alasan Keterlambatan
                </label>
                <textarea
                  value={editingAttendance.notes}
                  onChange={(e) =>
                    setEditingAttendance({
                      ...editingAttendance,
                      notes: e.target.value,
                    })
                  }
                  rows={3}
                  placeholder="Contoh: Mengikuti arahan kepala madrasah, dispensasi dinas luar, dll."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingAttendance(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={handleSaveModal}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
