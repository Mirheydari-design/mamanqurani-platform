import React, { useState, useEffect } from 'react';
import { Check, Plus, Clock, Sparkles, Wand2, MoreVertical, Trash2 } from 'lucide-react';
import {
  getRelativeDayLabel,
  getTodayStr,
  normalizeTaskDate,
} from '../utils/dateHelpers';
import { DailyTask, Child, ItemCategoryType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { getCategoryMeta, CATEGORIES_LIST } from '../utils/categoryHelpers';
import { toPersianDigits } from '../utils/persian';
import { formatProgramCardTitle, isProgramCard } from '../utils/quranUtils';
import { WeeklyDatePicker } from './WeeklyDatePicker';
import { TaskDetailModal } from './TaskDetailModal';

interface ChildTasksCardProps {
  child: Child;
  tasks: DailyTask[];
  selectedDate: string;
  onRequestPlan: () => void;
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Omit<DailyTask, 'id' | 'completed'>) => void;
  onDeleteTask?: (taskId: string) => void;
}

export const ChildTasksCard: React.FC<ChildTasksCardProps> = ({
  child,
  tasks,
  selectedDate,
  onRequestPlan,
  onToggleTask,
  onAddTask,
  onDeleteTask,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState('۵ دقیقه');
  const [newCategory, setNewCategory] = useState<ItemCategoryType>('برنامه حفظ جدید');
  
  // State for task details popup modal and three-dot options menu
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<DailyTask | null>(null);
  const [openMenuTaskId, setOpenMenuTaskId] = useState<string | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuTaskId(null);
    };
    if (openMenuTaskId) {
      window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuTaskId]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const relativeDayLabel = getRelativeDayLabel(selectedDate);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const isProgram = isProgramCard(newCategory, newTitle);
    const finalTitle = isProgram
      ? formatProgramCardTitle({
          title: newTitle.trim(),
          tag: newCategory,
          category: newCategory,
          itemType: 'program',
        })
      : newTitle.trim();

    onAddTask({
      childId: child.id,
      title: finalTitle,
      subtitle: '',
      duration: newDuration,
      category: newCategory,
      date: selectedDate,
    });
    setNewTitle('');
    setIsAdding(false);
  };

  return (
    <div className="rounded-[26px] bg-white border border-[#EAE3D6] p-4.5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] mb-4 text-right">
      {/* Header of Child Section */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE2] mb-3">
        {/* Child Name */}
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-[#2C2724] tracking-tight">
            {child.name}
          </span>
        </div>

        {/* Progress pill & completed count in Persian Digits */}
        {totalCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#7A7067]">
              {toPersianDigits(completedCount)} از {toPersianDigits(totalCount)}
            </span>
            <div className="w-14 h-2 bg-[#EBE7DF] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#48BB78] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Task List or Empty State */}
      <div className="space-y-2.5">
        {tasks.length === 0 ? (
          <div className="py-5 px-3 rounded-2xl bg-[#FAF8F5] border border-dashed border-[#E5DFD4] text-center space-y-3">
            <p className="text-xs text-[#7A7067] leading-relaxed">
              برای {child.name} در <span className="font-semibold text-[#2C2724]">{relativeDayLabel}</span> هنوز برنامه‌ای ثبت نشده است.
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={onRequestPlan}
                className="py-2 px-3.5 rounded-xl bg-[#2C2724] hover:bg-[#3D3835] text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
              >
                <Wand2 className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>درخواست برنامه از مربی هوشمند</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="py-2 px-3 rounded-xl bg-white border border-[#DDD5CA] text-[#5C534B] hover:text-[#2C2724] text-xs font-medium flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن دستی</span>
              </button>
            </div>
          </div>
        ) : (
          tasks.map((task) => {
            const meta = getCategoryMeta(task.category);
            const isMenuOpen = openMenuTaskId === task.id;

            return (
              <motion.div
                key={task.id}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedTaskForModal(task)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between relative group ${
                  task.completed
                    ? 'bg-[#F9F8F6]/85 border-[#E8E4DC] opacity-75'
                    : 'bg-[#FCFBF9] hover:bg-white border-[#EBE6DC] shadow-[0_2px_8px_rgba(0,0,0,0.015)] hover:border-[#D5CBC0]'
                }`}
              >
                {/* 1. RIGHT SIDE: Category Icon & Content (Title on top, Category & Duration on bottom) */}
                <div className="flex items-center gap-2.5 sm:gap-3 text-right flex-1 min-w-0 pl-2.5 sm:pl-3">
                  {/* Category Icon */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0 ${meta.bgLight} ${meta.borderColor}`}
                    title={meta.label}
                  >
                    {meta.icon}
                  </div>

                  {/* Text Information: Title + Tags */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[13.5px] font-bold transition-all truncate block ${
                          task.completed ? 'line-through text-[#8C827A]' : 'text-[#2C2724]'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-nowrap overflow-hidden">
                      {/* Category Type Capsule (تگ رنگی نوع کارت بدون آیکن - فونت ملایم‌تر) */}
                      <span className={`inline-flex items-center whitespace-nowrap flex-shrink-0 text-[9px] font-medium px-1.5 py-0.5 rounded-md border ${meta.badgeBg} ${meta.borderColor}`}>
                        {meta.label}
                      </span>

                      {/* Duration Pill with Persian digits (تگ دقیقه با فونت ملایم‌تر) */}
                      <span className="inline-flex items-center gap-1 whitespace-nowrap flex-shrink-0 text-[9px] text-[#7A7067] bg-[#F4EFE6] px-1.5 py-0.5 rounded-md border border-[#E6E0D5]">
                        <Clock className="w-2.5 h-2.5 text-[#A89E96]" />
                        <span>{toPersianDigits(task.duration)}</span>
                      </span>

                      {/* Subtitle preview if present */}
                      {task.subtitle && !task.subtitle.includes(task.category) && (
                        <span className="text-[9.5px] text-[#8C827A] truncate max-w-[150px] hidden sm:inline-block">
                          {task.subtitle}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. LEFT SIDE: Checkbox & Three-dots Menu (Aligned to the far left with plenty of room) */}
                <div className="flex items-center gap-1 flex-shrink-0 -ml-1 pl-0 relative">
                  {/* Checkbox Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTask(task.id);
                    }}
                    className={`w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                      task.completed
                        ? 'bg-[#48BB78] border-[#48BB78] text-white shadow-xs'
                        : 'bg-white border-[#D0C8BF] text-transparent hover:border-[#8C827A]'
                    }`}
                    title={task.completed ? 'علامت‌گذاری به عنوان انجام‌نشده' : 'علامت‌گذاری به عنوان انجام‌شده'}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                  </button>

                  {/* Three-dots Menu Button (Simple 3 dots without hover box, aligned to far left edge) */}
                  <div className="relative flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuTaskId(isMenuOpen ? null : task.id);
                      }}
                      className="p-1 text-[#A89E96] hover:text-[#3C342C] transition-colors cursor-pointer flex items-center justify-center"
                      title="گزینه‌ها"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {isMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.12 }}
                          onClick={(e) => e.stopPropagation()}
                          className="absolute left-0 top-full mt-1 w-32 bg-white border border-[#EAE3D6] rounded-xl shadow-lg z-30 py-1 overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuTaskId(null);
                              onDeleteTask?.(task.id);
                            }}
                            className="w-full text-right px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            <span>حذف فعالیت</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Detail Modal for Selected Task */}
      <TaskDetailModal
        task={selectedTaskForModal}
        isOpen={!!selectedTaskForModal}
        onClose={() => setSelectedTaskForModal(null)}
        child={child}
        selectedDate={selectedDate}
        onToggleTask={(taskId) => {
          onToggleTask(taskId);
          // Keep the modal synced with new completion state
          if (selectedTaskForModal && selectedTaskForModal.id === taskId) {
            setSelectedTaskForModal((prev) => (prev ? { ...prev, completed: !prev.completed } : null));
          }
        }}
        onDeleteTask={(taskId) => {
          onDeleteTask?.(taskId);
          setSelectedTaskForModal(null);
        }}
      />

      {/* Completion message if all done */}
      {completedCount === totalCount && totalCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-2.5 rounded-2xl bg-[#EBF7EE] border border-[#D5EEDB] text-center flex items-center justify-center gap-1.5 text-xs text-[#2E7D32] font-medium"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#48BB78]" />
          <span>آفرین به {child.name} عزیز! تمام برنامه‌های این روز کامل شد ✨</span>
        </motion.div>
      )}

      {/* Add Task Button or Expandable Form */}
      {tasks.length > 0 && !isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="mt-3 w-full py-2.5 rounded-2xl border border-dashed border-[#D6CFC7] hover:border-[#B5AAA0] text-[#7A7067] hover:text-[#383431] text-xs font-medium flex items-center justify-center gap-1.5 transition-all bg-transparent hover:bg-white/50 active:scale-[0.99]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>افزودن برنامه یا بازی جدید برای {child.name}</span>
        </button>
      )}

      {isAdding && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleCreateTask}
          className="mt-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E7E2D9] space-y-2.5 text-xs"
        >
          <div className="flex items-center justify-between pb-1 border-b border-[#ECE6DC]">
            <span className="font-bold text-[#383431]">فعالیت جدید برای {child.name} ({relativeDayLabel})</span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-[#8C827A] hover:text-[#383431]"
            >
              انصراف
            </button>
          </div>

          <div>
            <label className="block text-[#6E645C] mb-1 font-medium">عنوان فعالیت:</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="مثلاً: مرور سوره ملک یا حفظ آیه ۱۱ ملک"
              className="w-full p-2.5 rounded-xl bg-white border border-[#E2DDD3] focus:outline-none focus:border-[#D97706] text-[#383431]"
            />
          </div>

          <div>
            <label className="block text-[#6E645C] mb-1 font-medium">دسته‌بندی:</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as ItemCategoryType)}
              className="w-full p-2 rounded-xl bg-white border border-[#E2DDD3] focus:outline-none text-[#383431]"
            >
              {CATEGORIES_LIST.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#6E645C] mb-1 font-medium">مدت زمان:</label>
            <select
              value={newDuration}
              onChange={(e) => setNewDuration(e.target.value)}
              className="w-full p-2 rounded-xl bg-white border border-[#E2DDD3] focus:outline-none text-[#383431]"
            >
              <option value="۵ دقیقه">۵ دقیقه</option>
              <option value="۸ دقیقه">۸ دقیقه</option>
              <option value="۱۰ دقیقه">۱۰ دقیقه</option>
              <option value="۱۵ دقیقه">۱۵ دقیقه</option>
            </select>
          </div>

          <div className="pt-1 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="py-2 px-3 rounded-xl bg-white border border-[#E2DDD3] text-[#736A62]"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded-xl bg-[#2C2724] text-white font-medium hover:bg-[#3D3835] active:scale-95 transition-all shadow-xs"
            >
              ثبت در برنامه
            </button>
          </div>
        </motion.form>
      )}
    </div>
  );
};

interface DailyTasksSectionProps {
  childrenList: Child[];
  tasks: DailyTask[];
  selectedDate?: string;
  onSelectDate?: (dateISO: string) => void;
  onRequestPlan?: (child?: Child) => void;
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Omit<DailyTask, 'id' | 'completed'>) => void;
  onDeleteTask?: (taskId: string) => void;
  onOpenAddChildModal: () => void;
}

export const DailyTasksSection: React.FC<DailyTasksSectionProps> = ({
  childrenList,
  tasks,
  selectedDate: propSelectedDate,
  onSelectDate: propOnSelectDate,
  onRequestPlan,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onOpenAddChildModal,
}) => {
  // Safe internal state fallback if not supplied by parent
  const [internalSelectedDate, setInternalSelectedDate] = useState<string>(getTodayStr);

  const activeDate = propSelectedDate ? normalizeTaskDate(propSelectedDate) : internalSelectedDate;
  const handleDateChange = (dateISO: string) => {
    if (propOnSelectDate) {
      propOnSelectDate(dateISO);
    } else {
      setInternalSelectedDate(dateISO);
    }
  };

  // Count total tasks for this date across all children
  const totalTasksForDate = tasks.filter((t) => {
    const taskDate = normalizeTaskDate(t.date);
    return taskDate === activeDate;
  }).length;

  return (
    <div id="daily-tasks-section" className="py-2 space-y-3">
      {/* 1. Horizontal Weekly Date Picker (Screen 1 & 4 Style) */}
      <WeeklyDatePicker
        selectedDate={activeDate}
        onSelectDate={handleDateChange}
        totalTasksCount={totalTasksForDate}
        allTasks={tasks}
      />

      {/* 2. List of Children Task Cards for Selected Date, or Add Child Invitation below calendar */}
      {childrenList.length === 0 ? (
        <div className="px-5 py-2">
          <div className="rounded-[26px] bg-white border border-[#EAE3D6] p-5.5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] text-center space-y-3.5">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FEE4D6] text-[#D97706] flex items-center justify-center text-xl shadow-xs">
              🌱
            </div>
            <div className="space-y-1">
              <h3 className="text-[14px] font-bold text-[#2C2724]">
                فرزند دلبندت رو ثبت کن
              </h3>
              <p className="text-[12px] text-[#7A7067] leading-relaxed max-w-sm mx-auto">
                هنوز فرزندی ثبت نشده است. برای چیدن برنامه‌های حفظ و مرور روزانه، بازی‌های خلاقانه و استفاده از مربی هوشمند، مشخصات فرزندت رو ثبت کن.
              </p>
            </div>
            <div className="pt-1 flex items-center justify-center">
              <button
                type="button"
                onClick={onOpenAddChildModal}
                className="py-2.5 px-5 rounded-xl bg-[#2C2724] hover:bg-[#3D3835] text-white text-xs font-semibold flex items-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#F59E0B]" />
                <span>ثبت فرزند دلبندم</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-5 space-y-3">
          {childrenList.map((child) => {
            const childTasks = tasks.filter((t) => {
              const taskDate = normalizeTaskDate(t.date);
              return t.childId === child.id && taskDate === activeDate;
            });

            return (
              <ChildTasksCard
                key={child.id}
                child={child}
                tasks={childTasks}
                selectedDate={activeDate}
                onRequestPlan={() => onRequestPlan?.(child)}
                onToggleTask={onToggleTask}
                onAddTask={onAddTask}
                onDeleteTask={onDeleteTask}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
