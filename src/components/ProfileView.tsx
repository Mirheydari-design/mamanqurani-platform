import React, { useState } from 'react';
import {
  User,
  Heart,
  Bookmark,
  MessageSquare,
  Edit3,
  Share2,
  Sparkles,
  Plus,
  Trash2,
  LogOut,
  UserPlus,
  Search as SearchIcon,
  ChevronDown,
  ChevronUp,
  Wallet,
  Settings,
} from 'lucide-react';
import { UserProfile, GameCard, ExperiencePost, Child } from '../types';
import { getCategoryMeta } from '../utils/categoryHelpers';
import { getRelativeDayLabel } from '../utils/dateHelpers';
import { toPersianDigits } from '../utils/persian';
import { normalizeSurahName } from '../utils/quranUtils';

interface ProfileViewProps {
  profile: UserProfile;
  savedGames: GameCard[];
  myPosts: ExperiencePost[];
  totalHelpfulReceived: number;
  onOpenEditUsername: () => void;
  onOpenSettings: (section?: 'wallet' | 'account') => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenAddChildModal: () => void;
  onOpenEditChildModal: (child: Child) => void;
  onDeleteChild: (childId: string) => void;
  onOpenGameModal: (game: GameCard) => void;
  onEditGame: (game: GameCard) => void;
  onAttachAndShare: (game: GameCard) => void;
  onEditPost: (post: ExperiencePost) => void;
  onDeletePost: (postId: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  savedGames,
  myPosts,
  totalHelpfulReceived,
  onOpenEditUsername,
  onOpenSettings,
  onOpenAuth,
  onLogout,
  onOpenAddChildModal,
  onOpenEditChildModal,
  onDeleteChild,
  onOpenGameModal,
  onEditGame,
  onAttachAndShare,
  onEditPost,
  onDeletePost,
}) => {
  const [activeTab, setActiveTab] = useState<'children' | 'games' | 'posts'>('children');
  const [searchGamesQuery, setSearchGamesQuery] = useState('');
  const [expandedChildProgress, setExpandedChildProgress] = useState<Record<string, boolean>>({});

  const toggleChildProgress = (childId: string) => {
    setExpandedChildProgress((prev) => ({
      ...prev,
      [childId]: prev[childId] !== undefined ? !prev[childId] : false, // defaults to true initially
    }));
  };

  const displayName = profile.username?.trim() || 'کاربر مهمان';

  return (
    <div className="px-5 pt-3 pb-24 max-w-lg mx-auto text-right">
      {/* Top User Card */}
      <div className="rounded-[28px] bg-white border border-[#EBE5DA] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] mb-5">
        <div className="flex items-center justify-between mb-4">
          {/* Avatar & Username */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#FEE4D6] border-2 border-white shadow-xs flex items-center justify-center text-lg font-bold text-[#D97706]">
              {displayName ? displayName[0] : 'م'}
            </div>

            <div className="text-right">
              <span className="text-[11px] text-[#8C827A] block mb-0.5 font-medium">نام کاربری:</span>
              <h2 className="text-base font-bold text-[#2C2724]">{displayName}</h2>
            </div>
          </div>

          {/* Edit Username Button */}
          <button
            onClick={onOpenEditUsername}
            className="flex items-center gap-1.5 text-xs text-[#7A7067] hover:text-[#2C2724] py-1.5 px-3 rounded-full bg-[#FAF8F5] border border-[#E8E2D8] transition-all active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>ویرایش نام کاربری</span>
          </button>
        </div>

        {/* Stats Metrics */}
        <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-[#F2ECE1]">
          <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#ECE6DC]">
            <span className="text-xs text-[#8C827A] block mb-0.5">فرزندان</span>
            <span className="text-sm font-bold text-[#2C2724]">{profile.children.length}</span>
          </div>

          <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#ECE6DC]">
            <span className="text-xs text-[#8C827A] block mb-0.5">برنامه و بازی‌ها</span>
            <span className="text-sm font-bold text-[#2C2724]">{savedGames.length}</span>
          </div>

          <div className="p-2 rounded-xl bg-[#FFF2E8] border border-[#FCD9C4]">
            <div className="flex items-center justify-center gap-1 text-xs text-[#C2410C] font-semibold mb-0.5">
              <Heart className="w-3 h-3 fill-[#C2410C]" />
              <span>استفاده شده</span>
            </div>
            <span className="text-sm font-bold text-[#C2410C]">{totalHelpfulReceived} بار</span>
          </div>
        </div>

        {/* Wallet & Settings Quick Card */}
        <div className="mt-4 pt-3 border-t border-[#F2ECE1] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF8F2] border border-[#FCD9C4] flex items-center justify-center text-[#D97706]">
              <Wallet className="w-4 h-4" />
            </div>
            <div className="text-right">
              <span className="text-[10.5px] text-[#8C827A] block">اعتبار کیف پول:</span>
              <span className="text-xs font-bold text-[#2C2724]">
                {toPersianDigits(((profile.walletBalance ?? 100_000)).toLocaleString('fa-IR'))} تومان
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onOpenSettings('wallet')}
              className="flex items-center gap-1 text-xs text-[#2C2724] bg-[#FAF8F5] hover:bg-[#F2ECE2] border border-[#E2DDD3] py-1.5 px-3 rounded-full transition-all active:scale-95 shadow-2xs font-medium"
              title="تنظیمات و افزایش اعتبار"
            >
              <Settings className="w-3.5 h-3.5 text-[#D97706]" />
              <span>شارژ و تنظیمات</span>
            </button>

            {profile.isAuthenticated ? (
              <button
                onClick={onLogout}
                className="flex items-center gap-1 text-[11px] text-[#DC2626] bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] py-1.5 px-2.5 rounded-full transition-all active:scale-95"
                title="خروج از حساب"
              >
                <LogOut className="w-3 h-3" />
                <span>خروج</span>
              </button>
            ) : (
              <button
                onClick={() => onOpenAuth('register')}
                className="flex items-center gap-1 text-[11px] text-[#059669] bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] py-1.5 px-2.5 rounded-full transition-all active:scale-95 font-medium"
                title="ورود یا ثبت‌نام"
              >
                <UserPlus className="w-3 h-3" />
                <span>ورود / ثبت‌نام</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-2 mb-4 text-xs">
        <button
          onClick={() => setActiveTab('children')}
          className={`flex-1 py-2 px-3 rounded-2xl transition-all whitespace-nowrap text-center ${
            activeTab === 'children'
              ? 'bg-[#2C2724] text-white font-medium shadow-xs'
              : 'bg-[#F2EDE4] text-[#6B6157] hover:bg-[#EAE4D8]'
          }`}
        >
          فرزندان من ({profile.children.length})
        </button>

        <button
          onClick={() => setActiveTab('games')}
          className={`flex-1 py-2 px-3 rounded-2xl transition-all whitespace-nowrap text-center ${
            activeTab === 'games'
              ? 'bg-[#2C2724] text-white font-medium shadow-xs'
              : 'bg-[#F2EDE4] text-[#6B6157] hover:bg-[#EAE4D8]'
          }`}
        >
          برنامه‌ها و بازی‌ها ({savedGames.length})
        </button>

        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-2 px-3 rounded-2xl transition-all whitespace-nowrap text-center ${
            activeTab === 'posts'
              ? 'bg-[#2C2724] text-white font-medium shadow-xs'
              : 'bg-[#F2EDE4] text-[#6B6157] hover:bg-[#EAE4D8]'
          }`}
        >
          تجربه‌های من ({myPosts.length})
        </button>
      </div>

      {/* Tab 1: Children List & Management */}
      {activeTab === 'children' && (
        <div className="space-y-3">
          {profile.children.length === 0 ? (
            <div className="p-6 rounded-[26px] bg-white border border-[#EAE3D6] text-center shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-3.5">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FEE4D6] text-[#D97706] flex items-center justify-center text-xl shadow-xs">
                🌱
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#2C2724]">
                  بیا فرزندت رو ثبت کن
                </h3>
                <p className="text-xs text-[#7A7067] leading-relaxed max-w-sm mx-auto">
                  هنوز فرزندی ثبت نشده است. با ثبت مشخصات فرزند دلبندتان، برنامه‌های روزانه متناسب با سن و توانایی او، بازی‌های جذاب و پیشنهادات مربی هوشمند برای شما فعال می‌شود.
                </p>
              </div>
              <div className="pt-1 flex items-center justify-center">
                <button
                  type="button"
                  onClick={onOpenAddChildModal}
                  className="py-2.5 px-5 rounded-xl bg-[#2C2724] hover:bg-[#3D3835] text-white text-xs font-semibold flex items-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#F59E0B]" />
                  <span>ثبت مشخصات فرزند دلبندم</span>
                </button>
              </div>
            </div>
          ) : (
            profile.children.map((child) => (
              <div
                key={child.id}
                className="p-4 rounded-2xl bg-white border border-[#EAE3D6] shadow-xs space-y-3 text-right"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#2C2724]">{child.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenEditChildModal(child)}
                      className="p-1.5 rounded-lg bg-[#FAF8F5] border border-[#E2DDD3] text-[#635A53] hover:text-[#2C2724] transition-colors cursor-pointer"
                      title="ویرایش مشخصات"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {profile.children.length > 1 && (
                      <button
                        onClick={() => onDeleteChild(child.id)}
                        className="p-1.5 rounded-lg bg-[#FFF0F0] border border-[#FCDADA] text-[#DC2626] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                        title="حذف فرزند"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-[#524B45] pt-1">
                  {child.goal && (
                    <div className="flex items-start gap-1.5">
                      <span className="text-[#8C827A] flex-shrink-0">هدف:</span>
                      <span className="font-medium text-[#2C2724]">{child.goal}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-1.5">
                    <span className="text-[#8C827A] flex-shrink-0">سابقه حفظ:</span>
                    <span>
                      {child.hasStartedMemorization
                        ? child.memorizationScope || 'شروع حفظ'
                        : 'هنوز حفظ را شروع نکرده'}
                    </span>
                  </div>
                </div>

                {/* Collapsible Surah Progress Bar UI */}
                {(() => {
                  // Strictly filter out any games - games must NEVER be in memorization cards
                  let validProgress = (child.surahProgress || []).filter(
                    (sp) => !sp.surah.includes('بازی') && !sp.surah.toLowerCase().includes('game')
                  );

                  // If child scope mentions complete Juz 30 and no Juz 30 entry is present, add it
                  const mentionsCompletedJuz30 = Boolean(
                    child.memorizationScope &&
                      (child.memorizationScope.includes('جزء ۳۰ کامل') ||
                        child.memorizationScope.includes('جزء 30 کامل') ||
                        child.memorizationScope.includes('کل جزء ۳۰') ||
                        child.memorizationScope.includes('کل جزء 30'))
                  );
                  const hasJuz30Item = validProgress.some(
                    (sp) => (sp.surah.includes('جزء ۳۰') || sp.surah.includes('جزء 30')) && sp.progress >= 100
                  );
                  if (mentionsCompletedJuz30 && !hasJuz30Item) {
                    validProgress = [
                      { surah: 'جزء ۳۰', progress: 100, status: 'memorized', lastReviewed: 'هفته گذشته' },
                      ...validProgress.filter((sp) => !sp.surah.includes('فیل تا ناس')),
                    ];
                  }

                  if (validProgress.length === 0) return null;

                  const isJuz = (name: string) => /جزء\s*(\d+|[۰-۹]+|۳۰|۲۹)/.test(name);
                  const getJuzNum = (name: string) => {
                    const m = name.match(/جزء\s*(\d+|[۰-۹]+)/);
                    return m ? toPersianDigits(m[1]) : '۳۰';
                  };

                  return (
                    <div className="mt-3 pt-3 border-t border-[#EAE3D6] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-[#8C827A]">مسیر حفظ سوره‌ها:</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF5EE] text-[#8C827A] border border-[#E5DFD5]">
                            {toPersianDigits(validProgress.length)} سوره و بخش
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenEditChildModal(child)}
                            className="p-1 text-[#8C827A] hover:text-[#D97706] hover:bg-[#FAF0E6] rounded-md transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                            title="ویرایش درصدها و سوره‌ها"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#D97706]" />
                            <span className="text-[10px] text-[#D97706] font-medium">ویرایش</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleChildProgress(child.id)}
                            className="p-1 text-[#8C827A] hover:text-[#2C2724] rounded-md transition-colors cursor-pointer"
                            title="باز و بسته کردن"
                          >
                            {expandedChildProgress[child.id] === false ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronUp className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {expandedChildProgress[child.id] !== false && (
                        <div className="space-y-2 pt-1">
                          {validProgress.map((sp) => {
                            const isCompletedJuz = (isJuz(sp.surah) || sp.surah.includes('جزء')) && sp.progress >= 100;
                            if (isCompletedJuz) {
                              return (
                                <div
                                  key={sp.surah}
                                  className="bg-[#ECFDF5] p-3 rounded-xl border border-[#A7F3D0] space-y-2 shadow-2xs text-right"
                                >
                                  <div className="flex justify-between items-center text-[12px]">
                                    <div className="flex items-center gap-1.5 font-bold text-[#065F46]">
                                      <span className="w-4 h-4 rounded-full bg-[#10B981] text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                                      <span>{`جزء ${getJuzNum(sp.surah)} کامل شد ۱۰۰٪`}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-[#047857] bg-white px-2 py-0.5 rounded-md border border-[#A7F3D0]">
                                      حفظ کامل جزء
                                    </span>
                                  </div>
                                  <div className="w-full bg-[#D1FAE5] rounded-full h-2 overflow-hidden">
                                    <div className="h-full bg-[#10B981] rounded-full w-full transition-all duration-500" />
                                  </div>
                                  {sp.lastReviewed && (
                                    <div className="text-[10px] text-[#059669] font-medium text-left">
                                      آخرین مرور: {getRelativeDayLabel(sp.lastReviewed)}
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            return (
                              <div
                                key={sp.surah}
                                className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EAE3D6]"
                              >
                                <div className="flex justify-between text-[11px] mb-1.5">
                                  <span className="font-bold text-[#2C2724]">{normalizeSurahName(sp.surah)}</span>
                                  <span className="text-[#8C827A]">
                                    {toPersianDigits(sp.progress)}٪{' '}
                                    {sp.status === 'memorized' ? '✓' : ''}
                                  </span>
                                </div>
                                <div className="w-full bg-[#EAE3D6] rounded-full h-1.5 overflow-hidden relative">
                                  <div
                                    className={`h-full transition-all duration-500 ease-out ${
                                      sp.progress === 100 ? 'bg-[#22C55E]' : 'bg-[#D97706]'
                                    }`}
                                    style={{ width: `${sp.progress}%` }}
                                  />
                                </div>
                                {sp.lastReviewed && (
                                  <div className="text-[10px] text-[#A89E96] mt-1.5 text-left font-medium">
                                    آخرین مرور: {getRelativeDayLabel(sp.lastReviewed)}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ))
          )}

          {/* Add Child Button */}
          {profile.children.length > 0 && (
            <button
              onClick={onOpenAddChildModal}
              className="w-full py-3 rounded-2xl border border-dashed border-[#D6CFC7] hover:border-[#B5AAA0] text-[#7A7067] hover:text-[#2C2724] text-xs font-medium flex items-center justify-center gap-2 transition-all bg-transparent hover:bg-white/50 active:scale-[0.99]"
            >
              <UserPlus className="w-4 h-4" />
              <span>تعریف فرزند جدید</span>
            </button>
          )}
        </div>
      )}

      {/* Tab 2: Saved Game & Program Cards */}
      {activeTab === 'games' && (
        <div className="space-y-3">
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="جستجو در برنامه‌ها و بازی‌ها..."
              value={searchGamesQuery}
              onChange={(e) => setSearchGamesQuery(e.target.value)}
              className="w-full bg-white border border-[#EAE3D6] rounded-xl py-2.5 pr-10 pl-4 text-xs text-[#383431] focus:outline-none focus:border-[#D97706]"
            />
            <SearchIcon className="w-4 h-4 text-[#A89E96] absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>
          {savedGames.filter(g => g.title.includes(searchGamesQuery) || g.description.includes(searchGamesQuery)).length === 0 ? (
            <div className="p-6 rounded-2xl bg-white border border-[#EAE3D6] text-center text-xs text-[#8C827A]">
              هنوز برنامه یا بازی ذخیره نکرده‌اید. می‌توانید از بخش مربی هوشمند بسازید و ذخیره کنید.
            </div>
          ) : (
            savedGames.filter(g => g.title.includes(searchGamesQuery) || g.description.includes(searchGamesQuery)).map((game) => {
              const meta = getCategoryMeta(game.tag);
              return (
                <div
                  key={game.id}
                  className="p-4 rounded-2xl bg-white border border-[#EAE3D6] shadow-xs text-right space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#2C2724]">{game.title}</span>
                      <span className={`text-[10.5px] px-2 py-0.5 rounded-full font-medium ${meta.badgeBg}`}>
                        {meta.emoji} {meta.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8C827A]">{game.duration}</span>
                  </div>

                  <p className="text-xs text-[#595048] leading-relaxed line-clamp-2">
                    {game.description}
                  </p>

                  {/* Actions row */}
                  <div className="pt-2 border-t border-[#F2ECE2] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onAttachAndShare(game)}
                        className="py-1 px-3 rounded-lg bg-[#FFF0E6] border border-[#FCD9C4] text-[#D97706] hover:bg-[#FEE4D6] flex items-center gap-1 text-[11px] font-medium transition-all shadow-xs"
                        title="پیوست به کارت تجربه"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>اشتراک در تجربیات</span>
                      </button>

                      <button
                        onClick={() => onEditGame(game)}
                        className="py-1 px-2.5 rounded-lg bg-[#FAF8F5] border border-[#E2DDD3] text-[#635A53] hover:text-[#2C2724] flex items-center gap-1 text-[11px]"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>ویرایش</span>
                      </button>
                    </div>

                    <button
                      onClick={() => onOpenGameModal(game)}
                      className="text-[#8C827A] hover:text-[#2C2724] text-[11.5px]"
                    >
                      مشاهده جزئیات
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 3: My Posts */}
      {activeTab === 'posts' && (
        <div className="space-y-3">
          {myPosts.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white border border-[#EAE3D6] text-center text-xs text-[#8C827A]">
              هنوز تجربه‌ای منتشر نکرده‌اید. از بالای صفحه تجربیات می‌توانید اولین تجربه خود را بنویسید.
            </div>
          ) : (
            myPosts.map((post) => (
              <div
                key={post.id}
                className="p-4 rounded-2xl bg-white border border-[#EAE3D6] shadow-xs text-right space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#8C827A]">{post.createdAt}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDeletePost(post.id)}
                      className="text-[#DC2626] text-[11px]"
                    >
                      حذف
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => onEditPost(post)}
                      className="text-[#6E645C] hover:text-[#2C2724] text-[11px]"
                    >
                      ویرایش
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#3E3732] leading-relaxed">
                  {post.text}
                </p>

                <div className="pt-2 border-t border-[#F2ECE2] flex items-center justify-between text-[11px] text-[#8C827A]">
                  <span className="text-[#C2410C] font-medium">
                    {post.helpfulCount} مادر گفته‌اند استفاده کردم ❤️
                  </span>
                  <span>{post.comments.length} دیدگاه ثبت شده</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
