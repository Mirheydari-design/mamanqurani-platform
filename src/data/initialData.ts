import { UserProfile, ExperiencePost, GameCard, DailyTask, SpecialSuggestion, Child } from '../types';

export const initialChildren: Child[] = [
  {
    id: 'child_ali',
    name: 'علی',
    age: 5,
    goal: 'انس و حفظ سوره‌های کوتاه جزء ۳۰',
    hasStartedMemorization: true,
    memorizationScope: 'سوره‌های فیل تا ناس',
    avatarColor: 'bg-[#FEE4D6] text-[#D97706]',
    surahProgress: [
      { surah: 'سوره کوثر', progress: 100, status: 'memorized', lastReviewed: 'دیروز' },
      { surah: 'سوره فیل', progress: 100, status: 'memorized', lastReviewed: 'دیروز' },
      { surah: 'سوره قریش', progress: 75, status: 'learning', lastReviewed: 'امروز' },
      { surah: 'سوره ماعون', progress: 40, status: 'learning' },
    ],
  },
  {
    id: 'child_fatemeh',
    name: 'فاطمه سادات',
    age: 7,
    goal: 'تدبر در آیات موضوعی و حفظ منظم',
    hasStartedMemorization: true,
    memorizationScope: 'جزء ۳۰ کامل و شروع جزء ۲۹',
    avatarColor: 'bg-[#E0F2FE] text-[#0369A1]',
    surahProgress: [
      { surah: 'جزء ۳۰', progress: 100, status: 'memorized', lastReviewed: 'هفته گذشته' },
      { surah: 'سوره نبأ', progress: 70, status: 'learning', lastReviewed: 'دیروز' },
      { surah: 'سوره نازعات', progress: 35, status: 'learning' },
    ],
  },
];

export const defaultProfile: UserProfile = {
  id: 'user_me',
  username: '',
  phoneOrEmail: '',
  children: [],
  activeChildId: undefined,
  isAuthenticated: false,
};

export const sampleGameElephant: GameCard = {
  id: 'game_elephant_1',
  title: 'بازی پرندگان نگهبان و سنگریزه‌های ابابیل',
  surah: 'سوره فیل',
  topic: 'داستان ابرهه و پرندگان ابابیل',
  description: 'یک بازی پرنشاط خانگی برای تثبیت روان سوره فیل و مفهوم قدرت خداوند و پرندگان نگهبان کعبه.',
  materials: ['چند کوسن یا بالش برای نماد کعبه', 'توپ‌های سبک یا جوراب گلوله شده', 'تصویر یا نقاشی فیل'],
  steps: [
    'کوسن‌ها را مثل یک خانه کوچک وسط اتاق قرار دهید تا نماد کعبه باشد.',
    'کودک با خواندن هر آیه یک توپ را به سوی هدف پرتاب می‌کند.',
    'با اتمام آیه آخر، لشکر ابرهه شکست می‌خورد و جشن کوچک تشویقی می‌گیرید.'
  ],
  duration: '۱۰ دقیقه',
  ageRange: '۴ تا ۷ سال',
  tag: 'بازی حفظ جدید',
  itemType: 'game',
  savedAt: 'امروز',
  isCustom: false,
};

export const sampleGameQuraysh: GameCard = {
  id: 'game_quraysh_1',
  title: 'بازی قطار سفر تابستانه و زمستانه قریش',
  surah: 'سوره قریش',
  topic: 'امنیت و سفرهای بازرگانی و شکرگزاری از خدا',
  description: 'بازی وانمودی سفر با چمدان کوچک برای درک «رحلة الشتاء و الصیف» و شکرگزاری از نعمت امنیت.',
  materials: ['یک ساک یا جعبه مقوایی کوچک', 'چند خوراکی سالم میوه یا خرما', 'نقشه ساده خانگی روی فرش'],
  steps: [
    'فرش اتاق را به دو ایستگاه زمستان و تابستان تقسیم کنید.',
    'کودک وسایل سفر را در جعبه می‌گذارد و با خواندن آیه ۲ به سمت ایستگاه بعدی حرکت می‌کند.',
    'در مقصد با خواندن «فلیعبدوا رب هذا البیت» خوراکی را به نشانه رزق خداوند میل می‌کند.'
  ],
  duration: '۸ دقیقه',
  ageRange: '۴ تا ۸ سال',
  tag: 'بازی مرور',
  itemType: 'game',
  savedAt: 'دیروز',
  isCustom: false,
};

export const sampleGameKawthar: GameCard = {
  id: 'game_kawthar_1',
  title: 'چشمه نیکی و حوض کوثر',
  surah: 'سوره کوثر',
  topic: 'خیر کثیر و محبت به حضرت زهرا (س)',
  description: 'بازی حسی-آبی ساده در آشپزخانه یا حیاط برای آموزش مفهوم چشمه زلال و برکت فراوان.',
  materials: ['یک کاسه آب تمیز', 'برگ گل یا قطره‌چکان', 'لیوان‌های کوچک'],
  steps: [
    'کاسه آب را وسط بگذارید و بگویید کوثر یعنی چشمه‌ای بی‌پایان از مهربانی.',
    'با خواندن هر آیه، با قطره‌چکان آب به لیوان‌های دیگر منتقل کنید و از کارهای خوبی که امروز انجام داده صحبت کنید.'
  ],
  duration: '۱۰ دقیقه',
  ageRange: '۳ تا ۶ سال',
  tag: 'بازی تحویل',
  itemType: 'game',
  savedAt: '۲ روز پیش',
  isCustom: false,
};

export const sampleGameKafirun: GameCard = {
  id: 'game_kafirun_jump',
  title: 'بازی مارپله فرشی کلمات سوره کافرون',
  surah: 'سوره کافرون',
  topic: 'ثبات قدم در یکتاپرستی و تمرین واژگان سوره',
  description: 'یک بازی پرجنب‌وجوش و حرکتی خانگی برای یادگیری آیات سوره کافرون بدون خستگی و با پرش روی مربع‌های فرشی.',
  materials: ['چسب کاغذی نواری روی فرش یا سرامیک', 'کارت‌های کاغذی شماره‌دار یا تاس اسفنجی'],
  steps: [
    'با چسب کاغذی ۴ یا ۶ مربع بزرگ روی فرش ترسیم کنید و شماره آیه یا کلمه اول را بنویسید.',
    'کودک با پرتاب تاس روی مربع مربوطه می‌پرد و آیه را با صدای رسا و پرانرژی تلاوت می‌کند.',
    'با رسیدن به خانه پایانی «لکم دینکم ولی دین»، علامت پرچم پیروزی را بالا می‌برد.'
  ],
  duration: '۱۰ دقیقه',
  ageRange: '۴ تا ۸ سال',
  tag: 'بازی حرکتی',
  itemType: 'game',
};

export const sampleGameTariqStars: GameCard = {
  id: 'game_tariq_stars',
  title: 'بازی شکار ستاره‌های درخشان سوره طارق',
  surah: 'سوره طارق',
  topic: 'آشنایی با آسمان، ستاره طارق و عظمت آفرینش',
  description: 'بازی مهیج شبانه با چراغ‌قوه در اتاق کم‌نور برای رفع ترس شبانه و انس شیرین با آیات سوره طارق.',
  materials: ['چراغ‌قوه یا نور گوشی', 'چند ستاره کاغذی یا شبرنگ روی سقف و دیوار'],
  steps: [
    'چند ستاره کوچک با کاغذ زرد ببرید و روی دیوار یا سقف بچسبانید.',
    'چراغ اتاق را کم کنید؛ کودک نقش شکارچی ستاره را می‌گیرد و با نور چراغ‌قوه روی هر ستاره می‌اندازد.',
    'با روشن شدن هر ستاره، یک آیه از سوره طارق تلاوت می‌شود تا سوره کامل شود.'
  ],
  duration: '۸ دقیقه',
  ageRange: '۴ تا ۷ سال',
  tag: 'بازی شبانه',
  itemType: 'game',
};

export const sampleGameNasrBowling: GameCard = {
  id: 'game_nasr_bowling',
  title: 'بولینگ هیجانی لیوان‌های سوره نصر',
  surah: 'سوره نصر',
  topic: 'پیروزی و شکرگزاری الهی با چالش پرتاب توپ',
  description: 'یک مسابقه ورزشی ساده و شاد خانگی برای تثبیت سریع و با نشاط ۳ آیه سوره مبارکه نصر.',
  materials: ['چند عدد لیوان یکبارمصرف یا قوطی خالی', 'توپ تنیس، جوراب گلوله‌شده یا توپ سبک'],
  steps: [
    '۳ یا ۶ لیوان را به شکل هرم بچینید و روی هر کدام شماره آیه‌های ۱ تا ۳ را بنویسید.',
    'کودک از فاصله دو متری توپ را پرتاب می‌کند؛ لیوانی که افتاد باید آیه‌اش تلاوت و تشویق شود.',
    'در آیه آخر «فسبح بحمد ربک»، همه با هم دست می‌زنند و هورا می‌کشند.'
  ],
  duration: '۱۰ دقیقه',
  ageRange: '۳ تا ۷ سال',
  tag: 'بازی رقابتی',
  itemType: 'game',
};

export const sampleGameFalaqClay: GameCard = {
  id: 'game_falaq_clay',
  title: 'دژ خمیری و پناهگاه امن سوره فلق',
  surah: 'سوره فلق',
  topic: 'پناه بردن به خدای مهربان در برابر هرگونه ترس و تاریکی',
  description: 'بازی ساختنی با خمیربازی برای ملموس کردن مفهوم زیبای پناهگاه الهی و تقویت آرامش روانی کودک.',
  materials: ['خمیربازی چندرنگ یا گل سفالگری', 'یک عروسک یا فیگور کوچک اسباب‌بازی'],
  steps: [
    'عروسک کوچک کودک را در مرکز قرار دهید تا نماد خود کودک باشد.',
    'با هر آیه سوره فلق، با خمیربازی یک دیوار محکم و زیبا دور عروسک بسازید.',
    'توضیح دهید که گفتن این سوره مثل داشتن این قلعه محکم از محبت خداست.'
  ],
  duration: '۱۲ دقیقه',
  ageRange: '۳ تا ۶ سال',
  tag: 'بازی کاردستی و حسی',
  itemType: 'game',
};

export const initialSpecialSuggestion: SpecialSuggestion = {
  id: 'suggestion_today',
  dateKey: '1404-10-29',
  badge: 'پیشنهاد ویژه',
  text: 'یکم برنامه‌ها تو تنظیم کن و وقت بذار که بیشتر با فرزندت زمان بگذاری و از آخر جزء 30 شروع کنی و به عقب برگردید',
  gameCard: sampleGameElephant,
  dismissed: false,
};

export const initialDailyTasks: DailyTask[] = [
  // برنامه‌های علی
  {
    id: 'task_ali_1',
    childId: 'child_ali',
    title: 'حفظ سوره فیل',
    subtitle: 'همخوانی ریتمیک همراه با بازی پرندگان',
    duration: '۵ دقیقه',
    completed: false,
    category: 'برنامه حفظ جدید',
  },
  {
    id: 'task_ali_2',
    childId: 'child_ali',
    title: 'بازی خانگی سنگریزه‌های ابابیل',
    subtitle: 'پرتاب توپ‌های نرم به سمت سبد با خواندن آیات',
    duration: '۱۰ دقیقه',
    completed: false,
    category: 'بازی حفظ جدید',
  },
  {
    id: 'task_ali_3',
    childId: 'child_ali',
    title: 'مرور سوره کوثر',
    subtitle: 'هنگام چیدن عصرانه در کنار مادر',
    duration: '۵ دقیقه',
    completed: false,
    category: 'برنامه مرور نزدیک',
  },

  // برنامه‌های فاطمه سادات
  {
    id: 'task_fatemeh_1',
    childId: 'child_fatemeh',
    title: 'حفظ آیات ۱ تا ۵ نبأ',
    subtitle: 'استماع صوت استاد منشاوی و تکرار همزمان',
    duration: '۸ دقیقه',
    completed: false,
    category: 'برنامه حفظ جدید',
  },
  {
    id: 'task_fatemeh_2',
    childId: 'child_fatemeh',
    title: 'مرور سوره انشقاق',
    subtitle: 'تثبیت محفوظات گذشته با جدول ستاره‌ای',
    duration: '۱۰ دقیقه',
    completed: false,
    category: 'برنامه مرور دور',
  },
  {
    id: 'task_fatemeh_3',
    childId: 'child_fatemeh',
    title: 'تحویل سوره اعلی',
    subtitle: 'تلاوت با رعایت وقف و تجوید کودکانه',
    duration: '۵ دقیقه',
    completed: false,
    category: 'تحویل حفظ',
  },
];

export const initialExperiences: ExperiencePost[] = [
  {
    id: 'post_v4_1',
    authorId: 'user_avina',
    authorName: 'مادر آوینا',
    authorChildName: 'آوینا',
    authorChildAge: 4,
    authorBadge: 'مادر پویا',
    authorAvatarColor: 'bg-[#F5F3FF] text-[#7C3AED]',
    text: 'دخترم ۴ سالشه، موقع حفظ چشماشو می‌بنده و مثل پنگوئن دور هال تلوتلو می‌خوره و می‌خونه! 😅 به نظرتون جلوشو بگیرم؟ می‌ترسم سرش گیج بره، ولی تا می‌شینه یادش میره کجای سوره بود!',
    createdAt: '۸ دقیقه پیش',
    helpfulCount: 24,
    hasUserMarkedHelpful: false,
    comments: [
      {
        id: 'c_v4_1_1',
        authorName: 'مامان کیان',
        authorChild: 'مادر کیان ۴ ساله',
        text: 'وااای نگو! پسر من مثل هلیکوپتر می‌چرخه دور خودش 😂 این نشانه هوش حرکتی بچه‌هاست، بذار راحت باشه اصلاً دست بهش نزن.',
        createdAt: '۵ دقیقه پیش',
        replies: []
      },
      {
        id: 'c_v4_1_2',
        authorName: 'خانم موسوی',
        authorChild: 'مربی مهد قرآن',
        text: 'سلام عزیزم، به این می‌گن یادگیری جنبشی (Kinesthetic). برای این بچه‌ها حرکت یعنی پردازش مغزی. اصلاً متوقفش نکنید که ذوقش کور نشه.',
        createdAt: '۳ دقیقه پیش',
        replies: [
          {
            id: 'r_v4_1_2_1',
            authorName: 'مادر آوینا',
            authorChild: 'نویسنده تجربه',
            text: 'خیالم خیلی راحت شد خانم موسوی جان، همسرم اصرار داشت باید مودب بشینه. سپاسگزارم!',
            createdAt: '۱ دقیقه پیش'
          }
        ]
      }
    ]
  },
  {
    id: 'post_v4_2',
    authorId: 'user_sahar_kian',
    authorName: 'مامان کیان',
    authorChildName: 'کیان',
    authorChildAge: 4,
    authorBadge: 'مادر صبور',
    authorAvatarColor: 'bg-[#FDF2F8] text-[#DB2777]',
    text: 'یه سوال عجیب و مبهم از مامانا... کیان موقع خوندن سوره فیل دستشو می‌کنه مثل خرطوم، تا صدای شیپور فیل درنیاره آیه بعد رو نمیگه! 🤦‍♀️ همسرم میگه این بی‌احترامی به قرآنه ولی من میگم بذار با بازی انس بگیره. واقعاً چی درسته؟ گیج شدم...',
    createdAt: '۲۲ دقیقه پیش',
    helpfulCount: 38,
    hasUserMarkedHelpful: false,
    comments: [
      {
        id: 'c_v4_2_1',
        authorName: 'خانم هدایتی',
        authorChild: 'مدرس تخصصی کودک',
        text: 'اصلاً بی‌احترامی نیست مادر گل! برای کودک ۴ ساله تصویرسازی حسی زیباترین شکل تفهم آیه است. همین شیپور زدن باعث شده عاشق سوره فیل بشه.',
        createdAt: '۱۸ دقیقه پیش',
        replies: []
      },
      {
        id: 'c_v4_2_2',
        authorName: 'مادر علی‌اصغر',
        authorChild: 'مادر علی‌اصغر ۵ ساله',
        text: 'دقیقاً، علی‌اصغر هم موقع طیر ابابیل بال می‌زد تو آسمون! الان که بزرگتر شده خیلی محترمانه و قشنگ می‌خونه.',
        createdAt: '۱۰ دقیقه پیش',
        replies: []
      }
    ]
  },
  {
    id: 'post_v4_3',
    authorId: 'user_pedar_ahmad',
    authorName: 'پدر احمدرضا',
    authorChildName: 'احمدرضا',
    authorChildAge: 5,
    authorBadge: 'پدر همراه',
    authorAvatarColor: 'bg-[#EFF6FF] text-[#1D4ED8]',
    text: 'سلام به همه والدین گرامی. من پدر احمدرضا هستم. پسرم به هیچ وجه حاضر نبود پشت میز یا کنار مادرش بشینه و سوره کافرون رو تکرار کنه. جمعه صبح با چسب کاغذی روی فرش ۴ تا خانه کشیدیم به اسم «مارپله فرشی کافرون». با هر تاس می‌پرید روی خانه و آیه رو با داد و انرژی می‌خوند! الان جمعه‌ها خودش بیدارم می‌کنه میگه بابا بدو بریم کافرون بازی کنیم. کارت بازی رو پیوست کردم، اگه پسر شیطون دارید حتما امتحان کنید 🎲',
    createdAt: '۳۵ دقیقه پیش',
    helpfulCount: 62,
    hasUserMarkedHelpful: false,
    attachedGameCard: sampleGameKafirun,
    comments: [
      {
        id: 'c_v4_3_1',
        authorName: 'مادر مهدی',
        authorChild: 'مادر مهدی ۶ ساله',
        text: 'درود بر پدرهای همراه و خلاق! ما هم دقیقا مشکل بی‌قراری پسرمون رو داشتیم، کارتتون رو ذخیره کردم خدا خیرتون بده.',
        createdAt: '۲۵ دقیقه پیش',
        replies: []
      },
      {
        id: 'c_v4_3_2',
        authorName: 'خاله فرزانه',
        authorChild: 'مربی مهد کودک',
        text: 'احسنت! من این متد پریدن روی حروف و کلمات رو توی مهدقرآن اجرا می‌کنم و معجزه حفظ پسربچه‌هاست.',
        createdAt: '۱۵ دقیقه پیش',
        replies: []
      }
    ]
  },
  {
    id: 'post_v4_4',
    authorId: 'user_younes',
    authorName: 'مادر یونس',
    authorChildName: 'یونس',
    authorChildAge: 4,
    authorBadge: 'مادر مهربان',
    authorAvatarColor: 'bg-[#FEE4D6] text-[#D97706]',
    text: 'بچه‌ها من واقعا کلافه‌ام... بعد از دو هفته تمرین آرام، امروز یونس وسط سوره کوثر زد زیر گریه و گفت: من اصلاً حوض کوثر نمی‌خوام، من فقط ماشین آتش‌نشانی می‌خوام! 😭 خنده‌م گرفته بود ولی از طرفی حس ناتوانی و شکست کردم. کسی بوده تو این مرحله بیفته؟',
    createdAt: '۴۸ دقیقه پیش',
    helpfulCount: 45,
    hasUserMarkedHelpful: false,
    comments: [
      {
        id: 'c_v4_4_1',
        authorName: 'مادر سلاله',
        authorChild: 'مادر سلاله ۳ ساله',
        text: 'عزیزم آروم باش، کاملاً طبیعیه! دنیای بچه‌ها ملموس و عینیه. بهش بگو توی اون بهشت زیبا برای بچه‌های خوب بهترین ماشین آتش‌نشانی قرمز رو هدیه میارن! فضا رو براش کودکانه کن.',
        createdAt: '۳۵ دقیقه پیش',
        replies: [
          {
            id: 'r_v4_4_1_1',
            authorName: 'مادر یونس',
            authorChild: 'نویسنده تجربه',
            text: 'وای چقدر این ایده قشنگ بود، واقعاً دلم آروم گرفت، ممنونم از دلگرمیت ❤️',
            createdAt: '۲۰ دقیقه پیش'
          }
        ]
      }
    ]
  },
  {
    id: 'post_v4_5',
    authorId: 'user_bahar_mahdi',
    authorName: 'مادر محمدمهدی',
    authorChildName: 'محمدمهدی',
    authorChildAge: 7,
    authorBadge: 'پژوهشگر لحن',
    authorAvatarColor: 'bg-[#ECFDF5] text-[#059669]',
    text: 'تجوید رو از چند سالگی شروع کنیم؟ محمدمهدی ۷ سالشه و میره اول دبستان، بین «س» و «ص» یا «ت» و «ط» تفکیک نمیده. مربی می‌گه سخت نگیر فقط روان بخونه، ولی همسرم می‌گه اگر الان یاد نگیره بعداً اصلاحش سخته. مغزم هنگ کرده... تجربه شما چی میگه؟',
    createdAt: '۱ ساعت پیش',
    helpfulCount: 31,
    hasUserMarkedHelpful: false,
    comments: [
      {
        id: 'c_v4_5_1',
        authorName: 'خانم هدایتی',
        authorChild: 'مدرس تخصصی کودک',
        text: 'تا قبل از ۸ سالگی اصلاً روی تجوید خشک و نام‌گذاری قواعد اصرار نکنید. گوش کودک باید فقط با ترتیل فصیح آشنا بشه. وسواس لحنی باعث لکنت و دلزدگی کودک میشه.',
        createdAt: '۴۵ دقیقه پیش',
        replies: []
      }
    ]
  },
  {
    id: 'post_v4_6',
    authorId: 'user_taranom',
    authorName: 'مادر ترنم',
    authorChildName: 'ترنم',
    authorChildAge: 5,
    authorBadge: 'مادر صبور',
    authorAvatarColor: 'bg-[#FEF9C3] text-[#A16207]',
    text: 'ترفند چوب‌شور معجزه کرد! 🥨 برای هر آیه سوره عصر که درست می‌خوند یک چوب‌شور می‌انداختم تو لیوانش. آخرش رفت پیش باباش با لیوان پر از چوب‌شور گفت ببین چقدر قرآن بلدم! خیلی راحت و با شوخی و خنده سوره تموم شد.',
    createdAt: '۱ ساعت پیش',
    helpfulCount: 52,
    hasUserMarkedHelpful: false,
    comments: [
      {
        id: 'c_v4_6_1',
        authorName: 'مادر دوقلوها',
        authorChild: 'مادر طاها و یاسین ۵ ساله',
        text: 'ایده خوشمزه و بی‌دردسر! من با پسته و نخودچی کشمش امتحان می‌کنم فردا.',
        createdAt: '۵۰ دقیقه پیش',
        replies: []
      }
    ]
  },
  {
    id: 'post_v4_7',
    authorId: 'user_parniyan',
    authorName: 'مادر پرنیان',
    authorChildName: 'پرنیان',
    authorChildAge: 4,
    authorBadge: 'مادر هنرمند',
    authorAvatarColor: 'bg-[#FFF7ED] text-[#EA580C]',
    text: 'اگر فرزندتون از اسم سوره‌ها یا تاریکی شب می‌ترسه: دیشب با سوره طارق «عملیات ستاره شب‌تاب» رفتیم. چراغ اتاق رو خاموش کردیم، با چراغ‌قوه دنبال ستاره‌های کاغذی روی سقف گشتیم و با هر آیه یک ستاره روشن می‌شد! دخترم با عشق کلمه النجم الثاقب رو تکرار می‌کرد. کارت بازیش رو اینجا گذاشتم حتماً ببینید ✨',
    createdAt: '۱ ساعت پیش',
    helpfulCount: 74,
    hasUserMarkedHelpful: false,
    attachedGameCard: sampleGameTariqStars,
    comments: [
      {
        id: 'c_v4_7_1',
        authorName: 'مادر آوینا',
        authorChild: 'مادر آوینا ۴ ساله',
        text: 'چه خلاقیت رویایی و قشنگی! دختر من عاشق تاریک‌بازی با چراغ‌قوه‌ست، امشب حتما تست می‌کنم.',
        createdAt: '۴۰ دقیقه پیش',
        replies: []
      }
    ]
  },
  {
    id: 'post_v4_8',
    authorId: 'user_alireza',
    authorName: 'مادر علی‌رضا',
    authorChildName: 'علی‌رضا',
    authorChildAge: 6,
    authorBadge: 'مادر همراه',
    authorAvatarColor: 'bg-[#ECFDF5] text-[#059669]',
    text: 'امروز سوره فلق رو می‌خوندیم رسیدیم به «من شر غاسق اذا وقب». پسرم ترسید گفت مامان یعنی شب گرگ میاد؟! 🐺 هر چی توضیح دادم منظور تاریکی شبه، دستمو ول نمی‌کرد. چطور این مفاهیم رو برای بچه بگیم که بار منفی یا ترس ایجاد نکنه؟',
    createdAt: '۲ ساعت پیش',
    helpfulCount: 42,
    hasUserMarkedHelpful: false,
    comments: [
      {
        id: 'c_v4_8_1',
        authorName: 'خانم موسوی',
        authorChild: 'مربی مهد قرآن',
        text: 'به جای توضیح تاریکی یا خطر، روی بخش پناهگاه تاکید کنید. بگید خدا مثل این پتو که دورت می‌پیچم، ما رو از هر نگرانی در آغوش می‌گیره.',
        createdAt: '۱ ساعت پیش',
        replies: []
      }
    ]
  },
  {
    id: 'post_v4_9',
    authorId: 'user_arshida',
    authorName: 'مادر آرشیدا و نوزادم',
    authorChildName: 'آرشیدا',
    authorChildAge: 5,
    authorBadge: 'مادر چندنقشه',
    authorAvatarColor: 'bg-[#F5F3FF] text-[#7C3AED]',
    text: 'روایت یک مادر با نوزاد نق‌نقو: امروز شیر سر رفت، نوزاد گریه می‌کرد، آرشیدا هم وسط هال با صدای بلند داد می‌زد: مامان بیا من «تبت یدا» رو حفظ شدم بشنو! 😂 بچه به بغل رفتم و با هم آیه آخر رو همنوایی کردیم. خواستم بگم محیط آموزش لازم نیست شیک و آرامش مطلق باشه، تو دل همین شلوغی‌های زندگی جریان داره!',
    createdAt: '۲ ساعت پیش',
    helpfulCount: 89,
    hasUserMarkedHelpful: false,
    comments: [
      {
        id: 'c_v4_9_1',
        authorName: 'مادر حسام، حلما و هادی',
        authorChild: 'مادر ۳ فرزندی',
        text: 'هزار آفرین به شما مادر قهرمان! واقعی‌ترین پستی بود که تو این مدت خوندم، خدا قوت.',
        createdAt: '۱ ساعت پیش',
        replies: []
      }
    ]
  },
  {
    id: 'post_v4_10',
    authorId: 'user_khale_farzaneh',
    authorName: 'خاله فرزانه',
    authorChildName: 'مربی مهد کودک',
    authorChildAge: 6,
    authorBadge: 'مربی بازی',
    authorAvatarColor: 'bg-[#FEF3C7] text-[#D97706]',
    text: 'سوره نصر رو با بولینگ لیوان‌های یکبار مصرف تمرین کردیم! ۳ تا لیوان چیدیم، کودک با توپ پرتاب می‌کرد و لیوانی که می‌افتاد آیه‌ش رو با فریاد شادی می‌خوند. تا پیروزی کامل یعنی اذا جاء نصر الله! کارت مرحله‌به‌مرحله پیوست شد 🎳',
    createdAt: '۳ ساعت پیش',
    helpfulCount: 63,
    hasUserMarkedHelpful: false,
    attachedGameCard: sampleGameNasrBowling,
    comments: [
      {
        id: 'c_v4_10_1',
        authorName: 'مامان کیان',
        authorChild: 'مادر کیان ۴ ساله',
        text: 'ما الان این بازی رو با قوطی‌های خالی انجام دادیم، محشر بود بچه‌ها از خنده غش کرده بودن!',
        createdAt: '۲ ساعت پیش',
        replies: []
      }
    ]
  },
  {
    id: 'post_v4_11',
    authorId: 'user_zeinab',
    authorName: 'مادر زینب',
    authorChildName: 'زینب',
    authorChildAge: 5,
    authorBadge: 'مادر صبور',
    authorAvatarColor: 'bg-[#F8FAFC] text-[#475569]',
    text: 'صوت کدوم قاری برای دختر ۵ ساله جذاب‌تره؟ منشاوی کودک رو گذاشتم بعضی کلمات رو خیلی تند رد میشه، پرهیزگار هم لحنش سنگینه براش. شما چی تو ماشین یا خونه پلی می‌کنید؟',
    createdAt: '۳ ساعت پیش',
    helpfulCount: 35,
    hasUserMarkedHelpful: false,
    comments: [
      {
        id: 'c_v4_11_1',
        authorName: 'مادر سلاله',
        authorChild: 'مادر سلاله ۳ ساله',
        text: 'ترتیل استاد خلیل الحصری همراه با تکرار کودک خیلی شمرده و استاندارده.',
        createdAt: '۲ ساعت پیش',
        replies: []
      },
      {
        id: 'c_v4_11_2',
        authorName: 'خانم هدایتی',
        authorChild: 'مدرس تخصصی کودک',
        text: 'صوت مشاری العفاسی با همخوانی کودک یا صلوات‌زاده برای شروع کودکان زیر ۶ سال ملایم‌ترین و جذاب‌ترین لحنه.',
        createdAt: '۱ ساعت پیش',
        replies: []
      }
    ]
  },
  {
    id: 'post_v4_12',
    authorId: 'user_fatemeh',
    authorName: 'مادر مهدی',
    authorChildName: 'مهدی',
    authorChildAge: 6,
    authorBadge: 'مربی بازی',
    authorAvatarColor: 'bg-[#E0F2FE] text-[#0369A1]',
    text: 'بزرگترین اشتباه اینه که وقتی بچه داره با ماشینش ویراژ میده بگی «بیا مودب بشین سوره رو بخون»! سریع لج می‌کنه. من رفتم جلوش و گفتم: «پلیس راهور! این ماشین برای عبور از تونل باید رمز سوره توحید رو بگه!» درجا خوند و گاز داد رفت! 🚗💨',
    createdAt: '۴ ساعت پیش',
    helpfulCount: 95,
    hasUserMarkedHelpful: false,
    comments: [
      {
        id: 'c_v4_12_1',
        authorName: 'پدر احمدرضا',
        authorChild: 'پدر احمدرضا ۵ ساله',
        text: 'دمت گرم، تکنیک رمز عبور پلیس شاهکاره! منم برای کارت بازی عصر استفاده می‌کنم.',
        createdAt: '۲ ساعت پیش',
        replies: []
      }
    ]
  },
  {
    id: 'post_v4_13',
    authorId: 'user_solaleh',
    authorName: 'مادر سلاله',
    authorChildName: 'سلاله',
    authorChildAge: 3,
    authorBadge: 'مادر خلاق',
    authorAvatarColor: 'bg-[#FDF2F8] text-[#9D174D]',
    text: 'برای سوره فلق یک دژ خمیری ساختیم. با هر آیه یک دیوار محافظتی کشیدیم و سلاله عروسکش رو گذاشت وسط و گفت اینجا امن‌ترین جای دنیاست پیش خدا. کارت ساخت دژ خمیری رو گذاشتم حتماً ببینید 🛡️',
    createdAt: '۴ ساعت پیش',
    helpfulCount: 57,
    hasUserMarkedHelpful: false,
    attachedGameCard: sampleGameFalaqClay,
    comments: [
      {
        id: 'c_v4_13_1',
        authorName: 'مادر پرنیان',
        authorChild: 'مادر پرنیان ۴ ساله',
        text: 'چقدر لمس خمیربازی به درک معانی انتزاعی کمک می‌کنه. دست‌مریزاد سلاله جان!',
        createdAt: '۲ ساعت پیش',
        replies: []
      }
    ]
  },
  {
    id: 'post_v4_14',
    authorId: 'user_mohaddeseh',
    authorName: 'مادر علی‌اصغر',
    authorChildName: 'علی‌اصغر',
    authorChildAge: 5,
    authorBadge: 'مادر صبور',
    authorAvatarColor: 'bg-[#FFF1F2] text-[#E11D48]',
    text: 'امروز بعد از سه هفته وقفه، موقع سوار شدن به آسانسور خودش بی مقدمه شروع کرد زیر لب سوره قدر رو خوندن. مامانا نگران سکوت‌های بچه‌ها نباشید، بذرهایی که با محبت می‌کاریم بی‌صدا در جانشون ریشه می‌دوانند 🌱🤍',
    createdAt: '۵ ساعت پیش',
    helpfulCount: 112,
    hasUserMarkedHelpful: false,
    comments: [
      {
        id: 'c_v4_14_1',
        authorName: 'خانم موسوی',
        authorChild: 'مربی مهد قرآن',
        text: 'این یعنی تجلی فطری کلام خدا در ضمیر پاک کودک. خدا حفظش کنه ان‌شاءالله.',
        createdAt: '۳ ساعت پیش',
        replies: []
      }
    ]
  },
  {
    id: 'post_1',
    authorId: 'user_zahra',
    authorName: 'مادر سارا',
    authorChildName: 'سارا',
    authorChildAge: 4,
    authorBadge: 'مادر خلاق',
    authorAvatarColor: 'bg-[#FEE4D6] text-[#D97706]',
    text: 'مامان‌ها سلام! ما برای حفظ سوره شمس به مشکل خورده بودیم چون طولانی بود و سارا وسطش بی‌حوصله می‌شد. یک مقوای گرد بریدیم، وسطش نوشتیم سوره شمس و دورش ۱۵ تا پرتو با کاغذ زرد و نارنجی چسبوندیم. سارا هر روز فقط یک آیه رو گوش می‌داد و یک پرتو رو رنگ می‌کرد یا استیکر پروانه می‌چسبوند. باورم نمی‌شد ولی بعد از دو هفته خورشید کامل شد و تمام سوره رو با ذوق خوند! شکستن سوره به قطعات خیلی ریز معجزه می‌کنه 🌱',
    createdAt: '۲ ساعت پیش',
    helpfulCount: 28,
    hasUserMarkedHelpful: false,
    comments: [
      {
        id: 'c_1',
        authorName: 'مادر محمد',
        authorChild: 'مادر محمد ۶ ساله',
        text: 'چه ایده لطیفی! پرتوها رو به ترتیب شماره آیه گذاشتید؟ ما هم برای سوره فجر می‌تونیم استفاده کنیم؟',
        createdAt: '۱ ساعت پیش',
        replies: [
          {
            id: 'r_1',
            authorName: 'مادر سارا',
            authorChild: 'نویسنده تجربه',
            text: 'سلام عزیزم، بله دقیقاً شماره زدیم. برای سوره فجر هم عالیه، فقط می‌تونید به جای خورشید، یک آسمان با ستاره‌های طلایی بکشید.',
            createdAt: '۴۵ دقیقه پیش',
          }
        ]
      }
    ]
  },
  {
    id: 'post_2',
    authorId: 'user_fatemeh',
    authorName: 'مادر مهدی',
    authorChildName: 'مهدی',
    authorChildAge: 6,
    authorBadge: 'مربی بازی',
    authorAvatarColor: 'bg-[#E0F2FE] text-[#0369A1]',
    text: 'اگر پسر پرانرژی دارید که یک دقیقه هم آروم نمی‌شینه، لطفاً کتاب قرآن رو جلوش باز نکنید و نگید "بشین گوش بده"! ما بازی قطار سفر قریش رو انجام دادیم؛ روی فرش ایستگاه تابستان و زمستان درست کردیم، چمدون اسباب‌بازیش رو برداشت و با خواندن هر آیه حرکت می‌کرد. الان هر وقت سوره قریش رو می‌خونه خودش با ذوق داد می‌زنه "رحلة الشتاء و الصیف یعنی سفر زمستونی و تابستونی!" کارت بازی رو الصاق کردم حتما ببینید 🚂',
    createdAt: '۴ ساعت پیش',
    helpfulCount: 45,
    hasUserMarkedHelpful: false,
    attachedGameCard: sampleGameQuraysh,
    comments: [
      {
        id: 'c_2',
        authorName: 'مادر آرتین',
        authorChild: 'مادر آرتین ۵ ساله',
        text: 'ما هم انجام دادیم! بچه‌ها عاشق این هستن که یک نقشی بهشون بدیم تا اینکه مجبور باشن طوطی‌وار تکرار کنن.',
        createdAt: '۳ ساعت پیش',
        replies: []
      },
      {
        id: 'c_2_2',
        authorName: 'مادر کیان',
        authorChild: 'مادر کیان ۶ ساله',
        text: 'دقیقاً مهدی مثل کیان من پرتحرکه، خدا خیرت بده کارت بازیت رو ذخیره کردم.',
        createdAt: '۲ ساعت پیش',
        replies: []
      }
    ]
  },
  {
    id: 'post_3',
    authorId: 'user_hoda',
    authorName: 'مادر ریحانه',
    authorChildName: 'ریحانه',
    authorChildAge: 3,
    authorBadge: 'همراه صبور',
    authorAvatarColor: 'bg-[#ECFDF5] text-[#059669]',
    text: 'یک هنجار خیلی اساسی در جامعه مادری‌مون که دلم می‌خواد با تمام وجود یادآوری کنم: "قانون ۲ دقیقه قبل خواب". خردسال ۳ تا ۴ ساله هرگز نیازی به جلسات رسمی ۱۰ یا ۱۵ دقیقه‌ای نداره. شب‌ها وقتی چراغ‌ها کم‌نور میشن و می‌خواد بخوابه، توی آغوشم با ریتم خیلی آروم سوره ناس و فلق رو مثل لالایی زمزمه می‌کنم. بعد از ۳ هفته، بدون اینکه بهش بگم "تکرار کن"، دیدم خودش داره آروم زیر لب همراهی می‌کنه. اگر کودک یک روز مقاومت کرد، در همان ثانیه تمرین رو قطع کنید تا خاطره منفی نسازه.',
    createdAt: 'دیروز',
    helpfulCount: 52,
    hasUserMarkedHelpful: false,
    comments: [
      {
        id: 'c_3',
        authorName: 'مادر یسنا',
        authorChild: 'مادر یسنا ۳ ساله',
        text: 'وای هدی جان چقدر این نکته به وقت بود. دیروز سر لجبازی یسنا اعصابم خرد شده بود، الان فهمیدم مقصر من بودم که تو زمان نامناسب اصرار کردم.',
        createdAt: 'دیروز',
        replies: [
          {
            id: 'r_3',
            authorName: 'مادر ریحانه',
            authorChild: 'نویسنده تجربه',
            text: 'اصلاً به خودت سخت نگیر مامان گل، مسیر انس با کلام خدا یک ماراتن عاشقانه‌ست نه مسابقه سرعت. صبوری ما بزرگترین درسه.',
            createdAt: 'دیروز',
          }
        ]
      }
    ]
  },
  {
    id: 'post_4',
    authorId: 'user_maryam',
    authorName: 'مادر حسام و حلما',
    authorChildName: 'حسام و حلما',
    authorChildAge: 7,
    authorBadge: 'مادر چندفرزندی',
    authorAvatarColor: 'bg-[#FDF4FF] text-[#C026D3]',
    text: 'تجربه مامان‌های چندفرزندی: بزرگترین دغدغه من دعوای بچه‌ها سر نوبت یا حسادت بود. حسام ۷ سالشه و حلما ۴ ساله. راهکاری که نجاتمون داد این بود: حسام رو کردم "استاد کوچولوی حلما". حسام مسئول شد سوره کوثر و فیل رو با شعر به حلما یاد بده و خودش برای حلما ستاره بکشه! نتیجه دوطرفه عالی بود: حسام برای اینکه جلوی خواهرش اشتباه نخونه، محفوظاتش چند برابر تثبیت شد و حلما هم عاشق برادرش شد. مقایسه بین بچه‌ها سمه، ولی همکاری معجزه می‌کنه ❤️',
    createdAt: '۲ روز پیش',
    helpfulCount: 38,
    hasUserMarkedHelpful: false,
    comments: [
      {
        id: 'c_4',
        authorName: 'مادر دوقلوها',
        authorChild: 'مادر طاها و یاسین ۵ ساله',
        text: 'فوق‌العاده بود! من همیشه نگران مقایسه شدن بچه‌ها بودم. این روش استاد کوچولو رو حتماً امتحان می‌کنم.',
        createdAt: 'دیروز',
        replies: []
      }
    ]
  },
  {
    id: 'post_5',
    authorId: 'user_negin',
    authorName: 'مادر آوا',
    authorChildName: 'آوا',
    authorChildAge: 5,
    authorBadge: 'مادر شاغل',
    authorAvatarColor: 'bg-[#FEF3C7] text-[#B45309]',
    text: 'برای مامان‌های شاغل یا وقت‌های شلوغ آشپزخونه: ما یک "جعبه راز ۵ دقیقه‌ای در ماشین" درست کردیم. چند تا کارت مقوایی نقاشی‌شده از کلمات سوره مسد و کافرون داخل یک جعبه کوچیک روی داشبورد هست. توی ترافیک برگشت از مهدکودک، آوا چشم‌هاش رو می‌بنده و یک کارت برمی‌داره. مثلاً اگر تصویر هیزم دراومد می‌گه "حمالة الحطب!". روزی فقط ۳ تا ۵ دقیقه، ولی چون منظم و تو دل رفت‌وآمده، فشاری به هیچ‌کدوممون نمیاد.',
    createdAt: '۳ روز پیش',
    helpfulCount: 34,
    hasUserMarkedHelpful: false,
    comments: [
      {
        id: 'c_5',
        authorName: 'مادر ترنم',
        authorChild: 'مادر ترنم ۵ ساله',
        text: 'چقدر ایده هوشمندانه‌ای برای زمان مرده ترافیک! حتماً برای مسیر مهدکودک آماده می‌کنم.',
        createdAt: '۲ روز پیش',
        replies: []
      }
    ]
  },
  {
    id: 'post_6',
    authorId: 'user_somayeh',
    authorName: 'مادر طه',
    authorChildName: 'طه',
    authorChildAge: 8,
    authorBadge: 'راهنمای قرآنی',
    authorAvatarColor: 'bg-[#EFF6FF] text-[#1D4ED8]',
    text: 'یک تجربه مهم برای کسانی که فرزندشون تازه ۱۰ تا سوره رو حفظ کرده: به احتمال زیاد در یک برهه‌ای دچار "استپ حفظ" یا مقاومت کودک میشید. کودک یکباره می‌گه خسته‌ام یا یادم رفته. در این موقعیت اصلاً بهش نگید "حیفه، چرا تنبلی می‌کنی؟". ما دو هفته کامل حفظ جدید رو تعطیل کردیم و فقط صوت ملایم قرآن در خانه موقع ناهار یا بازی پخش شد، بدون هیچ پرسشی از طه. بعد از دو هفته خودش گفت مامان چرا سوره بعدی رو نخوندیم؟ ذهن کودک نیاز به دوره هضم و ریکاوری داره.',
    createdAt: '۴ روز پیش',
    helpfulCount: 63,
    hasUserMarkedHelpful: false,
    comments: [
      {
        id: 'c_6',
        authorName: 'مادر سپهر',
        authorChild: 'مادر سپهر ۷ ساله',
        text: 'سمیه جان دستت درد نکنه، من دقیقاً همین روزها داشتم غصه می‌خوردم که چرا سپهر پسرفت کرده. خیالم خیلی راحت شد.',
        createdAt: '۳ روز پیش',
        replies: [
          {
            id: 'r_6',
            authorName: 'مادر طه',
            authorChild: 'نویسنده تجربه',
            text: 'نگران نباش عزیزم، مثل جوانه زدن در خاکه؛ وقتی به ظاهر ساکته، ریشه‌ها دارن در عمق جانش محکم میشن.',
            createdAt: '۳ روز پیش',
          }
        ]
      }
    ]
  },
  {
    id: 'post_7',
    authorId: 'user_mohaddeseh',
    authorName: 'مادر علی‌اصغر',
    authorChildName: 'علی‌اصغر',
    authorChildAge: 5,
    authorBadge: 'مادر تدبر',
    authorAvatarColor: 'bg-[#FFF1F2] text-[#E11D48]',
    text: 'همیشه دلم می‌خواست حفظ آیات به زندگی روزمره‌مون وصل بشه. وقتی سوره ماعون رو خوندیم، علی‌اصغر پرسید: "مامان چرا خدا از کسایی که به یتیم غذا نمی‌دن بدش میاد؟". به جای جواب تئوری، رفتیم مغازه و با پول قلکش دو تا شیرکاکائو و کیک خرید و با دست‌های خودش داد به کودکان کار سر چهارراه. برگشتنی گفت: "مامان، این یعنی یحض علی طعام المسکین؟". لذتی که از درک آیه برد با هیچ جایزه‌ای قابل مقایسه نبود.',
    createdAt: '۵ روز پیش',
    helpfulCount: 41,
    hasUserMarkedHelpful: false,
    attachedGameCard: sampleGameElephant,
    comments: [
      {
        id: 'c_7',
        authorName: 'مادر امیرعلی',
        authorChild: 'مادر امیرعلی ۵ ساله',
        text: 'اشکم دراومد از این تربیت قشنگت، خدا حفظش کنه. بهترین راه آموزش دین و معنویت به بچه همینه.',
        createdAt: '۴ روز پیش',
        replies: []
      }
    ]
  },
  {
    id: 'post_8',
    authorId: 'user_fereshteh',
    authorName: 'مادر کوثر',
    authorChildName: 'کوثر',
    authorChildAge: 4,
    authorBadge: 'نغمه کودکانه',
    authorAvatarColor: 'bg-[#F0FDF4] text-[#16A34A]',
    text: 'یک ترفند برای بالا بردن اعتماد به نفس بچه‌های خجالتی: ما بازی "رادیو قرآن منزل" راه انداختیم! با برنامه ضبط صوت گوشی صدای تلاوت سوره کوثر و توحید کوثر رو ضبط کردیم، قبلش هم یک موزیک ملایم گذاشتیم و گفتم: "اینجا رادیو کوثره، قاری کوچک برنامه...". فایل صوتی رو برای بابابزرگ و مامانبزرگ فرستادیم و اونا وویس‌های تشویقی پر از عشق فرستادن. کوثر از اون روز روزی ۳ بار میاد می‌گه مامان ضبط رادیو رو روشن کن!',
    createdAt: 'هفته گذشته',
    helpfulCount: 37,
    hasUserMarkedHelpful: false,
    comments: [
      {
        id: 'c_8',
        authorName: 'مادر باران',
        authorChild: 'مادر باران ۴ ساله',
        text: 'عاشق این ایده شدم! بچه‌ها چقدر با شنیدن صدای ضبط شده خودشون ذوق می‌کنن.',
        createdAt: '۵ روز پیش',
        replies: []
      }
    ]
  }
];
