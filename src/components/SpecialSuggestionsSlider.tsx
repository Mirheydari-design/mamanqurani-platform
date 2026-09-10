import React, { useState, useRef, useEffect } from 'react';
import { SpecialSuggestion, ProductSuggestion, GameCard } from '../types';
import { SpecialSuggestionCard } from './SpecialSuggestionCard';
import { ProductSuggestionCard } from './ProductSuggestionCard';
import { ChevronRight, ChevronLeft, Sparkles, RefreshCw } from 'lucide-react';

interface SpecialSuggestionsSliderProps {
  specialSuggestion: SpecialSuggestion | null;
  productSuggestion: ProductSuggestion | null;
  reviewSuggestions?: SpecialSuggestion[];
  onDismissSpecial: () => void;
  onDismissProduct: () => void;
  onDismissReview?: (id: string) => void;
  onOpenGameModal: (game: GameCard) => void;
  onOpenProductModal: (prod: ProductSuggestion) => void;
  onAddTaskFromGame?: (game: GameCard, targetChildId?: string) => void;
  onResetSpecial?: () => void;
  onResetProduct?: () => void;
  onResetReviews?: () => void;
}

export const SpecialSuggestionsSlider: React.FC<SpecialSuggestionsSliderProps> = ({
  specialSuggestion,
  productSuggestion,
  reviewSuggestions = [],
  onDismissSpecial,
  onDismissProduct,
  onDismissReview,
  onOpenGameModal,
  onOpenProductModal,
  onAddTaskFromGame,
  onResetSpecial,
  onResetProduct,
  onResetReviews,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine active visible slides
  const slides: {
    id: string;
    type: 'activity' | 'product' | 'review';
    label: string;
    childName?: string;
    reviewData?: SpecialSuggestion;
  }[] = [];

  // 1. Review Suggestions (Near and Far Review from past memorization)
  if (reviewSuggestions && reviewSuggestions.length > 0) {
    reviewSuggestions.forEach((rev) => {
      if (!rev.dismissed) {
        const isNear = rev.gameCard.tag === 'برنامه مرور نزدیک';
        slides.push({
          id: rev.id,
          type: 'review',
          label: isNear ? 'مرور نزدیک' : 'مرور دور',
          childName: rev.targetChildName,
          reviewData: rev,
        });
      }
    });
  }

  // 2. Sheet Activity Suggestion (بازی یا برنامه روز)
  if (specialSuggestion && !specialSuggestion.dismissed) {
    slides.push({
      id: 'activity_slide',
      type: 'activity',
      label: specialSuggestion.gameCard.itemType === 'game' ? 'بازی روز' : 'برنامه روز',
      childName: specialSuggestion.targetChildName,
    });
  }

  // 3. Sheet Product Suggestion (کتاب، بازی فکری، ...)
  if (productSuggestion && !productSuggestion.dismissed) {
    slides.push({
      id: 'product_slide',
      type: 'product',
      label: productSuggestion.productType || 'پیشنهاد محصول',
      childName: productSuggestion.targetChildName,
    });
  }

  // Ensure activeIndex is in bounds
  useEffect(() => {
    if (activeIndex >= slides.length && slides.length > 0) {
      setActiveIndex(slides.length - 1);
    }
  }, [slides.length, activeIndex]);

  // Scroll to index
  const scrollToIndex = (index: number) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const child = container.children[index] as HTMLElement;
    if (child) {
      child.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    setActiveIndex(index);
  };

  const handleScroll = () => {
    if (!containerRef.current || slides.length <= 1) return;
    const container = containerRef.current;
    const scrollLeft = Math.abs(container.scrollLeft);
    const width = container.offsetWidth;
    if (width === 0) return;
    const newIdx = Math.round(scrollLeft / width);
    if (newIdx >= 0 && newIdx < slides.length && newIdx !== activeIndex) {
      setActiveIndex(newIdx);
    }
  };

  // If all suggestions are dismissed or empty:
  if (slides.length === 0) {
    if (!specialSuggestion && !productSuggestion && reviewSuggestions.length === 0) {
      return null;
    }
    if (!onResetSpecial && !onResetProduct && !onResetReviews) return null;
    const handleResetAll = () => {
      if (onResetReviews) onResetReviews();
      if (onResetSpecial) onResetSpecial();
      if (onResetProduct) onResetProduct();
    };

    return (
      <div className="mx-5 my-3 p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D6] flex items-center justify-between gap-2.5 text-xs text-[#7A7067] text-right">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 text-[#D97706] flex-shrink-0" />
          <span className="truncate text-[11.5px] sm:text-xs">پیشنهادهای شگفت‌انگیز امروز خوانده شده</span>
        </div>
        <button
          type="button"
          onClick={handleResetAll}
          className="whitespace-nowrap flex-shrink-0 py-1.5 px-3 rounded-xl bg-white border border-[#DDD5C7] text-[#4A423B] hover:bg-[#F5EFE6] font-medium transition-all cursor-pointer shadow-2xs text-[11.5px] sm:text-xs"
        >
          نمایش مجدد پیشنهادها
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden my-2">
      {/* Optional Left / Right Navigation Arrows (only if more than 1 slide) */}
      {slides.length > 1 && (
        <div className="hidden sm:flex absolute inset-y-12 inset-x-2 pointer-events-none z-20 items-center justify-between">
          <button
            type="button"
            onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            className={`pointer-events-auto w-8 h-8 rounded-full bg-white/90 shadow-md border border-[#E5DFD5] flex items-center justify-center text-[#5A5047] transition-all cursor-pointer ${
              activeIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white hover:scale-105 active:scale-95'
            }`}
            title="اسلاید قبلی"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => scrollToIndex(Math.min(slides.length - 1, activeIndex + 1))}
            disabled={activeIndex === slides.length - 1}
            className={`pointer-events-auto w-8 h-8 rounded-full bg-white/90 shadow-md border border-[#E5DFD5] flex items-center justify-center text-[#5A5047] transition-all cursor-pointer ${
              activeIndex === slides.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white hover:scale-105 active:scale-95'
            }`}
            title="اسلاید بعدی"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Horizontal Snap Scroll Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="w-full flex-shrink-0 snap-center px-0.5"
          >
            {slide.type === 'review' && slide.reviewData && (
              <SpecialSuggestionCard
                suggestion={slide.reviewData}
                onDismiss={() => onDismissReview && onDismissReview(slide.reviewData!.id)}
                onOpenGameModal={onOpenGameModal}
                onAddTaskFromGame={onAddTaskFromGame}
              />
            )}

            {slide.type === 'activity' && specialSuggestion && (
              <SpecialSuggestionCard
                suggestion={specialSuggestion}
                onDismiss={onDismissSpecial}
                onOpenGameModal={onOpenGameModal}
                onAddTaskFromGame={onAddTaskFromGame}
              />
            )}

            {slide.type === 'product' && productSuggestion && (
              <ProductSuggestionCard
                product={productSuggestion}
                onDismiss={onDismissProduct}
                onOpenModal={onOpenProductModal}
              />
            )}
          </div>
        ))}
      </div>

      {/* Navigation Dots Indicator Underneath */}
      {slides.length > 1 && (
        <div className="flex flex-col items-center justify-center gap-1.5 mt-1 pb-1">
          <div className="flex items-center justify-center gap-2">
            {slides.map((slide, idx) => {
              const isActive = activeIndex === idx;
              let activeDotClass = 'w-7 h-2.5 bg-gradient-to-r from-[#F59E0B] to-[#D97706] shadow-xs';
              if (slide.type === 'product') {
                activeDotClass = 'w-7 h-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] shadow-xs';
              } else if (slide.type === 'review') {
                const isNear = slide.reviewData?.gameCard.tag === 'برنامه مرور نزدیک';
                activeDotClass = isNear
                  ? 'w-7 h-2.5 bg-gradient-to-r from-[#10B981] to-[#059669] shadow-xs'
                  : 'w-7 h-2.5 bg-gradient-to-r from-[#0284C7] to-[#0369A1] shadow-xs';
              }

              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => scrollToIndex(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer flex items-center justify-center ${
                    isActive
                      ? activeDotClass
                      : 'w-2.5 h-2.5 bg-[#DDD5C7] hover:bg-[#BDB2A3]'
                  }`}
                  title={`${slide.label} ${slide.childName ? `(برای ${slide.childName})` : ''}`}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
