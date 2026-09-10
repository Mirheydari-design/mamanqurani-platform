import React, { useState } from 'react';
import { X, Flag, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface ReportModalProps {
  postId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReport: (postId: string, reason: string) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  postId,
  isOpen,
  onClose,
  onConfirmReport,
}) => {
  const [selectedReason, setSelectedReason] = useState('محتوای نامناسب یا غیرمرتبط با حفظ قرآن');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const reasons = [
    'محتوای نامناسب یا غیرمرتبط با حفظ قرآن',
    'اطلاعات نادرست درباره روایات یا مفاهیم قرآنی',
    'تبلیغات یا اسپم',
    'رفتار نامناسب یا توهین‌آمیز',
  ];

  if (!isOpen || !postId) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmReport(postId, selectedReason);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm bg-white rounded-[24px] border border-[#E8E2D6] p-5 shadow-xl text-right"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE1] mb-3">
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#FAF8F5] text-[#8C827A] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#DC2626]">
            <span>گزارش پست به ناظران</span>
            <Flag className="w-3.5 h-3.5" />
          </div>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <p className="text-[#696058] leading-relaxed">
              لطفاً دلیل گزارش این تجربه را مشخص کنید:
            </p>

            <div className="space-y-2">
              {reasons.map((r, idx) => (
                <label
                  key={idx}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedReason === r
                      ? 'bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]'
                      : 'bg-[#FAF8F5] border-[#E8E2D8] text-[#524B45]'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={r}
                    checked={selectedReason === r}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="accent-[#DC2626]"
                  />
                  <span className="text-right pr-2">{r}</span>
                </label>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-3 rounded-xl bg-[#FAF8F5] text-[#736A62]"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-[#DC2626] text-white font-medium shadow-xs"
              >
                ارسال گزارش
              </button>
            </div>
          </form>
        ) : (
          <div className="py-6 text-center text-xs space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#EBF7EE] text-[#2E7D32] flex items-center justify-center mx-auto">
              <Check className="w-5 h-5" />
            </div>
            <p className="font-semibold text-[#2E7D32]">گزارش شما با موفقیت ثبت شد</p>
            <span className="text-[11px] text-[#8C827A] block">
              از همراهی شما برای حفظ سلامت گفتگوی مادران سپاسگزاریم.
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
};
