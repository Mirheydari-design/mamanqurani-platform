import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Sparkles, Clock, CalendarPlus, Check } from 'lucide-react';
import { SpecialSuggestion, GameCard } from '../types';
import { getCategoryMeta } from '../utils/categoryHelpers';
import { toPersianDigits } from '../utils/persian';
import { normalizeSurahName } from '../utils/quranUtils';

interface SpecialSuggestionCardProps {
  suggestion: SpecialSuggestion;
  onDismiss: () => void;
  onOpenGameModal: (game: GameCard) => void;
  onAddTaskFromGame?: (game: GameCard, targetChildId?: string) => void;
}

export const SpecialSuggestionCard: React.FC<SpecialSuggestionCardProps> = ({
  suggestion,
  onDismiss,
  onOpenGameModal,
  onAddTaskFromGame,
}) => {
  if (suggestion.dismissed) return null;

  const isProgram =
    suggestion.categoryType === 'program' ||
    suggestion.gameCard.itemType === 'program' ||
    suggestion.gameCard.tag?.includes('برنامه');

  const meta = getCategoryMeta(suggestion.gameCard.tag || (isProgram ? 'برنامه مرور نزدیک' : 'بازی حفظ جدید'));

  // Distinct Theme Colors based on Card Type (Game vs Program)
  const containerClass = isProgram
    ? 'bg-gradient-to-br from-[#F2FAF6] via-[#E8F6F0] to-[#DCF0E7] border-[#BCE5D3]/90 shadow-[0_4px_20px_-8px_rgba(16,185,129,0.18)]'
    : 'bg-gradient-to-br from-[#FFF9F3] via-[#FFF3E8] to-[#FDE8D7] border-[#FADCC7]/90 shadow-[0_4px_20px_-8px_rgba(234,140,85,0.18)]';

  const badgeClass = isProgram
    ? 'bg-gradient-to-r from-[#10B981] to-[#059669] shadow-[0_4px_12px_rgba(16,185,129,0.28)]'
    : 'bg-gradient-to-r from-[#FF9858] to-[#F57C00] shadow-[0_4px_12px_rgba(245,124,0,0.28)]';

  const dismissBorder = isProgram ? 'border-[#C8EADB]' : 'border-[#F0E4DA]';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden', transition: { duration: 0.3 } }}
        className="relative mx-5 my-3.5"
      >
        {/* Main Card Container with Uniform Fixed Height */}
        <div className={`relative rounded-[28px] border p-5 pt-6 overflow-visible text-right h-[268px] flex flex-col justify-between ${containerClass}`}>
          
          {/* Floating Badge (Top Right) */}
          <div className={`absolute -top-3.5 right-6 flex items-center gap-1.5 px-3.5 py-1 rounded-full text-white text-xs font-semibold border border-white/40 ${badgeClass}`}>
            <span>{suggestion.badge || (isProgram ? 'برنامه شگفت‌انگیز امروز' : 'بازی شگفت‌انگیز امروز')}</span>
          </div>

          {/* Close / Dismiss Button (Top Left) */}
          <button
            onClick={onDismiss}
            aria-label="بستن پیشنهاد ویژه امروز"
            className={`absolute top-4 left-4 w-7 h-7 rounded-full bg-white/75 hover:bg-white text-[#8C7E75] hover:text-[#383431] flex items-center justify-center transition-all active:scale-90 shadow-sm border ${dismissBorder}`}
            title="بستن پیشنهاد ویژه"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>

          {/* Target Child Pill & Persian Text Message */}
          <div className="mt-2 mb-2 pr-1 pl-6 flex-1 flex flex-col justify-start">
            {suggestion.targetChildName && (
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5A4F46] bg-white/80 px-2.5 py-0.5 rounded-full border border-black/5 mb-2 shadow-xs self-start">
                <span>پیشنهاد امروز برای: {suggestion.targetChildName}</span>
              </div>
            )}
            <p className="text-[#3A332E] text-[13.5px] leading-[1.8] font-normal line-clamp-3">
              {suggestion.text}
            </p>
          </div>

          {/* Inner Interactive Mini Card (Program or Game) */}
          <div
            onClick={() => onOpenGameModal(suggestion.gameCard)}
            className="w-full bg-white/95 hover:bg-white rounded-2xl p-2.5 px-3 flex items-center justify-between border border-[#F2E5DC] shadow-[0_2px_8px_rgba(0,0,0,0.03)] cursor-pointer transition-all active:scale-[0.99] group h-[72px]"
          >
            {/* Action Button: '+' or '✓ ثبت شده' (Left in RTL layout) */}
            {suggestion.isAlreadyAdded ? (
              <div
                className="w-8 h-8 rounded-full bg-[#E8F8F0] border border-[#A7E5C4] text-[#059669] flex items-center justify-center flex-shrink-0 shadow-2xs"
                title="در برنامه امروز کودک ثبت شده است"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAddTaskFromGame) {
                    onAddTaskFromGame(suggestion.gameCard, suggestion.targetChildId);
                  } else {
                    onOpenGameModal(suggestion.gameCard);
                  }
                }}
                className="w-8 h-8 rounded-full bg-[#F5F2EC] hover:bg-[#EAE4DA] text-[#635A53] hover:text-[#D97706] flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
                title="افزودن به برنامه روز"
              >
                <Plus className="w-4 h-4 stroke-[2.2]" />
              </button>
            )}

            {/* Title and details in middle */}
            <div className="flex-1 text-right px-3 min-w-0">
              <div className="flex items-center gap-1.5 justify-start mb-0.5 flex-wrap">
                <span className={`text-[10.5px] px-2 py-0.5 rounded-full font-medium ${meta.badgeBg}`}>
                  {meta.label}
                </span>
                <span className="text-[11px] text-[#8C827A] truncate">
                  {normalizeSurahName(suggestion.gameCard.surah)}
                </span>
                {suggestion.isAlreadyAdded && (
                  <span className="text-[9.5px] text-[#059669] bg-[#E8F8F0] border border-[#BCE8D3] px-1.5 py-0.2 rounded-md font-medium inline-flex items-center gap-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    ثبت شده
                  </span>
                )}
              </div>
              <span className="text-[13.5px] font-bold text-[#2E2824] group-hover:text-[#D97706] transition-colors block truncate">
                {suggestion.gameCard.title}
              </span>
            </div>

            {/* Category Icon / Badge (Right in RTL layout) */}
            <div
              className={`w-10 h-10 rounded-2xl ${meta.bgLight} border ${meta.borderColor} flex items-center justify-center shadow-xs flex-shrink-0 text-lg`}
              title={meta.label}
            >
              {meta.icon}
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
