import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  PawPrint,
  Building2,
  Phone,
  QrCode,
  Square,
  X,
  Droplets,
  Sparkles,
  Shield,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '../../store';
import Timer from '../../components/Timer';
import type { PetSize } from '../../types';
import { cn } from '../../lib/utils';

const sizeLabels: Record<PetSize, string> = {
  SMALL: '小型犬',
  MEDIUM: '中型犬',
  LARGE: '大型犬',
};

export default function UsingPage() {
  const navigate = useNavigate();
  const { bookingId = '' } = useParams();
  const { bookings, startBooking, endBooking } = useAppStore();

  const booking = useMemo(() => bookings.find((b) => b.id === bookingId), [bookings, bookingId]);

  const [showFeedback, setShowFeedback] = useState(false);
  const [showScanConfirm, setShowScanConfirm] = useState(false);
  const [feedback, setFeedback] = useState({
    waterSpilled: false,
    floorNeedsMopping: false,
    usedDisinfectant: false,
  });
  const [submitting, setSubmitting] = useState(false);

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-8">
        <AlertTriangle className="h-16 w-16 text-amber-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">预约不存在</h2>
        <p className="text-slate-500 mb-6 text-center">请返回重新选择</p>
        <button
          onClick={() => navigate('/resident')}
          className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 text-white font-medium shadow-lg shadow-teal-500/30"
        >
          返回首页
        </button>
      </div>
    );
  }

  const isStarted = booking.status === 'IN_USE';

  const handleStart = () => {
    setShowScanConfirm(true);
  };

  const handleConfirmStart = () => {
    setShowScanConfirm(false);
    startBooking(bookingId);
  };

  const handleEnd = () => {
    setShowFeedback(true);
  };

  const handleSubmitFeedback = () => {
    setSubmitting(true);
    setTimeout(() => {
      endBooking(bookingId, feedback);
      navigate('/resident');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-32">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/resident')}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">使用中</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg shadow-teal-500/25">
              <PawPrint className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-800 mb-1">{booking.petInfo.nickname}</h2>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{sizeLabels[booking.petInfo.size]}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>{booking.petInfo.building}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{booking.petInfo.ownerPhone}</span>
                </div>
              </div>
            </div>
          </div>
          {booking.petInfo.afraidOfWater && (
            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <span className="text-sm text-amber-700">宠物怕水，请特别注意</span>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white border border-slate-100 p-8 shadow-sm">
          <Timer startTime={booking.startTime} running={isStarted} />
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">洗脚池</p>
              <p className="text-lg font-bold text-slate-800">{booking.poolName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 mb-1">预约时段</p>
              <p className="text-base font-semibold text-slate-700">{booking.timeSlot}</p>
            </div>
          </div>
        </div>
      </div>

      {!showFeedback ? (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 p-4">
          <div className="max-w-lg mx-auto">
            {!isStarted ? (
              <button
                onClick={handleStart}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-teal-500/30 transition-all hover:shadow-xl hover:shadow-teal-500/40 hover:scale-[1.01] active:scale-[0.99]"
              >
                <QrCode className="h-5 w-5" />
                模拟扫码开始
              </button>
            ) : (
              <button
                onClick={handleEnd}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-rose-500/30 transition-all hover:shadow-xl hover:shadow-rose-500/40 hover:scale-[1.01] active:scale-[0.99]"
              >
                <Square className="h-5 w-5" />
                结束使用
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center sm:items-center animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-6 animate-[slideUp_0.3s_ease-out]">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 mb-4">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">结束使用</h3>
              <p className="text-sm text-slate-500 mt-1">请完成使用反馈</p>
            </div>

            <div className="space-y-3 mb-6">
              <label
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all',
                  feedback.waterSpilled
                    ? 'border-rose-400 bg-rose-50'
                    : 'border-slate-200 bg-white hover:border-rose-200 hover:bg-rose-50/50'
                )}
              >
                <input
                  type="checkbox"
                  checked={feedback.waterSpilled}
                  onChange={(e) => setFeedback({ ...feedback, waterSpilled: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <Droplets className="h-5 w-5 text-rose-500" />
                <div>
                  <p className="font-medium text-slate-800">是否打翻水</p>
                  <p className="text-xs text-slate-500">使用过程中是否有水洒出</p>
                </div>
              </label>

              <label
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all',
                  feedback.floorNeedsMopping
                    ? 'border-amber-400 bg-amber-50'
                    : 'border-slate-200 bg-white hover:border-amber-200 hover:bg-amber-50/50'
                )}
              >
                <input
                  type="checkbox"
                  checked={feedback.floorNeedsMopping}
                  onChange={(e) => setFeedback({ ...feedback, floorNeedsMopping: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <Sparkles className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-medium text-slate-800">地面是否要拖</p>
                  <p className="text-xs text-slate-500">地面是否有污渍需要清洁</p>
                </div>
              </label>

              <label
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all',
                  feedback.usedDisinfectant
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/50'
                )}
              >
                <input
                  type="checkbox"
                  checked={feedback.usedDisinfectant}
                  onChange={(e) => setFeedback({ ...feedback, usedDisinfectant: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <Shield className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="font-medium text-slate-800">有没有用消毒液</p>
                  <p className="text-xs text-slate-500">是否使用消毒液进行消毒</p>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFeedback(false)}
                className="flex-1 rounded-2xl bg-slate-100 px-6 py-3.5 text-base font-semibold text-slate-700 transition-all hover:bg-slate-200 active:scale-[0.98]"
              >
                取消
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={submitting}
                className="flex-1 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-teal-500/30 transition-all hover:shadow-xl hover:shadow-teal-500/40 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60"
              >
                {submitting ? '提交中...' : '确认提交'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showScanConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center sm:items-center animate-[fadeIn_0.2s_ease-out]">
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-6 animate-[slideUp_0.3s_ease-out]">
            <button
              onClick={() => setShowScanConfirm(false)}
              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 mb-4 shadow-lg shadow-teal-500/30">
                <QrCode className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">扫码确认</h3>
              <p className="text-sm text-slate-500 mt-1">请核对以下预约信息后开始使用</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex-shrink-0">
                    <Droplets className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 mb-0.5">洗脚池</p>
                    <p className="text-base font-semibold text-slate-800">{booking.poolName}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-indigo-500 flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 mb-0.5">预约时段</p>
                    <p className="text-base font-semibold text-slate-800">{booking.date} {booking.timeSlot}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowScanConfirm(false)}
                className="flex-1 rounded-2xl bg-slate-100 px-6 py-3.5 text-base font-semibold text-slate-700 transition-all hover:bg-slate-200 active:scale-[0.98]"
              >
                取消
              </button>
              <button
                onClick={handleConfirmStart}
                className="flex-1 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-teal-500/30 transition-all hover:shadow-xl hover:shadow-teal-500/40 hover:scale-[1.01] active:scale-[0.98]"
              >
                确认开始
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
