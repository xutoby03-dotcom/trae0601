import { Link } from 'react-router-dom';
import { MapPin, Battery, Cpu, PlayCircle, ClipboardList } from 'lucide-react';
import { useAppStore } from '@/store';
import { BATTERY_OPTIONS } from '@/constants';
import { cn } from '@/lib/utils';

export default function PendingList() {
  const { devices, isDeviceInspectedThisMonth, getBatteryStatus } = useAppStore();

  const pendingDevices = devices.filter((d) => !isDeviceInspectedThisMonth(d.id));
  const allDone = devices.length > 0 && pendingDevices.length === 0;

  return (
    <div className="card p-5 animate-fade-in-up delay-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title">
          <ClipboardList className="w-5 h-5 text-brand-500" />
          本月待自检设备
        </h3>
        <span className="tag bg-brand-50 text-brand-600">
          {pendingDevices.length} 台待检
        </span>
      </div>

      {allDone ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mb-3">
            <svg className="w-8 h-8 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-success-600">本月自检已全部完成 ✓</p>
          <p className="text-sm text-gray-400 mt-1">干得漂亮，所有设备状态良好</p>
        </div>
      ) : pendingDevices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-gray-400">暂无设备数据</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {pendingDevices.map((device) => {
            const battery = getBatteryStatus(device);
            const batteryLabel = battery.level === 'ok'
              ? BATTERY_OPTIONS[0].label
              : battery.level === 'warning'
              ? BATTERY_OPTIONS[1].label
              : BATTERY_OPTIONS[2].label;

            return (
              <div
                key={device.id}
                className="flex items-center justify-between p-4 rounded-xl bg-cream-50/60 border border-cream-200/50 hover:border-brand-200 hover:bg-white transition-all duration-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <p className="font-semibold text-gray-800 truncate">{device.location}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <span className="flex items-center gap-1 text-gray-500">
                      <Cpu className="w-3.5 h-3.5" />
                      {device.model}
                    </span>
                    <span className={cn(
                      'flex items-center gap-1',
                      battery.level === 'ok' && 'text-success-500',
                      battery.level === 'warning' && 'text-warning-500',
                      battery.level === 'danger' && 'text-danger-500',
                    )}>
                      <Battery className="w-3.5 h-3.5" />
                      {batteryLabel}
                      {battery.days <= 30 && battery.days > 0 && (
                        <span className="text-xs ml-0.5">({battery.days}天)</span>
                      )}
                      {battery.days <= 0 && (
                        <span className="text-xs ml-0.5">(已过期)</span>
                      )}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/devices/${device.id}/inspection`}
                  className="shrink-0 ml-4 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-full hover:bg-brand-600 active:scale-95 transition-all duration-200 shadow-sm hover:shadow"
                >
                  <PlayCircle className="w-4 h-4" />
                  立即自检
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
