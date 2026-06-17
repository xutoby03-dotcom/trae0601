import { useState, useMemo } from 'react';
import type { BatteryRecord, CleanRecord, Device, FeedbackType, BatterySize } from '@/types';
import { useStore, getEarLabel, getFeedbackTypeLabel } from '@/store/useStore';
import { Battery, Sparkles, AlertTriangle, Check, ShoppingCart, Package } from 'lucide-react';
import StockModal from './StockModal';

const today = new Date().toISOString().split('T')[0];

export function BatteryForm({
  device,
  onSubmit,
  onCancel,
}: {
  device?: Device | null;
  onSubmit: (data: Omit<BatteryRecord, 'id'>) => void;
  onCancel: () => void;
}) {
  const devices = useStore((s) => s.devices);
  const batteryStock = useStore((s) => s.batteryStock);
  const updateBatteryStock = useStore((s) => s.updateBatteryStock);
  const [form, setForm] = useState({
    deviceId: device?.id ?? devices[0]?.id ?? '',
    date: today,
    remainingPercent: 15,
    replacedBy: '',
    hasLeakage: false,
    notes: '',
  });
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockDefaultSize, setStockDefaultSize] = useState<BatterySize | undefined>(undefined);

  const selectedDevice = useMemo(() => {
    return devices.find((d) => d.id === form.deviceId);
  }, [devices, form.deviceId]);

  const currentStock = useMemo(() => {
    if (!selectedDevice) return null;
    const stock = batteryStock.find((s) => s.size === selectedDevice.batterySize);
    return stock ? { ...stock, size: stock.size as BatterySize } : null;
  }, [batteryStock, selectedDevice]);

  const isLow = currentStock && currentStock.quantity <= 3;
  const isVeryLow = currentStock && currentStock.quantity <= 1;
  const isOut = currentStock && currentStock.quantity === 0;

  const handleQuickAddOne = () => {
    if (selectedDevice) {
      updateBatteryStock(selectedDevice.batterySize, 1);
    }
  };

  const isValid = form.deviceId && form.replacedBy.trim() && (!isOut || confirm('该规格电池已缺货，确定要记录换电吗？'));

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isValid) onSubmit(form);
        }}
        className="space-y-5"
      >
      <div>
        <label className="label">选择设备 *</label>
        <select
          className="input"
          value={form.deviceId}
          onChange={(e) => setForm({ ...form, deviceId: e.target.value })}
        >
          {devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}（{getEarLabel(d.ear)}）- #{d.batterySize}
            </option>
          ))}
        </select>
      </div>

      {currentStock && (
        <div
          className={`p-4 rounded-2xl border-2 transition-all ${
            isOut
              ? 'bg-accent-red/10 border-accent-red'
              : isVeryLow
              ? 'bg-accent-red/10 border-accent-red/50 animate-pulse-soft'
              : isLow
              ? 'bg-accent-orange/10 border-accent-orange/40'
              : 'bg-brand-50 border-brand-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isOut || isVeryLow ? 'bg-accent-red/20' : isLow ? 'bg-accent-orange/20' : 'bg-brand-100'
                }`}
              >
                <Package
                  size={20}
                  className={
                    isOut || isVeryLow ? 'text-accent-red' : isLow ? 'text-accent-orange' : 'text-brand-600'
                  }
                />
              </div>
              <div>
                <p className="text-sm text-warm-400">#{currentStock.size}号电池库存</p>
                <div className="flex items-center gap-2">
                  <p
                    className={`text-xl font-bold ${
                      isOut
                        ? 'text-accent-red'
                        : isVeryLow
                        ? 'text-accent-red animate-pulse-soft'
                        : isLow
                        ? 'text-accent-orange'
                        : 'text-brand-600'
                    }`}
                  >
                    {currentStock.quantity} 颗
                  </p>
                  {isOut && <span className="px-2 py-0.5 bg-accent-red text-white text-xs rounded-full font-bold">缺货</span>}
                  {isVeryLow && !isOut && <span className="px-2 py-0.5 bg-accent-red text-white text-xs rounded-full font-bold">紧急</span>}
                  {isLow && !isVeryLow && !isOut && <span className="px-2 py-0.5 bg-accent-orange text-accent-blue text-xs rounded-full font-bold">偏低</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleQuickAddOne}
                className="px-3 py-2 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 text-sm font-bold transition-all"
              >
                +1
              </button>
              <button
                type="button"
                onClick={() => {
                  setStockDefaultSize(selectedDevice!.batterySize as BatterySize);
                  setShowStockModal(true);
                }}
                className="btn-primary py-2"
              >
                <ShoppingCart size={16} />
                补货
              </button>
            </div>
          </div>
          {(isOut || isVeryLow || isLow) && (
            <p className="text-xs text-warm-500 mt-3 pt-3 border-t border-black/5">
              {isOut
                ? '⚠️ 该规格电池已完全缺货！请先补货再记录换电，或确认有备用电池可用。'
                : isVeryLow
                ? `⚠️ 库存仅剩 ${currentStock.quantity} 颗，换完后可能就没了，建议立即补货。`
                : `⚠️ 库存偏低（仅 ${currentStock.quantity} 颗），建议尽快补货避免断供。`}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="label">更换日期 *</label>
          <input
            type="date"
            className="input"
            max={today}
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>
        <div>
          <label className="label">更换人 *</label>
          <input
            type="text"
            className="input"
            placeholder="如：妈妈、小明"
            value={form.replacedBy}
            onChange={(e) => setForm({ ...form, replacedBy: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="label">旧电池剩余电量：{form.remainingPercent}%</label>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          className="w-full h-3 bg-warm-100 rounded-full appearance-none cursor-pointer accent-brand-500"
          value={form.remainingPercent}
          onChange={(e) =>
            setForm({ ...form, remainingPercent: Number(e.target.value) })
          }
        />
        <div className="flex justify-between text-xs text-warm-400 mt-1">
          <span>0%（完全没电）</span>
          <span>100%（满电）</span>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-2xl bg-warm-50">
        <input
          type="checkbox"
          id="leakage"
          className="w-5 h-5 accent-brand-500 rounded"
          checked={form.hasLeakage}
          onChange={(e) => setForm({ ...form, hasLeakage: e.target.checked })}
        />
        <label htmlFor="leakage" className="flex items-center gap-2 cursor-pointer">
          <AlertTriangle size={18} className="text-accent-orange" />
          <span className="text-accent-blue font-medium">
            旧电池有漏液现象
          </span>
        </label>
      </div>

      <div>
        <label className="label">备注</label>
        <textarea
          rows={3}
          className="input resize-none"
          placeholder="有什么需要记录的..."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-warm-100">
        <button type="button" onClick={onCancel} className="btn-secondary">
          取消
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className={`btn-primary ${isOut ? 'opacity-70' : ''}`}
        >
          <Battery size={18} />
          {isOut ? '已缺货，仍要记录' : '记录换电池'}
        </button>
      </div>
    </form>

    <StockModal
      open={showStockModal}
      onClose={() => setShowStockModal(false)}
      defaultSize={stockDefaultSize}
    />
    </>
  );
}

// 分隔：CleanForm 和 FeedbackForm 部分保持不变

export function CleanForm({
  device,
  onSubmit,
  onCancel,
}: {
  device?: Device | null;
  onSubmit: (data: Omit<CleanRecord, 'id'>) => void;
  onCancel: () => void;
}) {
  const devices = useStore((s) => s.devices);
  const [form, setForm] = useState({
    deviceId: device?.id ?? devices[0]?.id ?? '',
    date: today,
    earplug: false,
    soundTube: false,
    dryBox: false,
    microphone: false,
    cleanedBy: '',
    notes: '',
  });

  const isValid =
    form.deviceId &&
    form.cleanedBy.trim() &&
    (form.earplug || form.soundTube || form.dryBox || form.microphone);

  const allCleaned = form.earplug && form.soundTube && form.dryBox && form.microphone;

  const cleanItems = [
    { key: 'earplug' as const, label: '耳塞', emoji: '🔵', desc: '清理耳塞上的耳垢' },
    { key: 'soundTube' as const, label: '导声管', emoji: '🧹', desc: '清除导管内堵塞物' },
    { key: 'dryBox' as const, label: '干燥盒', emoji: '📦', desc: '检查干燥剂状态' },
    { key: 'microphone' as const, label: '麦克风口', emoji: '🎤', desc: '清除麦克风防护层' },
  ];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isValid) onSubmit(form);
      }}
      className="space-y-5"
    >
      <div>
        <label className="label">选择设备 *</label>
        <select
          className="input"
          value={form.deviceId}
          onChange={(e) => setForm({ ...form, deviceId: e.target.value })}
        >
          {devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}（{getEarLabel(d.ear)}）
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="label">清洁日期 *</label>
          <input
            type="date"
            className="input"
            max={today}
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>
        <div>
          <label className="label">清洁人 *</label>
          <input
            type="text"
            className="input"
            placeholder="如：妈妈、小明"
            value={form.cleanedBy}
            onChange={(e) => setForm({ ...form, cleanedBy: e.target.value })}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="label mb-0">清洁项目 *（至少勾选一项）</label>
          {allCleaned && (
            <span className="tag bg-green-100 text-green-700 gap-1">
              <Check size={14} /> 全部已清洁
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cleanItems.map((item) => (
            <label
              key={item.key}
              className={`flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                form[item.key]
                  ? 'bg-brand-50 border-brand-300 shadow-soft'
                  : 'bg-warm-50 border-transparent hover:bg-white hover:border-warm-200'
              }`}
            >
              <input
                type="checkbox"
                className="mt-1 w-5 h-5 accent-brand-500 rounded"
                checked={form[item.key]}
                onChange={(e) => setForm({ ...form, [item.key]: e.target.checked })}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{item.emoji}</span>
                  <span className="font-bold text-accent-blue">{item.label}</span>
                </div>
                <p className="text-sm text-warm-400 mt-1">{item.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="label">备注</label>
        <textarea
          rows={3}
          className="input resize-none"
          placeholder="清洁过程中有什么发现..."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-warm-100">
        <button type="button" onClick={onCancel} className="btn-secondary">
          取消
        </button>
        <button type="submit" disabled={!isValid} className="btn-primary">
          <Sparkles size={18} />
          记录清洁
        </button>
      </div>
    </form>
  );
}

export function FeedbackForm({
  device,
  onSubmit,
  onCancel,
}: {
  device?: Device | null;
  onSubmit: (data: {
    deviceId: string;
    type: FeedbackType;
    description: string;
  }) => void;
  onCancel: () => void;
}) {
  const devices = useStore((s) => s.devices);
  const [form, setForm] = useState({
    deviceId: device?.id ?? devices[0]?.id ?? '',
    type: 'whistling' as FeedbackType,
    description: '',
  });

  const feedbackTypes: { key: FeedbackType; emoji: string; label: string; tips: string }[] = [
    { key: 'whistling', emoji: '📢', label: '连续啸叫', tips: '助听器发出尖锐的吱吱声' },
    { key: 'sound_low', emoji: '🔇', label: '声音变小', tips: '听不清、声音变弱' },
    { key: 'pain', emoji: '😣', label: '佩戴疼痛', tips: '耳道不适、压痛' },
  ];

  const isValid = form.deviceId && form.description.trim().length >= 5;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isValid) onSubmit(form);
      }}
      className="space-y-5"
    >
      <div>
        <label className="label">出现问题的设备 *</label>
        <select
          className="input"
          value={form.deviceId}
          onChange={(e) => setForm({ ...form, deviceId: e.target.value })}
        >
          {devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}（{getEarLabel(d.ear)}）
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">问题类型 *</label>
        <div className="space-y-3">
          {feedbackTypes.map((t) => (
            <label
              key={t.key}
              className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                form.type === t.key
                  ? 'bg-accent-red/10 border-accent-red/40 shadow-soft'
                  : 'bg-warm-50 border-transparent hover:bg-white hover:border-warm-200'
              }`}
            >
              <input
                type="radio"
                name="fb-type"
                className="mt-1 w-5 h-5 accent-accent-red"
                checked={form.type === t.key}
                onChange={() => setForm({ ...form, type: t.key })}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{t.emoji}</span>
                  <span className="font-bold text-lg text-accent-blue">
                    {getFeedbackTypeLabel(t.key)}
                  </span>
                </div>
                <p className="text-sm text-warm-400 mt-1">{t.tips}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="label">详细描述 *（至少5个字）</label>
        <textarea
          rows={4}
          className="input resize-none"
          placeholder="请描述症状发生的时间、场景、持续时间..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <p className="text-xs text-warm-400 mt-2">
          💡 提交后会自动生成复查清单，帮助你一步步排查问题
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-warm-100">
        <button type="button" onClick={onCancel} className="btn-secondary">
          取消
        </button>
        <button type="submit" disabled={!isValid} className="btn-danger">
          <AlertTriangle size={18} />
          提交并生成复查清单
        </button>
      </div>
    </form>
  );
}
