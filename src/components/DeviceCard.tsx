import type { Device } from '@/types';
import { useStore, getEarLabel } from '@/store/useStore';
import { Battery, Calendar, MapPin, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { format, parseISO, isBefore } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface DeviceCardProps {
  device: Device;
  onEdit: () => void;
  onDelete: () => void;
  onSelect: () => void;
}

export default function DeviceCard({
  device,
  onEdit,
  onDelete,
  onSelect,
}: DeviceCardProps) {
  const getDeviceBatteryDaysLeft = useStore(
    (s) => s.getDeviceBatteryDaysLeft,
  );
  const getDeviceNextBatteryDate = useStore(
    (s) => s.getDeviceNextBatteryDate,
  );
  const daysLeft = getDeviceBatteryDaysLeft(device.id);
  const nextDate = getDeviceNextBatteryDate(device.id);

  const isWarrantyExpired = device.warrantyDate
    ? isBefore(parseISO(device.warrantyDate), new Date())
    : false;

  const batteryColor =
    daysLeft <= 1
      ? 'bg-accent-red text-white'
      : daysLeft <= 3
      ? 'bg-accent-orange text-accent-blue'
      : 'bg-brand-500 text-white';

  const earColor =
    device.ear === 'left'
      ? 'bg-blue-100 text-blue-700'
      : device.ear === 'right'
      ? 'bg-green-100 text-green-700'
      : 'bg-purple-100 text-purple-700';

  return (
    <div
      onClick={onSelect}
      className="card group cursor-pointer overflow-hidden p-0 animate-fade-in-up"
    >
      <div className="relative h-36 bg-gradient-to-br from-brand-50 via-warm-50 to-brand-100 overflow-hidden">
        {device.photo ? (
          <img
            src={device.photo}
            alt={device.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-7xl opacity-60">👂</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`tag ${earColor} shadow-soft`}>
            {getEarLabel(device.ear)}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="w-9 h-9 rounded-xl bg-white shadow-soft flex items-center justify-center text-brand-600 hover:bg-brand-50 transition-all"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-9 h-9 rounded-xl bg-white shadow-soft flex items-center justify-center text-accent-red hover:bg-red-50 transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
        <div className="absolute bottom-3 right-3">
          <span className={`tag ${batteryColor} shadow-soft gap-1.5 flex-col py-2`}>
            <span className="flex items-center gap-1">
              <Battery size={14} />
              {daysLeft === 0 ? '今天到期' : daysLeft === 1 ? '明天到期' : `${daysLeft}天后`}
            </span>
            {nextDate && (
              <span className="text-[11px] opacity-90">
                📅 {format(parseISO(nextDate), 'M月d日', { locale: zhCN })}
              </span>
            )}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h4 className="text-lg font-bold text-accent-blue mb-1">
          {device.name}
        </h4>
        <p className="text-sm text-warm-400 mb-4">{device.model}</p>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center">
              <Battery size={14} className="text-brand-600" />
            </div>
            <span className="text-warm-400">电池规格：</span>
            <span className="font-medium text-accent-blue">#{device.batterySize}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="w-7 h-7 rounded-lg bg-warm-100 flex items-center justify-center">
              <MapPin size={14} className="text-warm-500" />
            </div>
            <span className="text-warm-400 truncate">{device.storeName}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isWarrantyExpired ? 'bg-red-50' : 'bg-green-50'
              }`}
            >
              <Calendar
                size={14}
                className={isWarrantyExpired ? 'text-accent-red' : 'text-green-600'}
              />
            </div>
            <span className="text-warm-400">保修：</span>
            <span
              className={`font-medium ${
                isWarrantyExpired ? 'text-accent-red' : 'text-green-600'
              }`}
            >
              {isWarrantyExpired ? '已过期' : device.warrantyDate}
            </span>
            {!isWarrantyExpired && (
              <span className="text-xs text-warm-300">
                （{format(parseISO(device.warrantyDate), 'M月d日', { locale: zhCN })}）
              </span>
            )}
          </div>
        </div>

        {daysLeft <= 2 && nextDate && (
          <div className="mt-4 pt-4 border-t border-warm-100 flex items-center gap-2 text-accent-red animate-pulse-soft">
            <AlertCircle size={16} />
            <span className="text-sm font-medium">
              📅 {format(parseISO(nextDate), 'M月d日 EEEE', { locale: zhCN })} 需要更换电池
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
