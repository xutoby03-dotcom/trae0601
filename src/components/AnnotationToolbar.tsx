import {
  MousePointer2,
  Square,
  ArrowUpRight,
  Type,
  Eraser,
  Palette,
  Tag,
} from 'lucide-react';
import { usePracticeStore } from '@/store/practiceStore';
import type { ToolType, ErrorType } from '@/types';
import { ANNOTATION_COLORS, ERROR_TYPE_LABELS } from '@/types';

const tools: { id: ToolType; icon: typeof MousePointer2; label: string }[] = [
  { id: 'select', icon: MousePointer2, label: '选择' },
  { id: 'rect', icon: Square, label: '矩形框选' },
  { id: 'arrow', icon: ArrowUpRight, label: '箭头指示' },
  { id: 'text', icon: Type, label: '文字批注' },
  { id: 'eraser', icon: Eraser, label: '删除' },
];

export default function AnnotationToolbar() {
  const {
    currentTool,
    currentColor,
    currentErrorType,
    setTool,
    setColor,
    setErrorType,
    annotations,
  } = usePracticeStore();

  return (
    <div className="card p-4">
      <h2 className="section-title">
        <Palette className="w-5 h-5 text-primary-600" />
        标注工具栏
        <span className="ml-auto text-xs font-normal text-gray-400">
          共 {annotations.length} 个标注
        </span>
      </h2>

      <div className="space-y-4">
        <div>
          <div className="text-xs text-gray-500 mb-2">绘图工具</div>
          <div className="grid grid-cols-5 gap-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isActive = currentTool === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => setTool(tool.id)}
                  title={tool.label}
                  className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-soft scale-105'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-primary-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] font-medium">{tool.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-500 mb-2">标注颜色</div>
          <div className="flex gap-2 flex-wrap">
            {ANNOTATION_COLORS.map((color) => {
              const isActive = currentColor === color;
              return (
                <button
                  key={color}
                  onClick={() => setColor(color)}
                  className={`w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center ${
                    isActive ? 'ring-2 ring-offset-2 ring-primary-600 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                >
                  {isActive && <span className="w-2 h-2 bg-white rounded-full" />}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            错误类型标签
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(ERROR_TYPE_LABELS) as ErrorType[]).map((type) => {
              const isActive = currentErrorType === type;
              return (
                <button
                  key={type}
                  onClick={() => setErrorType(type)}
                  className={`text-xs py-2 px-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {ERROR_TYPE_LABELS[type]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 text-xs text-gray-400 leading-relaxed">
          <p className="mb-1">💡 使用提示：</p>
          <ul className="space-y-0.5 pl-3 list-disc">
            <li>暂停视频后可精准标注单帧</li>
            <li>选择工具后在视频画面上拖动</li>
            <li>文字标注点击位置后输入内容</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
