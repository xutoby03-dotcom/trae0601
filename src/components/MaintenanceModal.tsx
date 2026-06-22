import { useState } from 'react';
import { X, Wrench, AlertTriangle } from 'lucide-react';
import { useDutyStore } from '../store/useDutyStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const EQUIPMENT_OPTIONS = [
  '雾号系统',
  '航标灯光',
  '备用发电机',
  '光学镜头组',
  '计时器模块',
  '通信设备',
  '除露系统',
  '主电源系统',
  '其他设备',
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: '低', desc: '下次例行维护', color: 'bg-ocean-400/30 text-ocean-200' },
  { value: 'medium', label: '中', desc: '近期需处理', color: 'bg-alert-caution/30 text-alert-caution' },
  { value: 'high', label: '紧急', desc: '立即处理', color: 'bg-alert-warning/30 text-alert-warning' },
];

export default function MaintenanceModal({ isOpen, onClose }: Props) {
  const addMaintenanceOrder = useDutyStore((s) => s.addMaintenanceOrder);
  const [equipment, setEquipment] = useState(EQUIPMENT_OPTIONS[0]);
  const [customEquipment, setCustomEquipment] = useState('');
  const [issue, setIssue] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const actualEquipment =
    equipment === '其他设备' ? customEquipment : equipment;

  const canSubmit = actualEquipment.trim() && issue.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);

    setTimeout(() => {
      addMaintenanceOrder({
      equipment: actualEquipment,
      issue,
      priority,
      description: description || undefined,
    });

    setSubmitting(false);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      onClose();
      setEquipment(EQUIPMENT_OPTIONS[0]);
      setCustomEquipment('');
      setIssue('');
      setDescription('');
      setPriority('medium');
    }, 1000);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/80 backdrop-blur-sm">
      <div className="glass-card w-full max-w-lg p-6 relative animate-in">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-alert-caution/20 text-alert-caution">
            <Wrench size={20} />
          </div>
          <div>
            <h2 className="font-display text-xl text-ocean-100">提交维护工单</h2>
            <p className="text-xs text-ocean-300">设备故障或需要检修的问题</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-ocean-300 hover:bg-ocean-700/50 hover:text-ocean-100 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {success ? (
        <div className="py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-alert-safe/20 text-alert-safe mb-4">
            <Wrench size={32} />
          </div>
          <h3 className="text-xl text-ocean-100 font-semibold">工单已提交</h3>
          <p className="text-ocean-300 mt-2">
            {actualEquipment} 的维护工单已生成并通知相关人员
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm text-ocean-200">设备名称</label>
            <select
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="glow-input"
            >
                {EQUIPMENT_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-ocean-800">
                  {opt}
                </option>
              ))}
              </select>
              {equipment === '其他设备' && (
              <input
                type="text"
                placeholder="请输入设备名称..."
                value={customEquipment}
                onChange={(e) => setCustomEquipment(e.target.value)}
                className="glow-input mt-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-ocean-200">问题简述</label>
            <input
              type="text"
              placeholder="例如：雾号间隔不稳定"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              className="glow-input"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-ocean-200">优先级</label>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITY_OPTIONS.map((p) => {
                const active = priority === p.value;
                return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value as any)}
                  className={`p-3 rounded-xl border transition-all ${
                    active
                      ? `${p.color} border-current shadow-lg`
                      : 'bg-ocean-900/40 text-ocean-300 border-ocean-700/50 hover:bg-ocean-800/50'
                  }`}
                >
                  <div className="font-semibold">{p.label}</div>
                  <div className="text-xs opacity-80 mt-0.5">{p.desc}</div>
                </button>
              );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-ocean-200">详细描述（可选）</label>
            <textarea
              rows={3}
              placeholder="详细描述故障现象、发生频率、影响范围等..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glow-input resize-none"
            />
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-alert-caution/10 border border-alert-caution/20">
            <AlertTriangle size={16} className="text-alert-caution mt-0.5 flex-shrink-0" />
            <p className="text-xs text-ocean-200">
              提交后将自动生成维护工单并记录至告警时间线，紧急问题请直接联系设备维护团队
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-outline"
              disabled={submitting}
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary flex items-center justify-center gap-2"
              disabled={!canSubmit || submitting}
            >
              <Wrench size={16} />
              {submitting ? '提交中...' : '提交工单'}
            </button>
          </div>
        </form>
      )}
      </div>
    </div>
  );
}
