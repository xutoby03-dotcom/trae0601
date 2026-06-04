

interface MaterialControlProps {
  materialColor: string;
  onChange: (color: string) => void;
}

const presetColors = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#ffffff',
  '#94a3b8', '#64748b', '#475569', '#1e293b'
];

export function MaterialControl({ materialColor, onChange }: MaterialControlProps) {
  return (
    <div className="mb-4">
      <h3 className="text-white text-sm font-semibold mb-2">材质颜色</h3>
      <div className="flex flex-wrap gap-2">
        {presetColors.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={`w-7 h-7 rounded-md border-2 transition-all hover:scale-110 ${
              materialColor.toLowerCase() === color.toLowerCase() 
                ? 'border-cyan-400 scale-110' 
                : 'border-transparent'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <label className="text-gray-400 text-xs">自定义:</label>
        <input
          type="color"
          value={materialColor}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer bg-transparent"
        />
        <span className="text-gray-300 text-xs font-mono">{materialColor}</span>
      </div>
    </div>
  );
}
