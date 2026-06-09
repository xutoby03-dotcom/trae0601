import { useState } from 'react';
import { useStore } from '@/store';
import { DeviceIcon, deviceTypeLabels } from '@/utils/icons';
import { Plus, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  online: { label: '在线', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  offline: { label: '离线', color: 'text-gray-400', bg: 'bg-gray-500/15' },
  fault: { label: '故障', color: 'text-red-400', bg: 'bg-red-500/15' },
};

export default function Devices() {
  const navigate = useNavigate();
  const devices = useStore((s) => s.devices);
  const ports = useStore((s) => s.ports);
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const filtered = devices.filter((d) => {
    const matchType = !typeFilter || d.type === typeFilter;
    const q = keyword.toLowerCase();
    const matchKeyword = !q || d.name.toLowerCase().includes(q) || d.brand.toLowerCase().includes(q) || d.model.toLowerCase().includes(q);
    return matchType && matchKeyword;
  });

  const typeEntries = Object.entries(deviceTypeLabels) as [string, string][];

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">设备管理</h1>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => navigate('/devices/new')}
        >
          <Plus size={16} />
          添加设备
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          className="input-field pl-9"
          placeholder="搜索设备名称、品牌、型号..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        <Filter size={14} className="text-[var(--text-muted)] shrink-0" />
        <button
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
            !typeFilter
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'
          }`}
          onClick={() => setTypeFilter(null)}
        >
          全部
        </button>
        {typeEntries.map(([key, label]) => (
          <button
            key={key}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
              typeFilter === key
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'
            }`}
            onClick={() => setTypeFilter(typeFilter === key ? null : key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((device) => {
          const status = statusConfig[device.status] || statusConfig.offline;
          const portCount = ports.filter((p) => p.deviceId === device.id).length;

          return (
            <div
              key={device.id}
              className="card-glass p-4 cursor-pointer transition-all duration-200 hover:shadow-[0_0_12px_var(--accent-glow)] hover:border-amber-400/30"
              onClick={() => navigate(`/devices/${device.id}`)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-white/60 overflow-hidden">
                  {device.photoUrl ? (
                    <img src={device.photoUrl} alt={device.name} className="w-full h-full object-cover" />
                  ) : (
                    <DeviceIcon type={device.type} size={24} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold truncate">{device.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] truncate">
                    {device.brand} · {device.model}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5">
                <span className="text-xs bg-white/5 text-[var(--text-secondary)] px-2 py-1 rounded-md">
                  {portCount} 个端口
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
          <Search size={48} className="mb-4 opacity-30" />
          <p className="text-lg">没有找到匹配的设备</p>
          <p className="text-sm mt-1">尝试调整搜索条件或筛选类型</p>
        </div>
      )}
    </div>
  );
}
