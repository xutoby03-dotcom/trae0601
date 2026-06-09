import { useStore } from '@/store';
import { DeviceIcon } from '@/utils/icons';
import { BarChart3, TrendingUp, AlertTriangle, Activity } from 'lucide-react';

export default function Stats() {
  const devices = useStore((s) => s.devices);
  const scenes = useStore((s) => s.scenes);
  const sceneDevices = useStore((s) => s.sceneDevices);
  const troubleshootLogs = useStore((s) => s.troubleshootLogs);

  const totalUseCount = scenes.reduce((sum, s) => sum + s.useCount, 0);

  const summaryCards = [
    { icon: <BarChart3 size={22} className="text-amber-400" />, value: devices.length, label: '总设备数' },
    { icon: <TrendingUp size={22} className="text-emerald-400" />, value: scenes.length, label: '总场景数' },
    { icon: <AlertTriangle size={22} className="text-red-400" />, value: troubleshootLogs.length, label: '故障记录数' },
    { icon: <Activity size={22} className="text-cyan-400" />, value: totalUseCount, label: '场景使用总次数' },
  ];

  const sortedScenes = [...scenes].sort((a, b) => b.useCount - a.useCount);
  const maxUseCount = Math.max(...sortedScenes.map((s) => s.useCount), 1);

  const faultMap = troubleshootLogs.reduce<Record<string, number>>((acc, log) => {
    acc[log.deviceId] = (acc[log.deviceId] || 0) + 1;
    return acc;
  }, {});
  const faultRanking = devices
    .map((d) => ({ ...d, faultCount: faultMap[d.id] || 0 }))
    .sort((a, b) => b.faultCount - a.faultCount);
  const hasFaults = faultRanking.some((d) => d.faultCount > 0);
  const displayedFaults = hasFaults ? faultRanking.filter((d) => d.faultCount > 0) : faultRanking;

  const activityMap = sceneDevices.reduce<Record<string, number>>((acc, sd) => {
    acc[sd.deviceId] = (acc[sd.deviceId] || 0) + 1;
    return acc;
  }, {});
  const activityRanking = devices
    .map((d) => ({ ...d, activityCount: activityMap[d.id] || 0 }))
    .sort((a, b) => b.activityCount - a.activityCount);
  const maxActivity = Math.max(...activityRanking.map((d) => d.activityCount), 1);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">使用统计</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="card-glass p-4 flex flex-col items-center gap-2">
            {card.icon}
            <span className="text-3xl font-bold">{card.value}</span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{card.label}</span>
          </div>
        ))}
      </div>

      <section className="card-glass p-5">
        <h2 className="text-lg font-semibold mb-4">场景使用频率</h2>
        {sortedScenes.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>暂无场景数据</p>
        ) : (
          <div className="space-y-3">
            {sortedScenes.map((scene) => (
              <div key={scene.id} className="flex items-center gap-3">
                <span className="w-24 text-sm truncate shrink-0" style={{ color: 'var(--text-secondary)' }}>{scene.name}</span>
                <div className="flex-1 h-6 rounded-full overflow-hidden" style={{ background: '#ffffff0a' }}>
                  <div
                    className="h-full rounded-full flex items-center justify-end px-2 text-xs font-semibold text-black"
                    style={{
                      width: `${(scene.useCount / maxUseCount) * 100}%`,
                      minWidth: scene.useCount > 0 ? '2rem' : '0',
                      background: '#f59e0b',
                    }}
                  >
                    {scene.useCount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card-glass p-5">
        <h2 className="text-lg font-semibold mb-4">设备故障排名</h2>
        {displayedFaults.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>暂无设备数据</p>
        ) : (
          <div className="space-y-2">
            {displayedFaults.map((device) => (
              <div
                key={device.id}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ background: '#ffffff06' }}
              >
                <DeviceIcon type={device.type} size={20} className="shrink-0 text-[var(--text-secondary)]" />
                <span className="flex-1 text-sm">{device.name}</span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: device.faultCount > 0 ? '#ef444433' : '#ffffff0d',
                    color: device.faultCount > 0 ? '#ef4444' : 'var(--text-muted)',
                  }}
                >
                  {device.faultCount} 次
                </span>
                {device.faultCount > 0 && <AlertTriangle size={16} className="text-red-400 shrink-0" />}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card-glass p-5">
        <h2 className="text-lg font-semibold mb-4">设备活跃度</h2>
        {activityRanking.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>暂无设备数据</p>
        ) : (
          <div className="space-y-3">
            {activityRanking.map((device) => (
              <div key={device.id} className="flex items-center gap-3">
                <DeviceIcon type={device.type} size={18} className="shrink-0 text-[var(--text-secondary)]" />
                <span className="w-28 text-sm truncate shrink-0">{device.name}</span>
                <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: '#ffffff0a' }}>
                  <div
                    className="h-full rounded-full flex items-center justify-end px-2 text-xs font-semibold text-black"
                    style={{
                      width: `${(device.activityCount / maxActivity) * 100}%`,
                      minWidth: device.activityCount > 0 ? '1.5rem' : '0',
                      background: '#06b6d4',
                    }}
                  >
                    {device.activityCount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
