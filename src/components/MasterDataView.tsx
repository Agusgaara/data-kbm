import React, { useState } from 'react';
import { 
  Database, 
  GraduationCap, 
  Users, 
  Building, 
  BookOpen, 
  CalendarDays, 
  ShieldCheck, 
  Plus, 
  Edit2, 
  Trash2, 
  Download, 
  Upload, 
  Printer, 
  Search, 
  QrCode,
  Check,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportToExcel } from '../utils/export';
import { PrintCardModal } from './PrintCardModal';
import { Teacher, Student, Classroom, Subject, Schedule } from '../types';

export const MasterDataView: React.FC = () => {
  const { 
    teachers, 
    students, 
    classrooms, 
    subjects, 
    schedules, 
    academicYears, 
    semesters, 
    users,
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
    deleteSchedule
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<
    'guru' | 'siswa' | 'kelas' | 'mapel' | 'jadwal' | 'tahun_ajaran' | 'pengguna'
  >('guru');

  const [searchQuery, setSearchQuery] = useState('');
  const [printModalConfig, setPrintModalConfig] = useState<{
    type: 'student_cards' | 'classroom_signs';
    students?: Student[];
    classrooms?: Classroom[];
  } | null>(null);

  // Form Modals
  const [showTeacherModal, setShowTeacherModal] = useState<Teacher | 'new' | null>(null);
  const [showStudentModal, setShowStudentModal] = useState<Student | 'new' | null>(null);
  const [showClassModal, setShowClassModal] = useState<Classroom | 'new' | null>(null);
  const [showSubjectModal, setShowSubjectModal] = useState<Subject | 'new' | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);

  // Teacher Form State
  const [teacherForm, setTeacherForm] = useState({
    nip: '',
    name: '',
    gender: 'L' as 'L' | 'P',
    phone: '',
    email: '',
    subjectNames: [] as string[],
    photo: '',
    barcode: '',
    status: 'aktif' as 'aktif' | 'cuti' | 'izin',
  });

  // Student Form State
  const [studentForm, setStudentForm] = useState({
    nisn: '',
    nis: '',
    name: '',
    gender: 'L' as 'L' | 'P',
    classId: classrooms[0]?.id || '',
    className: classrooms[0]?.name || '',
    phone: '',
    photo: '',
    barcode: '',
    status: 'aktif' as 'aktif' | 'mutasi' | 'keluar',
  });

  // Classroom Form State
  const [classForm, setClassForm] = useState({
    name: '',
    grade: '7' as '7' | '8' | '9',
    homeroomTeacherId: teachers[0]?.id || '',
    homeroomTeacherName: teachers[0]?.name || '',
    capacity: 32,
    qrCode: '',
    buildingLocation: '',
  });

  // Subject Form State
  const [subjectForm, setSubjectForm] = useState({
    code: '',
    name: '',
    category: 'Umum' as Subject['category'],
  });

  // Schedule Form State
  const [scheduleForm, setScheduleForm] = useState({
    day: 'Senin' as Schedule['day'],
    period: 1,
    classroomId: classrooms[0]?.id || '',
    teacherId: teachers[0]?.id || '',
    subjectId: subjects[0]?.id || '',
    academicYearId: academicYears[0]?.id || 'ay-2025-2026',
    semesterId: semesters[0]?.id || 'sem-1',
  });

  // Handle Excel Import for Students
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate bulk creation from imported CSV/data
    const importedSample: Omit<Student, 'id'>[] = [
      {
        nisn: `008${Math.floor(1000000 + Math.random() * 9000000)}`,
        nis: `24${Math.floor(1000 + Math.random() * 9000)}`,
        name: 'Ahmad Zulkarnain',
        gender: 'L',
        classId: classrooms[0]?.id || 'cls-1',
        className: classrooms[0]?.name || 'Kelas VII A',
        phone: '081912345688',
        photo: 'https://randomuser.me/api/portraits/men/45.jpg',
        barcode: `SIS-VIIA-${Math.floor(100 + Math.random() * 900)}`,
        status: 'aktif',
      },
      {
        nisn: `008${Math.floor(1000000 + Math.random() * 9000000)}`,
        nis: `24${Math.floor(1000 + Math.random() * 9000)}`,
        name: 'Siti Fauziah Ramadhani',
        gender: 'P',
        classId: classrooms[0]?.id || 'cls-1',
        className: classrooms[0]?.name || 'Kelas VII A',
        phone: '081912345689',
        photo: 'https://randomuser.me/api/portraits/women/46.jpg',
        barcode: `SIS-VIIA-${Math.floor(100 + Math.random() * 900)}`,
        status: 'aktif',
      },
    ];

    importStudentsBulk(importedSample);
    alert(`Berhasil mengimpor data siswa baru ke sistem!`);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Database className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Pengelolaan Master Data Madrasah
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kelola data guru, siswa, kelas, mata pelajaran, jadwal, cetak kartu massal &amp; import Excel
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {activeSubTab === 'siswa' && (
            <>
              <button
                onClick={() => setPrintModalConfig({ type: 'student_cards', students })}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Kartu Siswa Massal</span>
              </button>
              <label className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-emerald-500" />
                <span>Impor Excel</span>
                <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImportExcel} className="hidden" />
              </label>
            </>
          )}

          {activeSubTab === 'kelas' && (
            <button
              onClick={() => setPrintModalConfig({ type: 'classroom_signs', classrooms })}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Barcode Ruang Kelas</span>
            </button>
          )}
        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'guru', label: 'Data Guru', count: teachers.length, icon: GraduationCap },
          { id: 'siswa', label: 'Data Siswa', count: students.length, icon: Users },
          { id: 'kelas', label: 'Data Kelas', count: classrooms.length, icon: Building },
          { id: 'mapel', label: 'Mata Pelajaran', count: subjects.length, icon: BookOpen },
          { id: 'jadwal', label: 'Jadwal Pelajaran', count: schedules.length, icon: CalendarDays },
          { id: 'tahun_ajaran', label: 'Tahun & Semester', count: academicYears.length, icon: CalendarDays },
          { id: 'pengguna', label: 'Pengguna & Hak Akses', count: users.length, icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 1. DATA GURU SUBTAB */}
      {activeSubTab === 'guru' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari nama guru, NIP, mapel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none w-72"
              />
            </div>

            <button
              onClick={() => {
                setTeacherForm({
                  nip: '',
                  name: '',
                  gender: 'L',
                  phone: '',
                  email: '',
                  subjectNames: [subjects[0]?.name || 'Matematika'],
                  photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                  barcode: `TCH-${Date.now().toString().slice(-6)}`,
                  status: 'aktif',
                });
                setShowTeacherModal('new');
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Guru Baru</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Guru &amp; NIP</th>
                  <th className="py-3 px-3">Gender</th>
                  <th className="py-3 px-3">Mata Pelajaran</th>
                  <th className="py-3 px-3">No. HP &amp; Email</th>
                  <th className="py-3 px-3 font-mono">Barcode ID</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {teachers
                  .filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.nip.includes(searchQuery))
                  .map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img src={t.photo} alt={t.name} className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200" />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{t.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">NIP: {t.nip}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {t.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                        {t.subjectNames.join(', ')}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        <div>{t.phone}</div>
                        <div className="text-[10px] text-slate-400">{t.email}</div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {t.barcode}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 capitalize">
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setTeacherForm({ ...t });
                              setShowTeacherModal(t);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus guru ${t.name}?`)) deleteTeacher(t.id);
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. DATA SISWA SUBTAB */}
      {activeSubTab === 'siswa' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari nama siswa, NISN, kelas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none w-72"
              />
            </div>

            <button
              onClick={() => {
                setStudentForm({
                  nisn: `008${Math.floor(1000000 + Math.random() * 9000000)}`,
                  nis: `24${Math.floor(1000 + Math.random() * 9000)}`,
                  name: '',
                  gender: 'L',
                  classId: classrooms[0]?.id || '',
                  className: classrooms[0]?.name || '',
                  phone: '087812345678',
                  photo: 'https://randomuser.me/api/portraits/men/1.jpg',
                  barcode: `SIS-VIIA-${Math.floor(100 + Math.random() * 900)}`,
                  status: 'aktif',
                });
                setShowStudentModal('new');
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Siswa Baru</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Nama Siswa &amp; Foto</th>
                  <th className="py-3 px-3">NISN / NIS</th>
                  <th className="py-3 px-3">Kelas</th>
                  <th className="py-3 px-3">Gender</th>
                  <th className="py-3 px-3 font-mono">Barcode Kartu</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students
                  .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.nisn.includes(searchQuery) || s.className.toLowerCase().includes(searchQuery.toLowerCase()))
                  .slice(0, 30) // Render up to 30 for performance, searchable
                  .map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img src={s.photo} alt={s.name} className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200" />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                            <div className="text-[10px] text-slate-400">{s.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                        {s.nisn} / {s.nis}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {s.className}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {s.gender === 'L' ? 'L' : 'P'}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {s.barcode}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 capitalize">
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setStudentForm({
                                nisn: s.nisn,
                                nis: s.nis,
                                name: s.name,
                                gender: s.gender,
                                classId: s.classId,
                                className: s.className,
                                phone: s.phone || '',
                                photo: s.photo,
                                barcode: s.barcode,
                                status: s.status,
                              });
                              setShowStudentModal(s);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus siswa ${s.name}?`)) deleteStudent(s.id);
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. DATA KELAS SUBTAB */}
      {activeSubTab === 'kelas' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Daftar Rombongan Belajar (Rombel) &amp; Kode QR Ruangan
            </h3>
            <button
              onClick={() => {
                setClassForm({
                  name: 'Kelas VII C',
                  grade: '7',
                  homeroomTeacherId: teachers[0]?.id || '',
                  homeroomTeacherName: teachers[0]?.name || '',
                  capacity: 32,
                  qrCode: `KLS-VIIC-MTSN1LOBAR`,
                  buildingLocation: 'Gedung A, Lantai 2',
                });
                setShowClassModal('new');
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Ruang Kelas</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classrooms.map((cls) => (
              <div
                key={cls.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center">
                      {cls.name.replace('Kelas ', '')}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{cls.name}</h4>
                      <p className="text-[11px] text-slate-400">{cls.buildingLocation}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    Kapasitas: {cls.capacity}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
                  <div className="text-slate-500">Wali Kelas: <strong className="text-slate-800 dark:text-slate-200">{cls.homeroomTeacherName}</strong></div>
                  <div className="text-slate-500 font-mono text-[11px]">QR Ruang: <strong className="text-blue-600 dark:text-blue-400">{cls.qrCode}</strong></div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setPrintModalConfig({ type: 'classroom_signs', classrooms: [cls] })}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Plang QR Ruang</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setClassForm({ ...cls });
                        setShowClassModal(cls);
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 dark:text-slate-300"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus kelas ${cls.name}?`)) deleteClassroom(cls.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. DATA MATA PELAJARAN SUBTAB */}
      {activeSubTab === 'mapel' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Mata Pelajaran Kurikulum Madrasah &amp; Nasional
            </h3>
            <button
              onClick={() => {
                setSubjectForm({ code: '', name: '', category: 'Umum' });
                setShowSubjectModal('new');
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Mapel Baru</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Kode Mapel</th>
                  <th className="py-3 px-4">Nama Mata Pelajaran</th>
                  <th className="py-3 px-4">Kategori Pembelajaran</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {subjects.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {s.code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {s.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {s.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSubjectForm({ ...s });
                            setShowSubjectModal(s);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus mata pelajaran ${s.name}?`)) deleteSubject(s.id);
                          }}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. DATA JADWAL PELAJARAN SUBTAB */}
      {activeSubTab === 'jadwal' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Jadwal Pelajaran KBM Mingguan (Senin - Sabtu)
            </h3>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Jadwal</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Hari</th>
                  <th className="py-3 px-3">Jam Ke-</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Guru Pengajar</th>
                  <th className="py-3 px-4">Mata Pelajaran</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {schedules.map((sch) => {
                  const cls = classrooms.find((c) => c.id === sch.classroomId);
                  const tch = teachers.find((t) => t.id === sch.teacherId);
                  const sbj = subjects.find((s) => s.id === sch.subjectId);

                  return (
                    <tr key={sch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                        {sch.day}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        Jam Ke-{sch.period}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                        {cls?.name || sch.classroomId}
                      </td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">
                        {tch?.name || sch.teacherId}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {sbj?.name || sch.subjectId}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm('Hapus jadwal ini?')) deleteSchedule(sch.id);
                          }}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TAHUN AJARAN & SEMESTER SUBTAB */}
      {activeSubTab === 'tahun_ajaran' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-blue-500" />
              Tahun Ajaran Aktif
            </h3>
            <div className="space-y-2">
              {academicYears.map((ay) => (
                <div
                  key={ay.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                >
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    Tahun Ajaran {ay.name}
                  </div>
                  {ay.isActive ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">
                      Aktif Berjalan
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Arsip</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-emerald-500" />
              Semester Berjalan
            </h3>
            <div className="space-y-2">
              {semesters.map((sem) => (
                <div
                  key={sem.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                >
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    Semester {sem.name}
                  </div>
                  {sem.isActive ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">
                      Aktif Berjalan
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Menunggu</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. PENGGUNA & HAK AKSES (RBAC) */}
      {activeSubTab === 'pengguna' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Daftar Pengguna Sistem &amp; Tingkatan Hak Akses (RBAC)
              </h3>
              <p className="text-xs text-slate-500">
                Tingkatan akun: Administrator, Kepala Madrasah, Operator, Guru Piket, Guru Mata Pelajaran, Wali Kelas
              </p>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-3">Username</th>
                  <th className="py-3 px-4">Hak Akses (Role)</th>
                  <th className="py-3 px-4">Deskripsi Izin Akses</th>
                  <th className="py-3 px-3 font-mono">Email Resmi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => {
                  let roleBadge = 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
                  let desc = 'Akses penuh ke seluruh modul sistem';
                  if (u.role === 'kepala_madrasah') {
                    roleBadge = 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
                    desc = 'Monitoring terpadu, TV dashboard & pengesahan laporan resmi';
                  } else if (u.role === 'guru_piket') {
                    roleBadge = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
                    desc = 'Memantau ketepatan waktu guru masuk kelas & status absensi';
                  } else if (u.role === 'wali_kelas') {
                    roleBadge = 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
                    desc = 'Melihat & membina kehadiran siswa di kelas binaan';
                  } else if (u.role === 'guru_mapel') {
                    roleBadge = 'bg-teal-500/10 text-teal-600 dark:text-teal-400';
                    desc = 'Scan QR ruang kelas & presensi siswa kelas ajar';
                  }

                  return (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200" />
                          <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                        {u.username}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${roleBadge}`}>
                          {u.roleLabel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {desc}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                        {u.email}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRINT BATCH CARDS MODAL */}
      {printModalConfig && (
        <PrintCardModal
          type={printModalConfig.type}
          students={printModalConfig.students}
          classrooms={printModalConfig.classrooms}
          onClose={() => setPrintModalConfig(null)}
        />
      )}

      {/* TEACHER ADD/EDIT MODAL */}
      {showTeacherModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {showTeacherModal === 'new' ? 'Tambah Guru Baru' : 'Edit Data Guru'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nama Lengkap &amp; Gelar</label>
                <input
                  type="text"
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                  placeholder="Contoh: Drs. H. Ahmad, M.Pd."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">NIP (18 Digit Kemenag)</label>
                <input
                  type="text"
                  value={teacherForm.nip}
                  onChange={(e) => setTeacherForm({ ...teacherForm, nip: e.target.value })}
                  placeholder="198203142009121003"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mata Pelajaran yang Diampu</label>
                <input
                  type="text"
                  value={teacherForm.subjectNames.join(', ')}
                  onChange={(e) => setTeacherForm({ ...teacherForm, subjectNames: e.target.value.split(',').map((x) => x.trim()) })}
                  placeholder="Matematika, IPA"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setShowTeacherModal(null)} className="px-4 py-2 text-xs font-medium text-slate-500">Batal</button>
              <button
                onClick={() => {
                  if (showTeacherModal === 'new') {
                    addTeacher(teacherForm);
                  } else {
                    updateTeacher({ ...showTeacherModal, ...teacherForm });
                  }
                  setShowTeacherModal(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT ADD/EDIT MODAL */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {showStudentModal === 'new' ? 'Tambah Siswa Baru' : 'Edit Data Siswa'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  placeholder="Nama Lengkap"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">NISN</label>
                  <input
                    type="text"
                    value={studentForm.nisn}
                    onChange={(e) => setStudentForm({ ...studentForm, nisn: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">NIS</label>
                  <input
                    type="text"
                    value={studentForm.nis}
                    onChange={(e) => setStudentForm({ ...studentForm, nis: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Pilih Kelas</label>
                <select
                  value={studentForm.classId}
                  onChange={(e) => {
                    const cid = e.target.value;
                    const c = classrooms.find((cls) => cls.id === cid);
                    setStudentForm({ ...studentForm, classId: cid, className: c?.name || '' });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setShowStudentModal(null)} className="px-4 py-2 text-xs font-medium text-slate-500">Batal</button>
              <button
                onClick={() => {
                  if (showStudentModal === 'new') {
                    addStudent(studentForm);
                  } else {
                    updateStudent({ ...showStudentModal, ...studentForm });
                  }
                  setShowStudentModal(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE ADD MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Tambah Jadwal Pelajaran
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Hari</label>
                  <select
                    value={scheduleForm.day}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                  >
                    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Jam Ke-</label>
                  <select
                    value={scheduleForm.period}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, period: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>Jam Ke-{n}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Ruang Kelas</label>
                <select
                  value={scheduleForm.classroomId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, classroomId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                >
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Guru Pengajar</label>
                <select
                  value={scheduleForm.teacherId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, teacherId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mata Pelajaran</label>
                <select
                  value={scheduleForm.subjectId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, subjectId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setShowScheduleModal(false)} className="px-4 py-2 text-xs font-medium text-slate-500">Batal</button>
              <button
                onClick={() => {
                  addSchedule(scheduleForm);
                  setShowScheduleModal(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
              >
                Simpan Jadwal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
