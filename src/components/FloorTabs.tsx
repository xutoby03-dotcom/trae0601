import { useFeedbackStore } from '@/store/useFeedbackStore';
import type { Floor } from '@/types';
import { FLOOR_LABELS } from '@/types';

export function FloorTabs() {
  const { selectedFloor, setSelectedFloor } = useFeedbackStore();
  const floors: Floor[] = [1, 2, 3];

  return (
    <div className="flex gap-2">
      {floors.map((floor) => (
        <button
          key={floor}
          onClick={() => setSelectedFloor(floor)}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
            selectedFloor === floor
              ? 'bg-teal-700 text-white shadow-lg transform -translate-y-0.5'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          {FLOOR_LABELS[floor]}
        </button>
      ))}
    </div>
  );
}
