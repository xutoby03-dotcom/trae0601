import { useLightingStore } from '@/store/useLightingStore';
import {
  DEVICE_TYPE_LABELS,
  DEVICE_TYPE_COLORS,
  LIGHT_MODIFIERS,
  type DeviceType,
} from '@/types';
import ColorTempSlider from './ColorTempSlider';
import {
  Settings2,
  Ruler,
  Layers,
  Gauge,
  ThermometerSun,
  Package,
  Trash2,
  Move,
} from 'lucide-react';

interface SliderRowProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  accent?: string;
}

function SliderRow({
  icon,
  label,
  value,
  unit,
  min,
  max,
  step = 1,
  onChange,
  accent = '#F59E0B',
}: SliderRowProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const decimals = step < 1 ? Math.ceil(-Math.log10(step)) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[12px] text-studio-400">
          <span style={{ color: accent }}>{icon}</span>
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={decimals > 0 ? value.toFixed(decimals) : value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === '' || raw === '-') return;
              const v = Number(raw);
              if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
            }}
            className="w-20 bg-studio-900/80 border border-studio-700 rounded-md px-2 py-1
                     font-mono text-[12px] text-studio-200 outline-none
                     focus:border-amber-glow focus:ring-1 focus:ring-amber-glow/30 text-right"
          />
          <span className="text-[11px] font-mono text-studio-500 w-8">{unit}</span>
        </div>
      </div>
      <div className="relative h-1.5 rounded-full bg-studio-800 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${accent}80, ${accent})`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <div className="flex justify-between text-[9px] font-mono text-studio-600 px-0.5">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}

export default function DeviceParamsForm() {
  const setup = useLightingStore((s) => s.currentSetup);
  const selectedId = useLightingStore((s) => s.selectedDeviceId);
  const updateDevice = useLightingStore((s) => s.updateDevice);
  const removeDevice = useLightingStore((s) => s.removeDevice);
  const selectDevice = useLightingStore((s) => s.selectDevice);

  const device = setup?.devices.find((d) => d.id === selectedId);

  if (!device) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-studio-800/60 border border-studio-700 flex items-center justify-center mb-4">
          <Settings2 className="w-7 h-7 text-studio-600" />
        </div>
        <p className="text-sm text-studio-400 font-medium">未选中设备</p>
        <p className="text-[11px] text-studio-600 mt-1">
          点击画布中的灯具或道具查看参数
        </p>
      </div>
    );
  }

  const color = DEVICE_TYPE_COLORS[device.type as DeviceType];
  const isLight =
    device.type === 'main_light' ||
    device.type === 'fill_light' ||
    device.type === 'rim_light';
  const isReflector = device.type === 'reflector';
  const isBackground = device.type === 'background';

  return (
    <div className="flex-1 overflow-y-auto">
      <div
        className="p-4 border-b border-studio-800"
        style={{
          background: `linear-gradient(135deg, ${color}15, transparent 70%)`,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: color, boxShadow: `0 0 8px ${color}` }}
              />
              <span className="text-[11px] uppercase tracking-widest font-semibold" style={{ color }}>
                {DEVICE_TYPE_LABELS[device.type as DeviceType]}
              </span>
            </div>
            <h4 className="text-base font-semibold text-studio-100 truncate">
              {device.model}
            </h4>
            <p className="text-[11px] font-mono text-studio-500 mt-0.5">
              ID: {device.id.slice(0, 14)}
            </p>
          </div>
          <button
            onClick={() => {
              removeDevice(device.id);
              selectDevice(null);
            }}
            className="p-2 rounded-lg text-studio-400 hover:text-alert-danger hover:bg-alert-dangerBg transition-colors shrink-0"
            title="移除设备"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Move className="w-3.5 h-3.5 text-studio-500" />
            <h5 className="section-label !mb-0">位置与朝向</h5>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SliderRow
              icon={<Ruler className="w-3.5 h-3.5" />}
              label="水平 X"
              value={Math.round(device.x * 10) / 10}
              unit="%"
              min={0}
              max={100}
              step={0.5}
              onChange={(v) => updateDevice(device.id, { x: v })}
              accent={color}
            />
            <SliderRow
              icon={<Ruler className="w-3.5 h-3.5" />}
              label="垂直 Y"
              value={Math.round(device.y * 10) / 10}
              unit="%"
              min={0}
              max={100}
              step={0.5}
              onChange={(v) => updateDevice(device.id, { y: v })}
              accent={color}
            />
            <SliderRow
              icon={<Layers className="w-3.5 h-3.5" />}
              label="朝向角"
              value={device.rotation}
              unit="°"
              min={0}
              max={359}
              onChange={(v) => updateDevice(device.id, { rotation: v })}
              accent={color}
            />
            {!isBackground && (
              <SliderRow
                icon={<Ruler className="w-3.5 h-3.5" />}
                label="距主体"
                value={device.distance ?? 1.5}
                unit="m"
                min={0.2}
                max={8}
                step={0.1}
                onChange={(v) => updateDevice(device.id, { distance: v })}
                accent={color}
              />
            )}
          </div>
        </section>

        {isLight && (
          <>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-studio-700 to-transparent" />
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Gauge className="w-3.5 h-3.5 text-studio-500" />
                <h5 className="section-label !mb-0">灯光参数</h5>
              </div>
              <div className="space-y-4">
                <SliderRow
                  icon={<Gauge className="w-3.5 h-3.5" />}
                  label="输出功率"
                  value={device.power ?? 50}
                  unit="%"
                  min={1}
                  max={100}
                  onChange={(v) => updateDevice(device.id, { power: v })}
                  accent={color}
                />
                <SliderRow
                  icon={<Layers className="w-3.5 h-3.5" />}
                  label="照射角度"
                  value={device.angle ?? 45}
                  unit="°"
                  min={0}
                  max={180}
                  onChange={(v) => updateDevice(device.id, { angle: v })}
                  accent={color}
                />
              </div>
            </section>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-studio-700 to-transparent" />
            <section>
              <div className="flex items-center gap-2 mb-3">
                <ThermometerSun className="w-3.5 h-3.5 text-studio-500" />
                <h5 className="section-label !mb-0">色温</h5>
              </div>
              <ColorTempSlider
                value={device.colorTemp ?? 5500}
                onChange={(v) => updateDevice(device.id, { colorTemp: v })}
              />
            </section>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-studio-700 to-transparent" />
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-3.5 h-3.5 text-studio-500" />
                <h5 className="section-label !mb-0">光效附件</h5>
              </div>
              <select
                value={device.modifier ?? ''}
                onChange={(e) => updateDevice(device.id, { modifier: e.target.value || undefined })}
                className="param-input cursor-pointer"
              >
                <option value="">— 无附件 —</option>
                {LIGHT_MODIFIERS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {device.modifier && (
                <div className="mt-2 flex flex-wrap gap-1">
                  <span
                    className="chip text-studio-300 border-studio-700 bg-studio-800/50"
                    style={{ borderColor: `${color}60` }}
                  >
                    ✓ 当前: {device.modifier}
                  </span>
                </div>
              )}
            </section>
          </>
        )}

        {isReflector && (
          <section>
            <div className="p-3 rounded-lg bg-studio-800/40 border border-studio-700/50">
              <p className="text-[11px] text-studio-400 leading-relaxed">
                <span className="text-amber-glow font-semibold">反光板</span>
                属于被动补光器件，功率与色温属性不适用。
                <br />
                请记录好朝向角与距离被摄体的位置参数。
              </p>
            </div>
          </section>
        )}

        {isBackground && (
          <section>
            <div className="p-3 rounded-lg bg-emerald-500/8 border border-emerald-500/25">
              <p className="text-[11px] text-studio-300 leading-relaxed">
                <span className="text-emerald-400 font-semibold">背景纸</span>{' '}
                通常横跨拍摄区域作为背景。
                <br />
                可在画布中拖动调整位置，或使用上方参数精确控制 X / Y / 朝向角。
                <br />
                如需多背景拼接，可从左侧再拖入多张叠加。
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
