import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, Download, GraduationCap } from 'lucide-react';
import { Student, Classroom } from '../types';
import { SCHOOL_INFO } from '../data/initialData';

interface PrintCardModalProps {
  type: 'student_cards' | 'classroom_signs';
  students?: Student[];
  classrooms?: Classroom[];
  onClose: () => void;
}

export const PrintCardModal: React.FC<PrintCardModalProps> = ({
  type,
  students = [],
  classrooms = [],
  onClose,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Printer className="w-5 h-5 text-blue-600" />
              <span>
                {type === 'student_cards'
                  ? `Cetak Massal Kartu Presensi Siswa (${students.length} Kartu)`
                  : `Cetak Barcode / QR Ruang Kelas (${classrooms.length} Ruangan)`}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Format siap cetak A4/PVC card dengan identitas resmi {SCHOOL_INFO.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-blue-600/30"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Preview Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100 dark:bg-slate-950/60 print:bg-white print:p-0">
          <div ref={printAreaRef} id="printable-card-area">
            {type === 'student_cards' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-2 print:gap-4">
                {students.map((std) => (
                  <div
                    key={std.id}
                    className="bg-white rounded-xl border border-slate-300 p-4 shadow-sm flex flex-col justify-between relative overflow-hidden break-inside-avoid print:shadow-none"
                    style={{ minHeight: '230px' }}
                  >
                    {/* Header Card */}
                    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div className="leading-tight">
                        <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                          KARTU PRESENSI DIGITAL
                        </div>
                        <div className="text-[11px] font-extrabold text-slate-900 truncate">
                          {SCHOOL_INFO.name}
                        </div>
                      </div>
                    </div>

                    {/* Student Info & Photo */}
                    <div className="py-2.5 flex items-center gap-3">
                      <img
                        src={std.photo}
                        alt={std.name}
                        className="w-16 h-16 rounded-lg object-cover ring-1 ring-slate-300 shrink-0"
                      />
                      <div className="text-xs space-y-0.5 truncate">
                        <div className="font-bold text-slate-900 truncate text-[13px]">
                          {std.name}
                        </div>
                        <div className="text-slate-600 font-mono text-[11px]">
                          NISN: <strong>{std.nisn}</strong>
                        </div>
                        <div className="text-slate-600 font-mono text-[11px]">
                          NIS: <strong>{std.nis}</strong>
                        </div>
                        <div className="text-emerald-700 font-semibold text-[11px]">
                          Kelas: {std.className}
                        </div>
                      </div>
                    </div>

                    {/* Barcode & QR Code representation */}
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                      <div className="flex-1 truncate">
                        <div className="font-mono text-[10px] text-slate-500 truncate">
                          CODE: {std.barcode}
                        </div>
                        {/* Simulated barcode bars */}
                        <div className="h-6 flex items-end gap-[1.5px] mt-0.5 overflow-hidden">
                          {std.barcode.split('').map((char, i) => (
                            <div
                              key={i}
                              className="bg-slate-900"
                              style={{
                                width: (char.charCodeAt(0) % 3) + 1,
                                height: '100%',
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="shrink-0 p-1 bg-white border border-slate-200 rounded-md">
                        <QRCodeSVG value={std.barcode} size={48} level="M" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:grid-cols-2 print:gap-6">
                {classrooms.map((cls) => (
                  <div
                    key={cls.id}
                    className="bg-white rounded-2xl border-2 border-slate-800 p-6 shadow-md flex flex-col items-center text-center justify-between relative overflow-hidden break-inside-avoid print:shadow-none"
                    style={{ minHeight: '380px' }}
                  >
                    <div className="w-full pb-3 border-b-2 border-slate-800 flex items-center justify-between gap-3">
                      <div className="text-left">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">
                          KEMENTERIAN AGAMA REPUBLIK INDONESIA
                        </div>
                        <div className="text-xs font-black text-slate-900">
                          {SCHOOL_INFO.name}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white">
                        RUANG RESMI
                      </span>
                    </div>

                    <div className="my-4">
                      <h2 className="text-3xl font-black text-slate-950 tracking-tight">
                        {cls.name}
                      </h2>
                      <p className="text-xs text-slate-600 mt-1 font-medium">
                        Wali Kelas: {cls.homeroomTeacherName} • {cls.buildingLocation}
                      </p>
                    </div>

                    {/* Large crisp QR Code */}
                    <div className="p-3 bg-white border-2 border-slate-800 rounded-2xl shadow-inner my-2">
                      <QRCodeSVG value={cls.qrCode} size={150} level="H" />
                    </div>

                    <div className="w-full pt-3 border-t border-slate-200 text-center">
                      <div className="font-mono text-xs font-bold text-slate-800 tracking-wider">
                        {cls.qrCode}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        *Guru wajib memindai QR Code ini saat memasuki ruang kelas untuk mencatat jam kehadiran KBM.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
