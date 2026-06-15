import { AlertOctagon, Wrench, X } from 'lucide-react';
import { useCoffeeStore } from '@/store/coffeeStore';
import { useState, useMemo } from 'react';

export default function CalibrationAlert() {
  const records = useCoffeeStore((s) => s.records);
  const [dismissed, setDismissed] = useState(false);

  const needsCalibration = useMemo(() => {
    const uniqueBatches = new Map<string, { beanName: string; batchDate: string }>();
    for (const r of records) {
      const key = `${r.beanName}-${r.batchDate}`;
      if (!uniqueBatches.has(key)) {
        uniqueBatches.set(key, { beanName: r.beanName, batchDate: r.batchDate });
      }
    }
    for (const { beanName, batchDate } of uniqueBatches.values()) {
      const sameBatch = records
        .filter((r) => r.beanName === beanName && r.batchDate === batchDate)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      let count = 0;
      for (const r of sameBatch) {
        if (r.negativeReason !== null) {
          count++;
        } else {
          break;
        }
      }
      if (count >= 3) {
        return { beanName, batchDate, count };
      }
    }
    return null;
  }, [records]);

  if (!needsCalibration || dismissed) return null;

  return (
    <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-lg overflow-hidden animate-fade-in-up">
      <div className="px-5 py-4 bg-red-500/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500 rounded-full animate-pulse-slow">
            <AlertOctagon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-red-800">校准警告</h3>
            <p className="text-sm text-red-700">
              <span className="font-semibold">{needsCalibration.beanName}</span>
              （批次 {needsCalibration.batchDate}）已连续
              <span className="font-bold text-red-800 mx-1">{needsCalibration.count}</span>
              次差评，建议立即重新校准磨豆机！
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDismissed(true)}
            className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors"
            title="暂时忽略"
          >
            <X className="w-4 h-4" />
          </button>
          <button className="btn btn-danger flex items-center gap-1.5">
            <Wrench className="w-4 h-4" />
            立即校准
          </button>
        </div>
      </div>
    </div>
  );
}
