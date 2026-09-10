/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { getTodayStr, addDays } from './utils/dateHelpers';
import { SpecialSuggestionsSlider } from './components/SpecialSuggestionsSlider';
import { DailyTasksSection } from './components/DailyTasksSection';
import { CoachView } from './components/CoachView';
import { FeedView } from './components/FeedView';
import { ProfileView } from './components/ProfileView';
import { BottomNav, NavTab } from './components/BottomNav';
import { GameCardModal } from './components/GameCardModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { EditPostModal } from './components/EditPostModal';
import { ReportModal } from './components/ReportModal';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { AddChildModal } from './components/AddChildModal';
import { authService } from './services/authService';
import { feedService } from './services/feedService';
import {
  UserProfile,
  GameCard,
  ExperiencePost,
  DailyTask,
  SpecialSuggestion,
  ProductSuggestion,
  Child,
  Comment,
  Reply,
} from './types';
import {
  defaultProfile,
  initialSpecialSuggestion,
  initialDailyTasks,
  initialExperiences,
  sampleGameElephant,
  sampleGameQuraysh,
  sampleGameKawthar,
} from './data/initialData';
import {
  getDailySelectedChild,
  getDailyActivitySuggestion,
  getDailyProductSuggestion,
  getOrInitDailySuggestionsBundle,
  saveDailySuggestionsBundle,
  clearDailySuggestionsBundle,
  DailySuggestionsBundle,
} from './services/sheetsService';
import { createReviewSpecialSuggestions } from './utils/reviewCardsGenerator';
import { Sparkles, Check, Quote } from 'lucide-react';
import { toPersianDigits } from './utils/persian';
import { getDailyReflection } from './data/dailyReflections';

export default function App() {
  // Local state with localStorage hydration
  const [profile, setProfile] = useState<UserProfile>(() => {
    const parsed: UserProfile = authService.getProfile();
    // Strictly sanitize children to purge any mock children & ensure completed Juz 30 is properly formatted
    const nonMockChildren = (parsed.children || []).filter(c =>
      c.id !== 'child_ali' && c.id !== 'child_fatemeh' && c.name !== 'علی' && c.name !== 'فاطمه سادات'
    );
    const cleanChildren = nonMockChildren.map(child => {
      let cleanProgress = (child.surahProgress || []).filter(
        sp => !sp.surah.includes('بازی') && !sp.surah.toLowerCase().includes('game')
      );
      // If scope specifies complete Juz 30 and no Juz 30 entry exists, add it
      const hasJuz30Scope = child.memorizationScope && (
        child.memorizationScope.includes('جزء ۳۰ کامل') ||
        child.memorizationScope.includes('جزء 30 کامل') ||
        child.memorizationScope.includes('کل جزء ۳۰') ||
        child.memorizationScope.includes('کل جزء 30')
      );
      if (hasJuz30Scope && !cleanProgress.some(sp => sp.surah.includes('جزء ۳۰') || sp.surah.includes('جزء 30'))) {
        cleanProgress = [
          { surah: 'جزء ۳۰', progress: 100, status: 'memorized', lastReviewed: 'هفته گذشته' },
          ...cleanProgress.filter(sp => !sp.surah.includes('فیل تا ناس'))
        ];
      }
      return {
        ...child,
        surahProgress: cleanProgress.length > 0 ? cleanProgress : undefined
      };
    });
    const activeChildId = cleanChildren.length > 0 ? (cleanChildren.some(c => c.id === parsed.activeChildId) ? parsed.activeChildId : cleanChildren[0].id) : undefined;
    return { ...parsed, children: cleanChildren, activeChildId };
  });

  const [specialSuggestion, setSpecialSuggestion] = useState<SpecialSuggestion | null>(null);
  const [productSuggestion, setProductSuggestion] = useState<ProductSuggestion | null>(null);

  const [selectedProductForModal, setSelectedProductForModal] = useState<ProductSuggestion | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [dailySelectedChild, setDailySelectedChild] = useState<Child | null>(null);

  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(() => {
    const saved = localStorage.getItem('quran_app_tasks_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as DailyTask[];
        // Filter out legacy mock tasks for child_ali / child_fatemeh if not part of user's children
        return parsed
          .filter(t => t.childId !== 'child_ali' && t.childId !== 'child_fatemeh')
          .map((t) => {
            if (!t.date || t.date === 'امروز') {
              return { ...t, date: addDays(getTodayStr(), -1) };
            }
            return t;
          });
      } catch (e) {}
    }
    // Start completely empty for clean user onboarding
    return [];
  });

  const [savedGames, setSavedGames] = useState<GameCard[]>(() => {
    const saved = localStorage.getItem('quran_app_saved_games_v2');
    return saved ? JSON.parse(saved) : [sampleGameElephant, sampleGameQuraysh, sampleGameKawthar];
  });

  const [experiences, setExperiences] = useState<ExperiencePost[]>(() => {
    const saved = localStorage.getItem('quran_app_experiences_v2');
    return saved ? JSON.parse(saved) : initialExperiences;
  });

  // App navigation state
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const mainRef = useRef<HTMLElement | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  };

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'coach') {
      scrollToTop();
      requestAnimationFrame(() => {
        scrollToTop();
      });
      setTimeout(scrollToTop, 50);
    }
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr);
  const [coachInitialPrompt, setCoachInitialPrompt] = useState<string>('');
  const [attachedGame, setAttachedGame] = useState<GameCard | null>(null);
  const dailyReflection = useMemo(() => getDailyReflection(), []);

  // Modals state
  const [selectedGameForModal, setSelectedGameForModal] = useState<GameCard | null>(null);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'register' | 'login' | 'edit_profile'>('register');
  const [authReasonMessage, setAuthReasonMessage] = useState<string | undefined>(undefined);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<'wallet' | 'account'>('wallet');
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [editingPost, setEditingPost] = useState<ExperiencePost | null>(null);
  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleOpenAuth = (mode: 'register' | 'login' | 'edit_profile' = 'register', reason?: string) => {
    setAuthModalMode(mode);
    setAuthReasonMessage(reason);
    setIsAuthModalOpen(true);
  };

  const handleOpenSettings = (section?: unknown) => {
    const validSection: 'wallet' | 'account' = section === 'account' ? 'account' : 'wallet';
    setSettingsSection(validSection);
    setIsSettingsModalOpen(true);
  };

  const handleLogout = async () => {
    setIsSettingsModalOpen(false);
    setIsAuthModalOpen(false);
    setIsAddChildModalOpen(false);
    setIsGameModalOpen(false);
    setIsProductModalOpen(false);
    setSelectedProductForModal(null);
    setSelectedGameForModal(null);
    setEditingChild(null);

    const updated = await authService.logout();
    setProfile(updated);
    setDailyTasks([]);
    setSpecialSuggestion(null);
    setProductSuggestion(null);
    setDailySelectedChild(null);
    setDismissedReviewIds([]);
    setCoachInitialPrompt('');
    setAttachedGame(null);
    setSavedGames([sampleGameElephant, sampleGameQuraysh, sampleGameKawthar]);

    setActiveTab('home');
    scrollToTop();
    showToast('شما با موفقیت از حساب کاربری خارج شدید.');
  };

  const handleDeductWallet = (amount: number, title?: string) => {
    const updated = authService.deductWallet(profile, amount, title);
    setProfile(updated);
  };

  const activeChild = profile.children.find(c => c.id === profile.activeChildId) || profile.children[0];

  // Sync to localStorage and social community database
  useEffect(() => {
    localStorage.setItem('quran_app_profile_v2', JSON.stringify(profile));
    feedService.syncUserProfile(profile, activeChild);
  }, [profile, activeChild]);

  // Load feed posts from server database
  useEffect(() => {
    feedService.getPosts(profile.id).then((serverPosts) => {
      if (serverPosts && serverPosts.length > 0) {
        setExperiences(serverPosts);
      }
    });
  }, [profile.id]);

  useEffect(() => {
    if (specialSuggestion) {
      localStorage.setItem(`quran_app_special_suggestion_${profile.id}`, JSON.stringify(specialSuggestion));
    } else {
      localStorage.removeItem(`quran_app_special_suggestion_${profile.id}`);
      localStorage.removeItem('quran_app_special_suggestion_v2');
    }
  }, [specialSuggestion, profile.id]);

  useEffect(() => {
    if (productSuggestion) {
      localStorage.setItem(`quran_app_product_suggestion_${profile.id}`, JSON.stringify(productSuggestion));
    } else {
      localStorage.removeItem(`quran_app_product_suggestion_${profile.id}`);
      localStorage.removeItem('quran_app_product_suggestion_v2');
    }
  }, [productSuggestion, profile.id]);

  // Load Daily Suggestions (Non-repeating random cycle locked per day, persistent across page reloads)
  useEffect(() => {
    if (profile.children.length === 0) {
      setSpecialSuggestion(null);
      setProductSuggestion(null);
      setDailySelectedChild(null);
      return;
    }
    const todayDateKey = getTodayStr();

    getOrInitDailySuggestionsBundle(profile.children, todayDateKey, profile.id)
      .then((bundle) => {
        if (bundle) {
          setSpecialSuggestion(bundle.activitySuggestion);
          setProductSuggestion(bundle.productSuggestion);
          const assignedChild = profile.children.find(
            (c) => c.id === bundle.activitySuggestion.targetChildId
          );
          if (assignedChild) setDailySelectedChild(assignedChild);
        }
      })
      .catch((err) => console.error('Error loading daily suggestions bundle:', err));
  }, [profile.children, profile.id]);

  useEffect(() => {
    localStorage.setItem('quran_app_tasks_v2', JSON.stringify(dailyTasks));
  }, [dailyTasks]);

  useEffect(() => {
    localStorage.setItem('quran_app_saved_games_v2', JSON.stringify(savedGames));
  }, [savedGames]);

  useEffect(() => {
    localStorage.setItem('quran_app_experiences_v2', JSON.stringify(experiences));
  }, [experiences]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 2800);
  };

  // Dismissed review suggestions for today (near/far review cards)
  const [dismissedReviewIds, setDismissedReviewIds] = useState<string[]>(() => {
    const todayKey = getTodayStr();
    try {
      const saved = localStorage.getItem(`maman_dismissed_reviews_${todayKey}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const reviewTargetChild = activeChild || dailySelectedChild || profile.children[0];

  // Generate Near and Far review suggestions based on past memorization
  const reviewSuggestions = useMemo(() => {
    if (!reviewTargetChild) return [];
    const todayDateKey = getTodayStr();
    return createReviewSpecialSuggestions(
      reviewTargetChild,
      todayDateKey,
      dailyTasks,
      dismissedReviewIds
    );
  }, [reviewTargetChild, dailyTasks, dismissedReviewIds]);

  // Child Management Handlers
  const handleSaveChild = (childData: Child) => {
    setProfile(prev => {
      const exists = prev.children.some(c => c.id === childData.id);
      let updatedChildren: Child[];
      if (exists) {
        updatedChildren = prev.children.map(c => (c.id === childData.id ? childData : c));
      } else {
        updatedChildren = [...prev.children, childData];
      }

      // Auto update username if default or empty
      let updatedUsername = prev.username;
      if (!updatedUsername || updatedUsername === 'مادر قرآن‌آموز') {
        updatedUsername = `مادر ${childData.name}`;
      }

      return {
        ...prev,
        username: updatedUsername,
        children: updatedChildren,
        activeChildId: childData.id,
      };
    });

    setEditingChild(null);
    clearDailySuggestionsBundle(profile.id);
    showToast(`مشخصات ${childData.name} با موفقیت ثبت شد 🌱`);
  };

  const handleDeleteChild = (childId: string) => {
    clearDailySuggestionsBundle(profile.id);
    setProfile(prev => {
      const updatedChildren = prev.children.filter(c => c.id !== childId);
      const newActiveId = updatedChildren.length > 0 ? updatedChildren[0].id : '';
      return {
        ...prev,
        children: updatedChildren,
        activeChildId: newActiveId,
      };
    });
    setDailyTasks(prev => prev.filter(t => t.childId !== childId));
    showToast('فرزند از لیست حذف شد.');
  };

  const handleSelectActiveChild = (childId: string) => {
    setProfile(prev => ({
      ...prev,
      activeChildId: childId,
    }));
  };

  // Daily Tasks handlers
  const updateChildProgressBasedOnTask = (task: DailyTask) => {
    // CRITICAL: Games must NEVER be recorded in memorization history or child profile!
    if (
      task.category.includes('بازی') ||
      task.title.includes('بازی') ||
      (task.subtitle && task.subtitle.includes('بازی')) ||
      task.category.toLowerCase().includes('game') ||
      (task as any).itemType === 'game'
    ) {
      return;
    }

    // Only genuine memorization, review, or delivery programs affect Quran memorization progress
    if (!task.category.includes('حفظ') && !task.category.includes('مرور') && !task.category.includes('تحویل')) {
      return;
    }

    // Extract Surah Name from title or subtitle
    let surahName = '';
    const textToSearch = `${task.title} ${task.subtitle || ''}`;
    
    // Check match after "سوره"
    const surahMatch = textToSearch.match(/سوره\s*(مبارکه\s*)?([^\s,،•]+)/);
    if (surahMatch && surahMatch[2]) {
      surahName = surahMatch[2].trim();
    } else if (task.subtitle) {
      surahName = task.subtitle.split('•')[0].replace(/سوره مبارکه|سوره/g, '').trim();
    } else {
      const commonSurahs = [
        'فیل', 'کوثر', 'قریش', 'ماعون', 'کافرون', 'نصر', 'مسد', 'اخلاص', 'توحید', 'فلق', 'ناس',
        'عصر', 'همزه', 'تکاثر', 'قارعه', 'عادیات', 'زلزله', 'بینه', 'قدر', 'علق', 'تین', 'انشراح',
        'شرح', 'ضحی', 'لیل', 'شمس', 'بلد', 'فجر', 'غاشیه', 'اعلی', 'طارق', 'بروج', 'انشقاق'
      ];
      const found = commonSurahs.find(s => textToSearch.includes(s));
      if (found) surahName = found;
    }
    if (!surahName || surahName.includes('بازی')) return;

    setProfile(prev => {
      const childIndex = prev.children.findIndex(c => c.id === task.childId);
      if (childIndex === -1) return prev;
      
      const child = prev.children[childIndex];
      // Filter out any game items that might have previously slipped in
      const progressList = (child.surahProgress ? [...child.surahProgress] : []).filter(
        p => !p.surah.includes('بازی') && !p.surah.toLowerCase().includes('game')
      );
      let surahProgIndex = progressList.findIndex(p => p.surah.includes(surahName) || surahName.includes(p.surah));
      
      if (surahProgIndex === -1) {
        progressList.push({ surah: surahName, progress: 0, status: 'learning' });
        surahProgIndex = progressList.length - 1;
      }
      
      const surahProg = { ...progressList[surahProgIndex] };
      
      // نوار پیشرفت فقط با تیک خوردن کارت‌های «برنامه حفظ جدید» جلو می‌رود (بازی‌ها تأثیری ندارند)
      if (task.category === 'برنامه حفظ جدید' || (task.category.includes('حفظ جدید') && !task.category.includes('بازی'))) {
        surahProg.progress = Math.min(100, surahProg.progress + 25);
        if (surahProg.progress === 100) surahProg.status = 'memorized';
      }
      if (task.category.includes('مرور')) {
        surahProg.lastReviewed = getTodayStr();
        if (surahProg.status !== 'memorized' && surahProg.progress >= 100) {
           surahProg.status = 'memorized';
        }
      }
      if (task.category.includes('تحویل')) {
        surahProg.progress = 100;
        surahProg.status = 'memorized';
        surahProg.lastReviewed = getTodayStr();
      }
      
      progressList[surahProgIndex] = surahProg;
      const newChildren = [...prev.children];
      newChildren[childIndex] = { ...child, surahProgress: progressList };
      return { ...prev, children: newChildren };
    });
  };

  const handleToggleTask = (taskId: string) => {
    setDailyTasks(prev => {
      const newTasks = prev.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t));
      
      const task = prev.find(t => t.id === taskId);
      if (task && !task.completed) {
        updateChildProgressBasedOnTask(task);
      }
      
      return newTasks;
    });
  };

  const handleAddTask = (newTask: Omit<DailyTask, 'id' | 'completed'>) => {
    const task: DailyTask = {
      ...newTask,
      id: `task_${Date.now()}`,
      completed: false,
    };
    setDailyTasks(prev => [...prev, task]);
    showToast('فعالیت جدید به برنامه اضافه شد ✨');
  };

  const handleDeleteTask = (taskId: string) => {
    setDailyTasks(prev => prev.filter(t => t.id !== taskId));
    showToast('فعالیت از برنامه حذف شد 🗑️');
  };

  const handleAddTaskFromGame = (game: GameCard, forcedChildId?: string) => {
    const targetChildId =
      forcedChildId ||
      specialSuggestion?.targetChildId ||
      (activeChild ? activeChild.id : profile.children[0]?.id || 'child_default');
    const child = profile.children.find((c) => c.id === targetChildId);
    const childName = child?.name || specialSuggestion?.targetChildName || 'کودک';

    const task: DailyTask = {
      id: `task_game_${Date.now()}`,
      childId: targetChildId,
      title: game.title,
      subtitle: `${game.surah} • ${game.tag}`,
      duration: game.duration,
      completed: false,
      category: (game.tag as any) || 'بازی حفظ جدید',
      date: selectedDate || getTodayStr(),
      gameCard: game,
      description: game.description,
      materials: game.materials,
      steps: game.steps,
    };
    setDailyTasks((prev) => [...prev, task]);
    showToast(`کارت «${game.title}» به برنامه امروز ${childName} اضافه شد ✨`);
  };

  const handleDismissReviewSuggestion = (reviewId: string) => {
    setDismissedReviewIds((prev) => {
      const next = [...prev, reviewId];
      try {
        localStorage.setItem(`maman_dismissed_reviews_${getTodayStr()}`, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('پیشنهاد مرور بسته شد.');
  };

  const handleResetReviews = () => {
    setDismissedReviewIds([]);
    try {
      localStorage.removeItem(`maman_dismissed_reviews_${getTodayStr()}`);
    } catch {}
  };

  // Special Suggestion dismiss handler
  const handleDismissSpecialSuggestion = () => {
    setSpecialSuggestion((prev) => {
      const updated = { ...prev, dismissed: true };
      const todayDateKey = getTodayStr();
      if (productSuggestion) {
        saveDailySuggestionsBundle({
          dateKey: todayDateKey,
          activitySuggestion: updated,
          productSuggestion: productSuggestion,
        });
      }
      return updated;
    });
    showToast('پیشنهاد بازی/برنامه بسته شد.');
  };

  const handleResetSpecialSuggestion = () => {
    handleResetReviews();
    setSpecialSuggestion((prev) => {
      const updated = { ...prev, dismissed: false };
      const todayDateKey = getTodayStr();
      if (productSuggestion) {
        saveDailySuggestionsBundle({
          dateKey: todayDateKey,
          activitySuggestion: updated,
          productSuggestion: productSuggestion,
        });
      }
      return updated;
    });
    showToast('پیشنهادهای شگفت‌انگیز امروز مجدداً فعال شدند.');
  };

  // Product Suggestion Handlers
  const handleAddTaskFromProduct = (product: ProductSuggestion) => {
    const targetChildId =
      product.targetChildId ||
      (activeChild ? activeChild.id : profile.children[0]?.id || 'child_default');
    const child = profile.children.find((c) => c.id === targetChildId);
    const childName = child?.name || product.targetChildName || 'کودک';

    const task: DailyTask = {
      id: `task_product_${Date.now()}`,
      childId: targetChildId,
      title: `${product.productType}: ${product.productName}`,
      subtitle: product.publisher ? `ناشر: ${product.publisher}` : product.miniTitle || 'پیشنهاد محصول',
      duration: '۱۵ دقیقه',
      completed: false,
      category: product.productType.includes('بازی') ? 'بازی مرور' : 'برنامه مرور نزدیک',
      date: selectedDate || getTodayStr(),
      product: product,
      description: product.motherlyAdvice,
      steps: product.steps,
    };
    setDailyTasks((prev) => [...prev, task]);
    showToast(`محصول «${product.productName}» به برنامه امروز ${childName} اضافه شد 📚`);
  };

  const handleDismissProductSuggestion = () => {
    setProductSuggestion((prev) => {
      if (!prev) return null;
      const updated = { ...prev, dismissed: true };
      const todayDateKey = getTodayStr();
      saveDailySuggestionsBundle({
        dateKey: todayDateKey,
        activitySuggestion: specialSuggestion,
        productSuggestion: updated,
      });
      return updated;
    });
    showToast('پیشنهاد محصول بسته شد.');
  };

  const handleResetProductSuggestion = () => {
    setProductSuggestion((prev) => {
      if (!prev) return null;
      const updated = { ...prev, dismissed: false };
      const todayDateKey = getTodayStr();
      saveDailySuggestionsBundle({
        dateKey: todayDateKey,
        activitySuggestion: specialSuggestion,
        productSuggestion: updated,
      });
      return updated;
    });
    showToast('پیشنهاد محصول مجدداً فعال شد.');
  };

  // Game card save & share handlers
  const handleSaveGamePlan = (games: GameCard[]) => {
    games.forEach((game, index) => {
      let targetDateStr = 'امروز';
      if (game.dayLabel) {
        targetDateStr = game.dayLabel;
      } else if (game.dayNumber === 2 || index === 1) {
        targetDateStr = 'فردا';
      } else if (game.dayNumber === 3 || index === 2) {
        targetDateStr = 'پس‌فردا';
      }
      handleSaveGameCard(game, targetDateStr);
    });
    showToast('بسته ۳ روزه با موفقیت در روزهای امروز، فردا و پس‌فردا ذخیره شد 🗓️');
  };

  const handleSaveGameCard = (game: GameCard, date: string = 'امروز') => {
    // Save to archive if not already there
    if (!savedGames.some(g => g.id === game.id)) {
      const updated = [{ ...game, savedAt: date }, ...savedGames];
      setSavedGames(updated);
    } else {
      // Update savedAt date if already saved
      setSavedGames(prev => prev.map(g => g.id === game.id ? { ...g, savedAt: date } : g));
    }

    // Add to scheduled daily tasks
    const targetChildId = activeChild ? activeChild.id : (profile.children[0]?.id || 'child_default');
    const childName = activeChild?.name || 'کودک';

    const task: DailyTask = {
      id: `task_game_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      childId: targetChildId,
      title: game.title,
      subtitle: `${game.surah} • ${game.tag}`,
      duration: game.duration,
      completed: false,
      category: (game.tag as any) || 'بازی حفظ جدید',
      date: date,
      gameCard: game,
      materials: game.materials,
      steps: game.steps,
      description: game.description,
      quranSegment: game.quranSegment,
    };
    setDailyTasks(prev => [...prev, task]);

    showToast(`برنامه برای ${date} ${childName} ذخیره شد 🗓️`);
  };

  const handleAttachAndShare = (game: GameCard) => {
    handleSaveGameCard(game);
    setAttachedGame(game);
    setActiveTab('feed');
    showToast('کارت به بخش اشتراک تجربه پیوست شد 🚀');
  };

  const handleOpenGameModal = (game: GameCard) => {
    setSelectedGameForModal(game);
    setIsGameModalOpen(true);
  };

  const handleUpdateGameCard = (updated: GameCard) => {
    setSavedGames(prev =>
      prev.map(g => (g.id === updated.id ? updated : g))
    );
    if (selectedGameForModal?.id === updated.id) {
      setSelectedGameForModal(updated);
    }
    if (attachedGame?.id === updated.id) {
      setAttachedGame(updated);
    }
    showToast('تغییرات کارت ذخیره شد.');
  };

  // Feed & Experience handlers
  const handleCreatePost = async (text: string, gameToAttach?: GameCard) => {
    const authorChildName = activeChild?.name || 'فرزندم';
    const authorChildAge = activeChild?.age || 5;

    const newPost = await feedService.createPost({
      authorId: profile.id,
      authorName: profile.username || `مادر ${authorChildName}`,
      authorChildName,
      authorChildAge,
      text,
      attachedGameCard: gameToAttach,
    });
    setExperiences(prev => [newPost, ...prev]);
    setAttachedGame(null);
    showToast('تجربه شما با موفقیت در جامعه مادران منتشر شد 🌱');
  };

  const handleToggleHelpful = async (postId: string) => {
    // Optimistic UI update
    setExperiences(prev =>
      prev.map(post => {
        if (post.id === postId) {
          const isCurrentlyMarked = !!post.hasUserMarkedHelpful;
          return {
            ...post,
            hasUserMarkedHelpful: !isCurrentlyMarked,
            helpfulCount: isCurrentlyMarked ? Math.max(0, post.helpfulCount - 1) : post.helpfulCount + 1,
          };
        }
        return post;
      })
    );

    const result = await feedService.toggleHelpful(postId, profile.id);
    if (result) {
      setExperiences(prev =>
        prev.map(post =>
          post.id === postId
            ? { ...post, hasUserMarkedHelpful: result.hasUserMarkedHelpful, helpfulCount: result.helpfulCount }
            : post
        )
      );
    }
  };

  const handleAddComment = async (postId: string, text: string) => {
    const authorName = profile.username || 'مادر قرآن‌آموز';
    const authorChild = activeChild ? `مادر ${activeChild.name}` : undefined;
    const tempId = `c_${Date.now()}`;

    const newComment: Comment = {
      id: tempId,
      authorName,
      authorChild,
      text,
      createdAt: 'لحظاتی پیش',
      replies: [],
    };

    setExperiences(prev =>
      prev.map(p => {
        if (p.id === postId) {
          return { ...p, comments: [...p.comments, newComment] };
        }
        return p;
      })
    );

    const savedComment = await feedService.addComment(postId, {
      authorId: profile.id,
      authorName,
      authorChild,
      text,
    });

    if (savedComment) {
      setExperiences(prev =>
        prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              comments: p.comments.map(c => c.id === tempId ? savedComment : c)
            };
          }
          return p;
        })
      );
    }
    showToast('دیدگاه شما ثبت شد.');
  };

  const handleAddReply = async (postId: string, commentId: string, text: string) => {
    const authorName = profile.username || 'مادر قرآن‌آموز';
    const authorChild = activeChild ? `مادر ${activeChild.name}` : undefined;
    const tempId = `r_${Date.now()}`;

    const newReply: Reply = {
      id: tempId,
      authorName,
      authorChild,
      text,
      createdAt: 'لحظاتی پیش',
    };

    setExperiences(prev =>
      prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: p.comments.map(c => {
              if (c.id === commentId) {
                return { ...c, replies: [...(c.replies || []), newReply] };
              }
              return c;
            }),
          };
        }
        return p;
      })
    );

    const savedReply = await feedService.addReply(postId, commentId, {
      authorId: profile.id,
      authorName,
      authorChild,
      text,
    });

    if (savedReply) {
      setExperiences(prev =>
        prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              comments: p.comments.map(c => {
                if (c.id === commentId) {
                  return {
                    ...c,
                    replies: c.replies.map(r => r.id === tempId ? savedReply : r)
                  };
                }
                return c;
              }),
            };
          }
          return p;
        })
      );
    }
    showToast('پاسخ شما ارسال شد.');
  };

  const handleReportPost = (postId: string) => {
    setReportingPostId(postId);
    setIsReportModalOpen(true);
  };

  const handleConfirmReport = async (postId: string, reason: string) => {
    setExperiences(prev =>
      prev.map(p => (p.id === postId ? { ...p, isReported: true } : p))
    );
    await feedService.reportPost(postId, reason);
    showToast('گزارش برای بررسی ناظران ارسال شد.');
  };

  const handleOpenEditPost = (post: ExperiencePost) => {
    setEditingPost(post);
    setIsEditPostModalOpen(true);
  };

  const handleSavePostEdit = async (postId: string, newText: string) => {
    setExperiences(prev =>
      prev.map(p => (p.id === postId ? { ...p, text: newText } : p))
    );
    await feedService.updatePost(postId, newText);
    showToast('متن تجربه ویرایش شد.');
  };

  const handleDeletePost = async (postId: string) => {
    setExperiences(prev => prev.filter(p => p.id !== postId));
    await feedService.deletePost(postId);
    showToast('تجربه حذف شد.');
  };

  // Stats calculation
  const totalHelpfulReceived = experiences
    .filter(p => p.isOwn)
    .reduce((sum, p) => sum + (p.helpfulCount || 0), 0);

  const myPosts = experiences.filter(p => p.isOwn);

  return (
    <div dir="rtl" className="min-h-screen bg-[#FAF8F5] text-[#383431] flex flex-col items-center justify-start antialiased font-sans selection:bg-[#FEE4D6] pb-10">
      {/* Mobile-first frame container */}
      <div className="w-full max-w-md min-h-screen flex flex-col relative bg-[#FAF8F5]">
        
        {/* Header */}
        <Header
          profile={profile}
          onOpenProfile={() => setActiveTab('profile')}
          onOpenSettings={handleOpenSettings}
          onResetSpecialSuggestion={handleResetSpecialSuggestion}
        />

        {/* Main Content by Active Tab */}
        <main ref={mainRef} className="flex-1 w-full overflow-y-auto no-scrollbar">
          {/* TAB 1: HOME (خانه) */}
          {activeTab === 'home' && (
            <motion.div
              key="tab-home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3 pb-28 pt-1"
            >
              {/* Amazing Suggestions Slider (Horizontal Single-Slide Carousel with Dots) */}
              {profile.children.length > 0 && (specialSuggestion || productSuggestion || reviewSuggestions.length > 0) && (
                <SpecialSuggestionsSlider
                  specialSuggestion={specialSuggestion}
                  productSuggestion={productSuggestion}
                  reviewSuggestions={reviewSuggestions}
                  onDismissSpecial={handleDismissSpecialSuggestion}
                  onDismissProduct={handleDismissProductSuggestion}
                  onDismissReview={handleDismissReviewSuggestion}
                  onOpenGameModal={handleOpenGameModal}
                  onOpenProductModal={(prod) => {
                    setSelectedProductForModal(prod);
                    setIsProductModalOpen(true);
                  }}
                  onAddTaskFromGame={handleAddTaskFromGame}
                  onResetSpecial={handleResetSpecialSuggestion}
                  onResetProduct={handleResetProductSuggestion}
                  onResetReviews={handleResetReviews}
                />
              )}

              {/* Sequential Independent Children Tasks (برنامه روزانه فرزندان) */}
              <DailyTasksSection
                childrenList={profile.children}
                tasks={dailyTasks}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onRequestPlan={(child) => {
                  const targetChild = child || activeChild || profile.children[0];
                  if (targetChild) {
                    handleSelectActiveChild(targetChild.id);
                    setCoachInitialPrompt(`برنامه حفظ و مرور برای ${targetChild.name} عزیز را ادامه بده و متناسب با سن او بازی‌های خلاقانه قرآنی پیشنهاد کن.`);
                  } else {
                    setCoachInitialPrompt('لطفاً یک برنامه ۳ روزه برای حفظ و مرور قرآنی کودک همراه با بازی پیشنهاد بده.');
                  }
                  handleTabChange('coach');
                }}
                onToggleTask={handleToggleTask}
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
                onOpenAddChildModal={() => {
                  setEditingChild(null);
                  setIsAddChildModalOpen(true);
                }}
              />

              {/* Gentle Reflection for Mothers (بدون عنوان و فقط متن، با فاصله مناسب از نویگیشن بار) */}
              <div className="mx-5 my-3 p-4 rounded-[22px] bg-[#FFFBF7] border border-[#F2ECE1] text-right shadow-[0_2px_8px_rgba(0,0,0,0.015)]">
                <div className="flex items-start gap-2.5">
                  <Quote className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5 opacity-70" />
                  <p className="text-[12.5px] text-[#5E554D] leading-relaxed">
                    «{dailyReflection.text}»
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: SMART COACH (مربی هوشمند و بازی‌ساز) */}
          {activeTab === 'coach' && (
            <motion.div
              key="tab-coach"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CoachView
                key={profile.id}
                profile={profile}
                activeChild={activeChild}
                dailyTasks={dailyTasks}
                savedGames={savedGames}
                onSelectChild={handleSelectActiveChild}
                initialPrompt={coachInitialPrompt}
                onClearInitialPrompt={() => setCoachInitialPrompt('')}
                onOpenAddChildModal={() => {
                  setEditingChild(null);
                  setIsAddChildModalOpen(true);
                }}
                onSaveGameCard={handleSaveGameCard}
                onSaveGamePlan={handleSaveGamePlan}
                onAttachAndShare={handleAttachAndShare}
                savedGameIds={savedGames.map(g => g.id)}
                onOpenEditModal={(game, callback) => {
                  setSelectedGameForModal(game);
                  setIsGameModalOpen(true);
                }}
                onRequireAuth={(reason) => handleOpenAuth('register', reason)}
                onOpenWallet={() => handleOpenSettings('wallet')}
                onDeductWallet={handleDeductWallet}
                onUpdateChild={handleSaveChild}
              />
            </motion.div>
          )}

          {/* TAB 3: COMMUNITY EXPERIENCES FEED (تجربه‌ها و گفتگو) */}
          {activeTab === 'feed' && (
            <motion.div
              key="tab-feed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FeedView
                profile={profile}
                posts={experiences}
                savedGames={savedGames}
                attachedGame={attachedGame}
                onSelectAttachedGame={(game) => {
                  setAttachedGame(game);
                  showToast(`کارت بازی «${game.title}» پیوست شد 🧩`);
                }}
                onRemoveAttachedGame={() => setAttachedGame(null)}
                onCreatePost={handleCreatePost}
                onToggleHelpful={handleToggleHelpful}
                onAddComment={handleAddComment}
                onAddReply={handleAddReply}
                onReportPost={handleReportPost}
                onEditPost={handleOpenEditPost}
                onDeletePost={handleDeletePost}
                onOpenGameModal={handleOpenGameModal}
                onRequireAuth={(reason) => handleOpenAuth('register', reason)}
              />
            </motion.div>
          )}

          {/* TAB 4: PROFILE (پروفایل و فرزندان) */}
          {activeTab === 'profile' && (
            <motion.div
              key="tab-profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ProfileView
                profile={profile}
                savedGames={savedGames}
                myPosts={myPosts}
                totalHelpfulReceived={totalHelpfulReceived}
                onOpenEditUsername={() => handleOpenAuth('edit_profile')}
                onOpenAuth={(mode) => handleOpenAuth(mode || 'register')}
                onOpenSettings={handleOpenSettings}
                onLogout={handleLogout}
                onOpenAddChildModal={() => {
                  setEditingChild(null);
                  setIsAddChildModalOpen(true);
                }}
                onOpenEditChildModal={(child) => {
                  setEditingChild(child);
                  setIsAddChildModalOpen(true);
                }}
                onDeleteChild={handleDeleteChild}
                onOpenGameModal={handleOpenGameModal}
                onEditGame={(game) => {
                  setSelectedGameForModal(game);
                  setIsGameModalOpen(true);
                }}
                onAttachAndShare={handleAttachAndShare}
                onEditPost={handleOpenEditPost}
                onDeletePost={handleDeletePost}
              />
            </motion.div>
          )}
        </main>

        {/* Fixed PWA Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          hasAttachedGame={!!attachedGame}
        />

        {/* Global Modals */}
        <GameCardModal
          game={selectedGameForModal}
          isOpen={isGameModalOpen}
          onClose={() => {
            setIsGameModalOpen(false);
            setSelectedGameForModal(null);
          }}
          onSaveUpdate={handleUpdateGameCard}
          onAttachAndShare={handleAttachAndShare}
          isSaved={
            selectedGameForModal
              ? savedGames.some(g => g.id === selectedGameForModal.id)
              : false
          }
          onToggleSave={handleSaveGameCard}
          onAddTaskFromGame={handleAddTaskFromGame}
          childName={
            (selectedGameForModal && specialSuggestion && selectedGameForModal.id === specialSuggestion.gameCard?.id
              ? specialSuggestion.targetChildName
              : undefined) ||
            activeChild?.name
          }
        />

        <ProductDetailModal
          product={selectedProductForModal}
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false);
            setSelectedProductForModal(null);
          }}
          onAddToDailyTasks={handleAddTaskFromProduct}
          childName={
            (selectedProductForModal?.targetChildId
              ? profile.children.find(c => c.id === selectedProductForModal.targetChildId)?.name
              : undefined) ||
            selectedProductForModal?.targetChildName ||
            activeChild?.name
          }
        />

        <AddChildModal
          isOpen={isAddChildModalOpen}
          onClose={() => {
            setIsAddChildModalOpen(false);
            setEditingChild(null);
          }}
          onSaveChild={handleSaveChild}
          editingChild={editingChild}
          isFirstChildPrompt={profile.children.length === 0}
        />

        <EditPostModal
          post={editingPost}
          isOpen={isEditPostModalOpen}
          onClose={() => {
            setIsEditPostModalOpen(false);
            setEditingPost(null);
          }}
          onSave={handleSavePostEdit}
        />

        <ReportModal
          postId={reportingPostId}
          isOpen={isReportModalOpen}
          onClose={() => {
            setIsReportModalOpen(false);
            setReportingPostId(null);
          }}
          onConfirmReport={handleConfirmReport}
        />

        <AuthModal
          currentProfile={profile}
          isOpen={isAuthModalOpen}
          initialMode={authModalMode}
          reasonMessage={authReasonMessage}
          onClose={() => {
            setIsAuthModalOpen(false);
            setAuthReasonMessage(undefined);
          }}
          onSaveProfile={(updated) => {
            setProfile(updated);
            if (updated.isAuthenticated) {
              setActiveTab('feed');
              scrollToTop();
              setIsSettingsModalOpen(false);
              showToast(`خوش آمدید ${updated.username || ''} عزیز 🌸 به فید تجربیات هدایت شدید.`);
            } else {
              showToast('اطلاعات حساب کاربری با موفقیت بروز شد 🌱');
            }
          }}
          onSaveChild={handleSaveChild}
        />

        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          profile={profile}
          onUpdateProfile={(updated) => setProfile(updated)}
          onLogout={handleLogout}
          initialSection={settingsSection}
          onOpenAuth={(mode) => handleOpenAuth(mode)}
          onToast={showToast}
        />

        {/* Subtle Toast Notification */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[#2C2724]/95 text-white text-xs font-medium shadow-lg backdrop-blur-xs flex items-center gap-2 border border-white/10"
            >
              <Check className="w-3.5 h-3.5 text-[#48BB78]" />
              <span>{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
