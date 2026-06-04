import { motion } from 'framer-motion';
import { usePhysicsStore } from '../store/physicsStore';

const StatsPanel = () => {
  const { fps, collisionCount } = usePhysicsStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute top-4 right-4 z-20"
    >
      <div className="bg-[#1a1a2e]/90 backdrop-blur-md rounded-xl px-4 py-3 border border-[#00f5d4]/20 shadow-2xl">
        <div className="space-y-1 text-sm font-mono">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">FPS:</span>
            <span className={`font-bold ${
              fps >= 50 ? 'text-[#00f5d4]' : fps >= 30 ? 'text-[#ffe66d]' : 'text-[#ff6b6b]'
            }`}>
              {fps.toFixed(0)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">碰撞:</span>
            <span className="text-[#9d4edd] font-bold">{collisionCount}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsPanel;
