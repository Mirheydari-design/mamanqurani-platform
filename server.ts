import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { communityDb } from "./server/communityDb";

dotenv.config();

const app = express();
app.set("trust proxy", 1);
app.use(express.json());
const PORT = parseInt(process.env.PORT || "3000", 10);

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Quran Surah Name Mapping & Verse Fetcher for Intelligent Coach Segmentation
function normalizeSurahName(raw?: string | null): string {
  if (!raw || typeof raw !== 'string') return '';
  let cleaned = raw.trim();
  cleaned = cleaned
    .replace(/^(سوره\s*مبارکه|سوره\s*مبارک|سورة\s*مبارک[ةه]|سوره\s*ی\s*مبارکه|سوره|سورة)\s*/g, '')
    .trim();
  if (cleaned.startsWith('ال') && cleaned.length > 3) {
    cleaned = cleaned.substring(2).trim();
  }
  cleaned = cleaned.replace(/ة$/, 'ه').replace(/ي/g, 'ی').replace(/ك/g, 'ک').trim();
  if (!cleaned) return '';
  return `سوره ${cleaned}`;
}

function toPersianDigits(n: number | string): string {
  const p = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(n).replace(/[0-9]/g, (w) => p[+w]);
}

const SURAH_NAME_MAP: Record<string, { number: number; name: string }> = {
  // Juz 30
  "قدر": { number: 97, name: "سوره قدر" },
  "القدر": { number: 97, name: "سوره قدر" },
  "تین": { number: 95, name: "سوره تین" },
  "التین": { number: 95, name: "سوره تین" },
  "کوثر": { number: 108, name: "سوره کوثر" },
  "الکوثر": { number: 108, name: "سوره کوثر" },
  "توحید": { number: 112, name: "سوره توحید" },
  "اخلاص": { number: 112, name: "سوره اخلاص" },
  "الإخلاص": { number: 112, name: "سوره اخلاص" },
  "ناس": { number: 114, name: "سوره ناس" },
  "الناس": { number: 114, name: "سوره ناس" },
  "فلق": { number: 113, name: "سوره فلق" },
  "الفلق": { number: 113, name: "سوره فلق" },
  "مسد": { number: 111, name: "سوره مسد" },
  "المسد": { number: 111, name: "سوره مسد" },
  "نصر": { number: 110, name: "سوره نصر" },
  "النصر": { number: 110, name: "سوره نصر" },
  "کافرون": { number: 109, name: "سوره کافرون" },
  "الکافرون": { number: 109, name: "سوره کافرون" },
  "ماعون": { number: 107, name: "سوره ماعون" },
  "الماعون": { number: 107, name: "سوره ماعون" },
  "قریش": { number: 106, name: "سوره قریش" },
  "فیل": { number: 105, name: "سوره فیل" },
  "الفیل": { number: 105, name: "سوره فیل" },
  "همزه": { number: 104, name: "سوره همزه" },
  "الهمزة": { number: 104, name: "سوره همزه" },
  "عصر": { number: 103, name: "سوره عصر" },
  "العصر": { number: 103, name: "سوره عصر" },
  "تکاثر": { number: 102, name: "سوره تکاثر" },
  "التکاثر": { number: 102, name: "سوره تکاثر" },
  "قارعه": { number: 101, name: "سوره قارعه" },
  "القارعة": { number: 101, name: "سوره قارعه" },
  "عادیات": { number: 100, name: "سوره عادیات" },
  "العادیات": { number: 100, name: "سوره عادیات" },
  "زلزله": { number: 99, name: "سوره زلزله" },
  "الزلزلة": { number: 99, name: "سوره زلزله" },
  "بینه": { number: 98, name: "سوره بینه" },
  "البینة": { number: 98, name: "سوره بینه" },
  "علق": { number: 96, name: "سوره علق" },
  "العلق": { number: 96, name: "سوره علق" },
  "شرح": { number: 94, name: "سوره شرح" },
  "الشرح": { number: 94, name: "سوره شرح" },
  "انشراح": { number: 94, name: "سوره انشراح" },
  "ضحی": { number: 93, name: "سوره ضحی" },
  "الضحی": { number: 93, name: "سوره ضحی" },
  "لیل": { number: 92, name: "سوره لیل" },
  "اللیل": { number: 92, name: "سوره لیل" },
  "شمس": { number: 91, name: "سوره شمس" },
  "الشمس": { number: 91, name: "سوره شمس" },
  "بلد": { number: 90, name: "سوره بلد" },
  "البلد": { number: 90, name: "سوره بلد" },
  "فجر": { number: 89, name: "سوره فجر" },
  "الفجر": { number: 89, name: "سوره فجر" },
  "غاشیه": { number: 88, name: "سوره غاشیه" },
  "الغاشیة": { number: 88, name: "سوره غاشیه" },
  "اعلی": { number: 87, name: "سوره اعلی" },
  "الأعلی": { number: 87, name: "سوره اعلی" },
  "طارق": { number: 86, name: "سوره طارق" },
  "الطارق": { number: 86, name: "سوره طارق" },
  "بروج": { number: 85, name: "سوره بروج" },
  "البروج": { number: 85, name: "سوره بروج" },
  "انشقاق": { number: 84, name: "سوره انشقاق" },
  "الانشقاق": { number: 84, name: "سوره انشقاق" },
  "مطففین": { number: 83, name: "سوره مطففین" },
  "المطففین": { number: 83, name: "سوره مطففین" },
  "انفطار": { number: 82, name: "سوره انفطار" },
  "الانفطار": { number: 82, name: "سوره انفطار" },
  "تکویر": { number: 81, name: "سوره تکویر" },
  "التکویر": { number: 81, name: "سوره تکویر" },
  "عبس": { number: 80, name: "سوره عبس" },
  "نازعات": { number: 79, name: "سوره نازعات" },
  "النازعات": { number: 79, name: "سوره نازعات" },
  "نبا": { number: 78, name: "سوره نبأ" },
  "نبأ": { number: 78, name: "سوره نبأ" },
  "النبأ": { number: 78, name: "سوره نبأ" },
  // Common Out-of-Scope / Popular Surahs
  "واقعه": { number: 56, name: "سوره واقعه" },
  "الواقعه": { number: 56, name: "سوره واقعه" },
  "الواقعة": { number: 56, name: "سوره واقعه" },
  "رحمن": { number: 55, name: "سوره رحمن" },
  "الرحمن": { number: 55, name: "سوره رحمن" },
  "یس": { number: 36, name: "سوره یس" },
  "یسین": { number: 36, name: "سوره یس" },
  "ملک": { number: 67, name: "سوره ملک" },
  "الملک": { number: 67, name: "سوره ملک" },
  "قلم": { number: 68, name: "سوره قلم" },
  "القلم": { number: 68, name: "سوره قلم" },
  "جمعه": { number: 62, name: "سوره جمعه" },
  "الجمعة": { number: 62, name: "سوره جمعه" },
  "منافقون": { number: 63, name: "سوره منافقون" },
  "صف": { number: 61, name: "سوره صف" },
  "حشر": { number: 59, name: "سوره حشر" },
  "حدید": { number: 57, name: "سوره حدید" },
  "کهف": { number: 18, name: "سوره کهف" },
  "الکهف": { number: 18, name: "سوره کهف" },
  "مریم": { number: 19, name: "سوره مریم" },
  "طه": { number: 20, name: "سوره طه" },
  "یوسف": { number: 12, name: "سوره یوسف" },
  "انسان": { number: 76, name: "سوره انسان" },
  "دهر": { number: 76, name: "سوره انسان" },
  "فاتحه": { number: 1, name: "سوره حمد" },
  "حمد": { number: 1, name: "سوره حمد" },
  "بقره": { number: 2, name: "سوره بقره" },
  "البقرة": { number: 2, name: "سوره بقره" }
};

const surahVerseCache = new Map<number, { name: string; ayahs: { numberInSurah: number; text: string }[] }>();

async function fetchSurahVerses(surahNumber: number) {
  if (surahVerseCache.has(surahNumber)) {
    return surahVerseCache.get(surahNumber)!;
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data: any = await res.json();
      if (data?.data?.ayahs) {
        const ayahs = data.data.ayahs.map((a: any) => {
          let t = a.text || "";
          if (a.numberInSurah === 1 && t.startsWith("بِّسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ")) {
            t = t.replace("بِّسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ", "").trim();
          }
          return {
            numberInSurah: a.numberInSurah,
            text: t,
          };
        });
        const result = { name: data.data.name, ayahs };
        surahVerseCache.set(surahNumber, result);
        return result;
      }
    }
  } catch (err) {
    console.warn("Could not fetch surah verses from API, will use fallback:", err);
  }
  return null;
}

function detectSurahFromText(text: string, progressSummary?: string): { number: number; name: string } {
  const clean = text.toLowerCase();
  for (const [key, val] of Object.entries(SURAH_NAME_MAP)) {
    if (clean.includes(key.toLowerCase())) {
      return val;
    }
  }
  if (progressSummary) {
    const progClean = progressSummary.toLowerCase();
    for (const [key, val] of Object.entries(SURAH_NAME_MAP)) {
      if (progClean.includes(key.toLowerCase())) {
        return val;
      }
    }
  }
  // Default to Surah Qadr if unspecified
  return { number: 97, name: "سوره قدر" };
}

/**
 * 1. Hardcoded Quran Segmentation Rule (فرمول تقطیع آیات):
 * - 3 years old: 3 words per segment
 * - 4 years old: 4 words per segment
 * - 5 years old: 5 words per segment
 * - 6+ years old: 1 whole ayah (unless > 16 words, then divided in 2 parts)
 */
function segmentVersesByAge(
  ayahs: { numberInSurah: number; text: string }[],
  childAge: number
): { segmentIndex: number; ayahNumber: number; text: string; wordsCount: number }[] {
  const age = Number(childAge) || 5;
  const segments: { segmentIndex: number; ayahNumber: number; text: string; wordsCount: number }[] = [];
  let segIndex = 1;

  for (const ayah of ayahs) {
    const rawWords = ayah.text.trim().split(/\s+/).filter(Boolean);
    if (rawWords.length === 0) continue;

    if (age <= 3) {
      const wordsPerSeg = 3;
      for (let i = 0; i < rawWords.length; i += wordsPerSeg) {
        const slice = rawWords.slice(i, i + wordsPerSeg);
        const isLastInAyah = i + wordsPerSeg >= rawWords.length;
        const textWithAyah = slice.join(' ') + (isLastInAyah ? ` ﴿${toPersianDigits(ayah.numberInSurah)}﴾` : '');
        segments.push({
          segmentIndex: segIndex++,
          ayahNumber: ayah.numberInSurah,
          text: textWithAyah,
          wordsCount: slice.length
        });
      }
    } else if (age === 4) {
      const wordsPerSeg = 4;
      for (let i = 0; i < rawWords.length; i += wordsPerSeg) {
        const slice = rawWords.slice(i, i + wordsPerSeg);
        const isLastInAyah = i + wordsPerSeg >= rawWords.length;
        const textWithAyah = slice.join(' ') + (isLastInAyah ? ` ﴿${toPersianDigits(ayah.numberInSurah)}﴾` : '');
        segments.push({
          segmentIndex: segIndex++,
          ayahNumber: ayah.numberInSurah,
          text: textWithAyah,
          wordsCount: slice.length
        });
      }
    } else if (age === 5) {
      const wordsPerSeg = 5;
      for (let i = 0; i < rawWords.length; i += wordsPerSeg) {
        const slice = rawWords.slice(i, i + wordsPerSeg);
        const isLastInAyah = i + wordsPerSeg >= rawWords.length;
        const textWithAyah = slice.join(' ') + (isLastInAyah ? ` ﴿${toPersianDigits(ayah.numberInSurah)}﴾` : '');
        segments.push({
          segmentIndex: segIndex++,
          ayahNumber: ayah.numberInSurah,
          text: textWithAyah,
          wordsCount: slice.length
        });
      }
    } else {
      // 6 years and above: 1 whole ayah unless > 16 words (divided in 2)
      if (rawWords.length > 16) {
        const mid = Math.ceil(rawWords.length / 2);
        const part1 = rawWords.slice(0, mid).join(' ');
        const part2 = rawWords.slice(mid).join(' ') + ` ﴿${toPersianDigits(ayah.numberInSurah)}﴾`;
        segments.push({
          segmentIndex: segIndex++,
          ayahNumber: ayah.numberInSurah,
          text: part1,
          wordsCount: mid
        });
        segments.push({
          segmentIndex: segIndex++,
          ayahNumber: ayah.numberInSurah,
          text: part2,
          wordsCount: rawWords.length - mid
        });
      } else {
        const textWithAyah = rawWords.join(' ') + ` ﴿${toPersianDigits(ayah.numberInSurah)}﴾`;
        segments.push({
          segmentIndex: segIndex++,
          ayahNumber: ayah.numberInSurah,
          text: textWithAyah,
          wordsCount: rawWords.length
        });
      }
    }
  }

  return segments;
}

/**
 * 2. Hardcoded Review Logic (فرمول مرور نزدیک و دور):
 * - مرور نزدیک: دقیقاً شامل ۱۰ درس (قطعه) آخری است که کودک حفظ کرده.
 * - مرور دور: محفوظاتی که از زمان حفظشان بیش از ۱۰ درس گذشته است (تقسیم بر ۷ یا ۱۰ برای سهمیه امروز).
 */
function calculateReviewQuota(recentSavedPrograms: any[]) {
  const memorized = (Array.isArray(recentSavedPrograms) ? recentSavedPrograms : []).filter((p: any) =>
    p.category?.includes('حفظ') || p.title?.includes('حفظ') || p.tag?.includes('حفظ')
  );

  // Near review: last 10 lessons
  const nearReviewSegments = memorized.slice(-10);

  // Far review: older than 10 lessons
  const farReviewPool = memorized.slice(0, Math.max(0, memorized.length - 10));
  const farReviewCount = farReviewPool.length > 0 ? Math.max(1, Math.ceil(farReviewPool.length / 7)) : 0;
  const farReviewToday = farReviewPool.slice(0, farReviewCount);

  return {
    nearReviewSegments,
    farReviewToday,
    totalMemorizedLessons: memorized.length
  };
}

/**
 * 4. Pedagogical steps for new memorization:
 * - If childAge < 7: 'نوشتن برای یادگاری' is strictly omitted.
 */
function getPedagogicalSteps(childAge: number): string[] {
  const age = Number(childAge) || 5;
  const baseSteps = [
    'نگاه دوربینی (تصویربرداری ذهنی): صوت ترتیل استاد را ۵ بار با آرامش پخش کنید. دلبندتان هم‌زمان با نشانگر یا نوک انگشت زیر کلمات ببرد و با تمام دقت و تمرکز به خط و اعراب نگاه کند تا تصویر آیه در ذهن او نقش ببندد.',
    'زمزمه زنبوری (فعال‌سازی سه‌گانه): صوت ۵ بار دیگر پخش شود؛ این بار کودک با صدایی بسیار آرام در گلو همگام با صوت زمزمه کند تا سه حس بینایی، شنوایی و گویایی هم‌زمان درگیر و فعال شوند.',
    'قایم‌موشکی (آمادگی تسلط): صوت ۵ بار پخش شود؛ این بار کودک نیمه از حفظ و نیمه با نگاه به قرآن کلمات را همراهی کند تا شیرینی تسلط بر کلمات را تجربه کند.',
    'تلاش شیرین (تلاوت مستقل از حفظ): صوت را متوقف کنید؛ اکنون از کودک بخواهید با طمأنینه و ترتیل زیبا، کل این قطعه را مستقل از حفظ برای شما بخواند و او را صمیمانه در آغوش گرفته و تشویق کنید.',
    'نخ کردن مرواریدها (پیوستگی آیات): این قطعه جدید را مانند دانه‌ای از تسبیح یا گردنبند مروارید، به آیات قبلی وصل کنید و از ابتدای سوره تا پایان این قطعه را متصل و روان با هم تلاوت نمایید.',
    'نوشتن برای یادگاری (تثبیت دیداری و حرکتی): از کودک بخواهید این آیه یا قطعه زیبا را یک بار با خط قشنگش در دفترچه یادگاری بنویسد تا برای همیشه در حافظه حرکتی و دیداری او ماندگار شود.',
    'هدیه ثواب (پیوند معنوی و عاطفی): در پایان دست پرمهرش را روی سینه بگذارد و با قلبی شادمان زمزمه کنید: «یا صاحب‌الزمان (عج)، ثواب این تلاوت زیبا و نورانی هدیه به قلب پاک و مهربان شما!»'
  ];

  if (age < 7) {
    return baseSteps.filter(s => !s.startsWith('نوشتن برای یادگاری'));
  }
  return baseSteps;
}

// Smart Quran Coach & Plan/Game Generator API Endpoint (Agentic Workflow)
app.post("/api/gemini/coach", async (req, res) => {
  try {
    const {
      userPrompt,
      childName,
      childAge,
      childGoal,
      memorizationScope,
      categoryType,
      childProgress,
      childSurahProgress,
      recentSavedPrograms
    } = req.body;

    if (!userPrompt || typeof userPrompt !== "string") {
      return res.status(400).json({ error: "لطفاً توضیحات شرایط فرزندتان را بنویسید." });
    }

    const age = Number(childAge) || 5;
    const name = childName || "کودک";

    // 1. Detect Surah
    let detectedSurah = detectSurahFromText(userPrompt, childProgress || memorizationScope);

    // 2. Check if this is an out-of-scope surah (مدیریت پراگرسبار و سوره‌های خارج از برنامه)
    const existingScope = `${memorizationScope || ''} ${childProgress || ''} ${(Array.isArray(childSurahProgress) ? childSurahProgress.map((p: any) => p.surah).join(' ') : '')}`.toLowerCase();
    const isOutOfScope = !existingScope.includes(detectedSurah.name.replace('سوره', '').trim().toLowerCase());

    // 3. Fetch verses & Hardcoded Segmentation (تقطیع آیات در سرور)
    const versesData = await fetchSurahVerses(detectedSurah.number);
    let allAyahs = versesData?.ayahs || [];
    if (allAyahs.length === 0) {
      // Fallback ayahs for default surah
      allAyahs = [
        { numberInSurah: 1, text: "إِنَّآ أَنزَلْنَٰهُ فِى لَيْلَةِ ٱلْقَدْرِ" },
        { numberInSurah: 2, text: "وَمَآ أَدْرَىٰكَ مَا لَيْلَةُ ٱلْقَدْرِ" },
        { numberInSurah: 3, text: "لَيْلَةُ ٱلْقَدْرِ خَيْرٌۭ مِّنْ أَلْفِ شَهْرٍۢ" },
        { numberInSurah: 4, text: "تَنَزَّلُ ٱلْمَلَٰٓئِكَةُ وَٱلرُّوحُ فِيهَا بِإِذْنِ رَبِّهِم مِّن كُلِّ أَمْرٍۢ" },
        { numberInSurah: 5, text: "سَلَٰمٌ هِىَ حَتَّىٰ مَطْلَعِ ٱلْفَجْرِ" }
      ];
    }

    // Execute server segmentation based on child's exact age
    const segmentedItems = segmentVersesByAge(allAyahs, age);

    // Find progress continuation from recentSavedPrograms
    let lastSegmentIndex = 0;
    if (Array.isArray(recentSavedPrograms) && recentSavedPrograms.length > 0) {
      const lastNewMem = [...recentSavedPrograms].reverse().find((p: any) =>
        (p.category?.includes('حفظ جدید') || p.tag?.includes('حفظ جدید') || p.title?.includes('حفظ جدید')) &&
        (p.surah?.includes(detectedSurah.name.replace('سوره', '').trim()) || detectedSurah.name.includes(p.surah))
      );
      if (lastNewMem) {
        const segText = lastNewMem.quranSegment || '';
        const foundIdx = segmentedItems.findIndex(s => segText.includes(s.text.slice(0, 10)) || s.text.includes(segText.slice(0, 10)));
        if (foundIdx !== -1) {
          lastSegmentIndex = foundIdx + 1;
        }
      }
    }

    // Determine segments for Day 1 (امروز), Day 2 (فردا), Day 3 (پس‌فردا)
    const segDay1 = segmentedItems[lastSegmentIndex % segmentedItems.length]?.text || segmentedItems[0].text;
    const segDay2 = segmentedItems[(lastSegmentIndex + 1) % segmentedItems.length]?.text || segDay1;
    const segDay3 = segmentedItems[(lastSegmentIndex + 2) % segmentedItems.length]?.text || segDay2;

    // 4. Hardcoded Review Quotas
    const reviewStats = calculateReviewQuota(recentSavedPrograms);
    const nearReviewText = reviewStats.nearReviewSegments.length > 0
      ? reviewStats.nearReviewSegments.map((s, i) => `${i + 1}. سوره: ${s.surah || detectedSurah.name} | قطعه: «${s.quranSegment || s.subtitle || 'درس قبلی'}»`).join('\n')
      : `۱۰ درس اخیر سوره ${detectedSurah.name} (آیات ۱ تا ۱۰)`;

    const farReviewText = reviewStats.farReviewToday.length > 0
      ? reviewStats.farReviewToday.map((s, i) => `${i + 1}. سوره: ${s.surah || detectedSurah.name} | قطعه: «${s.quranSegment || s.subtitle || 'محفوظات قبلی'}»`).join('\n')
      : `سهمیه مرور دور امروز: محفوظات قدیمی‌تر سوره ${detectedSurah.name}`;

    // Exact System Prompt mandated in requirements
    const systemPrompt = `شما یک مشاور، روانشناس کودک و متخصص خلاق در آموزش و حفظ قرآن به کودکان هستید. مخاطب شما مادران هستند. لحن شما باید صمیمی، آرامش‌بخش، علمی و همدلانه باشد.
وظیفه اصلی (Intent Router):
شما باید هر پیامی که مادر می‌نویسد را تحلیل کنید. مادر ممکن است فقط درد دل کند، سوال تربیتی بپرسد، درخواست برنامه کند، یا بگوید کودک در سوره خاصی مشکل دارد. شما باید بر اساس نیت مادر، تصمیم بگیرید که آیا فقط به او مشاوره متنی بدهید، یا کارت «برنامه» و «بازی» تولید کنید.
قوانین تولید پاسخ:
۱. پاسخگویی به همه سوالات (General Chat): اگر مادر سوالی خارج از برنامه پرسید (مثلاً "چطور کودکم را تشویق کنم؟")، نیازی به تولید کارت نیست. فقط در فیلد generalAdvice پاسخی کامل، علمی و همدلانه ارائه دهید و آرایه cards را خالی بگذارید.
۲. تشخیص مشکلات و ارائه راه‌حل (Troubleshooting): اگر مادر گفت کودک سوره‌ای را فراموش کرده یا یادش نمی‌ماند (مثلاً "سوره فیل رو قاطی میکنه")، شما باید تشخیص دهید که کودک نیاز به مرور دارد. در این حالت یک کارت «بازی مرور» یا «بازی تحویل» برای آن سوره خاص تولید کنید.
۳. طراحی بازی‌های به شدت خلاقانه (Game Design Rules):
* بازی‌ها نباید خسته‌کننده یا صرفاً پرسش و پاسخ متنی باشند.
* بازی باید سناریو محور باشد (مثلاً بازی پرندگان نگهبان برای سوره فیل).
* از مکانیزم‌های متنوع استفاده کنید: بازی‌های حرکتی (پریدن، دویدن)، حسی (استفاده از خمیر، لمس کردن)، صداسازی (تغییر لحن، رادیو بازی)، و نقش‌آفرینی.
* مهم: برای کودکان زیر ۷ سال، استفاده از گوشی، تبلت، نقاشی کشیدن و نوشتن در بازی مطلقاً ممنوع است. بازی باید کاملاً فیزیکی، شنیداری و دیداری در محیط خانه باشد.
* بازی باید طوری طراحی شود که مادر بعد از راه‌اندازی بتواند کودک را رها کرده و تماشا کند.

۴. ساختار کارت‌های برنامه (Program Cards):
* شما نیازی به تولید مراحل حفظ (نگاه دوربینی، زنبوری و...) ندارید. این موارد ثابت هستند. فقط نام سوره، نوع تگ و قطعه قرآن (که در کانتکست به شما داده شده) را مشخص کنید.

۵. ممنوعیت‌های متنی:
* به هیچ عنوان از عباراتی مثل "روز ۱"، "امروز"، "فردا" در خروجی استفاده نکنید.
* به هیچ عنوان خودتان آیات قرآن را تقطیع نکنید؛ فقط از فیلد quranSegment که سرور به شما می‌دهد استفاده کنید.

تگ‌های مجاز برای کارت‌ها (فقط یکی از این موارد):
* برنامه حفظ جدید
* برنامه مرور نزدیک
* برنامه مرور دور
* تحویل حفظ
* بازی حفظ جدید
* بازی مرور
* بازی تحویل`;

    const userContextPrompt = `مشخصات کودک:
- نام: ${name}
- سن: ${age} سال (${age < 7 ? 'زیر ۷ سال: ممنوعیت گوشی/تبلت/نقاشی/نوشتن در بازی' : '۷ سال به بالا'})
- سوره: ${detectedSurah.name}
${isOutOfScope ? `- سوره درخواستی جدید/خارج از برنامه است (پراگرسبار مستقل ۰٪ برایش ایجاد می‌شود).` : ''}

قطعات قرآنی آماده‌شده توسط سرور (دقیقاً بر اساس فرمول سنی ${age} سال):
- قطعه اول (درس جدید): «${segDay1}»
- قطعه دوم (ادامه درس): «${segDay2}»
- قطعه سوم (ادامه درس): «${segDay3}»

سوابق مرور محاسبه‌شده توسط سرور:
- مرور نزدیک (۱۰ درس اخیر):
${nearReviewText}

- مرور دور (سهمیه امروز تقسیم بر ۷ یا ۱۰):
${farReviewText}

متن پیام مادر:
"${userPrompt}"

دستور ویژه به عنوان Intent Router:
نیت پیام مادر را دقیقاً تشخیص دهید:
- اگر درد دل، سوال عمومی، راهنمایی تربیتی یا تشویق است -> intent_detected را 'chat_only' بگذارید، generalAdvice را کامل و دلسوزانه بنویسید و cards را خالی [] قرار دهید.
- اگر کودک با سوره‌ای مشکل دارد یا فراموش کرده (مثلاً سوره فیل رو قاطی میکنه) -> intent_detected را 'troubleshooting' بگذارید و یک کارت «بازی مرور» یا «بازی تحویل» خلاقانه طراحی کنید.
- اگر درخواست بازی کرد -> intent_detected را 'request_game' بگذارید و کارت‌های بازی خلاقانه بدون نوشتن/گوشی برگردانید.
- اگر درخواست برنامه روتین یا حفظ کرد -> intent_detected را 'request_program' بگذارید و از قطعات فوق استفاده نمایید.`;

    if (ai) {
      const CANDIDATE_MODELS = [
        "gemini-3-flash-preview",
        "gemini-3.1-flash-lite",
        "gemini-2.5-flash"
      ];

      for (const model of CANDIDATE_MODELS) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: userContextPrompt,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  intent_detected: {
                    type: Type.STRING,
                    enum: ["chat_only", "request_program", "request_game", "troubleshooting"],
                    description: "نیت تشخیص داده شده مادر از پیام"
                  },
                  generalAdvice: {
                    type: Type.STRING,
                    description: "پاسخ متنی، مشاوره، یا پیام محبت‌آمیز مربی به مادر بر اساس پیام او."
                  },
                  cards: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        itemType: {
                          type: Type.STRING,
                          enum: ["program", "game"],
                          description: "برابر با program یا game"
                        },
                        tag: {
                          type: Type.STRING,
                          enum: [
                            "برنامه حفظ جدید",
                            "برنامه مرور نزدیک",
                            "برنامه مرور دور",
                            "تحویل حفظ",
                            "بازی حفظ جدید",
                            "بازی مرور",
                            "بازی تحویل"
                          ],
                          description: "یکی از ۷ تگ استاندارد"
                        },
                        surah: {
                          type: Type.STRING,
                          description: "نام سوره"
                        },
                        quranSegment: {
                          type: Type.STRING,
                          description: "متن عربی آیه که از سرور دریافت شده است"
                        },
                        gameDetails: {
                          type: Type.OBJECT,
                          properties: {
                            title: { type: Type.STRING, description: "عنوان جذاب و داستانی (فقط برای بازی)" },
                            materials: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING },
                              description: "لیست وسایل فیزیکی ساده در خانه"
                            },
                            steps: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING },
                              description: "مراحل گام‌به‌گام و خلاقانه بازی فیزیکی"
                            },
                            duration: { type: Type.STRING, description: "مدت زمان فعالیت (مثلاً ۱۰ دقیقه)" }
                          },
                          description: "جزئیات بازی (فقط برای بازی‌ها)"
                        }
                      },
                      required: ["itemType", "tag", "surah", "quranSegment"]
                    }
                  }
                },
                required: ["intent_detected", "generalAdvice", "cards"]
              }
            }
          });

          if (response.text) {
            const parsed = JSON.parse(response.text);
            if (parsed) {
              const detectedIntent = parsed.intent_detected || 'request_program';
              const isChatOnly = detectedIntent === 'chat_only' || (!parsed.cards || parsed.cards.length === 0);

              if (isChatOnly) {
                return res.json({
                  intent_detected: 'chat_only',
                  generalAdvice: parsed.generalAdvice || `مادر عزیز ${name}، با تشویق و صبر می‌توانید انگیزه‌ای مضاعف در کودک دلبندتان ایجاد کنید.`,
                  cards: [],
                  tokensUsed: response.usageMetadata?.totalTokenCount || 1200
                });
              }

              // Sanitize and format cards
              const formattedCards = parsed.cards.map((c: any, idx: number) => {
                const isProg = c.itemType === 'program' || c.tag?.startsWith('برنامه');
                const dayNum = (idx % 3) + 1;
                const dayLabel = dayNum === 1 ? 'امروز' : dayNum === 2 ? 'فردا' : 'پس‌فردا';
                const cleanSurah = normalizeSurahName(c.surah) || detectedSurah.name;
                const assignedSegment = c.quranSegment || (dayNum === 1 ? segDay1 : dayNum === 2 ? segDay2 : segDay3);

                if (isProg) {
                  const progTitle = c.tag === 'برنامه حفظ جدید'
                    ? 'برنامه حفظ جدید'
                    : c.tag === 'برنامه مرور نزدیک'
                    ? `مرور نزدیک ${cleanSurah.replace('سوره', '').trim()}`
                    : c.tag === 'برنامه مرور دور'
                    ? `مرور دور ${cleanSurah.replace('سوره', '').trim()}`
                    : `تحویل ${cleanSurah.replace('سوره', '').trim()}`;

                  return {
                    id: `card_${Date.now()}_${idx}`,
                    title: progTitle,
                    surah: cleanSurah,
                    topic: '',
                    quranSegment: assignedSegment,
                    description: '',
                    materials: [],
                    // Step 4: omit writing step if age < 7
                    steps: getPedagogicalSteps(age),
                    duration: '۱۰ الی ۱۵ دقیقه',
                    ageRange: `${toPersianDigits(age)} سال`,
                    tag: c.tag || 'برنامه حفظ جدید',
                    itemType: 'program',
                    dayNumber: dayNum,
                    dayLabel
                  };
                }

                // Game Card
                const gameInfo = c.gameDetails || {};
                let cleanGameTitle = (gameInfo.title || c.title || 'بازی مرور و یادگیری').replace(/^روز\s*(چهارم|پنجم|ششم|[۰-۹]+|\d+)\s*[:\-–]\s*/i, '').trim();

                return {
                  id: `card_${Date.now()}_${idx}`,
                  title: cleanGameTitle,
                  surah: cleanSurah,
                  topic: '',
                  quranSegment: assignedSegment,
                  description: '',
                  materials: Array.isArray(gameInfo.materials) ? gameInfo.materials : [],
                  steps: Array.isArray(gameInfo.steps) && gameInfo.steps.length > 0 ? gameInfo.steps : ['اجرای بازی شاد با کودک در خانه'],
                  duration: gameInfo.duration || '۱۰ دقیقه',
                  ageRange: `${toPersianDigits(age)} سال`,
                  tag: c.tag || 'بازی مرور',
                  itemType: 'game',
                  dayNumber: dayNum,
                  dayLabel
                };
              });

              return res.json({
                intent_detected: detectedIntent,
                generalAdvice: parsed.generalAdvice,
                cards: formattedCards,
                newSurahScope: isOutOfScope ? { surah: detectedSurah.name, progress: 0, status: 'learning' } : undefined,
                tokensUsed: response.usageMetadata?.totalTokenCount || 2100
              });
            }
          }
        } catch (modelErr: any) {
          console.warn(`Model ${model} attempt failed:`, modelErr?.message?.slice(0, 100));
        }
      }
    }

    // Hardcoded Tailored Fallback (Agentic Logic when AI unreachable)
    const promptLower = userPrompt.toLowerCase();
    const isChatOnlyPrompt = (
      promptLower.includes('چطور') ||
      promptLower.includes('خسته') ||
      promptLower.includes('انگیزه') ||
      promptLower.includes('تشویق') ||
      promptLower.includes('درد دل') ||
      promptLower.includes('بی حوصله')
    ) && !promptLower.includes('برنامه') && !promptLower.includes('بازی');

    const isTroublePrompt = promptLower.includes('قاطی') || promptLower.includes('فراموش') || promptLower.includes('یادش نمی');
    const isGameOnlyPrompt = promptLower.includes('فقط بازی') || promptLower.includes('یک بازی');

    if (isChatOnlyPrompt) {
      return res.json({
        intent_detected: 'chat_only',
        generalAdvice: `مادر دلسوز و مهربان ${name} عزیز، خستگی یا بی‌حوصلگی کودک در این سن کاملاً طبیعی است. کودکان با بازی و نشاط می‌آموزند. آموزش قرآن را به جلسات بسیار کوتاه ۵ تا ۱۰ دقیقه‌ای تبدیل کنید و هرگز اجبار نکنید. همراهی عاشقانه شما بهترین انگیزه برای دلبندتان است.`,
        cards: [],
        tokensUsed: 1200
      });
    }

    const fallbackCards: any[] = [];
    let detectedIntent: 'chat_only' | 'request_program' | 'request_game' | 'troubleshooting' = 'request_program';

    if (isTroublePrompt) {
      detectedIntent = 'troubleshooting';
      fallbackCards.push({
        id: `card_${Date.now()}_trouble`,
        title: `بازی پرندگان نگهبان و سنگریزه‌های ابابیل`,
        surah: detectedSurah.name,
        topic: 'تثبیت و تسلط آسان',
        quranSegment: segDay1,
        description: 'یک بازی تحرکی جذاب در خانه برای تسلط کامل بر سوره.',
        materials: ['چند عدد بالشت کوچک به عنوان سنگ‌های نرم'],
        steps: [
          `چیدن بالشت‌ها روی فرش به عنوان ایستگاه‌های امن`,
          `خواندن یک قطعه از سوره و پریدن کودک روی بالشت بعدی`,
          `در آغوش گرفتن کودک و ثبت امتیاز ستاره طلایی در پایان سوره`
        ],
        duration: '۱۰ دقیقه',
        ageRange: `${toPersianDigits(age)} سال`,
        tag: 'بازی مرور',
        itemType: 'game',
        dayNumber: 1,
        dayLabel: 'امروز'
      });
    } else if (isGameOnlyPrompt) {
      detectedIntent = 'request_game';
      fallbackCards.push({
        id: `card_${Date.now()}_game`,
        title: `بازی قطار کلمات نورانی`,
        surah: detectedSurah.name,
        topic: 'بازی پرنشاط حرکتی',
        quranSegment: segDay1,
        description: 'بازی حرکتی نوبتی برای هماهنگی کلمات و تثبیت حافظه شنیداری.',
        materials: ['فضای اتاق'],
        steps: [
          `مادر و ${name} مثل واگن‌های قطار پشت سر هم می‌ایستند`,
          `با هر کلمه آیه یک قدم به جلو حرکت می‌کنند`,
          `با رسیدن به پایان قطعه صدای شاد قطار درمی‌آورند`
        ],
        duration: '۸ دقیقه',
        ageRange: `${toPersianDigits(age)} سال`,
        tag: 'بازی حفظ جدید',
        itemType: 'game',
        dayNumber: 1,
        dayLabel: 'امروز'
      });
    } else {
      detectedIntent = 'request_program';
      // 3-day routine with server segmentation & omitted writing for under 7
      fallbackCards.push({
        id: `card_${Date.now()}_1`,
        title: 'برنامه حفظ جدید',
        surah: detectedSurah.name,
        topic: '',
        quranSegment: segDay1,
        description: '',
        materials: [],
        steps: getPedagogicalSteps(age),
        duration: '۱۰ الی ۱۵ دقیقه',
        ageRange: `${toPersianDigits(age)} سال`,
        tag: 'برنامه حفظ جدید',
        itemType: 'program',
        dayNumber: 1,
        dayLabel: 'امروز'
      });

      fallbackCards.push({
        id: `card_${Date.now()}_2`,
        title: `بازی پرتاب توپ و شکار کلمات`,
        surah: detectedSurah.name,
        topic: '',
        quranSegment: segDay1,
        description: 'تثبیت شاداب قطعه اول با تحرک بدنی.',
        materials: ['یک توپ نرم یا عروسک کوچک'],
        steps: [
          `پرتاب توپ به سمت ${name} و گفتن کلمه اول`,
          `پاس دادن توپ توسط کودک و تکرار کلمه دوم`,
          `تکمیل کل قطعه و تکبیر کودکانه`
        ],
        duration: '۸ دقیقه',
        ageRange: `${toPersianDigits(age)} سال`,
        tag: 'بازی حفظ جدید',
        itemType: 'game',
        dayNumber: 1,
        dayLabel: 'امروز'
      });

      fallbackCards.push({
        id: `card_${Date.now()}_3`,
        title: 'برنامه حفظ جدید',
        surah: detectedSurah.name,
        topic: '',
        quranSegment: segDay2,
        description: '',
        materials: [],
        steps: getPedagogicalSteps(age),
        duration: '۱۰ الی ۱۵ دقیقه',
        ageRange: `${toPersianDigits(age)} سال`,
        tag: 'برنامه حفظ جدید',
        itemType: 'program',
        dayNumber: 2,
        dayLabel: 'فردا'
      });
    }

    return res.json({
      intent_detected: detectedIntent,
      generalAdvice: `مادر صبور و پرمهر ${name} عزیز، آموزش قرآن به کودک دلبندتان باید با لبخند، بازی و آرامش همراه باشد. زمان هر جلسه را کوتاه نگه دارید و هر تلاش کودک را با عشق و محبت ستایش کنید.`,
      cards: fallbackCards,
      newSurahScope: isOutOfScope ? { surah: detectedSurah.name, progress: 0, status: 'learning' } : undefined,
      tokensUsed: 1800
    });
  } catch (error: any) {
    console.error("Coach Route error:", error);
    res.status(500).json({ error: "خطایی در پردازش رخ داد. لطفاً دوباره تلاش کنید." });
  }
});

// Link Preview / Image Metadata Extractor for Books and Products
const previewCache = new Map<string, { imageUrl: string | null; title?: string }>();

app.get("/api/link-preview", async (req, res) => {
  try {
    const rawUrl = req.query.url as string;
    if (!rawUrl || typeof rawUrl !== "string") {
      return res.status(400).json({ error: "URL is required" });
    }

    if (previewCache.has(rawUrl)) {
      return res.json(previewCache.get(rawUrl));
    }

    // If it's already an image URL
    if (/\.(jpe?g|png|webp|gif|svg)(\?.*)?$/i.test(rawUrl)) {
      const result = { imageUrl: rawUrl };
      previewCache.set(rawUrl, result);
      return res.json(result);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(rawUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    clearTimeout(timeout);

    const html = await response.text();

    // 1. Check og:image or twitter:image
    const ogMatch = html.match(/<meta\s+(?:property|name)=["'](?:og:image|twitter:image)["']\s+content=["']([^"']+)["']/i) ||
                    html.match(/content=["']([^"']+)["']\s+(?:property|name)=["'](?:og:image|twitter:image)["']/i);
    
    let imageUrl = ogMatch ? ogMatch[1] : null;

    // 2. If no og:image or generic logo, look for content image
    if (!imageUrl || imageUrl.includes('logo') || imageUrl.endsWith('.svg')) {
      const imgMatches = Array.from(html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)).map(m => m[1]);
      const productImg = imgMatches.find(src => 
        (src.includes('upload') || src.includes('product') || src.includes('content') || src.includes('cover') || src.includes('book')) &&
        /\.(jpe?g|png|webp)/i.test(src) && !src.includes('logo')
      );
      if (productImg) {
        imageUrl = productImg;
      }
    }

    // Resolve relative URLs
    if (imageUrl && !imageUrl.startsWith('http')) {
      try {
        const base = new URL(rawUrl);
        imageUrl = new URL(imageUrl, base).toString();
      } catch (e) {
        // ignore
      }
    }

    const result = { imageUrl };
    previewCache.set(rawUrl, result);
    return res.json(result);
  } catch (err: any) {
    return res.json({ imageUrl: null });
  }
});

// Health check endpoints for container / load balancer / reverse proxy
app.get("/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Community Experience Feed & Social Profiles API
app.get("/api/feed/posts", (req, res) => {
  try {
    const userId = req.query.userId as string | undefined;
    const posts = communityDb.getAllPosts(userId);
    res.json({ posts });
  } catch (err: any) {
    console.error("Error getting feed posts:", err);
    res.status(500).json({ error: "Failed to load posts" });
  }
});

app.post("/api/feed/posts", (req, res) => {
  try {
    const { authorId, authorName, authorChildName, authorChildAge, text, attachedGameCard } = req.body;
    if (!text && !attachedGameCard) {
      return res.status(400).json({ error: "Text or attached game is required" });
    }
    const post = communityDb.createPost({
      authorId: authorId || "user_anonymous",
      authorName: authorName || "مادر قرآن‌آموز",
      authorChildName: authorChildName || "فرزندم",
      authorChildAge: Number(authorChildAge) || 5,
      text: (text || "").trim(),
      attachedGameCard
    });
    res.json({ post });
  } catch (err: any) {
    console.error("Error creating feed post:", err);
    res.status(500).json({ error: "Failed to create post" });
  }
});

app.put("/api/feed/posts/:id", (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Text is required" });
    }
    const success = communityDb.updatePost(req.params.id, text.trim());
    if (!success) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error updating feed post:", err);
    res.status(500).json({ error: "Failed to update post" });
  }
});

app.delete("/api/feed/posts/:id", (req, res) => {
  try {
    const success = communityDb.deletePost(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting feed post:", err);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

app.post("/api/feed/posts/:id/helpful", (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    const result = communityDb.toggleHelpful(req.params.id, userId);
    res.json(result);
  } catch (err: any) {
    console.error("Error toggling helpful:", err);
    res.status(500).json({ error: "Failed to toggle helpful" });
  }
});

app.post("/api/feed/posts/:id/comments", (req, res) => {
  try {
    const { authorId, authorName, authorChild, text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Comment text is required" });
    }
    const comment = communityDb.addComment(req.params.id, {
      authorId,
      authorName: authorName || "مادر قرآن‌آموز",
      authorChild,
      text: text.trim()
    });
    res.json({ comment });
  } catch (err: any) {
    console.error("Error adding comment:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

app.post("/api/feed/posts/:id/comments/:commentId/replies", (req, res) => {
  try {
    const { authorId, authorName, authorChild, text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Reply text is required" });
    }
    const reply = communityDb.addReply(req.params.id, req.params.commentId, {
      authorId,
      authorName: authorName || "مادر قرآن‌آموز",
      authorChild,
      text: text.trim()
    });
    res.json({ reply });
  } catch (err: any) {
    console.error("Error adding reply:", err);
    res.status(500).json({ error: "Failed to add reply" });
  }
});

app.post("/api/feed/posts/:id/report", (req, res) => {
  try {
    const { reason } = req.body;
    const success = communityDb.reportPost(req.params.id, reason || "بدون توضیح");
    res.json({ success });
  } catch (err: any) {
    console.error("Error reporting post:", err);
    res.status(500).json({ error: "Failed to report post" });
  }
});

app.get("/api/feed/profiles", (_req, res) => {
  try {
    const profiles = communityDb.getAllProfiles();
    res.json({ profiles });
  } catch (err: any) {
    console.error("Error getting community profiles:", err);
    res.status(500).json({ error: "Failed to load profiles" });
  }
});

app.get("/api/feed/profiles/:id", (req, res) => {
  try {
    const profile = communityDb.getProfile(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    const posts = communityDb.getAllPosts().filter(p => p.authorId === req.params.id);
    res.json({ profile, posts });
  } catch (err: any) {
    console.error("Error getting author profile:", err);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

app.post("/api/feed/profiles/sync", (req, res) => {
  try {
    const { id, username, childName, childAge, bio, badge, avatarColor } = req.body;
    if (!id || !username) {
      return res.status(400).json({ error: "id and username are required" });
    }
    const profile = communityDb.upsertProfile({
      id,
      username,
      childName,
      childAge: childAge ? Number(childAge) : undefined,
      bio,
      badge,
      avatarColor
    });
    res.json({ profile });
  } catch (err: any) {
    console.error("Error syncing profile:", err);
    res.status(500).json({ error: "Failed to sync profile" });
  }
});

// Vite middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
