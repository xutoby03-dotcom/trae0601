import { useFeedbackStore } from '@/store/useFeedbackStore';
import type { Zone } from '@/types';
import { ZONE_LABELS } from '@/types';

export function ZoneFilter() {
  const { selectedZone, setSelectedZone } = useFeedbackStore();
  const zones: (Zone | 'all')[] = ['all', 'A', 'B', 'C'];

  return (
    <div className="flex gap-2">
      {zones.map((zone) => (
        <button
          key={zone}
          onClick={() => setSelectedZone(zone)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            selectedZone === zone
              ? 'bg-teal-700 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          {zone === 'all' ? '全部区域' : ZONE_LABELS[zone]}
        </button>
      ))}
    </div>
  );
}
