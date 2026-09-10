import { Child, GameCard, SpecialSuggestion, ProductSuggestion, ItemCategoryType, DailyTask } from '../types';
import { toPersianDigits, toEnglishDigits } from '../utils/persian';
import { createReviewSpecialSuggestion } from '../utils/reviewCardsGenerator';
import { formatProgramCardTitle } from '../utils/quranUtils';

export const ACTIVITY_SHEET_URL = 'https://opensheet.elk.sh/1CoRVY0bxJ6wdwaQdEaIqcV0880r4XouEN2n9GeYD5kg/Sheet1';
export const PRODUCT_SHEET_URL = 'https://opensheet.elk.sh/15c4VLyhQnqOQ2Cz3H3mcObsY46kPU5IVqcHjJJDzSqY/Sheet1';

// Seed Fallback for Sheet 1 (بازی‌ها و برنامه‌ها)
const FALLBACK_ACTIVITIES = [
  {
    "رده سنی": "۳ تا ۵ سال",
    "دسته‌بندی": "بازی حفظ جدید",
    "سوره یا مفهوم": "مفهوم آفرینش و حیوانات در قرآن",
    "متن پیشنهاد شگفت انگیز (لحن صمیمی و مادرانه)": "مامانِ صبورِ [نام_کودک] جان، بچه‌ها تو این سن با لمس کردن و ساختن، مفاهیم رو تو قلبشون ثبت می‌کنن. امروز می‌خوایم آیه‌های جدید رو با خمیربازی قاطی کنیم. این‌طوری هم حفظش شیرین میشه، هم بعدش یه عالمه وقت داری تا به کارهای خودت برسی!",
    "اقدامات مامان": "۱. خمیربازی‌ها رو روی سفره پهن کنید.\n\n۲. آیه جدید رو بخونید و با هم یک شکل ساده بسازید.\n\n۳. مدیریتِ ادامه ساخت‌وساز رو به خودش بسپارید.",
    "نام کارت": "بازی خمیر و خالقِ مهربون",
    "مدت زمان": "۱۵ دقیقه",
    "توضیح کوتاه": "ساختنِ شکل‌هایی مرتبط با کلمات قرآن با خمیربازی، که با یک هم‌خوانی شروع شده و به یک بازی فردیِ طولانی ختم می‌شود.",
    "وسایل مورد نیاز (هر خط یک مورد)": "- چند رنگ خمیربازی یا گل رُس بهداشتی\n- یک سفره یا زیرانداز کوچک",
    "مراحل اجرا (هر خط یک مرحله)": "۱. سفره رو پهن کن و خمیرها رو بذار وسط. به [نام_کودک] بگو: «امروز می‌خوایم کلمه‌های آیه جدید رو با دستای خودمون بسازیم.»\n۲. آیه رو با لحن کودکانه بخون و مثلاً با هم یه پرنده یا یه کوه کوچیك بسازید.\n۳. بعد از دو سه بار تکرار، بهش بگو: «مامان میره یه چای دم کنه، تو می‌تونی برای این پرنده یه عالمه دوست و درخت بسازی تا من برگردم؟»\n۴. حالا رهاش کن، فقط تماشا کن!"
  },
  {
    "رده سنی": "۶ تا ۸ سال",
    "دسته‌بندی": "بازی مرور",
    "سوره یا مفهوم": "مرور سوره‌های کوتاه",
    "متن پیشنهاد شگفت انگیز (لحن صمیمی و مادرانه)": "مامانِ پرانرژیِ [نام_کودک] جان، بچه‌های ۶ تا ۸ سال عاشق اینن که احساس کنن بزرگ شدن و صداشون شنیده میشه. امروز مرورِ سوره‌ها رو تبدیل کن به یه اجرای رادیویی جذاب!",
    "اقدامات مامان": "۱. یک قاشق یا کنترل تلویزیون به عنوان میکروفن بدید دستش.\n۲. بگید: «شنوندگان عزیز، اکنون صدای قاری کوچک [نام_کودک] رو می‌شنوید!»\n۳. با تشویق همراهی کنید.",
    "نام کارت": "بازی استودیو رادیو قرآن",
    "مدت زمان": "۱۰ دقیقه",
    "توضیح کوتاه": "تبدیل مرور روزانه به اجرای زنده رادیویی با میکروفن خیالی و معرفی شاداب کودک.",
    "وسایل مورد نیاز (هر خط یک مورد)": "- یک وسیله ساده به عنوان میکروفن (برس یا قاشق)\n- تلفن همراه برای ضبط صدا (اختیاری)",
    "مراحل اجرا (هر خط یک مرحله)": "۱. فضا رو مثل استودیو رادیو اعلام کن و هیجان بده.\n۲. از [نام_کودک] بخواه سوره امروز رو با لحن گوینده رادیو تلاوت کنه.\n۳. در پایان با کف زدن و صدای تشویق خستگی رو از تنش بیرون کن!"
  },
  {
    "رده سنی": "۶ تا ۸ سال",
    "دسته‌بندی": "برنامه مرور نزدیک",
    "سوره یا مفهوم": "تثبیت ۳ سوره اخیر",
    "متن پیشنهاد شگفت انگیز (لحن صمیمی و مادرانه)": "مامانِ عزیزِ [نام_کودک]، برای اینکه محفوظات تازه قشنگ تو ذهن بمونه، یه مرور کوتاه ۵ دقیقه‌ای قبل از بازی عصرانه مثل آب دادن به یه گل کوچیکه. بیا با هم با آرامش آیات رو زمزمه کنیم.",
    "اقدامات مامان": "۱. کنار هم روی مبل یا فرش بنشینید.\n۲. یک آیه مامان و یک آیه [نام_کودک] بخونه.\n۳. ثبت ستاره موفقیت در پایان.",
    "نام کارت": "برنامه رنگ‌آمیزی کلماتِ نورانی",
    "مدت زمان": "۸ دقیقه",
    "توضیح کوتاه": "مرور نوبتی و صمیمانه آیات اخیر با تمرکز بر کلمات کلیدی و آرامش مادر و کودک.",
    "وسایل مورد نیاز (هر خط یک مورد)": "- قرآن کودک یا دفترچه پیشرفت\n- مداد رنگی یا برچسب",
    "مراحل اجرا (هر خط یک مرحله)": "۱. با لبخند و بوسه [نام_کودک] رو به کنار خودت دعوت کن.\n۲. آیه اول رو تو بخون و دومی رو اون بخونه.\n۳. اگه کلمه‌ای رو مکث کرد، با مهربانی کلمه اول رو نجوا کن.\n۴. در پایان ستاره روزش رو روشن کنید!"
  },
  {
    "رده سنی": "۹ تا ۱۳ سال",
    "دسته‌بندی": "بازی مرور",
    "سوره یا مفهوم": "مرور دور و مفاهیم آیات",
    "متن پیشنهاد شگفت انگیز (لحن صمیمی و مادرانه)": "مامانِ فهیمِ [نام_کودک] جان، نوجوان‌ها عاشق حل معما و کشف رازها هستن. امروز مرور رو با بازی کارآگاهی ترکیب کن تا هیجان به یادآوری آیات اضافه بشه!",
    "اقدامات مامان": "۱. سرنخ کلمات رو روی برگه‌های کوچک بنویسید.\n۲. کودک باید با دیدن کلمه، سوره و آیه بعدی رو پیدا کنه.",
    "نام کارت": "بازی دیوار کارآگاهیِ آیات",
    "مدت زمان": "۱۲ دقیقه",
    "توضیح کوتاه": "حل معمای کلمات کلیدی سوره توسط کودک در نقش کارآگاه قرآنی برای مرور سریع و هیجان‌انگیز.",
    "وسایل مورد نیاز (هر خط یک مورد)": "- کاغذ یادداشت چسب‌دار (استیکی نوت)\n- خودکار یا ماژیک",
    "مراحل اجرا (هر خط یک مرحله)": "۱. سه کلمه خاص از سوره‌های مرور دور رو روی سه برگه بنویس و روی در یا کمد بچسبون.\n۲. به [نام_کودک] بگو: «کارآگاه وارد می‌شود! راز این آیات چیست؟»\n۳. با خواندن آیه کامل، برگه رو به عنوان مدرک کشف‌شده برمی‌داره."
  },
  {
    "رده سنی": "۳ تا ۵ سال",
    "دسته‌بندی": "بازی تحویل",
    "سوره یا مفهوم": "تحویل سوره حفظ‌شده",
    "متن پیشنهاد شگفت انگیز (لحن صمیمی و مادرانه)": "مامانِ مهربون، وقتی نوبت تحویل دادن سوره میشه بچه‌ها نباید حس امتحان پس دادن داشته باشن. بیا روی زمین چند تا بالش بذاریم و بگیم با هر آیه می‌پری روی ابر بعدی!",
    "اقدامات مامان": "۱. بالش‌ها رو با فاصله روی فرش بچینید.\n۲. با هر آیه درست، یک قدم یا پرش به جلو.",
    "نام کارت": "بازی پرش روی ابرهای پنبه‌ای",
    "مدت زمان": "۷ دقیقه",
    "توضیح کوتاه": "تحویل شاداب و پرتحرک سوره با پریدن روی کوسن‌ها و بالش‌های پنبه‌ای.",
    "وسایل مورد نیاز (هر خط یک مورد)": "- چند عدد کوسن یا بالش نرم خانگی",
    "مراحل اجرا (هر خط یک مرحله)": "۱. بالش‌ها رو مثل جزیره‌های کوچک روی زمین بچین.\n۲. به [نام_کودک] بگو با خواندن هر آیه از روی این ابر به ابر بعدی پرواز می‌کنه!\n۳. در پایان با آغوش گرم در آخرین ایستگاه منتظرش باش."
  },
  {
    "رده سنی": "۶ تا ۸ سال",
    "دسته‌بندی": "برنامه مرور دور",
    "سوره یا مفهوم": "مرور محفوظات گذشته",
    "متن پیشنهاد شگفت انگیز (لحن صمیمی و مادرانه)": "مامانِ نازنین، مرور دور مثل نگه‌داری از گل‌های یه باغچه‌ست. امروز تو وقت آماده کردن عصرانه یا سفره، یک سوره قدیمی رو با هم همخوانی کنید.",
    "اقدامات مامان": "۱. سوره قدیمی رو در حین فعالیت سبک روزمره بخونید.\n۲. از لحن صمیمی و بی‌توقع استفاده کنید.",
    "نام کارت": "برنامه سفرهِ بابرکت",
    "مدت زمان": "۶ دقیقه",
    "توضیح کوتاه": "مرور دور محفوظات قدیمی در هنگام چیدن سفره یا میان‌وعده خانوادگی.",
    "وسایل مورد نیاز (هر خط یک مورد)": "- نیاز به هیچ وسیله خاصی ندارد (همراه با کارهای روزمره خانه)",
    "مراحل اجرا (هر خط یک مرحله)": "۱. در حین آوردن میوه یا چای، با زمزمه آیه اول [نام_کودک] رو همراه کن.\n۲. با ریتم آرام سوره رو تا آخر هم‌خوانی کنید.\n۳. یک لبخند و تشکر صمیمانه هدیه بده."
  }
];

// Seed Fallback for Sheet 2 (محصولات: کتاب، بازی فکری، پادکست)
const FALLBACK_PRODUCTS = [
  {
    "رده سنی": "۳ تا ۵",
    "نوع محصول": "کتاب",
    "عنوان مینی‌کارت": "📚 پیشنهاد کتاب تصویری",
    "نام و نوع محصول": "مجموعه مقوایی «من خدا را دوست دارم»",
    "پیشنهاد شگفت‌انگیز مادرانه (متن پاپ‌آپ)": "مامانِ [نام_کودک] جان، بچه‌ها تو این سن با تصاویر رنگارنگ و ورق زدن‌های هیجان‌انگیز دنیا رو می‌شناسن. این کتابِ مقوایی با نقاشی‌های شادش بهترین بهانه‌ست تا آیه‌های آفرینش رو با هم مرور کنید و محبت خدا رو تو قلب کوچیکش بکاریم.",
    "نحوه استفاده در برنامه امروز (مراحل)": "۱. کتاب رو باز کن و بذار خودش نقاشی‌های قشنگش رو ورق بزنه.\n۲. آیه‌هایی درباره طبیعت و حیوانات (مثل سوره تین یا فیل) رو به نقاشی‌های کتاب ربط بده و با لحن شاد براش بخون.\n۳. در آخر بغلش کن و بگو: خدایی که اینا رو آفریده، چقدر ما رو دوست داره!",
    "ناشر / تولیدکننده": "نشر جمال (غلامرضا حیدری ابهری)",
    "کد تخفیف": "maman15",
    "لینک خرید و تصویر محصول": "https://jamalnashr.com/product/%D8%A8%D9%87-%D9%85%D9%86-%D8%A8%DA%AF%D9%88-%D8%AE%D8%AF%D8%A7-%DA%A9%DB%8C%D8%B3%D8%AA-1-%D8%AE%D8%AF%D8%A7-%D8%AF%D9%88%D8%B3%D8%AA%D8%AA-%D8%AF%D8%A7%D8%B1%D8%AF/"
  },
  {
    "رده سنی": "۶ تا ۸",
    "نوع محصول": "بازی فکری",
    "عنوان مینی‌کارت": "🧩 پیشنهاد بازی رومیزی",
    "نام و نوع محصول": "پازل چوبی «کشتی نوح»",
    "پیشنهاد شگفت‌انگیز مادرانه (متن پاپ‌آپ)": "مامانِ عزیزِ [نام_کودک]، مرورِ محفوظات برای بچه‌ها گاهی تکراری میشه. بیا این پازل چوبی زیبا رو تبدیل کنیم به جایزه تلاشش! هر بخشی که از حفظ می‌خونه، یه قطعه از پازل بهش بده تا هم کشتی نوح ساخته بشه، هم مرورهاش با اشتیاق پیش بره.",
    "نحوه استفاده در برنامه امروز (مراحل)": "۱. جعبه پازل رو بیار و بگو: امروز با هر قسمتی که از مرورِ دورت بخونی، یه قطعه از این کشتی برات باز میشه.\n۲. دو سه تا قطعه اول رو با خوندنِ آیه‌ها بهش بده تا قلقِ بازی دستش بیاد.\n۳. وقتی یاد گرفت و مشتاق شد... حالا رهاش کن، فقط تماشا کن!",
    "ناشر / تولیدکننده": "آوای باران / بازیتا",
    "کد تخفیف": "quranmom",
    "لینک خرید و تصویر محصول": "https://piccotoys.com/product/7152893?utm_medium=PPC&utm_source=Torob&torob_clid=01a0694f-395c-71dc-9f62-10eb4899a20a"
  },
  {
    "رده سنی": "۹ تا ۱۳",
    "نوع محصول": "پادکست",
    "عنوان مینی‌کارت": "🎧 پیشنهاد رسانه شنیداری",
    "نام و نوع محصول": "کتاب صوتی «قصه‌های قرآن»",
    "پیشنهاد شگفت‌انگیز مادرانه (متن پاپ‌آپ)": "مامانِ دغدغه‌مند، ذهن نوجوانِ تو [نام_کودک] الان دنبال قهرمان می‌گرده. حفظِ آیه‌ها وقتی با شنیدن داستان‌های اصیل پیامبران ترکیب بشه، تو جانش رسوخ می‌کنه. این کتاب صوتی یه سفرِ جذاب برای درکِ عمیق‌ترِ سوره‌هاست.",
    "نحوه استفاده در برنامه امروز (مراحل)": "۱. تو مسیر رفت‌وآمد یا قبل از خواب، یکی از داستان‌های این مجموعه رو با هم گوش بدید.\n۲. بدون نصیحت، فقط ازش بپرس: «فکر می‌کنی کدوم آیه از محفوظاتت، شبیه حال و هوای این داستان بود؟»\n۳. بذار تو خیالِ خودش داستان و آیه‌ها رو به هم پیوند بده.",
    "ناشر / تولیدکننده": "نوین کتاب گویا (مرحوم مهدی آذریزدی)",
    "کد تخفیف": "maman20",
    "لینک خرید و تصویر محصول": "https://fidibo.com/book/68619-%DA%A9%D8%AA%D8%A7%D8%A8-%D8%B5%D9%88%D8%AA%DB%8C-%D9%82%D8%B5%D9%87-%D9%82%D8%B1%D8%A2%D9%86-1"
  }
];

// Helper: parse age string like "۳ تا ۵ سال" or "۶ تا ۸" to [min, max]
export function parseAgeRange(ageStr: string): [number, number] {
  if (!ageStr) return [3, 15];
  const english = toEnglishDigits(ageStr);
  const matches = english.match(/\d+/g);
  if (!matches || matches.length === 0) return [3, 15];
  if (matches.length === 1) {
    const val = parseInt(matches[0], 10);
    return [val, val];
  }
  return [parseInt(matches[0], 10), parseInt(matches[1], 10)];
}

export function isAgeInRange(age: number, rangeStr: string): boolean {
  const [min, max] = parseAgeRange(rangeStr);
  return age >= min && age <= max;
}

// 1. SELECT DAILY CHILD (Non-repeating random cycle)
// هر کسی بیشتر از یک فرزند داشت بصورت رندوم غیر تکراری هر روز یک فرزند را انتخاب کن برای پیشنهاد دادن.
export function getDailySelectedChild(children: Child[], todayDateKey: string, forceNext = false): Child | null {
  if (!children || children.length === 0) return null;
  if (children.length === 1) return children[0];

  const STORAGE_KEY = 'maman_child_selection_state';
  let state = {
    dateKey: '',
    selectedChildId: '',
    visitedChildIds: [] as string[],
  };

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      state = JSON.parse(saved);
    }
  } catch (e) {
    // ignore
  }

  // If already selected today and not forcing next:
  if (!forceNext && state.dateKey === todayDateKey && state.selectedChildId) {
    const found = children.find(c => c.id === state.selectedChildId);
    if (found) return found;
  }

  // Pick next child from unvisited
  const validChildrenIds = children.map(c => c.id);
  // Clean up visited in case children changed
  let visited = state.visitedChildIds.filter(id => validChildrenIds.includes(id));

  let unvisited = children.filter(c => !visited.includes(c.id));
  if (unvisited.length === 0) {
    // Reset cycle
    visited = [];
    unvisited = [...children];
  }

  // Pick randomly among unvisited
  const randomIndex = Math.floor(Math.random() * unvisited.length);
  const picked = unvisited[randomIndex];

  visited.push(picked.id);

  const newState = {
    dateKey: todayDateKey,
    selectedChildId: picked.id,
    visitedChildIds: visited,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  } catch (e) {
    // ignore
  }

  return picked;
}

// 2. FETCH FROM OPENSHEET WITH FALLBACK
let cachedActivities: any[] | null = null;
let cachedProducts: any[] | null = null;

export async function fetchActivitiesFromSheet(): Promise<any[]> {
  if (cachedActivities && cachedActivities.length > 0) return cachedActivities;
  try {
    const res = await fetch(ACTIVITY_SHEET_URL);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        cachedActivities = data;
        return data;
      }
    }
  } catch (e) {
    console.warn('Could not fetch activity sheet, using fallback', e);
  }
  cachedActivities = FALLBACK_ACTIVITIES;
  return FALLBACK_ACTIVITIES;
}

export async function fetchProductsFromSheet(): Promise<any[]> {
  if (cachedProducts && cachedProducts.length > 0) return cachedProducts;
  try {
    const res = await fetch(PRODUCT_SHEET_URL);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        cachedProducts = data;
        return data;
      }
    }
  } catch (e) {
    console.warn('Could not fetch product sheet, using fallback', e);
  }
  cachedProducts = FALLBACK_PRODUCTS;
  return FALLBACK_PRODUCTS;
}

// 3. GET DAILY ACTIVITY/PROGRAM SUGGESTION
// کارت بازی: بازی تحویل، بازی حفظ جدید، بازی مرور
// کارت برنامه: برنامه مرور نزدیک، برنامه مرور دور
export async function getDailyActivitySuggestion(
  child: Child,
  todayDateKey: string,
  forceNext = false
): Promise<SpecialSuggestion> {
  // If child has previous memorizations, check if a Near or Far Review suggestion should be presented
  if (child.surahProgress && child.surahProgress.length > 0 && !forceNext) {
    let currentTasks: DailyTask[] = [];
    try {
      const savedTasks = localStorage.getItem('quran_app_tasks_v2');
      if (savedTasks) currentTasks = JSON.parse(savedTasks);
    } catch (e) {}

    const reviewSuggestion = createReviewSpecialSuggestion(child, todayDateKey, currentTasks);
    if (reviewSuggestion) {
      const REVIEW_CYCLE_KEY = `maman_review_sugg_${child.id}_${todayDateKey}`;
      const alreadyUsedReview = localStorage.getItem(REVIEW_CYCLE_KEY);
      if (!alreadyUsedReview) {
        localStorage.setItem(REVIEW_CYCLE_KEY, 'true');
        return reviewSuggestion;
      }
    }
  }

  const allRows = await fetchActivitiesFromSheet();
  const childName = child.name || 'کودک';
  const childAge = child.age || 5;

  // Filter for items that are games or programs (exclude pure products if any exist in Sheet 1)
  const activityRows = allRows.filter(row => {
    const cat = row['دسته‌بندی'] || row['دستهبندی'] || '';
    return !cat.includes('محصول') && (cat.includes('بازی') || cat.includes('برنامه'));
  });

  const candidates = activityRows.length > 0 ? activityRows : allRows;

  // Filter by child's age
  let ageMatches = candidates.filter(row => isAgeInRange(childAge, row['رده سنی'] || ''));
  if (ageMatches.length === 0) {
    // Fallback to all candidates if age match not found
    ageMatches = candidates;
  }

  // Non-repeating random selection
  const STORAGE_KEY = `maman_activity_cycle_${child.id}`;
  let usedTitles: string[] = [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) usedTitles = JSON.parse(saved);
  } catch (e) {}

  let available = ageMatches.filter(r => !usedTitles.includes(r['نام کارت']));
  if (available.length === 0) {
    usedTitles = [];
    available = ageMatches;
  }

  // Pick index
  const pickIndex = Math.floor(Math.random() * available.length);
  const selectedRow = available[pickIndex] || ageMatches[0] || FALLBACK_ACTIVITIES[0];

  usedTitles.push(selectedRow['نام کارت']);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usedTitles));
  } catch (e) {}

  // Parse fields
  const categoryRaw = selectedRow['دسته‌بندی'] || selectedRow['دستهبندی'] || 'بازی حفظ جدید';
  const isGame = categoryRaw.includes('بازی');
  const isProgram = categoryRaw.includes('برنامه');

  const categoryType: 'game' | 'program' | 'product' = isGame ? 'game' : 'program';

  // Format category tag
  let standardTag: ItemCategoryType = 'بازی حفظ جدید';
  if (categoryRaw.includes('تحویل') && isGame) standardTag = 'بازی تحویل';
  else if (categoryRaw.includes('مرور') && isGame) standardTag = 'بازی مرور';
  else if (categoryRaw.includes('حفظ جدید') && isGame) standardTag = 'بازی حفظ جدید';
  else if (categoryRaw.includes('مرور دور')) standardTag = 'برنامه مرور دور';
  else if (categoryRaw.includes('مرور نزدیک')) standardTag = 'برنامه مرور نزدیک';
  else if (categoryRaw.includes('حفظ جدید')) standardTag = 'برنامه حفظ جدید';
  else if (categoryRaw.includes('تحویل')) standardTag = 'تحویل حفظ';
  else standardTag = isGame ? 'بازی حفظ جدید' : 'برنامه مرور نزدیک';

  const badge = isGame
    ? '🎮 بازی شگفت‌انگیز امروز'
    : '🌱 برنامه شگفت‌انگیز امروز';

  // Replace [نام_کودک]
  const rawText = selectedRow['متن پیشنهاد شگفت انگیز (لحن صمیمی و مادرانه)'] ||
    selectedRow['توضیح کوتاه'] ||
    `مامان مهربان ${childName} عزیز، امروز این فعالیت جذاب را با هم امتحان کنید.`;
  const text = rawText.replaceAll('[نام_کودک]', childName);

  const materialsStr = selectedRow['وسایل مورد نیاز (هر خط یک مورد)'] || '';
  const materials = materialsStr
    .split('\n')
    .map((s: string) => s.replace(/^[-*•\d.]+\s*/, '').trim())
    .filter(Boolean);

  const stepsStr = selectedRow['مراحل اجرا (هر خط یک مرحله)'] || selectedRow['اقدامات مامان'] || '';
  const steps = stepsStr
    .split('\n')
    .map((s: string) => s.trim().replaceAll('[نام_کودک]', childName))
    .filter(Boolean);

  const cardTitle = (selectedRow['نام کارت'] || 'فعالیت قرآنی').replaceAll('[نام_کودک]', childName);
  const surah = selectedRow['سوره یا مفهوم'] || 'آیات نورانی';
  const duration = selectedRow['مدت زمان'] || (isGame ? '۱۰ دقیقه' : '۵ دقیقه');
  const description = (selectedRow['توضیح کوتاه'] || text).replaceAll('[نام_کودک]', childName);

  const motherActionsStr = selectedRow['اقدامات مامان'] || '';
  const motherActions = motherActionsStr
    .split('\n')
    .map((s: string) => s.trim().replaceAll('[نام_کودک]', childName))
    .filter(Boolean);

  const formattedTitle = isGame
    ? cardTitle
    : formatProgramCardTitle({
        title: cardTitle,
        tag: standardTag,
        itemType: 'program',
        surah,
        quranSegment: description,
      });

  const gameCard: GameCard = {
    id: `sheet_act_${Date.now()}`,
    title: formattedTitle,
    surah,
    description,
    materials: materials.length > 0 ? materials : ['وسایل ساده در خانه'],
    steps: steps.length > 0 ? steps : ['شروع با لبخند و همخوانی', 'اجرای مرحله‌ای فعالیت'],
    duration,
    ageRange: selectedRow['رده سنی'] || `${toPersianDigits(childAge)} سال`,
    tag: standardTag,
    itemType: isGame ? 'game' : 'program',
    motherlyAdvice: text,
    motherActions: motherActions.length > 0 ? motherActions : undefined,
  };

  return {
    id: `special_act_${Date.now()}`,
    dateKey: todayDateKey,
    badge,
    text,
    gameCard,
    dismissed: false,
    categoryType,
    targetChildId: child.id,
    targetChildName: childName,
    targetChildAge: childAge,
  };
}

// 4. GET DAILY PRODUCT SUGGESTION (Non-repeating random)
// برای محصولات مثل کتابها به این نتیجه رسیدم که به صورت رندوم غیر تکراری پیشنهادها رو نمایش بده.
// یعنی جداگانه پیشنهاد محصولات انجام میشود از یک شیت دیگر.
export async function getDailyProductSuggestion(
  child: Child,
  todayDateKey: string,
  forceNext = false
): Promise<ProductSuggestion> {
  const allProducts = await fetchProductsFromSheet();
  const childName = child.name || 'کودک';
  const childAge = child.age || 5;

  const STORAGE_KEY = `maman_product_history_${child.id}`;
  let usedNames: string[] = [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) usedNames = JSON.parse(saved);
  } catch (e) {}

  let available = allProducts.filter(p => !usedNames.includes(p['نام و نوع محصول']));
  if (available.length === 0) {
    usedNames = [];
    available = allProducts;
  }

  // If possible, prioritize child age if available among unpicked
  const ageMatched = available.filter(p => isAgeInRange(childAge, p['رده سنی'] || ''));
  const candidatePool = ageMatched.length > 0 ? ageMatched : available;

  const pickIndex = Math.floor(Math.random() * candidatePool.length);
  const selectedProduct = candidatePool[pickIndex] || allProducts[0] || FALLBACK_PRODUCTS[0];

  usedNames.push(selectedProduct['نام و نوع محصول']);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usedNames));
  } catch (e) {}

  const rawAdvice = selectedProduct['پیشنهاد شگفت‌انگیز مادرانه (متن پاپ‌آپ)'] ||
    selectedProduct['پیشنهاد شگفتانگیز مادرانه (متن پاپآپ)'] ||
    `مامان عزیز، این محصول ارزشمند برای انس بیشتر ${childName} با قرآن بسیار مناسب است.`;
  const motherlyAdvice = rawAdvice.replaceAll('[نام_کودک]', childName);

  const rawSteps = selectedProduct['نحوه استفاده در برنامه امروز (مراحل)'] || '';
  const steps = rawSteps
    .split('\n')
    .map((s: string) => s.trim().replaceAll('[نام_کودک]', childName))
    .filter(Boolean);

  const buyUrl = selectedProduct['لینک خرید و تصویر محصول'] || '#';
  const productName = selectedProduct['نام و نوع محصول'] || 'محصول قرآنی';
  const productType = selectedProduct['نوع محصول'] || 'کتاب';
  const miniTitle = selectedProduct['عنوان مینی‌کارت'] || selectedProduct['عنوان مینیکارت'] || '🎁 پیشنهاد شگفت‌انگیز محصول';
  const publisher = selectedProduct['ناشر / تولیدکننده'] || 'انتشارات معتبر';
  const discountCode = selectedProduct['کد تخفیف'] || 'maman15';
  const ageRange = selectedProduct['رده سنی'] || `${toPersianDigits(childAge)} سال`;

  // Extract or fetch image URL
  let imageUrl: string | undefined = undefined;
  if (/\.(jpe?g|png|webp|gif|svg)(\?.*)?$/i.test(buyUrl)) {
    imageUrl = buyUrl;
  }

  return {
    id: `prod_${Date.now()}`,
    ageRange,
    productType,
    miniTitle,
    productName,
    motherlyAdvice,
    steps: steps.length > 0 ? steps : ['کتاب یا پادکست را در محیطی آرام با فرزندتان باز کنید.'],
    publisher,
    discountCode,
    buyUrl,
    imageUrl,
    targetChildId: child.id,
    targetChildName: childName,
    targetChildAge: childAge,
    dismissed: false,
    dateKey: todayDateKey,
  };
}

// Convert product or game to DailyTask for adding to schedule
export function createDailyTaskFromProduct(
  product: ProductSuggestion,
  childId: string,
  targetDate?: string
): Omit<DailyTask, 'id' | 'completed'> {
  let cat: ItemCategoryType = 'برنامه مرور نزدیک';
  if (product.productType.includes('بازی') || product.productType.includes('پازل')) {
    cat = 'بازی مرور';
  } else if (product.productType.includes('پادکست') || product.productType.includes('صوتی')) {
    cat = 'برنامه مرور نزدیک';
  } else {
    cat = 'برنامه مرور نزدیک';
  }

  return {
    childId,
    title: `${product.productType}: ${product.productName}`,
    subtitle: product.publisher ? `ناشر: ${product.publisher}` : product.miniTitle,
    duration: '۱۵ دقیقه',
    category: cat,
    date: targetDate,
    product: product,
    description: product.motherlyAdvice,
    steps: product.steps,
  };
}

export interface DailySuggestionsBundle {
  dateKey: string;
  userId?: string;
  activitySuggestion: SpecialSuggestion;
  productSuggestion: ProductSuggestion;
}

export function saveDailySuggestionsBundle(bundle: DailySuggestionsBundle, userId: string = 'guest') {
  try {
    const BUNDLE_STORAGE_KEY = `maman_daily_bundle_${userId}_${bundle.dateKey}`;
    localStorage.setItem(BUNDLE_STORAGE_KEY, JSON.stringify(bundle));
  } catch (e) {}
}

export function clearDailySuggestionsBundle(userId: string = 'guest', dateKey?: string) {
  try {
    if (dateKey) {
      localStorage.removeItem(`maman_daily_bundle_${userId}_${dateKey}`);
    } else {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith(`maman_daily_bundle_${userId}`) || k.startsWith('maman_daily_bundle_'))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    }
  } catch (e) {}
}

/**
 * Ensures suggestions are selected once per day and LOCKED.
 * Validates that cached suggestions strictly match the current child profile.
 */
export async function getOrInitDailySuggestionsBundle(
  children: Child[],
  todayDateKey: string,
  userId: string = 'guest'
): Promise<DailySuggestionsBundle | null> {
  if (!children || children.length === 0) return null;

  const BUNDLE_STORAGE_KEY = `maman_daily_bundle_${userId}_${todayDateKey}`;
  try {
    const saved = localStorage.getItem(BUNDLE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as DailySuggestionsBundle;
      const actChildId = parsed?.activitySuggestion?.targetChildId;
      const matchingActChild = children.find((c) => c.id === actChildId);
      const prodChildId = parsed?.productSuggestion?.targetChildId;
      const matchingProdChild = children.find((c) => c.id === prodChildId);

      // PROFILING VALIDATION:
      // Bundle is valid ONLY if:
      // 1. date matches today
      // 2. target child still exists in current children
      // 3. target child's name in bundle matches current child's name
      if (
        parsed &&
        parsed.dateKey === todayDateKey &&
        parsed.activitySuggestion &&
        parsed.productSuggestion &&
        matchingActChild &&
        parsed.activitySuggestion.targetChildName === matchingActChild.name &&
        (!prodChildId || (matchingProdChild && parsed.productSuggestion.targetChildName === matchingProdChild.name))
      ) {
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }

  // Not saved or invalidated for today yet. Let's assign children from current children:
  let childForActivity: Child = children[0];
  let childForProduct: Child = children[0];

  if (children.length >= 2) {
    // Pick first child for activity via non-repeating helper
    childForActivity = getDailySelectedChild(children, todayDateKey) || children[0];

    // Pick second child for product from other children if possible
    const otherChildren = children.filter((c) => c.id !== childForActivity.id);
    const candidateChildren = otherChildren.length > 0 ? otherChildren : children;

    const PROD_CHILD_CYCLE_KEY = `maman_prod_child_cycle_${userId}`;
    let visitedProdChildIds: string[] = [];
    try {
      const savedCycle = localStorage.getItem(PROD_CHILD_CYCLE_KEY);
      if (savedCycle) visitedProdChildIds = JSON.parse(savedCycle);
    } catch (e) {}

    let unvisited = candidateChildren.filter((c) => !visitedProdChildIds.includes(c.id));
    if (unvisited.length === 0) {
      visitedProdChildIds = [];
      unvisited = candidateChildren;
    }
    const pickedProductChild =
      unvisited[Math.floor(Math.random() * unvisited.length)] || candidateChildren[0];
    visitedProdChildIds.push(pickedProductChild.id);
    try {
      localStorage.setItem(PROD_CHILD_CYCLE_KEY, JSON.stringify(visitedProdChildIds));
    } catch (e) {}
    childForProduct = pickedProductChild;
  }

  // Generate non-repeating suggestions for each assigned child
  const [activitySuggestion, productSuggestion] = await Promise.all([
    getDailyActivitySuggestion(childForActivity, todayDateKey),
    getDailyProductSuggestion(childForProduct, todayDateKey),
  ]);

  const bundle: DailySuggestionsBundle = {
    dateKey: todayDateKey,
    userId,
    activitySuggestion,
    productSuggestion,
  };

  saveDailySuggestionsBundle(bundle, userId);
  return bundle;
}

