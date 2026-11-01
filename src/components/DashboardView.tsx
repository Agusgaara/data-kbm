import React, { useMemo, useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  DoorOpen, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  QrCode, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Percent,
  UserCheck2,
  Maximize2,
  Sliders,
  Volume2,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatIndonesianDate, STANDARD_PERIODS } from '../utils/date';

interface DashboardViewProps {
  onNavigateTab: (tab: any) => void;
  onOpenScanner: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab, onOpenScanner }) => {
  const { 
    teachers, 
    students, 
    classrooms, 
    subjects, 
    schedules, 
    teacherAttendances, 
    studentAttendances, 
    scanLogs,
    currentDateString, 
    currentTimeString, 
    currentDayName, 
    activePeriod,
    scanClassroomQR 
  } = useApp();

  const [activeFilterPeriod, setActiveFilterPeriod] = useState<number>(activePeriod?.period || 1);
  const targetPeriod = activeFilterPeriod > 0 ? activeFilterPeriod : 1;
  const periodObj = STANDARD_PERIODS.find((p) => p.period === targetPeriod) || STANDARD_PERIODS[0];

  // 1. Total teachers
  const totalTeachers = teachers.length;

  // 2 & 3. Teachers present / not present today
  const teachersWithAttendanceToday = useMemo(() => {
    const presentTeacherIds = new Set(
      teacherAttendances
        .filter((a) => a.date === currentDateString && a.status !== 'tidak_hadir' && a.status !== 'belum_masuk')
        .map((a) => a.teacherId)
    );
    return presentTeacherIds.size;
  }, [teacherAttendances, currentDateString]);

  const teachersNotPresentToday = totalTeachers - teachersWithAttendanceToday;

  // 4. Total students
  const totalStudents = students.length;

  // 5 & 6. Students present / not present today
  const studentsPresentToday = useMemo(() => {
    const presentStudentIds = new Set(
      studentAttendances
        .filter((a) => a.date === currentDateString && a.status === 'hadir')
        .map((a) => a.studentId)
    );
    return presentStudentIds.size;
  }, [studentAttendances, currentDateString]);

  const studentsNotPresentToday = totalStudents - studentsPresentToday;

  // 7. Active classes count
  const activeClassrooms = classrooms.length;

  // 8 & 9. Teachers entered class vs not entered for selected period
  const teachersEnteredCurrentPeriod = useMemo(() => {
    return teacherAttendances.filter(
      (a) => a.date === currentDateString && a.period === targetPeriod && (a.status === 'tepat_waktu' || a.status === 'terlambat')
    ).length;
  }, [teacherAttendances, currentDateString, targetPeriod]);

  const teachersNotEnteredCurrentPeriod = Math.max(0, activeClassrooms - teachersEnteredCurrentPeriod);

  // 10. Percentages
  const teacherAttendancePercentage = totalTeachers > 0 ? ((teachersWithAttendanceToday / totalTeachers) * 100).toFixed(1) : '0';
  const studentAttendancePercentage = totalStudents > 0 ? ((studentsPresentToday / totalStudents) * 100).toFixed(1) : '0';

  // Current period class status list WITH PROMINENT TEACHER PHOTOS
  const activeClassStatuses = useMemo(() => {
    return classrooms.map((cls) => {
      const schedule = schedules.find(
        (s) => s.classroomId === cls.id && (s.day === currentDayName || true) && s.period === targetPeriod
      ) || schedules.find((s) => s.classroomId === cls.id);

      const teacher = schedule ? teachers.find((t) => t.id === schedule.teacherId) : null;
      const subject = schedule ? subjects.find((s) => s.id === schedule.subjectId) : null;

      const attendance = teacherAttendances.find(
        (a) => a.date === currentDateString && a.classroomId === cls.id && a.period === targetPeriod
      );

      const studentCountPresent = studentAttendances.filter(
        (a) => a.date === currentDateString && a.classroomId === cls.id && a.period === targetPeriod && a.status === 'hadir'
      ).length;

      const totalClassStudents = students.filter((s) => s.classId === cls.id).length || cls.capacity;
      const studentPct = totalClassStudents > 0 ? ((studentCountPresent / totalClassStudents) * 100).toFixed(1) : '0';

      return {
        classroom: cls,
        schedule,
        teacher,
        subject,
        attendance,
        studentCountPresent,
        totalClassStudents,
        studentPct,
      };
    });
  }, [classrooms, schedules, currentDayName, targetPeriod, teachers, subjects, teacherAttendances, currentDateString, studentAttendances, students]);

  // Teachers currently in class (Sudah Masuk)
  const teachersCurrentlyTeaching = activeClassStatuses.filter(
    (item) => item.attendance?.status === 'tepat_waktu' || item.attendance?.status === 'terlambat'
  );

  return (
    <div className="space-y-3 flex flex-col h-full max-w-[1700px] mx-auto">
      {/* 1. TOP ULTRA-COMPACT CONTROL & 10 STATS STRIP (FITS IN SINGLE ROW/GRID) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3 shrink-0">
        {/* Left: Active Period Selector & Live Badge */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto shrink-0 justify-between lg:justify-start">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              {currentDayName}, {formatIndonesianDate(currentDateString)}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <button
                key={num}
                onClick={() => setActiveFilterPeriod(num)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  targetPeriod === num
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Jam {num}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenScanner}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR</span>
          </button>
        </div>

        {/* Right: 10 Core Metrics in Sleek Horizontal Counter Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full lg:w-auto text-xs shrink-0">
          {/* Guru Hadir vs Belum */}
          <div className="px-2.5 py-1.5 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Guru Hadir:</span>
            <span className="font-bold text-blue-700 dark:text-blue-300 font-mono text-xs">
              {teachersWithAttendanceToday}/{totalTeachers}
            </span>
          </div>

          {/* Guru di Kelas vs Belum Masuk */}
          <div className="px-2.5 py-1.5 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Masuk Kelas:</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300 font-mono text-xs">
              {teachersEnteredCurrentPeriod}/{activeClassrooms}
            </span>
          </div>

          {/* Guru Belum Masuk Kelas */}
          <div className="px-2.5 py-1.5 rounded-lg bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Belum Masuk:</span>
            <span className="font-bold text-rose-700 dark:text-rose-400 font-mono text-xs">
              {teachersNotEnteredCurrentPeriod} Kelas
            </span>
          </div>

          {/* Siswa Hadir vs Tidak Hadir */}
          <div className="px-2.5 py-1.5 rounded-lg bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-900/40 flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Siswa Hadir:</span>
            <span className="font-bold text-teal-700 dark:text-teal-300 font-mono text-xs">
              {studentsPresentToday}/{totalStudents}
            </span>
          </div>

          {/* Persentase Siswa & Guru */}
          <div className="px-2.5 py-1.5 rounded-lg bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/40 flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Presensi Total:</span>
            <span className="font-bold text-purple-700 dark:text-purple-300 font-mono text-xs">
              {studentAttendancePercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN 1-SCREEN VIEWPORT: SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0">
        {/* LEFT & CENTER (8 COLUMNS): FOTO GURU YANG SEDANG MASUK KELAS DI SETIAP RUANG */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-2">
          {/* Header section with status badges */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Monitoring Guru Masuk Kelas &amp; Status Ruangan (Jam Ke-{targetPeriod} • {periodObj.startTime} - {periodObj.endTime})
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Tepat Waktu
              </span>
              <span className="flex items-center gap-1 text-amber-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Terlambat
              </span>
              <span className="flex items-center gap-1 text-rose-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Belum Masuk
              </span>
            </div>
          </div>

          {/* 6 CLASSROOM CARDS WITH PROMINENT TEACHER PHOTOS (3x2 Dense Grid designed for 1-screen viewing) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 flex-1">
            {activeClassStatuses.map((item) => {
              const status = item.attendance?.status || 'belum_masuk';
              const isEntered = status === 'tepat_waktu' || status === 'terlambat';
              const isLate = status === 'terlambat';

              let cardBorder = 'border-rose-400/50 bg-rose-50/20 dark:bg-rose-950/10';
              let badgeBg = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30';
              let badgeText = 'Belum Masuk Kelas';
              let photoRing = 'ring-rose-500';

              if (status === 'tepat_waktu') {
                cardBorder = 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm';
                badgeBg = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
                badgeText = 'Sudah Masuk (Tepat)';
                photoRing = 'ring-emerald-500';
              } else if (isLate) {
                cardBorder = 'border-amber-500/50 bg-amber-50/20 dark:bg-amber-950/10 shadow-sm';
                badgeBg = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30';
                badgeText = `Terlambat (${item.attendance?.delayMinutes || 0} mnt)`;
                photoRing = 'ring-amber-500';
              }

              return (
                <div
                  key={item.classroom.id}
                  className={`bg-white dark:bg-slate-900 rounded-xl border-2 p-3 shadow-sm flex flex-col justify-between transition-all hover:scale-[1.01] ${cardBorder}`}
                >
                  {/* Top: Class Name & Status Badge */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                        {item.classroom.name.replace('Kelas ', '')}
                      </span>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                          {item.classroom.name}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {item.classroom.buildingLocation.split(',')[0]}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeBg}`}>
                      {badgeText}
                    </span>
                  </div>

                  {/* PROMINENT TEACHER PHOTO & DETAILS */}
                  <div className="py-2.5 flex items-center gap-3">
                    <div className="relative shrink-0">
                      {item.teacher?.photo ? (
                        <img
                          src={item.teacher.photo}
                          alt={item.teacher.name}
                          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover ring-2 shadow-md ${photoRing}`}
                        />
                      ) : (
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 text-lg">
                          ?
                        </div>
                      )}
                      {/* Active indicator dot */}
                      <span
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center ${
                          isEntered ? (isLate ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-rose-500'
                        }`}
                      >
                        {isEntered ? <Check className="w-2.5 h-2.5 text-white" /> : <Clock className="w-2.5 h-2.5 text-white" />}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Guru Pengajar:</div>
                      <h5 className="font-bold text-xs sm:text-[13px] text-slate-900 dark:text-white truncate">
                        {item.teacher?.name || 'Belum Terjadwal'}
                      </h5>
                      <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 truncate">
                        {item.subject?.name || 'Mata Pelajaran'}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                        {item.attendance?.timeIn ? `Masuk: ${item.attendance.timeIn}` : 'Belum Scan QR'}
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Student Attendance Ratio in Class */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Siswa Hadir:</span>
                      <strong className="font-mono text-slate-900 dark:text-white">
                        {item.studentCountPresent}/{item.totalClassStudents}
                      </strong>
                    </div>

                    <span className={`font-mono font-bold ${
                      parseFloat(item.studentPct) >= 95 ? 'text-emerald-600' : 'text-blue-600'
                    }`}>
                      {item.studentPct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Classroom QR Test Strip */}
          <div className="bg-slate-100 dark:bg-slate-800/60 p-2 rounded-xl flex items-center justify-between gap-2 text-xs">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 shrink-0">
              <QrCode className="w-3.5 h-3.5 text-blue-500" />
              <span>Simulasi Cepat Masuk Kelas:</span>
            </span>
            <div className="flex items-center gap-1 overflow-x-auto">
              {classrooms.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    const res = scanClassroomQR(c.qrCode);
                    alert(res.message);
                  }}
                  className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-50 hover:text-blue-600 shrink-0 transition-colors"
                >
                  Scan {c.name.replace('Kelas ', '')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT (4 COLUMNS): SPOTLIGHT GURU YANG SEDANG MENGAJAR + AKTIVITAS TERKINI */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-3">
          {/* SPOTLIGHT: GURU SEDANG MENGAJAR (DENGAN FOTO LENGKAP) */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-500" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Foto Guru Sedang di Kelas ({teachersCurrentlyTeaching.length} Guru)
                </h4>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                Aktif KBM
              </span>
            </div>

            {teachersCurrentlyTeaching.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Belum ada guru yang melakukan scan masuk kelas pada jam ini.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {teachersCurrentlyTeaching.map((item) => (
                  <div
                    key={item.classroom.id}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <img
                        src={item.teacher?.photo}
                        alt={item.teacher?.name}
                        className="w-10 h-10 rounded-lg object-cover ring-2 ring-emerald-500/60 shrink-0"
                      />
                      <div className="truncate">
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {item.teacher?.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {item.classroom.name} • {item.subject?.code}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.attendance?.status === 'tepat_waktu'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {item.attendance?.status === 'tepat_waktu' ? 'Tepat Waktu' : `+${item.attendance?.delayMinutes}m`}
                      </span>
                      <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                        {item.attendance?.timeIn}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AKTIVITAS PEMINDAIAN BARCODE TERKINI (COMPACT FEED) */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-teal-500" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Log Pemindaian Barcode Terkini
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Live Feed</span>
              </div>

              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {scanLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs"
                  >
                    {log.photo ? (
                      <img
                        src={log.photo}
                        alt={log.title}
                        className="w-7 h-7 rounded-md object-cover shrink-0 ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center shrink-0 text-[10px] font-bold">
                        QR
                      </div>
                    )}
                    <div className="truncate flex-1">
                      <div className="font-bold text-[11px] text-slate-900 dark:text-white truncate">
                        {log.title}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{log.subtitle}</div>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 shrink-0">
                      {log.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions at bottom of right column */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 mt-2">
              <button
                onClick={() => onNavigateTab('monitoring_guru')}
                className="flex-1 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 dark:text-slate-200 text-center transition-colors"
              >
                Tabel Monitoring Lengkap
              </button>
              <button
                onClick={() => onNavigateTab('tv_mode')}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center gap-1"
                title="Buka TV Kiosk Display"
              >
                <Maximize2 className="w-3 h-3" />
                <span>TV Mode</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
