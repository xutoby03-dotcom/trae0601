import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Send, CheckCircle, MapPin } from 'lucide-react';
import { useFeedbackStore } from '@/store/useFeedbackStore';
import { NoiseTypeSelector } from './NoiseTypeSelector';
import { PhotoUploader } from './PhotoUploader';
import type { NoiseType } from '@/types';
import { FLOOR_LABELS, ZONE_LABELS } from '@/types';

interface FeedbackFormProps {
  seatId: string;
}

export function FeedbackForm({ seatId }: FeedbackFormProps) {
  const navigate = useNavigate();
  const { getSeatById, submitFeedback } = useFeedbackStore();
  const seat = getSeatById(seatId);

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
