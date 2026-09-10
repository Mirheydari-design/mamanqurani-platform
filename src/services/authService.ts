import { UserProfile, WalletTransaction, Child } from '../types';
import { defaultProfile } from '../data/initialData';
import { formatPersianDateTime } from '../utils/persian';

const PROFILE_STORAGE_KEY = 'quran_app_profile_v2';
const AUTH_TOKEN_KEY = 'quran_app_auth_token_v1';

// Rate: 1 USD = 300,000 Tomans (as specified by the user)
// Typical Gemini Flash query (~1500 - 3000 tokens) ≈ $0.005 - $0.008 USD
// 0.006 * 300,000 Tomans ≈ 1,800 Tomans per coach consultation
export const USD_TO_TOMAN_RATE = 300_000;

export function calculateCostInTomans(tokensCount?: number): number {
  if (!tokensCount || tokensCount <= 0) {
    return 1_800;
  }
  // Formula: (tokensCount / 1,000,000) * averagePricePerMillionTokensUSD * USD_TO_TOMAN_RATE
  // With Flash output/input blended cost ~ $0.0035 per 1k tokens = $3.5 / 1M tokens
  // Or approximate ~ 1,800 Tomans per ~2,000 tokens query:
  const cost = Math.round((tokensCount * 0.9) / 100) * 100;
  // Clamp between 1,000 Tomans and 4,000 Tomans
  return Math.min(4_000, Math.max(1_000, cost));
}

export const authService = {
  /**
   * Load stored profile or fallback to initial guest profile
   */
  getProfile(): UserProfile {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved) {
        const parsed: UserProfile = JSON.parse(saved);
        // Strictly filter out any legacy mock children (child_ali, child_fatemeh, etc.)
        const children = (parsed.children || []).filter(c =>
          c.id !== 'child_ali' && c.id !== 'child_fatemeh' && c.name !== 'علی' && c.name !== 'فاطمه سادات'
        );
        const username = parsed.username || '';
        const activeChildId = children.length > 0 ? (children.some(c => c.id === parsed.activeChildId) ? parsed.activeChildId : children[0].id) : undefined;

        return {
          ...parsed,
          username,
          children,
          activeChildId,
          isAuthenticated: parsed.isAuthenticated ?? false,
          walletBalance: parsed.walletBalance ?? 100_000,
          transactions: parsed.transactions ?? [
            {
              id: 'tx_init',
              type: 'charge',
              amount: 100_000,
              title: 'هدیه خوش‌آمدگویی و فعال‌سازی حساب',
              createdAt: 'ابتدای عضویت',
              balanceAfter: 100_000,
            },
          ],
        };
      }
    } catch (e) {
      console.error('Failed to load profile from storage:', e);
    }

    // Default guest profile (can browse everywhere, see sample data)
    return {
      ...defaultProfile,
      isAuthenticated: false,
      walletBalance: 100_000,
      transactions: [
        {
          id: 'tx_init',
          type: 'charge',
          amount: 100_000,
          title: 'اعتبار اولیه حساب',
          createdAt: 'امروز',
          balanceAfter: 100_000,
        },
      ],
    };
  },

  /**
   * Save profile to storage
   */
  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile to storage:', e);
    }
  },

  /**
   * Register a new user
   */
  async register(params: {
    username: string;
    phoneOrEmail: string;
    password?: string;
    children?: Child[];
  }): Promise<UserProfile> {
    const current = this.getProfile();
    const cleanUsername = params.username.trim() || 'مادر قرآن‌آموز';
    const cleanPhone = params.phoneOrEmail.trim() || 'کاربر جدید';

    const registeredChildren = params.children && params.children.length > 0 
      ? params.children 
      : current.children;

    const activeChildId = registeredChildren.length > 0 
      ? (current.activeChildId && registeredChildren.some(c => c.id === current.activeChildId) 
          ? current.activeChildId 
          : registeredChildren[0].id)
      : '';

    const newProfile: UserProfile = {
      ...current,
      id: `user_${Date.now()}`,
      username: cleanUsername,
      phoneOrEmail: cleanPhone,
      isAuthenticated: true,
      children: registeredChildren,
      activeChildId,
      walletBalance: current.walletBalance && current.walletBalance > 0 ? current.walletBalance : 100_000,
      transactions: current.transactions && current.transactions.length > 0 ? current.transactions : [
        {
          id: `tx_${Date.now()}`,
          type: 'charge',
          amount: 100_000,
          title: 'هدیه اعتبار اولیه ثبت‌نام',
          createdAt: formatPersianDateTime(new Date()),
          balanceAfter: 100_000,
        },
      ],
    };

    localStorage.setItem(AUTH_TOKEN_KEY, `mock_token_${Date.now()}`);
    this.saveProfile(newProfile);
    return newProfile;
  },

  /**
   * Log in an existing user
   */
  async login(params: {
    phoneOrEmail: string;
    password?: string;
  }): Promise<UserProfile> {
    const current = this.getProfile();
    const cleanPhone = params.phoneOrEmail.trim();

    const loggedInProfile: UserProfile = {
      ...current,
      phoneOrEmail: cleanPhone || current.phoneOrEmail,
      isAuthenticated: true,
    };

    localStorage.setItem(AUTH_TOKEN_KEY, `mock_token_${Date.now()}`);
    this.saveProfile(loggedInProfile);
    return loggedInProfile;
  },

  /**
   * Log out current user, wipe all user/child data from storage (except public experiences feed),
   * and reset to a clean guest profile.
   */
  async logout(): Promise<UserProfile> {
    // 1. Preserve public social community experiences
    const publicExperiences = localStorage.getItem('quran_app_experiences_v2');
    const communityPosts = localStorage.getItem('quran_app_community_posts_v2');

    // 2. Clear all user data from storage
    try {
      localStorage.clear();
    } catch (e) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k !== 'quran_app_experiences_v2' && k !== 'quran_app_community_posts_v2') {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    }

    // 3. Restore public feed experiences
    if (publicExperiences) {
      try {
        localStorage.setItem('quran_app_experiences_v2', publicExperiences);
      } catch (e) {}
    }
    if (communityPosts) {
      try {
        localStorage.setItem('quran_app_community_posts_v2', communityPosts);
      } catch (e) {}
    }

    const guestProfile: UserProfile = {
      id: `guest_${Date.now()}`,
      username: '',
      phoneOrEmail: '',
      children: [],
      activeChildId: undefined,
      isAuthenticated: false,
      walletBalance: 100_000,
      transactions: [
        {
          id: 'tx_init',
          type: 'charge',
          amount: 100_000,
          title: 'اعتبار اولیه حساب مهمان',
          createdAt: 'امروز',
          balanceAfter: 100_000,
        },
      ],
    };
    this.saveProfile(guestProfile);
    return guestProfile;
  },

  /**
   * Top-up / Charge wallet
   */
  chargeWallet(current: UserProfile, amount: number): UserProfile {
    const newBalance = (current.walletBalance || 0) + amount;
    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      type: 'charge',
      amount,
      title: `افزایش موجودی کیف پول`,
      createdAt: formatPersianDateTime(new Date()),
      balanceAfter: newBalance,
    };

    const updated: UserProfile = {
      ...current,
      walletBalance: newBalance,
      transactions: [newTx, ...(current.transactions || [])],
    };

    this.saveProfile(updated);
    return updated;
  },

  /**
   * Deduct from wallet for AI coach usage
   */
  deductWallet(current: UserProfile, amount: number, title = 'هزینه خدمات مربی هوشمند'): UserProfile {
    const currentBal = current.walletBalance || 0;
    const newBalance = Math.max(0, currentBal - amount);
    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      type: 'usage',
      amount,
      title,
      createdAt: formatPersianDateTime(new Date()),
      balanceAfter: newBalance,
    };

    const updated: UserProfile = {
      ...current,
      walletBalance: newBalance,
      transactions: [newTx, ...(current.transactions || [])],
    };

    this.saveProfile(updated);
    return updated;
  },
};
