import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Gauge,
  Star,
  AlertOctagon,
  Check,
  MessageSquare,
  User,
} from 'lucide-react';
import FormField from '@/components/FormField';
import { useStore } from '@/store/useStore';
import { DIFFICULTY_LABELS } from '@/utils/constants';
import { formatDuration } from '@/utils/formatters';
import type { Checkin as CheckinType } from '@/types';

export default function Checkin() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { getRouteById, addCheckin } = useStore();

  const route = getRouteById(id);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<Omit<CheckinType, 'id' | 'date' | 'routeId'>>({
    riderName: '',
    duration: 0,
    avgSpeed: 0,
    difficulty: 3,
    hadFlat: false,
    gotLost: false,
    hadCrash: false,
    notes: '',
  });

  if (!route) {
    return (
      <div className="page-container">
        <div className="container max-w-3xl">
          <p className="text-slate-400">路线不存在</p>
        </div>
      </div>
    );
  }

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.riderName || !form.duration || !form.avgSpeed) return;
    setSubmitting(true);
    setTimeout(() => {
      addCheckin({ ...form, routeId: id });
      navigate(`/route/${id}`);
    }, 500);
  };

  const hasAnyProblem = form.hadFlat || form.gotLost || form.hadCrash;

  return (
    <div className="page-container">
      <div className="container max-w-3xl">
        <button onClick={() => navigate(-1)} className="btn-ghost mb-6 -ml-3">
          <ArrowLeft className="h-4 w-4" />
          返回路线详情
        </button>

        {/* 路线信息概览 */}
        <div className="card-base p-5 mb-8 flex items-center gap-4">
          <img
            src={route.coverImage}
            alt=""
            className="h-20 w-20 rounded-xl object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-lg font-bold text-white truncate">
              {route.name}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {route.startPoint} → {route.endPoint} · {route.distance} km · 爬升 {route.elevation}m
            </p>
          </div>
        </div>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-500 px-4 py-2 text-sm font-semibold text-white mb-4 shadow-lg shadow-violet-900/40">
            <Clock className="h-4 w-4" />
            骑行打卡
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
            记录你的骑行
          </h1>
          <p className="text-slate-400">每一次记录都让这条路线更有价值</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 基本信息 */}
          <div className="card-base p-6 md:p-8">
            <h2 className="font-display text-xl font-bold text-white mb-6">基础数据</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="你的昵称" required>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={form.riderName}
                    onChange={(e) => update('riderName', e.target.value)}
                    placeholder="骑友昵称"
                    className="input-base pl-11"
                    required
                  />
                </div>
              </FormField>

              <FormField
                label="骑行用时 (分钟)"
                required
                hint={form.duration > 0 ? `约 ${formatDuration(form.duration)}` : undefined}
              >
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    value={form.duration || ''}
                    onChange={(e) => update('duration', parseInt(e.target.value) || 0)}
                    placeholder="65"
                    className="input-base pl-11"
                    required
                  />
                </div>
              </FormField>

              <FormField
                label="平均速度 (km/h)"
                required
                hint={
                  form.duration > 0
                    ? `按距离推算约 ${(route.distance / (form.duration / 60)).toFixed(1)} km/h`
                    : undefined
                }
                className="md:col-span-2"
              >
                <div className="relative">
                  <Gauge className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.avgSpeed || ''}
                    onChange={(e) => update('avgSpeed', parseFloat(e.target.value) || 0)}
                    placeholder="14.5"
                    className="input-base pl-11"
                    required
                  />
                </div>
              </FormField>
            </div>
          </div>

          {/* 体感难度 */}
          <div className="card-base p-6 md:p-8">
            <h2 className="font-display text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-400" />
              体感难度
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              综合坡度、风向、体力消耗等因素，整体难度如何？
            </p>

            <div className="grid grid-cols-5 gap-3">
              {([1, 2, 3, 4, 5] as const).map((level) => {
                const active = form.difficulty === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => update('difficulty', level)}
                    className={`flex flex-col items-center gap-2 rounded-2xl p-4 border-2 transition-all ${
                      active
                        ? 'border-amber-500 bg-amber-500/10 scale-[1.02]'
                        : 'border-slate-700 bg-slate-900/40 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-2xl">
                      {'★'.repeat(level)}
                      <span className="opacity-20">{'★'.repeat(5 - level)}</span>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        active ? 'text-amber-300' : 'text-slate-400'
                      }`}
                    >
                      {DIFFICULTY_LABELS[level]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 遇到的问题 */}
          <div className={`card-base p-6 md:p-8 ${hasAnyProblem ? 'border-rose-500/30' : ''}`}>
            <h2 className="font-display text-xl font-bold text-white mb-2 flex items-center gap-2">
              <AlertOctagon className={`h-5 w-5 ${hasAnyProblem ? 'text-rose-400' : 'text-slate-400'}`} />
              遇到的问题
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              帮助其他骑友了解可能的突发状况，可多选
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  key: 'hadFlat' as const,
                  emoji: '💥',
                  label: '爆胎',
                  desc: '扎胎或漏气',
                  color: 'rose',
                },
                {
                  key: 'gotLost' as const,
                  emoji: '🧭',
                  label: '迷路',
                  desc: '绕路或走错',
                  color: 'amber',
                },
                {
                  key: 'hadCrash' as const,
                  emoji: '🩹',
                  label: '摔车',
                  desc: '碰撞或滑倒',
                  color: 'red',
                },
              ].map((item) => {
                const active = form[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => update(item.key, !active)}
                    className={`flex items-start gap-3 rounded-xl p-4 border-2 text-left transition-all ${
                      active
                        ? `border-${item.color}-500/50 bg-${item.color}-500/10`
                        : 'border-slate-700 bg-slate-900/40 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <p
                        className={`font-medium ${
                          active ? `text-${item.color}-300` : 'text-slate-300'
                        }`}
                      >
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    {active && (
                      <Check className={`h-5 w-5 ml-auto mt-0.5 text-${item.color}-400`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 备注 */}
          <div className="card-base p-6 md:p-8">
            <FormField label="骑行感想 / 备注" hint="沿途风景、特殊情况、给其他骑友的建议">
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <textarea
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  rows={4}
                  placeholder="今天天气不错，后半段有树荫很凉快，建议..."
                  className="input-base pl-11 resize-none"
                />
              </div>
            </FormField>
          </div>

          {/* 提交 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
            <Link to={`/route/${id}`} className="btn-secondary">
              取消
            </Link>
            <button
              type="submit"
              className="btn-primary min-w-[180px]"
              disabled={submitting || !form.riderName || !form.duration || !form.avgSpeed}
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  提交打卡
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
