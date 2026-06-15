import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CoffeeRecord, RoastLevel, GRINDER_OPTIONS, DRIPPER_OPTIONS, ROAST_LABELS } from '@/types';
import { useCoffeeStore } from '@/store/coffeeStore';
import { ArrowLeft, Save } from 'lucide-react';

interface Props {
  mode: 'create' | 'edit';
  initialData?: CoffeeRecord;
}

export default function RecordForm({ mode, initialData }: Props) {
  const navigate = useNavigate();
  const addRecord = useCoffeeStore((s) => s.addRecord);
  const updateRecord = useCoffeeStore((s) => s.updateRecord);

  const [form, setForm] = useState({
    beanName: initialData?.beanName || '',
    roastLevel: (initialData?.roastLevel || 'medium') as RoastLevel,
    batchDate: initialData?.batchDate || new Date().toISOString().split('T')[0],
    grinder: initialData?.grinder || GRINDER_OPTIONS[0],
    dripper: initialData?.dripper || DRIPPER_OPTIONS[0],
    grindSetting: initialData?.grindSetting || 3.0,
    waterTemp: initialData?.waterTemp || 93,
    ratio: initialData?.ratio || '1:15',
    pourStages: initialData?.pourStages || 3,
    brewTime: initialData?.brewTime || 150,
    flavorNotes: initialData?.flavorNotes || '',
    isTodayRecommended: initialData?.isTodayRecommended || false,
  });

  const handleChange = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.beanName.trim()) {
      alert('请填写豆名');
      return;
    }

    if (mode === 'create') {
      addRecord({
        ...form,
        parentId: null,
        negativeReason: null,
        adjustmentNote: '',
      });
    } else if (mode === 'edit' && initialData) {
      updateRecord(initialData.id, form);
    }
    navigate('/records');
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="px-5 py-3 bg-coffee-50 border-b border-coffee-100 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-coffee-800">
          {mode === 'create' ? '新增参数记录' : '编辑参数记录'}
        </h2>
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
        <div>
          <h3 className="text-sm font-semibold text-coffee-700 mb-3 flex items-center gap-2 pb-2 border-b border-coffee-100">
            基础信息
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                豆名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="input"
                placeholder="例如：埃塞俄比亚 耶加雪菲"
                value={form.beanName}
                onChange={(e) => handleChange('beanName', e.target.value)}
              />
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
            </div>
            <div>
              <label className="label">批次日期</label>
              <input
                type="date"
                className="input"
                value={form.batchDate}
                onChange={(e) => handleChange('batchDate', e.target.value)}
              />
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
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-coffee-700 mb-3 flex items-center gap-2 pb-2 border-b border-coffee-100">
            冲煮参数
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="label">研磨刻度</label>
              <input
                type="number"
                step="0.1"
                className="input"
                value={form.grindSetting}
                onChange={(e) => handleChange('grindSetting', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="label">水温 (℃)</label>
              <input
                type="number"
                className="input"
                value={form.waterTemp}
                onChange={(e) => handleChange('waterTemp', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="label">粉水比</label>
              <input
                type="text"
                className="input"
                placeholder="1:15"
                value={form.ratio}
                onChange={(e) => handleChange('ratio', e.target.value)}
              />
            </div>
            <div>
              <label className="label">注水段数</label>
              <input
                type="number"
                className="input"
                value={form.pourStages}
                onChange={(e) => handleChange('pourStages', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="label">出杯时间 (秒)</label>
              <input
                type="number"
                className="input"
                value={form.brewTime}
                onChange={(e) => handleChange('brewTime', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-matcha rounded border-coffee-300 focus:ring-matcha"
                  checked={form.isTodayRecommended}
                  onChange={(e) => handleChange('isTodayRecommended', e.target.checked)}
                />
                <span className="text-sm text-coffee-700">设为今日推荐</span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-coffee-700 mb-3 flex items-center gap-2 pb-2 border-b border-coffee-100">
            风味备注
          </h3>
          <textarea
            className="input min-h-[80px]"
            placeholder="例如：柑橘、茉莉花、蜂蜜甜感，干净明亮"
            value={form.flavorNotes}
            onChange={(e) => handleChange('flavorNotes', e.target.value)}
          />
        </div>
      </div>

      <div className="px-6 py-4 bg-coffee-50 border-t border-coffee-100 flex justify-end gap-3">
        <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
          取消
        </button>
        <button type="submit" className="btn btn-primary flex items-center gap-1.5">
          <Save className="w-4 h-4" />
          {mode === 'create' ? '保存记录' : '更新记录'}
        </button>
      </div>
    </form>
  );
}
