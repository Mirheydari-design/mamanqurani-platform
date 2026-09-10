import React, { useState, useEffect } from 'react';
import { X, User, Sparkles, Check, ArrowLeft, Lock, Phone, UserPlus, LogIn, AlertCircle, Baby } from 'lucide-react';
import { UserProfile, Child } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { authService } from '../services/authService';
import { toPersianDigits } from '../utils/persian';

interface AuthModalProps {
  currentProfile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: UserProfile) => void;
  onSaveChild?: (child: Child) => void;
  initialMode?: 'register' | 'login' | 'edit_profile';
  reasonMessage?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentProfile,
  isOpen,
  onClose,
  onSaveProfile,
  onSaveChild,
  initialMode = 'register',
  reasonMessage,
}) => {
  const [mode, setMode] = useState<'register' | 'login' | 'edit_profile'>(initialMode);
  
  const defaultUsername = currentProfile.username || 
    (currentProfile.children.length > 0 ? `مادر ${currentProfile.children[0].name}` : 'مادر قرآن‌آموز');
  
  const [username, setUsername] = useState(defaultUsername);
  const [phoneOrEmail, setPhoneOrEmail] = useState(currentProfile.phoneOrEmail || '');
  const [password, setPassword] = useState('');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState<number>(5);
  const [childSurah, setChildSurah] = useState('');
  const [isAddingNewChildInRegister, setIsAddingNewChildInRegister] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setPassword('');
      setUsername(currentProfile.username || defaultUsername);
      setPhoneOrEmail(currentProfile.phoneOrEmail || '');
      setChildName('');
      setChildAge(5);
      setChildSurah('');
      setIsAddingNewChildInRegister(false);
    }
  }, [isOpen, initialMode, currentProfile]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        // Enforce child registration for registration
        if (currentProfile.children.length === 0 && !childName.trim()) {
          setErrorMsg('لطفاً قبل از ثبت‌نام، مشخصات فرزند قرآن‌آموز خود را وارد کنید.');
          setIsSubmitting(false);
          return;
        }

        if (!username.trim()) {
          setErrorMsg('لطفاً نام کاربری خود را وارد کنید.');
          setIsSubmitting(false);
          return;
        }
        if (!phoneOrEmail.trim()) {
          setErrorMsg('لطفاً شماره موبایل یا ایمیل را وارد کنید.');
          setIsSubmitting(false);
          return;
        }

        let updatedChildrenList = [...currentProfile.children];
        if (childName.trim()) {
          const newChild: Child = {
            id: `child_${Date.now()}`,
            name: childName.trim(),
            age: childAge,
            goal: childSurah.trim() ? `حفظ و انس با ${childSurah.trim()}` : 'انس با سوره‌های کوچک قرآن',
            hasStartedMemorization: true,
            memorizationScope: childSurah.trim() || 'سوره ناس تا کوثر',
            avatarColor: 'bg-[#FEE4D6] text-[#D97706]',
            surahProgress: [
              {
                surah: childSurah.trim() || 'ناس',
                progress: 50,
                status: 'learning',
                lastReviewed: 'امروز',
              },
            ],
          };
          updatedChildrenList.push(newChild);
          onSaveChild?.(newChild);
        }

        const registeredProfile = await authService.register({
          username: username.trim(),
          phoneOrEmail: phoneOrEmail.trim(),
          password: password.trim(),
          children: updatedChildrenList,
        });
        onSaveProfile(registeredProfile);
        onClose();
      } else if (mode === 'login') {
        if (!phoneOrEmail.trim()) {
          setErrorMsg('لطفاً شماره موبایل یا ایمیل را وارد کنید.');
          setIsSubmitting(false);
          return;
        }

        const loggedInProfile = await authService.login({
          phoneOrEmail: phoneOrEmail.trim(),
          password: password.trim(),
        });
        onSaveProfile(loggedInProfile);
        onClose();
      } else {
        // edit_profile
        const updated: UserProfile = {
          ...currentProfile,
          username: username.trim() || 'مادر قرآن‌آموز',
          phoneOrEmail: phoneOrEmail.trim() || '۰۹۱۲۳۴۵۶۷۸۹',
        };
        authService.saveProfile(updated);
        onSaveProfile(updated);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'خطایی رخ داد. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestUsername = (childName: string) => {
    setUsername(`مادر ${childName}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white rounded-[28px] border border-[#E8E2D6] p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE1] mb-3">
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#FAF8F5] text-[#8C827A] flex items-center justify-center hover:bg-[#F2ECE2] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#2C2724]">
              {mode === 'register' && 'ثبت‌نام و عضویت در مامان قرآنی'}
              {mode === 'login' && 'ورود به حساب کاربری'}
              {mode === 'edit_profile' && 'ویرایش مشخصات پروفایل'}
            </span>
            <div className="w-2 h-2 rounded-full bg-[#D97706]"></div>
          </div>
        </div>

        {/* Reason banner if triggered by an action requiring auth */}
        {reasonMessage && mode !== 'edit_profile' && (
          <div className="mb-4 p-3 rounded-2xl bg-[#FFF8F2] border border-[#FCD9C4] flex items-start gap-2.5 text-right">
            <Sparkles className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#9A3412] leading-relaxed font-medium">
              {reasonMessage}
            </p>
          </div>
        )}

        {/* Mode Switch Tabs (Register vs Login) */}
        {mode !== 'edit_profile' && (
          <div className="flex items-center gap-1.5 p-1 bg-[#F5F2EC] rounded-2xl mb-4 text-xs font-medium">
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(null); }}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-white text-[#2C2724] shadow-xs font-bold'
                  : 'text-[#78716C] hover:text-[#2C2724]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>ثبت‌نام جدید</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); }}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-white text-[#2C2724] shadow-xs font-bold'
                  : 'text-[#78716C] hover:text-[#2C2724]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>ورود به حساب</span>
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-center gap-2 text-xs text-[#DC2626]">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Child Information Section in Register Mode */}
          {mode === 'register' && (
            <div className="p-3.5 rounded-2xl bg-[#FFF9F3] border border-[#FADCC7] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#2C2724]">
                  <Sparkles className="w-4 h-4 text-[#D97706]" />
                  <span>مشخصات فرزند قرآن‌آموز</span>
                  {currentProfile.children.length === 0 && (
                    <span className="text-[10px] text-[#DC2626] font-normal">(الزامی برای ثبت‌نام)</span>
                  )}
                </div>
                {currentProfile.children.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewChildInRegister(!isAddingNewChildInRegister)}
                    className="text-[11px] text-[#D97706] hover:underline font-medium cursor-pointer"
                  >
                    {isAddingNewChildInRegister ? 'انصراف' : '+ ثبت فرزند دیگر'}
                  </button>
                )}
              </div>

              {currentProfile.children.length > 0 && !isAddingNewChildInRegister ? (
                <div className="p-2.5 rounded-xl bg-white border border-[#F2E5D8] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#FEE4D6] text-[#D97706] flex items-center justify-center font-bold text-[11px]">
                      {currentProfile.children[0].name[0]}
                    </span>
                    <span className="font-bold text-[#2C2724]">
                      {currentProfile.children.map(c => `${c.name} (${toPersianDigits(c.age)} ساله)`).join('، ')}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#059669] font-medium">ثبت‌شده ✓</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[#4A433D] mb-1 font-medium text-[11.5px]">
                      نام فرزند دلبندتان:
                    </label>
                    <input
                      type="text"
                      value={childName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setChildName(val);
                        if (val.trim() && (!username || username === 'مادر قرآن‌آموز' || username.startsWith('مادر '))) {
                          setUsername(`مادر ${val.trim()}`);
                        }
                      }}
                      placeholder="مثلاً: فاطمه، علی‌اصغر، طه..."
                      className="w-full p-2.5 rounded-xl bg-white border border-[#E0D8CE] focus:outline-none focus:border-[#D97706] text-[12.5px] text-[#2C2724]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[#4A433D] mb-1 font-medium text-[11.5px]">
                        سن کودک:
                      </label>
                      <select
                        value={childAge}
                        onChange={(e) => setChildAge(Number(e.target.value))}
                        className="w-full p-2 rounded-xl bg-white border border-[#E0D8CE] focus:outline-none focus:border-[#D97706] text-[12px] text-[#2C2724]"
                      >
                        {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((age) => (
                          <option key={age} value={age}>
                            {toPersianDigits(age)} سال
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#4A433D] mb-1 font-medium text-[11.5px]">
                        سوره هدف / در حال حفظ:
                      </label>
                      <input
                        type="text"
                        value={childSurah}
                        onChange={(e) => setChildSurah(e.target.value)}
                        placeholder="مثلاً: ناس، توحید، کوثر"
                        className="w-full p-2 rounded-xl bg-white border border-[#E0D8CE] focus:outline-none focus:border-[#D97706] text-[12px] text-[#2C2724]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Username Field (Register or Edit mode) */}
          {(mode === 'register' || mode === 'edit_profile') && (
            <div>
              <label className="block text-[#4A433D] mb-1.5 font-bold">
                نام و نام خانوادگی / نام کاربری:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="مثلاً: مادر فاطمه سادات"
                  className="w-full p-3 pr-9 rounded-xl bg-[#FAF8F5] border border-[#E0D8CE] focus:outline-none focus:border-[#D97706] text-[13px] text-[#2C2724]"
                />
                <User className="w-4 h-4 text-[#A89E96] absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              
              {/* Suggestions based on children */}
              {currentProfile.children.length > 0 && mode === 'register' && (
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[11px] text-[#8C827A]">پیشنهاد:</span>
                  {currentProfile.children.map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => handleSuggestUsername(ch.name)}
                      className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FAF5EE] text-[#D97706] border border-[#FADCC7] hover:bg-[#FDE7D4] transition-all"
                    >
                      مادر {ch.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Phone or Email */}
          <div>
            <label className="block text-[#4A433D] mb-1.5 font-bold">
              شماره موبایل یا ایمیل:
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                placeholder="مثلاً: ۰۹۱۲۳۴۵۶۷۸۹ یا ایمیل"
                className="w-full p-3 pr-9 rounded-xl bg-[#FAF8F5] border border-[#E0D8CE] focus:outline-none focus:border-[#D97706] text-[13px] text-[#2C2724] text-right"
              />
              <Phone className="w-4 h-4 text-[#A89E96] absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Password (Optional / Standard credential field) */}
          {mode !== 'edit_profile' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-[#8C827A]">(اختیاری)</span>
                <label className="text-[#4A433D] font-bold">
                  رمز عبور:
                </label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور دلخواه خود را وارد کنید"
                  className="w-full p-3 pr-9 rounded-xl bg-[#FAF8F5] border border-[#E0D8CE] focus:outline-none focus:border-[#D97706] text-[13px] text-[#2C2724]"
                />
                <Lock className="w-4 h-4 text-[#A89E96] absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {/* Feature highlights for new registration */}
          {mode === 'register' && (
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#ECE6DC] space-y-1.5 text-[11.5px] text-[#6E645C]">
              <div className="flex items-center gap-1.5 text-[#059669]">
                <Check className="w-3.5 h-3.5" />
                <span>امکان نظردهی و گفتگو در تجربیات جامعه مادران</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#059669]">
                <Check className="w-3.5 h-3.5" />
                <span>استفاده از مربی هوشمند و تولید برنامه‌های اختصاصی</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#059669]">
                <Check className="w-3.5 h-3.5" />
                <span>کیف پول اختصاصی برای پرداخت آسان خدمات</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 flex items-center justify-between gap-2 border-t border-[#F2ECE2]">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDD3] text-[#6E645C] hover:bg-[#F2ECE2] transition-all"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-5 rounded-xl bg-[#2C2724] text-white font-medium hover:bg-[#3D3732] shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              {mode === 'register' && <span>تکمیل ثبت‌نام و ورود</span>}
              {mode === 'login' && <span>ورود به سامانه</span>}
              {mode === 'edit_profile' && <span>ذخیره تغییرات</span>}
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
