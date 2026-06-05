import { useEmailStore } from '@/store/useEmailStore';
import { ComponentType } from '@/types/email';
import {
  Type, AlignLeft, MousePointerClick, Image, Minus,
  MoveVertical, Columns2, Columns3, Share2, Footprints
} from 'lucide-react';

const componentItems: { type: ComponentType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: 'heading', label: '标题', icon: <Type size={18} />, color: 'text-blue-400' },
  { type: 'paragraph', label: '段落文字', icon: <AlignLeft size={18} />, color: 'text-green-400' },
  { type: 'button', label: '按钮', icon: <MousePointerClick size={18} />, color: 'text-purple-400' },
  { type: 'image', label: '图片', icon: <Image size={18} />, color: 'text-pink-400' },
  { type: 'divider', label: '分隔线', icon: <Minus size={18} />, color: 'text-gray-400' },
  { type: 'spacer', label: '间距块', icon: <MoveVertical size={18} />, color: 'text-amber-400' },
  { type: 'two-column', label: '两列布局', icon: <Columns2 size={18} />, color: 'text-cyan-400' },
  { type: 'three-column', label: '三列布局', icon: <Columns3 size={18} />, color: 'text-teal-400' },
  { type: 'social-icons', label: '社交图标', icon: <Share2 size={18} />, color: 'text-orange-400' },
  { type: 'footer', label: '页脚', icon: <Footprints size={18} />, color: 'text-rose-400' },
];

export default function ComponentPanel() {
  const { addComponent, pushHistory } = useEmailStore();

  const handleDragStart = (e: React.DragEvent, type: ComponentType) => {
    e.dataTransfer.setData('componentType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleClick = (type: ComponentType) => {
    pushHistory();
    addComponent(type);
  };

  return (
    <div className="w-56 bg-[#1a1d23] border-r border-[#2a2d35] flex flex-col shrink-0 overflow-y-auto">
      <div className="px-3 py-3 border-b border-[#2a2d35]">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">组件</h2>
      </div>
      <div className="p-2 space-y-1">
        {componentItems.map(({ type, label, icon, color }) => (
          <div
            key={type}
            draggable
            onDragStart={(e) => handleDragStart(e, type)}
            onClick={() => handleClick(type)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing
              bg-[#22252d] hover:bg-[#2a2d35] border border-transparent hover:border-[#3a3d45]
              transition-all duration-150 group"
          >
            <span className={`${color} group-hover:scale-110 transition-transform`}>{icon}</span>
            <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">{label}</span>
          </div>
        ))}
      </div>
      <div className="px-3 py-3 mt-auto border-t border-[#2a2d35]">
        <p className="text-[10px] text-gray-500 leading-relaxed">
          点击添加到末尾 或 拖拽到画布指定位置
        </p>
      </div>
    </div>
  );
}
