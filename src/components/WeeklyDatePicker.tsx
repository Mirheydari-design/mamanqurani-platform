import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import {
  getPersianDateParts,
  addDays,
  getTodayStr,
  normalizeTaskDate,
  PersianDateInfo,
} from '../utils/dateHelpers';
import { toPersianDigits } from '../utils/persian';
import { DailyTask } from '../types';
import { motion } from 'motion/react';

interface WeeklyDatePickerProps {
  selectedDate: string;
  onSelectDate: (dateISO: string) => void;
  totalTasksCount: number;
  allTasks?: DailyTask[];
}

export const WeeklyDatePicker: React.FC<WeeklyDatePickerProps> = ({
  selectedDate,
  onSelectDate,
  totalTasksCount,
  allTasks = [],
}) => {
  const normSelected = normalizeTaskDate(selectedDate);
  const selectedInfo = getPersianDateParts(normSelected);
  const todayISO = getTodayStr();
  const isSelectedToday = normSelected === todayISO;

  // Window starts 3 days before today initially, keeping today at center on initial load
  const [windowStartDate, setWindowStartDate] = useState<string>(() => {
    return addDays(normSelected, -3);
  });

  // Keep window in sync if selectedDate is moved completely outside the visible range
  useEffect(() => {
    const minDate = windowStartDate;
    const maxDate = addDays(windowStartDate, 6);
    if (normSelected < minDate) {
      setWindowStartDate(normSelected);
    } else if (normSelected > maxDate) {
      setWindowStartDate(addDays(normSelected, -6));
    }
  }, [normSelected, windowStartDate]);

  // Generate 7 consecutive days starting from windowStartDate
  const weekDays: PersianDateInfo[] = [];
  for (let i = 0; i < 7; i++) {
    const dStr = addDays(windowStartDate, i);
    weekDays.push(getPersianDateParts(dStr));
  }

  // Navigate to previous day (earlier / rightward in RTL)
  const handlePrevDay = () => {
    const currentIndex = weekDays.findIndex((d) => d.dateISO === normSelected);

    if (currentIndex > 0 && currentIndex <= 6) {
      // Step within visible window without shifting strip
      onSelectDate(weekDays[currentIndex - 1].dateISO);
    } else {
      // Already at the right corner (index 0) -> shift window back by 1 day and stay at right corner
      const prevDate = addDays(normSelected, -1);
      setWindowStartDate((prev) => addDays(prev, -1));
      onSelectDate(prevDate);
    }
  };

  // Navigate to next day (later / leftward in RTL)
  const handleNextDay = () => {
    const currentIndex = weekDays.findIndex((d) => d.dateISO === normSelected);

    if (currentIndex >= 0 && currentIndex < 6) {
      // Step within visible window without shifting strip
      onSelectDate(weekDays[currentIndex + 1].dateISO);
    } else {
      // Already at the left corner (index 6) -> shift window forward by 1 day and stay at left corner
      const nextDate = addDays(normSelected, 1);
      setWindowStartDate((prev) => addDays(prev, 1));
      onSelectDate(nextDate);
    }
  };

  // Jump back to today
  const handleJumpToToday = () => {
    const minDate = windowStartDate;
    const maxDate = addDays(windowStartDate, 6);
    if (todayISO < minDate || todayISO > maxDate) {
      setWindowStartDate(addDays(todayISO, -3));
    }
    onSelectDate(todayISO);
  };

  // Subtitle text indicating task count
  let taskSubtitle = '';
  if (totalTasksCount === 0) {
    taskSubtitle = isSelectedToday ? 'امروز بدون برنامه ثبت‌شده' : 'بدون برنامه برای این روز';
  } else {
    taskSubtitle = isSelectedToday
      ? `${toPersianDigits(totalTasksCount)} فعالیت برای امروز`
      : `${toPersianDigits(totalTasksCount)} فعالیت در این روز`;
  }

  return (
    <div id="weekly-date-picker" className="px-5 pt-3 pb-2 text-right">
      {/* Top Header Row: Date Title, Subtitle, and Quick Actions */}
      <div className="flex items-center justify-between mb-3.5">
        {/* Date info & Task count */}
        <div>
          <h2 className="text-lg font-extrabold text-[#2C2724] tracking-tight flex items-center gap-1.5">
            <span>{selectedInfo.dayNumber}</span>
            <span>{selectedInfo.monthName}</span>
            <span className="text-xs font-medium text-[#8C827A] mr-1">
              ({selectedInfo.weekdayFull})
            </span>
          </h2>
          <p className="text-xs text-[#8C827A] mt-0.5 font-medium">
            {taskSubtitle}
          </p>
        </div>

        {/* Action buttons: Today shortcut & Day navigation arrows */}
        <div className="flex items-center gap-1.5">
          {!isSelectedToday && (
            <button
              onClick={handleJumpToToday}
              className="flex items-center gap-1 py-1 px-2.5 rounded-full bg-[#FAF5EE] border border-[#EAE3D6] text-[#7A7067] hover:text-[#2C2724] text-[11px] font-semibold transition-all hover:bg-[#F2ECE1] active:scale-95 shadow-xs cursor-pointer"
              title="بازگشت به امروز"
            >
              <RotateCcw className="w-3 h-3" />
              <span>امروز</span>
            </button>
          )}

          <div className="p-1.5 rounded-full bg-[#FAF5EE] border border-[#EAE3D6] text-[#92400E]">
            <CalendarIcon className="w-4 h-4 text-[#B45309]" />
          </div>

          <div className="flex items-center gap-1 mr-1">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-full bg-white border border-[#EAE3D6] text-[#7A7067] hover:bg-[#FAF8F5] transition-colors active:scale-90 cursor-pointer"
              title="روز قبل (گوشه راست)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-full bg-white border border-[#EAE3D6] text-[#7A7067] hover:bg-[#FAF8F5] transition-colors active:scale-90 cursor-pointer"
              title="روز بعد (گوشه چپ)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Week Strip (Pill Carousel) */}
      <div className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar py-1">
        {weekDays.map((day: PersianDateInfo) => {
          const isSelected = day.dateISO === normSelected;
          const isDayToday = day.isToday;

          // Find tasks for this date
          const dayTasks = allTasks.filter((t) => normalizeTaskDate(t.date) === day.dateISO);
          const hasTasks = dayTasks.length > 0;
          const allDone = hasTasks && dayTasks.every((t) => t.completed);

          // Dot indicator logic according to user specification:
          // 1. Past days: Green if all tasks completed, Orange if incomplete, No circle if no tasks
          // 2. Today: Green if all done, Orange if incomplete, subtle dot or none if no tasks
          // 3. Future days: Light gray if has tasks, No circle if no tasks
          let dotColorClass = '';
          const isPast = day.dateISO < todayISO;
          const isFuture = day.dateISO > todayISO;

          if (isPast) {
            if (!hasTasks) {
              dotColorClass = '';
            } else if (allDone) {
              dotColorClass = isSelected ? 'bg-[#4ADE80] ring-1 ring-white/30' : 'bg-[#22C55E]';
            } else {
              dotColorClass = isSelected ? 'bg-[#FB923C] ring-1 ring-white/30' : 'bg-[#F97316]';
            }
          } else if (isDayToday) {
            if (hasTasks) {
              if (allDone) {
                dotColorClass = isSelected ? 'bg-[#4ADE80] ring-1 ring-white/30' : 'bg-[#22C55E]';
              } else {
                dotColorClass = isSelected ? 'bg-[#FB923C] ring-1 ring-white/30' : 'bg-[#F97316]';
              }
            } else if (isSelected) {
              dotColorClass = 'bg-white/80';
            }
          } else if (isFuture) {
            if (hasTasks) {
              dotColorClass = isSelected ? 'bg-[#D1D5DB] ring-1 ring-white/30' : 'bg-[#D1D5DB]';
            } else {
              dotColorClass = '';
            }
          }

          return (
            <motion.button
              key={day.dateISO}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectDate(day.dateISO)}
              className={`flex-1 min-w-[42px] max-w-[56px] py-3 px-1 rounded-[22px] flex flex-col items-center justify-between transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-[#2C2724] text-white shadow-[0_4px_14px_rgba(44,39,36,0.18)] scale-102 border border-[#2C2724]'
                  : 'bg-white hover:bg-[#FAF8F5] text-[#5C534B] border border-[#EAE3D6] hover:border-[#DFCFC4]'
              }`}
            >
              {/* Day number */}
              <span
                className={`text-[15px] font-extrabold leading-none ${
                  isSelected ? 'text-white' : 'text-[#2C2724]'
                }`}
              >
                {day.dayNumber}
              </span>

              {/* Short weekday */}
              <span
                className={`text-[11px] font-medium mt-1 leading-none ${
                  isSelected ? 'text-[#D8D0C7]' : 'text-[#8C827A]'
                }`}
              >
                {day.weekdayShort}
              </span>

              {/* Indicator Dot: Green, Orange, Gray or Empty */}
              <div className="h-2 flex items-center justify-center mt-1.5">
                {dotColorClass ? (
                  <div className={`w-1.5 h-1.5 rounded-full shadow-2xs transition-colors duration-200 ${dotColorClass}`} />
                ) : null}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

