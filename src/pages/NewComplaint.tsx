import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Volume2, FileText, Camera, Mic, CheckCircle } from 'lucide-react';
import { useComplaintStore } from '@/store/useComplaintStore';
import type { NoiseType, DecibelLevel } from '@/types';
import { NOISE_TYPE_LABELS, DECIBEL_LABELS, DECIBEL_COLORS } from '@/types';

const now = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const NOISE_TYPES: NoiseType[] = ['renovation', 'singing', 'speaker', 'pet', 'other'];
const DECIBEL_LEVELS: DecibelLevel[] = ['quiet', 'moderate', 'loud', 'extreme'];

export default function NewComplaint() {
  const navigate = useNavigate();
  const addComplaint = useComplaintStore((s) => s.addComplaint);

  const [noiseTime, setNoiseTime] = useState(now());
  const [location, setLocation] = useState('');
  const [noiseType, setNoiseType] = useState<NoiseType | ''>('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [decibelLevel, setDecibelLevel] = useState<DecibelLevel>('moderate');
  const [affectsRest, setAffectsRest] = useState(false);
  const [notes, setNotes] = useState('');

  const canSubmit = location.trim() !== '' && noiseType !== '';

  const handleSubmit = () => {
    if (!canSubmit) return;
    addComplaint({
      location: location.trim(),
      noiseType,
      noiseTime,
      durationMinutes: durationMinutes ? Number(durationMinutes) : 0,
      decibelLevel,
      affectsRest,
      notes,
      photoUrls: [],
      audioUrls: [],
      status: 'ongoing',
    });
    navigate('/');
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">记录噪音</h1>
      </div>

      <div className="space-y-5">
        <div>
          <label className="flex items-center gap-1.5 text-sm text-gray-500 mb-1.5">
            <Clock className="w-4 h-4" />噪音时间
          </label>
          <input
            type="datetime-local"
            value={noiseTime}
            onChange={(e) => setNoiseTime(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm text-gray-500 mb-1.5">
            <MapPin className="w-4 h-4" />位置
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="如：3栋2单元1502"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm text-gray-500 mb-1.5">
            <Volume2 className="w-4 h-4" />噪音类型
          </label>
          <select
            value={noiseType}
            onChange={(e) => setNoiseType(e.target.value as NoiseType)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            <option value="" disabled>请选择噪音类型</option>
            {NOISE_TYPES.map((t) => (
              <option key={t} value={t}>{NOISE_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-500 mb-1.5 block">持续时长</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              min={0}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <span className="text-sm text-gray-500 whitespace-nowrap">分钟</span>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm text-gray-500 mb-1.5">
            <Volume2 className="w-4 h-4" />分贝估计
          </label>
          <div className="flex gap-2 flex-wrap">
            {DECIBEL_LEVELS.map((level) => {
              const selected = decibelLevel === level;
              const colorClass = DECIBEL_COLORS[level];
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDecibelLevel(level)}
                  className={`px-3 py-1.5 rounded-full border text-sm font-medium ${colorClass} ${selected ? 'border-current bg-opacity-10 bg-current' : 'border-gray-200'}`}
                >
                  {DECIBEL_LABELS[level]}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="flex items-center justify-between text-sm text-gray-500">
            <span>是否影响休息</span>
            <button
              type="button"
              onClick={() => setAffectsRest(!affectsRest)}
              className={`relative w-11 h-6 rounded-full transition-colors ${affectsRest ? 'bg-teal-600' : 'bg-gray-300'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${affectsRest ? 'translate-x-5' : ''}`}
              />
            </button>
          </label>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm text-gray-500 mb-1.5">
            <FileText className="w-4 h-4" />备注
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500 mb-1.5 block">照片/录音</label>
          <div className="flex gap-3">
            <button
              type="button"
              disabled
              className="flex items-center gap-1.5 px-4 py-2 border rounded-lg text-gray-400 bg-gray-50 cursor-not-allowed"
            >
              <Camera className="w-4 h-4" />拍照
            </button>
            <button
              type="button"
              disabled
              className="flex items-center gap-1.5 px-4 py-2 border rounded-lg text-gray-400 bg-gray-50 cursor-not-allowed"
            >
              <Mic className="w-4 h-4" />录音
            </button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full bg-teal-600 text-white py-2.5 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          提交投诉
        </button>
      </div>
    </div>
  );
}
