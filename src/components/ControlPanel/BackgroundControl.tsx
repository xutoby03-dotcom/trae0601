

interface BackgroundControlProps {
  backgroundColor: string;
  onChange: (color: string) => void;
}

const presetColors = [
  '#1a1a2e', '#16213e', '#0f0f23', '#1e1e2e',
  '#2d2d44', '#1a1a1a', '#0d1117', '#f5f5f5',
  '#ffffff', '#e8e8e8', '#2c3e50', '#34495e'
];

export function BackgroundControl({ backgroundColor, onChange }: BackgroundControlProps) {
  return (
    <div className="mb-4">
      <h3 className="text-white text-sm font-semibold mb-2">背景颜色</h3>
      <div className="flex flex-wrap gap-2">
        {presetColors.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={`w-7 h-7 rounded-md border-2 transition-all hover:scale-110 ${
              backgroundColor === color ? 'border-cyan-400 scale-110' : 'border-transparent'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <label className="text-gray-400 text-xs">自定义:</label>
        <input
          type="color"
          value={backgroundColor}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer bg-transparent"
        />
        <span className="text-gray-300 text-xs font-mono">{backgroundColor}</span>
      </div>
    </div>
  );
}
