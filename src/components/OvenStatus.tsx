import { useBatchStore } from '@/store/batchStore';
import { useCountdown } from '@/hooks/useCountdown';
import { formatTime } from '@/utils/time';
import type { Batch } from '@/types';

function LayerItem({ batch }: { batch: Batch | null }) {
  if (!batch) {
    return (
      <div className="h-16 rounded-lg border-2 border-dashed border-espresso-200 bg-espresso-50/50 flex items-center justify-center text-espresso-300 text-sm">
        空闲
      </div>
    );
  }
  const { remaining, status } = useCountdown(batch.startTime, batch.targetDuration);
  const overtime = remaining <= 0;
  const display = overtime ? `+${formatTime(-remaining)}` : formatTime(remaining);

  const bgMap = {
    normal: 'from-green-500 to-green-600',
    warning: 'from-warn to-orange-500',
    danger: 'from-danger to-red-500',
    overtime: 'from-danger to-red-600',
  };
  const displayStatus = overtime ? 'overtime' : status;

  return (
    <div
      className={`h-16 rounded-lg bg-gradient-to-r ${bgMap[displayStatus]} text-white p-2 shadow-md overflow-hidden ${
        displayStatus === 'warning' ? 'animate-pulseWarn' : ''
      } ${displayStatus === 'danger' || displayStatus === 'overtime' ? 'animate-pulseDanger' : ''}`}
    >
      <div className="flex items-center justify-between h-full">
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-sm truncate">{batch.productName}</div>
          <div className="text-xs opacity-90">{batch.quantity}个 · {batch.temperature}°C</div>
        </div>
        <div className="font-display text-lg font-bold tabular-nums ml-2 shrink-0">
          {display}
        </div>
      </div>
    </div>
  );
}

export default function OvenStatus() {
  const { ovens, getActiveBatchesByOven } = useBatchStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-espresso-800">烤箱状态</h2>
        <span className="text-xs text-espresso-500 bg-copper-100 px-3 py-1 rounded-full">
          共 {ovens.length} 台
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {ovens.map((oven) => {
          const activeBatches = getActiveBatchesByOven(oven.id);
          const layers = [];
          for (let l = 1; l <= oven.layers; l++) {
            layers.push(activeBatches.find((b) => b.layer === l) || null);
          }
          return (
            <div key={oven.id} className="card-base">
              <div className="bg-gradient-to-r from-espresso-700 to-espresso-600 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-success animate-pulse" />
                  <h3 className="font-semibold">{oven.name}</h3>
                </div>
                <span className="text-xs opacity-80">
                  {activeBatches.length}/{oven.layers} 层使用中
                </span>
              </div>
              <div className="p-3 space-y-2 bg-gradient-to-b from-espresso-900/10 to-transparent">
                {layers
                  .slice()
                  .reverse()
                  .map((batch, idx) => (
                    <div key={layers.length - idx} className="relative">
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 text-[10px] text-espresso-400 font-semibold w-4 text-center">
                        L{layers.length - idx}
                      </div>
                      <div className="ml-5">
                        <LayerItem batch={batch} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
