import { ViewPresetDirection } from '../Viewer/useScene';

interface ViewPresetControlProps {
  onViewPreset: (preset: ViewPresetDirection) => void;
  onReset: () => void;
  hasModel: boolean;
}

const presets: { value: ViewPresetDirection; label: string; icon: string }[] = [
  { value: 'front', label: '正视', icon: '⊙' },
  { value: 'back', label: '后视', icon: '⊘' },
  { value: 'left', label: '左视', icon: '◁' },
  { value: 'right', label: '右视', icon: '▷' },
  { value: 'top', label: '顶视', icon: '△' },
  { value: 'bottom', label: '底视', icon: '▽' },
  { value: 'isometric', label: '轴测', icon: '⬡' },
];

export function ViewPresetControl({ onViewPreset, onReset, hasModel }: ViewPresetControlProps) {
  const disabledClass = !hasModel
    ? 'opacity-40 cursor-not-allowed'
    : 'hover:bg-cyan-500/30 hover:text-white';

  const resetDisabledClass = !hasModel
    ? 'opacity-40 cursor-not-allowed'
    : 'hover:bg-amber-500/30 hover:text-white';

  return (
    <div>
      <h3 className="text-white text-sm font-semibold mb-2">视角预设</h3>
      <div className="grid grid-cols-4 gap-1 mb-2">
        {presets.map((p) => (
          <button
            key={p.value}
            onClick={() => hasModel && onViewPreset(p.value)}
            disabled={!hasModel}
            className={`py-1.5 px-1 rounded text-xs font-medium bg-white/10 text-gray-300 
                       transition-all flex flex-col items-center gap-0.5 ${disabledClass}`}
            title={hasModel ? p.label : '请先上传模型'}
          >
            <span className="text-sm leading-none">{p.icon}</span>
            <span className="text-[10px]">{p.label}</span>
          </button>
        ))}
      </div>
      <button
        onClick={() => hasModel && onReset()}
        disabled={!hasModel}
        className={`w-full py-2 rounded text-xs font-medium bg-white/10 text-gray-300 
                   transition-all flex items-center justify-center gap-1.5 ${resetDisabledClass}`}
        title={hasModel ? '复位视角' : '请先上传模型'}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        复位视角
      </button>
    </div>
  );
}
