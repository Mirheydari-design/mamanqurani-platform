/**
 * Utilities for Persian Solar Hijri (Shamsi) and ISO date calculations
 * Prevents "Invalid Date" errors and provides accurate day/week pill data.
 */

/**
 * Safely parse date strings into local noon Date objects to prevent timezone shifts.
 */
export const parseDate = (dateStr?: string | null): Date => {
  if (!dateStr || dateStr === 'امروز') {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
  }
  if (dateStr === 'فردا') {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 12, 0, 0);
  }
  if (dateStr === 'پس‌فردا') {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 2, 12, 0, 0);
  }
  if (dateStr === 'دیروز') {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1, 12, 0, 0);
  }
  if (typeof dateStr === 'string' && dateStr.includes('-')) {
    const parts = dateStr.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    }
  }
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
  }
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 12, 0, 0);
};

export const formatDateToISO = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getTodayStr = (): string => {
  return formatDateToISO(new Date());
};

export const addDays = (dateStr: string, days: number): string => {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDateToISO(d);
};

export const normalizeTaskDate = (dateStr?: string | null): string => {
  if (!dateStr || dateStr === 'امروز') return getTodayStr();
  if (dateStr === 'فردا') return addDays(getTodayStr(), 1);
  if (dateStr === 'پس‌فردا') return addDays(getTodayStr(), 2);
  if (dateStr === 'دیروز') return addDays(getTodayStr(), -1);
  return formatDateToISO(parseDate(dateStr));
};

export interface PersianDateInfo {
  dateISO: string;
  dayNumber: string;
  monthName: string;
  weekdayFull: string;
  weekdayShort: string;
  isToday: boolean;
}

export const getPersianDateParts = (dateStr?: string | null): PersianDateInfo => {
  const norm = normalizeTaskDate(dateStr);
  const d = parseDate(norm);
  const todayISO = getTodayStr();

  let dayNumber = '۱';
  let monthName = 'شهریور';
  let weekdayFull = 'شنبه';

  try {
    dayNumber = d.toLocaleDateString('fa-IR-u-ca-persian', { day: 'numeric' });
    monthName = d.toLocaleDateString('fa-IR-u-ca-persian', { month: 'long' });
    weekdayFull = d.toLocaleDateString('fa-IR-u-ca-persian', { weekday: 'long' });
  } catch {
    dayNumber = String(d.getDate());
  }

  let weekdayShort = 'شنبه';
  if (weekdayFull.includes('یک')) weekdayShort = '۱ش';
  else if (weekdayFull.includes('دو')) weekdayShort = '۲ش';
  else if (weekdayFull.includes('سه')) weekdayShort = '۳ش';
  else if (weekdayFull.includes('چهار')) weekdayShort = '۴ش';
  else if (weekdayFull.includes('پنج')) weekdayShort = '۵ش';
  else if (weekdayFull.includes('جمعه')) weekdayShort = 'جمعه';
  else weekdayShort = 'شنبه';

  return {
    dateISO: norm,
    dayNumber,
    monthName,
    weekdayFull,
    weekdayShort,
    isToday: norm === todayISO,
  };
};

export const formatDateFA = (dateStr?: string | null): string => {
  const parts = getPersianDateParts(dateStr);
  return `${parts.weekdayFull} ${parts.dayNumber} ${parts.monthName}`;
};

export const getRelativeDayLabel = (dateStr?: string | null): string => {
  if (!dateStr) return 'امروز';
  const norm = normalizeTaskDate(dateStr);
  const today = getTodayStr();
  const tomorrow = addDays(today, 1);
  const dayAfter = addDays(today, 2);
  const yesterday = addDays(today, -1);

  if (norm === today) return 'امروز';
  if (norm === tomorrow) return 'فردا';
  if (norm === dayAfter) return 'پس‌فردا';
  if (norm === yesterday) return 'دیروز';

  return formatDateFA(norm);
};

/**
 * Returns a 7-day window centered on or containing baseDateStr
 */
export const getWeekDaysList = (centerDateStr: string, offsetDays: number = 0): PersianDateInfo[] => {
  const center = normalizeTaskDate(centerDateStr);
  const base = addDays(center, offsetDays);
  const list: PersianDateInfo[] = [];

  // Generate 7 days: 3 days before, the center day, and 3 days after
  for (let i = -3; i <= 3; i++) {
    const dStr = addDays(base, i);
    list.push(getPersianDateParts(dStr));
  }

  return list;
};
