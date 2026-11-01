import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Percent, 
  UserPlus, 
  Edit2 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STANDARD_PERIODS, formatIndonesianDate } from '../utils/date';
import { exportToExcel } from '../utils/export';
import { StudentAttendanceStatus } from '../types';

export const MonitoringSiswaView: React.FC = () => {
  const { 
    classrooms, 
    students, 
    teachers, 
    subjects, 
    schedules, 
    studentAttendances, 
    currentDateString, 
    currentTimeString, 
    currentDayName, 
    activePeriod,
    manualAddStudentAttendance,
    manualUpdateStudentStatus
  } = useApp();

  const [selectedPeriod, setSelectedPeriod] = useState<number>(activePeriod?.period || 1);
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [expandedClassId, setExpandedClassId] = useState<string | null>(classrooms[0]?.id || null);

  // Compute stats per classroom matching the user specification
  const classStats = useMemo(() => {
    return classrooms.map((cls) => {
      // Find schedule for this class, period and day
      const schedule = schedules.find(
        (s) => s.classroomId === cls.id && (s.day === currentDayName || true) && s.period === selectedPeriod
      ) || schedules.find((s) => s.classroomId === cls.id && s.period === selectedPeriod);

      const teacher = schedule ? teachers.find((t) => t.id === schedule.teacherId) : null;
      const subject = schedule ? subjects.find((s) => s.id === schedule.subjectId) : null;

      // Class students list
      const classStudents = students.filter((s) => s.classId === cls.id);
      const totalStudents = classStudents.length;

      // Attendances recorded for this period & today
      const recordsForPeriod = studentAttendances.filter(
        (a) => a.date === currentDateString && a.classroomId === cls.id && a.period === selectedPeriod
      );

      const presentList = recordsForPeriod.filter((r) => r.status === 'hadir');
      const sickList = recordsForPeriod.filter((r) => r.status === 'sakit');
      const permitList = recordsForPeriod.filter((r) => r.status === 'izin');
      const alphaList = recordsForPeriod.filter((r) => r.status === 'alpa');
      const lateList = recordsForPeriod.filter((r) => r.status === 'terlambat');

      const presentCount = presentList.length + lateList.length;
      const notPresentCount = Math.max(0, totalStudents - presentCount);
      const percentage = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(2) : '0.00';

      return {
        classroom: cls,
        schedule,
        teacher,
        subject,
        students: classStudents,
        total: totalStudents,
        present: presentCount,
        notPresent: notPresentCount,
        percentage: parseFloat(percentage),
        percentageFormatted: percentage.replace('.', ','),
        sickCount: sickList.length,
        permitCount: permitList.length,
        alphaCount: alphaList.length,
        recordsMap: new Map(recordsForPeriod.map((r) => [r.studentId, r])),
      };
    });
  }, [classrooms, schedules, currentDayName, selectedPeriod, teachers, subjects, students, studentAttendances, currentDateString]);

  // Apply filters
  const filteredClassStats = useMemo(() => {
    return classStats.filter((item) => {
      if (selectedGrade !== 'all' && item.classroom.grade !== selectedGrade) return false;
      if (selectedClassId !== 'all' && item.classroom.id !== selectedClassId) return false;
      if (selectedTeacherId !== 'all' && item.teacher?.id !== selectedTeacherId) return false;
      if (selectedSubjectId !== 'all' && item.subject?.id !== selectedSubjectId) return false;
      return true;
    });
  }, [classStats, selectedGrade, selectedClassId, selectedTeacherId, selectedSubjectId]);

  const handleExport = () => {
    const rows = filteredClassStats.map((item, idx) => ({
      No: idx + 1,
      Tanggal: currentDateString,
      'Jam Pelajaran': `Jam Ke-${selectedPeriod}`,
      Kelas: item.classroom.name,
      'Wali Kelas': item.classroom.homeroomTeacherName,
      'Guru Pengajar': item.teacher?.name || '-',
      'Mata Pelajaran': item.subject?.name || '-',
      'Jumlah Siswa': item.total,
      'Jumlah Hadir': item.present,
      'Jumlah Tidak Hadir': item.notPresent,
      'Persentase Kehadiran': `${item.percentageFormatted}%`,
    }));
    exportToExcel(rows, `MONITORING_PRESENSI_SISWA_${currentDateString}_JAM_${selectedPeriod}`);
  };

  const handleQuickStatusChange = (studentId: string, currentStatus: StudentAttendanceStatus, newStatus: StudentAttendanceStatus, recordId?: string) => {
    if (recordId) {
      manualUpdateStudentStatus(recordId, newStatus);
    } else {
      manualAddStudentAttendance(studentId, newStatus);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Overview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Monitoring Jumlah Siswa per Jam Pelajaran
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rekapitulasi otomatis presensi siswa setiap rombongan belajar pada setiap jam KBM ({currentDayName}, {formatIndonesianDate(currentDateString)})
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors border border-slate-200 dark:border-slate-700"
        >
          <Download className="w-4 h-4 text-emerald-500" />
          <span>Ekspor Rekap Excel</span>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        {/* Period Selector Tabs */}
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

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Tingkat Kelas
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
            >
              <option value="all">Semua Tingkat</option>
              <option value="7">Kelas VII</option>
              <option value="8">Kelas VIII</option>
              <option value="9">Kelas IX</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Nama Kelas / Rombel
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
            >
              <option value="all">Semua Kelas</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Guru Pengajar
            </label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
            >
              <option value="all">Semua Guru Pengajar</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Mata Pelajaran
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
            >
              <option value="all">Semua Mata Pelajaran</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* CLASS CARDS GRID (Format sesuai spesifikasi User) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClassStats.map((item) => {
          const isExpanded = expandedClassId === item.classroom.id;

          return (
            <div
              key={item.classroom.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:border-blue-500/50 transition-all"
            >
              <div className="p-5">
                {/* Header Card */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-sm border border-blue-100 dark:border-blue-900">
                      {item.classroom.name.replace('Kelas ', '')}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {item.classroom.name}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Wali Kelas: {item.classroom.homeroomTeacherName}
                      </p>
                    </div>
                  </div>
                  <span className={`font-mono font-bold text-xs px-2.5 py-1 rounded-full ${
                    item.percentage >= 95
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : item.percentage >= 85
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  }`}>
                    {item.percentageFormatted}%
                  </span>
                </div>

                {/* Subject & Teacher Info */}
                <div className="py-2.5 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 flex justify-between gap-2">
                  <div className="truncate">
                    <span className="text-slate-400">Guru: </span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {item.teacher?.name || 'Belum Terjadwal'}
                    </strong>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-slate-400">Mapel: </span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {item.subject?.code || '-'}
                    </strong>
                  </div>
                </div>

                {/* Exact metrics matching specification */}
                <div className="py-4 space-y-2.5 text-xs font-medium">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span>Jumlah siswa:</span>
                    </span>
                    <strong className="font-mono text-sm">{item.total}</strong>
                  </div>

                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Hadir:</span>
                    </span>
                    <strong className="font-mono text-sm">{item.present}</strong>
                  </div>

                  <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>Tidak hadir:</span>
                    </span>
                    <strong className="font-mono text-sm">{item.notPresent}</strong>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-blue-600 dark:text-blue-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5" />
                      <span>Persentase kehadiran:</span>
                    </span>
                    <span className="font-mono text-base">{item.percentageFormatted}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.percentage >= 95
                        ? 'bg-emerald-500'
                        : item.percentage >= 85
                        ? 'bg-blue-600'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>

              {/* Bottom Card Action: Expand Student List */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setExpandedClassId(isExpanded ? null : item.classroom.id)}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700"
                >
                  <span>{isExpanded ? 'Tutup Daftar Siswa' : `Lihat Siswa (${item.students.length})`}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Expanded Student Attendance Table */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto space-y-1.5">
                    {item.students.map((std) => {
                      const rec = item.recordsMap.get(std.id);
                      const currentStatus: StudentAttendanceStatus = rec?.status || 'alpa';

                      return (
                        <div
                          key={std.id}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs gap-2"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <img
                              src={std.photo}
                              alt={std.name}
                              className="w-6 h-6 rounded-md object-cover"
                            />
                            <div className="truncate">
                              <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                {std.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {std.nisn}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {/* Fast status selector pills */}
                            {(['hadir', 'sakit', 'izin', 'alpa'] as StudentAttendanceStatus[]).map((st) => (
                              <button
                                key={st}
                                onClick={() => handleQuickStatusChange(std.id, currentStatus, st, rec?.id)}
                                className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold transition-all ${
                                  currentStatus === st
                                    ? st === 'hadir'
                                      ? 'bg-emerald-600 text-white'
                                      : st === 'sakit'
                                      ? 'bg-amber-600 text-white'
                                      : st === 'izin'
                                      ? 'bg-sky-600 text-white'
                                      : 'bg-rose-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                {st === 'hadir' ? 'H' : st === 'sakit' ? 'S' : st === 'izin' ? 'I' : 'A'}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
