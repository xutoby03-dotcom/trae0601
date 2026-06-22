import React from 'react';
import { useTeaStore } from '@/store/useTeaStore';
import { Direction } from '@/types';
import { Ruler, Users, Footprints, Trash2 } from 'lucide-react';

const PropertyPanel: React.FC = () => {
  const {
    clothConfig,
    updateClothConfig,
    movementPath,
    setMovementPath,
    selectedItemId,
    items,
    removeItem,
    updateItem,
  } = useTeaStore();

  const selectedItem = items.find((item) => item.id === selectedItemId);

  const directionOptions: { value: Direction; label: string }[] = [
    { value: 'top', label: '上方' },
    { value: 'bottom', label: '下方' },
    { value: 'left', label: '左侧' },
    { value: 'right', label: '右侧' },
  ];

  const clothSizes = [
    { label: '小型 (50×35cm)', width: 500, height: 350 },
    { label: '中型 (60×40cm)', width: 600, height: 400 },
    { label: '大型 (80×50cm)', width: 800, height: 500 },
    { label: '方形 (60×60cm)', width: 600, height: 600 },
  ];

  return (
    <div className="w-64 bg-stone-50 border-l border-stone-200 flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-stone-200">
        <h2 className="text-lg font-medium text-stone-800" style={{ fontFamily: 'serif' }}>
          属性
        </h2>
      </div>

      {selectedItem && (
        <div className="p-4 border-b border-stone-200 bg-amber-50">
          <h3 className="text-sm font-medium text-stone-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            选中器物
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-stone-500 block mb-1">名称</label>
              <input
                type="text"
                value={selectedItem.name}
                onChange={(e) => updateItem(selectedItem.id, { name: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-amber-500 bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-stone-500 block mb-1">宽度</label>
                <input
                  type="number"
                  value={Math.round(selectedItem.width)}
                  onChange={(e) =>
                    updateItem(selectedItem.id, { width: Number(e.target.value) })
                  }
                  className="w-full px-2 py-1.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-amber-500 bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">高度</label>
                <input
                  type="number"
                  value={Math.round(selectedItem.height)}
                  onChange={(e) =>
                    updateItem(selectedItem.id, { height: Number(e.target.value) })
                  }
                  className="w-full px-2 py-1.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-amber-500 bg-white"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">旋转角度</label>
              <input
                type="range"
                min="0"
                max="360"
                value={selectedItem.rotation}
                onChange={(e) =>
                  updateItem(selectedItem.id, { rotation: Number(e.target.value) })
                }
                className="w-full accent-amber-600"
              />
              <div className="text-xs text-stone-500 text-center">{selectedItem.rotation}°</div>
            </div>
            <button
              onClick={() => removeItem(selectedItem.id)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors border border-red-200"
            >
              <Trash2 size={14} />
              删除器物
            </button>
          </div>
        </div>
      )}

      <div className="p-4 border-b border-stone-200">
        <h3 className="text-sm font-medium text-stone-700 mb-3 flex items-center gap-2">
          <Ruler size={14} className="text-amber-600" />
          席布尺寸
        </h3>
        <div className="space-y-2">
          {clothSizes.map((size) => (
            <button
              key={size.label}
              onClick={() => updateClothConfig({ width: size.width, height: size.height })}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                clothConfig.width === size.width && clothConfig.height === size.height
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-white text-stone-700 border border-stone-200 hover:border-amber-300'
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-stone-500 block mb-1">宽度 (px)</label>
            <input
              type="number"
              value={clothConfig.width}
              onChange={(e) => updateClothConfig({ width: Number(e.target.value) })}
              className="w-full px-2 py-1.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-amber-500 bg-white"
            />
          </div>
          <div>
            <label className="text-xs text-stone-500 block mb-1">高度 (px)</label>
            <input
              type="number"
              value={clothConfig.height}
              onChange={(e) => updateClothConfig({ height: Number(e.target.value) })}
              className="w-full px-2 py-1.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-amber-500 bg-white"
            />
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-stone-200">
        <h3 className="text-sm font-medium text-stone-700 mb-3 flex items-center gap-2">
          <Users size={14} className="text-teal-600" />
          主客方向
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-stone-500 block mb-1">主人位置</label>
            <select
              value={clothConfig.hostDirection}
              onChange={(e) =>
                updateClothConfig({ hostDirection: e.target.value as Direction })
              }
              className="w-full px-2 py-1.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-amber-500 bg-white"
            >
              {directionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-stone-500 block mb-1">客人位置</label>
            <select
              value={clothConfig.guestDirection}
              onChange={(e) =>
                updateClothConfig({ guestDirection: e.target.value as Direction })
              }
              className="w-full px-2 py-1.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-amber-500 bg-white"
            >
              {directionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1">
        <h3 className="text-sm font-medium text-stone-700 mb-3 flex items-center gap-2">
          <Footprints size={14} className="text-stone-600" />
          取用动线
        </h3>
        <textarea
          value={movementPath}
          onChange={(e) => setMovementPath(e.target.value)}
          placeholder="记录茶席取用动线，如：主泡器位于中央，左手取茶荷，右手持壶..."
          className="w-full h-32 px-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-amber-500 bg-white resize-none"
        />
        <p className="text-xs text-stone-400 mt-2">
          记录冲泡流程中手的移动路径，便于教学讲解
        </p>
      </div>
    </div>
  );
};

export default PropertyPanel;
