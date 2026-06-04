import { motion } from 'framer-motion';
import { Trash2, X, Power } from 'lucide-react';
import { usePhysicsStore } from '../store/physicsStore';

const EmitterPanel = () => {
  const {
    selectedEmitter,
    setSelectedEmitter,
    emitters,
    updateEmitter,
    removeEmitter,
  } = usePhysicsStore();

  const emitter = emitters.find((e) => e.id === selectedEmitter);

  const handlePropertyChange = (property: string, value: number | boolean | string) => {
    if (!selectedEmitter) return;
    updateEmitter(selectedEmitter, { [property]: value });
  };

  const handleDelete = () => {
    if (!selectedEmitter) return;
    removeEmitter(selectedEmitter);
    setSelectedEmitter(null);
  };

  if (!emitter) {
    return null;
  }

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="absolute right-4 top-1/2 -translate-y-1/2 z-20"
    >
      <div className="bg-[#1a1a2e]/90 backdrop-blur-md rounded-xl p-4 border border-[#ff6b6b]/20 shadow-2xl w-72">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">粒子发射器</h3>
          <div className="flex gap-2">
            <button
              onClick={() => handlePropertyChange('active', !emitter.active)}
              className={`p-1.5 rounded-lg transition-colors ${
                emitter.active
                  ? 'bg-[#00f5d4]/20 text-[#00f5d4]'
                  : 'bg-[#3a3a4e] text-gray-400'
              }`}
              title={emitter.active ? '关闭' : '开启'}
            >
              <Power size={16} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              title="删除发射器"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={() => setSelectedEmitter(null)}
              className="p-1.5 rounded-lg bg-[#2a2a3e] text-gray-400 hover:bg-[#3a3a4e] transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs block mb-1">颜色</label>
            <input
              type="color"
              value={emitter.color}
              onChange={(e) => handlePropertyChange('color', e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-[#3a3a4e]"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs block mb-1">
              发射频率: {emitter.frequency}ms
            </label>
            <input
              type="range"
              min="20"
              max="1000"
              step="10"
              value={emitter.frequency}
              onChange={(e) => handlePropertyChange('frequency', parseInt(e.target.value))}
              className="w-full accent-[#ff6b6b]"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs block mb-1">
              初速度 X: {emitter.velocityX.toFixed(1)}
            </label>
            <input
              type="range"
              min="-10"
              max="10"
              step="0.5"
              value={emitter.velocityX}
              onChange={(e) => handlePropertyChange('velocityX', parseFloat(e.target.value))}
              className="w-full accent-[#ff6b6b]"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs block mb-1">
              初速度 Y: {emitter.velocityY.toFixed(1)}
            </label>
            <input
              type="range"
              min="-10"
              max="10"
              step="0.5"
              value={emitter.velocityY}
              onChange={(e) => handlePropertyChange('velocityY', parseFloat(e.target.value))}
              className="w-full accent-[#ff6b6b]"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs block mb-1">
              粒子大小: {emitter.particleSize}px
            </label>
            <input
              type="range"
              min="3"
              max="30"
              step="1"
              value={emitter.particleSize}
              onChange={(e) => handlePropertyChange('particleSize', parseInt(e.target.value))}
              className="w-full accent-[#ff6b6b]"
            />
          </div>

          <div className="pt-2 border-t border-[#3a3a4e]">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-gray-400">位置:</div>
              <div className="text-white text-right">
                {Math.round(emitter.x)}, {Math.round(emitter.y)}
              </div>
              <div className="text-gray-400">状态:</div>
              <div className={`text-right font-medium ${
                emitter.active ? 'text-[#00f5d4]' : 'text-gray-500'
              }`}>
                {emitter.active ? '运行中' : '已暂停'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EmitterPanel;
