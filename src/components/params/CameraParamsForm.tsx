import { useLightingStore } from '@/store/useLightingStore';
import ColorTempSlider from './ColorTempSlider';
import {
  Camera,
  Focus,
  Aperture,
  Timer,
  Film,
} from 'lucide-react';

const APERTURES = [
  'f/1.2', 'f/1.4', 'f/1.8', 'f/2', 'f/2.8', 'f/4', 'f/5.6', 'f/8', 'f/11', 'f/16', 'f/22',
];
const SHUTTERS = [
  '1/30', '1/60', '1/80', '1/100', '1/125', '1/160', '1/200', '1/250', '1/320', '1/400', '1/500', '1/800', '1/1000',
];
const ISOS = [50, 100, 200, 400, 800, 1600, 3200, 6400, 12800];

export default function CameraParamsForm() {
  const setup = useLightingStore((s) => s.currentSetup);
  const updateCamera = useLightingStore((s) => s.updateCamera);

  if (!setup) return null;
  const c = setup.camera;

  return (
    <div className="p-4 space-y-4 border-t border-studio-800 bg-studio-900/40">
      <div className="flex items-center gap-2">
        <Camera className="w-4 h-4 text-amber-glow" />
        <h5 className="text-sm font-semibold text-studio-200">相机参数</h5>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <label className="text-[11px] text-studio-500 flex items-center gap-1">
            <Camera className="w-3 h-3" /> 机身型号
          </label>
          <input
            type="text"
            value={c.cameraModel}
            onChange={(e) => updateCamera({ cameraModel: e.target.value })}
            className="param-input"
          />
        </div>
        <div className="col-span-2 space-y-1">
          <label className="text-[11px] text-studio-500 flex items-center gap-1">
            <Focus className="w-3 h-3" /> 镜头
          </label>
          <input
            type="text"
            value={c.lens}
            onChange={(e) => updateCamera({ lens: e.target.value })}
            className="param-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] text-studio-500 flex items-center gap-1">
            <Focus className="w-3 h-3" /> 焦距
          </label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={c.focalLength}
              onChange={(e) => updateCamera({ focalLength: Number(e.target.value) })}
              min={8}
              max={800}
              className="param-input !py-1"
            />
            <span className="text-[11px] font-mono text-studio-500 w-6">mm</span>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] text-studio-500 flex items-center gap-1">
            <Aperture className="w-3 h-3" /> 光圈
          </label>
          <select
            value={c.aperture}
            onChange={(e) => updateCamera({ aperture: e.target.value })}
            className="param-input cursor-pointer !py-1"
          >
            {APERTURES.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] text-studio-500 flex items-center gap-1">
            <Timer className="w-3 h-3" /> 快门
          </label>
          <select
            value={c.shutterSpeed}
            onChange={(e) => updateCamera({ shutterSpeed: e.target.value })}
            className="param-input cursor-pointer !py-1"
          >
            {SHUTTERS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] text-studio-500 flex items-center gap-1">
            <Film className="w-3 h-3" /> ISO
          </label>
          <select
            value={c.iso}
            onChange={(e) => updateCamera({ iso: Number(e.target.value) })}
            className="param-input cursor-pointer !py-1"
          >
            {ISOS.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] text-studio-500 flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm color-temp-gradient border border-studio-700" />{' '}
          白平衡
        </label>
        <ColorTempSlider
          value={c.whiteBalance}
          onChange={(v) => updateCamera({ whiteBalance: v })}
          min={2000}
          max={12000}
        />
      </div>

      <div className="mt-2 pt-3 border-t border-studio-800 flex items-center justify-between font-mono">
        <span className="text-[10px] text-studio-500">曝光组合</span>
        <span className="text-[12px] text-amber-glow font-semibold">
          {c.aperture} · {c.shutterSpeed}s · ISO {c.iso}
        </span>
      </div>
    </div>
  );
}
