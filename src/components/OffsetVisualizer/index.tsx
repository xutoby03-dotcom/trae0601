import { Crosshair, Layers, AlertTriangle } from 'lucide-react';
import { useCalibrationStore } from '../../store/useCalibrationStore';

const MAX_OFFSET = 2;
const CENTER = 200;
const SCALE = 80;

const offsetToPx = (offset: number) => CENTER + offset * SCALE;

export const OffsetVisualizer = () => {
  const plates = useCalibrationStore(s => s.task.plates);
  const selectedPlateId = useCalibrationStore(s => s.selectedPlateId);
  const selectPlate = useCalibrationStore(s => s.selectPlate);

  const rings = [0.5, 1, 1.5, 2];
  const ticks = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];

  const avgX = plates.length ? plates.reduce((s, p) => s + p.offsetX, 0) / plates.length : 0;
  const avgY = plates.length ? plates.reduce((s, p) => s + p.offsetY, 0) / plates.length : 0;
  const maxOffset = Math.max(...plates.map(p => Math.sqrt(p.offsetX ** 2 + p.offsetY ** 2)), 0);

  return (
    <div className="card-parchment p-5 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-800 flex items-center justify-center">
            <Crosshair className="w-4 h-4 text-copper-300" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-indigo-900 tracking-wide">偏移量靶心图</h2>
            <p className="text-xs text-indigo-700/60">单位：毫米 · 实时展示每色偏移方向与幅度</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-700/50" />
            <span className="text-indigo-700/60">平均偏移</span>
            <span className="font-mono font-semibold text-indigo-900">
              ({avgX.toFixed(2)}, {avgY.toFixed(2)})
            </span>
          </div>
          {maxOffset > 0.5 && (
            <div className="flex items-center gap-1 text-cinnabar-500">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="font-medium">偏差超限</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative bg-parchment-50 rounded-xl border border-copper-100 p-4">
        <svg viewBox="0 0 400 400" className="w-full h-auto max-w-[420px] mx-auto">
          <defs>
            <radialGradient id="targetGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#faf5ef" />
              <stop offset="100%" stopColor="#f0e8d9" />
            </radialGradient>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#d4a574" />
            </marker>
          </defs>

          <circle cx={CENTER} cy={CENTER} r={SCALE * MAX_OFFSET + 8} fill="url(#targetGrad)" stroke="#e5c9a6" strokeWidth="1" />

          {rings.map((r, i) => (
            <circle
              key={r}
              cx={CENTER}
              cy={CENTER}
              r={r * SCALE}
              fill="none"
              stroke={i === 0 ? '#4a7c59' : i === 1 ? '#d4a574' : '#c44536'}
              strokeDasharray={i < 2 ? '0' : '4 4'}
              strokeWidth={i === 0 ? '1.5' : '1'}
              opacity={0.4 + i * 0.15}
            />
          ))}

          {ticks.map(t => (
            <g key={`x-${t}`}>
              <line
                x1={offsetToPx(t)}
                y1={CENTER - 4}
                x2={offsetToPx(t)}
                y2={CENTER + 4}
                stroke="#a86d3a"
                strokeWidth="1"
                opacity="0.4"
              />
              {t !== 0 && (
                <text
                  x={offsetToPx(t)}
                  y={CENTER + 18}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#a86d3a"
                  opacity="0.6"
                  fontFamily="monospace"
                >
                  {t > 0 ? `+${t}` : t}
                </text>
              )}
            </g>
          ))}

          {ticks.map(t => (
            <g key={`y-${t}`}>
              <line
                x1={CENTER - 4}
                y1={offsetToPx(t)}
                x2={CENTER + 4}
                y2={offsetToPx(t)}
                stroke="#a86d3a"
                strokeWidth="1"
                opacity="0.4"
              />
              {t !== 0 && (
                <text
                  x={CENTER - 10}
                  y={offsetToPx(t) + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#a86d3a"
                  opacity="0.6"
                  fontFamily="monospace"
                >
                  {t > 0 ? `+${t}` : t}
                </text>
              )}
            </g>
          ))}

          <line x1={CENTER - SCALE * MAX_OFFSET - 4} y1={CENTER} x2={CENTER + SCALE * MAX_OFFSET + 4} y2={CENTER} stroke="#a86d3a" strokeWidth="0.8" opacity="0.5" />
          <line x1={CENTER} y1={CENTER - SCALE * MAX_OFFSET - 4} x2={CENTER} y2={CENTER + SCALE * MAX_OFFSET + 4} stroke="#a86d3a" strokeWidth="0.8" opacity="0.5" />

          <text x={CENTER + SCALE * MAX_OFFSET - 8} y={CENTER - 10} fontSize="11" fill="#2a4d7a" fontWeight="600" fontFamily="serif">X→</text>
          <text x={CENTER + 10} y={CENTER - SCALE * MAX_OFFSET + 12} fontSize="11" fill="#2a4d7a" fontWeight="600" fontFamily="serif">Y↑</text>

          {plates.map((p, idx) => {
            const px = offsetToPx(Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, p.offsetX)));
            const py = offsetToPx(Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, p.offsetY)));
            const dist = Math.sqrt(p.offsetX ** 2 + p.offsetY ** 2);
            const isSelected = p.id === selectedPlateId;
            const isOOR = dist > MAX_OFFSET;

            return (
              <g
                key={p.id}
                onClick={() => selectPlate(p.id)}
                className="cursor-pointer"
                style={{ transition: 'all 0.3s ease' }}
              >
                <line
                  x1={CENTER}
                  y1={CENTER}
                  x2={px}
                  y2={py}
                  stroke={p.colorHex}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                  strokeOpacity={isSelected ? '0.8' : '0.4'}
                  strokeDasharray={isOOR ? '4 3' : '0'}
                />

                <circle
                  cx={px}
                  cy={py}
                  r={isSelected ? '10' : '7'}
                  fill={p.colorHex}
                  fillOpacity={isSelected ? '0.9' : '0.6'}
                  stroke={isSelected ? '#d4a574' : '#ffffff'}
                  strokeWidth={isSelected ? '3' : '2'}
                  className={`transition-all duration-300 ${isSelected ? 'drop-shadow-[0_0_8px_rgba(212,165,116,0.6)]' : ''}`}
                />

                <text
                  x={px}
                  y={py + 3}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="bold"
                  fill="#fff"
                  fontFamily="monospace"
                  style={{ pointerEvents: 'none' }}
                >
                  {idx + 1}
                </text>

                {isSelected && (
                  <g>
                    <rect
                      x={px + 14}
                      y={py - 22}
                      width="90"
                      height="24"
                      rx="4"
                      fill="#1e3a5f"
                      stroke="#d4a574"
                      strokeWidth="1"
                    />
                    <text x={px + 22} y={py - 6} fontSize="10" fill="#f0e2cf" fontFamily="monospace">
                      ({p.offsetX.toFixed(1)}, {p.offsetY.toFixed(1)})
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          <circle cx={CENTER} cy={CENTER} r="4" fill="#1e3a5f" />
          <circle cx={CENTER} cy={CENTER} r="1.5" fill="#d4a574" />
        </svg>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pt-4 border-t border-copper-100">
          {plates.map((p, idx) => (
            <div
              key={p.id}
              onClick={() => selectPlate(p.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs cursor-pointer transition-all ${
                p.id === selectedPlateId
                  ? 'bg-copper-50 border-copper-300 shadow-sm'
                  : 'bg-white border-copper-100 hover:border-copper-200'
              }`}
            >
              <span
                className="w-3 h-3 rounded-full border border-copper-200/50"
                style={{ backgroundColor: p.colorHex }}
              />
              <span className="font-semibold text-indigo-900">{idx + 1}.</span>
              <span className="text-indigo-700">{p.colorName || `色版${idx + 1}`}</span>
              <span className="font-mono text-indigo-500">
                {p.offsetX >= 0 ? '+' : ''}{p.offsetX.toFixed(1)}/{p.offsetY >= 0 ? '+' : ''}{p.offsetY.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
