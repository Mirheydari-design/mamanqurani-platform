/**
 * Convert English digits (0-9) to Persian digits (۰-۹)
 */
export const toPersianDigits = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (w) => persianDigits[+w]);
};

/**
 * Convert Persian and Arabic digits to English digits (0-9)
 */
export const toEnglishDigits = (str: string | number | undefined | null): string => {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
};

/**
 * Returns formatted Persian date for today (e.g. "سه‌شنبه، ۲۹ دی ۱۴۰۴")
 */
export const getPersianTodayDate = (): string => {
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return formatter.format(new Date());
  } catch (e) {
    return 'امروز';
  }
};

/**
 * Format date & time in Persian (e.g. "امروز، ساعت ۱۲:۳۵" or "۱۹ شهریور، ساعت ۱۲:۳۵")
 */
export const formatPersianDateTime = (dateInput?: Date | string | number): string => {
  try {
    const d = dateInput ? new Date(dateInput) : new Date();
    if (isNaN(d.getTime())) {
      return toPersianDigits(String(dateInput || 'امروز'));
    }
    const isToday = new Date().toDateString() === d.toDateString();
    const timeStr = new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);

    if (isToday) {
      return `امروز، ساعت ${timeStr}`;
    }

    const dateStr = new Intl.DateTimeFormat('fa-IR', {
      day: 'numeric',
      month: 'long',
    }).format(d);

    return `${dateStr}، ساعت ${timeStr}`;
  } catch (e) {
    return 'امروز';
  }
};

