import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Volume2, FileText, Camera, Mic, X, Image, Music } from 'lucide-react';
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

interface AttachedFile {
  name: string;
  url: string;
}

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

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
  const [photos, setPhotos] = useState<AttachedFile[]>([]);
  const [audios, setAudios] = useState<AttachedFile[]>([]);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = location.trim() !== '' && noiseType !== '';

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newPhotos: AttachedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const url = await readFileAsDataUrl(files[i]);
      newPhotos.push({ name: files[i].name, url });
    }
    setPhotos((prev) => [...prev, ...newPhotos]);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newAudios: AttachedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const url = await readFileAsDataUrl(files[i]);
      newAudios.push({ name: files[i].name, url });
    }
    setAudios((prev) => [...prev, ...newAudios]);
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const removeAudio = (index: number) => {
    setAudios((prev) => prev.filter((_, i) => i !== index));
  };

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
      photoUrls: photos.map((p) => p.url),
      audioUrls: audios.map((a) => a.url),
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
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="flex items-center gap-1.5 px-4 py-2 border border-teal-200 rounded-lg text-teal-600 bg-teal-50 hover:bg-teal-100 transition"
            >
              <Camera className="w-4 h-4" />拍照
            </button>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              multiple
              onChange={handleAudioChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              className="flex items-center gap-1.5 px-4 py-2 border border-teal-200 rounded-lg text-teal-600 bg-teal-50 hover:bg-teal-100 transition"
            >
              <Mic className="w-4 h-4" />录音
            </button>
          </div>

          {photos.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <p className="text-[10px] text-gray-400 mt-0.5 w-20 truncate">{photo.name}</p>
                </div>
              ))}
            </div>
          )}

          {audios.length > 0 && (
            <div className="mt-3 space-y-2">
              {audios.map((audio, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <Music className="w-4 h-4 text-teal-500 shrink-0" />
                  <span className="text-sm text-gray-600 truncate flex-1">{audio.name}</span>
                  <audio controls className="h-8 max-w-[140px]" src={audio.url} />
                  <button
                    type="button"
                    onClick={() => removeAudio(index)}
                    className="shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-500 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
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
