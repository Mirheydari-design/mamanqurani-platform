import { Child, GameCard, ItemCategoryType, DailyTask, SpecialSuggestion } from '../types';
import { getTodayStr, normalizeTaskDate } from './dateHelpers';
import { toPersianDigits } from './persian';
import { formatProgramCardTitle } from './quranUtils';

/**
 * Checks if a Near Review task for this child is already scheduled for today.
 */
export function isNearReviewScheduledToday(
  childId: string,
  dailyTasks: DailyTask[],
  surahName?: string
): boolean {
  const todayStr = getTodayStr();
  return dailyTasks.some((t) => {
    if (t.childId && t.childId !== childId) return false;
    const isToday = normalizeTaskDate(t.date) === todayStr;
    if (!isToday) return false;
    const isNear =
      t.category === 'برنامه مرور نزدیک' ||
      t.title.includes('مرور نزدیک') ||
      t.gameCard?.tag === 'برنامه مرور نزدیک';

    if (surahName) {
      const cleanSurah = surahName.replace('سوره', '').trim();
      return (
        isNear &&
        (t.title.includes(cleanSurah) ||
          t.subtitle?.includes(cleanSurah) ||
          t.gameCard?.surah?.includes(cleanSurah))
      );
    }
    return isNear;
  });
}

/**
 * Checks if a Far Review task for this child is already scheduled for today.
 */
export function isFarReviewScheduledToday(
  childId: string,
  dailyTasks: DailyTask[],
  surahName?: string
): boolean {
  const todayStr = getTodayStr();
  return dailyTasks.some((t) => {
    if (t.childId && t.childId !== childId) return false;
    const isToday = normalizeTaskDate(t.date) === todayStr;
    if (!isToday) return false;
    const isFar =
      t.category === 'برنامه مرور دور' ||
      t.title.includes('مرور دور') ||
      t.gameCard?.tag === 'برنامه مرور دور';

    if (surahName) {
      const cleanSurah = surahName.replace('سوره', '').trim();
      return (
        isFar &&
        (t.title.includes(cleanSurah) ||
          t.subtitle?.includes(cleanSurah) ||
          t.gameCard?.surah?.includes(cleanSurah))
      );
    }
    return isFar;
  });
}

/**
 * Generates rule-based Near and Far Review cards according to Quran memorization guidelines.
 * Does NOT require AI model generation.
 * Seamlessly integrates into generated card lists.
 * Omits review cards if they are already scheduled in today's daily tasks.
 */
export function generateRuleBasedReviewCards(
  child: Child,
  dailyTasks: DailyTask[],
  options?: {
    forceInclude?: boolean;
    dayOffset?: number;
  }
): GameCard[] {
  let validProgress = (child.surahProgress || []).filter((s) => s.surah && s.surah.trim());

  // Fallback if child has no explicit progress entries yet
  if (validProgress.length === 0) {
    if (child.memorizationScope && (child.memorizationScope.includes('فیل') || child.memorizationScope.includes('جزء ۳۰'))) {
      validProgress = [
        { surah: 'سوره کوثر', progress: 100, status: 'memorized', lastReviewed: 'دیروز' },
        { surah: 'سوره فیل', progress: 100, status: 'memorized', lastReviewed: '۲ روز پیش' },
        { surah: 'سوره قریش', progress: 75, status: 'learning', lastReviewed: 'امروز' },
      ];
    } else {
      validProgress = [
        { surah: 'سوره اخلاص (توحید)', progress: 100, status: 'memorized', lastReviewed: 'دیروز' },
        { surah: 'سوره کوثر', progress: 80, status: 'learning', lastReviewed: 'امروز' },
      ];
    }
  }

  // If only 1 surah is present, supply a complementary surah to allow both near and far review
  if (validProgress.length === 1) {
    const isKawthar = validProgress[0].surah.includes('کوثر');
    validProgress.push({
      surah: isKawthar ? 'سوره فیل' : 'سوره کوثر',
      progress: 100,
      status: 'memorized',
      lastReviewed: 'هفته گذشته',
    });
  }

  // Separate learning (near review candidates) and memorized (far review candidates)
  const learningSurahs = validProgress.filter(
    (s) => s.status === 'learning' || (s.progress > 0 && s.progress < 100)
  );
  const memorizedSurahs = validProgress.filter(
    (s) => s.status === 'memorized' || s.progress === 100
  );

  const reviewCards: GameCard[] = [];
  const childAge = child.age || 5;
  const childAgeStr = `${toPersianDigits(childAge)} سال`;

  // 1. NEAR REVIEW (مرور نزدیک - تثبیت درس‌های تازه یا روزهای گذشته)
  const nearCandidate =
    learningSurahs[0] || memorizedSurahs[memorizedSurahs.length - 1] || validProgress[0];

  if (nearCandidate) {
    const isAlreadyScheduled = !options?.forceInclude && isNearReviewScheduledToday(
      child.id,
      dailyTasks,
      nearCandidate.surah
    );

    if (!isAlreadyScheduled) {
      const surahName = nearCandidate.surah.startsWith('سوره')
        ? nearCandidate.surah
        : `سوره ${nearCandidate.surah}`;

      const nearReviewCard: GameCard = {
        id: `review_near_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        title: formatProgramCardTitle({
          tag: 'برنامه مرور نزدیک',
          itemType: 'program',
          surah: surahName,
        }),
        surah: surahName,
        topic: 'تثبیت درس‌های تازه و تسلط بر پیوستگی آیات',
        quranSegment: `تثبیت و روان‌خوانی فرازهای تازه ${surahName}`,
        description: `مرور پیوسته و بدون استرس آیات تازه یادگرفته‌شده ${surahName} برای تثبیت در حافظه بلندمدت`,
        materials: [],
        steps: [
          'گام اول (همخوانی آرام): مادر و دلبند یک بار سوره را آرام و با لحن زیبا با هم زمزمه می‌کنند.',
          'گام دوم (زنجیره فراز به فراز): مادر یک فراز یا آیه را می‌خواند و فرزند آیه بعدی را کامل می‌کند.',
          'گام سوم (تلاوت مستقل و تشویق): کودک سوره را مسلط از حفظ می‌خواند و ستاره طلایی روزانه ثبت می‌شود.',
        ],
        duration: '۱۰ دقیقه',
        ageRange: childAgeStr,
        tag: 'برنامه مرور نزدیک',
        itemType: 'program',
        dayNumber: 1,
        dayLabel: 'امروز',
        isCustom: true,
        motherlyAdvice: `مامان جان، مرور نزدیک مثل آبیاری جوانه تازه‌کاشته‌شده‌ست؛ تکرار شیرین و بدون استرس امروز، این سوره رو تا همیشه در خاطرش موندگار می‌کنه.`,
        motherActions: [
          'ایجاد فضای آرام و بدون هیچ‌گونه فشار یا بازخواست',
          'همخوانی با لحن شمرده و تبسم',
          'تشویق با کلمات پرمهر و برچسب ستاره',
        ],
      };

      reviewCards.push(nearReviewCard);
    }
  }

  // 2. FAR REVIEW (مرور دور - دوره محفوظات گذشته و پایدارسازی گنجینه حفظ)
  const farCandidate =
    memorizedSurahs[0] ||
    (learningSurahs.length > 1 ? learningSurahs[1] : null) ||
    validProgress[validProgress.length - 1];

  if (farCandidate && farCandidate.surah !== nearCandidate?.surah) {
    const isAlreadyScheduled = !options?.forceInclude && isFarReviewScheduledToday(
      child.id,
      dailyTasks,
      farCandidate.surah
    );

    if (!isAlreadyScheduled) {
      const surahName = farCandidate.surah.startsWith('سوره')
        ? farCandidate.surah
        : `سوره ${farCandidate.surah}`;

      const farReviewCard: GameCard = {
        id: `review_far_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        title: formatProgramCardTitle({
          tag: 'برنامه مرور دور',
          itemType: 'program',
          surah: surahName,
        }),
        surah: surahName,
        topic: 'مرور دوره‌ای و زنده نگه داشتن سوره‌های قبلی',
        quranSegment: `یادآوری و دوره کامل ${surahName} از گنجینه حفظ`,
        description: `دوره منظم سوره‌های قبلی حفظ‌شده تا همیشه تازه، روان و درخشان در ذهن کودک باقی بمانند`,
        materials: [],
        steps: [
          'گام اول (کلمات طلایی): مادر کلمه اول هر آیه را می‌گوید و کودک سریع بقیه آیه را به یاد می‌آورد.',
          'گام دوم (تلاوت پیوسته): خواندن روان و آرام کل سوره از ابتدا تا پایان از حفظ.',
          'گام سوم (جشنواره گنجینه): تحسین صمیمانه و ثبت نشان درخشان در کارنامه حفظ کودک.',
        ],
        duration: '۱۰ دقیقه',
        ageRange: childAgeStr,
        tag: 'برنامه مرور دور',
        itemType: 'program',
        dayNumber: 2,
        dayLabel: 'فردا',
        isCustom: true,
        motherlyAdvice: `مامان صبور، مرور دور راز ماندگاری کلام خداست. حتی ۵ تا ۱۰ دقیقه دوره صمیمانه، اعتمادبه‌نفس شگفت‌انگیزی به کودک می‌بخشد.`,
        motherActions: [
          'بازی با کلمات شروع آیات',
          'گوش دادن با افتخار و لبخند به تلاوت کودک',
          'ثبت نشان پیشرفت در دفترچه خاطرات قرآنی',
        ],
      };

      reviewCards.push(farReviewCard);
    }
  }

  return reviewCards;
}

/**
 * Creates both Near Review and Far Review Special Suggestions for the child based on their past memorization.
 * These are built locally without needing external Google Sheet data.
 * Checks if already scheduled in daily tasks today.
 */
export function createReviewSpecialSuggestions(
  child: Child,
  todayDateKey: string,
  dailyTasks: DailyTask[],
  dismissedIds: string[] = []
): SpecialSuggestion[] {
  // Always forceInclude to get both candidate cards, then check status
  const cards = generateRuleBasedReviewCards(child, dailyTasks, { forceInclude: true });
  if (cards.length === 0) return [];

  const results: SpecialSuggestion[] = [];

  cards.forEach((card) => {
    const isNear = card.tag === 'برنامه مرور نزدیک';
    const id = `special_review_${isNear ? 'near' : 'far'}_${todayDateKey}_${child.id}`;
    const isDismissed = dismissedIds.includes(id);

    const isAlreadyScheduled = isNear
      ? isNearReviewScheduledToday(child.id, dailyTasks, card.surah)
      : isFarReviewScheduledToday(child.id, dailyTasks, card.surah);

    const badge = isNear
      ? '🔄 پیشنهاد شگفت‌انگیز امروز (مرور نزدیک)'
      : '🏛️ پیشنهاد شگفت‌انگیز امروز (مرور دور)';

    const text = isNear
      ? `مامان مهربان ${child.name} عزیز، امروز با یک مرور نزدیک ۱۰ دقیقه‌ای، ${card.surah} را در حافظه دلبندتان تثبیت و ماندگار کنید.`
      : `مامان صبور، امروز فرصت عالی برای یک دوره شیرین و مرور دور ${card.surah} همراه با ${child.name} است تا گنجینه محفوظاتش همیشه بدرخشد.`;

    results.push({
      id,
      dateKey: todayDateKey,
      badge,
      text,
      gameCard: card,
      dismissed: isDismissed,
      categoryType: 'program',
      targetChildId: child.id,
      targetChildName: child.name,
      targetChildAge: child.age,
      isAlreadyAdded: isAlreadyScheduled,
    });
  });

  return results;
}

/**
 * Creates an authentic Special Suggestion from child's actual memorizations for App launch.
 */
export function createReviewSpecialSuggestion(
  child: Child,
  todayDateKey: string,
  dailyTasks: DailyTask[]
): SpecialSuggestion | null {
  const suggestions = createReviewSpecialSuggestions(child, todayDateKey, dailyTasks);
  return suggestions.length > 0 ? suggestions[0] : null;
}
