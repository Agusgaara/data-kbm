export type UserRole = 
  | 'admin' 
  | 'kepala_madrasah' 
  | 'operator' 
  | 'guru_piket' 
  | 'guru_mapel' 
  | 'wali_kelas';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  email: string;
  teacherId?: string;
  classId?: string;
  avatar?: string;
}

export interface Teacher {
  id: string;
  nip: string;
  name: string;
  gender: 'L' | 'P';
  phone: string;
  email: string;
  subjectNames: string[];
  photo: string;
  barcode: string; // e.g., GR-197805122005011002
  status: 'aktif' | 'cuti' | 'izin';
}

export interface Student {
  id: string;
  nisn: string;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  classId: string;
  className: string;
  phone?: string;
  photo: string;
  barcode: string; // e.g., SIS-0081234567
  status: 'aktif' | 'mutasi' | 'keluar';
}

export interface Classroom {
  id: string;
  name: string; // e.g. "VII A", "VIII B", "IX C"
  grade: '7' | '8' | '9';
  homeroomTeacherId: string;
  homeroomTeacherName: string;
  capacity: number;
  qrCode: string; // e.g., KLS-VIIA-MTSN1LOBAR
  buildingLocation: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  category: 'Pendidikan Agama Islam' | 'Umum' | 'Muatan Lokal';
}

export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';

export interface SchedulePeriod {
  period: number;
  name: string;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  isBreak?: boolean;
}

export interface Schedule {
  id: string;
  day: DayOfWeek;
  period: number;
  classroomId: string;
  teacherId: string;
  subjectId: string;
  academicYearId: string;
  semesterId: string;
}

export type TeacherAttendanceStatus = 
  | 'tepat_waktu' 
  | 'terlambat' 
  | 'belum_masuk' 
  | 'tidak_hadir' 
  | 'selesai';

export interface TeacherAttendance {
  id: string;
  date: string; // YYYY-MM-DD
  scheduleId: string;
  classroomId: string;
  teacherId: string;
  subjectId: string;
  period: number;
  scannedAt?: string;
  timeIn?: string; // HH:MM:SS
  status: TeacherAttendanceStatus;
  delayMinutes: number;
  notes?: string;
  scanMethod: 'qr_ruang' | 'manual_operator' | 'kartu_guru';
}

export type StudentAttendanceStatus = 
  | 'hadir' 
  | 'sakit' 
  | 'izin' 
  | 'alpa' 
  | 'terlambat';

export interface StudentAttendance {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  classroomId: string;
  scheduleId?: string;
  period: number;
  scannedAt: string;
  timeIn: string; // HH:MM:SS
  status: StudentAttendanceStatus;
  notes?: string;
  scanMethod: 'barcode_kartu' | 'manual_guru';
}

export interface AcademicYear {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Semester {
  id: string;
  academicYearId: string;
  name: 'Ganjil' | 'Genap';
  isActive: boolean;
}

export interface ScanLog {
  id: string;
  timestamp: string;
  type: 'guru_masuk_kelas' | 'siswa_absen';
  barcode: string;
  title: string;
  subtitle: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  photo?: string;
}
