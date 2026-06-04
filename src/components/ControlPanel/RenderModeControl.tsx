
import { RenderMode } from '../../types';

interface RenderModeControlProps {
  renderMode: RenderMode;
  onChange: (mode: RenderMode) => void;
}

const modes: { value: RenderMode; label: string; icon: string }[] = [
  { value: 'solid', label: '实体', icon: '◼' },
  { value: 'wireframe', label: '线框', icon: '⊡' },
  { value: 'transparent', label: '半透明', icon: '◻' }
];

export function RenderModeControl({ renderMode, onChange }: RenderModeControlProps) {
  return (
    <div className="mb-4">
      <h3 className="text-white text-sm font-semibold mb-2">渲染模式</h3>
      <div className="flex gap-1">
        {modes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => onChange(mode.value)}
            className={`flex-1 py-2 px-2 rounded text-xs font-medium transition-all ${
              renderMode === mode.value
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <span className="mr-1">{mode.icon}</span>
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
}
