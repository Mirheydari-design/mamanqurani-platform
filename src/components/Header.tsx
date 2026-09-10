import React from 'react';
import { UserProfile } from '../types';
import { User, Sparkles, Settings } from 'lucide-react';
import { toPersianDigits } from '../utils/persian';

interface HeaderProps {
  profile: UserProfile;
  onOpenProfile: () => void;
  onOpenSettings: (section?: 'wallet' | 'account') => void;
  onResetSpecialSuggestion?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenProfile,
  onOpenSettings,
}) => {
  const activeChild = profile.children.find(c => c.id === profile.activeChildId) || profile.children[0];

  return (
    <header className="w-full pt-4 pb-2 px-5 flex items-center justify-between">
      {/* App Branding (Right side in RTL) */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-xl bg-[#FFF0E6] border border-[#FCD9C4] flex items-center justify-center text-[#D97706]">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <span className="text-sm font-bold text-[#2C2724] tracking-tight">
          مامان قرآنی
        </span>
      </div>

      {/* Children info pill, Settings & Profile buttons (Left side in RTL) */}
      <div className="flex items-center gap-2">
        {profile.children.length > 0 && (
          <button
            type="button"
            onClick={onOpenProfile}
            className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-[#F5F2EC] hover:bg-[#EFECE4] border border-[#E7E2D9] transition-all text-xs text-[#524B45] active:scale-95"
            title="مدیریت فرزندان"
          >
            <span className="w-2 h-2 rounded-full bg-[#48BB78]"></span>
            <span className="font-medium">
              {profile.children.length === 1
                ? activeChild?.name
                : `${toPersianDigits(profile.children.length)} فرزند`}
            </span>
          </button>
        )}

        {/* Profile Button */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="w-8 h-8 rounded-full bg-[#FFF0E6] border border-[#FCD9C4] flex items-center justify-center text-[#D97706] hover:opacity-90 transition-all active:scale-95 shadow-2xs cursor-pointer"
          title="پروفایل کاربری و تنظیمات"
        >
          <User className="w-4 h-4 stroke-[1.75]" />
        </button>
      </div>
    </header>
  );
};



