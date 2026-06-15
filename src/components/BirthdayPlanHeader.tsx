import React from 'react';
import { usePlanStore } from '../store/usePlanStore';
import { Calendar, MapPin, Wallet, Shield, Sparkles, PartyPopper, Star } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils';
import { SECRECY_LEVEL_META, SecrecyLevel } from '../types';
import { ParticipantList } from './ParticipantList';

export const BirthdayPlanHeader: React.FC = () => {
  const plan = usePlanStore((s) => s.plan);
  const revealSecrets = usePlanStore((s) => s.revealSecrets);
  const setRevealSecrets = usePlanStore((s) => s.setRevealSecrets);
  const updatePlanHeader = usePlanStore((s) => s.updatePlanHeader);

  const secrecyMeta = SECRECY_LEVEL_META[plan.secrecyLevel];

  const usedBudget = plan.tasks.reduce((sum, t) => sum + (t.budget || 0), 0);
  const budgetPercent = plan.totalBudget > 0 ? Math.min(100, (usedBudget / plan.totalBudget) * 100) : 0;

  return (
    <header className="relative overflow-hidden rounded-3xl shadow-card bg-gradient-hero text-white mb-8 animate-fade-in-up">
      {/* Decorative elements */}
      <div className="absolute -top-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute top-20 -right-10 w-40 h-40 bg-cream-300/20 rounded-full blur-2xl"></div>
      <div className="absolute top-16 right-24 text-4xl animate-float" style={{ animationDelay: '0s' }}>🎈</div>
      <div className="absolute top-8 right-56 text-3xl animate-float-slow" style={{ animationDelay: '1s' }}>🎊</div>
      <div className="absolute bottom-4 left-24 text-3xl animate-float" style={{ animationDelay: '0.5s' }}>🎁</div>
      <div className="absolute bottom-8 left-48 text-2xl animate-float-slow" style={{ animationDelay: '1.5s' }}>✨</div>

      <div className="relative p-8 md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <PartyPopper className="w-6 h-6" />
              <h1 className="font-display text-3xl md:text-4xl tracking-wide">
                {plan.mainCharacter ? `${plan.mainCharacter}的生日惊喜` : '生日惊喜计划'}
              </h1>
            </div>
            <p className="text-white/80 text-sm md:text-base">
              小群分工协作 · 别让主角发现 🤫 · 给她一个难忘的生日
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm border border-white/20`}>
              <span className="mr-1">{secrecyMeta.emoji}</span>
              {secrecyMeta.label}
            </span>
            <button
              onClick={() => setRevealSecrets(!revealSecrets)}
              className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border transition-all ${
                revealSecrets
                  ? 'bg-white text-coral-600 border-white shadow-lg scale-105'
                  : 'bg-white/20 text-white border-white/20 hover:bg-white/30'
              }`}
            >
              {revealSecrets ? '🙈 隐藏保密内容' : '👁️ 查看保密内容'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <EditableField
            icon={<Calendar className="w-4 h-4" />}
            label="生日日期"
            value={formatDate(plan.date)}
            inputType="date"
            rawValue={plan.date}
            onChange={(v) => updatePlanHeader({ date: v })}
          />
          <EditableField
            icon={<MapPin className="w-4 h-4" />}
            label="集合地点"
            value={plan.meetingPoint || '点击设置集合点'}
            onChange={(v) => updatePlanHeader({ meetingPoint: v })}
          />
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-2 text-white/80 text-xs mb-2">
              <Wallet className="w-4 h-4" />
              <span>总预算 · 已用 {budgetPercent.toFixed(0)}%</span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold">{formatCurrency(usedBudget)}</span>
              <input
                type="number"
                value={plan.totalBudget}
                onChange={(e) => updatePlanHeader({ totalBudget: Number(e.target.value) || 0 })}
                className="w-24 bg-white/10 rounded-lg px-2 py-1 text-sm text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-white/50"
                placeholder="总预算"
              />
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-cream-400 rounded-full transition-all duration-500"
                style={{ width: `${budgetPercent}%` }}
              />
            </div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-2 text-white/80 text-xs mb-3">
              <Shield className="w-4 h-4" />
              <span>保密等级</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(['normal', 'high', 'extreme'] as SecrecyLevel[]).map((lv) => (
                <button
                  key={lv}
                  onClick={() => updatePlanHeader({ secrecyLevel: lv })}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    plan.secrecyLevel === lv
                      ? 'bg-white text-coral-600 shadow-md scale-105'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {SECRECY_LEVEL_META[lv].emoji} {SECRECY_LEVEL_META[lv].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <ParticipantList />
      </div>
    </header>
  );
};

interface EditableFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  rawValue?: string;
  inputType?: string;
  onChange: (v: string) => void;
}

const EditableField: React.FC<EditableFieldProps> = ({ icon, label, value, rawValue, inputType = 'text', onChange }) => {
  const [editing, setEditing] = React.useState(false);
  const [temp, setTemp] = React.useState(rawValue || value);

  React.useEffect(() => {
    setTemp(rawValue || value);
  }, [rawValue, value]);

  const submit = () => {
    onChange(temp);
    setEditing(false);
  };

  return (
    <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20 group">
      <div className="flex items-center gap-2 text-white/80 text-xs mb-2">
        {icon}
        <span>{label}</span>
        <Sparkles className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      {editing ? (
        <div className="flex gap-2">
          <input
            type={inputType}
            value={temp}
            onChange={(e) => setTemp(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            onBlur={submit}
            autoFocus
            className="flex-1 min-w-0 bg-white rounded-lg px-3 py-1.5 text-sm text-slate2-800 focus:outline-none focus:ring-2 focus:ring-cream-400"
          />
          <button
            onClick={submit}
            className="px-2 py-1 bg-cream-400 text-slate2-800 rounded-lg text-xs font-bold"
          >
            ✓
          </button>
        </div>
      ) : (
        <div
          onClick={() => setEditing(true)}
          className="text-lg md:text-xl font-bold cursor-pointer hover:text-cream-200 transition-colors truncate"
          title="点击编辑"
        >
          {value || <span className="text-white/50 text-base">点击设置</span>}
          <Star className="w-3 h-3 inline-block ml-1 opacity-40" />
        </div>
      )}
    </div>
  );
};
