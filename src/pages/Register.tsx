import { useEffect, useState } from 'react';
import { useAppStore, api } from '@/store/appStore';
import SessionSelector from '@/components/SessionSelector';
import type { Session } from '../../shared/types';
import {
  Users,
  Baby,
  Heart,
  Accessibility,
  User,
  Phone,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Ticket,
} from 'lucide-react';

const steps = [
  { id: 1, label: '选择场次' },
  { id: 2, label: '填写信息' },
  { id: 3, label: '报名成功' },
];

export default function Register() {
  const { sessions, selectedSessionId, fetchSessions, fetchRegistrations } = useAppStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    sessionId: '',
    name: '',
    phone: '',
    peopleCount: 2,
    elderlyCount: 0,
    childCount: 0,
    needWheelchair: false,
  });
  const [result, setResult] = useState<{ area: string; id: string } | null>(null);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (selectedSessionId) {
      setForm((f) => ({ ...f, sessionId: selectedSessionId }));
    }
  }, [selectedSessionId]);

  const currentSession = sessions.find((s) => s.id === form.sessionId);

  const goStep2 = () => {
    if (!form.sessionId) {
      alert('请先选择场次');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || form.peopleCount < 1) {
      alert('请填写完整信息');
      return;
    }
    if (form.elderlyCount + form.childCount > form.peopleCount) {
      alert('老人和小孩数量不能超过总人数');
      return;
    }
    const reg = await api<any>('/api/registrations', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    setResult({ area: reg.area, id: reg.id });
    fetchRegistrations(form.sessionId);
    setStep(3);
  };

  const reset = () => {
    setStep(1);
    setForm({
      sessionId: selectedSessionId || '',
      name: '',
      phone: '',
      peopleCount: 2,
      elderlyCount: 0,
      childCount: 0,
      needWheelchair: false,
    });
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-night-teal-800 mb-1">居民报名</h1>
        <p className="text-night-teal-500">在线报名参与社区露天电影，自动分配最佳座位区域</p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full transition-all ${
                step >= s.id
                  ? 'bg-night-teal-800 text-white shadow-lg'
                  : 'bg-white border border-night-teal-100 text-night-teal-400'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s.id ? 'bg-warm-orange-500 text-white' : 'bg-night-teal-100 text-night-teal-500'
                }`}
              >
                {s.id}
              </span>
              <span className="font-medium">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-12 h-1 mx-2 rounded-full ${
                  step > s.id ? 'bg-warm-orange-400' : 'bg-night-teal-100'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {step === 1 && <Step1 sessions={sessions} currentSession={currentSession} onNext={goStep2} form={form} setForm={setForm} />}
      {step === 2 && <Step2 form={form} setForm={setForm} onBack={() => setStep(1)} onSubmit={handleSubmit} session={currentSession} />}
      {step === 3 && result && <Step3 result={result} form={form} session={currentSession} onReset={reset} />}
    </div>
  );
}

function Step1({
  sessions,
  currentSession,
  onNext,
  form,
  setForm,
}: {
  sessions: Session[];
  currentSession?: Session;
  onNext: () => void;
  form: any;
  setForm: (f: any) => void;
}) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card p-6 opacity-0 animate-fade-in-up stagger-1">
        <h2 className="font-display text-xl text-night-teal-800 mb-4 flex items-center gap-2">
          <Ticket className="text-warm-orange-500" size={22} />
          选择电影场次
        </h2>
        <SessionSelector />
      </div>

      {currentSession && (
        <div className="card p-6 opacity-0 animate-fade-in-up stagger-2">
          <div className="flex gap-5">
            <div className="w-36 h-28 rounded-2xl overflow-hidden bg-night-teal-100 shrink-0">
              {currentSession.photo ? (
                <img src={currentSession.photo} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">🎬</div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-display text-2xl text-night-teal-800 mb-2">{currentSession.title}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-night-teal-500">📅 {currentSession.date} {currentSession.time}</p>
                <p className="text-night-teal-500">📍 {currentSession.venue}</p>
                <p className="text-night-teal-500">👥 预计 {currentSession.expectedPeople} 人</p>
                <p className="text-night-teal-500">🌤️ {currentSession.weather}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <button onClick={onNext} className="btn-primary text-lg !px-8 !py-3 flex items-center gap-2">
          下一步：填写信息 <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

function Step2({
  form,
  setForm,
  onBack,
  onSubmit,
  session,
}: {
  form: any;
  setForm: (f: any) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  session?: Session;
}) {
  return (
    <form onSubmit={onSubmit} className="max-w-3xl mx-auto">
      <div className="card p-8 opacity-0 animate-fade-in-up stagger-1 space-y-6">
        {session && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-cream/70 border border-night-teal-50">
            <span className="text-2xl">🎬</span>
            <div>
              <p className="font-medium text-night-teal-800">{session.title}</p>
              <p className="text-sm text-night-teal-500">{session.date} {session.time} · {session.venue}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="label-field flex items-center gap-1.5">
              <User size={14} /> 联系人姓名 *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="请输入您的姓名"
              className="input-field"
            />
          </div>
          <div>
            <label className="label-field flex items-center gap-1.5">
              <Phone size={14} /> 联系电话 *
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="请输入手机号码"
              className="input-field"
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-night-teal-50 to-cream">
          <p className="font-medium text-night-teal-800 mb-4 flex items-center gap-2">
            <Users size={18} className="text-night-teal-600" />
            人员情况
          </p>

          <div className="space-y-4">
            <div>
              <label className="label-field">总人数 *</label>
              <div className="flex items-center gap-4">
                <CounterButton
                  value={form.peopleCount}
                  onChange={(v) => setForm({ ...form, peopleCount: Math.max(1, v) })}
                  min={1}
                />
                <span className="text-sm text-night-teal-500">人（含老人和小孩）</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-field flex items-center gap-1.5">
                  <Heart size={14} className="text-warm-orange-500" /> 老人数量
                </label>
                <CounterButton
                  value={form.elderlyCount}
                  onChange={(v) => setForm({ ...form, elderlyCount: Math.max(0, v) })}
                />
                <p className="text-xs text-night-teal-400 mt-1">年满65岁以上，将安排A区前排</p>
              </div>
              <div>
                <label className="label-field flex items-center gap-1.5">
                  <Baby size={14} className="text-night-teal-500" /> 小孩数量
                </label>
                <CounterButton
                  value={form.childCount}
                  onChange={(v) => setForm({ ...form, childCount: Math.max(0, v) })}
                />
                <p className="text-xs text-night-teal-400 mt-1">12岁以下，提供儿童椅</p>
              </div>
            </div>

            <label className="flex items-center gap-3 p-4 rounded-xl bg-white border-2 border-night-teal-100 cursor-pointer hover:border-warm-orange-300 transition-colors">
              <input
                type="checkbox"
                checked={form.needWheelchair}
                onChange={(e) => setForm({ ...form, needWheelchair: e.target.checked })}
                className="w-5 h-5 rounded accent-warm-orange-500"
              />
              <div className="flex items-center gap-2">
                <Accessibility size={18} className="text-forest" />
                <span className="font-medium text-night-teal-800">需要无障碍轮椅位</span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <button type="button" onClick={onBack} className="btn-outline">
            返回
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Sparkles size={18} />
            提交报名
          </button>
        </div>
      </div>
    </form>
  );
}

function Step3({
  result,
  form,
  session,
  onReset,
}: {
  result: { area: string; id: string };
  form: any;
  session?: Session;
  onReset: () => void;
}) {
  const areaInfo = {
    A: { label: 'A区 · 老人亲子区', desc: '前排靠近屏幕，观影体验最佳', color: 'from-warm-orange-400 to-warm-orange-600' },
    B: { label: 'B区 · 普通观众区', desc: '中部观影区域', color: 'from-night-teal-500 to-night-teal-700' },
    C: { label: 'C区 · 野餐垫区', desc: '后方草坪区域，可铺野餐垫', color: 'from-forest to-forest/80' },
    wheelchair: { label: '♿ 无障碍专区', desc: '入口侧预留轮椅位，出入便利', color: 'from-night-teal-400 to-night-teal-600' },
  };
  const info = areaInfo[result.area as keyof typeof areaInfo];

  return (
    <div className="max-w-xl mx-auto">
      <div className="card p-10 text-center opacity-0 animate-fade-in-up stagger-1">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-forest to-forest/80 flex items-center justify-center shadow-glow animate-pulse-ring">
          <CheckCircle size={52} className="text-white" />
        </div>

        <h2 className="font-display text-3xl text-night-teal-800 mb-2">报名成功！</h2>
        <p className="text-night-teal-500 mb-8">请按时到场，我们为您预留了座位</p>

        <div className="rounded-2xl overflow-hidden border-2 border-night-teal-100 mb-8 text-left">
          <div className={`bg-gradient-to-r ${info.color} p-5 text-white`}>
            <p className="font-display text-xl">{session?.title || '露天电影'}</p>
            <p className="text-white/80 text-sm">
              {session?.date} {session?.time} · {session?.venue}
            </p>
          </div>
          <div className="p-6 space-y-3 bg-cream/30">
            <InfoRow label="姓名" value={form.name} />
            <InfoRow label="联系电话" value={form.phone} />
            <InfoRow label="总人数" value={`${form.peopleCount} 人`} />
            <InfoRow label="分配区域" value={info.label} highlight />
            <p className="text-sm text-night-teal-500 pt-2 border-t border-night-teal-100">💡 {info.desc}</p>
          </div>
        </div>

        <button onClick={onReset} className="btn-secondary flex items-center gap-2 mx-auto">
          <Sparkles size={18} />
          再报名一场
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-night-teal-500">{label}</span>
      <span className={`font-medium ${highlight ? 'text-warm-orange-600 font-display text-lg' : 'text-night-teal-800'}`}>
        {value}
      </span>
    </div>
  );
}

function CounterButton({
  value,
  onChange,
  min = 0,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        className="w-10 h-10 rounded-xl border-2 border-night-teal-200 text-night-teal-700 hover:bg-night-teal-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all"
      >
        <span className="text-xl font-bold">−</span>
      </button>
      <span className="font-display text-2xl text-night-teal-800 w-10 text-center">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-10 h-10 rounded-xl bg-night-teal-800 text-white hover:bg-night-teal-900 flex items-center justify-center transition-all"
      >
        <span className="text-xl font-bold">+</span>
      </button>
    </div>
  );
}
