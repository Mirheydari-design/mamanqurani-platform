import React from 'react';
import {
  BookOpen,
  RotateCcw,
  Calendar,
  Award,
  Puzzle,
  Dices,
  Trophy,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { ItemCategoryType } from '../types';

export interface CategoryMeta {
  type: 'program' | 'game';
  label: ItemCategoryType;
  emoji: string;
  icon: React.ReactNode;
  bgLight: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
}

export const CATEGORIES_LIST: ItemCategoryType[] = [
  'برنامه حفظ جدید',
  'برنامه مرور نزدیک',
  'برنامه مرور دور',
  'تحویل حفظ',
  'بازی حفظ جدید',
  'بازی مرور',
  'بازی تحویل',
];

export const getCategoryMeta = (category: string): CategoryMeta => {
  switch (category) {
    case 'برنامه حفظ جدید':
      return {
        type: 'program',
        label: 'برنامه حفظ جدید',
        emoji: '📖',
        icon: <BookOpen className="w-4 h-4 text-[#15803D]" />,
        bgLight: 'bg-[#F0FDF4]',
        borderColor: 'border-[#BBF7D0]',
        textColor: 'text-[#15803D]',
        badgeBg: 'bg-[#DCFCE7] text-[#166534]',
      };
    case 'برنامه مرور نزدیک':
      return {
        type: 'program',
        label: 'برنامه مرور نزدیک',
        emoji: '🔄',
        icon: <RotateCcw className="w-4 h-4 text-[#0369A1]" />,
        bgLight: 'bg-[#F0F9FF]',
        borderColor: 'border-[#BAE6FD]',
        textColor: 'text-[#0369A1]',
        badgeBg: 'bg-[#E0F2FE] text-[#075985]',
      };
    case 'برنامه مرور دور':
      return {
        type: 'program',
        label: 'برنامه مرور دور',
        emoji: '🗓️',
        icon: <Calendar className="w-4 h-4 text-[#6D28D9]" />,
        bgLight: 'bg-[#F5F3FF]',
        borderColor: 'border-[#DDD6FE]',
        textColor: 'text-[#6D28D9]',
        badgeBg: 'bg-[#EDE9FE] text-[#5B21B6]',
      };
    case 'تحویل حفظ':
      return {
        type: 'program',
        label: 'تحویل حفظ',
        emoji: '🎙️',
        icon: <Award className="w-4 h-4 text-[#C2410C]" />,
        bgLight: 'bg-[#FFF7ED]',
        borderColor: 'border-[#FED7AA]',
        textColor: 'text-[#C2410C]',
        badgeBg: 'bg-[#FFEDD5] text-[#9A3412]',
      };
    case 'بازی حفظ جدید':
      return {
        type: 'game',
        label: 'بازی حفظ جدید',
        emoji: '🧩',
        icon: <Puzzle className="w-4 h-4 text-[#0D9488]" />,
        bgLight: 'bg-[#F0FDFA]',
        borderColor: 'border-[#99F6E4]',
        textColor: 'text-[#0D9488]',
        badgeBg: 'bg-[#CCFBF1] text-[#0F766E]',
      };
    case 'بازی مرور':
      return {
        type: 'game',
        label: 'بازی مرور',
        emoji: '🎲',
        icon: <Dices className="w-4 h-4 text-[#D97706]" />,
        bgLight: 'bg-[#FFFBEB]',
        borderColor: 'border-[#FDE68A]',
        textColor: 'text-[#D97706]',
        badgeBg: 'bg-[#FEF3C7] text-[#92400E]',
      };
    case 'بازی تحویل':
      return {
        type: 'game',
        label: 'بازی تحویل',
        emoji: '🏆',
        icon: <Trophy className="w-4 h-4 text-[#E11D48]" />,
        bgLight: 'bg-[#FFF1F2]',
        borderColor: 'border-[#FECDD3]',
        textColor: 'text-[#E11D48]',
        badgeBg: 'bg-[#FFE4E6] text-[#9F1239]',
      };
    default:
      // Fallback
      return {
        type: 'game',
        label: (category as ItemCategoryType) || 'بازی حفظ جدید',
        emoji: '✨',
        icon: <Sparkles className="w-4 h-4 text-[#D97706]" />,
        bgLight: 'bg-[#FFF9F3]',
        borderColor: 'border-[#FADCC7]',
        textColor: 'text-[#D97706]',
        badgeBg: 'bg-[#FFF0E6] text-[#D97706]',
      };
  }
};
