export type ItemCategoryType =
  | 'برنامه حفظ جدید'
  | 'برنامه مرور نزدیک'
  | 'برنامه مرور دور'
  | 'تحویل حفظ'
  | 'بازی حفظ جدید'
  | 'بازی مرور'
  | 'بازی تحویل';

export interface SurahProgress {
  surah: string;
  progress: number;
  status: 'learning' | 'memorized';
  lastReviewed?: string;
}

export interface Child {
  id: string;
  name: string;
  age: number;
  goal: string; // متن آزاد در چند کلمه (مثلاً: تدبر در آیات موضوعی یا انس با قرآن)
  hasStartedMemorization: boolean;
  memorizationScope?: string; // چند جزء یا بازه سوره‌ها
  avatarColor?: string;
  surahProgress?: SurahProgress[];
}

export interface WalletTransaction {
  id: string;
  type: 'charge' | 'usage';
  amount: number; // in Tomans
  title: string;
  createdAt: string;
  balanceAfter: number;
}

export interface UserProfile {
  id: string;
  username: string; // نام کاربری (مثلاً: مادر فاطمه سادات)
  phoneOrEmail?: string;
  children: Child[];
  activeChildId: string;
  isAuthenticated?: boolean;
  walletBalance?: number; // in Tomans
  transactions?: WalletTransaction[];
}

export interface GameCard {
  id: string;
  title: string;
  surah: string;
  topic?: string;
  description: string;
  materials: string[];
  steps: string[];
  duration: string; // e.g. '۱۰ دقیقه'
  ageRange: string;
  tag: ItemCategoryType | string; // یکی از دسته‌های استاندارد
  itemType: 'game' | 'program'; // بازی یا برنامه
  savedAt?: string;
  isCustom?: boolean;
  quranSegment?: string; // قطعه قرآنی با اعراب زیبا و تقطیع دقیق
  motherlyAdvice?: string; // متن پیشنهاد شگفت انگیز (لحن صمیمی و مادرانه)
  motherActions?: string[]; // اقدامات مامان (گام‌های مادر)
  dayNumber?: number; // ۱ (امروز)، ۲ (فردا)، ۳ (پس‌فردا)
  dayLabel?: 'امروز' | 'فردا' | 'پس‌فردا' | string;
}

export interface Reply {
  id: string;
  authorName: string;
  authorChild?: string;
  text: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  authorName: string;
  authorChild?: string;
  text: string;
  createdAt: string;
  replies: Reply[];
}

export interface SocialAuthorProfile {
  id: string;
  username: string;
  childName: string;
  childAge: number;
  bio?: string;
  badge?: string;
  avatarColor?: string;
  helpfulCountReceived: number;
  postsCount: number;
  joinedAt?: string;
}

export interface ExperiencePost {
  id: string;
  authorId: string;
  authorName: string;
  authorChildName: string;
  authorChildAge: number;
  authorBadge?: string;
  authorAvatarColor?: string;
  text: string;
  createdAt: string;
  helpfulCount: number;
  hasUserMarkedHelpful?: boolean;
  attachedGameCard?: GameCard;
  comments: Comment[];
  isOwn?: boolean;
  isReported?: boolean;
}

export interface DailyTask {
  id: string;
  childId: string;
  title: string;
  subtitle: string;
  duration: string;
  completed: boolean;
  category: ItemCategoryType;
  date?: string;
  product?: ProductSuggestion;
  gameCard?: GameCard;
  materials?: string[];
  steps?: string[];
  description?: string;
  quranSegment?: string;
}

export interface ProductSuggestion {
  id: string;
  ageRange: string;
  productType: string;
  miniTitle: string;
  productName: string;
  motherlyAdvice: string;
  steps: string[];
  publisher: string;
  discountCode: string;
  buyUrl: string;
  imageUrl?: string;
  targetChildId?: string;
  targetChildName?: string;
  targetChildAge?: number;
  dismissed?: boolean;
  dateKey?: string;
}

export interface SpecialSuggestion {
  id: string;
  dateKey: string;
  badge: string;
  text: string;
  gameCard: GameCard;
  dismissed: boolean;
  categoryType?: 'game' | 'program' | 'product';
  targetChildId?: string;
  targetChildName?: string;
  targetChildAge?: number;
  productDetails?: ProductSuggestion;
  isAlreadyAdded?: boolean;
}


export interface CoachHistoryItem {
  id: string;
  prompt: string;
  date: string;
  advice: string | null;
  steps: string[];
  cards: GameCard[];
  childId: string;
}
