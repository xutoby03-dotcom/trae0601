import { useAnnealingStore } from '@/store/useAnnealingStore';
import { FURNACE_GRID, GLASS_TYPE_LABELS, GLASS_TYPE_COLORS } from '@/utils/annealing';

export default function FurnaceGrid() {
  const { currentSession } = useAnnealingStore();
  const { works } = currentSession;

  const grid: (typeof works[0] | null)[][] = Array.from({ length: FURNACE_GRID.rows }, () =>
    Array.from({ length: FURNACE_GRID.cols }, () => null)
  );

  for (const work of works) {
    if (work.gridRow < FURNACE_GRID.rows && work.gridCol < FURNACE_GRID.cols) {
      grid[work.gridRow][work.gridCol] = work;
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-amber-100">炉内布局</h3>
        <span className="text-xs text-amber-300/50">
          {works.length} / {FURNACE_GRID.maxCapacity} 格
        </span>
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-furnace-glow/5 to-transparent rounded-xl" />

        <div className="relative p-4">
          <div className="text-xs text-amber-300/40 text-center mb-2">← 炉门（前排矮作品）</div>

          {[...grid].reverse().map((row, reversedIdx) => {
            const rowIndex = FURNACE_GRID.rows - 1 - reversedIdx;
            const scale = 0.85 + (reversedIdx / (FURNACE_GRID.rows - 1)) * 0.25;
            const opacity = 0.6 + (reversedIdx / (FURNACE_GRID.rows - 1)) * 0.4;
            const yOffset = (FURNACE_GRID.rows - 1 - reversedIdx) * 8;

            return (
              <div
                key={rowIndex}
                className="flex gap-2 justify-center mb-1.5"
                style={{
                  transform: `scale(${scale})`,
                  opacity,
                  marginTop: yOffset > 0 ? -yOffset : 0,
                }}
              >
                {row.map((work, colIdx) => (
                  <div
                    key={colIdx}
                    className={`relative w-20 h-16 rounded-lg border-2 transition-all duration-300 ${
                      work
                        ? 'border-amber-400/40 shadow-lg'
                        : 'border-furnace-ash/20 border-dashed'
                    }`}
                    style={{
                      backgroundColor: work
                        ? `${GLASS_TYPE_COLORS[work.type]}15`
                        : 'transparent',
                      borderColor: work ? `${GLASS_TYPE_COLORS[work.type]}60` : undefined,
                    }}
                  >
                    {work && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                        <div
                          className="w-8 rounded-sm mb-0.5"
                          style={{
                            height: `${Math.min(24, work.height * 0.8)}px`,
                            backgroundColor: `${GLASS_TYPE_COLORS[work.type]}50`,
                            border: `1px solid ${GLASS_TYPE_COLORS[work.type]}80`,
                          }}
                        />
                        <span className="text-[9px] text-amber-200/80 font-medium truncate max-w-full">
                          {work.studentName}
                        </span>
                        <span className="text-[8px] text-amber-300/40">
                          {work.height}cm
                        </span>
                      </div>
                    )}
                    {!work && (
                      <div className="absolute inset-0 flex items-center justify-center text-amber-300/20 text-xs">
                        空
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}

          <div className="text-xs text-amber-300/40 text-center mt-2">← 后排（高作品）</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {Object.entries(GLASS_TYPE_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-amber-300/50">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: GLASS_TYPE_COLORS[key as keyof typeof GLASS_TYPE_COLORS] }}
            />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
