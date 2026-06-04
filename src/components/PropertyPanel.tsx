import { motion } from 'framer-motion';
import { Trash2, X } from 'lucide-react';
import { usePhysicsStore } from '../store/physicsStore';
import { updateBodyProperties } from '../physics/tools';
import { getEngine } from '../physics/engine';
import Matter from 'matter-js';

const PropertyPanel = () => {
  const { selectedBody, setSelectedBody } = usePhysicsStore();

  const engine = getEngine();
  const body = selectedBody && engine
    ? Matter.Composite.allBodies(engine.world).find(
        (b) => String(b.id) === selectedBody
      )
    : null;

  const handlePropertyChange = (property: string, value: number | boolean | string) => {
    if (!body) return;
    
    const updates: any = {};
    updates[property] = value;
    updateBodyProperties(body, updates);
  };

  const handleDelete = () => {
    if (!body || !engine) return;
    Matter.Composite.remove(engine.world, body);
    setSelectedBody(null);
  };

  if (!body) {
    return (
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20"
      >
        <div className="bg-[#1a1a2e]/90 backdrop-blur-md rounded-xl p-4 border border-[#00f5d4]/20 shadow-2xl w-64">
          <p className="text-gray-400 text-sm text-center">
            选择一个物体查看属性
          </p>
        </div>
      </motion.div>
    );
  }

  const color = (body.render as any)?.fillStyle || '#00f5d4';

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="absolute right-4 top-1/2 -translate-y-1/2 z-20"
    >
      <div className="bg-[#1a1a2e]/90 backdrop-blur-md rounded-xl p-4 border border-[#00f5d4]/20 shadow-2xl w-72">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">物体属性</h3>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              title="删除物体"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={() => setSelectedBody(null)}
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
              value={color}
              onChange={(e) => handlePropertyChange('color', e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-[#3a3a4e]"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs block mb-1">
              密度: {body.density.toFixed(4)}
            </label>
            <input
              type="range"
              min="0.0001"
              max="0.01"
              step="0.0001"
              value={body.density}
              onChange={(e) => handlePropertyChange('density', parseFloat(e.target.value))}
              className="w-full accent-[#00f5d4]"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs block mb-1">
              摩擦: {body.friction.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={body.friction}
              onChange={(e) => handlePropertyChange('friction', parseFloat(e.target.value))}
              className="w-full accent-[#00f5d4]"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs block mb-1">
              弹性恢复: {body.restitution.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={body.restitution}
              onChange={(e) => handlePropertyChange('restitution', parseFloat(e.target.value))}
              className="w-full accent-[#00f5d4]"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-gray-400 text-xs">静态物体</label>
            <button
              onClick={() => handlePropertyChange('isStatic', !body.isStatic)}
              className={`w-12 h-6 rounded-full transition-colors ${
                body.isStatic ? 'bg-[#00f5d4]' : 'bg-[#3a3a4e]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  body.isStatic ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="pt-2 border-t border-[#3a3a4e]">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-gray-400">类型:</div>
              <div className="text-white text-right">{body.label || 'object'}</div>
              <div className="text-gray-400">位置:</div>
              <div className="text-white text-right">
                {Math.round(body.position.x)}, {Math.round(body.position.y)}
              </div>
              <div className="text-gray-400">质量:</div>
              <div className="text-white text-right">{body.mass.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyPanel;
