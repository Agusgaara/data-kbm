import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  User, 
  Teacher, 
  Student, 
  Classroom, 
  Subject, 
  Schedule, 
  AcademicYear, 
  Semester, 
  TeacherAttendance, 
  StudentAttendance, 
  ScanLog,
  SchedulePeriod,
  DayOfWeek
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_TEACHERS, 
  INITIAL_CLASSROOMS, 
  INITIAL_STUDENTS, 
  INITIAL_SUBJECTS, 
  INITIAL_SCHEDULES, 
  INITIAL_ACADEMIC_YEARS, 
  INITIAL_SEMESTERS,
  generateInitialAttendance 
} from '../data/initialData';
import { 
  getTodayDateString, 
  getCurrentTimeString, 
  getIndonesianDayName, 
  determineActivePeriod,
  STANDARD_PERIODS,
  calculateDelayMinutes 
} from '../utils/date';
import { soundEffects } from '../utils/audio';

interface ScanResult {
  success: boolean;
  type: 'guru_masuk_kelas' | 'siswa_absen';
  title: string;
  subtitle: string;
  photo?: string;
  details?: Record<string, string | number>;
  statusType?: 'success' | 'warning' | 'error';
  message: string;
}

interface AppContextType {
  // Current user & role
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  
  // Master data
  teachers: Teacher[];
  students: Student[];
  classrooms: Classroom[];
  subjects: Subject[];
  schedules: Schedule[];
  academicYears: AcademicYear[];
  semesters: Semester[];

  // Attendance records
  teacherAttendances: TeacherAttendance[];
  studentAttendances: StudentAttendance[];
  scanLogs: ScanLog[];

  // Time and Period
  simulatedTime: string | null;
  setSimulatedTime: (time: string | null) => void;
  activePeriod: SchedulePeriod | null;
  currentDayName: DayOfWeek;
  currentTimeString: string;
  currentDateString: string;

  // Actions
  scanClassroomQR: (qrCode: string, teacherId?: string) => ScanResult;
  scanStudentBarcode: (barcodeOrNisn: string) => ScanResult;
  manualUpdateStudentStatus: (attendanceId: string, status: StudentAttendance['status'], notes?: string) => void;
  manualAddStudentAttendance: (studentId: string, status: StudentAttendance['status'], notes?: string) => void;
  manualUpdateTeacherStatus: (attendanceId: string, status: TeacherAttendance['status'], notes?: string) => void;
  
  // Master Data CRUD
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (teacher: Teacher) => void;
  deleteTeacher: (id: string) => void;

  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  importStudentsBulk: (students: Omit<Student, 'id'>[]) => void;

  addClassroom: (classroom: Omit<Classroom, 'id'>) => void;
  updateClassroom: (classroom: Classroom) => void;
  deleteClassroom: (id: string) => void;

  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (id: string) => void;

  addSchedule: (schedule: Omit<Schedule, 'id'>) => void;
  updateSchedule: (schedule: Schedule) => void;
  deleteSchedule: (id: string) => void;

  // System actions
  resetToDemoData: () => void;
  backupDatabase: () => void;
  restoreDatabase: (jsonData: string) => boolean;
  clearScanLogs: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY_PREFIX = 'mtsn1lobar_monitoring_v1_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from LocalStorage or initialize with seed
  const [users] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}current_user`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_USERS[0]; // Admin by default
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}teachers`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_TEACHERS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}students`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_STUDENTS;
  });

  const [classrooms, setClassrooms] = useState<Classroom[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}classrooms`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_CLASSROOMS;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}subjects`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_SUBJECTS;
  });

  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}schedules`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_SCHEDULES;
  });

  const [academicYears] = useState<AcademicYear[]>(INITIAL_ACADEMIC_YEARS);
  const [semesters] = useState<Semester[]>(INITIAL_SEMESTERS);

  // Initial attendances
  const [teacherAttendances, setTeacherAttendances] = useState<TeacherAttendance[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}teacher_attendances`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    const initial = generateInitialAttendance();
    return initial.teacherAttendance;
  });

  const [studentAttendances, setStudentAttendances] = useState<StudentAttendance[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}student_attendances`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    const initial = generateInitialAttendance();
    return initial.studentAttendance;
  });

  const [scanLogs, setScanLogs] = useState<ScanLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}scan_logs`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    const initial = generateInitialAttendance();
    return initial.scanLogs;
  });

  // Time & Simulation
  const [simulatedTime, setSimulatedTime] = useState<string | null>(null);
  const [realClock, setRealClock] = useState<Date>(new Date());

  // Clock tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setRealClock(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentDateString = useMemo(() => getTodayDateString(realClock), [realClock]);
  
  const currentTimeString = useMemo(() => {
    if (simulatedTime) {
      return simulatedTime.length === 5 ? `${simulatedTime}:00` : simulatedTime;
    }
    return getCurrentTimeString(realClock);
  }, [simulatedTime, realClock]);

  const currentDayName = useMemo(() => getIndonesianDayName(realClock), [realClock]);

  const activePeriod = useMemo(() => {
    return determineActivePeriod(currentTimeString);
  }, [currentTimeString]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}current_user`, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}teachers`, JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}students`, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}classrooms`, JSON.stringify(classrooms));
  }, [classrooms]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}subjects`, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}schedules`, JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}teacher_attendances`, JSON.stringify(teacherAttendances));
  }, [teacherAttendances]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}student_attendances`, JSON.stringify(studentAttendances));
  }, [studentAttendances]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}scan_logs`, JSON.stringify(scanLogs));
  }, [scanLogs]);

  // Scan Classroom QR Code (Guru Masuk Kelas)
  const scanClassroomQR = useCallback((qrCode: string, targetTeacherId?: string): ScanResult => {
    const cleanCode = qrCode.trim().toUpperCase();
    const classroom = classrooms.find((c) => c.qrCode.toUpperCase() === cleanCode || c.id === qrCode || c.name.toLowerCase() === qrCode.toLowerCase());

    if (!classroom) {
      soundEffects.playError();
      return {
        success: false,
        type: 'guru_masuk_kelas',
        title: 'QR Code Tidak Dikenal',
        subtitle: `Barcode: "${qrCode}"`,
        statusType: 'error',
        message: 'Kode barcode ruang kelas tidak terdaftar di sistem MTsN 1 Lombok Barat.',
      };
    }

    // Determine period: active period or Jam 1 as fallback
    const targetPeriodNumber = activePeriod && activePeriod.period > 0 ? activePeriod.period : 1;
    const periodObj = STANDARD_PERIODS.find((p) => p.period === targetPeriodNumber) || STANDARD_PERIODS[0];

    // Find schedule for today & this period
    let schedule = schedules.find((s) => s.classroomId === classroom.id && s.day === currentDayName && s.period === targetPeriodNumber);

    // If no schedule for this specific day (e.g. testing on Sunday/holiday), find first schedule for this class & period
    if (!schedule) {
      schedule = schedules.find((s) => s.classroomId === classroom.id && s.period === targetPeriodNumber);
    }
    // If still none, any schedule for this class
    if (!schedule) {
      schedule = schedules.find((s) => s.classroomId === classroom.id);
    }

    // Determine teacher
    let teacher: Teacher | undefined;
    if (targetTeacherId) {
      teacher = teachers.find((t) => t.id === targetTeacherId);
    } else if (currentUser.teacherId) {
      teacher = teachers.find((t) => t.id === currentUser.teacherId);
    } else if (schedule) {
      teacher = teachers.find((t) => t.id === schedule.teacherId);
    }

    if (!teacher && schedule) {
      teacher = teachers.find((t) => t.id === schedule.teacherId);
    }

    if (!teacher) {
      teacher = teachers[0];
    }

    const subject = schedule 
      ? subjects.find((s) => s.id === schedule.subjectId) 
      : subjects[0];

    const todayDate = currentDateString;
    const nowTime = currentTimeString;

    // Check duplicate: has this teacher or classroom already scanned for this period today?
    const existingIndex = teacherAttendances.findIndex(
      (a) => a.date === todayDate && a.classroomId === classroom.id && a.period === targetPeriodNumber && a.status !== 'belum_masuk'
    );

    if (existingIndex >= 0) {
      const existing = teacherAttendances[existingIndex];
      soundEffects.playWarning();
      return {
        success: false,
        type: 'guru_masuk_kelas',
        title: 'Sudah Pernah Dipindai',
        subtitle: `${classroom.name} • ${teacher.name}`,
        photo: teacher.photo,
        details: {
          'Waktu Scan Sebelumnya': existing.timeIn || '07:15',
          'Status': existing.status.toUpperCase(),
          'Mata Pelajaran': subject?.name || '-',
        },
        statusType: 'warning',
        message: `Kehadiran kelas ${classroom.name} untuk Jam Ke-${targetPeriodNumber} sudah tercatat pada pukul ${existing.timeIn}. Mencegah pencatatan ganda.`,
      };
    }

    // Calculate delay
    const delayMinutes = calculateDelayMinutes(nowTime, periodObj.startTime);
    const isLate = delayMinutes > 0;
    const status: TeacherAttendance['status'] = isLate ? 'terlambat' : 'tepat_waktu';

    const newAttendance: TeacherAttendance = {
      id: `tatt-${Date.now()}`,
      date: todayDate,
      scheduleId: schedule?.id || 'manual-sch',
      classroomId: classroom.id,
      teacherId: teacher.id,
      subjectId: subject?.id || 'sbj-1',
      period: targetPeriodNumber,
      scannedAt: `${todayDate}T${nowTime}`,
      timeIn: nowTime,
      status,
      delayMinutes,
      notes: isLate ? `Terlambat ${delayMinutes} menit dari jadwal (${periodObj.startTime})` : 'Tepat Waktu',
      scanMethod: 'qr_ruang',
    };

    setTeacherAttendances((prev) => {
      // Replace existing 'belum_masuk' placeholder if any
      const filtered = prev.filter(
        (a) => !(a.date === todayDate && a.classroomId === classroom.id && a.period === targetPeriodNumber)
      );
      return [newAttendance, ...filtered];
    });

    const newLog: ScanLog = {
      id: `log-${Date.now()}`,
      timestamp: nowTime,
      type: 'guru_masuk_kelas',
      barcode: qrCode,
      title: teacher.name,
      subtitle: `${classroom.name} • ${subject?.name || 'Mata Pelajaran'} (${periodObj.name})`,
      status: isLate ? 'warning' : 'success',
      message: isLate 
        ? `Guru masuk kelas terlambat ${delayMinutes} menit!` 
        : 'Guru berhasil masuk kelas tepat waktu.',
      photo: teacher.photo,
    };

    setScanLogs((prev) => [newLog, ...prev.slice(0, 49)]);

    if (isLate) {
      soundEffects.playWarning();
    } else {
      soundEffects.playSuccess();
    }

    return {
      success: true,
      type: 'guru_masuk_kelas',
      title: isLate ? 'Masuk Kelas (Terlambat)' : 'Masuk Kelas Tepat Waktu',
      subtitle: `${teacher.name} di ${classroom.name}`,
      photo: teacher.photo,
      details: {
        'Nama Guru': teacher.name,
        'NIP': teacher.nip,
        'Mata Pelajaran': subject?.name || '-',
        'Ruang Kelas': classroom.name,
        'Jam Pelajaran': periodObj.name,
        'Waktu Scan': nowTime,
        'Keterlambatan': isLate ? `${delayMinutes} Menit` : '0 Menit (Tepat Waktu)',
      },
      statusType: isLate ? 'warning' : 'success',
      message: isLate 
        ? `Tercatat terlambat ${delayMinutes} menit pada ${periodObj.name}. Data monitoring diperbarui secara real-time.`
        : `Presensi guru berhasil dicatat tepat waktu pada ${periodObj.name}.`,
    };
  }, [activePeriod, classrooms, currentDateString, currentDayName, currentTimeString, currentUser, schedules, subjects, teacherAttendances, teachers]);

  // Scan Student Barcode (Kartu Siswa)
  const scanStudentBarcode = useCallback((barcodeOrNisn: string): ScanResult => {
    const cleanCode = barcodeOrNisn.trim().toUpperCase();
    const student = students.find(
      (s) => s.barcode.toUpperCase() === cleanCode || s.nisn === cleanCode || s.nis === cleanCode
    );

    if (!student) {
      soundEffects.playError();
      return {
        success: false,
        type: 'siswa_absen',
        title: 'Kartu Siswa Tidak Dikenal',
        subtitle: `Barcode: "${barcodeOrNisn}"`,
        statusType: 'error',
        message: 'Nomor barcode/NISN tidak ditemukan dalam basis data siswa MTsN 1 Lombok Barat.',
      };
    }

    const todayDate = currentDateString;
    const nowTime = currentTimeString;
    const targetPeriodNumber = activePeriod && activePeriod.period > 0 ? activePeriod.period : 1;

    // Check duplicate: has this student already scanned today for this period?
    const alreadyScanned = studentAttendances.find(
      (a) => a.date === todayDate && a.studentId === student.id && a.period === targetPeriodNumber
    );

    if (alreadyScanned) {
      soundEffects.playWarning();
      return {
        success: false,
        type: 'siswa_absen',
        title: 'Presensi Sudah Dicatat',
        subtitle: `${student.name} (${student.className})`,
        photo: student.photo,
        details: {
          'NISN': student.nisn,
          'Kelas': student.className,
          'Waktu Masuk': alreadyScanned.timeIn,
          'Status': alreadyScanned.status.toUpperCase(),
        },
        statusType: 'warning',
        message: `Siswa "${student.name}" sudah tercatat presensi sebelumnya pada pukul ${alreadyScanned.timeIn}. Mencegah duplikasi data.`,
      };
    }

    const newAttendance: StudentAttendance = {
      id: `satt-${Date.now()}-${student.id}`,
      date: todayDate,
      studentId: student.id,
      classroomId: student.classId,
      period: targetPeriodNumber,
      scannedAt: `${todayDate}T${nowTime}`,
      timeIn: nowTime,
      status: 'hadir',
      notes: 'Presensi via Scan Barcode Kartu',
      scanMethod: 'barcode_kartu',
    };

    setStudentAttendances((prev) => [newAttendance, ...prev]);

    const newLog: ScanLog = {
      id: `log-${Date.now()}`,
      timestamp: nowTime,
      type: 'siswa_absen',
      barcode: barcodeOrNisn,
      title: student.name,
      subtitle: `${student.className} • NISN ${student.nisn}`,
      status: 'success',
      message: 'Presensi Berhasil (HADIR)',
      photo: student.photo,
    };

    setScanLogs((prev) => [newLog, ...prev.slice(0, 49)]);
    soundEffects.playSuccess();

    return {
      success: true,
      type: 'siswa_absen',
      title: 'Presensi Siswa Berhasil',
      subtitle: `${student.name} • ${student.className}`,
      photo: student.photo,
      details: {
        'Nama Lengkap': student.name,
        'NISN / NIS': `${student.nisn} / ${student.nis}`,
        'Kelas': student.className,
        'Jam Pelajaran': `Jam Ke-${targetPeriodNumber}`,
        'Waktu Presensi': nowTime,
        'Status': 'HADIR',
      },
      statusType: 'success',
      message: `Presensi siswa berhasil dicatat! Status: HADIR di ${student.className}.`,
    };
  }, [activePeriod, currentDateString, currentTimeString, studentAttendances, students]);

  // Manual update helpers
  const manualUpdateStudentStatus = (attendanceId: string, status: StudentAttendance['status'], notes?: string) => {
    setStudentAttendances((prev) =>
      prev.map((a) => (a.id === attendanceId ? { ...a, status, notes: notes ?? a.notes } : a))
    );
  };

  const manualAddStudentAttendance = (studentId: string, status: StudentAttendance['status'], notes?: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const todayDate = currentDateString;
    const nowTime = currentTimeString;
    const targetPeriodNumber = activePeriod && activePeriod.period > 0 ? activePeriod.period : 1;

    // Remove existing if any
    setStudentAttendances((prev) => {
      const filtered = prev.filter(
        (a) => !(a.date === todayDate && a.studentId === student.id && a.period === targetPeriodNumber)
      );
      return [
        {
          id: `satt-manual-${Date.now()}-${student.id}`,
          date: todayDate,
          studentId: student.id,
          classroomId: student.classId,
          period: targetPeriodNumber,
          scannedAt: `${todayDate}T${nowTime}`,
          timeIn: nowTime,
          status,
          notes: notes || `Input Manual oleh ${currentUser.name}`,
          scanMethod: 'manual_guru',
        },
        ...filtered,
      ];
    });
  };

  const manualUpdateTeacherStatus = (attendanceId: string, status: TeacherAttendance['status'], notes?: string) => {
    setTeacherAttendances((prev) =>
      prev.map((a) => (a.id === attendanceId ? { ...a, status, notes: notes ?? a.notes } : a))
    );
  };

  // Master Data CRUD
  const addTeacher = (teacherData: Omit<Teacher, 'id'>) => {
    const newTeacher: Teacher = {
      ...teacherData,
      id: `tch-${Date.now()}`,
    };
    setTeachers((prev) => [newTeacher, ...prev]);
  };

  const updateTeacher = (updated: Teacher) => {
    setTeachers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const deleteTeacher = (id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  };

  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...studentData,
      id: `std-${Date.now()}`,
    };
    setStudents((prev) => [newStudent, ...prev]);
  };

  const updateStudent = (updated: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const importStudentsBulk = (newStudentsData: Omit<Student, 'id'>[]) => {
    const created: Student[] = newStudentsData.map((d, index) => ({
      ...d,
      id: `std-bulk-${Date.now()}-${index}`,
    }));
    setStudents((prev) => [...created, ...prev]);
  };

  const addClassroom = (classroomData: Omit<Classroom, 'id'>) => {
    const newClassroom: Classroom = {
      ...classroomData,
      id: `cls-${Date.now()}`,
    };
    setClassrooms((prev) => [...prev, newClassroom]);
  };

  const updateClassroom = (updated: Classroom) => {
    setClassrooms((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const deleteClassroom = (id: string) => {
    setClassrooms((prev) => prev.filter((c) => c.id !== id));
  };

  const addSubject = (subjectData: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subjectData,
      id: `sbj-${Date.now()}`,
    };
    setSubjects((prev) => [...prev, newSubject]);
  };

  const updateSubject = (updated: Subject) => {
    setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const addSchedule = (scheduleData: Omit<Schedule, 'id'>) => {
    const newSchedule: Schedule = {
      ...scheduleData,
      id: `sch-${Date.now()}`,
    };
    setSchedules((prev) => [...prev, newSchedule]);
  };

  const updateSchedule = (updated: Schedule) => {
    setSchedules((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const deleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  // System actions
  const resetToDemoData = () => {
    const initial = generateInitialAttendance();
    setTeachers(INITIAL_TEACHERS);
    setStudents(INITIAL_STUDENTS);
    setClassrooms(INITIAL_CLASSROOMS);
    setSubjects(INITIAL_SUBJECTS);
    setSchedules(INITIAL_SCHEDULES);
    setTeacherAttendances(initial.teacherAttendance);
    setStudentAttendances(initial.studentAttendance);
    setScanLogs(initial.scanLogs);
    setSimulatedTime(null);
    localStorage.clear();
    soundEffects.playSuccess();
  };

  const backupDatabase = () => {
    const dump = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      institution: 'MTs Negeri 1 Lombok Barat',
      teachers,
      students,
      classrooms,
      subjects,
      schedules,
      teacherAttendances,
      studentAttendances,
      scanLogs,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dump, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `BACKUP_DATABASE_MTSN1LOBAR_${getTodayDateString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const restoreDatabase = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.teachers && parsed.students && parsed.classrooms) {
        setTeachers(parsed.teachers);
        setStudents(parsed.students);
        setClassrooms(parsed.classrooms);
        if (parsed.subjects) setSubjects(parsed.subjects);
        if (parsed.schedules) setSchedules(parsed.schedules);
        if (parsed.teacherAttendances) setTeacherAttendances(parsed.teacherAttendances);
        if (parsed.studentAttendances) setStudentAttendances(parsed.studentAttendances);
        if (parsed.scanLogs) setScanLogs(parsed.scanLogs);
        soundEffects.playSuccess();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to parse restore JSON', err);
      return false;
    }
  };

  const clearScanLogs = () => {
    setScanLogs([]);
  };

  const value = {
    currentUser,
    setCurrentUser,
    users,
    teachers,
    students,
    classrooms,
    subjects,
    schedules,
    academicYears,
    semesters,
    teacherAttendances,
    studentAttendances,
    scanLogs,
    simulatedTime,
    setSimulatedTime,
    activePeriod,
    currentDayName,
    currentTimeString,
    currentDateString,
    scanClassroomQR,
    scanStudentBarcode,
    manualUpdateStudentStatus,
    manualAddStudentAttendance,
    manualUpdateTeacherStatus,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    addStudent,
    updateStudent,
    deleteStudent,
    importStudentsBulk,
    addClassroom,
    updateClassroom,
    deleteClassroom,
    addSubject,
    updateSubject,
    deleteSubject,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    resetToDemoData,
    backupDatabase,
    restoreDatabase,
    clearScanLogs,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
