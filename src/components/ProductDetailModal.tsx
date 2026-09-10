import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Copy, Check, ExternalLink, CalendarPlus, Tag, Sparkles, BookOpen, Headphones, Puzzle, CheckCircle2 } from 'lucide-react';
import { ProductSuggestion } from '../types';
import { toPersianDigits } from '../utils/persian';
import { formatStepWithEmoji } from '../utils/stepUtils';

interface ProductDetailModalProps {
  product: ProductSuggestion | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToDailyTasks?: (product: ProductSuggestion) => void;
  childName?: string;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToDailyTasks,
  childName,
}) => {
  const [copied, setCopied] = useState(false);
  const [resolvedImage, setResolvedImage] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState(false);
  const targetChildName = childName || product?.targetChildName || 'کودک';

  useEffect(() => {
    if (!product) return;
    setCopied(false);
    setIsAdded(false);

    if (product.imageUrl) {
      setResolvedImage(product.imageUrl);
    } else if (product.buyUrl && product.buyUrl !== '#') {
      // Fetch link preview image
      fetch(`/api/link-preview?url=${encodeURIComponent(product.buyUrl)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.imageUrl) {
            setResolvedImage(data.imageUrl);
          }
        })
        .catch(() => {});
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(product.discountCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleAdd = () => {
    if (onAddToDailyTasks) {
      onAddToDailyTasks(product);
      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
        onClose();
      }, 900);
    }
  };

  const getProductIcon = () => {
    if (product.productType.includes('پادکست') || product.productType.includes('صوتی')) {
      return <Headphones className="w-4 h-4 text-[#7C3AED]" />;
    }
    if (product.productType.includes('بازی') || product.productType.includes('پازل')) {
      return <Puzzle className="w-4 h-4 text-[#7C3AED]" />;
    }
    return <BookOpen className="w-4 h-4 text-[#7C3AED]" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="w-full max-w-md bg-white rounded-[28px] border border-[#E8E2D6] p-5 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar text-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE1] mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F5F0FF] border border-[#E9D5FF] flex items-center justify-center flex-shrink-0">
              {getProductIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#2C2724]">
                  {product.miniTitle || 'پیشنهاد محصول'}
                </span>
                {targetChildName && targetChildName !== 'کودک' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF5FF] text-[#7C3AED] border border-[#E9D5FF]">
                    برای {targetChildName}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[#7E7369] block mt-0.5">
                مناسب {toPersianDigits(product.ageRange)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#FAF8F5] text-[#8C827A] hover:text-[#2C2724] flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Visual / Image Preview (if available) */}
        {resolvedImage ? (
          <div className="mb-4 w-full h-44 rounded-2xl overflow-hidden bg-[#FAF5FF] border border-[#EADDFE] flex items-center justify-center shadow-xs">
            <img
              src={resolvedImage}
              alt={product.productName}
              className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-300"
              onError={() => setResolvedImage(null)}
            />
          </div>
        ) : (
          <div className="mb-4 w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-[#F7F2FE] to-[#F1E8FC] border border-[#E6D9FA] flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-[#DFCEF7] flex items-center justify-center text-2xl flex-shrink-0">
              {product.productType.includes('کتاب') ? '📚' : product.productType.includes('پادکست') ? '🎧' : '🧩'}
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-[#7C3AED] block mb-0.5">
                {product.productType}
              </span>
              <span className="text-xs text-[#52453C] leading-snug font-medium">
                {product.publisher}
              </span>
            </div>
          </div>
        )}

        {/* Title & Publisher */}
        <div className="mb-3.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F3E8FF] text-[#7C3AED] border border-[#E9D5FF]">
              {product.productType}
            </span>
            {product.publisher && (
              <span className="text-[11px] text-[#736A62]">
                {product.publisher}
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-[#2C2724] leading-snug">
            {product.productName}
          </h3>
        </div>

        {/* Motherly Advice (متن صمیمی و مادرانه) */}
        <div className="p-3.5 rounded-2xl bg-[#FFFBF7] border border-[#FBE3D4] mb-3.5">
          <div className="flex items-center gap-1.5 text-[#D97706] text-xs font-bold mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>پیشنهاد مادرانه</span>
          </div>
          <p className="text-xs text-[#4A3B32] leading-relaxed">
            {product.motherlyAdvice}
          </p>
        </div>

        {/* Steps for Today's Routine (نحوه استفاده در برنامه امروز) */}
        {product.steps.length > 0 && (
          <div className="mb-4">
            <span className="text-xs font-bold text-[#574C42] block mb-2">
              📋 نحوه استفاده در برنامه امروز:
            </span>
            <div className="space-y-2">
              {product.steps.map((step, idx) => {
                const { emoji, text } = formatStepWithEmoji(step, idx);
                return (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[#3D3732] leading-relaxed bg-[#FAF8F5]/85 p-2 rounded-xl border border-[#F2ECE2]">
                    <span className="text-sm flex-shrink-0 mt-0.5" role="img">
                      {emoji}
                    </span>
                    <span className="flex-1">{text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Discount Code Box (کد تخفیف اختصاصی پلتفرم مامان قرآنی) */}
        <div className="p-4 rounded-2xl bg-[#FAF5FF] border-2 border-dashed border-[#C4B5FD] mb-4 text-center space-y-2.5">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#7C3AED]">
            <Tag className="w-3.5 h-3.5" />
            <span>کد تخفیف اختصاصی پلتفرم مامان قرآنی</span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <div className="px-5 py-2 bg-white rounded-xl border border-[#DDD6FE] shadow-xs text-base font-black tracking-widest text-[#6D28D9] font-mono select-all">
              {product.discountCode}
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                copied
                  ? 'bg-[#10B981] text-white'
                  : 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white active:scale-95'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>کپی شد!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>کپی کد تخفیف</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons in Modal Footer */}
        <div className="pt-3 border-t border-[#F0EBE1] flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* External Buy Link Button */}
          {product.buyUrl && product.buyUrl !== '#' && (
            <a
              href={product.buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
            >
              <span>خرید با تخفیف ویژه</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {/* Add to Today's Routine Button */}
          {onAddToDailyTasks && (
            <button
              type="button"
              onClick={handleAdd}
              disabled={isAdded}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border shadow-xs cursor-pointer ${
                isAdded
                  ? 'bg-[#EBF7EE] text-[#166534] border-[#86EFAC]'
                  : 'bg-[#FAF8F5] hover:bg-[#F2ECE1] text-[#423C37] border-[#DFD7CC] active:scale-98'
              }`}
            >
              {isAdded ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#166534]" />
                  <span>در برنامه امروز ثبت شد ✓</span>
                </>
              ) : (
                <>
                  <CalendarPlus className="w-4 h-4 text-[#D97706]" />
                  <span>ثبت در برنامه امروز</span>
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
