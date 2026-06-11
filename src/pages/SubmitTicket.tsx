import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Wrench, Camera, AlertTriangle, Clock, Send, ImagePlus, X } from 'lucide-react';
import { useTicketStore } from '@/store/useTicketStore';
import { BUILDINGS, FAULT_TYPES, TIME_SLOTS } from '@/types';
import type { UrgencyLevel } from '@/types';

export default function SubmitTicket() {
  const navigate = useNavigate();
  const { addTicket, currentUserName } = useTicketStore();

  const [building, setBuilding] = useState(BUILDINGS[0]);
  const [room, setRoom] = useState('');
  const [faultType, setFaultType] = useState(FAULT_TYPES[0]);
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('normal');
  const [jumpReason, setJumpReason] = useState('');

  const handleUrgencyChange = (u: UrgencyLevel) => {
    setUrgency(u);
    if (u === 'normal') setJumpReason('');
  };
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [photos, setPhotos] = useState<{ id: string; url: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleTime = (t: string) => {
    setAvailableTimes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).slice(0, 3 - photos.length).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        if (url) {
          setPhotos((prev) => [...prev, { id: Math.random().toString(36).slice(2), url }]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const addMockPhoto = () => {
    if (photos.length >= 3) return;
    const prompts = ['broken%20dormitory%20bathroom%20leak', 'broken%20electrical%20outlet', 'damaged%20door%20lock'];
    const prompt = prompts[photos.length % prompts.length];
    setPhotos((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        url: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${prompt}&image_size=square`,
      },
    ]);
  };

  const removePhoto = (id: string) => setPhotos((prev) => prev.filter((p) => p.id !== id));

  const submit = () => {
    if (!room.trim() || !description.trim() || availableTimes.length === 0) {
      alert('请填写完整信息（房间号、故障描述、至少一个可上门时间段）');
      return;
    }
    if (urgency === 'urgent' && !jumpReason.trim()) {
      alert('紧急报修必须填写插队原因，请说明紧急情况');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      addTicket(
        {
          studentName: currentUserName,
          building,
          room,
          faultType,
          description,
          photos: photos.map((p, i) => ({
            id: p.id,
            url: p.url,
            uploadedAt: new Date().toISOString(),
            uploader: 'student',
          })),
          urgency,
          availableTimes,
        },
        { jumpReason: urgency === 'urgent' ? jumpReason.trim() : undefined },
      );
      navigate('/');
    }, 600);
  };

  return (
    <div className="min-h-screen grain-bg">
      <div className="container py-6 relative z-10 max-w-3xl">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-ink-400 hover:text-teal-700 mb-6 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>

        <div className="bg-white rounded-2xl shadow-card border border-teal-600/8 overflow-hidden animate-fade-in">
          <div className="p-6 bg-gradient-to-br from-teal-50 to-cream-50 border-b border-teal-600/8">
            <h1 className="font-display text-2xl font-bold text-ink-500 mb-1">提交报修单</h1>
            <p className="text-sm text-ink-300">请填写故障信息，维修员将尽快与您联系</p>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-ink-500 mb-2.5">
                <MapPin className="w-4 h-4 text-teal-600" />
                位置信息 <span className="text-orange-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <select
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-teal-600/10 text-ink-500 font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                  >
                    {BUILDINGS.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="房间号如 302"
                  className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-teal-600/10 text-ink-500 font-medium placeholder:text-ink-200 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-ink-500 mb-2.5">
                <Wrench className="w-4 h-4 text-teal-600" />
                故障类型 <span className="text-orange-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {FAULT_TYPES.map((ft) => (
                  <button
                    key={ft}
                    onClick={() => setFaultType(ft)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      faultType === ft
                        ? 'bg-teal-600 text-white border-teal-600 shadow-card'
                        : 'bg-cream-50 text-ink-400 border-teal-600/10 hover:bg-teal-50 hover:text-teal-700'
                    }`}
                  >
                    {ft}
                  </button>
                ))}
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="请详细描述故障情况..."
                className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-teal-600/10 text-ink-500 placeholder:text-ink-200 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all resize-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-ink-500 mb-2.5">
                <Camera className="w-4 h-4 text-teal-600" />
                现场照片（最多3张，可选）
              </label>
              <div className="flex flex-wrap gap-3">
                {photos.map((p) => (
                  <div key={p.id} className="relative group w-24 h-24 rounded-xl overflow-hidden border border-teal-600/10">
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(p.id)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {photos.length < 3 && (
                  <>
                    <label className="w-24 h-24 rounded-xl border-2 border-dashed border-teal-600/20 flex flex-col items-center justify-center text-ink-200 hover:text-teal-600 hover:border-teal-500 cursor-pointer transition-all">
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                      <ImagePlus className="w-6 h-6 mb-1" />
                      <span className="text-[10px]">上传</span>
                    </label>
                    <button
                      onClick={addMockPhoto}
                      className="w-24 h-24 rounded-xl border-2 border-dashed border-teal-600/20 flex flex-col items-center justify-center text-ink-200 hover:text-teal-600 hover:border-teal-500 transition-all"
                    >
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-[10px]">示例图</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-ink-500 mb-2.5">
                <AlertTriangle className="w-4 h-4 text-teal-600" />
                紧急程度
              </label>
              <div className="flex gap-3">
                {(['normal', 'urgent'] as UrgencyLevel[]).map((u) => (
                  <button
                    key={u}
                    onClick={() => handleUrgencyChange(u)}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold border transition-all ${
                      urgency === u
                        ? u === 'urgent'
                          ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white border-orange-500 shadow-card'
                          : 'bg-teal-600 text-white border-teal-600 shadow-card'
                        : 'bg-cream-50 text-ink-400 border-teal-600/10 hover:bg-teal-50'
                    }`}
                  >
                    {u === 'urgent' ? '🚨 紧急' : '普通'}
                  </button>
                ))}
              </div>
              {urgency === 'urgent' && (
                <div className="mt-3 space-y-2 animate-fade-in">
                  <p className="text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                    紧急工单将优先排队，请务必填写插队原因，方便维修员判断优先级
                  </p>
                  <label className="flex items-center gap-2 text-sm font-semibold text-ink-500">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    插队原因 <span className="text-orange-500">*</span>
                  </label>
                  <textarea
                    value={jumpReason}
                    onChange={(e) => setJumpReason(e.target.value)}
                    rows={2}
                    placeholder="例如：漏水严重影响生活、门锁坏了无法进出等"
                    className="w-full px-4 py-3 rounded-xl bg-orange-50/50 border border-orange-300 text-ink-500 placeholder:text-ink-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-ink-500 mb-2.5">
                <Clock className="w-4 h-4 text-teal-600" />
                可上门时间段 <span className="text-orange-500">*</span>
                <span className="text-xs font-normal text-ink-200 ml-1">（可多选）</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TIME_SLOTS.map((t) => {
                  const active = availableTimes.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => toggleTime(t)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium border text-left transition-all ${
                        active
                          ? 'bg-teal-50 text-teal-700 border-teal-500'
                          : 'bg-cream-50 text-ink-400 border-teal-600/10 hover:bg-teal-50 hover:text-teal-700'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={submit}
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold shadow-card hover:shadow-cardHover hover:translate-y-[-1px] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {submitting ? '提交中...' : '提交报修单'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
