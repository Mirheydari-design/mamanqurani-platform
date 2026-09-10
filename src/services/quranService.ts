export interface SurahInfo {
  number: number;
  name: string;
  englishName?: string;
  persianName: string;
  numberOfAyahs: number;
  juz: number;
}

// Complete authentic list of Juz 30 Surahs (78 An-Naba to 114 An-Nas)
export const JUZ_30_SURAHS: SurahInfo[] = [
  { number: 78, name: 'النبأ', persianName: 'نبأ', numberOfAyahs: 40, juz: 30 },
  { number: 79, name: 'النازعات', persianName: 'نازعات', numberOfAyahs: 46, juz: 30 },
  { number: 80, name: 'عبس', persianName: 'عبس', numberOfAyahs: 42, juz: 30 },
  { number: 81, name: 'التکویر', persianName: 'تکویر', numberOfAyahs: 29, juz: 30 },
  { number: 82, name: 'الانفطار', persianName: 'انفطار', numberOfAyahs: 19, juz: 30 },
  { number: 83, name: 'المطففین', persianName: 'مطففین', numberOfAyahs: 36, juz: 30 },
  { number: 84, name: 'الانشقاق', persianName: 'انشقاق', numberOfAyahs: 25, juz: 30 },
  { number: 85, name: 'البروج', persianName: 'بروج', numberOfAyahs: 22, juz: 30 },
  { number: 86, name: 'الطارق', persianName: 'طارق', numberOfAyahs: 17, juz: 30 },
  { number: 87, name: 'الأعلی', persianName: 'اعلی', numberOfAyahs: 19, juz: 30 },
  { number: 88, name: 'الغاشیة', persianName: 'غاشیه', numberOfAyahs: 26, juz: 30 },
  { number: 89, name: 'الفجر', persianName: 'فجر', numberOfAyahs: 30, juz: 30 },
  { number: 90, name: 'البلد', persianName: 'بلد', numberOfAyahs: 20, juz: 30 },
  { number: 91, name: 'الشمس', persianName: 'شمس', numberOfAyahs: 15, juz: 30 },
  { number: 92, name: 'اللیل', persianName: 'لیل', numberOfAyahs: 21, juz: 30 },
  { number: 93, name: 'الضحی', persianName: 'ضحی', numberOfAyahs: 11, juz: 30 },
  { number: 94, name: 'الشرح', persianName: 'شرح (انشراح)', numberOfAyahs: 8, juz: 30 },
  { number: 95, name: 'التین', persianName: 'تین', numberOfAyahs: 8, juz: 30 },
  { number: 96, name: 'العلق', persianName: 'علق', numberOfAyahs: 19, juz: 30 },
  { number: 97, name: 'القدر', persianName: 'قدر', numberOfAyahs: 5, juz: 30 },
  { number: 98, name: 'البینة', persianName: 'بینه', numberOfAyahs: 8, juz: 30 },
  { number: 99, name: 'الزلزلة', persianName: 'زلزله', numberOfAyahs: 8, juz: 30 },
  { number: 100, name: 'العادیات', persianName: 'عادیات', numberOfAyahs: 11, juz: 30 },
  { number: 101, name: 'القارعة', persianName: 'قارعه', numberOfAyahs: 11, juz: 30 },
  { number: 102, name: 'التکاثر', persianName: 'تکاثر', numberOfAyahs: 8, juz: 30 },
  { number: 103, name: 'العصر', persianName: 'عصر', numberOfAyahs: 3, juz: 30 },
  { number: 104, name: 'الهمزة', persianName: 'همزه', numberOfAyahs: 9, juz: 30 },
  { number: 105, name: 'الفیل', persianName: 'فیل', numberOfAyahs: 5, juz: 30 },
  { number: 106, name: 'قریش', persianName: 'قریش', numberOfAyahs: 4, juz: 30 },
  { number: 107, name: 'الماعون', persianName: 'ماعون', numberOfAyahs: 7, juz: 30 },
  { number: 108, name: 'الکوثر', persianName: 'کوثر', numberOfAyahs: 3, juz: 30 },
  { number: 109, name: 'الکافرون', persianName: 'کافرون', numberOfAyahs: 6, juz: 30 },
  { number: 110, name: 'النصر', persianName: 'نصر', numberOfAyahs: 3, juz: 30 },
  { number: 111, name: 'المسد', persianName: 'مسد', numberOfAyahs: 5, juz: 30 },
  { number: 112, name: 'الإخلاص', persianName: 'توحید (اخلاص)', numberOfAyahs: 4, juz: 30 },
  { number: 113, name: 'الفلق', persianName: 'فلق', numberOfAyahs: 5, juz: 30 },
  { number: 114, name: 'الناس', persianName: 'ناس', numberOfAyahs: 6, juz: 30 },
];

// Complete list of Juz 29 Surahs (67 Al-Mulk to 77 Al-Mursalat)
export const JUZ_29_SURAHS: SurahInfo[] = [
  { number: 67, name: 'الملک', persianName: 'ملک', numberOfAyahs: 30, juz: 29 },
  { number: 68, name: 'القلم', persianName: 'قلم', numberOfAyahs: 52, juz: 29 },
  { number: 69, name: 'الحاقة', persianName: 'حاقه', numberOfAyahs: 52, juz: 29 },
  { number: 70, name: 'المعارج', persianName: 'معارج', numberOfAyahs: 44, juz: 29 },
  { number: 71, name: 'نوح', persianName: 'نوح', numberOfAyahs: 28, juz: 29 },
  { number: 72, name: 'الجن', persianName: 'جن', numberOfAyahs: 28, juz: 29 },
  { number: 73, name: 'المزمل', persianName: 'مزمل', numberOfAyahs: 20, juz: 29 },
  { number: 74, name: 'المدثر', persianName: 'مدثر', numberOfAyahs: 56, juz: 29 },
  { number: 75, name: 'القیامة', persianName: 'قیامت', numberOfAyahs: 40, juz: 29 },
  { number: 76, name: 'الإنسان', persianName: 'انسان (دهر)', numberOfAyahs: 31, juz: 29 },
  { number: 77, name: 'المرسلات', persianName: 'مرسلات', numberOfAyahs: 50, juz: 29 },
];

// Short Surahs Range (فیل تا ناس - متداول‌ترین بازه کودکان)
export const SHORT_SURAHS_FIL_TO_NAS: SurahInfo[] = JUZ_30_SURAHS.slice(
  JUZ_30_SURAHS.findIndex((s) => s.number === 105)
);

// Intermediate Short Surahs (ضحی تا ناس)
export const SHORT_SURAHS_DUHA_TO_NAS: SurahInfo[] = JUZ_30_SURAHS.slice(
  JUZ_30_SURAHS.findIndex((s) => s.number === 93)
);

// All available surahs combined
export const ALL_AVAILABLE_SURAHS: SurahInfo[] = [
  ...JUZ_29_SURAHS,
  ...JUZ_30_SURAHS,
];

/**
 * Fetch Surahs for a given Juz via free Iranian/Global API with instant local fallback
 */
export async function fetchJuzSurahs(juzNumber: number): Promise<SurahInfo[]> {
  try {
    // Attempt free API endpoint if reachable
    const res = await fetch(`https://api.alquran.cloud/v1/juz/${juzNumber}/quran-uthmani`);
    if (res.ok) {
      const data = await res.json();
      if (data?.data?.surahs) {
        const surahsMap = data.data.surahs as Record<string, { number: number; name: string; englishName: string; numberOfAyahs: number }>;
        const result: SurahInfo[] = Object.values(surahsMap).map((s) => {
          const matched = ALL_AVAILABLE_SURAHS.find((item) => item.number === s.number);
          return {
            number: s.number,
            name: s.name,
            englishName: s.englishName,
            persianName: matched?.persianName || s.name,
            numberOfAyahs: s.numberOfAyahs,
            juz: juzNumber,
          };
        });
        if (result.length > 0) return result;
      }
    }
  } catch {
    // Offline / fallback to instant verified dataset
  }

  if (juzNumber === 30) return JUZ_30_SURAHS;
  if (juzNumber === 29) return JUZ_29_SURAHS;
  return JUZ_30_SURAHS;
}

/**
 * Determine best initial surah list based on user goal or scope text
 */
export function getInitialSurahsForScope(scopeText?: string): SurahInfo[] {
  if (!scopeText) return SHORT_SURAHS_FIL_TO_NAS;
  const text = scopeText.trim();

  if (text.includes('فیل تا ناس') || text.includes('کوتاه')) {
    return SHORT_SURAHS_FIL_TO_NAS;
  }
  if (text.includes('ضحی تا ناس')) {
    return SHORT_SURAHS_DUHA_TO_NAS;
  }
  if (text.includes('جزء ۲۹') || text.includes('29')) {
    return JUZ_29_SURAHS;
  }
  if (text.includes('۳۰') || text.includes('30')) {
    return JUZ_30_SURAHS;
  }

  return SHORT_SURAHS_FIL_TO_NAS;
}
