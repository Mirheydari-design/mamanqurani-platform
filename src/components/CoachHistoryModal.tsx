import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, History, Trash2, ChevronLeft, MoreVertical } from 'lucide-react';
import { CoachHistoryItem, GameCard } from '../types';
import { toPersianDigits } from '../utils/persian';

interface CoachHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: CoachHistoryItem[];
  onLoadHistory: (item: CoachHistoryItem) => void;
  onDeleteHistory: (id: string) => void;
  onClearAll: () => void;
}

export const CoachHistoryModal: React.FC<CoachHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onLoadHistory,
  onDeleteHistory,
  onClearAll
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) setOpenMenuId(null);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full sm:max-w-md bg-white sm:rounded-[28px] rounded-t-[28px] p-5 shadow-2xl border border-[#EAE3D6] text-right flex flex-col h-[85vh] sm:h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex flex-shrink-0 items-center justify-between pb-4 border-b border-[#F2ECE2] mb-3">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#FAF8F5] hover:bg-[#F2ECE2] text-[#8C827A] flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[#2C2724]">تاریخچه مربی</span>
              <div className="w-7 h-7 rounded-full bg-[#EBF4FF] text-[#3B82F6] flex items-center justify-center">
                <History className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-3 pb-20 no-scrollbar">
            {history.length === 0 ? (
              <div className="text-center py-10 text-xs text-[#8C827A]">
                تاریخچه‌ای برای نمایش وجود ندارد.
              </div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="relative p-3 rounded-2xl border border-[#F2ECE2] bg-[#FAF8F5] hover:bg-[#F4F1EC] transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] text-[#A89E96]">
                      {new Date(item.date).toLocaleDateString('fa-IR')}
                    </span>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === item.id ? null : item.id);
                        }}
                        className="p-1 rounded-full text-[#8C827A] hover:bg-[#EAE3D6] transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      <AnimatePresence>
                        {openMenuId === item.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 mt-1 w-32 bg-white border border-[#EAE3D6] rounded-xl shadow-lg z-10 overflow-hidden"
                          >
                            <button
                              onClick={() => {
                                onDeleteHistory(item.id);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-right px-3 py-2 text-xs text-red-600 hover:bg-[#FEF2F2] flex items-center justify-between"
                            >
                              <span>حذف</span>
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  <p className="text-xs text-[#4A433D] font-medium leading-relaxed mb-3 line-clamp-2">
                    {item.prompt}
                  </p>
                  
                  <div className="flex items-center justify-between border-t border-[#EAE3D6] pt-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-[#EAE3D6] text-[#696057]">
                      {toPersianDigits(item.cards.length)} خروجی
                    </span>
                    <button
                      onClick={() => {
                        onLoadHistory(item);
                        onClose();
                      }}
                      className="text-[11px] font-bold text-[#D97706] hover:text-[#B45309] flex items-center gap-1 transition-colors"
                    >
                      <span>نمایش</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {history.length > 0 && (
            <div className="pt-3 border-t border-[#F2ECE2] flex justify-center flex-shrink-0">
              <button
                onClick={onClearAll}
                className="text-xs text-red-500 hover:text-red-700 font-medium py-1.5 px-3 rounded-lg hover:bg-red-50 transition-colors"
              >
                پاک‌کردن کل تاریخچه
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
