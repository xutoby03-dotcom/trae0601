import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { QrCode, PenOff, PackageOpen, HelpCircle, Send, CheckCircle, ArrowLeft, MapPin } from 'lucide-react';
import { useAppStore } from '@/store';
import { FEEDBACK_TYPE_LABELS } from '@/utils/constants';
import type { FeedbackType } from '@/types';

const feedbackOptions: { type: FeedbackType; icon: typeof PenOff; label: string; desc: string }[] = [
  { type: 'pen_empty', icon: PenOff, label: '白板笔无墨', desc: '白板笔写不出或字迹模糊' },
  { type: 'supply_missing', icon: PackageOpen, label: '用品缺失', desc: '板擦、清洁液等用品找不到' },
  { type: 'other', icon: HelpCircle, label: '其他问题', desc: '其他用品相关问题' },
];

export default function FeedbackForm() {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const fromRoom = searchParams.get('from') === 'room';
  const { rooms, addFeedback } = useAppStore();

  const [step, setStep] = useState<1 | 2 | 3>(roomId ? 2 : 1);
  const [selectedRoom, setSelectedRoom] = useState(roomId || '');
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [description, setDescription] = useState('');
  const [reporter, setReporter] = useState('');

  useEffect(() => {
    if (roomId) {
      setSelectedRoom(roomId);
      setStep(2);
    }
  }, [roomId]);

  const handleSubmit = () => {
    if (selectedRoom && feedbackType) {
      addFeedback({
        roomId: selectedRoom,
        reporter: reporter || '匿名用户',
        type: feedbackType,
        description: description || FEEDBACK_TYPE_LABELS[feedbackType],
      });
      setStep(3);
    }
  };

  const handleBack = () => {
    if (fromRoom && roomId) {
      navigate(`/rooms/${roomId}`);
    } else {
      navigate('/');
    }
  };

  const handleContinueFeedback = () => {
    setFeedbackType(null);
    setDescription('');
    setReporter('');
    if (roomId) {
      setStep(2);
    } else {
      setSelectedRoom('');
      setStep(1);
    }
  };

  const lockedRoom = roomId ? rooms.find((r) => r.id === roomId) : null;

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">反馈已提交！</h2>
          <p className="text-slate-500 mb-8">
            感谢您的反馈，行政人员会尽快处理并补充用品
          </p>
          <div className="space-y-3">
            <button onClick={handleContinueFeedback} className="w-full btn btn-secondary">
              继续反馈
            </button>
            <button onClick={handleBack} className="w-full btn btn-primary">
              {fromRoom ? '返回会议室详情' : '返回首页'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => {
              if (step === 1) {
                handleBack();
              } else if (roomId) {
                handleBack();
              } else {
                setStep((step - 1) as 1 | 2);
              }
            }}
            className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-700 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800">用品反馈</h1>
                <p className="text-xs text-slate-500">
                  {roomId && lockedRoom
                    ? `${lockedRoom.name} · 第 ${step - 1} / 1 步`
                    : `第 ${step} / 2 步 · ${step === 1 ? '选择会议室' : '描述问题'}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 mb-6">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                (roomId ? step > s : step >= s) ? 'bg-primary-600' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {step === 1 ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 mb-2">请选择您所在的会议室</p>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => {
                    setSelectedRoom(room.id);
                    setStep(2);
                  }}
                  className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-4 ${
                    selectedRoom === room.id
                      ? 'bg-primary-700 text-white shadow-lg shadow-primary-700/20'
                      : 'bg-white border border-slate-100 hover:border-primary-200 hover:shadow-sm'
                  }`}
                >
                  <img
                    src={room.photoUrl}
                    alt={room.name}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold ${selectedRoom === room.id ? '' : 'text-slate-800'}`}>
                      {room.name}
                    </p>
                    <p className={`text-sm ${selectedRoom === room.id ? 'text-white/70' : 'text-slate-500'}`}>
                      {room.floor} · {room.capacity}人
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {lockedRoom ? (
              <div className="p-4 rounded-xl bg-primary-50 border border-primary-100 flex items-center gap-3">
                <img
                  src={lockedRoom.photoUrl}
                  alt={lockedRoom.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-primary-800">{lockedRoom.name}</p>
                  <p className="text-sm text-primary-600">
                    {lockedRoom.floor} · {lockedRoom.capacity}人
                  </p>
                </div>
                <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0" />
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const room = rooms.find((r) => r.id === selectedRoom);
                    return room ? (
                      <>
                        <img
                          src={room.photoUrl}
                          alt={room.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <div>
                          <p className="font-medium text-slate-700 text-sm">{room.name}</p>
                          <p className="text-xs text-slate-500">{room.floor}</p>
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-primary-700 hover:text-primary-800 font-medium"
                >
                  更换
                </button>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">选择问题类型</p>
              <div className="space-y-2">
                {feedbackOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = feedbackType === opt.type;
                  return (
                    <button
                      key={opt.type}
                      onClick={() => setFeedbackType(opt.type)}
                      className={`w-full p-4 rounded-xl text-left transition-all flex items-start gap-4 ${
                        isActive
                          ? 'bg-primary-700 text-white shadow-lg shadow-primary-700/20'
                          : 'bg-white border border-slate-100 hover:border-primary-200'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isActive ? 'bg-white/20' : 'bg-primary-50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-primary-600'}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${isActive ? '' : 'text-slate-800'}`}>
                          {opt.label}
                        </p>
                        <p className={`text-sm mt-0.5 ${isActive ? 'text-white/70' : 'text-slate-500'}`}>
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">详细描述（可选）</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="请描述具体的问题情况..."
                rows={3}
                className="input-field resize-none"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">您的姓名（可选）</p>
              <input
                type="text"
                value={reporter}
                onChange={(e) => setReporter(e.target.value)}
                placeholder="方便后续跟进"
                className="input-field"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!feedbackType}
              className="w-full btn btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              提交反馈
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
