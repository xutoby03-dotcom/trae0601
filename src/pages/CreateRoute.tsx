import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Mountain, Upload, Check, ArrowLeft, Route as RouteIcon } from 'lucide-react';
import FormField from '@/components/FormField';
import RiskBadge from '@/components/RiskBadge';
import { useStore } from '@/store/useStore';
import {
  CATEGORY_LABELS,
  RISK_LABELS,
  SUPPLY_LABELS,
  ROAD_CONDITION_LABELS,
} from '@/utils/constants';
import type {
  RouteCategory,
  RiskType,
  SupplyType,
  RoadCondition,
  Route,
} from '@/types';

export default function CreateRoute() {
  const navigate = useNavigate();
  const { addRoute } = useStore();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<Omit<Route, 'id' | 'createdAt'>>({
    name: '',
    startPoint: '',
    endPoint: '',
    distance: 0,
    elevation: 0,
    roadCondition: 'asphalt',
    hasSupply: false,
    supplyTypes: [],
    coverImage: '',
    photos: [],
    risks: [],
    category: 'easy',
    description: '',
  });

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const toggleArray = <T,>(arr: T[], value: T): T[] => {
    return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.startPoint || !form.endPoint) return;
    setSubmitting(true);

    if (!form.coverImage) {
      form.coverImage =
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' +
        encodeURIComponent(`cycling route ${form.name} landscape scenic road`) +
        '&image_size=landscape_16_9';
    }

    setTimeout(() => {
      addRoute(form);
      navigate('/');
    }, 600);
  };

  return (
    <div className="page-container">
      <div className="container max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost mb-6 -ml-3"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </button>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white mb-4 shadow-lg shadow-emerald-900/40">
            <RouteIcon className="h-4 w-4" />
            创建新路线
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
            分享一条骑行路线
          </h1>
          <p className="text-slate-400">
            详细的信息能帮助其他骑友更安全、更愉快地出行
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 基本信息 */}
          <div className="card-base p-6 md:p-8">
            <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 text-sm">
                1
              </span>
              基本信息
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="路线名称" required className="md:col-span-2">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="例：滨江绿道休闲骑"
                  className="input-base"
                  required
                />
              </FormField>

              <FormField label="起点" required>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-400" />
                  <input
                    type="text"
                    value={form.startPoint}
                    onChange={(e) => update('startPoint', e.target.value)}
                    placeholder="起点位置"
                    className="input-base pl-11"
                    required
                  />
                </div>
              </FormField>

              <FormField label="终点" required>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-rose-400" />
                  <input
                    type="text"
                    value={form.endPoint}
                    onChange={(e) => update('endPoint', e.target.value)}
                    placeholder="终点位置"
                    className="input-base pl-11"
                    required
                  />
                </div>
              </FormField>

              <FormField label="距离 (公里)" required hint="预估总里程">
                <div className="relative">
                  <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.distance || ''}
                    onChange={(e) => update('distance', parseFloat(e.target.value) || 0)}
                    placeholder="15.5"
                    className="input-base pl-11"
                    required
                  />
                </div>
              </FormField>

              <FormField label="累计爬升 (米)" hint="0 表示全程平路">
                <div className="relative">
                  <Mountain className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    value={form.elevation || ''}
                    onChange={(e) => update('elevation', parseInt(e.target.value) || 0)}
                    placeholder="120"
                    className="input-base pl-11"
                  />
                </div>
              </FormField>
            </div>
          </div>

          {/* 路况与分类 */}
          <div className="card-base p-6 md:p-8">
            <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 text-sm">
                2
              </span>
              路况与分类
            </h2>

            <div className="space-y-6">
              <FormField label="路面情况" required>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(Object.entries(ROAD_CONDITION_LABELS) as [RoadCondition, typeof ROAD_CONDITION_LABELS[RoadCondition]][]).map(
                    ([key, val]) => {
                      const active = form.roadCondition === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => update('roadCondition', key)}
                          className={`flex flex-col items-center gap-2 rounded-xl p-4 border-2 transition-all ${
                            active
                              ? 'border-emerald-500 bg-emerald-500/10'
                              : 'border-slate-700 bg-slate-900/40 hover:border-slate-600'
                          }`}
                        >
                          <span className="text-2xl">{val.emoji}</span>
                          <span
                            className={`text-sm font-medium ${
                              active ? 'text-emerald-400' : 'text-slate-300'
                            }`}
                          >
                            {val.label}
                          </span>
                          {active && <Check className="h-4 w-4 text-emerald-400" />}
                        </button>
                      );
                    }
                  )}
                </div>
              </FormField>

              <FormField label="路线分类" required hint="帮助其他骑友快速找到适合的路线">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(Object.entries(CATEGORY_LABELS) as [RouteCategory, typeof CATEGORY_LABELS[RouteCategory]][]).map(
                    ([key, val]) => {
                      const active = form.category === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => update('category', key)}
                          className={`flex items-center gap-2 rounded-xl px-4 py-3 border-2 transition-all ${
                            active
                              ? `border-transparent bg-gradient-to-r ${val.color} text-white shadow-lg`
                              : 'border-slate-700 bg-slate-900/40 hover:border-slate-600 text-slate-300'
                          }`}
                        >
                          <span className="text-xl">{val.emoji}</span>
                          <span className="font-medium text-sm">{val.label}</span>
                        </button>
                      );
                    }
                  )}
                </div>
              </FormField>
            </div>
          </div>

          {/* 补给点 */}
          <div className="card-base p-6 md:p-8">
            <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 text-sm">
                3
              </span>
              沿途补给
            </h2>

            <FormField label="是否有补给点">
              <label className="inline-flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={form.hasSupply}
                    onChange={(e) => {
                      update('hasSupply', e.target.checked);
                      if (!e.target.checked) update('supplyTypes', []);
                    }}
                  />
                  <div className="w-12 h-7 bg-slate-700 rounded-full peer-checked:bg-emerald-500 transition-colors" />
                  <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </div>
                <span className="text-slate-300">
                  {form.hasSupply ? '有补给点' : '无补给 (自备)'}
                </span>
              </label>
            </FormField>

            {form.hasSupply && (
              <div className="mt-5">
                <p className="text-sm text-slate-400 mb-3">选择沿途可获得的补给类型：</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(Object.entries(SUPPLY_LABELS) as [SupplyType, typeof SUPPLY_LABELS[SupplyType]][]).map(
                    ([key, val]) => {
                      const active = form.supplyTypes.includes(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => update('supplyTypes', toggleArray(form.supplyTypes, key))}
                          className={`flex items-center gap-2 rounded-xl px-4 py-3 border transition-all ${
                            active
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                              : 'border-slate-700 bg-slate-900/40 hover:border-slate-600 text-slate-400'
                          }`}
                        >
                          <span>{val.emoji}</span>
                          <span className="text-sm font-medium">{val.label}</span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 风险提醒 */}
          <div className="card-base p-6 md:p-8 border-amber-500/20">
            <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 text-sm">
                ⚠️
              </span>
              安全风险提醒
            </h2>
            <p className="text-sm text-slate-400 mb-5">
              请勾选可能遇到的风险，帮助其他骑友提前做好准备：
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(Object.entries(RISK_LABELS) as [RiskType, typeof RISK_LABELS[RiskType]][]).map(
                ([key, val]) => {
                  const active = form.risks.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => update('risks', toggleArray(form.risks, key))}
                      className={`flex items-start gap-3 rounded-xl p-4 border text-left transition-all ${
                        active
                          ? val.level === 'danger'
                            ? 'border-red-500/50 bg-red-500/10'
                            : 'border-amber-500/50 bg-amber-500/10'
                          : 'border-slate-700 bg-slate-900/40 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-xl">{val.emoji}</span>
                      <div className="flex-1">
                        <p
                          className={`font-medium ${
                            active
                              ? val.level === 'danger'
                                ? 'text-red-300'
                                : 'text-amber-300'
                              : 'text-slate-300'
                          }`}
                        >
                          {val.label}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {val.level === 'danger' ? '高风险，请谨慎评估' : '中等风险，提前留意'}
                        </p>
                      </div>
                      {active && (
                        <Check
                          className={`h-5 w-5 mt-0.5 ${
                            val.level === 'danger' ? 'text-red-400' : 'text-amber-400'
                          }`}
                        />
                      )}
                    </button>
                  );
                }
              )}
            </div>
            {form.risks.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {form.risks.map((r) => (
                  <RiskBadge key={r} type={r} />
                ))}
              </div>
            )}
          </div>

          {/* 照片与描述 */}
          <div className="card-base p-6 md:p-8">
            <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 text-sm">
                4
              </span>
              照片与描述
            </h2>

            <div className="space-y-6">
              <FormField label="封面图片 URL" hint="留空将自动生成路线封面">
                <div className="relative">
                  <Upload className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="url"
                    value={form.coverImage}
                    onChange={(e) => update('coverImage', e.target.value)}
                    placeholder="https://..."
                    className="input-base pl-11"
                  />
                </div>
              </FormField>

              <FormField label="路线描述" hint="介绍沿途风景、特殊注意事项等">
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="沿绿道一路向南，途经卢浦大桥观景平台，后半段有树荫遮挡..."
                  rows={4}
                  className="input-base resize-none"
                />
              </FormField>
            </div>
          </div>

          {/* 提交 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
              disabled={submitting}
            >
              取消
            </button>
            <button type="submit" className="btn-primary min-w-[160px]" disabled={submitting}>
              {submitting ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  创建路线
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
