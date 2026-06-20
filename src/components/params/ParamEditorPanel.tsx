import { useState } from 'react';
import { useLightingStore } from '@/store/useLightingStore';
import DeviceParamsForm from './DeviceParamsForm';
import CameraParamsForm from './CameraParamsForm';
import { ChevronDown, ChevronUp, Settings2, Camera } from 'lucide-react';

export default function ParamEditorPanel() {
  const [deviceOpen, setDeviceOpen] = useState(true);
  const [cameraOpen, setCameraOpen] = useState(true);
  const selectedId = useLightingStore((s) => s.selectedDeviceId);

  return (
    <aside className="w-80 shrink-0 h-full bg-studio-900/60 border-l border-studio-800 flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-studio-800">
        <h3 className="text-sm font-semibold text-studio-200 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-amber-glow" />
          参数编辑面板
        </h3>
        <p className="text-[11px] text-studio-500 mt-0.5">
          {selectedId ? '正在编辑选中设备的参数' : '选择画布中的设备以开始编辑'}
        </p>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="border-b border-studio-800">
          <button
            onClick={() => setDeviceOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-studio-800/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Settings2 className="w-3.5 h-3.5 text-studio-400" />
              <span className="text-[12px] font-semibold text-studio-300">
                灯具参数
              </span>
              {selectedId && (
                <span className="chip border-amber-glow/40 bg-amber-glow/10 text-amber-glow">
                  已选中
                </span>
              )}
            </div>
            {deviceOpen ? (
              <ChevronUp className="w-4 h-4 text-studio-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-studio-500" />
            )}
          </button>
          {deviceOpen && (
            <div className="border-t border-studio-800/50 flex-1 flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 380px)' }}>
              <DeviceParamsForm />
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <button
            onClick={() => setCameraOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-studio-800/30 transition-colors border-b border-studio-800"
          >
            <div className="flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-studio-400" />
              <span className="text-[12px] font-semibold text-studio-300">相机参数</span>
            </div>
            {cameraOpen ? (
              <ChevronUp className="w-4 h-4 text-studio-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-studio-500" />
            )}
          </button>
          {cameraOpen && (
            <div className="flex-1 overflow-y-auto">
              <CameraParamsForm />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
