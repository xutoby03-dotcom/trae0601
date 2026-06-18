import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Send, CheckCircle, MapPin, AlertTriangle, Check } from 'lucide-react';
import { useFeedbackStore } from '@/store/useFeedbackStore';
import { NoiseTypeSelector } from './NoiseTypeSelector';
import { PhotoUploader } from './PhotoUploader';
import type { NoiseType } from '@/types';
import { FLOOR_LABELS, ZONE_LABELS, NOISE_TYPE_LABELS } from '@/types';

interface FeedbackFormProps {
  seatId: string;
}

const typeColors: Record<NoiseType, string> = {
  call: 'bg-red-50 border-red-200 text-red-700',
  keyboard: 'bg-amber-50 border-amber-200 text-amber-700',
  eating: 'bg-orange-50 border-orange-200 text-orange-700',
  occupied: 'bg-purple-50 border-purple-200 text-purple-700',
  talking: 'bg-blue-50 border-blue-200 text-blue-700',
  equipment: 'bg-teal-50 border-teal-200 text-teal-700',
};

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  return `${hours} 小时前`;
}

export function FeedbackForm({ seatId }: FeedbackFormProps) {
  const navigate = useNavigate();
  const { getSeatById, submitFeedback, feedbacks } = useFeedbackStore();
  const seat = getSeatById(seatId);

  const recentFeedbacks = useMemo(() => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const seatFeedbacks = feedbacks.filter(
      (f) => f.seatId === seatId && new Date(f.submitTime).getTime() > twoHoursAgo
    );
    const grouped = new Map<
      NoiseType,
      { count: number; latestTime: string }
    >();
    seatFeedbacks.forEach((f) => {
      const existing = grouped.get(f.noiseType);
      if (!existing) {
        grouped.set(f.noiseType, { count: 1, latestTime: f.submitTime });
      } else {
        grouped.set(f.noiseType, {
          count: existing.count + 1,
          latestTime:
            new Date(f.submitTime).getTime() > new Date(existing.latestTime).getTime()
              ? f.submitTime
              : existing.latestTime,
        });
      }
    });
    return Array.from(grouped.entries()).sort((a, b) => b[1].count - a[1].count);
  }, [feedbacks, seatId]);

  const [noiseType, setNoiseType] = useState<NoiseType | null>(null);
  const [occurTime, setOccurTime] = useState(() => {
    const now = new Date();
    now.setMinutes(Math.floor(now.getMinutes() / 5) * 5);
    return now.toISOString().slice(0, 16);
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [reporterName, setReporterName] = useState('');
  const [reporterId, setReporterId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!seat) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>未找到该座位信息</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noiseType || !reporterName || !reporterId) return;

    submitFeedback({
      seatId,
      noiseType,
      occurTime: new Date(occurTime).toISOString(),
      photos,
      reporterId,
      reporterName,
    });

    setSubmitted(true);
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-12 animate-fadeIn">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">反馈提交成功</h3>
        <p className="text-slate-500">管理员将尽快处理，感谢您的反馈</p>
        <p className="text-sm text-slate-400 mt-2">即将返回座位图...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-teal-50 rounded-xl p-4 flex items-center gap-3">
        <MapPin className="w-5 h-5 text-teal-600 flex-shrink-0" />
        <div>
          <div className="text-sm text-teal-800 font-medium">
            {FLOOR_LABELS[seat.floor]} {ZONE_LABELS[seat.zone]} {seat.deskNumber}号桌 {seat.seatNumber}号座
          </div>
          <div className="text-xs text-teal-600">
            {seat.isOccupied ? '当前有人' : '当前空闲'}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          噪音类型 <span className="text-red-500">*</span>
        </label>

        {recentFeedbacks.length > 0 ? (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-100/70 border-b border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span className="text-sm font-medium text-amber-800">
                该座位近 2 小时已有 {recentFeedbacks.reduce((s, [, v]) => s + v.count, 0)} 条反馈记录
              </span>
            </div>
            <div className="px-3 py-2.5 flex flex-wrap gap-2">
              {recentFeedbacks.map(([type, info]) => (
                <div
                  key={type}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${typeColors[type]}`}
                >
                  <span>{NOISE_TYPE_LABELS[type]}</span>
                  <span className="px-1 rounded bg-white/60">{info.count} 次</span>
                  <span className="opacity-70">· {formatRelativeTime(info.latestTime)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="text-sm text-emerald-800">近 2 小时暂无重复反馈记录</span>
          </div>
        )}

        <NoiseTypeSelector value={noiseType} onChange={setNoiseType} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          <Clock className="w-4 h-4 inline mr-1" />
          发生时间 <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          value={occurTime}
          onChange={(e) => setOccurTime(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">现场照片</label>
        <PhotoUploader value={photos} onChange={setPhotos} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            您的学号 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={reporterId}
            onChange={(e) => setReporterId(e.target.value)}
            placeholder="请输入学号"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            您的姓名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={reporterName}
            onChange={(e) => setReporterName(e.target.value)}
            placeholder="请输入姓名"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!noiseType || !reporterName || !reporterId}
        className="w-full py-4 bg-teal-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-teal-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
      >
        <Send className="w-5 h-5" />
        提交反馈
      </button>
    </form>
  );
}
