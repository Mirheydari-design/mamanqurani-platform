import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Edit3, Calendar, 
  Bookmark,
  Share2,
  Check,
  RefreshCw,
  Clock,
  User,
  ChevronDown,
  Plus,
  Target,
  History,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  X,
  Trash2,
  Wallet,
  AlertCircle
} from 'lucide-react';
import { GameCard, UserProfile, Child, ItemCategoryType, CoachHistoryItem } from '../types';
import { CoachHistoryModal } from './CoachHistoryModal';
import { motion, AnimatePresence } from 'motion/react';
import { getCategoryMeta, CATEGORIES_LIST } from '../utils/categoryHelpers';
import { toPersianDigits } from '../utils/persian';
import { formatStepWithEmoji, NEW_MEMORIZATION_STATIC_STEPS, getNewMemorizationStaticSteps, isNewMemorizationProgram } from '../utils/stepUtils';
import { normalizeSurahName, formatProgramCardTitle } from '../utils/quranUtils';
import { generateRuleBasedReviewCards } from '../utils/reviewCardsGenerator';
import { calculateCostInTomans } from '../services/authService';

import { DailyTask } from '../types';

const defaultCoachHistorySeed: CoachHistoryItem[] = [];
interface CoachViewProps {
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  dailyTasks?: DailyTask[];
  savedGames?: GameCard[];
  profile: UserProfile;
  activeChild: Child | undefined;
  onSelectChild: (childId: string) => void;
  onOpenAddChildModal: () => void;
  onSaveGameCard: (game: GameCard, date?: string) => void;
  onSaveGamePlan?: (games: GameCard[]) => void;
  onAttachAndShare: (game: GameCard) => void;
  savedGameIds: string[];
  onOpenEditModal: (game: GameCard, onSave: (updated: GameCard) => void) => void;
  onRequireAuth?: (reasonMessage?: string) => void;
  onOpenWallet?: () => void;
  onDeductWallet?: (amount: number, title?: string) => void;
  onUpdateChild?: (child: Child) => void;
}

export const CoachView: React.FC<CoachViewProps> = ({
  initialPrompt,
  onClearInitialPrompt,
  dailyTasks = [],
  savedGames = [],
  profile,
  activeChild,
  onSelectChild,
  onOpenAddChildModal,
  onSaveGameCard,
  onSaveGamePlan,
  onAttachAndShare,
  savedGameIds,
  onOpenEditModal,
  onRequireAuth,
  onOpenWallet,
  onDeductWallet,
  onUpdateChild,
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategoryType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [adviceResult, setAdviceResult] = useState<string | null>(null);
  const [stepsResult, setStepsResult] = useState<string[]>([]);
  const [generatedCards, setGeneratedCards] = useState<GameCard[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(0);
  const [isChildDropdownOpen, setIsChildDropdownOpen] = useState(false);
  const [openMenuCardId, setOpenMenuCardId] = useState<string | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isWalletLowModalOpen, setIsWalletLowModalOpen] = useState(false);

  
  const [coachHistory, setCoachHistory] = useState<CoachHistoryItem[]>(() => {
    if (!profile.children || profile.children.length === 0) {
      return [];
    }
    try {
      const saved = localStorage.getItem(`quran_app_coach_history_${profile.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => ({
            ...item,
            childId: item.childId || (profile.children[0]?.id || ''),
            cards: (item.cards || []).map((c: any) => ({
              ...c,
              surah: normalizeSurahName(c.surah),
            })),
          }));
        }
      }
    } catch {}
    return defaultCoachHistorySeed;
  });

  const [hasSavedAllOnce, setHasSavedAllOnce] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`has_saved_coach_cards_once_${profile.id}`) === 'true';
    } catch {
      return false;
    }
  });

  const allCurrentCardsSaved = generatedCards.length > 0 && generatedCards.every(c => savedGameIds.includes(c.id));

  useEffect(() => {
    if (allCurrentCardsSaved && !hasSavedAllOnce) {
      setHasSavedAllOnce(true);
      try {
        localStorage.setItem(`has_saved_coach_cards_once_${profile.id}`, 'true');
      } catch {
        // ignore
      }
    }
  }, [allCurrentCardsSaved, hasSavedAllOnce, profile.id]);

  useEffect(() => {
    if (profile.children && profile.children.length > 0) {
      localStorage.setItem(`quran_app_coach_history_${profile.id}`, JSON.stringify(coachHistory));
    }
  }, [coachHistory, profile.id, profile.children]);

  const childName = activeChild?.name || 'کودکم';
  const childAge = activeChild?.age || 5;
  const childGoal = activeChild?.goal || 'انس با قرآن';
  const memorizationScope = activeChild?.hasStartedMemorization
    ? activeChild.memorizationScope || 'شروع حفظ'
    : 'هنوز حفظ را شروع نکرده';

  const quickPrompts = [
    `${childName} سوره فیل رو تو آیه سوم قاطی می‌کنه و یک بازی جذاب پرتابی می‌خوام`,
    `یک برنامه مرور نزدیک برای تثبیت سوره‌های کوثر و قریش در ۵ دقیقه`,
    `آموزش مفهوم سوره عصر با یک داستان و بازی خلاقانه`,
    `یک بازی تحویل حفظ پرهیجان برای اینکه ${childName} سوره نصر رو به پدرش تحویل بده`,
  ];

  const handleGenerate = async (textToUse?: string, catToUse?: ItemCategoryType) => {
    const text = textToUse || promptInput;
    if (!text.trim() || isLoading) return;

    if (!profile.isAuthenticated) {
      onRequireAuth?.('برای دریافت برنامه اختصاصی و استفاده از مربی هوشمند، لطفاً ابتدا ثبت‌نام کنید یا وارد شوید.');
      return;
    }

    const currentBal = profile.walletBalance ?? 100_000;
    if (currentBal < 1_000) {
      setIsWalletLowModalOpen(true);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    setAdviceResult(null);
    setStepsResult([]);
    setGeneratedCards([]);

    const categoryForRequest = catToUse || (selectedCategory !== 'all' ? selectedCategory : undefined);

    // Extract recent saved memorization & review programs (strictly excluding games) to preserve continuity
    const programsFromTasks = dailyTasks
      .filter(t => !activeChild || !t.childId || t.childId === activeChild.id)
      .filter(t => {
        const isGame = t.category?.startsWith('بازی') || t.title?.includes('بازی') || t.gameCard?.itemType === 'game';
        return !isGame;
      })
      .map(t => ({
        date: t.date || 'اخیر',
        title: t.title,
        category: t.category || (t.gameCard?.tag ?? 'برنامه حفظ جدید'),
        surah: t.gameCard?.surah || (t.title?.includes('سوره') ? t.title : ''),
        quranSegment: t.quranSegment || t.gameCard?.quranSegment || t.subtitle || '',
        subtitle: t.subtitle,
      }));

    const programsFromSavedCards = (savedGames || [])
      .filter(g => {
        const isGame = g.itemType === 'game' || g.tag?.startsWith('بازی') || g.title?.includes('بازی');
        return !isGame;
      })
      .map(g => ({
        date: g.savedAt || 'اخیر',
        title: g.title,
        category: g.tag || 'برنامه حفظ جدید',
        surah: g.surah,
        quranSegment: g.quranSegment || '',
        subtitle: g.topic,
      }));

    const recentSavedPrograms = [...programsFromTasks, ...programsFromSavedCards].slice(-10);

    try {
      const response = await fetch('/api/gemini/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: text.trim(),
          childName,
          childAge,
          childGoal,
          memorizationScope,
          categoryType: categoryForRequest,
          childSurahProgress: activeChild?.surahProgress || [],
          recentSavedPrograms,
        }),
      });

      if (!response.ok) {
        throw new Error('خطا در دریافت پاسخ از سرور');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const generalAdviceText = data.generalAdvice || data.advice || null;
      setAdviceResult(generalAdviceText);
      setStepsResult(data.steps || []);

      // Register new surah scope into child's progress if child is learning a surah outside current scope
      if (data.newSurahScope && activeChild && onUpdateChild) {
        const newSurahName = data.newSurahScope.surah;
        const currentProgs = activeChild.surahProgress ? [...activeChild.surahProgress] : [];
        if (!currentProgs.some(p => p.surah === newSurahName || newSurahName.includes(p.surah) || p.surah.includes(newSurahName))) {
          onUpdateChild({
            ...activeChild,
            surahProgress: [...currentProgs, { surah: newSurahName, progress: 0, status: 'learning' }]
          });
        }
      }

      const isChatOnly = data.intent_detected === 'chat_only' || (!data.cards || data.cards.length === 0);

      if (isChatOnly) {
        setGeneratedCards([]);
        const newHistoryItem: CoachHistoryItem = {
          id: `hist_${Date.now()}`,
          prompt: text.trim(),
          date: new Date().toISOString(),
          advice: generalAdviceText,
          steps: [],
          cards: [],
          childId: activeChild?.id || 'unknown'
        };
        setCoachHistory(prev => [newHistoryItem, ...prev].slice(0, 20));

        const cost = calculateCostInTomans(data.tokensUsed || 1000);
        onDeductWallet?.(cost, 'مشاوره صمیمانه مربی هوشمند');
        return;
      }

      if (data.cards && Array.isArray(data.cards)) {
        const newCards: GameCard[] = data.cards.map((c: any, index: number) => {
          const isProgram = c.itemType === 'program' || c.tag?.startsWith('برنامه');
          let dayNumber = Number(c.dayNumber) || (index + 1);
          if (dayNumber > 3 || dayNumber < 1) {
            dayNumber = (index % 3) + 1;
          }
          const dayLabel = c.dayLabel || (dayNumber === 1 ? 'امروز' : dayNumber === 2 ? 'فردا' : 'پس‌فردا');
          const isNewMem = isNewMemorizationProgram(c.tag, c.title, isProgram ? 'program' : 'game');
          const staticStepsText = getNewMemorizationStaticSteps(childAge).map(s => `${s.title}: ${s.desc}`);

          let cleanTitle = '';
          if (isProgram) {
            cleanTitle = formatProgramCardTitle({
              title: c.title,
              tag: c.tag,
              itemType: 'program',
              surah: c.surah,
              quranSegment: c.quranSegment,
              topic: c.topic,
            });
          } else {
            // Preserve game card titles as-is; only remove robotic day prefixes like "روز دوم:"
            cleanTitle = (c.title || '').replace(/^روز\s*(چهارم|پنجم|ششم|[۰-۹]+|\d+)\s*[:\-–]\s*/i, '').trim() || c.title || '';
          }

          return {
            id: `gen_item_${Date.now()}_${index}`,
            title: cleanTitle,
            surah: normalizeSurahName(c.surah),
            topic: isNewMem ? '' : (c.topic || ''),
            quranSegment: c.quranSegment,
            description: isNewMem ? '' : (c.description || ''),
            materials: isProgram ? [] : (c.materials || []),
            steps: isNewMem ? staticStepsText : (c.steps || []),
            duration: c.duration || (isProgram ? '۱۰ دقیقه' : '۱۰ دقیقه'),
            ageRange: c.ageRange || `${toPersianDigits(childAge)} سال`,
            tag: isNewMem ? 'برنامه حفظ جدید' : (c.tag || (isProgram ? 'برنامه حفظ جدید' : 'بازی حفظ جدید')),
            itemType: isProgram ? 'program' : 'game',
            dayNumber,
            dayLabel,
            isCustom: true,
          };
        });
        let finalCards: GameCard[] = [...newCards];

        // If user is requesting a complete program or general plan and child has previous memorizations,
        // automatically generate and blend Near Review & Far Review cards according to guidelines
        const isCompleteProgramReq =
          !categoryForRequest ||
          categoryForRequest === 'all' ||
          categoryForRequest.includes('برنامه') ||
          categoryForRequest.includes('مرور') ||
          text.includes('برنامه') ||
          text.includes('کامل') ||
          text.includes('۳ روز') ||
          text.includes('حفظ') ||
          text.includes('مرور');

        if (isCompleteProgramReq && activeChild) {
          const reviewCards = generateRuleBasedReviewCards(activeChild, dailyTasks);
          if (reviewCards.length > 0) {
            // Filter out any review card that is already present in finalCards (by tag & surah)
            const neededReviewCards = reviewCards.filter(
              (rc) =>
                !finalCards.some(
                  (fc) =>
                    fc.tag === rc.tag &&
                    (fc.surah === rc.surah || fc.title.includes(rc.surah))
                )
            );

            // Seamlessly blend into the schedule:
            // Near Review for Day 1 (امروز), Far Review for Day 2 (فردا)
            neededReviewCards.forEach((rc) => {
              if (rc.tag === 'برنامه مرور نزدیک') {
                rc.dayNumber = 1;
                rc.dayLabel = 'امروز';
                // Insert after Day 1 new memorization if present, or at index 1
                const day1Index = finalCards.findIndex((c) => c.dayNumber === 1);
                if (day1Index !== -1) {
                  finalCards.splice(day1Index + 1, 0, rc);
                } else {
                  finalCards.unshift(rc);
                }
              } else if (rc.tag === 'برنامه مرور دور') {
                rc.dayNumber = 2;
                rc.dayLabel = 'فردا';
                const day2Index = finalCards.findIndex((c) => c.dayNumber === 2);
                if (day2Index !== -1) {
                  finalCards.splice(day2Index + 1, 0, rc);
                } else {
                  finalCards.push(rc);
                }
              } else {
                finalCards.push(rc);
              }
            });
          }
        }

        setGeneratedCards(finalCards);
        setActiveSlideIndex(0);
        setSlideDirection(0);
        
        // Save to history
        const newHistoryItem: CoachHistoryItem = {
          id: `hist_${Date.now()}`,
          prompt: text.trim(),
          date: new Date().toISOString(),
          advice: generalAdviceText,
          steps: [],
          cards: finalCards,
          childId: activeChild?.id || 'unknown'
        };
        setCoachHistory(prev => [newHistoryItem, ...prev].slice(0, 20));

        // Deduct from wallet based on usage
        const cost = calculateCostInTomans(data.tokensUsed);
        onDeductWallet?.(cost, 'مشاوره و طراحی برنامه مربی هوشمند');
      }
    } catch (err) {
      console.error(err);
      if (activeChild) {
        const fallbackReviewCards = generateRuleBasedReviewCards(activeChild, dailyTasks);
        if (fallbackReviewCards.length > 0) {
          setGeneratedCards(fallbackReviewCards);
          setActiveSlideIndex(0);
          setSlideDirection(0);
          setAdviceResult(`برنامه مرور اختصاصی بر اساس محفوظات قبلی ${activeChild.name} عزیز آماده شد.`);
          setHasError(false);
          const cost = calculateCostInTomans(1800);
          onDeductWallet?.(cost, 'مشاوره و طراحی برنامه مربی هوشمند');
          return;
        }
      }
      setHasError(true);
      setAdviceResult(null);
      setStepsResult([]);
      setGeneratedCards([]);
    } finally {
      setIsLoading(false);
    }
  };

  

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
  }, []);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() !== '') {
      setPromptInput(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
      setTimeout(() => {
        handleGenerate();
      }, 300);
    }
  }, [initialPrompt]);

  return (
    <div className="px-5 pt-3 pb-24 max-w-lg mx-auto">
      {/* Input Box Card */}
      <div className="rounded-[24px] bg-white border border-[#EBE6DC] p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)] mb-4 text-right relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#2C2724] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
              <span>مربی هوشمند</span>
            </span>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => {
                if (profile.children.length === 0) {
                  onOpenAddChildModal();
                } else {
                  setIsChildDropdownOpen(!isChildDropdownOpen);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E8E2D8] hover:bg-[#F2ECE2] transition-colors active:scale-95 cursor-pointer"
            >
              <span className="text-[11.5px] font-medium text-[#696057]">
                {profile.children.length === 0 ? '+ ثبت فرزند' : childName}
              </span>
              <Edit3 className="w-3 h-3 text-[#A89E96]" />
            </button>

            <AnimatePresence>
              {isChildDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-1.5 w-44 bg-white border border-[#EAE3D6] rounded-xl shadow-lg z-50 overflow-hidden"
                >
                  <div className="py-1 max-h-[160px] overflow-y-auto no-scrollbar">
                    {profile.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => {
                          onSelectChild(child.id);
                          setIsChildDropdownOpen(false);
                        }}
                        className="w-full text-right px-3 py-2 text-xs hover:bg-[#F9F7F4] flex items-center justify-between transition-colors"
                      >
                        <span className={child.id === activeChild?.id ? "font-bold text-[#2C2724]" : "text-[#696057]"}>
                          {child.name}
                        </span>
                        <span className="text-[10px] text-[#A89E96]">
                          {toPersianDigits(child.age)} سال
                        </span>
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        onOpenAddChildModal();
                        setIsChildDropdownOpen(false);
                      }}
                      className="w-full text-right px-3 py-2 text-xs hover:bg-[#F9F7F4] flex items-center gap-1 text-[#D97706] transition-colors border-t border-[#F4EFE6]"
                    >
                      <Plus className="w-3 h-3" />
                      <span>افزودن فرزند</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="relative">
          <textarea
            rows={promptInput.trim() ? 4 : 3}
            value={promptInput}
            onChange={(e) => {
              const val = e.target.value;
              setPromptInput(val);
              if (!val.trim() && generatedCards.length > 0) {
                setGeneratedCards([]);
              }
            }}
            placeholder={
              profile.children.length > 0
                ? `شرایط، سوره یا چالش ${childName} را بنویسید (مثلاً: در آیه ۳ سوره فیل خسته میشه، یا یک بازی برای مرور نزدیک کوثر می‌خوام)...`
                : 'شرایط، سن کودک یا چالش قرآنی‌تان را بنویسید (مثلاً: برای کودک ۵ ساله چطور سوره فیل رو با بازی آموزش بدم)...'
            }
            className="w-full text-[13.5px] p-2 pl-8 bg-transparent text-[#383431] placeholder-[#A89E96] focus:outline-none resize-none leading-relaxed text-right transition-all"
          />
          {promptInput.trim().length > 0 && (
            <button
              type="button"
              onClick={() => {
                setPromptInput('');
                setGeneratedCards([]);
              }}
              className="absolute left-1 top-2 p-1 rounded-full text-[#A89E96] hover:text-[#2C2724] hover:bg-[#F2ECE2] transition-colors cursor-pointer"
              title="پاک کردن متن و مشاهده تاریخچه و پیشنهادها"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Prompts (پیشنهادهای بخش پایینی باکس هنگام شروع نوشتن کاربر محو می‌شوند تا فضا کاملاً باز و خلوت باشد) */}
        <AnimatePresence>
          {!promptInput.trim() && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-[#F4EFE6]">
                {quickPrompts.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPromptInput(chip);
                      setGeneratedCards([]);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-[#FAF8F5] hover:bg-[#F2ECE2] text-[#6E645C] border border-[#E8E2D8] transition-all text-right active:scale-95 cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <div className="mt-3.5 flex items-center justify-end">
          <button
            onClick={() => handleGenerate()}
            disabled={!promptInput.trim() || isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2C2724] hover:bg-[#433D38] disabled:opacity-50 text-white text-xs font-medium transition-all active:scale-95 shadow-sm"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>در حال ساخت...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
                <span>دریافت برنامه و بازی</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Coach History List Section (appears right below input box when prompt is empty) */}
      <AnimatePresence mode="wait">
        {!promptInput.trim() && !isLoading && generatedCards.length === 0 && (
          <motion.div
            key="coach-history-container"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.04,
                },
              },
              exit: {
                opacity: 0,
                y: -10,
                transition: { duration: 0.15 },
              },
            }}
            className="space-y-3.5 text-right mb-6"
          >
            {/* Header of Coach History */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#FAF5EE] border border-[#EAE3D6] text-[#D97706] flex items-center justify-center shadow-2xs">
                  <History className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#2C2724]">تاریخچه مربی</h3>
              </div>

              <span className="text-xs text-[#7A7067] font-semibold bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#EFEBE3] shadow-2xs">
                {toPersianDigits(coachHistory.length)} گفت‌وگو
              </span>
            </div>

            {/* List of History Cards with Individual Staggered Slide-Up Animation */}
            {coachHistory.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-[#EBE6DC] text-center text-[#8C827A] space-y-1.5 shadow-2xs">
                <History className="w-8 h-8 text-[#C4B9AD] mx-auto mb-1 stroke-[1.5]" />
                <p className="text-xs font-medium text-[#4A433E]">هنوز تاریخچه‌ای ثبت نشده است</p>
                <p className="text-[11px] text-[#8C827A]">
                  هر سؤالی از مربی بپرسید یا برنامه‌ای بسازید، در اینجا نمایش داده خواهد شد.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {coachHistory.map((item, index) => {
                  const targetChild = profile.children.find((c) => c.id === item.childId);
                  const childDisplayName = targetChild?.name || (item.childId === activeChild?.id ? activeChild?.name : 'فرزند');
                  const firstCard = item.cards?.[0];
                  const surahName = normalizeSurahName(firstCard?.surah);
                  const cardCount = item.cards?.length || 0;
                  const programsCount = item.cards?.filter(
                    (c) => c.itemType === 'program' || (c.tag && c.tag.includes('برنامه'))
                  ).length || 0;
                  const gamesCount = item.cards?.filter(
                    (c) => c.itemType === 'game' || (c.tag && c.tag.includes('بازی'))
                  ).length || 0;

                  let programsGamesLabel = '';
                  if (programsCount > 0 && gamesCount > 0) {
                    programsGamesLabel = `${toPersianDigits(programsCount)} برنامه و ${toPersianDigits(gamesCount)} بازی`;
                  } else if (programsCount > 0) {
                    programsGamesLabel = `${toPersianDigits(programsCount)} برنامه`;
                  } else if (gamesCount > 0) {
                    programsGamesLabel = `${toPersianDigits(gamesCount)} بازی`;
                  } else {
                    programsGamesLabel = `${toPersianDigits(cardCount)} برنامه و بازی`;
                  }

                  return (
                    <motion.div
                      key={item.id || index}
                      variants={{
                        hidden: { opacity: 0, y: 35, scale: 0.98 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          scale: 1,
                          transition: {
                            type: 'spring',
                            stiffness: 260,
                            damping: 22,
                          },
                        },
                        exit: {
                          opacity: 0,
                          y: 15,
                          transition: { duration: 0.15 },
                        },
                      }}
                      className="group relative rounded-[22px] bg-white border border-[#EAE4D9] hover:border-[#D6CBBF] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all cursor-pointer text-right"
                      onClick={() => {
                        if (item.childId && item.childId !== activeChild?.id) {
                          onSelectChild(item.childId);
                        }
                        setPromptInput(item.prompt);
                        setAdviceResult(item.advice);
                        setStepsResult(item.steps || []);
                        setGeneratedCards(item.cards || []);
                        setActiveSlideIndex(0);
                      }}
                    >
                      {/* Top Bar: Child Tag + Date */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        {/* Child Tag (تگ نام فرزند بدون سن) */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FAF4ED] text-[#92400E] border border-[#F2DFC9] shadow-2xs">
                          <span className="text-xs">👶</span>
                          <span>{childDisplayName}</span>
                        </div>

                        {/* Date */}
                        <span className="text-[10px] text-[#A89E96]">
                          {new Date(item.date).toLocaleDateString('fa-IR')}
                        </span>
                      </div>

                      {/* Prompt Question */}
                      <p className="text-[13px] font-bold text-[#2C2724] leading-relaxed line-clamp-2 mb-3 group-hover:text-[#B45309] transition-colors">
                        {item.prompt}
                      </p>

                      {/* Bottom Footer: Meta badges & Delete button */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-[#F4EFE6] text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {surahName && (
                            <span className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-lg bg-[#FAF8F5] text-[#696057] font-semibold border border-[#EAE3D6]">
                              <BookOpen className="w-3 h-3 text-[#D97706]" />
                              <span>{surahName}</span>
                            </span>
                          )}
                          <span className="text-[10.5px] px-2 py-0.5 rounded-lg bg-[#FAF8F5] text-[#7A7067] font-medium border border-[#EAE3D6]">
                            {programsGamesLabel}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCoachHistory((prev) => prev.filter((h) => h.id !== item.id));
                          }}
                          className="p-1.5 rounded-lg text-[#B5ABA1] hover:text-[#DC2626] hover:bg-[#FEE2E2]/60 transition-colors cursor-pointer"
                          title="حذف از تاریخچه"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Error Notification Area */}
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-5 rounded-2xl bg-[#FFFBF7] border border-[#F5C6CB] text-right space-y-2.5 shadow-sm mt-6"
          >
            <div className="flex items-center gap-2 text-[#C53030] font-bold text-sm">
              <span className="text-base">⚠️</span>
              <span>خطا در دریافت پاسخ</span>
            </div>
            <p className="text-xs text-[#4A3B32] leading-relaxed">
              متأسفانه در این لحظه مشکلی پیش اومده. لطفاً دوباره تلاش کنید.
            </p>
            <p className="text-xs text-[#634E3F] leading-relaxed pt-2.5 border-t border-[#FCDAD7]/70">
              اگر مشکل ادامه داشت، میتونید از نمونه‌های موجود در{' '}
              <a
                href="https://eitaa.com/maman_qurani"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D97706] hover:text-[#B45309] font-bold underline decoration-solid underline-offset-4 inline-flex items-center gap-0.5"
              >
                کانال مامان قرآنی
                <ExternalLink className="w-3 h-3 inline-block mr-0.5 opacity-70" />
              </a>{' '}
              استفاده کنید.
            </p>
            <div className="pt-1.5 flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setHasError(false);
                  handleGenerate();
                }}
                className="py-1.5 px-3.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>تلاش دوباره</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Results Area */}
      <AnimatePresence>
        {/* Chat-only advice result when no cards are generated */}
        {generatedCards.length === 0 && adviceResult && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-4 mt-6 text-right"
          >
            <div className="flex items-center justify-between pb-0.5">
              <button
                type="button"
                onClick={() => {
                  setPromptInput('');
                  setAdviceResult(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C827A] hover:text-[#2C2724] bg-white border border-[#EAE3D6] px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span>بازگشت به تاریخچه مربی</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFFBF7] to-[#FFF6EB] border border-[#FADCC0] shadow-xs text-right space-y-2.5">
              <div className="flex items-center gap-2 text-[#D97706] font-bold text-xs">
                <span className="text-base leading-none">🌸</span>
                <span>پاسخ و راهنمایی صمیمانه مربی هوشمند:</span>
              </div>
              <p className="text-[13px] text-[#54463C] leading-relaxed whitespace-pre-line">
                {adviceResult}
              </p>
            </div>
          </motion.div>
        )}

        {generatedCards.length > 0 && (() => {
          const isMultiDay = generatedCards.length > 1 || generatedCards.some(c => (c.dayNumber && c.dayNumber > 1) || c.dayLabel === 'فردا' || c.dayLabel === 'پس‌فردا');

          const day1Cards = generatedCards.filter(c => c.dayNumber === 1 || c.dayLabel === 'امروز' || (!c.dayNumber && !c.dayLabel && generatedCards.indexOf(c) === 0));
          const day2Cards = generatedCards.filter(c => c.dayNumber === 2 || c.dayLabel === 'فردا' || (!c.dayNumber && !c.dayLabel && generatedCards.indexOf(c) === 1));
          const day3Cards = generatedCards.filter(c => c.dayNumber === 3 || c.dayLabel === 'پس‌فردا' || (!c.dayNumber && !c.dayLabel && generatedCards.indexOf(c) === 2));

          const slides = isMultiDay ? [
            { dayNumber: 1, dayLabel: 'امروز', tabTitle: 'روز اول: امروز', emoji: '☀️', cards: day1Cards.length > 0 ? day1Cards : [generatedCards[0]] },
            { dayNumber: 2, dayLabel: 'فردا', tabTitle: 'روز دوم: فردا', emoji: '🌿', cards: day2Cards.length > 0 ? day2Cards : (generatedCards[1] ? [generatedCards[1]] : []) },
            { dayNumber: 3, dayLabel: 'پس‌فردا', tabTitle: 'روز سوم: پس‌فردا', emoji: '⭐', cards: day3Cards.length > 0 ? day3Cards : (generatedCards[2] ? [generatedCards[2]] : []) },
          ].filter(s => s.cards.length > 0) : [];

          const safeSlideIndex = Math.min(activeSlideIndex, Math.max(0, slides.length - 1));
          const currentSlide = slides[safeSlideIndex] || {
            dayNumber: 1,
            dayLabel: 'امروز',
            tabTitle: 'امروز',
            emoji: '☀️',
            cards: generatedCards,
          };

          const cardsToRender = isMultiDay && slides.length > 1 ? currentSlide.cards : generatedCards;
          const currentTargetDate = isMultiDay && slides.length > 1 ? currentSlide.dayLabel : 'امروز';

          return (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-4 mt-6 text-right"
            >
              {/* Back to Coach History Button */}
              <div className="flex items-center justify-between pb-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setPromptInput('');
                    setGeneratedCards([]);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C827A] hover:text-[#2C2724] bg-white border border-[#EAE3D6] px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span>بازگشت به تاریخچه مربی</span>
                </button>
              </div>

              {/* Distinct Motherly Guidance Box (بخش راهنمایی با زبان لطیف به مادر جدا از کارت‌ها) */}
              {adviceResult && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFFBF7] to-[#FFF6EB] border border-[#FADCC0] shadow-xs text-right space-y-2">
                  <div className="flex items-center gap-2 text-[#D97706] font-bold text-xs">
                    <span className="text-base leading-none">🌸</span>
                    <span>راهنمایی و نکات اختصاصی مربی برای مادر مهربان:</span>
                  </div>
                  <p className="text-xs text-[#54463C] leading-relaxed">
                    {adviceResult}
                  </p>
                </div>
              )}

              {/* 3-Day Horizontal Slider Controls */}
              {isMultiDay && slides.length > 1 && (
                <div className="space-y-3 mb-2">
                  {/* Segmented Tabs */}
                  <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#F4EFE6] border border-[#E8E0D2]">
                    {slides.map((s, idx) => {
                      const isActive = idx === safeSlideIndex;
                      return (
                        <button
                          key={s.dayNumber}
                          type="button"
                          onClick={() => {
                            setSlideDirection(idx > safeSlideIndex ? 1 : -1);
                            setActiveSlideIndex(idx);
                          }}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-white text-[#2C2724] shadow-xs'
                              : 'text-[#7D736A] hover:text-[#2C2724]'
                          }`}
                        >
                          <span>{s.emoji}</span>
                          <span className="truncate">{s.tabTitle}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation Arrows & Dots Indicator */}
                  <div className="flex items-center justify-between px-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (safeSlideIndex > 0) {
                          setSlideDirection(-1);
                          setActiveSlideIndex(safeSlideIndex - 1);
                        }
                      }}
                      disabled={safeSlideIndex === 0}
                      className="p-1.5 rounded-full bg-white border border-[#EAE3D6] text-[#7A7168] disabled:opacity-30 disabled:pointer-events-none hover:bg-[#FAF8F5] transition-all shadow-2xs cursor-pointer"
                      title="روز قبلی"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {slides.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSlideDirection(idx > safeSlideIndex ? 1 : -1);
                            setActiveSlideIndex(idx);
                          }}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            idx === safeSlideIndex ? 'w-6 bg-[#D97706]' : 'w-2 bg-[#DDD5C9]'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (safeSlideIndex < slides.length - 1) {
                          setSlideDirection(1);
                          setActiveSlideIndex(safeSlideIndex + 1);
                        }
                      }}
                      disabled={safeSlideIndex === slides.length - 1}
                      className="p-1.5 rounded-full bg-white border border-[#EAE3D6] text-[#7A7168] disabled:opacity-30 disabled:pointer-events-none hover:bg-[#FAF8F5] transition-all shadow-2xs cursor-pointer"
                      title="روز بعدی"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Cards for Active Slide */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={isMultiDay ? safeSlideIndex : 'single'}
                  initial={{ opacity: 0, x: slideDirection * 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -slideDirection * 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {cardsToRender.map((card) => {
                    const cardMeta = getCategoryMeta(card.tag);
                    const isMenuOpen = openMenuCardId === card.id;
                    const isSaved = savedGameIds.includes(card.id);
                    const isNewMem = isNewMemorizationProgram(card.tag, card.title, card.itemType);

                    return (
                      <div
                        key={card.id}
                        className="rounded-[26px] bg-white border border-[#EAE3D6] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-right"
                      >
                        {/* Header Badges */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cardMeta.badgeBg}`}>
                              {cardMeta.emoji} {cardMeta.label}
                            </span>
                            <span className="text-xs text-[#8C827A] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {toPersianDigits(card.duration)}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-[#D97706] bg-[#FFF3E0] px-3 py-1 rounded-full border border-[#FFE0B2]">
                            {normalizeSurahName(card.surah)}
                          </span>
                        </div>

                        {/* Title & Topic */}
                        <h3 className="text-base font-bold text-[#2C2724] mb-1">
                          {card.title}
                        </h3>
                        {!isNewMem && card.topic && (
                          <p className="text-xs text-[#8C827A] mb-3">
                            {card.topic}
                          </p>
                        )}

                        {/* Quran Segment Banner (قطعه قرآنی با خط زیبا در بالای کارت برنامه) */}
                        {card.quranSegment && (
                          <div className="mb-3.5 p-3 rounded-2xl bg-[#FFFDF9] border border-[#F2E5D4] shadow-2xs">
                            <div className="flex items-center justify-between gap-1 mb-1 text-[11px] font-semibold text-[#8C7A6B]">
                              <span className="flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-[#D97706]" />
                                <span>قطعه قرآنی این درس:</span>
                              </span>
                              <span className="text-[10px] text-[#A89C91]">
                                تکرار و ترتیل
                              </span>
                            </div>
                            <div className="text-base md:text-lg text-[#2C2724] text-center py-2 px-3 leading-loose bg-white rounded-xl border border-[#F0E6D8] select-text font-arabic tracking-wide font-medium">
                              {card.quranSegment}
                            </div>
                          </div>
                        )}

                        {/* Description (Only for non-new-memorization cards) */}
                        {!isNewMem && card.description && (
                          <p className="text-[13px] text-[#5C534D] leading-relaxed mb-4">
                            {card.description}
                          </p>
                        )}

                        {/* Materials (Only for games, never for Quran study programs) */}
                        {card.itemType === 'game' && card.materials && card.materials.length > 0 && (
                          <div className="mb-3.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#EFE9DF]">
                            <span className="text-xs font-semibold text-[#786F67] block mb-1.5">
                              📦 وسایل ساده در خانه:
                            </span>
                            <ul className="text-xs text-[#524B45] space-y-1">
                              {card.materials.map((m, mIdx) => (
                                <li key={mIdx} className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
                                  <span>{m}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Steps */}
                        <div className="mb-4">
                          {isNewMem ? (
                            <div className="space-y-2">
                              {NEW_MEMORIZATION_STATIC_STEPS.map((st, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EFE8DE] text-right space-y-1"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-base leading-none">{st.emoji}</span>
                                    <span className="text-xs font-bold text-[#38312B]">{st.title}</span>
                                  </div>
                                  <p className="text-[12px] text-[#5C534D] leading-relaxed pr-6">
                                    {st.desc}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <>
                              <span className="text-xs font-semibold text-[#786F67] block mb-1.5 flex items-center gap-1">
                                <Target className="w-3.5 h-3.5 text-[#D97706]" />
                                <span>{card.itemType === 'game' ? 'مراحل بازی:' : 'مراحل اجرا:'}</span>
                              </span>
                              <div className="space-y-1.5">
                                {card.steps.map((st, stIdx) => {
                                  const { emoji, text } = formatStepWithEmoji(st, stIdx);
                                  return (
                                    <div key={stIdx} className="text-xs text-[#473F3A] flex items-start gap-2 bg-[#FAF8F5]/80 p-2.5 rounded-xl border border-[#F2ECE2]">
                                      <span className="text-sm flex-shrink-0 mt-0.5 leading-none" role="img">{emoji}</span>
                                      <span className="leading-relaxed">{text}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-3 border-t border-[#F2ECE2] flex flex-wrap items-center justify-between gap-2">
                          <button
                            onClick={() =>
                              onOpenEditModal(card, (updated) => {
                                setGeneratedCards(prev => prev.map(c => c.id === card.id ? updated : c));
                              })
                            }
                            className="flex items-center gap-1.5 text-xs text-[#6B6157] hover:text-[#2C2724] py-1.5 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE2] border border-[#E7E0D5] transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>ویرایش کارت</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onSaveGameCard(card, currentTargetDate)}
                              disabled={isSaved}
                              className={`flex items-center gap-1.5 text-xs font-medium py-1.5 px-3.5 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer ${
                                isSaved
                                  ? 'bg-[#EBF7EE] text-[#2E7D32] border border-[#C8E6C9]'
                                  : 'bg-[#2C2724] text-white hover:bg-[#403934]'
                              }`}
                            >
                              {isSaved ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>ذخیره شد</span>
                                </>
                              ) : (
                                <>
                                  <Bookmark className="w-3.5 h-3.5" />
                                  <span>ذخیره برای {currentTargetDate}</span>
                                </>
                              )}
                            </button>

                            {!isSaved && (
                              <div className="relative">
                                <button
                                  onClick={() => setOpenMenuCardId(isMenuOpen ? null : card.id)}
                                  className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E7E0D5] text-[#6B6157] hover:text-[#2C2724] hover:bg-[#F2ECE2] flex items-center justify-center transition-all shadow-xs cursor-pointer"
                                  title="انتخاب زمان دیگر"
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                </button>

                                <AnimatePresence>
                                  {isMenuOpen && (
                                    <motion.div
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: 5 }}
                                      transition={{ duration: 0.15 }}
                                      className="absolute right-0 bottom-full mb-2 w-32 bg-white border border-[#EBE6DC] rounded-[16px] shadow-lg z-50 overflow-hidden"
                                    >
                                      <div className="py-1">
                                        {['امروز', 'فردا', 'پس‌فردا'].map(day => (
                                          <button
                                            key={day}
                                            onClick={() => {
                                              onSaveGameCard(card, day);
                                              setOpenMenuCardId(null);
                                            }}
                                            className="w-full text-right px-3 py-2 text-[11.5px] hover:bg-[#FAF8F5] text-[#4A433E] transition-colors border-b border-[#F4EFE6] last:border-0 cursor-pointer"
                                          >
                                            برنامه {day}
                                          </button>
                                        ))}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}

                            {isSaved && (
                              <motion.button
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                onClick={() => onAttachAndShare(card)}
                                className="flex items-center gap-1.5 text-xs font-medium py-1.5 px-3.5 rounded-xl bg-[#FFF0E6] text-[#D97706] hover:bg-[#FEE4D6] border border-[#FCD9C4] transition-all shadow-xs active:scale-95 cursor-pointer"
                                title="پیوست به اشتراک‌گذاری تجربه در جامعه مادران"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                                <span>اشتراک در تجربیات</span>
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>

              {/* Outline 3-Day Batch Save Button at the Bottom (appears once user has saved all cards individually or in subsequent sessions) */}
              {isMultiDay && slides.length > 1 && onSaveGamePlan && (allCurrentCardsSaved || hasSavedAllOnce) && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-2 pb-1 space-y-1.5 text-center"
                >
                  <button
                    type="button"
                    onClick={() => onSaveGamePlan(generatedCards)}
                    className="w-full py-3 px-4 rounded-2xl border-2 border-[#D97706] text-[#D97706] bg-transparent hover:bg-[#FFF9F2] active:scale-98 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <Calendar className="w-4.5 h-4.5" />
                    <span>
                      {allCurrentCardsSaved
                        ? 'به‌روزرسانی برنامه سه روزه در تقویم'
                        : 'ذخیره برنامه سه روزه در تقویم'}
                    </span>
                  </button>
                </motion.div>
              )}
            </motion.div>
          );
        })()}
      </AnimatePresence>

      <CoachHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={coachHistory.filter(h => h.childId === activeChild?.id)}
        onLoadHistory={(item) => {
          setPromptInput(item.prompt);
          setAdviceResult(item.advice);
          setStepsResult(item.steps);
          setGeneratedCards(item.cards);
        }}
        onDeleteHistory={(id) => setCoachHistory(prev => prev.filter(h => h.id !== id))}
        onClearAll={() => setCoachHistory(prev => prev.filter(h => h.childId !== activeChild?.id))}
      />

      {/* Insufficient Balance Modal with tender motherly message */}
      {isWalletLowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-white rounded-[28px] border border-[#E8E2D6] p-6 shadow-2xl text-right"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FFF8F2] border border-[#FCD9C4] flex items-center justify-center text-[#D97706] mx-auto mb-4 shadow-2xs">
              <Sparkles className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-[#2C2724] text-center mb-2.5">
              همراهی در مسیر حفظ قرآن {childName}
            </h3>

            <div className="text-xs text-[#524B45] text-center leading-relaxed space-y-2 mb-5">
              <p className="font-medium text-[#2C2724]">
                مادر عزیز و همراه گرامی سلام؛
              </p>
              <p className="text-[12px] text-[#524B45]">
                ما از صمیم قلب دوست داشتیم که تمام امکانات مربی هوشمند و طراحی بازی‌ها کاملاً رایگان و بدون هزینه در خدمت انس و حفظ قرآن فرزند دلبندتان باشد.
              </p>
              <p className="text-[11.5px] text-[#78716C] bg-[#FAF8F5] p-3 rounded-2xl border border-[#F0EBE1] text-right leading-relaxed">
                اما از آنجا که پردازش‌های هوش مصنوعی هزینه‌بر هستند، برای پایدار ماندن این خدمت نیازمند یاری شما هستیم.
              </p>
              <p className="text-[12px] font-medium text-[#D97706] pt-1">
                شما می‌توانید کیف پول خود را به هر مبلغ دلخواهی که مایلید شارژ بفرمایید تا مربی هوشمند با انگیزه در کنارتان باشد 🌱
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsWalletLowModalOpen(false)}
                className="py-2.5 px-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDD3] text-[#6E645C] text-xs hover:bg-[#F2ECE2] transition-all cursor-pointer"
              >
                بعداً
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsWalletLowModalOpen(false);
                  onOpenWallet?.();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#2C2724] text-white text-xs font-medium hover:bg-[#423B35] transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                شارژ کیف پول (مبلغ دلخواه)
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

