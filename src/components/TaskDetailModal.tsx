import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Clock,
  Trash2,
  Calendar,
  Target,
  Sparkles,
  Copy,
  Tag,
  ExternalLink,
  BookOpen,
  Headphones,
  Puzzle,
  PackageCheck,
} from 'lucide-react';
import { DailyTask, Child } from '../types';
import { motion } from 'motion/react';
import { getCategoryMeta } from '../utils/categoryHelpers';
import { toPersianDigits } from '../utils/persian';
import { getRelativeDayLabel } from '../utils/dateHelpers';
import { formatStepWithEmoji, NEW_MEMORIZATION_STATIC_STEPS, isNewMemorizationProgram } from '../utils/stepUtils';

interface TaskDetailModalProps {
  task: DailyTask | null;
  isOpen: boolean;
  onClose: () => void;
  child?: Child;
  selectedDate?: string;
  onToggleTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  child,
  selectedDate,
  onToggleTask,
  onDeleteTask,
}) => {
  const [copied, setCopied] = useState(false);
  const [resolvedImage, setResolvedImage] = useState<string | null>(null);

  useEffect(() => {
    setCopied(false);
    if (!task?.product) {
      setResolvedImage(null);
      return;
    }

    if (task.product.imageUrl) {
      setResolvedImage(task.product.imageUrl);
    } else if (task.product.buyUrl && task.product.buyUrl !== '#') {
      fetch(`/api/link-preview?url=${encodeURIComponent(task.product.buyUrl)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.imageUrl) setResolvedImage(data.imageUrl);
        })
        .catch(() => {});
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const meta = getCategoryMeta(task.category);
  const isGame = task.category.includes('بازی');
  const dateLabel = selectedDate ? getRelativeDayLabel(selectedDate) : 'امروز';
  const isProductTask = !!task.product;

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const getProductIcon = (type: string) => {
    if (type.includes('پادکست') || type.includes('صوتی')) {
      return <Headphones className="w-5 h-5 text-[#7C3AED]" />;
    }
    if (type.includes('بازی') || type.includes('پازل')) {
      return <Puzzle className="w-5 h-5 text-[#7C3AED]" />;
    }
    return <BookOpen className="w-5 h-5 text-[#7C3AED]" />;
  };

  // Extract materials & steps if attached or available
  const materials = task.gameCard?.materials || task.materials || [];
  const steps = task.product?.steps || task.gameCard?.steps || task.steps || [];
  const description =
    task.product?.motherlyAdvice ||
    task.gameCard?.description ||
    task.description ||
    task.subtitle ||
    '';

  // Tailored pedagogical tips based on category if no steps provided and not a product task
  const getDefaultTips = () => {
    if (task.category.includes('حفظ جدید')) {
      return {
        materials: ['قرآن کودک یا کارت آیه', 'برچسب تشویقی'],
        steps: [
          '🥪 گام ۱ (لقمه‌های کوچک): آیه را به ۲ یا ۳ بخش کوتاه تقسیم کنید و با لحن شاداب بخوانید.',
          '🐝 گام ۲ (زمزمه زنبوری): کودک با صدای آرام و ملایم، بخش‌ها را مثل وزوز زنبور زمزمه کند.',
          '📸 گام ۳ (عکس‌برداری با چشم): کودک به کلمات نگاه کند و چشمانش را ببندد و در خیال خود ببیند.',
          '🌟 گام ۴ (پاداش و تشویق): پس از اتصال آیات، یک ستاره طلایی به او اهدا کنید.',
          '🤲 گام ۵ (هدیه ثواب): ثواب این تلاوت زیبا را با نیت پاک به ساحت مقدس امام زمان (عج) هدیه کنید.',
        ],
      };
    }
    if (task.category.includes('مرور نزدیک')) {
      return {
        materials: ['کارت یا دفترچه ستاره‌های موفقیت'],
        steps: [
          '💧 گام ۱ (آبیاری روزانه): ۳ تا ۵ سوره اخیر را به صورت نوبتی (یک آیه مادر، یک آیه فرزند) بخوانید.',
          '😊 گام ۲ (تکرار با لبخند): اگر جایی مکث کرد، به جای تصحیح مستقیم، کلمه اول آیه بعدی را اشاره کنید.',
          '⭐ گام ۳ (ثبت ستاره موفقیت): در پایان، موفقیت او در مرور امروز را تبریک بگویید و ثبت کنید.',
          '🤲 گام ۴ (هدیه ثواب): ثواب مرور امروز را به اهل‌بیت علیهم‌السلام هدیه دهید.',
        ],
      };
    }
    if (task.category.includes('مرور دور')) {
      return {
        materials: ['گردونه یا کارت‌های سوره‌های قبلی'],
        steps: [
          '🏡 گام ۱ (آبیاری کل باغچه): یک یا دو سوره از محفوظات قدیمی‌تر را به صورت همخوانی شاد مرور کنید.',
          '🎈 گام ۲ (ایجاد هیجان و نشاط): مثلاً هنگام آماده کردن میان‌وعده یا در مسیر رفت‌وآمد با هم بخوانید.',
          '🤲 گام ۳ (هدیه ثواب): نثار ثواب این تلاوت نورانی به حضرت فاطمه زهرا (س).',
        ],
      };
    }
    if (task.category.includes('تحویل')) {
      return {
        materials: ['گوشی موبایل برای ضبط صدای تلاوت', 'تاج یا مدال قاری کوچک'],
        steps: [
          '👑 گام ۱ (جایگاه ویژه قاری): کودک با افتخار در جایگاه قاری قرار می‌گیرد.',
          '📖 گام ۲ (تلاوت مستقل): سوره مورد نظر را با تمرکز و آرامش تلاوت می‌کند.',
          '📱 گام ۳ (ضبط صدا و تشویق): صوت تلاوت او را ضبط کرده و برای تشویق با هم گوش دهید یا برای پدر ارسال کنید.',
          '🎁 گام ۴ (اهدای نشان و هدیه معنوی): اهدای نشان قاری کوچک و هدیه ثواب تلاوت به پیشگاه امام زمان (عج).',
        ],
      };
    }
    return {
      materials: ['وسایل ساده خانه (بالش، توپ نرم، کارت‌های رنگی)'],
      steps: [
        '🎲 گام ۱ (آغاز بازی): با لبخند و تعریف قوانین شاداب و ساده برای کودک شروع کنید.',
        '🎯 گام ۲ (اجرای مرحله‌ای): اجرای بازی پرانرژی به همراه تکرار آیات نورانی سوره.',
        '🌟 گام ۳ (پاداش و تشویق): تشویق صمیمانه و اهدای ستاره موفقیت در پایان بازی.',
        '🤲 گام ۴ (هدیه ثواب): هدیه ثواب تلاوت‌ها و بازی قرآنی به ائمه معصومین (ع).',
      ],
    };
  };

  const isNewMemTask = isNewMemorizationProgram(task.category, task.title, task.gameCard?.itemType);
  const defaultTips = getDefaultTips();
  const displayMaterials = isNewMemTask || isProductTask ? [] : (materials.length > 0 ? materials : defaultTips.materials);
  const displaySteps = steps.length > 0 ? steps : defaultTips.steps;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-white rounded-[28px] border border-[#E8E2D6] p-5 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar text-right space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE2]">
          <div className="flex items-center gap-2">
            {isProductTask ? (
              <div className="w-8 h-8 rounded-xl flex items-center justify-center border bg-[#F3E8FF] border-[#DDD0FA] text-[#7C3AED]">
                {getProductIcon(task.product!.productType)}
              </div>
            ) : (
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${meta.bgLight} ${meta.borderColor}`}>
                {meta.icon}
              </div>
            )}
            <div>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                  isProductTask
                    ? 'bg-[#F3E8FF] text-[#7C3AED] border border-[#E9D5FF]'
                    : meta.badgeBg
                }`}
              >
                {isProductTask ? `پیشنهاد محصول: ${task.product!.productType}` : meta.label}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#FAF8F5] text-[#8C827A] hover:text-[#2C2724] hover:bg-[#F2ECE1] flex items-center justify-center transition-all cursor-pointer"
            title="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title and Metadata */}
        <div>
          <div className="flex items-center gap-2 text-[11px] text-[#8C827A] mb-1.5 flex-wrap">
            {child && (
              <span className="font-semibold text-[#5C534B]">
                برای {child.name}
              </span>
            )}
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#A89E96]" />
              {dateLabel}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-medium text-[#7A7067]">
              <Clock className="w-3 h-3 text-[#A89E96]" />
              {toPersianDigits(task.duration)}
            </span>
          </div>

          {/* If Product Task: display product banner with thumbnail */}
          {isProductTask ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FAF7FF] to-[#F3EDFE] border border-[#DDD0FA] flex items-center justify-between gap-3 mt-2">
              <div className="flex-1 min-w-0">
                <span className="inline-block text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#EDE4FE] text-[#7C3AED] mb-1">
                  {task.product!.productType}
                </span>
                <h2 className="text-base font-bold text-[#2C2724] leading-snug">
                  {task.product!.productName}
                </h2>
                {task.product!.publisher && (
                  <p className="text-xs text-[#786C62] mt-0.5 truncate">
                    {task.product!.publisher}
                  </p>
                )}
              </div>

              <div className="w-14 h-14 rounded-xl bg-white border border-[#DDD0FA] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xs">
                {resolvedImage ? (
                  <img
                    src={resolvedImage}
                    alt={task.product!.productName}
                    className="w-full h-full object-cover"
                    onError={() => setResolvedImage(null)}
                  />
                ) : (
                  getProductIcon(task.product!.productType)
                )}
              </div>
            </div>
          ) : (
            <h2 className="text-lg font-bold text-[#2C2724] leading-snug">
              {isNewMemTask ? 'برنامه حفظ جدید' : (task.title || '').replace(/^روز\s*(چهارم|پنجم|ششم|[۰-۹]+|\d+)\s*[:\-–]\s*/i, '')}
            </h2>
          )}
        </div>

        {/* Daily Task Status banner & Completion Toggle */}
        <div
          className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
            task.completed
              ? 'bg-[#EBFBF0] border-[#C2EED0] text-[#1E723D]'
              : 'bg-[#FFFBF2] border-[#FDE6BA] text-[#92400E]'
          }`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold flex-1 min-w-0">
            {task.completed ? (
              <>
                <div className="w-5 h-5 rounded-full bg-[#48BB78] text-white flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="whitespace-nowrap flex-shrink-0 text-[11px] sm:text-xs">این فعالیت امروز انجام شده است ✨</span>
              </>
            ) : (
              <>
                <div className="w-5 h-5 rounded-full bg-[#F59E0B] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  ⏳
                </div>
                <span className="whitespace-nowrap flex-shrink-0">هنوز انجام نشده</span>
              </>
            )}
          </div>

          {onToggleTask && (
            <button
              type="button"
              onClick={() => onToggleTask(task.id)}
              className={`text-[11px] sm:text-xs py-1.5 px-2.5 sm:px-3 rounded-lg font-bold transition-all cursor-pointer shadow-2xs whitespace-nowrap flex-shrink-0 active:scale-95 ${
                task.completed
                  ? 'bg-white text-[#1E723D] border border-[#C2EED0] hover:bg-[#F2FBF4]'
                  : 'bg-[#D97706] text-white hover:bg-[#B45309]'
              }`}
            >
              {task.completed ? (
                <>
                  <span className="inline sm:hidden">لغو تکمیل</span>
                  <span className="hidden sm:inline">علامت‌گذاری به عنوان انجام‌نشده</span>
                </>
              ) : (
                'تکمیل شد ✓'
              )}
            </button>
          )}
        </div>

        {/* Quran Segment Banner */}
        {(task.quranSegment || task.gameCard?.quranSegment) && (
          <div className="p-3 rounded-2xl bg-[#FFFDF9] border border-[#F2E5D4] shadow-2xs">
            <div className="flex items-center justify-between gap-1 mb-1 text-[11px] font-semibold text-[#8C7A6B]">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#D97706]" />
                <span>قطعه قرآنی این درس:</span>
              </span>
              <span className="text-[10px] text-[#A89C91]">تکرار و ترتیل</span>
            </div>
            <div className="text-base text-[#2C2724] text-center py-2 px-3 leading-loose bg-white rounded-xl border border-[#F0E6D8] select-text font-arabic tracking-wide font-medium">
              {task.quranSegment || task.gameCard?.quranSegment}
            </div>
          </div>
        )}

        {/* Motherly Advice (پیشنهاد شگفت‌انگیز مادرانه - فقط برای فعالیت‌های غیر حفظ جدید) */}
        {description && !isNewMemTask && (
          <div
            className={`p-3.5 rounded-2xl border text-right ${
              isProductTask
                ? 'bg-gradient-to-br from-[#FFFDF9] to-[#FDF8EE] border-[#F3E5CB]'
                : 'bg-[#FAF8F5] border-[#EFE9DF]'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#9A5B13] mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
              <span>پیشنهاد صمیمی مادرانه:</span>
            </div>
            <p className="text-xs text-[#524B45] leading-relaxed">
              {description}
            </p>
          </div>
        )}

        {/* Routine Steps / Guide (نحوه استفاده در برنامه امروز) */}
        {isNewMemTask ? (
          <div className="space-y-2">
            {NEW_MEMORIZATION_STATIC_STEPS.map((st, sIdx) => (
                <div
                  key={sIdx}
                  className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] text-right space-y-1"
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
          displaySteps && displaySteps.length > 0 && (
            <div>
              <span className="text-xs font-bold text-[#696057] block mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#D97706]" />
                <span>
                  {isProductTask
                    ? 'نحوه استفاده در برنامه امروز:'
                    : isGame
                    ? 'مراحل بازی:'
                    : 'راهنمای اجرای برنامه:'}
                </span>
              </span>
              <div className="space-y-2">
                {displaySteps.map((step, sIdx) => {
                  const { emoji, text } = formatStepWithEmoji(step, sIdx);
                  return (
                    <div
                      key={sIdx}
                      className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EFEAE2] flex items-start gap-2.5 text-xs text-[#4A3F38]"
                    >
                      <span className="w-6 h-6 rounded-lg bg-[#FFF5E9] border border-[#FDE6BA] text-sm flex items-center justify-center flex-shrink-0 shadow-2xs">
                        {emoji}
                      </span>
                      <span className="leading-relaxed pt-0.5">{text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}

        {/* Materials (وسایل مورد نیاز - for games) */}
        {displayMaterials && displayMaterials.length > 0 && (
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EFE9DF]">
            <span className="text-xs font-bold text-[#696057] block mb-1.5 flex items-center gap-1.5">
              <span>📦</span>
              <span>وسایل یا نیازمندی‌ها:</span>
            </span>
            <ul className="text-xs text-[#524B45] space-y-1 pr-1">
              {displayMaterials.map((m, mIdx) => (
                <li key={mIdx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Product Discount Box & External Buy (If Product Task) */}
        {isProductTask && task.product?.discountCode && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FAF5FF] via-[#F5EDFE] to-[#EDE0FC] border border-[#D8B4FE] text-right space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#6B21A8]">
                <Tag className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>کد تخفیف اختصاصی پلتفرم مامان قرآنی</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-[#D8B4FE]">
              <span className="text-sm font-mono font-bold tracking-widest text-[#6D28D9] px-2 select-all">
                {task.product.discountCode}
              </span>

              <button
                type="button"
                onClick={() => handleCopyCode(task.product!.discountCode)}
                className={`py-1 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  copied
                    ? 'bg-[#EBF7EE] text-[#166534] border border-[#86EFAC]'
                    : 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-2xs'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 stroke-[2.5]" />
                    <span>کپی شد! ✓</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>کپی کد تخفیف</span>
                  </>
                )}
              </button>
            </div>

            {task.product.buyUrl && task.product.buyUrl !== '#' && (
              <a
                href={task.product.buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98"
              >
                <span>خرید با تخفیف ویژه</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Footer actions: Delete & Close */}
        <div className="pt-3 border-t border-[#F2ECE2] flex items-center justify-between gap-2">
          {onDeleteTask ? (
            <button
              type="button"
              onClick={() => {
                onDeleteTask(task.id);
                onClose();
              }}
              className="py-2 px-3 rounded-xl text-red-600 hover:bg-red-50 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف از برنامه</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-[#2C2724] hover:bg-[#3D3835] text-white text-xs font-medium transition-all cursor-pointer shadow-xs"
          >
            بستن پنجره
          </button>
        </div>
      </motion.div>
    </div>
  );
};
