import { DayOfWeek, SchedulePeriod } from '../types';

// Standard bell schedule for MTs Negeri 1 Lombok Barat
export const STANDARD_PERIODS: SchedulePeriod[] = [
  { period: 1, name: 'Jam Ke-1', startTime: '07:15', endTime: '07:55' },
  { period: 2, name: 'Jam Ke-2', startTime: '07:55', endTime: '08:35' },
  { period: 3, name: 'Jam Ke-3', startTime: '08:35', endTime: '09:15' },
  { period: 0, name: 'Istirahat I', startTime: '09:15', endTime: '09:40', isBreak: true },
  { period: 4, name: 'Jam Ke-4', startTime: '09:40', endTime: '10:20' },
  { period: 5, name: 'Jam Ke-5', startTime: '10:20', endTime: '11:00' },
  { period: 6, name: 'Jam Ke-6', startTime: '11:00', endTime: '11:40' },
  { period: -1, name: 'Istirahat II / Dzuhur', startTime: '11:40', endTime: '12:30', isBreak: true },
  { period: 7, name: 'Jam Ke-7', startTime: '12:30', endTime: '13:10' },
  { period: 8, name: 'Jam Ke-8', startTime: '13:10', endTime: '13:50' },
];

export const TEACHING_PERIODS = STANDARD_PERIODS.filter((p) => !p.isBreak && p.period > 0);

export function getTodayDateString(customDate?: Date): string {
  const d = customDate || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(customDate?: Date): string {
  const d = customDate || new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function getIndonesianDayName(d: Date = new Date()): DayOfWeek {
  const dayIndex = d.getDay();
  const rawDays: string[] = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const day = rawDays[dayIndex];
  if (day === 'Minggu') return 'Senin'; // Fallback for school simulation on weekend
  return day as DayOfWeek;
}

export function formatIndonesianDate(dateString: string): string {
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  } catch {
    // fallback
  }
  return dateString;
}

// Determine active period based on time "HH:MM"
export function determineActivePeriod(timeStr: string): SchedulePeriod | null {
  const [h, m] = timeStr.split(':').map((x) => parseInt(x, 10));
  const currentMinutes = h * 60 + m;

  for (const p of STANDARD_PERIODS) {
    const [sh, sm] = p.startTime.split(':').map((x) => parseInt(x, 10));
    const [eh, em] = p.endTime.split(':').map((x) => parseInt(x, 10));
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;

    if (currentMinutes >= startMin && currentMinutes < endMin) {
      return p;
    }
  }

  // If before school starts
  const firstPeriod = STANDARD_PERIODS[0];
  const [fsh, fsm] = firstPeriod.startTime.split(':').map((x) => parseInt(x, 10));
  if (currentMinutes < fsh * 60 + fsm) {
    return {
      period: 1,
      name: 'Persiapan Jam Ke-1',
      startTime: '07:00',
      endTime: '07:15',
      isBreak: false,
    };
  }

  // If after school ends
  return null;
}

// Calculate delay minutes compared to period start time
export function calculateDelayMinutes(scannedTime: string, periodStartTime: string): number {
  const [sh, sm] = periodStartTime.split(':').map((x) => parseInt(x, 10));
  const [th, tm] = scannedTime.split(':').map((x) => parseInt(x, 10));

  const startTotalMin = sh * 60 + sm;
  const scannedTotalMin = th * 60 + tm;

  const diff = scannedTotalMin - startTotalMin;
  return diff > 5 ? diff : 0; // Grace period 5 minutes
}
