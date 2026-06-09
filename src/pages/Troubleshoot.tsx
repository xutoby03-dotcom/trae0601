import { useStore } from '@/store';
import { VolumeX, Radio, Cable, MonitorX, Signal, ChevronRight, ChevronDown, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useState } from 'react';

const SYMPTOMS = [
  { id: 'no-audio', title: '有画面没声音', icon: VolumeX, desc: '检查音频链路，从功放到音响逐段排查' },
  { id: 'no-remote', title: '遥控器找不到', icon: Radio, desc: '查看遥控器登记位置，寻找替代方案' },
  { id: 'hdmi-busy', title: 'HDMI口占用', icon: Cable, desc: '查看端口连接拓扑，规划端口分配' },
  { id: 'flicker', title: '画面闪烁', icon: MonitorX, desc: '检查线缆连接和分辨率兼容性' },
  { id: 'no-signal', title: '无信号', icon: Signal, desc: '逐步排查信号源和连接状态' },
];

const DIAGNOSIS: Record<string, string[]> = {
  'no-audio': ['检查功放是否开机', '检查功放输入源', '检查光纤/HDMI线', '检查音响线缆', '检查音量是否静音'],
  'no-remote': ['查看遥控器位置备注', '检查沙发缝隙', '建议手机遥控替代'],
  'hdmi-busy': ['查看拓扑图端口连接', '确认占用设备', '建议HDMI切换器'],
  'flicker': ['检查HDMI线', '检查分辨率', '更换线缆', '检查输出设置'],
  'no-signal': ['确认源设备开机', '确认输入源选择', '检查HDMI线', '重新插拔'],
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}天前`;
  const hours = Math.floor(diff / 3600000);
  if (hours > 0) return `${hours}小时前`;
  return '刚刚';
}

export default function Troubleshoot() {
  const { troubleshootLogs, devices, addTroubleshootLog } = useStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [resolveInput, setResolveInput] = useState('');
  const [showResolve, setShowResolve] = useState<string | null>(null);

  const steps = selected ? DIAGNOSIS[selected] ?? [] : [];
  const symptomTitle = SYMPTOMS.find((s) => s.id === selected)?.title ?? '';

  const relatedDevices = selected
    ? devices.filter((d) => {
        if (selected === 'no-audio') return d.type === 'amplifier' || d.type === 'speaker';
        if (selected === 'hdmi-busy') return d.type === 'tv' || d.type === 'projector' || d.type === 'amplifier';
        if (selected === 'no-signal' || selected === 'flicker') return d.type === 'tv' || d.type === 'projector';
        return false;
      })
    : [];

  const toggleCheck = (step: string) => setChecked((p) => ({ ...p, [step]: !p[step] }));
  const toggleExpand = (step: string) => setExpanded((p) => ({ ...p, [step]: !p[step] }));

  const handleResolve = () => {
    if (!showResolve || !resolveInput.trim()) return;
    addTroubleshootLog({ symptom: symptomTitle, resolution: resolveInput.trim(), deviceId: showResolve });
    setResolveInput('');
    setShowResolve(null);
  };

  return (
    <div className="h-full overflow-y-auto p-6" style={{ background: 'var(--bg-primary)' }}>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>故障排查</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {SYMPTOMS.map((s) => {
          const Icon = s.icon;
          const isActive = selected === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSelected(isActive ? null : s.id)}
              className="card-glass p-4 text-left transition-all"
              style={{
                borderColor: isActive ? 'var(--accent)' : undefined,
                boxShadow: isActive ? '0 0 16px var(--accent-glow)' : undefined,
              }}
            >
              <Icon size={22} style={{ color: isActive ? 'var(--accent)' : 'var(--text-secondary)' }} className="mb-2" />
              <div className="text-sm font-semibold mb-1" style={{ color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}>{s.title}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.desc}</div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="card-glass p-5 mb-6 animate-fade-in-up">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            诊断步骤 — {symptomTitle}
          </h2>

          <div className="space-y-2 mb-4">
            {steps.map((step, i) => {
              const key = `${selected}-${i}`;
              const isChecked = !!checked[key];
              const isExpanded = !!expanded[key];
              return (
                <div key={key} className="rounded-lg border" style={{ borderColor: isChecked ? 'var(--success)' : 'var(--border-color)', background: isChecked ? '#22c55e0a' : 'transparent' }}>
                  <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => toggleExpand(key)}>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleCheck(key); }}
                      className="shrink-0"
                    >
                      <CheckCircle size={18} style={{ color: isChecked ? 'var(--success)' : 'var(--text-muted)' }} />
                    </button>
                    <span className="text-xs font-bold mr-1" style={{ color: 'var(--accent)' }}>步骤 {i + 1}</span>
                    <span className="text-sm flex-1" style={{ color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isChecked ? 'line-through' : 'none' }}>{step}</span>
                    {isExpanded ? <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />}
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-3 pl-14 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <AlertTriangle size={14} className="inline mr-1" style={{ color: 'var(--accent)' }} />
                      请仔细检查此步骤，确认无异常后勾选
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {relatedDevices.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>相关设备</h3>
              <div className="flex flex-wrap gap-2">
                {relatedDevices.map((d) => (
                  <div key={d.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs" style={{ background: '#ffffff08', border: '1px solid var(--border-color)' }}>
                    <span style={{ color: d.status === 'online' ? 'var(--success)' : 'var(--danger)' }}>●</span>
                    <span style={{ color: 'var(--text-primary)' }}>{d.name}</span>
                    <button
                      onClick={() => setShowResolve(showResolve === d.id ? null : d.id)}
                      className="ml-1 px-2 py-0.5 rounded text-xs font-medium"
                      style={{ background: 'var(--accent)', color: '#000' }}
                    >
                      记录修复
                    </button>
                  </div>
                ))}
              </div>
              {showResolve && (
                <div className="mt-3 flex gap-2">
                  <input
                    className="input-field flex-1"
                    placeholder="输入修复方案..."
                    value={resolveInput}
                    onChange={(e) => setResolveInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleResolve()}
                  />
                  <button className="btn-primary text-sm" onClick={handleResolve}>提交</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="card-glass p-5">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          <Clock size={18} className="inline mr-2" style={{ color: 'var(--text-secondary)' }} />
          历史故障记录
        </h2>
        {troubleshootLogs.length === 0 ? (
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>暂无记录</div>
        ) : (
          <div className="space-y-3">
            {troubleshootLogs.map((log) => {
              const device = devices.find((d) => d.id === log.deviceId);
              return (
                <div key={log.id} className="flex items-start gap-3 px-3 py-2 rounded-lg" style={{ background: '#ffffff06' }}>
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{log.symptom}</span>
                      {device && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#ffffff0d', color: 'var(--text-secondary)' }}>{device.name}</span>}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{log.resolution}</div>
                  </div>
                  <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{timeAgo(log.createdAt)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
