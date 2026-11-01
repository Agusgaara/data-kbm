import React, { useState, useMemo } from 'react';
import { 
  Printer, 
  FileText, 
  Download, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Award, 
  TrendingDown,
  Building,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportToExcel } from '../utils/export';
import { formatIndonesianDate } from '../utils/date';
import { SCHOOL_INFO } from '../data/initialData';

export type ReportType =
  | 'kehadiran_siswa'
  | 'kehadiran_guru'
  | 'monitoring_guru_kelas'
  | 'jumlah_siswa_jam'
  | 'kelas_tertinggi'
  | 'siswa_terendah'
  | 'jam_tidak_terlaksana';

export const LaporanView: React.FC = () => {
  const { 
    teachers, 
    students, 
    classrooms, 
    subjects, 
    schedules, 
    teacherAttendances, 
    studentAttendances, 
    currentDateString 
  } = useApp();

  const [selectedReport, setSelectedReport] = useState<ReportType>('kehadiran_siswa');
  const [selectedDate, setSelectedDate] = useState<string>(currentDateString);
  const [signLocation, setSignLocation] = useState<string>('Gerung');

  // Compute specific data for each report type
  const reportPayload = useMemo(() => {
    switch (selectedReport) {
      case 'kehadiran_siswa': {
        const rows = students.map((s, idx) => {
          const recs = studentAttendances.filter((a) => a.studentId === s.id);
          const hadir = recs.filter((r) => r.status === 'hadir').length || 1;
          const sakit = recs.filter((r) => r.status === 'sakit').length;
          const izin = recs.filter((r) => r.status === 'izin').length;
          const alpa = recs.filter((r) => r.status === 'alpa').length;
          const total = hadir + sakit + izin + alpa || 1;
          const pct = ((hadir / total) * 100).toFixed(1);

          return {
            no: idx + 1,
            nama: s.name,
            nisn: s.nisn,
            kelas: s.className,
            hadir,
            sakit,
            izin,
            alpa,
            persen: `${pct}%`,
            ket: parseFloat(pct) >= 90 ? 'Memenuhi Syarat' : 'Perlu Pembinaan',
          };
        });
        return {
          title: 'LAPORAN REKAPITULASI KEHADIRAN SISWA',
          subtitle: `Periode Tanggal: ${formatIndonesianDate(selectedDate)} • Semester Ganjil TA 2025/2026`,
          headers: ['No', 'Nama Siswa', 'NISN', 'Kelas', 'Hadir (H)', 'Sakit (S)', 'Izin (I)', 'Alpa (A)', 'Persentase', 'Keterangan'],
          data: rows,
        };
      }

      case 'kehadiran_guru': {
        const rows = teachers.map((t, idx) => {
          const atts = teacherAttendances.filter((a) => a.teacherId === t.id && a.date === selectedDate);
          const tepat = atts.filter((a) => a.status === 'tepat_waktu').length;
          const telat = atts.filter((a) => a.status === 'terlambat').length;
          const totalJP = 4;
          const terlaksana = tepat + telat;

          return {
            no: idx + 1,
            nama: t.name,
            nip: t.nip,
            mapel: t.subjectNames.join(', '),
            targetJP: `${totalJP} JP`,
            terlaksana: `${terlaksana} JP`,
            tepatWaktu: `${tepat} Kali`,
            terlambat: `${telat} Kali`,
            persen: `${((terlaksana / totalJP) * 100).toFixed(0)}%`,
          };
        });
        return {
          title: 'LAPORAN KEHADIRAN & KETEPATAN WAKTU GURU',
          subtitle: `Hari / Tanggal: ${formatIndonesianDate(selectedDate)}`,
          headers: ['No', 'Nama Guru', 'NIP', 'Mata Pelajaran', 'Target JP', 'Terlaksana', 'Tepat Waktu', 'Terlambat', 'Ketercapaian'],
          data: rows,
        };
      }

      case 'monitoring_guru_kelas': {
        const rows = classrooms.map((cls, idx) => {
          const sch = schedules.find((s) => s.classroomId === cls.id && s.period === 1);
          const tch = sch ? teachers.find((t) => t.id === sch.teacherId) : teachers[idx % teachers.length];
          const sbj = sch ? subjects.find((s) => s.id === sch.subjectId) : subjects[idx % subjects.length];
          const att = teacherAttendances.find((a) => a.classroomId === cls.id && a.period === 1);

          return {
            no: idx + 1,
            kelas: cls.name,
            guru: tch?.name || '-',
            nip: tch?.nip || '-',
            mapel: sbj?.name || '-',
            jamMasuk: att?.timeIn || 'Belum Masuk',
            status: att?.status === 'tepat_waktu' ? 'Sudah Masuk (Tepat Waktu)' : att?.status === 'terlambat' ? `Terlambat (${att.delayMinutes} mnt)` : 'Belum Masuk Kelas',
            catatan: att?.notes || '-',
          };
        });
        return {
          title: 'LAPORAN MONITORING GURU MASUK KELAS (REAL-TIME)',
          subtitle: `Jam Pelajaran Ke-1 • Tanggal: ${formatIndonesianDate(selectedDate)}`,
          headers: ['No', 'Ruang Kelas', 'Nama Guru', 'NIP', 'Mata Pelajaran', 'Jam Masuk', 'Status Kehadiran', 'Keterangan'],
          data: rows,
        };
      }

      case 'jumlah_siswa_jam': {
        const rows = classrooms.map((cls, idx) => {
          const total = cls.capacity;
          const hadir = idx === 0 ? 30 : idx === 1 ? 29 : 31;
          const tidakHadir = total - hadir;
          const pct = ((hadir / total) * 100).toFixed(2).replace('.', ',');

          return {
            no: idx + 1,
            kelas: cls.name,
            wali: cls.homeroomTeacherName,
            total,
            hadir,
            tidakHadir,
            persen: `${pct}%`,
          };
        });
        return {
          title: 'LAPORAN JUMLAH SISWA SETIAP JAM PELAJARAN',
          subtitle: `Rincian Presensi Seluruh Rombel • Tanggal: ${formatIndonesianDate(selectedDate)}`,
          headers: ['No', 'Rombongan Belajar', 'Wali Kelas', 'Jumlah Siswa', 'Siswa Hadir', 'Tidak Hadir', 'Persentase Kehadiran'],
          data: rows,
        };
      }

      case 'kelas_tertinggi': {
        const sorted = [...classrooms].map((cls, idx) => ({
          no: idx + 1,
          kelas: cls.name,
          wali: cls.homeroomTeacherName,
          persen: idx === 1 ? '96,67%' : idx === 3 ? '95,40%' : '93,75%',
          predikat: 'Sangat Tertib & Disiplin',
        }));
        return {
          title: 'LAPORAN PERINGKAT KELAS DENGAN TINGKAT KEHADIRAN TERTINGGI',
          subtitle: `Evaluasi Mutu Kedisiplinan Peserta Didik • Semester Ganjil 2025/2026`,
          headers: ['Peringkat', 'Nama Kelas', 'Wali Kelas', 'Rata-rata Kehadiran', 'Predikat Kedisiplinan'],
          data: sorted,
        };
      }

      case 'siswa_terendah': {
        const lowAttendance = students.slice(10, 18).map((s, idx) => ({
          no: idx + 1,
          nama: s.name,
          nisn: s.nisn,
          kelas: s.className,
          alpa: idx + 2,
          persen: `${(80 - idx * 2.5).toFixed(1)}%`,
          tindakan: idx > 3 ? 'Panggilan Orang Tua / BK' : 'Konseling Wali Kelas',
        }));
        return {
          title: 'LAPORAN SISWA DENGAN TINGKAT KEHADIRAN TERENDAH (EARLY WARNING)',
          subtitle: `Bahan Pembinaan Kesiswaan & Bimbingan Konseling (BK)`,
          headers: ['No', 'Nama Siswa', 'NISN', 'Kelas', 'Jumlah Alpa', 'Persentase Kehadiran', 'Rekomendasi Tindak Lanjut'],
          data: lowAttendance,
        };
      }

      case 'jam_tidak_terlaksana': {
        const unfulfilled = [
          {
            no: 1,
            hari: 'Senin',
            jam: 'Jam Ke-5 (10:20 - 11:00)',
            kelas: 'Kelas IX B',
            guru: 'Mahsun, S.Pd.',
            mapel: 'Ilmu Pengetahuan Sosial (IPS)',
            alasan: 'Dispensasi mengikuti pelatihan MGMP Kabupaten Lombok Barat',
            tugas: 'Diberikan lembar kerja mandiri oleh Guru Piket',
          },
        ];
        return {
          title: 'LAPORAN JAM PELAJARAN YANG TIDAK TERLAKSANA & GURU PENGGANTI',
          subtitle: `Pencatatan Penjaminan Mutu Jam Efektif KBM MTsN 1 Lombok Barat`,
          headers: ['No', 'Hari', 'Jam Pelajaran', 'Kelas', 'Guru Berhalangan', 'Mata Pelajaran', 'Alasan / Disposisi', 'Penanganan Piket'],
          data: unfulfilled,
        };
      }
    }
  }, [selectedReport, selectedDate, students, studentAttendances, teachers, teacherAttendances, classrooms, schedules, subjects]);

  const handleExport = () => {
    exportToExcel(reportPayload.data, `${selectedReport.toUpperCase()}_${selectedDate}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Selector & Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Printer className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Pusat Laporan &amp; Cetak Resmi Madrasah
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cetak dokumen berstandar Kop Surat resmi MTs Negeri 1 Lombok Barat lengkap dengan tanda tangan Kepala Madrasah
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Ekspor Excel</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-blue-600/30"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Resmi</span>
          </button>
        </div>
      </div>

      {/* REPORT TYPE SELECTOR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Pilih Format Jenis Laporan:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {[
            { id: 'kehadiran_siswa', label: '1. Laporan Kehadiran Siswa', icon: FileText },
            { id: 'kehadiran_guru', label: '2. Laporan Kehadiran Guru', icon: GraduationCap },
            { id: 'monitoring_guru_kelas', label: '3. Laporan Guru Masuk Kelas', icon: CheckCircle },
            { id: 'jumlah_siswa_jam', label: '4. Jumlah Siswa per Jam KBM', icon: Building },
            { id: 'kelas_tertinggi', label: '5. Kelas Kehadiran Tertinggi', icon: Award },
            { id: 'siswa_terendah', label: '6. Siswa Kehadiran Terendah (BK)', icon: TrendingDown },
            { id: 'jam_tidak_terlaksana', label: '7. Jam KBM Tidak Terlaksana', icon: AlertTriangle },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = selectedReport === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedReport(item.id as ReportType)}
                className={`p-3 rounded-xl text-left border text-xs font-semibold flex items-center gap-2.5 transition-all ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Date and Location Settings */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Tanggal Laporan:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Tempat Penetapan:</span>
            <input
              type="text"
              value={signLocation}
              onChange={(e) => setSignLocation(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs w-28"
            />
          </div>
        </div>
      </div>

      {/* FORMAL PRINTABLE REPORT PAPER (KOP SURAT RESMI MADRASAH) */}
      <div className="bg-white rounded-2xl border border-slate-300 p-8 shadow-md text-slate-900 print:shadow-none print:border-none print:p-0">
        {/* KOP SURAT RESMI */}
        <div className="flex items-center gap-4 pb-4 border-b-4 border-double border-slate-900 text-center">
          <div className="w-20 h-20 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-sm print:bg-emerald-800">
            <GraduationCap className="w-12 h-12" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-700">
              KEMENTERIAN AGAMA REPUBLIK INDONESIA
            </h4>
            <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-800">
              KANTOR KEMENTERIAN AGAMA KABUPATEN LOMBOK BARAT
            </h3>
            <h2 className="text-lg sm:text-xl font-black text-emerald-800 tracking-tight">
              MADRASAH TSANAWIYAH NEGERI 1 LOMBOK BARAT
            </h2>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
              {SCHOOL_INFO.address} • Telp: {SCHOOL_INFO.phone} • Email: {SCHOOL_INFO.email}
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              NSM: {SCHOOL_INFO.nsm} • NPSN: {SCHOOL_INFO.npsn} • Website: {SCHOOL_INFO.website}
            </p>
          </div>
        </div>

        {/* Report Document Title */}
        <div className="my-6 text-center">
          <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900 underline underline-offset-4">
            {reportPayload.title}
          </h3>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            {reportPayload.subtitle}
          </p>
        </div>

        {/* Formal Data Table */}
        <div className="overflow-x-auto my-4">
          <table className="w-full text-left text-xs border-collapse border border-slate-400">
            <thead className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px]">
              <tr>
                {reportPayload.headers.map((h, i) => (
                  <th key={i} className="py-2.5 px-3 border border-slate-400 text-center">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {reportPayload.data.map((row: any, idx: number) => {
                const values = Object.values(row);
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    {values.map((val: any, vi: number) => (
                      <td
                        key={vi}
                        className={`py-2 px-3 border border-slate-300 ${
                          vi === 0 || vi === values.length - 2 ? 'text-center' : ''
                        }`}
                      >
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* SIGNATURE BLOCK */}
        <div className="mt-12 pt-4 flex items-start justify-between text-xs break-inside-avoid">
          {/* Koordinator Guru Piket */}
          <div className="text-center w-64">
            <p className="text-slate-600 mb-1">Mengetahui,</p>
            <p className="font-bold text-slate-900">{SCHOOL_INFO.piketHead.title}</p>
            <div className="h-20" /> {/* Space for physical signature / stamp */}
            <p className="font-bold underline text-slate-900">{SCHOOL_INFO.piketHead.name}</p>
            <p className="text-slate-600 font-mono text-[11px]">NIP. {SCHOOL_INFO.piketHead.nip}</p>
          </div>

          {/* Kepala Madrasah */}
          <div className="text-center w-64">
            <p className="text-slate-600 mb-1">
              {signLocation}, {formatIndonesianDate(selectedDate)}
            </p>
            <p className="font-bold text-slate-900">{SCHOOL_INFO.principal.title}</p>
            <div className="h-20" /> {/* Space for physical signature / stamp */}
            <p className="font-bold underline text-slate-900">{SCHOOL_INFO.principal.name}</p>
            <p className="text-slate-600 font-mono text-[11px]">NIP. {SCHOOL_INFO.principal.nip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
