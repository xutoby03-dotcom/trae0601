import { useRef } from 'react';
import type { DeviceCatalogItem } from '@/types';
import { getDeviceCatalog } from '@/data/deviceCatalog';
import {
  DEVICE_TYPE_LABELS,
  DEVICE_TYPE_COLORS,
  type DeviceType,
} from '@/types';
import {
  Flashlight,
  Lamp,
  Sun,
  CircleDot,
  RectangleHorizontal,
  GripVertical,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<DeviceType, LucideIcon> = {
  main_light: Flashlight,
  fill_light: Lamp,
  rim_light: Sun,
  reflector: CircleDot,
  background: RectangleHorizontal,
};

const TYPES: DeviceType[] = ['main_light', 'fill_light', 'rim_light', 'reflector', 'background'];

interface Props {
  onDragStartDevice?: (item: DeviceCatalogItem) => void;
}

export default function DeviceLibrary({ onDragStartDevice }: Props) {
  const dragData = useRef<DeviceCatalogItem | null>(null);

  const handleDragStart = (e: React.DragEvent, item: DeviceCatalogItem) => {
    dragData.current = item;
    onDragStartDevice?.(item);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify(item));
  };

  return (
    <aside className="w-64 shrink-0 h-full bg-studio-900/60 border-r border-studio-800 flex flex-col overflow-hidden">
      <div className="px-4 py-4 border-b border-studio-800">
        <h3 className="text-sm font-semibold text-studio-200 flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-amber-glow" />
          设备元件库
        </h3>
        <p className="text-[11px] text-studio-500 mt-1">拖拽到画布放置灯具</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {TYPES.map((type) => {
          const items = getDeviceCatalog(type);
          const Icon = ICONS[type];
          const color = DEVICE_TYPE_COLORS[type];
          return (
            <section key={type}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <Icon className="w-3.5 h-3.5" style={{ color }} />
                <span className="text-[11px] uppercase tracking-widest text-studio-400 font-semibold">
                  {DEVICE_TYPE_LABELS[type]}
                </span>
                <span className="chip border-studio-700 text-studio-500 ml-auto">
                  {items.length}款
                </span>
              </div>
              <div className="space-y-1.5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    className="group cursor-grab active:cursor-grabbing rounded-lg border border-studio-700/50 bg-studio-850/70
                             hover:border-amber-glow/50 hover:bg-studio-800 transition-all duration-200
                             px-3 py-2.5 select-none relative overflow-hidden"
                    style={{
                      boxShadow: 'inset 2px 0 0 0 ' + color,
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className="mt-0.5 w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                        style={{
                          background: `${color}18`,
                          border: `1px solid ${color}50`,
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-medium text-studio-200 truncate group-hover:text-amber-glow transition-colors">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-studio-500 truncate mt-0.5 font-mono">
                          {item.model}
                        </div>
                        {item.maxPower && (
                          <div className="flex gap-2 mt-1">
                            <span className="chip border-studio-700 text-studio-400">
                              {item.maxPower}Ws
                            </span>
                            {item.defaultColorTemp && (
                              <span className="chip border-studio-700 text-studio-400">
                                {item.defaultColorTemp}K
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="w-3 h-3 text-studio-500" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="p-3 border-t border-studio-800 bg-studio-900/80">
        <div className="text-[10px] text-studio-500 leading-relaxed">
          <p className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-glow inline-block" />
            从左侧拖入设备，画布中可继续拖动位置
          </p>
        </div>
      </div>
    </aside>
  );
}
