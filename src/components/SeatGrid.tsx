import { useFeedbackStore } from '@/store/useFeedbackStore';
import { SeatCard } from './SeatCard';
import { ZONE_LABELS } from '@/types';

export function SeatGrid() {
  const { getFilteredSeats, selectedZone } = useFeedbackStore();
  const filteredSeats = getFilteredSeats();

  const groupedByZone = filteredSeats.reduce((acc, seat) => {
    if (!acc[seat.zone]) acc[seat.zone] = [];
    acc[seat.zone].push(seat);
    return acc;
  }, {} as Record<string, typeof filteredSeats>);

  const zones = selectedZone === 'all' ? ['A', 'B', 'C'] : [selectedZone];

  return (
    <div className="space-y-8">
      {zones.map((zone) => (
        <div key={zone} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-teal-600 rounded-full"></span>
            {ZONE_LABELS[zone as 'A' | 'B' | 'C']}
          </h3>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {groupedByZone[zone]
              ?.sort((a, b) => a.deskNumber - b.deskNumber || a.seatNumber - b.seatNumber)
              .map((seat) => (
                <SeatCard key={seat.id} seat={seat} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
