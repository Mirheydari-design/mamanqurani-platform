import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserPlus, Check, Sparkles, Edit3, ChevronDown, ChevronUp, Plus, Trash2, BookOpen } from 'lucide-react';
import { Child, SurahProgress } from '../types';
import { JUZ_30_SURAHS, JUZ_29_SURAHS } from '../services/quranService';
import { toPersianDigits } from '../utils/persian';

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveChild: (child: Child) => void;
  editingChild?: Child | null;
  isFirstChildPrompt?: boolean;
}

export const AddChildModal: React.FC<AddChildModalProps> = ({
  isOpen,
  onClose,
  onSaveChild,
  editingChild,
  isFirstChildPrompt = false,
}) => {
  const [name, setName] = useState(editingChild?.name || '');
  const [age, setAge] = useState<number>(editingChild?.age || 5);
  const [goal, setGoal] = useState(editingChild?.goal || '');
  const [hasStartedMemorization, setHasStartedMemorization] = useState(
    editingChild?.hasStartedMemorization ?? false
  );
  const [memorizationScope, setMemorizationScope] = useState(
    editingChild?.memorizationScope || 'جزء ۳۰ (سوره‌های کوتاه)'
  );

  // Surah Progress State & Collapsible Toggle
  const [surahProgressList, setSurahProgressList] = useState<SurahProgress[]>([]);
  const [isProgressExpanded, setIsProgressExpanded] = useState<boolean>(true);
  const [newSurahName, setNewSurahName] = useState<string>('سوره مبارکه کوثر');
  const [newSurahPercent, setNewSurahPercent] = useState<number>(100);

  useEffect(() => {
    if (isOpen) {
      setName(editingChild?.name || '');
      setAge(editingChild?.age || 5);
      setGoal(editingChild?.goal || '');
      setHasStartedMemorization(editingChild?.hasStartedMemorization ?? false);
      setMemorizationScope(editingChild?.memorizationScope || 'جزء ۳۰ (سوره‌های کوتاه)');
      // Filter out any game items from progress list
      const cleanProgress = (editingChild?.surahProgress || []).filter(
        (s) => !s.surah.includes('بازی') && !s.surah.toLowerCase().includes('game')
      );
      setSurahProgressList(cleanProgress);
      setIsProgressExpanded(Boolean(cleanProgress && cleanProgress.length > 0));
    }
  }, [isOpen, editingChild]);

  if (!isOpen) return null;

  const isJuzComplete = (name: string, progress: number) => {
    return /جزء\s*(\d+|[۰-۹]+|۳۰|۲۹)/.test(name) && progress >= 100;
  };

  const getDisplaySurahTitle = (name: string, progress: number) => {
    if (isJuzComplete(name, progress)) {
      const match = name.match(/جزء\s*(\d+|[۰-۹]+)/);
      const num = match ? toPersianDigits(match[1]) : '۳۰';
      return `جزء ${num} کامل شد ۱۰۰٪`;
    }
    return name;
  };

  const handleAddCompletedJuz30 = () => {
    setSurahProgressList((prev) => {
      const exists = prev.some((s) => s.surah.includes('جزء ۳۰') || s.surah.includes('جزء 30'));
      if (exists) {
        return prev.map((s) =>
          s.surah.includes('جزء ۳۰') || s.surah.includes('جزء 30')
            ? { ...s, progress: 100, status: 'memorized', lastReviewed: 'امروز' }
            : s
        );
      }
      return [
        { surah: 'جزء ۳۰', progress: 100, status: 'memorized', lastReviewed: 'امروز' },
        ...prev,
      ];
    });
    setMemorizationScope('جزء ۳۰ کامل');
    setIsProgressExpanded(true);
  };

  const handleAddSurahProgress = () => {
    if (!newSurahName.trim()) return;
    // Strictly prevent adding games to memorization progress
    if (newSurahName.includes('بازی')) return;

    const exists = surahProgressList.some((s) => s.surah === newSurahName);
    if (exists) {
      setSurahProgressList((prev) =>
        prev.map((s) =>
          s.surah === newSurahName
            ? { ...s, progress: newSurahPercent, status: newSurahPercent === 100 ? 'memorized' : 'learning' }
            : s
        )
      );
    } else {
      setSurahProgressList((prev) => [
        ...prev,
        {
          surah: newSurahName,
          progress: newSurahPercent,
          status: newSurahPercent === 100 ? 'memorized' : 'learning',
          lastReviewed: 'امروز',
        },
      ]);
    }
  };

  const handleUpdateProgressPercent = (surahName: string, percent: number) => {
    setSurahProgressList((prev) =>
      prev.map((s) =>
        s.surah === surahName
          ? { ...s, progress: percent, status: percent === 100 ? 'memorized' : 'learning' }
          : s
      )
    );
  };

  const handleRemoveSurah = (surahName: string) => {
    setSurahProgressList((prev) => prev.filter((s) => s.surah !== surahName));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Filter out games completely from child profile
    const cleanProgress = surahProgressList.filter(
      (s) => !s.surah.includes('بازی') && !s.surah.toLowerCase().includes('game')
    );

    const childData: Child = {
      id: editingChild?.id || `child_${Date.now()}`,
      name: name.trim(),
      age: Number(age) || 5,
      goal: goal.trim() || 'انس با قرآن و مفاهیم',
      hasStartedMemorization,
      memorizationScope: hasStartedMemorization ? memorizationScope.trim() : undefined,
      surahProgress: hasStartedMemorization && cleanProgress.length > 0 ? cleanProgress : undefined,
    };

    onSaveChild(childData);
    onClose();
  };

  const quickGoals = [
    'تدبر در آیات موضوعی و قصه‌ها',
    'انس با قرآن و مفاهیم',
    'حفظ ترتیبی جزء ۳۰',
    'تثبیت و تحویل منظم محفوظات',
  ];

  const quickScopes = [
    'سوره‌های کوتاه (فیل تا ناس)',
    'جزء ۳۰ کامل',
    'جزء ۲۹ و ۳۰',
    '۱ تا ۳ جزء اول',
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md bg-white rounded-[28px] p-6 shadow-2xl border border-[#EAE3D6] text-right overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#F2ECE2] mb-5">
            {!isFirstChildPrompt ? (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#FAF8F5] hover:bg-[#F2ECE2] text-[#8C827A] flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            ) : <div className="w-8" />}

            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[#2C2724]">
                {editingChild ? 'ویرایش مشخصات فرزند' : 'تعریف فرزند'}
              </span>
              <div className="w-7 h-7 rounded-full bg-[#FFF0E6] text-[#D97706] flex items-center justify-center">
                <UserPlus className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {isFirstChildPrompt && (
            <div className="mb-4 p-3 rounded-2xl bg-[#FFF9F3] border border-[#FCE7D6] text-xs text-[#8C4A14] leading-relaxed">
              👋 به جمع مادران قرآنی خوش آمدید! برای شروع و دریافت برنامه‌های اختصاصی، لطفاً نام و مشخصات فرزندتان را وارد کنید.
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Child Name */}
            <div>
              <label className="block text-[#4A433D] font-semibold mb-1.5">
                نام فرزند:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً: فاطمه سادات، علی، محمد..."
                className="w-full p-3 rounded-xl bg-[#FAF8F5] border border-[#E0D8CE] focus:outline-none focus:border-[#D97706] text-[13px] text-[#2C2724]"
              />
            </div>

            {/* Child Age */}
            <div>
              <label className="block text-[#4A433D] font-semibold mb-1.5">
                سن فرزند:
              </label>
              <div className="grid grid-cols-6 gap-1.5">
                {[3, 4, 5, 6, 7, 8].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setAge(num)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      age === num
                        ? 'bg-[#2C2724] text-white border-[#2C2724]'
                        : 'bg-[#FAF8F5] text-[#5C534D] border-[#E0D8CE] hover:bg-[#F2ECE2]'
                    }`}
                  >
                    {num} سال
                  </button>
                ))}
              </div>
            </div>

            {/* Goal (Free Text) */}
            <div>
              <label className="block text-[#4A433D] font-semibold mb-1.5">
                هدف (متن آزاد در چند کلمه):
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="مثلاً: تدبر در آیات موضوعی و قصه‌ها..."
                className="w-full p-3 rounded-xl bg-[#FAF8F5] border border-[#E0D8CE] focus:outline-none focus:border-[#D97706] text-[13px] text-[#2C2724]"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {quickGoals.map((qg, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setGoal(qg)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-[#F4EFE6] text-[#6E645C] hover:bg-[#E8E2D8] border border-[#E2DDD3] cursor-pointer"
                  >
                    {qg}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkbox: Has Started Memorization */}
            <div className="pt-2 border-t border-[#F2ECE2]">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasStartedMemorization}
                  onChange={(e) => setHasStartedMemorization(e.target.checked)}
                  className="w-4 h-4 rounded text-[#D97706] accent-[#D97706] cursor-pointer"
                />
                <span className="text-[#38322D] font-medium text-xs">
                  قبلاً حفظ قرآن را شروع کرده است
                </span>
              </label>

              {/* Conditional Field: Scope/Parts */}
              <AnimatePresence>
                {hasStartedMemorization && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pr-6 space-y-2 overflow-hidden"
                  >
                    <label className="block text-[#6E645C] font-medium text-[11px]">
                      چند جزء یا بازه سوره‌ها:
                    </label>
                    <input
                      type="text"
                      value={memorizationScope}
                      onChange={(e) => setMemorizationScope(e.target.value)}
                      placeholder="مثلاً: سوره‌های فیل تا ناس، یا ۲ جزء"
                      className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0D8CE] focus:outline-none focus:border-[#D97706] text-xs text-[#2C2724]"
                    />
                    <div className="flex flex-wrap gap-1">
                      {quickScopes.map((scope, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setMemorizationScope(scope)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-[#F4EFE6] text-[#6E645C] hover:bg-[#E8E2D8] border border-[#E2DDD3] cursor-pointer"
                        >
                          {scope}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Collapsible Surah Progress Bar Section (پروگرس بار جمع شونده با آیکون ادیت) */}
            {hasStartedMemorization && (
              <div className="mt-4 pt-3 border-t border-[#F2ECE2] rounded-2xl bg-[#FCFAF6] border border-[#EAE3D6] p-3.5 space-y-3">
                {/* Collapsible Header with Edit Icon */}
                <div
                  onClick={() => setIsProgressExpanded((prev) => !prev)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#FAF0E6] text-[#D97706] flex items-center justify-center">
                      <Edit3 className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-[#2C2724] text-xs">
                      مسیر و پروگرس‌بار حفظ سوره‌ها
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF5EE] text-[#8C827A] border border-[#E5DFD5]">
                      {toPersianDigits(surahProgressList.length)} سوره
                    </span>
                  </div>
                  <button
                    type="button"
                    className="p-1 text-[#8C827A] hover:text-[#2C2724] transition-colors"
                  >
                    {isProgressExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {isProgressExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 pt-2"
                    >
                      {/* Quick action to mark Juz 30 as completed */}
                      <div className="flex items-center justify-between gap-2 pb-1">
                        <button
                          type="button"
                          onClick={handleAddCompletedJuz30}
                          className="w-full py-1.5 px-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] hover:bg-[#D1FAE5] text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Check className="w-3.5 h-3.5 text-[#10B981]" />
                          <span>ثبت تکمیل کل جزء ۳۰ (۱۰۰٪)</span>
                        </button>
                      </div>

                      {/* Current Surah List with Progress Bars */}
                      {surahProgressList.length > 0 ? (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {surahProgressList.map((sp) => {
                            const isCompletedJuz = isJuzComplete(sp.surah, sp.progress);
                            return (
                              <div
                                key={sp.surah}
                                className={`p-2.5 rounded-xl border shadow-2xs space-y-1.5 ${
                                  isCompletedJuz
                                    ? 'bg-[#F0FDF4] border-[#BBF7D0]'
                                    : 'bg-white border-[#EAE3D6]'
                                }`}
                              >
                                <div className="flex items-center justify-between text-xs">
                                  <span className={`font-bold ${isCompletedJuz ? 'text-[#065F46]' : 'text-[#2C2724]'}`}>
                                    {getDisplaySurahTitle(sp.surah, sp.progress)}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                                        isCompletedJuz
                                          ? 'bg-[#DCFCE7] text-[#15803D]'
                                          : sp.progress === 100
                                          ? 'bg-[#E6F4EA] text-[#137333]'
                                          : 'bg-[#FEF3C7] text-[#92400E]'
                                      }`}
                                    >
                                      {isCompletedJuz
                                        ? '✓ جزء کامل شد'
                                        : `${toPersianDigits(sp.progress)}٪ ${sp.progress === 100 ? 'حفظ کامل' : 'در حال یادگیری'}`}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSurah(sp.surah)}
                                      className="text-[#DC2626] hover:text-red-700 p-1 rounded-md transition-colors cursor-pointer"
                                      title="حذف سوره"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Visual Progress Bar */}
                                <div className="w-full bg-[#EAE3D6] rounded-full h-2 overflow-hidden">
                                  <div
                                    className={`h-full transition-all duration-300 ${
                                      isCompletedJuz
                                        ? 'bg-[#10B981]'
                                        : sp.progress === 100
                                        ? 'bg-[#22C55E]'
                                        : 'bg-[#D97706]'
                                    }`}
                                    style={{ width: `${sp.progress}%` }}
                                  />
                                </div>

                                {/* Quick percentage adjustment buttons */}
                                <div className="flex items-center justify-end gap-1 pt-1">
                                  {[25, 50, 75, 100].map((pct) => (
                                    <button
                                      key={pct}
                                      type="button"
                                      onClick={() => handleUpdateProgressPercent(sp.surah, pct)}
                                      className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                                        sp.progress === pct
                                          ? 'bg-[#2C2724] text-white border-[#2C2724]'
                                          : 'bg-[#FAF8F5] text-[#7A7067] border-[#E0D8CE] hover:bg-[#F2ECE2]'
                                      }`}
                                    >
                                      {toPersianDigits(pct)}٪
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#8C827A] text-center py-2">
                          هنوز سوره‌ای به مسیر حفظ اضافه نشده است.
                        </p>
                      )}

                      {/* Add Surah via quranService Dropdown */}
                      <div className="pt-2 border-t border-[#EAE3D6] space-y-2">
                        <span className="text-[11px] font-semibold text-[#5A5149] block">
                          افزودن سوره یا جزء از جزء ۳۰ یا ۲۹:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <select
                            value={newSurahName}
                            onChange={(e) => setNewSurahName(e.target.value)}
                            className="flex-1 p-2 rounded-xl bg-white border border-[#E0D8CE] text-xs text-[#2C2724] focus:outline-none focus:border-[#D97706]"
                          >
                            <optgroup label="تکمیل کامل جزء">
                              <option value="جزء ۳۰">جزء ۳۰ (کل جزء ۳۰)</option>
                              <option value="جزء ۲۹">جزء ۲۹ (کل جزء ۲۹)</option>
                            </optgroup>
                            <optgroup label="جزء ۳۰ (سوره‌های متداول)">
                              {JUZ_30_SURAHS.map((s) => (
                                <option key={s.number} value={`سوره مبارکه ${s.persianName}`}>
                                  {s.number}. سوره {s.persianName} ({s.numberOfAyahs} آیه)
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="جزء ۲۹">
                              {JUZ_29_SURAHS.map((s) => (
                                <option key={s.number} value={`سوره مبارکه ${s.persianName}`}>
                                  {s.number}. سوره {s.persianName} ({s.numberOfAyahs} آیه)
                                </option>
                              ))}
                            </optgroup>
                          </select>

                          <select
                            value={newSurahPercent}
                            onChange={(e) => setNewSurahPercent(Number(e.target.value))}
                            className="w-20 p-2 rounded-xl bg-white border border-[#E0D8CE] text-xs text-[#2C2724] focus:outline-none focus:border-[#D97706]"
                          >
                            <option value={100}>۱۰۰٪ (حفظ)</option>
                            <option value={75}>۷۵٪</option>
                            <option value={50}>۵۰٪</option>
                            <option value={25}>۲۵٪</option>
                          </select>

                          <button
                            type="button"
                            onClick={handleAddSurahProgress}
                            className="py-2 px-3 rounded-xl bg-[#D97706] text-white hover:bg-[#B45309] transition-all flex items-center gap-1 cursor-pointer font-medium shadow-2xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>افزودن</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 flex items-center justify-end gap-2 border-t border-[#F2ECE2]">
              {!isFirstChildPrompt && (
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDD3] text-[#6E645C] hover:bg-[#F2ECE2] transition-all cursor-pointer"
                >
                  انصراف
                </button>
              )}
              <button
                type="submit"
                disabled={!name.trim()}
                className="py-2.5 px-5 rounded-xl bg-[#2C2724] text-white font-medium hover:bg-[#3D3835] active:scale-95 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {editingChild ? 'ذخیره تغییرات' : 'ثبت فرزند'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
