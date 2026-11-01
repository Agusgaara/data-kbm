import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  QrCode, 
  Barcode, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Volume2, 
  Zap, 
  Keyboard, 
  Users, 
  GraduationCap, 
  RefreshCw, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';

interface ScannerViewProps {
  onNavigateTab: (tab: any) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({ onNavigateTab }) => {
  const { 
    scanClassroomQR, 
    scanStudentBarcode, 
    classrooms, 
    students, 
    teachers, 
    activePeriod, 
    currentUser 
  } = useApp();

  const [scanMode, setScanMode] = useState<'classroom' | 'student'>('classroom');
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<any | null>(null);
  const [selectedTeacherForScan, setSelectedTeacherForScan] = useState<string>(
    currentUser.teacherId || teachers[0]?.id || ''
  );

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'interactive-qr-reader';

  // Listen to USB Barcode Scanner hardware wedge (rapid keystrokes terminating with Enter)
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing inside an input field
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 150) {
        buffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length >= 3) {
          handleExecuteScan(buffer);
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scanMode, selectedTeacherForScan]);

  // Start / Stop camera scanner
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerContainerId);
      }

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setCameraError('Tidak ditemukan kamera pada perangkat ini. Anda tetap dapat menggunakan Barcode Scanner USB atau Input Manual.');
        return;
      }

      const cameraId = cameras[cameras.length - 1].id; // Prefer back camera if available

      await scannerRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleExecuteScan(decodedText);
          // Pause camera momentarily to avoid multiple fires
          if (scannerRef.current) {
            scannerRef.current.pause(true);
            setTimeout(() => {
              try {
                scannerRef.current?.resume();
              } catch {}
            }, 2500);
          }
        },
        () => {
          // Frame scan error (normal during searching)
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.warn('Camera start error:', err);
      setCameraError(
        'Izin akses kamera belum diizinkan atau kamera sedang digunakan aplikasi lain. Anda dapat menggunakan Scanner USB atau tombol simulasi cepat di bawah.'
      );
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.warn('Camera stop error:', err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [isScanning]);

  // Central scan executor
  const handleExecuteScan = (rawCode: string) => {
    const code = rawCode.trim();
    if (!code) return;

    let res: any;
    if (scanMode === 'classroom') {
      res = scanClassroomQR(code, selectedTeacherForScan);
    } else {
      res = scanStudentBarcode(code);
    }

    setLastResult(res);

    if (res.success) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleExecuteScan(manualCode.trim());
      setManualCode('');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title & Mode Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <QrCode className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Pusat Pemindaian Barcode &amp; QR Code
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mendukung Kamera HP/Laptop, Barcode Scanner USB (Wedge), dan Pemindai Kartu Presensi
          </p>
        </div>

        {/* 2 Main Function Switcher Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => {
              setScanMode('classroom');
              setLastResult(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              scanMode === 'classroom'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>1. Scan QR Ruang Kelas (Guru)</span>
          </button>

          <button
            onClick={() => {
              setScanMode('student');
              setLastResult(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              scanMode === 'student'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>2. Scan Kartu Siswa (Presensi)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Camera Viewport & Manual Input */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-sky-500" />
                  Kamera Pemindai Langsung
                </h3>
                <p className="text-xs text-slate-400">
                  Arahkan kamera ke QR Code ruang kelas atau Barcode kartu siswa
                </p>
              </div>

              {!isScanning ? (
                <button
                  onClick={startCamera}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Aktifkan Kamera</span>
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Matikan Kamera</span>
                </button>
              )}
            </div>

            {/* Viewfinder Container */}
            <div className="relative w-full aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
              <div id={scannerContainerId} className="w-full h-full" />

              {!isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-2 bg-slate-950/90">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Kamera Belum Aktif</h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Klik tombol di atas untuk membuka kamera, atau langsung scan menggunakan pemindai barcode USB kapan saja.
                  </p>
                  <button
                    onClick={startCamera}
                    className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                  >
                    Buka Kamera Sekarang
                  </button>
                </div>
              )}

              {/* Scanning Laser Guide Overlay */}
              {isScanning && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-dashed border-emerald-400/80 rounded-2xl relative shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                    <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-bounce top-1/2" />
                  </div>
                </div>
              )}
            </div>

            {cameraError && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Extra: Select Teacher who is scanning class QR */}
            {scanMode === 'classroom' && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Identitas Guru yang Masuk Kelas:
                </label>
                <select
                  value={selectedTeacherForScan}
                  onChange={(e) => setSelectedTeacherForScan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (NIP: {t.nip}) — {t.subjectNames.join(', ')}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  *Guru yang login otomatis terdeteksi saat melakukan pemindaian barcode ruang kelas.
                </p>
              </div>
            )}

            {/* Manual input / USB scanner keyboard wedge fallback */}
            <form onSubmit={handleManualSubmit} className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Keyboard className="w-3.5 h-3.5 text-blue-500" />
                  <span>Input Manual / Scanner Barcode USB:</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Tekan Enter untuk memproses</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder={
                    scanMode === 'classroom'
                      ? 'Ketik kode ruang kelas (contoh: KLS-VIIA-MTSN1LOBAR)'
                      : 'Ketik nomor barcode kartu/NISN (contoh: SIS-VIIA-001)'
                  }
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shrink-0"
                >
                  Proses
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Scan Result & Quick Test Buttons */}
        <div className="lg:col-span-5 space-y-4">
          {/* Scan Result Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Hasil Pemindaian Terkini
              </span>
              {lastResult && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  lastResult.statusType === 'success'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : lastResult.statusType === 'warning'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                }`}>
                  {lastResult.statusType?.toUpperCase()}
                </span>
              )}
            </h3>

            {lastResult ? (
              <div className="space-y-4 animate-in fade-in zoom-in-95">
                <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                  lastResult.statusType === 'success'
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : lastResult.statusType === 'warning'
                    ? 'bg-amber-500/5 border-amber-500/20'
                    : 'bg-rose-500/5 border-rose-500/20'
                }`}>
                  {lastResult.photo ? (
                    <img
                      src={lastResult.photo}
                      alt={lastResult.title}
                      className="w-16 h-16 rounded-xl object-cover ring-2 ring-emerald-500/40 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <QrCode className="w-8 h-8 text-slate-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {lastResult.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {lastResult.subtitle}
                    </p>
                    <p className={`text-xs font-semibold mt-1.5 ${
                      lastResult.statusType === 'success'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : lastResult.statusType === 'warning'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {lastResult.message}
                    </p>
                  </div>
                </div>

                {/* Detailed Table of Attributes */}
                {lastResult.details && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 divide-y divide-slate-200 dark:divide-slate-700/60 text-xs">
                    {Object.entries(lastResult.details).map(([key, val]) => (
                      <div key={key} className="py-1.5 flex justify-between gap-2">
                        <span className="text-slate-500 dark:text-slate-400">{key}:</span>
                        <span className="font-semibold text-slate-900 dark:text-white text-right">
                          {String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-10 text-center text-slate-400 space-y-2">
                <QrCode className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-xs">
                  Silakan arahkan kamera atau pilih salah satu kartu sampel di bawah untuk melakukan simulasi scan.
                </p>
              </div>
            )}
          </div>

          {/* Quick Simulator Picker for reviewer convenience */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Simulasi Cepat (Klik untuk Uji Scan)</span>
              </h4>
              <span className="text-[10px] text-slate-400">Mudah &amp; Instan</span>
            </div>

            {scanMode === 'classroom' ? (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500">
                  Klik barcode ruang kelas untuk memindai guru masuk ke kelas:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {classrooms.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleExecuteScan(c.qrCode)}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-left border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 transition-all text-xs group"
                    >
                      <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-500">
                        {c.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">
                        {c.qrCode}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500">
                  Klik salah satu kartu siswa untuk menguji scan presensi siswa:
                </p>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {students.slice(0, 10).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleExecuteScan(s.barcode)}
                      className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-left border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 transition-all flex items-center justify-between text-xs group"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={s.photo}
                          alt={s.name}
                          className="w-7 h-7 rounded-md object-cover"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-500">
                            {s.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {s.className} • NISN {s.nisn}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 group-hover:text-emerald-400">
                        {s.barcode}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
