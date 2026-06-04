import { motion } from 'framer-motion';
import {
  Hand,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Pen,
  Waves,
  Link,
  Anchor,
  Sparkles,
} from 'lucide-react';
import type { ToolType } from '../types';
import { usePhysicsStore } from '../store/physicsStore';

const tools: { type: ToolType; icon: React.ComponentType<any>; name: string }[] =
  [
    { type: 'select', icon: Hand, name: '手指工具' },
    { type: 'rectangle', icon: Square, name: '矩形' },
    { type: 'circle', icon: Circle, name: '圆形' },
    { type: 'triangle', icon: Triangle, name: '三角形' },
    { type: 'polygon', icon: Hexagon, name: '多边形' },
    { type: 'freehand', icon: Pen, name: '自由绘制' },
    { type: 'spring', icon: Waves, name: '弹簧' },
    { type: 'rope', icon: Link, name: '绳索' },
    { type: 'joint', icon: Anchor, name: '固定关节' },
    { type: 'emitter', icon: Sparkles, name: '粒子发射器' },
  ];

const Toolbar = () => {
  const { activeTool, setActiveTool } = usePhysicsStore();

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="absolute left-4 top-1/2 -translate-y-1/2 z-20"
    >
      <div className="bg-[#1a1a2e]/90 backdrop-blur-md rounded-xl p-2 border border-[#00f5d4]/20 shadow-2xl">
        <div className="flex flex-col gap-1">
          {tools.map(({ type, icon: Icon, name }) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTool(type)}
              title={name}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 ${
                activeTool === type
                  ? 'bg-[#00f5d4] text-[#1a1a2e] shadow-lg shadow-[#00f5d4]/30'
                  : 'bg-[#2a2a3e] text-gray-300 hover:bg-[#3a3a4e] hover:text-white'
              }`}
            >
              <Icon size={20} />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Toolbar;
