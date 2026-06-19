import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Activity, AlertTriangle, BatteryFull, BatteryMedium, BatteryLow } from 'lucide-react';
import { useAppStore } from '@/store';
import type { Device } from '@/constants';

interface DeviceCardProps {
  device: Device;
}

export default function DeviceCard({ device }: DeviceCardProps) {
  const navigate = useNavigate();
  const isInspectedThisMonth = useAppStore((s) => s.isDeviceInspectedThisMonth);
  const getPendingTaskCount = useAppStore((s) => s.getPendingTaskCount);
  const getBatteryStatus = useAppStore((s) => s.getBatteryStatus);

  const inspected = isInspectedThisMonth(device.id);
  const anomalyCount = getPendingTaskCount(device.id);
  const batteryStatus = getBatteryStatus(device);

  const renderBatteryIcon = () => {
    if (batteryStatus.level === 'ok') return <BatteryFull className="w-3.5 h-3.5" />;
    if (batteryStatus.level === 'warning') return <BatteryMedium className="w-3.5 h-3.5" />;
    return <BatteryLow className="w-3.5 h-3.5" />;
  };

  const batteryTagClass = {
    ok: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    danger: 'bg-danger-50 text-danger-500',
  }[batteryStatus.level];

  const batteryLabel =
    batteryStatus.days > 0
      ? `${batteryStatus.days}天后到期`
      : `已超期${-batteryStatus.days}天`;

  return (
    <div className="card card-hover flex flex-col overflow-hidden">
      <div
        className="relative h-44 w-full overflow-hidden rounded-t-2xl bg-gradient-to-br from-brand-100 via-warning-100 to-cream-200">
        {device.photo ? (
          <img
            src={device.photo}
            alt={device.location}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-200/40 via-warning-200/30 to-cream-300/40">
            <span className="text-6xl opacity-70">🏠</span>
          </div>
        )}
        {anomalyCount > 0 && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-danger-500 px-2.5 py-1 text-xs font-medium text-white shadow-md border-pulse">
            <AlertTriangle className="w-3 h-3" />
            <span>{anomalyCount}项异常</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3">
          <h3 className="font-bold text-gray-800 text-base leading-snug">{device.location}</h3>
          <p className="mt-1 text-xs text-gray-500">{device.model}</p>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <span
            className={`tag ${
              inspected ? 'bg-success-50 text-success-600' : 'bg-gray-100 text-gray-500'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            {inspected ? '本月已自检' : '待自检'}
          </span>
          <span
            className={`tag ${
              anomalyCount > 0 ? 'bg-danger-50 text-danger-500' : 'bg-success-50 text-success-600'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {anomalyCount > 0 ? `${anomalyCount}项异常` : '无异常'}
          </span>
          <span className={`tag ${batteryTagClass}`}>
            {renderBatteryIcon()}
            {batteryLabel}
          </span>
        </div>

        <div className="mt-auto flex justify-end gap-1.5 pt-3 border-t border-gray-100">
          <button
            onClick={() => navigate(`/devices/${device.id}`)}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-brand-500 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            详情
          </button>
          <button
            onClick={() => navigate(`/devices/${device.id}/edit`)}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-brand-500 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            编辑
          </button>
          <button
            onClick={() => navigate(`/inspections/new?device_id=${device.id}`)}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-brand-500 bg-brand-50 hover:bg-brand-100 transition-colors"
          >
            <Activity className="w-3.5 h-3.5" />
            自检
          </button>
        </div>
      </div>
    </div>
  );
}
