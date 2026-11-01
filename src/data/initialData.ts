import { 
  Teacher, 
  Student, 
  Classroom, 
  Subject, 
  Schedule, 
  AcademicYear, 
  Semester, 
  User, 
  TeacherAttendance, 
  StudentAttendance, 
  ScanLog 
} from '../types';
import { getTodayDateString } from '../utils/date';

export const SCHOOL_INFO = {
  name: 'MTs NEGERI 1 LOMBOK BARAT',
  subTitle: 'Kementerian Agama Kabupaten Lombok Barat',
  nsm: '121152010001',
  npsn: '50205278',
  address: 'Jl. Ahmad Yani No. 1, Gerung, Kabupaten Lombok Barat, Nusa Tenggara Barat 83363',
  phone: '(0370) 6181234',
  email: 'mtsn1lombokbarat@kemenag.go.id',
  website: 'https://mtsn1lombokbarat.sch.id',
  principal: {
    name: 'Drs. H. Marzuki, M.Pd.',
    nip: '196807151994031004',
    title: 'Kepala Madrasah',
  },
  piketHead: {
    name: 'Ahmad Baihaki, S.Pd.I.',
    nip: '198203142009121003',
    title: 'Koordinator Guru Piket',
  },
  operator: {
    name: 'M. Lalu Zainudin, S.Kom.',
    nip: '199008212015031002',
    title: 'Operator SIMATIK & EMIS',
  }
};

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    username: 'admin',
    name: 'M. Lalu Zainudin, S.Kom.',
    role: 'admin',
    roleLabel: 'Administrator Sistem',
    email: 'admin@mtsn1lobar.sch.id',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-2',
    username: 'kamad',
    name: 'Drs. H. Marzuki, M.Pd.',
    role: 'kepala_madrasah',
    roleLabel: 'Kepala Madrasah',
    email: 'kamad@mtsn1lobar.sch.id',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-3',
    username: 'piket',
    name: 'Ahmad Baihaki, S.Pd.I.',
    role: 'guru_piket',
    roleLabel: 'Guru Piket Harian',
    email: 'piket@mtsn1lobar.sch.id',
    teacherId: 'tch-1',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-4',
    username: 'operator',
    name: 'Siti Nurhaliza, A.Md.',
    role: 'operator',
    roleLabel: 'Operator Madrasah',
    email: 'operator@mtsn1lobar.sch.id',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-5',
    username: 'guru_siti',
    name: 'Dra. Hj. Siti Rohani, M.Pd.',
    role: 'guru_mapel',
    roleLabel: 'Guru Mata Pelajaran',
    email: 'siti.rohani@mtsn1lobar.sch.id',
    teacherId: 'tch-2',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-6',
    username: 'walikelas_7a',
    name: 'Lalu Samsul Hadi, S.Si.',
    role: 'wali_kelas',
    roleLabel: 'Wali Kelas VII A',
    email: 'samsul.hadi@mtsn1lobar.sch.id',
    teacherId: 'tch-3',
    classId: 'cls-1',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  },
];

export const INITIAL_ACADEMIC_YEARS: AcademicYear[] = [
  { id: 'ay-2024-2025', name: '2024/2025', isActive: false },
  { id: 'ay-2025-2026', name: '2025/2026', isActive: true },
];

export const INITIAL_SEMESTERS: Semester[] = [
  { id: 'sem-1', academicYearId: 'ay-2025-2026', name: 'Ganjil', isActive: true },
  { id: 'sem-2', academicYearId: 'ay-2025-2026', name: 'Genap', isActive: false },
];

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sbj-1', code: 'QH-01', name: "Al-Qur'an Hadits", category: 'Pendidikan Agama Islam' },
  { id: 'sbj-2', code: 'AA-02', name: 'Akidah Akhlak', category: 'Pendidikan Agama Islam' },
  { id: 'sbj-3', code: 'FIK-03', name: 'Fikih', category: 'Pendidikan Agama Islam' },
  { id: 'sbj-4', code: 'SKI-04', name: 'Sejarah Kebudayaan Islam (SKI)', category: 'Pendidikan Agama Islam' },
  { id: 'sbj-5', code: 'ARB-05', name: 'Bahasa Arab', category: 'Pendidikan Agama Islam' },
  { id: 'sbj-6', code: 'MTK-06', name: 'Matematika', category: 'Umum' },
  { id: 'sbj-7', code: 'IPA-07', name: 'Ilmu Pengetahuan Alam (IPA)', category: 'Umum' },
  { id: 'sbj-8', code: 'IPS-08', name: 'Ilmu Pengetahuan Sosial (IPS)', category: 'Umum' },
  { id: 'sbj-9', code: 'BIN-09', name: 'Bahasa Indonesia', category: 'Umum' },
  { id: 'sbj-10', code: 'BIG-10', name: 'Bahasa Inggris', category: 'Umum' },
  { id: 'sbj-11', code: 'PKN-11', name: 'Pendidikan Pancasila & Kewarganegaraan', category: 'Umum' },
  { id: 'sbj-12', code: 'PJK-12', name: 'PJOK (Pendidikan Jasmani)', category: 'Umum' },
  { id: 'sbj-13', code: 'INF-13', name: 'Informatika & Komputer', category: 'Umum' },
  { id: 'sbj-14', code: 'SBK-14', name: 'Seni Budaya & Prakarya', category: 'Umum' },
  { id: 'sbj-15', code: 'ML-SAS', name: 'Muatan Lokal Budaya Sasak', category: 'Muatan Lokal' },
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'tch-1',
    nip: '198203142009121003',
    name: 'Ahmad Baihaki, S.Pd.I.',
    gender: 'L',
    phone: '081912345671',
    email: 'ahmad.baihaki@mtsn1lobar.sch.id',
    subjectNames: ["Al-Qur'an Hadits", 'Bahasa Arab'],
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    barcode: 'TCH-19820314-001',
    status: 'aktif',
  },
  {
    id: 'tch-2',
    nip: '197508191999032002',
    name: 'Dra. Hj. Siti Rohani, M.Pd.',
    gender: 'P',
    phone: '081912345672',
    email: 'siti.rohani@mtsn1lobar.sch.id',
    subjectNames: ['Bahasa Indonesia'],
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    barcode: 'TCH-19750819-002',
    status: 'aktif',
  },
  {
    id: 'tch-3',
    nip: '198604122011011005',
    name: 'Lalu Samsul Hadi, S.Si.',
    gender: 'L',
    phone: '081912345673',
    email: 'samsul.hadi@mtsn1lobar.sch.id',
    subjectNames: ['Ilmu Pengetahuan Alam (IPA)'],
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    barcode: 'TCH-19860412-003',
    status: 'aktif',
  },
  {
    id: 'tch-4',
    nip: '197911052006041011',
    name: 'Drs. H. M. Fauzi, M.Pd.I.',
    gender: 'L',
    phone: '081912345674',
    email: 'm.fauzi@mtsn1lobar.sch.id',
    subjectNames: ['Fikih', 'Akidah Akhlak'],
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    barcode: 'TCH-19791105-004',
    status: 'aktif',
  },
  {
    id: 'tch-5',
    nip: '198902152014022004',
    name: 'Nurul Hidayati, S.Pd.',
    gender: 'P',
    phone: '081912345675',
    email: 'nurul.hidayati@mtsn1lobar.sch.id',
    subjectNames: ['Matematika'],
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    barcode: 'TCH-19890215-005',
    status: 'aktif',
  },
  {
    id: 'tch-6',
    nip: '198409202008012007',
    name: 'Baiq Mariani, S.Pd., M.Ed.',
    gender: 'P',
    phone: '081912345676',
    email: 'mariani@mtsn1lobar.sch.id',
    subjectNames: ['Bahasa Inggris'],
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    barcode: 'TCH-19840920-006',
    status: 'aktif',
  },
  {
    id: 'tch-7',
    nip: '199105182019031008',
    name: 'Zulkifli, S.Pd.',
    gender: 'L',
    phone: '081912345677',
    email: 'zulkifli@mtsn1lobar.sch.id',
    subjectNames: ['PJOK (Pendidikan Jasmani)'],
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    barcode: 'TCH-19910518-007',
    status: 'aktif',
  },
  {
    id: 'tch-8',
    nip: '198810252015021003',
    name: 'Lalu Muhammad Ridwan, S.Kom.',
    gender: 'L',
    phone: '081912345678',
    email: 'ridwan@mtsn1lobar.sch.id',
    subjectNames: ['Informatika & Komputer'],
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    barcode: 'TCH-19881025-008',
    status: 'aktif',
  },
  {
    id: 'tch-9',
    nip: '197603102003122001',
    name: 'Hj. Rohmatun, S.Ag.',
    gender: 'P',
    phone: '081912345679',
    email: 'rohmatun@mtsn1lobar.sch.id',
    subjectNames: ['Sejarah Kebudayaan Islam (SKI)'],
    photo: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    barcode: 'TCH-19760310-009',
    status: 'aktif',
  },
  {
    id: 'tch-10',
    nip: '198506142010011012',
    name: 'Mahsun, S.Pd.',
    gender: 'L',
    phone: '081912345680',
    email: 'mahsun@mtsn1lobar.sch.id',
    subjectNames: ['Ilmu Pengetahuan Sosial (IPS)'],
    photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    barcode: 'TCH-19850614-010',
    status: 'aktif',
  },
];

export const INITIAL_CLASSROOMS: Classroom[] = [
  {
    id: 'cls-1',
    name: 'Kelas VII A',
    grade: '7',
    homeroomTeacherId: 'tch-3',
    homeroomTeacherName: 'Lalu Samsul Hadi, S.Si.',
    capacity: 32,
    qrCode: 'KLS-VIIA-MTSN1LOBAR',
    buildingLocation: 'Gedung A, Lantai 1 (Ruang 101)',
  },
  {
    id: 'cls-2',
    name: 'Kelas VII B',
    grade: '7',
    homeroomTeacherId: 'tch-5',
    homeroomTeacherName: 'Nurul Hidayati, S.Pd.',
    capacity: 30,
    qrCode: 'KLS-VIIB-MTSN1LOBAR',
    buildingLocation: 'Gedung A, Lantai 1 (Ruang 102)',
  },
  {
    id: 'cls-3',
    name: 'Kelas VIII A',
    grade: '8',
    homeroomTeacherId: 'tch-2',
    homeroomTeacherName: 'Dra. Hj. Siti Rohani, M.Pd.',
    capacity: 32,
    qrCode: 'KLS-VIIIA-MTSN1LOBAR',
    buildingLocation: 'Gedung B, Lantai 1 (Ruang 201)',
  },
  {
    id: 'cls-4',
    name: 'Kelas VIII B',
    grade: '8',
    homeroomTeacherId: 'tch-6',
    homeroomTeacherName: 'Baiq Mariani, S.Pd., M.Ed.',
    capacity: 31,
    qrCode: 'KLS-VIIIB-MTSN1LOBAR',
    buildingLocation: 'Gedung B, Lantai 1 (Ruang 202)',
  },
  {
    id: 'cls-5',
    name: 'Kelas IX A',
    grade: '9',
    homeroomTeacherId: 'tch-4',
    homeroomTeacherName: 'Drs. H. M. Fauzi, M.Pd.I.',
    capacity: 32,
    qrCode: 'KLS-IXA-MTSN1LOBAR',
    buildingLocation: 'Gedung C, Lantai 2 (Ruang 301)',
  },
  {
    id: 'cls-6',
    name: 'Kelas IX B',
    grade: '9',
    homeroomTeacherId: 'tch-10',
    homeroomTeacherName: 'Mahsun, S.Pd.',
    capacity: 30,
    qrCode: 'KLS-IXB-MTSN1LOBAR',
    buildingLocation: 'Gedung C, Lantai 2 (Ruang 302)',
  },
];

// Generate representative student pool for each classroom
const firstNamesM = [
  'Muhammad', 'Lalu', 'Ahmad', 'Dimas', 'Fathir', 'Rizky', 'Bayu', 'Iqbal', 
  'Aditya', 'Faiz', 'Zaki', 'Haekal', 'Danu', 'Fikri', 'Syahrul', 'Farhan'
];
const firstNamesF = [
  'Baiq', 'Siti', 'Nur', 'Zahra', 'Aisyah', 'Putri', 'Nabila', 'Rina', 
  'Salma', 'Devi', 'Anisa', 'Karina', 'Fatima', 'Dinda', 'Maya', 'Fitri'
];
const lastNames = [
  'Wardan', 'Hidayat', 'Saputra', 'Ramadhan', 'Fauzi', 'Hakim', 'Pratama', 
  'Kusuma', 'Kamil', 'Prabowo', 'Utami', 'Azizah', 'Santoso', 'Rasyid', 'Lestari'
];

export function generateInitialStudents(): Student[] {
  const students: Student[] = [];
  const classes = INITIAL_CLASSROOMS;

  let globalIndex = 1;

  classes.forEach((cls) => {
    const count = cls.capacity;
    for (let i = 1; i <= count; i++) {
      const isMale = i % 2 !== 0;
      const firstNameList = isMale ? firstNamesM : firstNamesF;
      const firstName = firstNameList[(i + globalIndex) % firstNameList.length];
      const lastName = lastNames[(i * 3 + globalIndex) % lastNames.length];
      const fullName = `${firstName} ${lastName}`;
      const nisn = `008${String(1000000 + globalIndex).padStart(7, '0')}`;
      const nis = `24${String(1000 + globalIndex)}`;
      const cleanClassCode = cls.name.replace(/\s+/g, '').toUpperCase();
      const barcode = `SIS-${cleanClassCode}-${String(i).padStart(3, '0')}`;

      // Pick avatar
      const avatarGender = isMale ? 'men' : 'women';
      const avatarNum = ((i + globalIndex) % 70) + 1;
      const photo = `https://randomuser.me/api/portraits/${avatarGender}/${avatarNum}.jpg`;

      students.push({
        id: `std-${globalIndex}`,
        nisn,
        nis,
        name: fullName,
        gender: isMale ? 'L' : 'P',
        classId: cls.id,
        className: cls.name,
        phone: `0878${String(10000000 + globalIndex)}`,
        photo,
        barcode,
        status: 'aktif',
      });
      globalIndex++;
    }
  });

  return students;
}

export const INITIAL_STUDENTS: Student[] = generateInitialStudents();

// Generate Schedules across Monday - Saturday
export const INITIAL_SCHEDULES: Schedule[] = [
  // SENIN
  // Jam 1: VII A (Matematika - Nurul), VII B (IPA - Lalu Samsul), VIII A (B. Indo - Siti Rohani), VIII B (B. Ing - Mariani), IX A (Fikih - Fauzi), IX B (IPS - Mahsun)
  { id: 'sch-1', day: 'Senin', period: 1, classroomId: 'cls-1', teacherId: 'tch-5', subjectId: 'sbj-6', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },
  { id: 'sch-2', day: 'Senin', period: 1, classroomId: 'cls-2', teacherId: 'tch-3', subjectId: 'sbj-7', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },
  { id: 'sch-3', day: 'Senin', period: 1, classroomId: 'cls-3', teacherId: 'tch-2', subjectId: 'sbj-9', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },
  { id: 'sch-4', day: 'Senin', period: 1, classroomId: 'cls-4', teacherId: 'tch-6', subjectId: 'sbj-10', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },
  { id: 'sch-5', day: 'Senin', period: 1, classroomId: 'cls-5', teacherId: 'tch-4', subjectId: 'sbj-3', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },
  { id: 'sch-6', day: 'Senin', period: 1, classroomId: 'cls-6', teacherId: 'tch-10', subjectId: 'sbj-8', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },

  // Jam 2
  { id: 'sch-7', day: 'Senin', period: 2, classroomId: 'cls-1', teacherId: 'tch-5', subjectId: 'sbj-6', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },
  { id: 'sch-8', day: 'Senin', period: 2, classroomId: 'cls-2', teacherId: 'tch-3', subjectId: 'sbj-7', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },
  { id: 'sch-9', day: 'Senin', period: 2, classroomId: 'cls-3', teacherId: 'tch-2', subjectId: 'sbj-9', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },
  { id: 'sch-10', day: 'Senin', period: 2, classroomId: 'cls-4', teacherId: 'tch-6', subjectId: 'sbj-10', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },
  { id: 'sch-11', day: 'Senin', period: 2, classroomId: 'cls-5', teacherId: 'tch-4', subjectId: 'sbj-3', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },
  { id: 'sch-12', day: 'Senin', period: 2, classroomId: 'cls-6', teacherId: 'tch-10', subjectId: 'sbj-8', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },

  // Jam 3
  { id: 'sch-13', day: 'Senin', period: 3, classroomId: 'cls-1', teacherId: 'tch-1', subjectId: 'sbj-1', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },
  { id: 'sch-14', day: 'Senin', period: 3, classroomId: 'cls-2', teacherId: 'tch-7', subjectId: 'sbj-12', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },
  { id: 'sch-15', day: 'Senin', period: 3, classroomId: 'cls-3', teacherId: 'tch-8', subjectId: 'sbj-13', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },
  { id: 'sch-16', day: 'Senin', period: 3, classroomId: 'cls-4', teacherId: 'tch-9', subjectId: 'sbj-4', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },
  { id: 'sch-17', day: 'Senin', period: 3, classroomId: 'cls-5', teacherId: 'tch-5', subjectId: 'sbj-6', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },
  { id: 'sch-18', day: 'Senin', period: 3, classroomId: 'cls-6', teacherId: 'tch-6', subjectId: 'sbj-10', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },

  // Jam 4
  { id: 'sch-19', day: 'Senin', period: 4, classroomId: 'cls-1', teacherId: 'tch-1', subjectId: 'sbj-1', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },
  { id: 'sch-20', day: 'Senin', period: 4, classroomId: 'cls-2', teacherId: 'tch-7', subjectId: 'sbj-12', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },
  { id: 'sch-21', day: 'Senin', period: 4, classroomId: 'cls-3', teacherId: 'tch-8', subjectId: 'sbj-13', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },
  { id: 'sch-22', day: 'Senin', period: 4, classroomId: 'cls-4', teacherId: 'tch-9', subjectId: 'sbj-4', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },
  { id: 'sch-23', day: 'Senin', period: 4, classroomId: 'cls-5', teacherId: 'tch-5', subjectId: 'sbj-6', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },
  { id: 'sch-24', day: 'Senin', period: 4, classroomId: 'cls-6', teacherId: 'tch-6', subjectId: 'sbj-10', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },

  // Jam 5
  { id: 'sch-25', day: 'Senin', period: 5, classroomId: 'cls-1', teacherId: 'tch-2', subjectId: 'sbj-9', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },
  { id: 'sch-26', day: 'Senin', period: 5, classroomId: 'cls-2', teacherId: 'tch-1', subjectId: 'sbj-5', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },
  { id: 'sch-27', day: 'Senin', period: 5, classroomId: 'cls-3', teacherId: 'tch-3', subjectId: 'sbj-7', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },
  { id: 'sch-28', day: 'Senin', period: 5, classroomId: 'cls-4', teacherId: 'tch-4', subjectId: 'sbj-2', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },
  { id: 'sch-29', day: 'Senin', period: 5, classroomId: 'cls-5', teacherId: 'tch-10', subjectId: 'sbj-8', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },
  { id: 'sch-30', day: 'Senin', period: 5, classroomId: 'cls-6', teacherId: 'tch-8', subjectId: 'sbj-13', academicYearId: 'ay-2025-2026', semesterId: 'sem-1' },
];

export function generateInitialAttendance(): {
  teacherAttendance: TeacherAttendance[];
  studentAttendance: StudentAttendance[];
  scanLogs: ScanLog[];
} {
  const today = getTodayDateString();
  const teacherAttendance: TeacherAttendance[] = [];
  const studentAttendance: StudentAttendance[] = [];
  const scanLogs: ScanLog[] = [];

  // Realistic seed data for today
  // Jam 1:
  // - cls-1 (Nurul Hidayati) -> Hadir tepat waktu 07:14
  teacherAttendance.push({
    id: 'tatt-1',
    date: today,
    scheduleId: 'sch-1',
    classroomId: 'cls-1',
    teacherId: 'tch-5',
    subjectId: 'sbj-6',
    period: 1,
    scannedAt: `${today}T07:14:22`,
    timeIn: '07:14:22',
    status: 'tepat_waktu',
    delayMinutes: 0,
    notes: 'Tepat waktu',
    scanMethod: 'qr_ruang',
  });

  // - cls-2 (Lalu Samsul Hadi) -> Hadir tepat waktu 07:12
  teacherAttendance.push({
    id: 'tatt-2',
    date: today,
    scheduleId: 'sch-2',
    classroomId: 'cls-2',
    teacherId: 'tch-3',
    subjectId: 'sbj-7',
    period: 1,
    scannedAt: `${today}T07:12:05`,
    timeIn: '07:12:05',
    status: 'tepat_waktu',
    delayMinutes: 0,
    notes: 'Tepat waktu',
    scanMethod: 'qr_ruang',
  });

  // - cls-3 (Dra. Hj. Siti Rohani) -> Terlambat 12 menit 07:27
  teacherAttendance.push({
    id: 'tatt-3',
    date: today,
    scheduleId: 'sch-3',
    classroomId: 'cls-3',
    teacherId: 'tch-2',
    subjectId: 'sbj-9',
    period: 1,
    scannedAt: `${today}T07:27:40`,
    timeIn: '07:27:40',
    status: 'terlambat',
    delayMinutes: 12,
    notes: 'Terlambat karena kendala lalu lintas jembatan Meninting',
    scanMethod: 'qr_ruang',
  });

  // - cls-4 (Baiq Mariani) -> Tepat waktu 07:16
  teacherAttendance.push({
    id: 'tatt-4',
    date: today,
    scheduleId: 'sch-4',
    classroomId: 'cls-4',
    teacherId: 'tch-6',
    subjectId: 'sbj-10',
    period: 1,
    scannedAt: `${today}T07:16:11`,
    timeIn: '07:16:11',
    status: 'tepat_waktu',
    delayMinutes: 0,
    notes: 'Tepat waktu',
    scanMethod: 'qr_ruang',
  });

  // - cls-5 (Drs. H. M. Fauzi) -> Terlambat 8 menit 07:23
  teacherAttendance.push({
    id: 'tatt-5',
    date: today,
    scheduleId: 'sch-5',
    classroomId: 'cls-5',
    teacherId: 'tch-4',
    subjectId: 'sbj-3',
    period: 1,
    scannedAt: `${today}T07:23:18`,
    timeIn: '07:23:18',
    status: 'terlambat',
    delayMinutes: 8,
    notes: 'Rapat koordinasi singkat dengan Kamad',
    scanMethod: 'qr_ruang',
  });

  // - cls-6 (Mahsun, S.Pd.) -> Belum masuk kelas
  teacherAttendance.push({
    id: 'tatt-6',
    date: today,
    scheduleId: 'sch-6',
    classroomId: 'cls-6',
    teacherId: 'tch-10',
    subjectId: 'sbj-8',
    period: 1,
    status: 'belum_masuk',
    delayMinutes: 0,
    notes: 'Belum scan QR ruang kelas',
    scanMethod: 'qr_ruang',
  });

  // Generate student attendances for VII A (32 students: 30 Hadir, 1 Sakit, 1 Izin -> 93.75%)
  const viiAStudents = INITIAL_STUDENTS.filter((s) => s.classId === 'cls-1');
  viiAStudents.forEach((std, idx) => {
    let status: 'hadir' | 'sakit' | 'izin' | 'alpa' = 'hadir';
    let notes = 'Hadir lengkap';
    if (idx === 30) {
      status = 'sakit';
      notes = 'Surat dokter terlampir';
    } else if (idx === 31) {
      status = 'izin';
      notes = 'Acara keluarga';
    }

    studentAttendance.push({
      id: `satt-viia-${idx + 1}`,
      date: today,
      studentId: std.id,
      classroomId: 'cls-1',
      scheduleId: 'sch-1',
      period: 1,
      scannedAt: `${today}T07:05:${String((idx * 7) % 55).padStart(2, '0')}`,
      timeIn: `07:05:${String((idx * 7) % 55).padStart(2, '0')}`,
      status,
      notes,
      scanMethod: status === 'hadir' ? 'barcode_kartu' : 'manual_guru',
    });
  });

  // Generate student attendances for VII B (30 students: 29 Hadir, 1 Alpa -> 96.67%)
  const viiBStudents = INITIAL_STUDENTS.filter((s) => s.classId === 'cls-2');
  viiBStudents.forEach((std, idx) => {
    let status: 'hadir' | 'sakit' | 'izin' | 'alpa' = 'hadir';
    let notes = 'Hadir';
    if (idx === 29) {
      status = 'alpa';
      notes = 'Tanpa keterangan';
    }

    studentAttendance.push({
      id: `satt-viib-${idx + 1}`,
      date: today,
      studentId: std.id,
      classroomId: 'cls-2',
      scheduleId: 'sch-2',
      period: 1,
      scannedAt: `${today}T07:08:${String((idx * 5) % 55).padStart(2, '0')}`,
      timeIn: `07:08:${String((idx * 5) % 55).padStart(2, '0')}`,
      status,
      notes,
      scanMethod: status === 'hadir' ? 'barcode_kartu' : 'manual_guru',
    });
  });

  // Generate for VIII A, VIII B, IX A
  const otherClasses = ['cls-3', 'cls-4', 'cls-5'];
  otherClasses.forEach((cid) => {
    const list = INITIAL_STUDENTS.filter((s) => s.classId === cid);
    list.forEach((std, idx) => {
      let status: 'hadir' | 'sakit' | 'izin' | 'alpa' = 'hadir';
      if (idx === list.length - 1) status = 'izin';
      if (idx === list.length - 2) status = 'sakit';

      studentAttendance.push({
        id: `satt-${cid}-${idx + 1}`,
        date: today,
        studentId: std.id,
        classroomId: cid,
        scheduleId: 'sch-3',
        period: 1,
        scannedAt: `${today}T07:11:${String((idx * 3) % 55).padStart(2, '0')}`,
        timeIn: `07:11:${String((idx * 3) % 55).padStart(2, '0')}`,
        status,
        notes: status === 'hadir' ? 'Hadir tepat waktu' : 'Keterangan tercatat',
        scanMethod: 'barcode_kartu',
      });
    });
  });

  // Recent scan logs
  scanLogs.push(
    {
      id: 'log-1',
      timestamp: '07:27:40',
      type: 'guru_masuk_kelas',
      barcode: 'KLS-VIIIA-MTSN1LOBAR',
      title: 'Dra. Hj. Siti Rohani, M.Pd.',
      subtitle: 'Scan Ruang Kelas VIII A • B. Indonesia (Jam Ke-1)',
      status: 'warning',
      message: 'Masuk kelas terlambat 12 menit (Batas toleransi 5 mnt)',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'log-2',
      timestamp: '07:23:18',
      type: 'guru_masuk_kelas',
      barcode: 'KLS-IXA-MTSN1LOBAR',
      title: 'Drs. H. M. Fauzi, M.Pd.I.',
      subtitle: 'Scan Ruang Kelas IX A • Fikih (Jam Ke-1)',
      status: 'warning',
      message: 'Masuk kelas terlambat 8 menit',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'log-3',
      timestamp: '07:16:11',
      type: 'guru_masuk_kelas',
      barcode: 'KLS-VIIIB-MTSN1LOBAR',
      title: 'Baiq Mariani, S.Pd., M.Ed.',
      subtitle: 'Scan Ruang Kelas VIII B • B. Inggris (Jam Ke-1)',
      status: 'success',
      message: 'Berhasil scan masuk kelas • Tepat Waktu',
      photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'log-4',
      timestamp: '07:14:22',
      type: 'guru_masuk_kelas',
      barcode: 'KLS-VIIA-MTSN1LOBAR',
      title: 'Nurul Hidayati, S.Pd.',
      subtitle: 'Scan Ruang Kelas VII A • Matematika (Jam Ke-1)',
      status: 'success',
      message: 'Berhasil scan masuk kelas • Tepat Waktu',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'log-5',
      timestamp: '07:10:45',
      type: 'siswa_absen',
      barcode: 'SIS-VIIA-030',
      title: 'Karina Utami',
      subtitle: 'Kelas VII A • NISN 0081000030',
      status: 'success',
      message: 'Presensi Siswa Berhasil Terdata (Hadir)',
      photo: 'https://randomuser.me/api/portraits/women/30.jpg',
    }
  );

  return { teacherAttendance, studentAttendance, scanLogs };
}
