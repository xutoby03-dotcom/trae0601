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

  const rowOrder: number[] = [];
  for (let r = FURNACE_GRID.rows - 1; r >= 0; r--) rowOrder.push(r);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-amber-100">炉内布局</h3>
        <div className="flex items-center gap-4 text-xs text-amber-300/50">
          <span>{works.length} / {FURNACE_GRID.maxCapacity} 格</span>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(255,107,43,0.12) 0%, rgba(255,107,43,0.04) 40%, transparent 80%)',
          }}
        />

        <div className="relative p-5 flex flex-col items-center">
          <div className="flex items-center gap-2 text-[11px] text-amber-300/40 mb-3">
            <span className="w-5 h-px bg-gradient-to-r from-transparent to-amber-500/30" />
            后排深处（高作品）
            <span className="w-5 h-px bg-gradient-to-l from-transparent to-amber-500/30" />
          </div>

          <div className="flex flex-col items-center">
            {rowOrder.map((rowIndex) => {
              const backDepth = FURNACE_GRID.rows - 1 - rowIndex;
              const scale = 1 - backDepth * 0.06;
              const opacity = 1 - backDepth * 0.15;
              const rowGap = 12 - backDepth * 2;
              void rowGap;

              return (
                <div
                  key={rowIndex}
                  className="flex gap-2 justify-center"
                  style={{
                    transform: `scale(${scale})`,
                    opacity,
                    marginBottom: backDepth === FURNACE_GRID.rows - 1 ? '14px' : '6px',
                    zIndex: rowIndex,
                    position: 'relative',
                  }}
                >
                  {grid[rowIndex].map((work, colIdx) => (
                    <div
                      key={colIdx}
                      className={`relative w-20 h-16 rounded-lg border-2 transition-all duration-300 ${
                        work
                          ? 'shadow-lg'
                          : 'border-furnace-ash/15 border-dashed'
                      }`}
                      style={{
                        backgroundColor: work
                          ? `${GLASS_TYPE_COLORS[work.type]}12`
                          : 'rgba(139, 115, 85, 0.03)',
                        borderColor: work
                          ? `${GLASS_TYPE_COLORS[work.type]}55`
                          : undefined,
                        boxShadow: work
                          ? `0 ${4 + rowIndex}px ${8 + rowIndex * 2}px rgba(0,0,0,${0.25 + rowIndex * 0.05}), inset 0 1px 0 ${GLASS_TYPE_COLORS[work.type]}30`
                          : undefined,
                      }}
                    >
                      {work && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                          <div
                            className="w-7 rounded-sm mb-0.5"
                            style={{
                              height: `${Math.min(22, 6 + work.height * 0.6)}px`,
                              background: `linear-gradient(180deg, ${GLASS_TYPE_COLORS[work.type]}66, ${GLASS_TYPE_COLORS[work.type]}22)`,
                              border: `1px solid ${GLASS_TYPE_COLORS[work.type]}77`,
                              boxShadow: `0 1px 0 ${GLASS_TYPE_COLORS[work.type]}22 inset`,
                            }}
                          />
                          <span className="text-[9px] text-amber-100/85 font-medium truncate max-w-full leading-tight">
                            {work.studentName}
                          </span>
                          <span className="text-[8px] text-amber-300/40 leading-tight">
                            {work.height}cm · {work.maxThickness}mm
                          </span>
                        </div>
                      )}
                      {!work && (
                        <div className="absolute inset-0 flex items-center justify-center text-amber-300/15 text-[10px]">
                          R{rowIndex}C{colIdx}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-amber-300/40 mt-4">
            <span className="w-8 h-0.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
            炉门前排（矮作品）
            <span className="w-8 h-0.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
        {Object.entries(GLASS_TYPE_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-amber-300/55">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: GLASS_TYPE_COLORS[key as keyof typeof GLASS_TYPE_COLORS] }}
            />
            {label}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-amber-300/30 ml-auto">
          行号：row0 前排炉门（矮） → row2 后排（高）
        </div>
      </div>
    </div>
  );
}
