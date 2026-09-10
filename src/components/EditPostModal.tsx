import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { ExperiencePost } from '../types';
import { motion } from 'motion/react';

interface EditPostModalProps {
  post: ExperiencePost | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (postId: string, newText: string) => void;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({
  post,
  isOpen,
  onClose,
  onSave,
}) => {
  const [text, setText] = useState('');

  useEffect(() => {
    if (post) {
      setText(post.text);
    }
  }, [post]);

  if (!isOpen || !post) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSave(post.id, text.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white rounded-[24px] border border-[#E8E2D6] p-5 shadow-xl text-right"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE1] mb-3">
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#FAF8F5] text-[#8C827A] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-[#2C2724]">ویرایش متن تجربه</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full text-xs p-3 rounded-xl bg-[#FAF8F5] border border-[#E0D9CE] focus:outline-none resize-none leading-relaxed text-right"
          />

          <div className="pt-2 flex items-center justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-3 rounded-xl bg-[#FAF8F5] text-[#736A62]"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded-xl bg-[#2C2724] text-white font-medium shadow-xs"
            >
              ذخیره ویرایش
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
