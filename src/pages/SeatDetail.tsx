import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, MapPin, User, Phone, Clock, Coffee, AlertTriangle,
  Camera, FileText, Send, LogOut, Undo2, Loader2, X, CheckCircle2, AlertCircle,
} from 'lucide-react';
import type { Seat } from '../types';
import { SeatStatus, SEAT_STATUS_COLORS } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { apiClient } from '../api/client';
import { formatDateTime, formatCountdown, timeAgo } from '../utils/time';
import { useAppStore } from '../store/useStore';
import { cn } from '../lib/utils';

export default function SeatDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, loadSeats, loadDisputes } = useAppStore();
  const [seat, setSeat] = useState<Seat | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string>('');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [tempLeaveOpen, setTempLeaveOpen] = useState(false);
  const [tempLeaveMin, setTempLeaveMin] = useState(15);
  const [reporterName, setReporterName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [remark, setRemark] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [, setTick] = useState(0);
  const loadedRef = useRef(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  useEffect(() => {
    if (!id) return;
    if (!loadedRef.current) {
      loadedRef.current = true;
      fetchSeat();
    }
    const t = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, [id]);

  const fetchSeat = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const s = await apiClient.getSeat(id);
      setSeat(s);
    } finally {
      setLoading(false);
    }
  };

  const handleRelease = async () => {
    if (!seat) return;
    if (!confirm('确定要释放该座位吗？')) return;
    setActionLoading('release');
    try {
      await apiClient.deleteSeat(seat.id);
      showToast('座位已释放');
      loadSeats();
      fetchSeat();
    } finally {
      setActionLoading('');
    }
  };

  const handleMarkTempLeave = async () => {
    if (!seat) return;
    setActionLoading('temp');
    try {
      await apiClient.updateSeat(seat.id, { action: 'temp_leave', tempLeaveMinutes: tempLeaveMin });
      setTempLeaveOpen(false);
      showToast('已标记短暂离开');
      loadSeats();
      fetchSeat();
    } finally {
      setActionLoading('');
    }
  };

  const handleReturn = async () => {
    if (!seat) return;
    setActionLoading('return');
    try {
      await apiClient.updateSeat(seat.id, { action: 'return' });
      showToast('欢迎回来，已恢复使用中状态');
      loadSeats();
      fetchSeat();
    } finally {
      setActionLoading('');
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('请选择图片文件');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('图片不能超过 5MB，请压缩后再试');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setPhotoUrl(result);
    };
    reader.onerror = () => {
      showToast('读取图片失败');
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoPreview('');
    setPhotoUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmitFeedback = async () => {
    if (!seat) return;
    if (!reporterName.trim()) {
      setSubmitError('请填写你的称呼');
      return;
    }
    setActionLoading('feedback');
    setSubmitError('');
    try {
      await apiClient.createDispute({
        seatId: seat.id,
        reporterName: reporterName.trim(),
        photoUrl: photoUrl.trim() || undefined,
        remark: remark.trim() || undefined,
      });
      setFeedbackOpen(false);
      setReporterName('');
      setPhotoUrl('');
      setPhotoPreview('');
      setRemark('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      showToast('反馈已提交，管理员会尽快处理');
      loadDisputes();
    } catch (e) {
      setSubmitError((e as Error).message || '提交失败，请稍后重试');
    } finally {
      setActionLoading('');
    }
  };

  const handleAdminRecover = async () => {
    if (!seat) return;
    setActionLoading('recover');
    try {
      const disputes = await apiClient.listDisputes('pending');
      const pendingForSeat = disputes.filter((d) => d.seatId === seat.id);
      for (const d of pendingForSeat) {
        await apiClient.resolveDispute(d.id, 'recover', '管理员直接恢复座位');
      }
      if (pendingForSeat.length === 0) {
        await apiClient.deleteSeat(seat.id);
      }
      showToast('座位已恢复为空');
      loadSeats();
      loadDisputes();
      fetchSeat();
    } finally {
      setActionLoading('');
    }
  };

  if (loading && !seat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (!seat) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-center">
        <p className="text-slate-500">座位不存在</p>
        <button onClick={() => navigate('/')} className="mt-4 text-teal-600 hover:underline">返回首页</button>
      </div>
    );
  }

  const colors = SEAT_STATUS_COLORS[seat.status];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/40 py-6 md:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-700 text-sm font-medium mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          返回座位板
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <div className={cn('p-6 md:p-8 relative overflow-hidden', colors.bg)}>
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/30 rounded-full blur-3xl" />
            <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md bg-white/60')}>
                  <MapPin className={cn('w-7 h-7', colors.text)} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                      {seat.building} {seat.room} 教室
                    </h1>
                    <StatusBadge status={seat.status} />
                  </div>
                  <p className={cn('text-lg font-semibold', colors.text)}>座位号 {seat.seatNumber}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {seat.status !== SeatStatus.EMPTY ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard icon={User} label="使用人" value={seat.registeredBy || '-'} />
                <InfoCard icon={Phone} label="联系方式" value={seat.contact || '-'} />
                <InfoCard
                  icon={Clock}
                  label="登记时间"
                  value={seat.registeredAt ? `${formatDateTime(seat.registeredAt)}（${timeAgo(seat.registeredAt)}）` : '-'}
                />
                <InfoCard
                  icon={AlertTriangle}
                  label="预计离开"
                  value={seat.expectedLeaveAt ? `${formatDateTime(seat.expectedLeaveAt)}（${formatCountdown(seat.expectedLeaveAt)}）` : '-'}
                  highlight={seat.status === SeatStatus.SUSPECTED}
                />
                {seat.status === SeatStatus.TEMP_LEAVE && seat.tempLeaveUntil && (
                  <InfoCard
                    icon={Coffee}
                    label="短暂离开到"
                    value={`${formatDateTime(seat.tempLeaveUntil)}（${formatCountdown(seat.tempLeaveUntil)}）`}
                    highlight
                  />
                )}
              </div>
            ) : (
              <div className="bg-emerald-50 border-2 border-emerald-200 border-dashed rounded-2xl py-10 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="font-bold text-emerald-800 text-lg mb-1">该座位目前空闲</p>
                <p className="text-emerald-700 text-sm">可以前往使用并登记信息</p>
                <button
                  onClick={() => navigate('/register')}
                  className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
                >
                  登记这个座位
                </button>
              </div>
            )}

            {seat.status !== SeatStatus.EMPTY && (
              <div className="pt-2">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">可用操作</h3>
                <div className="flex flex-wrap gap-3">
                  {seat.status === SeatStatus.IN_USE && (
                    <ActionButton
                      onClick={() => setTempLeaveOpen(true)}
                      color="amber"
                      icon={Coffee}
                      label="标记短暂离开"
                      loading={actionLoading === 'temp'}
                    />
                  )}
                  {seat.status === SeatStatus.TEMP_LEAVE && (
                    <ActionButton
                      onClick={handleReturn}
                      color="sky"
                      icon={Undo2}
                      label="我回来了"
                      loading={actionLoading === 'return'}
                    />
                  )}
                  {seat.status === SeatStatus.SUSPECTED && (
                    <ActionButton
                      onClick={() => {
                        setSubmitError('');
                        setFeedbackOpen(true);
                      }}
                      color="rose"
                      icon={Camera}
                      label="拍照反馈举报"
                      loading={actionLoading === 'feedback-open'}
                    />
                  )}
                  {isAdmin && seat.status === SeatStatus.SUSPECTED && (
                    <ActionButton
                      onClick={handleAdminRecover}
                      color="emerald"
                      icon={CheckCircle2}
                      label="[管理员] 恢复座位"
                      loading={actionLoading === 'recover'}
                    />
                  )}
                  <ActionButton
                    onClick={handleRelease}
                    color="slate"
                    icon={LogOut}
                    label="释放/取消登记"
                    loading={actionLoading === 'release'}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={tempLeaveOpen}
        onClose={() => setTempLeaveOpen(false)}
        title="标记短暂离开"
        actions={
          <>
            <button
              onClick={() => setTempLeaveOpen(false)}
              className="px-5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition"
            >
              取消
            </button>
            <button
              onClick={handleMarkTempLeave}
              disabled={!!actionLoading}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold shadow-md shadow-amber-500/30 transition disabled:opacity-60"
            >
              {actionLoading === 'temp' ? '处理中...' : '确认标记'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-slate-600 text-sm">
            短暂离开期间座位会为你保留，请选择你预计离开的时长，超过该时间未返回将自动标记为疑似占座。
          </p>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
              预计离开时长
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[10, 15, 20, 30, 45, 60].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTempLeaveMin(m)}
                  className={cn(
                    'py-3 rounded-xl text-sm font-semibold transition-all border',
                    tempLeaveMin === m
                      ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/30'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50',
                  )}
                >
                  {m} 分钟
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={feedbackOpen}
        onClose={() => {
          setSubmitError('');
          setFeedbackOpen(false);
        }}
        title="反馈疑似占座"
        size="md"
      >
        <div className="space-y-5">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">请如实反馈</p>
                <p>
                  提交后管理员会审核。提供清晰的照片和说明有助于更快处理。恶意反馈将被拒绝。
                </p>
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              你的称呼 <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="方便管理员联系"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              现场照片 <span className="text-xs font-normal text-slate-500 ml-1">（可选，拍照或从相册选）</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple={false}
              onChange={handlePhotoSelect}
              className="hidden"
            />

            {!photoPreview ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative flex flex-col items-center justify-center gap-2 py-6 rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50 hover:bg-sky-100 hover:border-sky-400 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/30 group-hover:scale-105 transition">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-sky-700">拍照</p>
                    <p className="text-xs text-sky-600/80 mt-0.5">调用摄像头</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.removeAttribute('capture');
                      fileInputRef.current.click();
                      fileInputRef.current.setAttribute('capture', 'environment');
                    }
                  }}
                  className="group relative flex flex-col items-center justify-center gap-2 py-6 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 group-hover:scale-105 transition">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-emerald-700">选图</p>
                    <p className="text-xs text-emerald-600/80 mt-0.5">从相册选择</p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="relative group rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50">
                <img
                  src={photoPreview}
                  alt="预览"
                  className="w-full max-h-72 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/95 text-rose-600 flex items-center justify-center shadow-lg hover:bg-rose-500 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="font-medium px-2 py-1 rounded-lg bg-black/40 backdrop-blur">已添加现场照片</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-white/95 text-slate-800 font-semibold hover:bg-white transition"
                  >
                    重新选择
                  </button>
                </div>
              </div>
            )}

            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              支持 JPG/PNG，最大 5MB，图片仅用于管理员核实占座情况
            </p>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              情况说明（可选）
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="描述你看到的情况，例如：只有书包在座位上，人已离开很久..."
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 resize-none"
              />
            </div>
          </div>
        </div>

        {submitError && (
          <div className="mt-5 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-700">提交失败</p>
              <p className="text-xs text-rose-600 mt-0.5">{submitError}</p>
            </div>
            <button
              type="button"
              onClick={() => setSubmitError('')}
              className="text-rose-400 hover:text-rose-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => {
              setSubmitError('');
              setFeedbackOpen(false);
            }}
            className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition"
          >
            <span className="inline-flex items-center gap-1.5">
              <X className="w-4 h-4" /> 取消
            </span>
          </button>
          <button
            onClick={handleSubmitFeedback}
            disabled={!!actionLoading}
            className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-semibold shadow-md shadow-rose-500/30 transition disabled:opacity-60"
          >
            <span className="inline-flex items-center gap-1.5">
              {actionLoading === 'feedback' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              提交反馈
            </span>
          </button>
        </div>
      </Modal>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: any;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl p-4 border transition-all',
        highlight
          ? 'bg-rose-50 border-rose-200'
          : 'bg-slate-50 border-slate-100',
      )}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Icon
          className={cn('w-4 h-4', highlight ? 'text-rose-500' : 'text-slate-400')}
        />
        <p className={cn('text-xs font-semibold uppercase tracking-wider', highlight ? 'text-rose-600' : 'text-slate-500')}>
          {label}
        </p>
      </div>
      <p className={cn('font-semibold text-base', highlight ? 'text-rose-800' : 'text-slate-800')}>
        {value}
      </p>
    </div>
  );
}

type ColorKey = 'amber' | 'sky' | 'rose' | 'emerald' | 'slate';

const colorMap: Record<ColorKey, { bg: string; hover: string; text: string; shadow: string; border?: string }> = {
  amber: { bg: 'bg-amber-500', hover: 'hover:bg-amber-400', text: 'text-white', shadow: 'shadow-amber-500/30' },
  sky: { bg: 'bg-sky-500', hover: 'hover:bg-sky-400', text: 'text-white', shadow: 'shadow-sky-500/30' },
  rose: { bg: 'bg-rose-500', hover: 'hover:bg-rose-400', text: 'text-white', shadow: 'shadow-rose-500/30' },
  emerald: { bg: 'bg-emerald-500', hover: 'hover:bg-emerald-400', text: 'text-white', shadow: 'shadow-emerald-500/30' },
  slate: { bg: 'bg-white', hover: 'hover:bg-slate-50', text: 'text-slate-700', shadow: 'shadow-slate-200/50', border: 'border border-slate-200' },
};

function ActionButton({
  icon: Icon,
  label,
  onClick,
  color,
  loading = false,
}: {
  icon: any;
  label: string;
  onClick: () => void;
  color: ColorKey;
  loading?: boolean;
}) {
  const c = colorMap[color];
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0',
        c.bg, c.hover, c.text, `shadow-${c.shadow}`, c.border,
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
      {label}
    </button>
  );
}
