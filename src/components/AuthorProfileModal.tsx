import React, { useEffect, useState } from 'react';
import { X, Heart, MessageSquare, Award, Sparkles, Calendar, BookOpen, Puzzle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SocialAuthorProfile, ExperiencePost, GameCard } from '../types';
import { feedService } from '../services/feedService';
import { toPersianDigits } from '../utils/persian';

interface AuthorProfileModalProps {
  isOpen: boolean;
  authorId: string | null;
  authorNameFallback?: string;
  onClose: () => void;
  onOpenGameModal?: (game: GameCard) => void;
}

export const AuthorProfileModal: React.FC<AuthorProfileModalProps> = ({
  isOpen,
  authorId,
  authorNameFallback,
  onClose,
  onOpenGameModal,
}) => {
  const [profile, setProfile] = useState<SocialAuthorProfile | null>(null);
  const [authorPosts, setAuthorPosts] = useState<ExperiencePost[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !authorId) {
      setProfile(null);
      setAuthorPosts([]);
      return;
    }

    setLoading(true);
    feedService.getAuthorProfile(authorId)
      .then((data) => {
        if (data && data.profile) {
          setProfile(data.profile);
          setAuthorPosts(data.posts || []);
        } else {
          // Fallback minimal profile
          setProfile({
            id: authorId,
            username: authorNameFallback || 'مادر قرآن‌آموز',
            childName: 'فرزندم',
            childAge: 5,
            bio: 'مادر همراه در مسیر نورانی قرآن کریم',
            badge: 'همراه قرآنی',
            avatarColor: 'bg-[#FEE4D6] text-[#D97706]',
            helpfulCountReceived: 0,
            postsCount: 0,
            joinedAt: 'عضو جامعه مادران'
          });
          setAuthorPosts([]);
        }
      })
      .finally(() => setLoading(false));
  }, [isOpen, authorId, authorNameFallback]);

  if (!isOpen) return null;

  const displayName = profile?.username || authorNameFallback || 'مادر قرآن‌آموز';
  const avatarInitial = displayName[0] || 'م';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-[28px] border border-[#EAE4D8] shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col text-right overflow-hidden relative"
        >
          {/* Header Bar */}
          <div className="p-4 border-b border-[#F4EFE6] flex items-center justify-between bg-[#FDFBF9]">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white border border-[#EBE5DA] text-[#8C827A] hover:text-[#2C2724] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-[#4A433D]">پروفایل در جامعه قرآنی</span>
            <div className="w-8" />
          </div>

          {/* Scrollable Body */}
          <div className="p-5 overflow-y-auto space-y-5 no-scrollbar">
            {loading ? (
              <div className="py-12 text-center text-xs text-[#8C827A]">
                در حال بارگذاری اطلاعات پروفایل...
              </div>
            ) : profile ? (
              <>
                {/* Author Card Info */}
                <div className="flex items-center gap-3.5">
                  <div className={`w-14 h-14 rounded-2xl ${profile.avatarColor || 'bg-[#FEE4D6] text-[#D97706]'} border-2 border-white shadow-xs flex items-center justify-center text-xl font-bold flex-shrink-0`}>
                    {avatarInitial}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-[#2C2724] truncate">
                        {displayName}
                      </h3>
                    </div>

                    <div className="text-[11.5px] text-[#78716C] flex items-center gap-1.5 flex-wrap">
                      <span>
                        {profile.username.includes('پدر') || profile.username.includes('بابا')
                          ? `پدر ${profile.childName}`
                          : profile.childName.includes('مربی') || profile.childName.includes('استاد')
                          ? profile.childName
                          : `مادر ${profile.childName}`}
                      </span>
                      <span>•</span>
                      <span>{toPersianDigits(profile.childAge)} ساله</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#A89E96]" />
                        {toPersianDigits(profile.joinedAt || 'عضو باسابقه')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EFE9DE] text-xs text-[#524B45] leading-relaxed">
                    «{profile.bio}»
                  </div>
                )}

                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-2xl bg-[#FFF9F3] border border-[#FADCC7] text-center">
                    <div className="flex items-center justify-center gap-1 text-[#C2410C] mb-1">
                      <Heart className="w-3.5 h-3.5 fill-[#C2410C]" />
                      <span className="text-sm font-bold">{toPersianDigits(profile.helpfulCountReceived)}</span>
                    </div>
                    <span className="text-[10px] text-[#78716C]">بازخورد «استفاده کردم»</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-center">
                    <div className="flex items-center justify-center gap-1 text-[#15803D] mb-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span className="text-sm font-bold">{toPersianDigits(authorPosts.length || profile.postsCount)}</span>
                    </div>
                    <span className="text-[10px] text-[#78716C]">تجربیات به اشتراک گذاشته</span>
                  </div>
                </div>

                {/* Author's Posts Feed */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2C2724]">
                      تجربیات ثبت شده ({toPersianDigits(authorPosts.length)})
                    </span>
                  </div>

                  {authorPosts.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#8C827A] bg-[#FAF8F5] rounded-2xl border border-dashed border-[#E5DFD5]">
                      هنوز تجربه‌ای در پایگاه ثبت نشده است.
                    </div>
                  ) : (
                    authorPosts.map((post) => (
                      <div
                        key={post.id}
                        className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4D8] space-y-2 text-right"
                      >
                        <div className="flex items-center justify-between text-[11px] text-[#8C827A]">
                          <span className="flex items-center gap-1 text-[#C2410C]">
                            <Heart className="w-3 h-3 fill-[#C2410C]" />
                            {toPersianDigits(post.helpfulCount)}
                          </span>
                          <span>{toPersianDigits(post.createdAt)}</span>
                        </div>

                        <p className="text-xs text-[#3E3833] leading-relaxed whitespace-pre-line">
                          {post.text}
                        </p>

                        {/* Attached game if present */}
                        {post.attachedGameCard && (
                          <div
                            onClick={() => {
                              if (onOpenGameModal) {
                                onClose();
                                onOpenGameModal(post.attachedGameCard!);
                              }
                            }}
                            className="p-2 rounded-xl bg-white border border-[#FADCC7] flex items-center justify-between gap-2 cursor-pointer hover:bg-[#FFF9F3] transition-colors"
                          >
                            <span className="text-[10.5px] font-bold text-[#D97706] truncate">
                              🎮 {post.attachedGameCard.title}
                            </span>
                            <span className="text-[10px] text-[#8C827A] whitespace-nowrap">
                              مشاهده کارت 👈
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
