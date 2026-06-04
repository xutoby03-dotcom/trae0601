import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Type,
  Grid3x3,
  Pencil,
  Lasso,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { BLEND_MODES } from '../../types';
import type { Layer, BlendMode } from '../../types';

const layerIcons = {
  image: ImageIcon,
  text: Type,
  mosaic: Grid3x3,
  drawing: Pencil,
  cutout: Lasso,
};

interface LayerItemProps {
  layer: Layer;
  index: number;
  totalLayers: number;
}

export const LayerItem = ({ layer, index, totalLayers }: LayerItemProps) => {
  const {
    selectedLayerId,
    selectLayer,
    updateLayer,
    removeLayer,
    duplicateLayer,
    moveLayer,
  } = useEditorStore();

  const Icon = layerIcons[layer.type];
  const isSelected = selectedLayerId === layer.id;

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateLayer(layer.id, { visible: !layer.visible });
  };

  const handleToggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateLayer(layer.id, { locked: !layer.locked });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeLayer(layer.id);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateLayer(layer.id);
  };

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (index < totalLayers - 1) {
      moveLayer(layer.id, index + 1);
    }
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (index > 0) {
      moveLayer(layer.id, index - 1);
    }
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    updateLayer(layer.id, { opacity: Number(e.target.value) });
  };

  const handleBlendModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    updateLayer(layer.id, { blendMode: e.target.value as BlendMode });
  };

  return (
    <div
      onClick={() => selectLayer(layer.id)}
      className={`
        p-2 rounded-lg cursor-pointer transition-all
        ${isSelected
          ? 'bg-blue-600/20 border border-blue-500'
          : 'bg-[#2a2a2a] border border-transparent hover:bg-[#2f2f2f]'
        }
      `}
    >
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={handleToggleVisibility}
          className="p-1 rounded hover:bg-gray-700 transition-colors"
        >
          {layer.visible ? (
            <Eye className="w-4 h-4 text-gray-300" />
          ) : (
            <EyeOff className="w-4 h-4 text-gray-600" />
          )}
        </button>

        <Icon className={`w-4 h-4 ${layer.visible ? 'text-blue-400' : 'text-gray-600'}`} />

        <span className={`flex-1 text-sm truncate ${layer.visible ? 'text-gray-200' : 'text-gray-600'}`}>
          {layer.name}
        </span>

        <button
          onClick={handleToggleLock}
          className="p-1 rounded hover:bg-gray-700 transition-colors"
        >
          {layer.locked ? (
            <Lock className="w-4 h-4 text-orange-400" />
          ) : (
            <Unlock className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleMoveUp}
          disabled={index >= totalLayers - 1}
          className="p-1 rounded hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronUp className="w-3 h-3 text-gray-400" />
        </button>
        <button
          onClick={handleMoveDown}
          disabled={index <= 0}
          className="p-1 rounded hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>

        <div className="flex-1">
          <input
            type="range"
            min="0"
            max="100"
            value={layer.opacity}
            onChange={handleOpacityChange}
            className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <span className="text-xs text-gray-400 w-8 text-right">{layer.opacity}%</span>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <select
          value={layer.blendMode}
          onChange={handleBlendModeChange}
          className="flex-1 bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
        >
          {BLEND_MODES.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.label}
            </option>
          ))}
        </select>

        <button
          onClick={handleDuplicate}
          className="p-1 rounded hover:bg-gray-700 transition-colors"
          title="复制图层"
        >
          <Copy className="w-3.5 h-3.5 text-gray-400" />
        </button>

        <button
          onClick={handleDelete}
          disabled={layer.locked}
          className="p-1 rounded hover:bg-red-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="删除图层"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
        </button>
      </div>
    </div>
  );
};
