import { toPersianDigits } from './persian';

/**
 * Centralized Quran Utility & Surah Architecture
 * Ensures unified and consistent Surah naming across the entire application.
 * All Surah names follow the standard format: "سوره [نام سوره]" (e.g., "سوره ملک", "سوره بقره", "سوره ناس").
 */

export interface ProgramCardMetaParams {
  title?: string;
  tag?: string;
  itemType?: string;
  category?: string;
  surah?: string;
  quranSegment?: string;
  topic?: string;
}

export const KNOWN_SURAHS = [
  'فاتحه', 'حمد', 'بقره', 'آل عمران', 'نساء', 'مائده', 'انعام', 'اعراف', 'انفال', 'توبه',
  'یونس', 'هود', 'یوسف', 'رعد', 'ابراهیم', 'حجر', 'نحل', 'اسراء', 'کهف', 'مریم',
  'طه', 'انبیاء', 'انبیا', 'حج', 'مؤمنون', 'مومنون', 'نور', 'فرقان', 'شعراء', 'نمل',
  'قصص', 'عنکبوت', 'روم', 'لقمان', 'سجده', 'احزاب', 'سبأ', 'سبا', 'فاطر', 'یس',
  'صافات', 'ص', 'زمر', 'غافر', 'فصلت', 'شوری', 'زخرف', 'دخان', 'جاثیه', 'احقاف',
  'محمد', 'فتح', 'حجرات', 'ق', 'ذاریات', 'طور', 'نجم', 'قمر', 'الرحمن', 'رحمن',
  'واقعه', 'حدید', 'مجادله', 'حشر', 'ممتحنه', 'صف', 'جمعه', 'منافقون', 'تغابن', 'طلاق',
  'تحریم', 'ملک', 'قلم', 'حاقه', 'معارج', 'نوح', 'جن', 'مزمل', 'مدثر', 'قیامت',
  'انسان', 'دهر', 'مرسلات', 'نبأ', 'نبا', 'نازعات', 'عبس', 'تکویر', 'انفطار', 'مطففین',
  'انشقاق', 'بروج', 'طارق', 'اعلی', 'غاشیه', 'فجر', 'بلد', 'شمس', 'لیل', 'ضحی',
  'انشراح', 'شرح', 'تین', 'علق', 'قدر', 'بینه', 'زلزله', 'زلزال', 'عادیات', 'قارعه',
  'تکاثر', 'عصر', 'همزه', 'فیل', 'قریش', 'ماعون', 'کوثر', 'کافرون', 'نصر', 'مسد',
  'توحید', 'اخلاص', 'فلق', 'ناس'
];

/**
 * Standardizes any Surah string into "سوره [نام سوره]"
 * Removes superfluous honorifics like "مبارکه", arabic prefixes like "سورة", or extra definite articles.
 *
 * Examples:
 * - "سوره مبارکه ملک" -> "سوره ملک"
 * - "سوره ملک" -> "سوره ملک"
 * - "ملک" -> "سوره ملک"
 * - "سوره مبارکه فیل" -> "سوره فیل"
 * - "سوره مبارکه بقره" -> "سوره بقره"
 * - "سورة الناس" -> "سوره ناس"
 * - "سوره مبارکه کوثر" -> "سوره کوثر"
 */
export function normalizeSurahName(raw?: string | null): string {
  if (!raw || typeof raw !== 'string') return '';
  let cleaned = raw.trim();

  // If already matches Juz format (e.g. جزء 30), keep it clean
  if (/^جزء\s*[۰-۹\d]+/i.test(cleaned)) {
    return cleaned.replace(/جزء\s*([۰-۹\d]+)/, (_, num) => `جزء ${toPersianDigits(num)}`);
  }

  // Remove common prefixes: سوره مبارکه، سوره مبارک، سورة مباركة، سورة، سوره
  cleaned = cleaned
    .replace(/^(سوره\s*مبارکه|سوره\s*مبارک|سورة\s*مبارک[ةه]|سوره\s*ی\s*مبارکه|سوره|سورة)\s*/g, '')
    .trim();

  // If starts with 'ال', remove it for clean Persian reading (e.g. الفیل -> فیل، الملک -> ملک، الناس -> ناس)
  if (cleaned.startsWith('ال') && cleaned.length > 3) {
    cleaned = cleaned.substring(2).trim();
  }

  // Normalize Arabic letters to standard Persian
  cleaned = cleaned
    .replace(/ة$/, 'ه')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .trim();

  if (!cleaned) return '';

  return `سوره ${cleaned}`;
}

/**
 * Extracts pure Surah name without "سوره" prefix (e.g. "ملک", "بقره", "ناس")
 */
export function extractPureSurahName(raw?: string | null): string {
  const normalized = normalizeSurahName(raw);
  return normalized.replace(/^سوره\s*/, '').trim();
}

/**
 * Checks if a card is a program card (and not a game card).
 */
export function isProgramCard(paramsOrTag?: string | ProgramCardMetaParams, title?: string, itemType?: string): boolean {
  if (typeof paramsOrTag === 'object' && paramsOrTag !== null) {
    const p = paramsOrTag;
    if (p.itemType === 'game') return false;
    const t = `${p.tag || ''} ${p.category || ''} ${p.title || ''}`;
    if (t.includes('بازی')) return false;
    return (
      p.itemType === 'program' ||
      t.includes('برنامه') ||
      t.includes('تحویل') ||
      t.includes('حفظ جدید') ||
      t.includes('مرور')
    );
  }
  const tag = typeof paramsOrTag === 'string' ? paramsOrTag : '';
  if (itemType === 'game' || tag.includes('بازی') || (title && title.startsWith('بازی'))) {
    return false;
  }
  return (
    itemType === 'program' ||
    tag.includes('برنامه') ||
    tag.includes('تحویل') ||
    (title ? title.includes('حفظ') || title.includes('مرور') || title.includes('تحویل') : false)
  );
}

/**
 * Standardizes program card titles (حفظ جدید، مرور دور، مرور نزدیک، تحویل):
 * - If verses are specified (e.g. آیات ۱ تا ۱۰ or آیه ۱۱):
 *     "[عمل] [آیات/آیه ...] [نام سوره بدون کلمه سوره]" (مثلاً: "مرور آیات ۱ تا ۱۰ ملک" یا "حفظ آیه ۱۱ ملک" یا "تحویل آیات ۱ تا ۵ ملک")
 * - If whole surah / no specific verse:
 *     "[عمل] سوره [نام سوره]" (مثلاً: "حفظ سوره ناس" یا "مرور سوره ملک" یا "تحویل سوره فلق")
 * - If Juz:
 *     "[عمل] جزء [شماره]" (مثلاً: "مرور جزء ۳۰" یا "تحویل جزء ۲")
 *
 * NOTE: Game cards (بازی...) are strictly kept untouched as requested.
 */
export function formatProgramCardTitle(params: ProgramCardMetaParams): string {
  // 1. Game cards are explicitly forbidden from being changed!
  if (
    params.itemType === 'game' ||
    params.tag?.includes('بازی') ||
    params.category?.includes('بازی') ||
    params.title?.startsWith('بازی')
  ) {
    return params.title || '';
  }

  // 2. Identify action: حفظ, مرور, or تحویل
  const combinedMeta = `${params.tag || ''} ${params.category || ''} ${params.title || ''}`;
  let action = 'مرور';
  if (combinedMeta.includes('حفظ جدید') || combinedMeta.includes('شروع حفظ') || combinedMeta.includes('درس روز')) {
    action = 'حفظ';
  } else if (combinedMeta.includes('تحویل')) {
    action = 'تحویل';
  } else if (combinedMeta.includes('مرور')) {
    action = 'مرور';
  } else if (params.tag?.includes('حفظ')) {
    action = 'حفظ';
  }

  // Inspect all available text
  const inspectText = `${params.quranSegment || ''} ${params.title || ''} ${params.topic || ''} ${params.surah || ''}`;

  // 3. Check for Juz (e.g. جزء 30, جزء ۲)
  const juzMatch = inspectText.match(/جزء\s*([۰-۹\d]+)/);
  if (juzMatch) {
    return `${action} جزء ${toPersianDigits(juzMatch[1])}`;
  }

  // 4. Extract pure Surah name
  let pureSurah = extractPureSurahName(params.surah);
  if (!pureSurah || pureSurah === 'آیات نورانی' || pureSurah === 'نامشخص' || pureSurah.includes('روز')) {
    for (const s of KNOWN_SURAHS) {
      const regex = new RegExp(`(^|\\s|سوره\\s*)${s}(\\s|$)`, 'i');
      if (regex.test(inspectText)) {
        pureSurah = s;
        break;
      }
    }
  }

  // 5. Detect Verses (آیات ۱ تا ۱۰, آیه ۱۱, etc.)
  let versePhrase = '';

  // Case A: Explicit verse range: "آیات ۱ تا ۱۰" or "آیه ۱ تا ۳" or "از آیه ۱ تا ۱۰"
  const rangeMatch = inspectText.match(/(?:آیات|آیه|از\s*آیه)\s*([۰-۹\d]+)\s*(?:تا|الی|-|–)\s*(?:آیه\s*)?([۰-۹\d]+)/);
  if (rangeMatch) {
    const start = toPersianDigits(rangeMatch[1]);
    const end = toPersianDigits(rangeMatch[2]);
    versePhrase = `آیات ${start} تا ${end}`;
  } else {
    // Case B: Single verse: "آیه ۱۱" or "آیه 11"
    const singleMatch = inspectText.match(/آیه\s*([۰-۹\d]+)/);
    if (singleMatch) {
      const v = toPersianDigits(singleMatch[1]);
      versePhrase = `آیه ${v}`;
    } else {
      // Case C: Arabic bracket verse numbers ﴿۱﴾ ... ﴿۵﴾
      const bracketMatches = [...inspectText.matchAll(/﴿\s*([۰-۹\d]+)\s*﴾/g)];
      if (bracketMatches.length >= 2) {
        const start = toPersianDigits(bracketMatches[0][1]);
        const end = toPersianDigits(bracketMatches[bracketMatches.length - 1][1]);
        versePhrase = `آیات ${start} تا ${end}`;
      } else if (bracketMatches.length === 1) {
        const v = toPersianDigits(bracketMatches[0][1]);
        versePhrase = `آیه ${v}`;
      }
    }
  }

  // 6. Standardized Rule:
  // "اگر قبل سوره نوشته آیات فلان تا فلان، انگاه نمیخواد بنویسی سوره ملک همین که بنویسی ملک کافیه."
  if (versePhrase && pureSurah) {
    return `${action} ${versePhrase} ${pureSurah}`;
  }

  if (pureSurah) {
    return `${action} سوره ${pureSurah}`;
  }

  if (versePhrase) {
    return `${action} ${versePhrase}`;
  }

  return params.title || `${action} قرآنی`;
}

