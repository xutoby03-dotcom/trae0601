import { useRef, useState, useCallback, useMemo } from 'react';
import { useLightingStore } from '@/store/useLightingStore';
import CanvasDeviceIcon from './CanvasDeviceIcon';
import {
  ZoomIn,
  ZoomOut,
  Ruler,
  User,
  Target,
  Grid3X3,
  Magnet,
} from 'lucide-react';
import type { DeviceCatalogItem } from '@/types';
import { clamp } from '@/utils/common';

const GRID_STEPS = [
  { value: 2.5, label: '2.5% · 细' },
  { value: 5, label: '5% · 标准' },
  { value: 10, label: '10% · 粗' },
];

export default function TopDownCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const setup = useLightingStore((s) => s.currentSetup);
  const selectedId = useLightingStore((s) => s.selectedDeviceId);
  const selectDevice = useLightingStore((s) => s.selectDevice);
  const addDeviceFromCatalog = useLightingStore((s) => s.addDeviceFromCatalog);
  const updateDevice = useLightingStore((s) => s.updateDevice);
  const removeDevice = useLightingStore((s) => s.removeDevice);
  const snapToGrid = useLightingStore((s) => s.snapToGrid);
  const gridStep = useLightingStore((s) => s.gridStep);
  const setSnapToGrid = useLightingStore((s) => s.setSnapToGrid);
  const setGridStep = useLightingStore((s) => s.setGridStep);

  const [dragDeviceId, setDragDeviceId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragOver, setIsDragOver] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showStepMenu, setShowStepMenu] = useState(false);

  const snap = useCallback(
    (val: number): number => {
      if (!snapToGrid) return val;
      return Math.round(val / gridStep) * gridStep;
    },
    [snapToGrid, gridStep]
  );

  const handleMouseDownDevice = useCallback(
    (e: React.MouseEvent, deviceId: string) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const device = setup?.devices.find((d) => d.id === deviceId);
      if (!device) return;
      const deviceCenterX = rect.left + (device.x / 100) * rect.width;
      const deviceCenterY = rect.top + (device.y / 100) * rect.height;
      setDragOffset({
        x: e.clientX - deviceCenterX,
        y: e.clientY - deviceCenterY,
      });
      setDragDeviceId(deviceId);
    },
    [setup]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragDeviceId || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const rawX = clamp(
        ((e.clientX - dragOffset.x - rect.left) / rect.width) * 100,
        4,
        96
      );
      const rawY = clamp(
        ((e.clientY - dragOffset.y - rect.top) / rect.height) * 100,
        6,
        94
      );
      const x = snap(rawX);
      const y = snap(rawY);
      updateDevice(dragDeviceId, { x, y });
    },
    [dragDeviceId, dragOffset, updateDevice, snap]
  );

  const handleMouseUp = useCallback(() => {
    setDragDeviceId(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (!canvasRef.current) return;
      try {
        const raw = e.dataTransfer.getData('application/json');
        const item: DeviceCatalogItem = JSON.parse(raw);
        const rect = canvasRef.current.getBoundingClientRect();
        const rawX = clamp(((e.clientX - rect.left) / rect.width) * 100, 5, 95);
        const rawY = clamp(((e.clientY - rect.top) / rect.height) * 100, 8, 92);
        const x = snap(rawX);
        const y = snap(rawY);
        addDeviceFromCatalog(item, x, y);
      } catch (_err) {
        /* ignore */
      }
    },
    [addDeviceFromCatalog, snap]
  );

  const currentStepLabel = useMemo(
    () => GRID_STEPS.find((s) => s.value === gridStep)?.label ?? `${gridStep}%`,
    [gridStep]
  );

  if (!setup) return null;

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-studio-800 bg-studio-900/40">
        <div className="flex items-center gap-2">
          <Ruler className="w-4 h-4 text-amber-glow" />
          <span className="text-sm font-medium text-studio-200">俯视布光画布</span>
          <span className="chip border-studio-700 text-studio-400 bg-studio-800/50">
            8 × 6 m
          </span>
          <span className="chip border-studio-700 text-studio-400 bg-studio-800/50">
            {setup.devices.length} 个设备
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="relative flex items-center gap-2 pr-2 mr-1 border-r border-studio-800">
            <button
              onClick={() => setSnapToGrid(!snapToGrid)}
              className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all duration-200
                         ${
                           snapToGrid
                             ? 'bg-amber-glow/15 text-amber-glow border border-amber-glow/40'
                             : 'text-studio-400 hover:text-studio-200 hover:bg-studio-800 border border-transparent'
                         }`}
              title={snapToGrid ? '关闭网格吸附' : '开启网格吸附'}
            >
              <Magnet
                className={`w-4 h-4 transition-transform ${snapToGrid ? 'text-amber-glow' : ''}`}
                style={snapToGrid ? { filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.6))' } : {}}
              />
              <Grid3X3 className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold">
                {snapToGrid ? '吸附开' : '吸附关'}
              </span>
            </button>

            <button
              onClick={() => setShowStepMenu((o) => !o)}
              disabled={!snapToGrid}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors
                         ${
                           snapToGrid
                             ? 'text-studio-300 hover:bg-studio-800 hover:text-studio-100'
                             : 'text-studio-600 cursor-not-allowed'
                         }`}
              title="设置吸附精度"
            >
              <span className="font-mono">{currentStepLabel}</span>
            </button>

            {showStepMenu && snapToGrid && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowStepMenu(false)}
                />
                <div className="absolute left-0 top-full mt-1.5 p-1.5 rounded-lg bg-studio-800 border border-studio-700 shadow-2xl z-40 w-36">
                  {GRID_STEPS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => {
                        setGridStep(s.value);
                        setShowStepMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors
                                 ${
                                   s.value === gridStep
                                     ? 'bg-amber-glow/15 text-amber-glow'
                                     : 'text-studio-300 hover:bg-studio-700/60'
                                 }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <span
            className={`flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-md
                       ${
                         snapToGrid
                           ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                           : 'bg-studio-800/50 text-studio-500 border border-studio-700'
                       }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                snapToGrid
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-studio-500'
              }`}
            />
            {snapToGrid
              ? '位置将自动对齐网格点'
              : '自由拖动，无吸附'}
          </span>

          <div className="w-px h-5 bg-studio-700 mx-0.5" />

          <button
            onClick={() => setZoom((z) => clamp(z - 0.1, 0.6, 1.4))}
            className="p-1.5 rounded-md text-studio-400 hover:text-studio-200 hover:bg-studio-800 transition-colors"
            title="缩小"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-studio-400 min-w-[48px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => clamp(z + 0.1, 0.6, 1.4))}
            className="p-1.5 rounded-md text-studio-400 hover:text-studio-200 hover:bg-studio-800 transition-colors"
            title="放大"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-studio-700 mx-1" />
          <button
            onClick={() => setZoom(1)}
            className="text-[11px] px-2 py-1 rounded-md text-studio-400 hover:text-studio-200 hover:bg-studio-800 transition-colors font-medium"
          >
            重置视图
          </button>
        </div>
      </div>

      <div
        className="flex-1 overflow-hidden relative p-6"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          ref={canvasRef}
          onClick={() => selectDevice(null)}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`relative w-full h-full rounded-xl overflow-hidden
                     transition-all duration-300
                     ${isDragOver ? 'ring-2 ring-amber-glow/70 ring-offset-2 ring-offset-studio-950' : ''}`}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <div className="absolute inset-0 bg-studio-900 grid-canvas" />
          <div className="absolute inset-0 grid-canvas-major pointer-events-none" />

          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-2 left-2 text-[10px] font-mono text-studio-600">
              0,0
            </div>
            <div className="absolute top-2 right-2 text-[10px] font-mono text-studio-600">
              8m,0
            </div>
            <div className="absolute bottom-2 left-2 text-[10px] font-mono text-studio-600">
              0,6m
            </div>
            <div className="absolute bottom-2 right-2 text-[10px] font-mono text-studio-600">
              8m,6m
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 top-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-studio-950/60 border border-studio-700/50">
              <Target className="w-3 h-3 text-studio-500" />
              <span className="text-[10px] font-mono text-studio-500">
                背景墙 (北)
              </span>
            </div>
          </div>

          <div
            className="absolute"
            style={{
              left: '50%',
              top: '55%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="relative flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border-2 border-amber-glow/40 flex items-center justify-center bg-studio-950/60 backdrop-blur-sm">
                <User className="w-5 h-5 text-amber-glow/80" />
              </div>
              <span className="mt-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-glow/15 border border-amber-glow/30 text-amber-glow font-medium">
                被摄体
              </span>
              <div className="absolute inset-0 rounded-full border border-amber-glow/20 animate-pulse-ring" />
            </div>
          </div>

          {setup.devices.map((device) => (
            <CanvasDeviceIcon
              key={device.id}
              device={device}
              selected={selectedId === device.id}
              onSelect={() => selectDevice(device.id)}
              onDragStart={(e) => handleMouseDownDevice(e, device.id)}
              onRotate={(delta) =>
                updateDevice(device.id, {
                  rotation: (device.rotation + delta + 360) % 360,
                })
              }
              onRemove={() => removeDevice(device.id)}
            />
          ))}

          {isDragOver && (
            <div className="absolute inset-0 bg-amber-glow/5 flex items-center justify-center pointer-events-none z-20">
              <div className="px-6 py-3 rounded-xl bg-amber-glow/90 text-studio-950 font-semibold text-sm shadow-amber-glow">
                释放以放置设备
              </div>
            </div>
          )}

          {setup.devices.length === 0 && !isDragOver && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-studio-800/60 border border-studio-700 flex items-center justify-center mb-3">
                  <Ruler className="w-7 h-7 text-studio-500" />
                </div>
                <p className="text-studio-400 text-sm font-medium">
                  从左侧元件库拖入灯具和道具
                </p>
                <p className="text-studio-600 text-[11px] mt-1 font-mono">
                  Main · Fill · Rim · Reflector · Background
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
