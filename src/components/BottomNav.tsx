import React from 'react';
import { Home, Sparkles, MessageCircle, User } from 'lucide-react';
import { motion } from 'motion/react';

export type NavTab = 'home' | 'coach' | 'feed' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  hasAttachedGame: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  hasAttachedGame,
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'خانه', icon: Home },
    { id: 'coach' as NavTab, label: 'مربی هوشمند', icon: Sparkles },
    {
      id: 'feed' as NavTab,
      label: 'تجربه‌ها',
      icon: MessageCircle,
      hasBadge: hasAttachedGame,
    },
    { id: 'profile' as NavTab, label: 'پروفایل', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-t border-[#EBE5DB] px-4 py-2">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                isActive ? 'text-[#D97706]' : 'text-[#8C827A] hover:text-[#4A433D]'
              }`}
            >
              <div className="relative p-1">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.6]'
                  }`}
                />

                {/* Badge if game is attached waiting to be published */}
                {tab.hasBadge && !isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#D97706] ring-2 ring-[#FAF8F5] animate-pulse" />
                )}
              </div>

              <span
                className={`text-[11px] mt-0.5 tracking-tight transition-all ${
                  isActive ? 'font-semibold text-[#D97706]' : 'font-normal text-[#8C827A]'
                }`}
              >
                {tab.label}
              </span>

              {/* Active Indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#D97706]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
