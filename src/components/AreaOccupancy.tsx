import { useBulletinBoardStore } from '../store/useBulletinBoardStore';

export default function AreaOccupancy() {
  const bulletinBoards = useBulletinBoardStore((state) => state.bulletinBoards);
  
  const areaMap = new Map<string, { total: number; occupied: number }>();
  bulletinBoards.forEach((b) => {
    const existing = areaMap.get(b.area) || { total: 0, occupied: 0 };
    areaMap.set(b.area, {
      total: existing.total + b.totalSlots,
      occupied: existing.occupied + b.occupiedSlots,
    });
  });
  
  const areaOccupancy = Array.from(areaMap.entries()).map(([area, data]) => ({
    area,
    total: data.total,
    occupied: data.occupied,
    rate: data.total > 0 ? data.occupied / data.total : 0,
  }));

  const getColorClass = (rate: number) => {
    if (rate >= 0.9) return 'bg-danger';
    if (rate >= 0.7) return 'bg-warning';
    return 'bg-success';
  };

  const getTextColorClass = (rate: number) => {
    if (rate >= 0.9) return 'text-danger';
    if (rate >= 0.7) return 'text-warning';
    return 'text-success';
  };

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">各区域占用率</h3>
      <div className="space-y-5">
        {areaOccupancy.map((area, index) => (
          <div
            key={area.area}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">{area.area}</span>
                <span className="text-xs text-gray-400">
                  {area.occupied}/{area.total} 个槽位
                </span>
              </div>
              <span className={`text-sm font-bold ${getTextColorClass(area.rate)}`}>
                {Math.round(area.rate * 100)}%
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${getColorClass(area.rate)}`}
                style={{ width: `${area.rate * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
