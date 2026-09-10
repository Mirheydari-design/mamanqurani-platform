import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Tag, ExternalLink, Sparkles, BookOpen, Headphones, Puzzle, ChevronLeft } from 'lucide-react';
import { ProductSuggestion } from '../types';
import { toPersianDigits } from '../utils/persian';

interface ProductSuggestionCardProps {
  product: ProductSuggestion;
  onDismiss: () => void;
  onOpenModal: (product: ProductSuggestion) => void;
}

export const ProductSuggestionCard: React.FC<ProductSuggestionCardProps> = ({
  product,
  onDismiss,
  onOpenModal,
}) => {
  const [thumbImage, setThumbImage] = useState<string | null>(product.imageUrl || null);

  useEffect(() => {
    if (product.imageUrl) {
      setThumbImage(product.imageUrl);
    } else if (product.buyUrl && product.buyUrl !== '#') {
      fetch(`/api/link-preview?url=${encodeURIComponent(product.buyUrl)}`)
        .then(res => res.json())
        .then(data => {
          if (data?.imageUrl) setThumbImage(data.imageUrl);
        })
        .catch(() => {});
    }
  }, [product]);

  if (product.dismissed) return null;

  const getIcon = () => {
    if (product.productType.includes('پادکست') || product.productType.includes('صوتی')) {
      return <Headphones className="w-5 h-5 text-[#7C3AED]" />;
    }
    if (product.productType.includes('بازی') || product.productType.includes('پازل')) {
      return <Puzzle className="w-5 h-5 text-[#7C3AED]" />;
    }
    return <BookOpen className="w-5 h-5 text-[#7C3AED]" />;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden', transition: { duration: 0.25 } }}
        className="relative mx-5 my-3.5"
      >
        {/* Main Product Card Container with Uniform Fixed Height */}
        <div className="relative rounded-[28px] bg-gradient-to-br from-[#FAF7FF] via-[#F3EDFE] to-[#ECE2FD] border border-[#DDD0FA] p-5 pt-6 shadow-[0_4px_20px_-8px_rgba(139,92,246,0.18)] overflow-visible text-right h-[268px] flex flex-col justify-between">
          
          {/* Floating Badge (Top Right) */}
          <div className="absolute -top-3.5 right-6 flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white text-xs font-semibold shadow-[0_4px_12px_rgba(109,40,217,0.25)] border border-white/40">
            <span>{product.miniTitle || 'پیشنهاد شگفت‌انگیز محصول'}</span>
          </div>

          {/* Close / Dismiss Button (Top Left) */}
          <button
            onClick={onDismiss}
            aria-label="بستن پیشنهاد محصول"
            className="absolute top-4 left-4 w-7 h-7 rounded-full bg-white/70 hover:bg-white text-[#7E7369] hover:text-[#2C2724] flex items-center justify-center transition-all active:scale-90 shadow-sm border border-[#E9DDFC]"
            title="بستن پیشنهاد محصول"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>

          {/* Child Target Label & Motherly Teaser Text */}
          <div className="mt-2 mb-2 pr-1 pl-6 flex-1 flex flex-col justify-start">
            {product.targetChildName && (
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7C3AED] bg-white/80 px-2.5 py-0.5 rounded-full border border-[#DDD0FA] mb-2 shadow-xs self-start">
                <span>پیشنهاد برای: {product.targetChildName}</span>
              </div>
            )}
            <p className="text-[#38312B] text-[13.5px] leading-[1.8] font-normal line-clamp-3">
              {product.motherlyAdvice}
            </p>
          </div>

          {/* Inner Interactive Mini Card - Aligned: Tag & texts on Right, Image & Discount Button on Left */}
          <div
            onClick={() => onOpenModal(product)}
            className="w-full bg-white/95 hover:bg-white rounded-2xl p-2 px-3 flex items-center justify-between gap-3 border border-[#E8DCFB] shadow-[0_2px_10px_rgba(124,58,237,0.06)] cursor-pointer transition-all active:scale-[0.99] group text-right h-[72px]"
          >
            {/* 1. RIGHT SIDE: Capsule Tag Pill, Product Title, and Publisher/Metadata */}
            <div className="flex-1 min-w-0 pr-0.5">
              <div className="flex items-center justify-start mb-0.5">
                <span className="inline-flex items-center text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-[#F3E8FF] text-[#7C3AED] border border-[#E9D5FF]">
                  {product.productType}
                </span>
              </div>

              {/* Product Title */}
              <h4 className="text-[13.5px] font-bold text-[#2C2724] group-hover:text-[#7C3AED] transition-colors leading-snug truncate">
                {product.productName}
              </h4>

              {/* Publisher / Author */}
              {product.publisher && (
                <p className="text-[11px] text-[#786C62] truncate">
                  {product.publisher}
                </p>
              )}
            </div>

            {/* 2. LEFT SIDE: Metadata Image + Discount Button */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenModal(product);
                }}
                className="py-1.5 px-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer whitespace-nowrap"
                title="مشاهده کد تخفیف و جزئیات"
              >
                <Tag className="w-3 h-3" />
                <span>کد تخفیف</span>
                <ChevronLeft className="w-3 h-3 -mr-0.5" />
              </button>

              <div className="w-12 h-12 rounded-xl bg-[#F8F5FF] border border-[#DDD0FA] flex items-center justify-center shadow-xs overflow-hidden flex-shrink-0">
                {thumbImage ? (
                  <img
                    src={thumbImage}
                    alt={product.productName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={() => setThumbImage(null)}
                  />
                ) : (
                  getIcon()
                )}
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
