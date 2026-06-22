import { Flag, ArrowRight, Footprints, RefreshCw, Ban } from 'lucide-react';
import type { ElementType } from '@/types';

interface ToolbarProps {
  onAddElement: (type: ElementType) => void;
}

const tools: { type: ElementType; label: string; icon: React.ReactNode; description: string }[] = [
  { type: 'jump', label: '障碍', icon: <Flag className="w-5 h-5" />, description: '添加障碍栏杆' },
  { type: 'arrow', label: '方向箭头', icon: <ArrowRight className="w-5 h-5" />, description: '指示行进方向' },
  { type: 'step', label: '步数提示', icon: <Footprints className="w-5 h-5" />, description: '标注两障碍间步数' },
  { type: 'turn', label: '转弯半径', icon: <RefreshCw className="w-5 h-5" />, description: '标记转弯区域' },
  { type: 'forbidden', label: '禁入区域', icon: <Ban className="w-5 h-5" />, description: '禁止进入区域' },
];

export default function Toolbar({ onAddElement }: ToolbarProps) {
  return (
    <div className="bg-white rounded-xl shadow-elegant p-4">
      <h3 className="text-equestrian-brown-700 font-serif font-bold mb-4 text-lg">元素工具</h3>
      <div className="space-y-2">
        {tools.map((tool) => (
          <button
            key={tool.type}
            onClick={() => onAddElement(tool.type)}
            className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-equestrian-brown-100 hover:border-equestrian-gold-400 hover:bg-equestrian-gold-50 transition-all group"
          >
            <div className="w-10 h-10 bg-equestrian-brown-100 group-hover:bg-equestrian-gold-100 rounded-lg flex items-center justify-center text-equestrian-brown-600 group-hover:text-equestrian-gold-700 transition-colors">
              {tool.icon}
            </div>
            <div className="text-left">
              <div className="font-medium text-equestrian-brown-700">{tool.label}</div>
              <div className="text-xs text-equestrian-brown-400">{tool.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
