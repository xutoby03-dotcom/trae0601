import { Thermometer, Package, Layers, Clock } from 'lucide-react';
import type { Batch } from '@/types';
import { useCountdown } from '@/hooks/useCountdown';
import { formatTime, formatDateTime } from '@/utils/time';
import { useBatchStore } from '@/store/batchStore';

interface BatchCardProps {
  batch: Batch;
  onFinish: (batch: Batch) => void;
}

const statusStyles = {
  normal: 'border-success bg-gradient-to-br from-green-50 to-green-100/50 shadow-green-200/50',
  warning: 'border-warn bg-gradient-to-br from-orange-50 to-orange-100/50 shadow-orange-200/50 animate-pulseWarn',
  danger: 'border-danger bg-gradient-to-br from-red-50 to-red-100/50 shadow-red-200/50 animate-pulseDanger',
  overtime: 'border-danger bg-gradient-to-br from-red-100 to-red-200 shadow-red-300 animate-pulseDanger',
};

const textStyles = {
  normal: 'text-success',
  warning: 'text-warn',
  danger: 'text-danger',
  overtime: 'text-danger',
};

export default function BatchCard({ batch, onFinish }: BatchCardProps) {
  const { ovens } = useBatchStore();
  const { remaining, status } = useCountdown(batch.startTime, batch.targetDuration);
  const oven = ovens.find((o) => o.id === batch.ovenId);

  const overtime = remaining <= 0;
  const displayTime = overtime ? -remaining : remaining;
  const displayStatus = overtime ? 'overtime' : status;

  return (
    <div
      className={`card-base border-l-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${statusStyles[displayStatus]}`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/80 text-espresso-700 border border-copper-200">
                <Layers className="w-3 h-3 mr-1" />
                {oven?.name} · 第{batch.layer}层
              </span>
              <span className="text-xs text-espresso-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                入炉 {formatDateTime(batch.startTime)}
              </span>
            </div>
            <h3 className="font-display text-xl font-bold text-espresso-800">
              {batch.productName}
            </h3>
          </div>
          {batch.entryPhoto && (
            <img
              src={batch.entryPhoto}
              alt={batch.productName}
              className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow"
            />
          )}
        </div>

        <div className="mb-4 text-center">
          <div
            className={`font-display text-5xl font-bold tabular-nums tracking-wider mb-1 ${textStyles[displayStatus]}`}
          >
            {overtime && '+'}
            {formatTime(displayTime)}
          </div>
          <div className="text-xs font-medium text-espresso-500">
            {overtime ? '已超时' : '剩余时间'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/60">
            <Package className="w-4 h-4 text-copper-500" />
            <span className="text-espresso-600">
              <span className="font-semibold">{batch.quantity}</span> 个
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/60">
            <Thermometer className="w-4 h-4 text-warn" />
            <span className="text-espresso-600">
              <span className="font-semibold">{batch.temperature}</span> °C
            </span>
          </div>
        </div>

        <button
          onClick={() => onFinish(batch)}
          className={`w-full py-3 rounded-xl font-bold transition-all duration-200 ${
            overtime
              ? 'bg-danger text-white hover:bg-red-600 shadow-lg shadow-red-200 hover:scale-[1.01]'
              : 'bg-copper-500 text-white hover:bg-copper-600 shadow-md shadow-copper-200 hover:scale-[1.01]'
          }`}
        >
          🎯 {overtime ? '立即出炉' : '出炉登记'}
        </button>
      </div>
    </div>
  );
}
