import React, { useState, useEffect } from 'react';
import { X, Edit3, Check, Share2, Bookmark, Clock, Sparkles, Target, CalendarPlus, BookOpen } from 'lucide-react';
import { GameCard, ItemCategoryType } from '../types';
import { motion } from 'motion/react';
import { getCategoryMeta, CATEGORIES_LIST } from '../utils/categoryHelpers';
import { toPersianDigits } from '../utils/persian';
import { formatStepWithEmoji } from '../utils/stepUtils';
import { normalizeSurahName } from '../utils/quranUtils';

interface GameCardModalProps {
  game: GameCard | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveUpdate?: (updated: GameCard) => void;
  onAttachAndShare?: (game: GameCard) => void;
  isSaved?: boolean;
  onToggleSave?: (game: GameCard) => void;
  onAddTaskFromGame?: (game: GameCard) => void;
  childName?: string;
}

export const GameCardModal: React.FC<GameCardModalProps> = ({
  game,
  isOpen,
  onClose,
  onSaveUpdate,
  onAttachAndShare,
  isSaved = false,
  onToggleSave,
  onAddTaskFromGame,
  childName,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [surah, setSurah] = useState('');
  const [description, setDescription] = useState('');
  const [materialsStr, setMaterialsStr] = useState('');
  const [stepsStr, setStepsStr] = useState('');
  const [tag, setTag] = useState<string>('بازی حفظ جدید');
  const [duration, setDuration] = useState('');
  const [quranSegment, setQuranSegment] = useState('');

  useEffect(() => {
    if (game) {
      setTitle(game.title);
      setSurah(game.surah);
      setDescription(game.description);
      setMaterialsStr(game.materials.join('\n'));
      setStepsStr(game.steps.join('\n'));
      setTag(game.tag);
      setDuration(game.duration);
      setQuranSegment(game.quranSegment || '');
      setIsEditing(false);
    }
  }, [game]);

  if (!isOpen || !game) return null;

  const meta = getCategoryMeta(game.tag);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSaveUpdate) return;
    const isProgram = tag.startsWith('برنامه') || tag.includes('تحویل حفظ');
    const updated: GameCard = {
      ...game,
      title: title.trim(),
      surah: surah.trim(),
      description: description.trim(),
      quranSegment: quranSegment.trim() || undefined,
      materials: materialsStr.split('\n').map(s => s.trim()).filter(Boolean),
      steps: stepsStr.split('\n').map(s => s.trim()).filter(Boolean),
      tag: tag.trim() || 'بازی حفظ جدید',
      duration: duration.trim() || (isProgram ? '۵ دقیقه' : '۱۰ دقیقه'),
      itemType: isProgram ? 'program' : 'game',
      isCustom: true,
    };
    onSaveUpdate(updated);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white rounded-[28px] border border-[#E8E2D6] p-5 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar text-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE1] mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${meta.bgLight} border ${meta.borderColor}`}></div>
            <span className="text-xs font-bold text-[#2C2724]">
              {isEditing ? 'ویرایش کارت' : 'جزئیات کارت'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#FAF8F5] text-[#8C827A] hover:text-[#2C2724] flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isEditing ? (
          <div className="space-y-4 text-xs">
            {/* Tag & Surah */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className={`px-2.5 py-0.5 rounded-full font-medium ${meta.badgeBg}`}>
                  {meta.emoji} {meta.label}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFF3E0] text-[#D97706] font-semibold">
                  {normalizeSurahName(game.surah)}
                </span>
              </div>
              <span className="text-[11px] text-[#8C827A] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {toPersianDigits(game.duration)}
              </span>
            </div>

            {/* Title & Desc */}
            <div>
              <h3 className="text-base font-bold text-[#2C2724] mb-1.5">{game.title}</h3>
              <p className="text-[13px] text-[#544B45] leading-relaxed">{game.description}</p>
            </div>

            {/* Quran Segment Banner (قطعه قرآنی با خط زیبا) */}
            {game.quranSegment && (
              <div className="p-3 rounded-2xl bg-[#FFFDF9] border border-[#F2E5D4] shadow-2xs">
                <div className="flex items-center justify-between gap-1 mb-1 text-[11px] font-semibold text-[#8C7A6B]">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>قطعه قرآنی این درس:</span>
                  </span>
                  <span className="text-[10px] text-[#A89C91]">تکرار و ترتیل</span>
                </div>
                <div className="text-base md:text-lg text-[#2C2724] text-center py-2 px-3 leading-loose bg-white rounded-xl border border-[#F0E6D8] select-text font-arabic tracking-wide font-medium">
                  {game.quranSegment}
                </div>
              </div>
            )}

            {/* Materials (if present) */}
            {game.materials.length > 0 && (
              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#ECE6DC]">
                <span className="font-semibold text-[#736A62] block mb-1.5">
                  📦 وسایل ساده مورد نیاز:
                </span>
                <ul className="space-y-1 text-[#423C37]">
                  {game.materials.map((m, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Steps */}
            <div>
              <span className="font-semibold text-[#736A62] block mb-1.5 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-[#D97706]" />
                <span>مراحل اجرا:</span>
              </span>
              <div className="space-y-1.5">
                {game.steps.map((st, i) => {
                  const { emoji, text } = formatStepWithEmoji(st, i);
                  return (
                    <div key={i} className="flex items-start gap-2 text-[#3D3732] leading-relaxed bg-[#FAF8F5]/80 p-2 rounded-xl border border-[#F2ECE2]">
                      <span className="text-sm flex-shrink-0 mt-0.5" role="img">{emoji}</span>
                      <span>{text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[#F0EBE1] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {onAddTaskFromGame && (
                  <button
                    type="button"
                    onClick={() => {
                      onAddTaskFromGame(game);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-[#2C2724] hover:bg-[#1A1715] text-white font-medium shadow-xs text-xs active:scale-95 cursor-pointer"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>ثبت در برنامه امروز {childName || 'کودک'}</span>
                  </button>
                )}

                {onAttachAndShare && (
                  <button
                    type="button"
                    onClick={() => {
                      onAttachAndShare(game);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-[#FFF0E6] text-[#D97706] hover:bg-[#FEE4D6] border border-[#FCD9C4] font-medium shadow-xs text-xs"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>اشتراک در تجربیات</span>
                  </button>
                )}

                {onToggleSave && (
                  <button
                    type="button"
                    onClick={() => onToggleSave(game)}
                    className={`flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium border ${
                      isSaved
                        ? 'bg-[#EBF7EE] text-[#2E7D32] border-[#C8E6C9]'
                        : 'bg-[#FAF8F5] text-[#5E554E] border-[#E2DDD3]'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{isSaved ? 'ذخیره شده' : 'ذخیره'}</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F2EDE4] border border-[#E2DDD3] text-[#5E554E] text-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>ویرایش کارت</span>
              </button>
            </div>
          </div>
        ) : (
          /* Edit Form */
          <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
            <div>
              <label className="block text-[#736A62] mb-1">نام کارت:</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 rounded-xl bg-[#FAF8F5] border border-[#E0D9CE] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#736A62] mb-1">دسته‌بندی:</label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full p-2 rounded-xl bg-[#FAF8F5] border border-[#E0D9CE] focus:outline-none text-[#2C2724]"
              >
                {CATEGORIES_LIST.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[#736A62] mb-1">سوره یا مفهوم:</label>
                <input
                  type="text"
                  value={surah}
                  onChange={(e) => setSurah(e.target.value)}
                  className="w-full p-2 rounded-xl bg-[#FAF8F5] border border-[#E0D9CE] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#736A62] mb-1">مدت زمان:</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-2 rounded-xl bg-[#FAF8F5] border border-[#E0D9CE] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#736A62] mb-1">قطعه قرآنی با اعراب زیبا (اختیاری):</label>
              <textarea
                rows={2}
                value={quranSegment}
                onChange={(e) => setQuranSegment(e.target.value)}
                placeholder="مثال: بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾"
                className="w-full p-2 rounded-xl bg-[#FAF8F5] border border-[#E0D9CE] focus:outline-none resize-none font-arabic text-center text-sm"
              />
            </div>

            <div>
              <label className="block text-[#736A62] mb-1">توضیح کوتاه:</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 rounded-xl bg-[#FAF8F5] border border-[#E0D9CE] focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-[#736A62] mb-1">وسایل مورد نیاز (هر خط یک مورد):</label>
              <textarea
                rows={2}
                value={materialsStr}
                onChange={(e) => setMaterialsStr(e.target.value)}
                className="w-full p-2 rounded-xl bg-[#FAF8F5] border border-[#E0D9CE] focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-[#736A62] mb-1">مراحل اجرا (هر خط یک مرحله):</label>
              <textarea
                rows={3}
                value={stepsStr}
                onChange={(e) => setStepsStr(e.target.value)}
                className="w-full p-2 rounded-xl bg-[#FAF8F5] border border-[#E0D9CE] focus:outline-none resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="py-2 px-3 rounded-xl bg-[#FAF8F5] text-[#736A62]"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-[#2C2724] text-white font-medium shadow-xs"
              >
                ذخیره تغییرات
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

