

interface HelperSwitchProps {
  showAxes: boolean;
  showGrid: boolean;
  autoRotate: boolean;
  onAxesChange: (value: boolean) => void;
  onGridChange: (value: boolean) => void;
  onAutoRotateChange: (value: boolean) => void;
}

export function HelperSwitch({
  showAxes,
  showGrid,
  autoRotate,
  onAxesChange,
  onGridChange,
  onAutoRotateChange
}: HelperSwitchProps) {
  const switches = [
    { label: '坐标轴', value: showAxes, onChange: onAxesChange },
    { label: '网格地面', value: showGrid, onChange: onGridChange },
    { label: '自动旋转', value: autoRotate, onChange: onAutoRotateChange }
  ];

  return (
    <div>
      <h3 className="text-white text-sm font-semibold mb-3">辅助显示</h3>
      <div className="space-y-3">
        {switches.map((sw) => (
          <div key={sw.label} className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">{sw.label}</span>
            <div
              className={`switch ${sw.value ? 'active' : ''}`}
              onClick={() => sw.onChange(!sw.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
