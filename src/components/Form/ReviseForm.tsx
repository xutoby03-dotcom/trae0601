import { useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CoffeeRecord,
  RoastLevel,
  GRINDER_OPTIONS,
  DRIPPER_OPTIONS,
  ROAST_LABELS,
  NegativeReason,
  NEGATIVE_REASON_LABELS,
} from '@/types';
import { useCoffeeStore } from '@/store/coffeeStore';
import { ArrowLeft, GitBranch, AlertTriangle } from 'lucide-react';

interface Props {
  parentRecord: CoffeeRecord;
}

export default function ReviseForm({ parentRecord }: Props) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const reviseRecord = useCoffeeStore((s) => s.reviseRecord);

  const [form, setForm] = useState({
    beanName: parentRecord.beanName,
    roastLevel: parentRecord.roastLevel as RoastLevel,
    batchDate: parentRecord.batchDate,
    grinder: parentRecord.grinder,
    dripper: parentRecord.dripper,
    grindSetting: parentRecord.grindSetting,
    waterTemp: parentRecord.waterTemp,
    ratio: parentRecord.ratio,
    pourStages: parentRecord.pourStages,
    brewTime: parentRecord.brewTime,
    flavorNotes: parentRecord.flavorNotes,
    negativeReason: 'sour' as Exclude<NegativeReason, null>,
    adjustmentNote: '',
  });

  const handleChange = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;

    reviseRecord(id, {
      beanName: form.beanName,
      roastLevel: form.roastLevel,
      batchDate: form.batchDate,
      grinder: form.grinder,
      dripper: form.dripper,
      grindSetting: form.grindSetting,
      waterTemp: form.waterTemp,
      ratio: form.ratio,
      pourStages: form.pourStages,
      brewTime: form.brewTime,
      flavorNotes: form.flavorNotes,
      isTodayRecommended: false,
      parentId: id,
      negativeReason: form.negativeReason,
      adjustmentNote: form.adjustmentNote,
    });
    navigate('/records');
  };

  const hasChanged = (key: keyof CoffeeRecord) => {
    return parentRecord[key] !== form[key as keyof typeof form];
  };

  const diffBadge = (changed: boolean) =>
    changed ? <span className="badge bg-matcha/10 text-matcha ml-2 border border-matcha/30">已调整</span> : null;

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="px-5 py-3 bg-amber/10 border-b border-amber/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-amber" />
          <h2 className="font-display text-xl font-bold text-coffee-800">改版参数记录</h2>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-coffee-500 hover:text-coffee-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-amber/5 rounded-lg p-4 border border-amber/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber mb-1">客人反馈不佳，记录改版原因</p>
              <p className="text-sm text-coffee-600">
                基于 <span className="font-semibold">{parentRecord.beanName}</span> 的原参数进行调整，
                原参数将被保留以便对比。
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-coffee-700 mb-3 flex items-center gap-2 pb-2 border-b border-coffee-100">
            差评原因 <span className="text-red-500">*</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['sour', 'bitter', 'weak', 'other'] as const).map((reason) => (
              <label
                key={reason}
                className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  form.negativeReason === reason
                    ? 'border-amber bg-amber/5 text-amber font-semibold'
                    : 'border-coffee-200 bg-white text-coffee-600 hover:border-coffee-300'
                }`}
              >
                <input
                  type="radio"
                  name="negativeReason"
                  value={reason}
                  checked={form.negativeReason === reason}
                  onChange={() => handleChange('negativeReason', reason)}
                  className="sr-only"
                />
                {NEGATIVE_REASON_LABELS[reason]}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-coffee-700 mb-3 flex items-center gap-2 pb-2 border-b border-coffee-100">
            调整说明
          </h3>
          <textarea
            className="input min-h-[80px]"
            placeholder="例如：刻度从3.2调细到3.0，水温从93降到91..."
            value={form.adjustmentNote}
            onChange={(e) => handleChange('adjustmentNote', e.target.value)}
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-coffee-700 mb-3 flex items-center gap-2 pb-2 border-b border-coffee-100">
            基础信息
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">豆名</label>
              <input
                type="text"
                className="input"
                value={form.beanName}
                onChange={(e) => handleChange('beanName', e.target.value)}
              />
              {diffBadge(hasChanged('beanName'))}
            </div>
            <div>
              <label className="label">烘焙度</label>
              <select
                className="select"
                value={form.roastLevel}
                onChange={(e) => handleChange('roastLevel', e.target.value as RoastLevel)}
              >
                {(['light', 'medium', 'dark'] as RoastLevel[]).map((r) => (
                  <option key={r} value={r}>
                    {ROAST_LABELS[r]}
                  </option>
                ))}
              </select>
              {diffBadge(hasChanged('roastLevel'))}
            </div>
            <div>
              <label className="label">批次日期</label>
              <input
                type="date"
                className="input"
                value={form.batchDate}
                onChange={(e) => handleChange('batchDate', e.target.value)}
              />
              {diffBadge(hasChanged('batchDate'))}
            </div>
            <div></div>
            <div>
              <label className="label">磨豆机</label>
              <select
                className="select"
                value={form.grinder}
                onChange={(e) => handleChange('grinder', e.target.value)}
              >
                {GRINDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {diffBadge(hasChanged('grinder'))}
            </div>
            <div>
              <label className="label">滤杯</label>
              <select
                className="select"
                value={form.dripper}
                onChange={(e) => handleChange('dripper', e.target.value)}
              >
                {DRIPPER_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {diffBadge(hasChanged('dripper'))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-coffee-700 mb-3 flex items-center gap-2 pb-2 border-b border-coffee-100">
            冲煮参数（调整后的新参数）
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="label">研磨刻度 {diffBadge(hasChanged('grindSetting'))}</label>
              <input
                type="number"
                step="0.1"
                className="input"
                value={form.grindSetting}
                onChange={(e) => handleChange('grindSetting', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-coffee-400 mt-1">原值：{parentRecord.grindSetting}</p>
            </div>
            <div>
              <label className="label">水温 (℃) {diffBadge(hasChanged('waterTemp'))}</label>
              <input
                type="number"
                className="input"
                value={form.waterTemp}
                onChange={(e) => handleChange('waterTemp', parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-coffee-400 mt-1">原值：{parentRecord.waterTemp}℃</p>
            </div>
            <div>
              <label className="label">粉水比 {diffBadge(hasChanged('ratio'))}</label>
              <input
                type="text"
                className="input"
                value={form.ratio}
                onChange={(e) => handleChange('ratio', e.target.value)}
              />
              <p className="text-xs text-coffee-400 mt-1">原值：{parentRecord.ratio}</p>
            </div>
            <div>
              <label className="label">注水段数 {diffBadge(hasChanged('pourStages'))}</label>
              <input
                type="number"
                className="input"
                value={form.pourStages}
                onChange={(e) => handleChange('pourStages', parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-coffee-400 mt-1">原值：{parentRecord.pourStages}段</p>
            </div>
            <div>
              <label className="label">出杯时间 (秒) {diffBadge(hasChanged('brewTime'))}</label>
              <input
                type="number"
                className="input"
                value={form.brewTime}
                onChange={(e) => handleChange('brewTime', parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-coffee-400 mt-1">原值：{parentRecord.brewTime}秒</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-coffee-700 mb-3 flex items-center gap-2 pb-2 border-b border-coffee-100">
            风味备注 {diffBadge(hasChanged('flavorNotes'))}
          </h3>
          <textarea
            className="input min-h-[80px]"
            placeholder="记录调整后的风味表现，可直接修改原备注..."
            value={form.flavorNotes}
            onChange={(e) => handleChange('flavorNotes', e.target.value)}
          />
          {parentRecord.flavorNotes && (
            <p className="text-xs text-coffee-400 mt-1">原备注已带入，可根据改版结果修改</p>
          )}
        </div>
      </div>

      <div className="px-6 py-4 bg-coffee-50 border-t border-coffee-100 flex justify-end gap-3">
        <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
          取消
        </button>
        <button type="submit" className="btn btn-amber flex items-center gap-1.5">
          <GitBranch className="w-4 h-4" />
          保存改版记录
        </button>
      </div>
    </form>
  );
}
