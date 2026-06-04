

interface LightControlProps {
  ambientIntensity: number;
  directionalIntensity: number;
  onAmbientChange: (value: number) => void;
  onDirectionalChange: (value: number) => void;
}

export function LightControl({
  ambientIntensity,
  directionalIntensity,
  onAmbientChange,
  onDirectionalChange
}: LightControlProps) {
  return (
    <div className="mb-4">
      <h3 className="text-white text-sm font-semibold mb-3">灯光控制</h3>
      
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <label className="text-gray-400 text-xs">环境光</label>
          <span className="text-cyan-400 text-xs font-mono">{ambientIntensity.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="2"
          step="0.05"
          value={ambientIntensity}
          onChange={(e) => onAmbientChange(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-gray-400 text-xs">方向光</label>
          <span className="text-cyan-400 text-xs font-mono">{directionalIntensity.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="3"
          step="0.05"
          value={directionalIntensity}
          onChange={(e) => onDirectionalChange(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}
