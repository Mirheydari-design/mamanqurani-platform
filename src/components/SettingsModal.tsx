import React, { useState, useEffect } from 'react';
import {
  X,
  Wallet,
  CreditCard,
  Plus,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  Settings,
  LogOut,
  User,
  ShieldCheck,
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import { UserProfile, WalletTransaction } from '../types';
import { motion } from 'motion/react';
import { toPersianDigits, formatPersianDateTime } from '../utils/persian';
import { authService } from '../services/authService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenAuth: (mode?: 'login' | 'register' | 'edit_profile', reason?: string) => void;
  onLogout: () => void;
  initialSection?: 'wallet' | 'account';
  onToast?: (msg: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onOpenAuth,
  onLogout,
  initialSection = 'wallet',
  onToast,
}) => {
  const [activeSection, setActiveSection] = useState<'wallet' | 'account'>('wallet');
  const [selectedPreset, setSelectedPreset] = useState<number>(100_000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isProcessingCharge, setIsProcessingCharge] = useState(false);

  // Synchronize activeSection whenever initialSection or isOpen changes
  useEffect(() => {
    if (initialSection === 'account') {
      setActiveSection('account');
    } else {
      setActiveSection('wallet');
    }
  }, [initialSection, isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentBalance = profile.walletBalance ?? 100_000;
  const transactions: WalletTransaction[] = profile.transactions ?? [];

  const handleCharge = (amountToCharge: number) => {
    if (amountToCharge <= 0) return;
    setIsProcessingCharge(true);

    setTimeout(() => {
      const updated = authService.chargeWallet(profile, amountToCharge);
      onUpdateProfile(updated);
      setIsProcessingCharge(false);
      setCustomAmount('');
      onToast?.(`کیف پول شما به‌مبلغ ${toPersianDigits(amountToCharge.toLocaleString('fa-IR'))} تومان با موفقیت شارژ شد 🌱`);
    }, 400);
  };

  const handleQuickCharge = (amount: number) => {
    setSelectedPreset(amount);
    setCustomAmount('');
    handleCharge(amount);
  };

  const handleCustomChargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert Persian numbers to English if entered via Persian keyboard
    const converted = customAmount.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
    const raw = converted.replace(/[^0-9]/g, '');
    const num = parseInt(raw, 10);
    if (!num || num < 10_000) {
      onToast?.('حداقل مبلغ شارژ ۱۰,۰۰۰ تومان است.');
      return;
    }
    handleCharge(num);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-[28px] border border-[#E8E2D6] p-5 sm:p-6 shadow-2xl max-h-[88vh] overflow-y-auto text-right my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE1] mb-4">
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#FAF8F5] text-[#8C827A] flex items-center justify-center hover:bg-[#F2ECE2] transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#2C2724]">
              تنظیمات و کیف پول
            </span>
            <div className="w-7 h-7 rounded-xl bg-[#FFF0E6] text-[#D97706] flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F5F2EC] rounded-2xl mb-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveSection('wallet')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeSection === 'wallet'
                ? 'bg-white text-[#2C2724] shadow-xs font-bold'
                : 'text-[#78716C] hover:text-[#2C2724]'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>کیف پول</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('account')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeSection === 'account'
                ? 'bg-white text-[#2C2724] shadow-xs font-bold'
                : 'text-[#78716C] hover:text-[#2C2724]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>حساب کاربری</span>
          </button>
        </div>

        {/* SECTION 1: WALLET */}
        {activeSection === 'wallet' && (
          <div className="space-y-4">
            {/* Wallet Balance Card */}
            <div className="p-5 rounded-[24px] bg-gradient-to-br from-[#2C2724] to-[#423B35] text-white shadow-lg relative overflow-hidden text-right">
              <div className="absolute -left-6 -bottom-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
              <div className="flex items-center justify-between mb-3 text-xs text-[#D6CEBE]">
                <div className="flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-[#D97706]" />
                  <span>کیف پول اختصاصی</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white font-medium">
                  {profile.isAuthenticated ? 'حساب فعال' : 'کاربر مهمان'}
                </span>
              </div>

              <span className="text-[11.5px] text-[#A89E96] block mb-1">
                موجودی قابل استفاده:
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold tracking-tight text-white">
                  {toPersianDigits(currentBalance.toLocaleString('fa-IR'))}
                </span>
                <span className="text-xs text-[#E2DDD3]">تومان</span>
              </div>
            </div>

            {/* Quick Charge Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#4A433D]">
                شارژ سریع کیف پول:
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[100_000, 200_000, 500_000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    disabled={isProcessingCharge}
                    onClick={() => handleQuickCharge(amount)}
                    className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E0D8CE] hover:border-[#D97706] hover:bg-[#FFF8F2] text-[#2C2724] text-center transition-all active:scale-95 flex flex-col items-center justify-center gap-1 shadow-xs"
                  >
                    <span className="text-xs font-bold">
                      {toPersianDigits(amount.toLocaleString('fa-IR'))}
                    </span>
                    <span className="text-[10px] text-[#8C827A]">تومان</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount Form */}
            <form onSubmit={handleCustomChargeSubmit} className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-[#4A433D]">
                یا مبلغ دلخواه:
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="مثلاً: ۳۵۰,۰۰۰"
                    className="w-full p-2.5 pl-12 pr-3 rounded-xl bg-[#FAF8F5] border border-[#E0D8CE] focus:outline-none focus:border-[#D97706] text-xs text-[#2C2724] text-right"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-[#8C827A]">
                    تومان
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={!customAmount.trim() || isProcessingCharge}
                  className="px-4 py-2.5 rounded-xl bg-[#2C2724] text-white text-xs font-medium hover:bg-[#423B35] disabled:opacity-40 transition-all active:scale-95 shadow-xs whitespace-nowrap"
                >
                  {isProcessingCharge ? 'در حال ثبت...' : 'شارژ'}
                </button>
              </div>
            </form>

            {/* Transaction History */}
            <div className="pt-3 border-t border-[#F0EBE1] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#4A433D]">تراکنش‌های اخیر</span>
                <span className="text-[11px] text-[#8C827A]">
                  {toPersianDigits(transactions.length)} تراکنش
                </span>
              </div>

              <div className="max-h-44 overflow-y-auto space-y-2 no-scrollbar pr-0.5">
                {transactions.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#ECE6DC] text-center text-[11px] text-[#8C827A]">
                    هنوز تراکنشی ثبت نشده است.
                  </div>
                ) : (
                  transactions.map((tx) => {
                    const isCharge = tx.type === 'charge';
                    return (
                      <div
                        key={tx.id}
                        className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EBE6DC] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              isCharge
                                ? 'bg-[#ECFDF5] text-[#059669]'
                                : 'bg-[#FEF2F2] text-[#DC2626]'
                            }`}
                          >
                            {isCharge ? (
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-[#2C2724] block text-[11.5px]">
                              {tx.title}
                            </span>
                            <span className="text-[10px] text-[#8C827A]">
                              {(() => {
                                if (tx.createdAt && tx.createdAt !== 'لحظاتی پیش' && tx.createdAt !== 'امروز') {
                                  return toPersianDigits(tx.createdAt);
                                }
                                const parsedTime = Number(tx.id.replace('tx_', ''));
                                if (!isNaN(parsedTime) && parsedTime > 1000000000) {
                                  return formatPersianDateTime(parsedTime);
                                }
                                return tx.createdAt ? toPersianDigits(tx.createdAt) : 'امروز';
                              })()}
                            </span>
                          </div>
                        </div>

                        <div className="text-left">
                          <span
                            className={`font-bold text-xs ${
                              isCharge ? 'text-[#059669]' : 'text-[#DC2626]'
                            }`}
                          >
                            {isCharge ? '+' : '-'}
                            {toPersianDigits(tx.amount.toLocaleString('fa-IR'))} تومان
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: ACCOUNT */}
        {activeSection === 'account' && (
          <div className="space-y-4 text-xs">
            {profile.isAuthenticated ? (
              <div className="space-y-3">
                {/* User Info Card */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#FEE4D6] text-[#D97706] font-bold text-lg flex items-center justify-center">
                    {profile.username ? profile.username[0] : 'م'}
                  </div>
                  <div>
                    <span className="text-[11px] text-[#8C827A] block">حساب کاربری:</span>
                    <h3 className="text-sm font-bold text-[#2C2724]">{profile.username}</h3>
                    <span className="text-xs text-[#6E645C] mt-0.5 block">
                      {profile.phoneOrEmail || 'شماره موبایل ثبت نشده'}
                    </span>
                  </div>
                </div>

                {/* Edit Profile Action */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth('edit_profile');
                  }}
                  className="w-full p-3 rounded-xl bg-white border border-[#E0D8CE] hover:bg-[#FAF8F5] text-[#2C2724] font-medium transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#8C827A]" />
                    <span>ویرایش اطلاعات پروفایل</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-[#8C827A]" />
                </button>

                {/* Logout Action */}
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] hover:bg-[#FEE2E2] text-[#DC2626] font-medium transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <LogOut className="w-4 h-4" />
                  <span>خروج از حساب کاربری</span>
                </button>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#F5F2EC] text-[#8C827A] flex items-center justify-center mx-auto">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#2C2724] mb-1">
                    شما در حالت مهمان هستید
                  </h4>
                  <p className="text-xs text-[#78716C] leading-relaxed">
                    برای ثبت نظر در تجربیات مادران، ارسال پاسخ، و استفاده از مربی هوشمند قرآنی، لطفاً وارد حساب شوید یا ثبت‌نام کنید.
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth('register');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#2C2724] text-white font-medium hover:bg-[#423B35] transition-all"
                  >
                    ثبت‌نام جدید
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth('login');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-white border border-[#D1C9BE] text-[#2C2724] font-medium hover:bg-[#FAF8F5] transition-all"
                  >
                    ورود به حساب
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
