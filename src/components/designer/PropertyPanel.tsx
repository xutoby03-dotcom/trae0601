import { Trash2, RotateCw } from 'lucide-react';
import type { CourseElement, ElementType } from '@/types';

interface PropertyPanelProps {
  element: CourseElement | null;
  onUpdate: (updates: Partial<CourseElement>) => void;
  onDelete: () => void;
}

const typeLabels: Record<ElementType, string> = {
  jump: '障碍',
  arrow: '方向箭头',
  step: '步数提示',
  turn: '转弯半径',
  forbidden: '禁入区域',
};

export default function PropertyPanel({ element, onUpdate, onDelete }: PropertyPanelProps) {
  if (!element) {
    return (
      <div className="bg-white rounded-xl shadow-elegant p-4">
        <h3 className="text-equestrian-brown-700 font-serif font-bold mb-4 text-lg">属性面板</h3>
        <div className="text-center py-8 text-equestrian-brown-400">
          <p className="text-sm">点击画布上的元素</p>
          <p className="text-sm">查看和编辑属性</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-elegant p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-equestrian-brown-700 font-serif font-bold text-lg">属性面板</h3>
        <span className="text-xs bg-equestrian-brown-100 text-equestrian-brown-600 px-2 py-1 rounded">
          {typeLabels[element.type]}
        </span>
      </div>

      <div className="space-y-4">
        {element.type === 'jump' && (
          <>
            <div>
              <label className="block text-sm text-equestrian-brown-600 mb-1">障碍编号</label>
              <input
                type="number"
                value={element.order}
                onChange={(e) => onUpdate({ order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-equestrian-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-equestrian-gold-400 text-equestrian-brown-700"
              />
            </div>
            <div>
              <label className="block text-sm text-equestrian-brown-600 mb-1">显示标签</label>
              <input
                type="text"
                value={element.label || ''}
                onChange={(e) => onUpdate({ label: e.target.value })}
                className="w-full px-3 py-2 border border-equestrian-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-equestrian-gold-400 text-equestrian-brown-700"
                placeholder="默认显示编号"
              />
            </div>
          </>
        )}

        {element.type === 'arrow' && (
          <div>
            <label className="block text-sm text-equestrian-brown-600 mb-1">旋转角度</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={360}
                value={element.rotation || 0}
                onChange={(e) => onUpdate({ rotation: parseInt(e.target.value) })}
                className="flex-1 accent-equestrian-gold-500"
              />
              <span className="text-sm text-equestrian-brown-600 w-12 text-right">
                {element.rotation || 0}°
              </span>
            </div>
          </div>
        )}

        {element.type === 'step' && (
          <div>
            <label className="block text-sm text-equestrian-brown-600 mb-1">步数</label>
            <input
              type="number"
              min={1}
              max={20}
              value={element.steps || 0}
              onChange={(e) => onUpdate({ steps: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-equestrian-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-equestrian-gold-400 text-equestrian-brown-700"
            />
          </div>
        )}

        {element.type === 'turn' && (
          <div>
            <label className="block text-sm text-equestrian-brown-600 mb-1">转弯半径</label>
            <input
              type="number"
              min={30}
              max={150}
              value={element.radius || 50}
              onChange={(e) => onUpdate({ radius: parseInt(e.target.value) || 50 })}
              className="w-full px-3 py-2 border border-equestrian-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-equestrian-gold-400 text-equestrian-brown-700"
            />
          </div>
        )}

        {element.type === 'forbidden' && (
          <>
            <div>
              <label className="block text-sm text-equestrian-brown-600 mb-1">宽度</label>
              <input
                type="number"
                min={40}
                max={200}
                value={element.width || 80}
                onChange={(e) => onUpdate({ width: parseInt(e.target.value) || 80 })}
                className="w-full px-3 py-2 border border-equestrian-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-equestrian-gold-400 text-equestrian-brown-700"
              />
            </div>
            <div>
              <label className="block text-sm text-equestrian-brown-600 mb-1">高度</label>
              <input
                type="number"
                min={40}
                max={200}
                value={element.height || 60}
                onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 60 })}
                className="w-full px-3 py-2 border border-equestrian-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-equestrian-gold-400 text-equestrian-brown-700"
              />
            </div>
          </>
        )}

        <div className="pt-2 border-t border-equestrian-brown-100">
          <div className="text-xs text-equestrian-brown-500 space-y-1">
            <p>X 坐标: {Math.round(element.x)}</p>
            <p>Y 坐标: {Math.round(element.y)}</p>
          </div>
        </div>

        <button
          onClick={onDelete}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm">删除元素</span>
        </button>
      </div>
    </div>
  );
}
