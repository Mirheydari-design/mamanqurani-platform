export interface FormattedStep {
  emoji: string;
  text: string;
}

export interface StaticPedagogicalStep {
  title: string;
  emoji: string;
  desc: string;
}

/**
 * Seven standard pedagogical steps for new Quran memorization (کامل، زیبا، لطیف و استاتیک)
 */
export const NEW_MEMORIZATION_STATIC_STEPS: StaticPedagogicalStep[] = [
  {
    title: 'نگاه دوربینی (تصویربرداری ذهنی)',
    emoji: '📷',
    desc: 'صوت ترتیل استاد را ۵ بار با آرامش پخش کنید. دلبندتان هم‌زمان با نشانگر یا نوک انگشت زیر کلمات ببرد و با تمام دقت و تمرکز به خط و اعراب نگاه کند تا تصویر آیه در ذهن او نقش ببندد.'
  },
  {
    title: 'زمزمه زنبوری (فعال‌سازی سه‌گانه)',
    emoji: '🐝',
    desc: 'صوت ۵ بار دیگر پخش شود؛ این بار کودک با صدایی بسیار آرام در گلو همگام با صوت زمزمه کند تا سه حس بینایی، شنوایی و گویایی هم‌زمان درگیر و فعال شوند.'
  },
  {
    title: 'قایم‌موشکی (آمادگی تسلط)',
    emoji: '🙈',
    desc: 'صوت ۵ بار پخش شود؛ این بار کودک نیمه از حفظ و نیمه با نگاه به قرآن کلمات را همراهی کند تا شیرینی تسلط بر کلمات را تجربه کند.'
  },
  {
    title: 'تلاش شیرین (تلاوت مستقل از حفظ)',
    emoji: '🍯',
    desc: 'صوت را متوقف کنید؛ اکنون از کودک بخواهید با طمأنینه و ترتیل زیبا، کل این قطعه را مستقل از حفظ برای شما بخواند و او را صمیمانه در آغوش گرفته و تشویق کنید.'
  },
  {
    title: 'نخ کردن مرواریدها (پیوستگی آیات)',
    emoji: '📿',
    desc: 'این قطعه جدید را مانند دانه‌ای از تسبیح یا گردنبند مروارید، به آیات قبلی وصل کنید و از ابتدای سوره تا پایان این قطعه را متصل و روان با هم تلاوت نمایید.'
  },
  {
    title: 'نوشتن برای یادگاری (تثبیت دیداری و حرکتی)',
    emoji: '✍️',
    desc: 'از کودک بخواهید این آیه یا قطعه زیبا را یک بار با خط قشنگش در دفترچه یادگاری بنویسد تا برای همیشه در حافظه حرکتی و دیداری او ماندگار شود.'
  },
  {
    title: 'هدیه ثواب (پیوند معنوی و عاطفی)',
    emoji: '💖',
    desc: 'در پایان دست پرمهرش را روی سینه بگذارد و با قلبی شادمان زمزمه کنید: «یا صاحب‌الزمان (عج)، ثواب این تلاوت زیبا و نورانی هدیه به قلب پاک و مهربان شما!»'
  }
];

/**
 * Returns pedagogical steps for new memorization.
 * Under 7 years old: 'نوشتن برای یادگاری' is strictly omitted.
 */
export const getNewMemorizationStaticSteps = (childAge = 5): StaticPedagogicalStep[] => {
  const age = Number(childAge) || 5;
  if (age < 7) {
    return NEW_MEMORIZATION_STATIC_STEPS.filter(s => !s.title.includes('نوشتن'));
  }
  return NEW_MEMORIZATION_STATIC_STEPS;
};

export const isNewMemorizationProgram = (tag?: string, title?: string, itemType?: string): boolean => {
  const t = (tag || '').trim();
  const tit = (title || '').trim();
  if (itemType === 'game' || t.startsWith('بازی') || tit.startsWith('بازی')) {
    return false;
  }
  return t === 'برنامه حفظ جدید' || tit.includes('حفظ جدید') || t.includes('حفظ جدید');
};

/**
 * Ensures each step has an appropriate and delightful emoji.
 * Detects keywords like زمزمه زنبوری, لقمه‌های کوچک, عکس‌برداری, ترتیل, ثواب, etc.
 */
export const formatStepWithEmoji = (stepText: string, index: number): FormattedStep => {
  if (!stepText) return { emoji: '✨', text: '' };

  const trimmed = stepText.trim();

  // Check if stepText already starts with an emoji
  const emojiRegex = /^([\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}][\u{FE00}-\u{FE0F}]?)\s*/u;
  const match = trimmed.match(emojiRegex);
  if (match) {
    return {
      emoji: match[1],
      text: trimmed.slice(match[0].length).trim(),
    };
  }

  const lower = trimmed.toLowerCase();
  let emoji = '';

  if (lower.includes('زنبور') || lower.includes('زمزمه')) {
    emoji = '🐝';
  } else if (lower.includes('لقمه') || lower.includes('تقسیم') || lower.includes('کوچک') || lower.includes('قطعه')) {
    emoji = '🥪';
  } else if (lower.includes('عکس') || lower.includes('چشم') || lower.includes('تصویر') || lower.includes('خیال') || lower.includes('دیدن')) {
    emoji = '📸';
  } else if (lower.includes('صوت') || lower.includes('شنیدن') || lower.includes('استماع') || lower.includes('گوش') || lower.includes('ترتیل')) {
    emoji = '🎧';
  } else if (lower.includes('آبیاری') || lower.includes('آب')) {
    emoji = '💧';
  } else if (lower.includes('باغچه') || lower.includes('گل') || lower.includes('گیاه')) {
    emoji = '🏡';
  } else if (lower.includes('لبخند') || lower.includes('همخوانی') || lower.includes('همراهی') || lower.includes('نوبتی') || lower.includes('یکی‌درمیان')) {
    emoji = '😊';
  } else if (lower.includes('قاری') || lower.includes('تاج') || lower.includes('جایگاه') || lower.includes('افتخار')) {
    emoji = '👑';
  } else if (lower.includes('ضبط') || lower.includes('موبایل') || lower.includes('گوشی') || lower.includes('رادیو')) {
    emoji = '📱';
  } else if (lower.includes('پاداش') || lower.includes('ستاره') || lower.includes('مدال') || lower.includes('جایزه') || lower.includes('تشویق')) {
    emoji = '🌟';
  } else if (lower.includes('ثواب') || lower.includes('امام زمان') || lower.includes('اهل‌بیت') || lower.includes('زهرا') || lower.includes('پیامبر') || lower.includes('دعا') || lower.includes('هدیه')) {
    emoji = '🤲';
  } else if (lower.includes('بازی') || lower.includes('مسابقه') || lower.includes('توپ') || lower.includes('تاس') || lower.includes('کارت')) {
    emoji = '🎲';
  } else if (lower.includes('سفر') || lower.includes('حرکت') || lower.includes('ایستگاه') || lower.includes('قطار')) {
    emoji = '🚂';
  } else if (lower.includes('خوراکی') || lower.includes('عصرانه') || lower.includes('میوه') || lower.includes('سفره')) {
    emoji = '🍎';
  } else if (lower.includes('کعبه') || lower.includes('مسجد') || lower.includes('نماز')) {
    emoji = '🏛️';
  } else if (lower.includes('هدف') || lower.includes('پرتاب')) {
    emoji = '🎯';
  } else {
    const defaultEmojis = ['🎯', '✨', '🎈', '🌿', '⭐', '💡', '🌈'];
    emoji = defaultEmojis[index % defaultEmojis.length];
  }

  return { emoji, text: trimmed };
};
