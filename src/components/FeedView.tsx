import React, { useState } from 'react';
import { MessageCircle, Heart, Share2, MoreVertical, Flag, Edit2, Trash2, Send, Plus, X, Sparkles, Check, ChevronDown, ChevronUp, CornerDownLeft, Puzzle, Search } from 'lucide-react';
import { ExperiencePost, GameCard, UserProfile, Comment, Reply } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { getCategoryMeta } from '../utils/categoryHelpers';
import { toPersianDigits } from '../utils/persian';
import { normalizeSurahName } from '../utils/quranUtils';
import { AuthorProfileModal } from './AuthorProfileModal';

interface FeedViewProps {
  profile: UserProfile;
  posts: ExperiencePost[];
  savedGames?: GameCard[];
  attachedGame: GameCard | null;
  onSelectAttachedGame?: (game: GameCard) => void;
  onRemoveAttachedGame: () => void;
  onCreatePost: (text: string, attachedGame?: GameCard) => void;
  onToggleHelpful: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onAddReply: (postId: string, commentId: string, text: string) => void;
  onReportPost: (postId: string) => void;
  onEditPost: (post: ExperiencePost) => void;
  onDeletePost: (postId: string) => void;
  onOpenGameModal: (game: GameCard) => void;
  onRequireAuth?: (reasonMessage?: string) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  profile,
  posts,
  savedGames = [],
  attachedGame,
  onSelectAttachedGame,
  onRemoveAttachedGame,
  onCreatePost,
  onToggleHelpful,
  onAddComment,
  onAddReply,
  onReportPost,
  onEditPost,
  onDeletePost,
  onOpenGameModal,
  onRequireAuth,
}) => {
  const [newPostText, setNewPostText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAttachGameModalOpen, setIsAttachGameModalOpen] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [activeReplyCommentId, setActiveReplyCommentId] = useState<string | null>(null);
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'with_game' | 'mine'>('all');
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);
  const [selectedAuthorName, setSelectedAuthorName] = useState<string | undefined>(undefined);

  const activeChildName = profile.children.length > 0 ? profile.children[0].name : 'فرزندم';

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.isAuthenticated) {
      onRequireAuth?.('برای انتشار تجربه در جامعه مادران، لطفاً ابتدا وارد حساب کاربری خود شوید یا ثبت‌نام کنید.');
      return;
    }
    if (!newPostText.trim() && !attachedGame) return;
    onCreatePost(newPostText.trim(), attachedGame || undefined);
    setNewPostText('');
  };

  const handleSendComment = (postId: string) => {
    if (!profile.isAuthenticated) {
      onRequireAuth?.('برای ثبت نظر و دیدگاه، لطفاً ابتدا وارد حساب کاربری خود شوید یا ثبت‌نام کنید.');
      return;
    }
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    onAddComment(postId, text);
    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  const handleSendReply = (postId: string, commentId: string) => {
    if (!profile.isAuthenticated) {
      onRequireAuth?.('برای ارسال پاسخ به دیدگاه‌ها، لطفاً ابتدا وارد حساب کاربری خود شوید یا ثبت‌نام کنید.');
      return;
    }
    const text = replyInputs[commentId]?.trim();
    if (!text) return;
    onAddReply(postId, commentId, text);
    setReplyInputs({ ...replyInputs, [commentId]: '' });
    setActiveReplyCommentId(null);
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'with_game') return !!post.attachedGameCard;
    if (filter === 'mine') return post.isOwn;
    return true;
  });

  return (
    <div className="px-5 pt-3 pb-24 max-w-lg mx-auto">
      {/* Top Header */}
      <div className="mb-4 text-right">
        <h2 className="text-xl font-bold text-[#2C2724] tracking-tight">
          تجربه‌ها و گفتگوی مادران
        </h2>
        <p className="text-xs text-[#78716C] mt-0.5">
          تبادل ایده‌ها، بازی‌ها و راهکارهای حفظ و مفاهیم قرآن برای کودکان
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-5 relative">
        <input
          type="text"
          placeholder="جستجو در تجربیات مادران..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-[#EAE3D6] rounded-2xl py-3 pr-11 pl-4 text-[13px] text-[#383431] focus:outline-none focus:border-[#D97706] shadow-xs"
        />
        <Search className="w-4 h-4 text-[#A89E96] absolute right-4 top-1/2 -translate-y-1/2" />
      </div>

      {/* Top Creation Box */}
      <div className="rounded-[24px] bg-white border border-[#EAE3D6] p-4 shadow-[0_3px_14px_rgba(0,0,0,0.02)] mb-5 text-right">
        <form onSubmit={handlePublish}>
          <div className="flex items-center gap-2 mb-2 justify-start">
            <span className="w-7 h-7 rounded-full bg-[#FEE4D6] text-[#D97706] text-xs font-semibold flex items-center justify-center">
              {profile.username ? profile.username[0] : 'م'}
            </span>
            <span className="text-xs font-medium text-[#423B35]">
              نوشتن تجربه، ایده یا سوال درباره حفظ {activeChildName}...
            </span>
          </div>

          <textarea
            rows={3}
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder={`تجربه‌تان از یک بازی، روش تشویق یا سوالی درباره حفظ و مفاهیم قرآن برای ${activeChildName} را بنویسید...`}
            className="w-full text-[13.5px] p-2 bg-transparent text-[#383431] placeholder-[#A89E96] focus:outline-none resize-none leading-relaxed text-right"
          />

          {/* Attached Game Mini-Card if present */}
          {attachedGame && (
            <div className="mt-2 mb-3 p-3 rounded-2xl bg-[#FFF8F2] border border-[#FADCC7] flex items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0D9488]">
                <Puzzle className="w-4 h-4" />
              </div>

              <div
                onClick={() => onOpenGameModal(attachedGame)}
                className="flex-1 text-right px-3 cursor-pointer"
              >
                <div className="flex items-center justify-start gap-1.5 mb-0.5">
                  <span className="text-[11px] text-[#8C827A]">
                    {normalizeSurahName(attachedGame.surah)} • {toPersianDigits(attachedGame.duration)}
                  </span>
                </div>
                <span className="text-xs font-bold text-[#2C2724] hover:text-[#D97706] block">
                  {attachedGame.title}
                </span>
              </div>

              <button
                type="button"
                onClick={onRemoveAttachedGame}
                className="w-6 h-6 rounded-full bg-white/80 hover:bg-white text-[#8C7E75] flex items-center justify-center transition-all"
                title="حذف کارت پیوست"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Publish action row */}
          <div className="pt-2.5 border-t border-[#F5F0E6] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAttachGameModalOpen(true)}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE2] text-[#6E645C] hover:text-[#2C2724] border border-[#E8E2D8] text-xs transition-all active:scale-95 cursor-pointer"
                title="پیوست بازی‌های ذخیره شده به این پست"
              >
                <Puzzle className="w-3.5 h-3.5 text-[#D97706]" />
                <span>پیوست بازی</span>
                {savedGames && savedGames.length > 0 && (
                  <span className="text-[10.5px] px-1.5 py-0.2 rounded-full bg-[#FFF0E6] text-[#D97706] font-bold">
                    {toPersianDigits(savedGames.length)}
                  </span>
                )}
              </button>

              {attachedGame && (
                <span className="text-[11px] text-[#059669] font-medium hidden sm:inline">
                  بازی پیوست شد ✓
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={!newPostText.trim() && !attachedGame}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2C2724] hover:bg-[#3E3834] disabled:opacity-40 text-white text-xs font-medium transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <span>انتشار تجربه</span>
              <Send className="w-3 h-3 rotate-180" />
            </button>
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setFilter('all')}
          className={`text-xs px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap ${
            filter === 'all'
              ? 'bg-[#2C2724] text-white font-medium shadow-xs'
              : 'bg-[#F2EDE4] text-[#6B6157] hover:bg-[#EAE4D8]'
          }`}
        >
          همه تجربیات
        </button>
        <button
          onClick={() => setFilter('with_game')}
          className={`text-xs px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 ${
            filter === 'with_game'
              ? 'bg-[#2C2724] text-white font-medium shadow-xs'
              : 'bg-[#F2EDE4] text-[#6B6157] hover:bg-[#EAE4D8]'
          }`}
        >
          <Puzzle className="w-3.5 h-3.5 text-[#0D9488]" />
          <span>همراه با کارت</span>
        </button>
        <button
          onClick={() => setFilter('mine')}
          className={`text-xs px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap ${
            filter === 'mine'
              ? 'bg-[#2C2724] text-white font-medium shadow-xs'
              : 'bg-[#F2EDE4] text-[#6B6157] hover:bg-[#EAE4D8]'
          }`}
        >
          تجربه‌های من
        </button>
      </div>

      {/* Experience Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const isCommentsOpen = activeCommentPostId === post.id;
          const postCardMeta = post.attachedGameCard ? getCategoryMeta(post.attachedGameCard.tag) : null;

          return (
            <motion.div
              key={post.id}
              layout
              className="rounded-[26px] bg-white border border-[#EAE4D8] p-5 shadow-[0_3px_16px_rgba(0,0,0,0.02)] text-right relative"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between mb-3">
                {/* Author Info (Clickable to view community profile) */}
                <div
                  onClick={() => {
                    setSelectedAuthorId(post.authorId);
                    setSelectedAuthorName(post.authorName);
                  }}
                  className="flex items-center gap-2.5 cursor-pointer group"
                  title="مشاهده پروفایل مادر در جامعه قرآنی"
                >
                  <div className={`w-9 h-9 rounded-full ${post.authorAvatarColor || 'bg-[#FAF3EC] text-[#D97706]'} border border-[#F2E5D8] flex items-center justify-center text-xs font-bold group-hover:ring-2 group-hover:ring-[#D97706]/40 transition-all flex-shrink-0 shadow-xs`}>
                    {post.authorName[0]}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 justify-start">
                      <span className="text-xs font-bold text-[#2C2724] group-hover:text-[#D97706] transition-colors">
                        {post.authorName}
                      </span>
                      {post.isOwn && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5F2EC] text-[#78716C]">
                          شما
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 justify-start text-[11px] text-[#8C827A] mt-0.5">
                      {post.authorChildName && (
                        <>
                          <span>
                            {post.authorChildName.includes('مربی') || post.authorChildName.includes('حافظ') || post.authorChildName.includes('استاد')
                              ? post.authorChildName
                              : post.authorName.includes('پدر') || post.authorName.includes('بابا')
                              ? `پدر ${post.authorChildName} (${toPersianDigits(post.authorChildAge)} ساله)`
                              : post.authorChildName.includes(' و ')
                              ? `مادر ${post.authorChildName}`
                              : `مادر ${post.authorChildName} (${toPersianDigits(post.authorChildAge)} ساله)`}
                          </span>
                          <span>•</span>
                        </>
                      )}
                      <span>{toPersianDigits(post.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* 3-Dots Menu */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenMenuPostId(openMenuPostId === post.id ? null : post.id)
                    }
                    aria-label="گزینه‌های پست"
                    className="w-6 h-6 rounded-full hover:bg-[#F2EDE4] text-[#8C827A] flex items-center justify-center transition-all"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {/* Dropdown Menu */}
                  {openMenuPostId === post.id && (
                    <div className="absolute left-0 top-7 w-36 bg-white rounded-xl shadow-lg border border-[#E8E2D6] py-1 z-20 text-xs text-right">
                      {post.isOwn ? (
                        <>
                          <button
                            onClick={() => {
                              setOpenMenuPostId(null);
                              onEditPost(post);
                            }}
                            className="w-full px-3 py-2 text-[#4A433D] hover:bg-[#FAF8F5] flex items-center justify-end gap-2 text-right"
                          >
                            <span>ویرایش پست</span>
                            <Edit2 className="w-3.5 h-3.5 text-[#8C827A]" />
                          </button>
                          <button
                            onClick={() => {
                              setOpenMenuPostId(null);
                              onDeletePost(post.id);
                            }}
                            className="w-full px-3 py-2 text-[#DC2626] hover:bg-[#FEF2F2] flex items-center justify-end gap-2 text-right"
                          >
                            <span>حذف پست</span>
                            <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setOpenMenuPostId(null);
                            onReportPost(post.id);
                          }}
                          className="w-full px-3 py-2 text-[#6B6157] hover:bg-[#FAF8F5] flex items-center justify-end gap-2 text-right"
                        >
                          <span>گزارش پست</span>
                          <Flag className="w-3.5 h-3.5 text-[#E65100]" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Post Body Text */}
              <p className="text-[13.5px] text-[#3D3631] leading-[1.8] font-normal mb-3.5 whitespace-pre-line">
                {post.text}
              </p>

              {/* Attached Game Mini-Card (if present) */}
              {post.attachedGameCard && postCardMeta && (
                <div
                  onClick={() => onOpenGameModal(post.attachedGameCard!)}
                  className="mb-4 p-3 rounded-2xl bg-[#FFF9F3] hover:bg-[#FFF4EB] border border-[#FADCC7] cursor-pointer transition-all flex items-center justify-between gap-3 group"
                >
                  <div className={`w-10 h-10 flex-shrink-0 rounded-2xl ${postCardMeta.bgLight} border ${postCardMeta.borderColor} flex items-center justify-center shadow-sm`}>
                    {postCardMeta.icon}
                  </div>

                  <div className="flex-1 text-right min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[13px] font-bold text-[#2C2724] leading-snug line-clamp-1">
                        {post.attachedGameCard.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#78716C] block line-clamp-2 leading-relaxed">
                      {post.attachedGameCard.description}
                    </span>
                  </div>

                  <span className="flex-shrink-0 text-[11.5px] font-bold text-[#D97706] bg-white px-2.5 py-1.5 rounded-xl border border-[#FADCC7] group-hover:bg-[#FFF0E6] transition-colors shadow-sm">
                    مشاهده 👈
                  </span>
                </div>
              )}

              {/* Post Actions: "استفاده کردم" + "دیدگاه‌ها" */}
              <div className="pt-3 border-t border-[#F2EBE0] flex items-center justify-between text-xs">
                {/* Helpful / "استفاده کردم" Button */}
                <button
                  onClick={() => onToggleHelpful(post.id)}
                  className={`flex items-center gap-1.5 py-1 px-3 rounded-full border transition-all active:scale-95 ${
                    post.hasUserMarkedHelpful
                      ? 'bg-[#FEE4D6] text-[#C2410C] border-[#FDBA74] font-medium'
                      : 'bg-[#FAF8F5] text-[#6B6157] border-[#E8E2D8] hover:bg-[#F2ECE2]'
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      post.hasUserMarkedHelpful ? 'fill-[#C2410C] text-[#C2410C]' : 'text-[#8C827A]'
                    }`}
                  />
                  <span>استفاده کردم ({toPersianDigits(post.helpfulCount)})</span>
                </button>

                {/* Comments Toggle */}
                <button
                  onClick={() =>
                    setActiveCommentPostId(isCommentsOpen ? null : post.id)
                  }
                  className="flex items-center gap-1.5 text-[#73685F] hover:text-[#2C2724] py-1 px-2.5 rounded-full hover:bg-[#FAF7F2] transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>
                    دیدگاه‌ها ({toPersianDigits(post.comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0))})
                  </span>
                  {isCommentsOpen ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              </div>

              {/* 1-Level Comments & Replies Section */}
              <AnimatePresence>
                {isCommentsOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-[#F0EAE0] space-y-3"
                  >
                    {/* Add Comment Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onClick={() => {
                          if (!profile.isAuthenticated) {
                            onRequireAuth?.('برای ثبت دیدگاه، لطفاً ابتدا وارد حساب کاربری خود شوید یا ثبت‌نام کنید.');
                          }
                        }}
                        onChange={(e) =>
                          setCommentInputs({
                            ...commentInputs,
                            [post.id]: e.target.value,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendComment(post.id);
                        }}
                        placeholder={profile.isAuthenticated ? "نظر یا تجربه خودتان را بنویسید..." : "برای ثبت دیدگاه لطفاً وارد شوید..."}
                        className="flex-1 text-xs p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] focus:outline-none focus:border-[#D97706] text-right"
                      />
                      <button
                        type="button"
                        onClick={() => handleSendComment(post.id)}
                        disabled={!commentInputs[post.id]?.trim()}
                        className="p-2.5 rounded-xl bg-[#2C2724] text-white disabled:opacity-40 hover:bg-[#453E39] transition-all active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5 rotate-180" />
                      </button>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-2.5 pr-1">
                      {post.comments.length === 0 && (
                        <span className="text-[11px] text-[#A89E96] block text-center py-2">
                          هنوز دیدگاهی ثبت نشده است. اولین نفری باشید که نظر می‌دهد!
                        </span>
                      )}

                      {post.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EBE6DC] text-right text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-[#38322D]">
                                {comment.authorName}
                              </span>
                              <span className="text-[10px] text-[#8C827A]">
                                {toPersianDigits(comment.createdAt)}
                              </span>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() =>
                                setActiveReplyCommentId(
                                  activeReplyCommentId === comment.id
                                  ? null
                                  : comment.id
                                )
                              }
                              className="text-[11px] text-[#D97706] hover:underline flex items-center gap-1"
                            >
                              <CornerDownLeft className="w-3 h-3" />
                              <span>پاسخ</span>
                            </button>
                          </div>

                          <p className="text-[12.5px] text-[#4A433E] leading-relaxed pr-1">
                            {comment.text}
                          </p>

                          {/* Inline Reply Input (if active) */}
                          {activeReplyCommentId === comment.id && (
                            <div className="flex items-center gap-1.5 pt-1.5 border-t border-[#EBE5DC]">
                              <input
                                type="text"
                                value={replyInputs[comment.id] || ''}
                                onChange={(e) =>
                                  setReplyInputs({
                                    ...replyInputs,
                                    [comment.id]: e.target.value,
                                  })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter')
                                    handleSendReply(post.id, comment.id);
                                }}
                                placeholder={`پاسخ به ${comment.authorName}...`}
                                className="flex-1 text-[11px] p-2 rounded-lg bg-white border border-[#E2DDD3] focus:outline-none text-right"
                              />
                              <button
                                type="button"
                                onClick={() => handleSendReply(post.id, comment.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#2C2724] text-white text-[11px]"
                              >
                                ارسال
                              </button>
                            </div>
                          )}

                          {/* 1-Level Nested Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-2 space-y-1.5 pr-3 border-r-2 border-[#D97706]/40">
                              {comment.replies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className="p-2 rounded-lg bg-white border border-[#EFE9E0] text-right"
                                >
                                  <div className="flex items-center justify-between text-[10px] text-[#8C827A] mb-1">
                                    <span>{toPersianDigits(reply.createdAt)}</span>
                                    <span className="font-semibold text-[#5A5048]">
                                      {reply.authorName}
                                    </span>
                                  </div>
                                  <p className="text-[11.5px] text-[#4A433E] leading-relaxed">
                                    {reply.text}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Attach Saved Game Modal */}
      <AnimatePresence>
        {isAttachGameModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-[28px] border border-[#E8E2D6] p-5 shadow-2xl max-h-[85vh] flex flex-col text-right overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE1] mb-3">
                <button
                  type="button"
                  onClick={() => setIsAttachGameModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#FAF8F5] text-[#8C827A] flex items-center justify-center hover:bg-[#F2ECE2] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#2C2724]">
                    انتخاب بازی ذخیره‌شده برای پیوست
                  </span>
                  <Puzzle className="w-4 h-4 text-[#D97706]" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 no-scrollbar py-1">
                {!savedGames || savedGames.length === 0 ? (
                  <div className="py-10 text-center text-xs text-[#8C827A] leading-relaxed">
                    هنوز بازی‌ای در لیست ذخیره‌های شما نیست.
                    <br />
                    می‌توانید از بخش «مربی هوشمند» یا «کارت‌های بازی» بازی‌های جذاب را ذخیره کرده و به اشتراک بگذارید.
                  </div>
                ) : (
                  savedGames.map((game) => {
                    const isAlreadyAttached = attachedGame?.id === game.id;
                    return (
                      <div
                        key={game.id}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isAlreadyAttached
                            ? 'bg-[#FFF9F3] border-[#FADCC7]'
                            : 'bg-[#FAF8F5] border-[#EBE5DA] hover:border-[#D97706]/40'
                        }`}
                      >
                        <div className="flex-1 text-right min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[11px] text-[#8C827A]">
                              {normalizeSurahName(game.surah)} • {toPersianDigits(game.duration)}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-[#2C2724] truncate">
                            {game.title}
                          </h4>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            onSelectAttachedGame?.(game);
                            setIsAttachGameModalOpen(false);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
                            isAlreadyAttached
                              ? 'bg-[#D97706] text-white'
                              : 'bg-[#2C2724] text-white hover:bg-[#3E3834]'
                          }`}
                        >
                          {isAlreadyAttached ? 'پیوست شده ✓' : 'پیوست به پست'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Author Community Profile Modal */}
      <AuthorProfileModal
        isOpen={Boolean(selectedAuthorId)}
        authorId={selectedAuthorId}
        authorNameFallback={selectedAuthorName}
        onClose={() => setSelectedAuthorId(null)}
        onOpenGameModal={onOpenGameModal}
      />
    </div>
  );
};

