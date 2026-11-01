import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Clock, 
  Calendar, 
  Users, 
  GraduationCap, 
  DoorOpen, 
  Maximize2, 
  Minimize2, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert,
  Volume2,
  RefreshCw,
  Bell
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatIndonesianDate, STANDARD_PERIODS } from '../utils/date';
import { SCHOOL_INFO } from '../data/initialData';

interface TvDashboardViewProps {
  onExit: () => void;
}

export const TvDashboardView: React.FC<TvDashboardViewProps> = ({ onExit }) => {
  const { 
    teachers, 
    students, 
    classrooms, 
    subjects, 
    schedules, 
    teacherAttendances, 
    studentAttendances, 
    currentTimeString, 
    currentDateString, 
    currentDayName, 
    activePeriod 
  } = useApp();

  const [isFullscreen, setIsFullscreen] = useState(false);

  const targetPeriod = activePeriod && activePeriod.period > 0 ? activePeriod.period : 1;
  const periodObj = STANDARD_PERIODS.find((p) => p.period === targetPeriod) || STANDARD_PERIODS[0];

  const totalTeachers = teachers.length;
  const teachersPresent = teacherAttendances.filter(
    (a) => a.date === currentDateString && (a.status === 'tepat_waktu' || a.status === 'terlambat')
  ).length;
  const teachersPending = Math.max(0, classrooms.length - teachersPresent);

  const totalStudents = students.length;
  const studentsPresent = studentAttendances.filter(
    (a) => a.date === currentDateString && a.status === 'hadir'
  ).length;
  const studentsAbsent = Math.max(0, totalStudents - studentsPresent);
  const studentPercentage = totalStudents > 0 ? ((studentsPresent / totalStudents) * 100).toFixed(1) : '0';

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Build classroom cards
  const classroomStatusCards = classrooms.map((cls) => {
    const schedule = schedules.find(
      (s) => s.classroomId === cls.id && (s.day === currentDayName || true) && s.period === targetPeriod
    ) || schedules.find((s) => s.classroomId === cls.id);

    const teacher = schedule ? teachers.find((t) => t.id === schedule.teacherId) : null;
    const subject = schedule ? subjects.find((s) => s.id === schedule.subjectId) : null;

    const attendance = teacherAttendances.find(
      (a) => a.date === currentDateString && a.classroomId === cls.id && a.period === targetPeriod
    );

    const studentsInClass = students.filter((s) => s.classId === cls.id);
    const presentInClass = studentAttendances.filter(
      (a) => a.date === currentDateString && a.classroomId === cls.id && a.period === targetPeriod && a.status === 'hadir'
    ).length;

    const status = attendance?.status || 'belum_masuk';

    return {
      classroom: cls,
      teacher,
      subject,
      attendance,
      status,
      presentInClass,
      totalInClass: studentsInClass.length || cls.capacity,
      pctInClass: studentsInClass.length > 0 ? ((presentInClass / studentsInClass.length) * 100).toFixed(0) : '0',
    };
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between overflow-hidden font-sans select-none">
      {/* TOP TV HEADER */}
      <div className="px-8 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-sky-400 p-0.5 shadow-lg flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-wide text-white">
                {SCHOOL_INFO.name}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                DISPLAY RUANG GURU &amp; KAMAD
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              SISTEM MONITORING PRESENSI GURU MASUK KELAS &amp; JUMLAH SISWA REAL-TIME
            </p>
          </div>
        </div>

        {/* Big Live Clock */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs text-sky-400 font-semibold tracking-wider uppercase">
              {currentDayName}, {formatIndonesianDate(currentDateString)}
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300 tracking-wider flex items-center gap-2">
              <Clock className="w-6 h-6 text-amber-400 animate-pulse" />
              <span>{currentTimeString} WITA</span>
            </div>
          </div>

          <div className="h-10 w-px bg-slate-800" />

          {/* Active Period Badge */}
          <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Jam Pelajaran Aktif</div>
            <div className="text-sm font-bold text-emerald-400">
              {periodObj.name} ({periodObj.startTime} - {periodObj.endTime})
            </div>
          </div>

          {/* Fullscreen & Exit Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Toggle Layar Penuh (Fullscreen)"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onExit}
              className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors"
              title="Kembali ke Dashboard Standar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="px-8 py-4 grid grid-cols-5 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-xs uppercase font-bold text-slate-400">Guru di Kelas</div>
            <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
              {teachersPresent} <span className="text-sm font-normal text-slate-400">/ {classrooms.length}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-xs uppercase font-bold text-slate-400">Belum Masuk Kelas</div>
            <div className="text-3xl font-black text-rose-400 font-mono mt-1">
              {teachersPending} <span className="text-sm font-normal text-slate-400">Guru</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-xs uppercase font-bold text-slate-400">Total Siswa Hadir</div>
            <div className="text-3xl font-black text-teal-400 font-mono mt-1">
              {studentsPresent} <span className="text-sm font-normal text-slate-400">/ {totalStudents}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-xs uppercase font-bold text-slate-400">Siswa Tidak Hadir</div>
            <div className="text-3xl font-black text-amber-400 font-mono mt-1">
              {studentsAbsent} <span className="text-sm font-normal text-slate-400">Siswa</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-xs uppercase font-bold text-slate-400">Persentase Presensi</div>
            <div className="text-3xl font-black text-sky-400 font-mono mt-1">
              {studentPercentage}%
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* MAIN BODY: HIGH-VISIBILITY CLASSROOM CARDS */}
      <div className="flex-1 px-8 py-2 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classroomStatusCards.map((item) => {
            let cardBg = 'bg-slate-900 border-slate-800';
            let statusPill = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
            let statusText = 'BELUM MASUK KELAS';
            let dotColor = 'bg-rose-500';

            if (item.status === 'tepat_waktu') {
              cardBg = 'bg-slate-900 border-emerald-500/40 shadow-emerald-950/20';
              statusPill = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
              statusText = 'SUDAH MASUK (TEPAT WAKTU)';
              dotColor = 'bg-emerald-400';
            } else if (item.status === 'terlambat') {
              cardBg = 'bg-slate-900 border-amber-500/40 shadow-amber-950/20';
              statusPill = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
              statusText = `TERLAMBAT (${item.attendance?.delayMinutes || 0} MNT)`;
              dotColor = 'bg-amber-400';
            }

            return (
              <div
                key={item.classroom.id}
                className={`rounded-2xl border-2 p-5 shadow-xl flex flex-col justify-between transition-all ${cardBg}`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black text-lg">
                        {item.classroom.name.replace('Kelas ', '')}
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-white tracking-tight">
                          {item.classroom.name}
                        </h2>
                        <p className="text-xs text-slate-400">
                          {item.classroom.buildingLocation}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border">
                      <span className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />
                      <span className={statusPill}>{statusText}</span>
                    </div>
                  </div>

                  {/* Teacher & Subject Info with Prominent Photo */}
                  <div className="py-4 flex items-center gap-4">
                    <div className="relative shrink-0">
                      {item.teacher?.photo ? (
                        <img
                          src={item.teacher.photo}
                          alt={item.teacher.name}
                          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 shadow-xl ${
                            item.status === 'tepat_waktu'
                              ? 'ring-emerald-500'
                              : item.status === 'terlambat'
                              ? 'ring-amber-500'
                              : 'ring-rose-500/80'
                          }`}
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800 flex items-center justify-center font-bold text-slate-400 text-xl ring-2 ring-slate-700">
                          ?
                        </div>
                      )}
                      <span className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase text-white ${
                        item.status === 'tepat_waktu' ? 'bg-emerald-600' : item.status === 'terlambat' ? 'bg-amber-600' : 'bg-rose-600'
                      }`}>
                        {item.status === 'tepat_waktu' ? 'Aktif' : item.status === 'terlambat' ? 'Telat' : 'Kosong'}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                        Guru Pengajar di Kelas:
                      </div>
                      <div className="text-base sm:text-lg font-black text-white truncate leading-tight mt-0.5">
                        {item.teacher?.name || 'Belum Terjadwal'}
                      </div>
                      <div className="text-xs font-bold text-emerald-400 truncate mt-1">
                        {item.subject?.name || 'Mata Pelajaran'}
                      </div>
                      <div className="text-xs font-mono text-slate-400 mt-1">
                        {item.attendance?.timeIn ? `Waktu Masuk: ${item.attendance.timeIn}` : 'Belum Memindai QR'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Card: Student Attendance Ratio */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Kehadiran Siswa: </span>
                    <strong className="text-white font-mono text-sm">
                      {item.presentInClass} / {item.totalInClass}
                    </strong>
                  </div>
                  <div className="font-mono font-bold text-sky-400 text-sm">
                    {item.pctInClass}% Hadir
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM RUNNING TICKER */}
      <div className="bg-slate-900 border-t border-slate-800 px-6 py-2.5 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold shrink-0 border border-emerald-500/30">
          <Bell className="w-3.5 h-3.5 animate-bounce" />
          <span>PENGUMUMAN MADRASAH</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="whitespace-nowrap animate-marquee font-medium text-slate-300">
            Selamat datang di MTs Negeri 1 Lombok Barat • Seluruh Bapak/Ibu Guru wajib melakukan pemindaian QR Code ruang kelas tepat waktu • Presensi siswa wajib dicatat pada Jam Ke-1 • Jam istirahat I dimulai pukul 09:15 WITA.
          </div>
        </div>
        <div className="text-[11px] text-slate-500 font-mono shrink-0">
          SIMATIK TV v1.0
        </div>
      </div>
    </div>
  );
};
