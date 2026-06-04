import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  SkipForward,
  Download,
  Upload,
  Plus,
  Grid3X3,
  ArrowDown,
  RefreshCw,
} from 'lucide-react';
import Matter from 'matter-js';
import { useRef } from 'react';
import { usePhysicsStore } from '../store/physicsStore';
import {
  togglePause,
  stepEngine,
  setGravity,
  setTimeScale,
  getEngine,
} from '../physics/engine';
import { downloadScene, uploadScene } from '../utils/indexedDB';
import { generateId } from '../physics/tools';
import type { SceneData, BodyData, ConstraintData } from '../types';

const { Composite } = Matter;

const ControlBar = () => {
  const {
    isPaused,
    setIsPaused,
    timeScale,
    gravity,
    setShowSceneList,
    showGravityControl,
    setShowGravityControl,
    emitters,
  } = usePhysicsStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCurrentWorldData = () => {
    const engine = getEngine();
    const bodies: BodyData[] = [];
    const constraints: ConstraintData[] = [];

    if (engine) {
      const allBodies = Composite.allBodies(engine.world);
      allBodies.forEach((body) => {
        if (
          body.label !== 'ground' &&
          body.label !== 'wall' &&
          body.label !== 'ceiling' &&
          body.label !== 'particle'
        ) {
          bodies.push({
            id: String(body.id),
            type: body.label || 'rectangle',
            x: body.position.x,
            y: body.position.y,
            angle: body.angle,
            density: body.density,
            friction: body.friction,
            restitution: body.restitution,
            isStatic: body.isStatic,
            color: (body.render as any)?.fillStyle || '#00f5d4',
            label: body.label || '',
            radius: body.circleRadius,
            vertices: body.vertices.map((v) => ({ x: v.x, y: v.y })),
          });
        }
      });

      const allConstraints = Composite.allConstraints(engine.world);
      allConstraints.forEach((constraint) => {
        constraints.push({
          id: String(constraint.id),
          type: (constraint.label as 'spring' | 'rope' | 'joint') || 'spring',
          bodyA: constraint.bodyA ? String(constraint.bodyA.id) : null,
          bodyB: constraint.bodyB ? String(constraint.bodyB.id) : null,
          stiffness: constraint.stiffness,
          damping: constraint.damping,
          length: constraint.length,
          pointA: constraint.pointA
            ? { x: constraint.pointA.x, y: constraint.pointA.y }
            : undefined,
          pointB: constraint.pointB
            ? { x: constraint.pointB.x, y: constraint.pointB.y }
            : undefined,
        });
      });
    }

    return { bodies, constraints };
  };

  const handlePlayPause = () => {
    const newPaused = !isPaused;
    setIsPaused(newPaused);
    togglePause(newPaused);
  };

  const handleStep = () => {
    stepEngine();
  };

  const handleTimeScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const scale = parseFloat(e.target.value);
    setTimeScale(scale);
  };

  const handleGravityChange = (axis: 'x' | 'y', value: number) => {
    const newGravity = { ...gravity, [axis]: value };
    setGravity(newGravity.x, newGravity.y);
    (window as any).updatePhysicsGravity?.(newGravity.x, newGravity.y);
  };

  const handleExport = () => {
    const { bodies, constraints } = getCurrentWorldData();
    const currentScene: SceneData = {
      id: generateId(),
      name: '导出场景',
      gravityX: gravity.x,
      gravityY: gravity.y,
      timeScale,
      isPaused,
      bodies,
      constraints,
      emitters: emitters,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    downloadScene(currentScene);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const scene = await uploadScene(file);
        (window as any).loadSceneData?.(scene);
      } catch (error) {
        console.error('导入失败:', error);
      }
    }
    e.target.value = '';
  };

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
    >
      <div className="bg-[#1a1a2e]/90 backdrop-blur-md rounded-xl px-4 py-2 border border-[#00f5d4]/20 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 pr-4 border-r border-[#3a3a4e]">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePlayPause}
              className="p-2 rounded-lg bg-[#00f5d4] text-[#1a1a2e] hover:bg-[#00d4b8] transition-colors"
              title={isPaused ? '播放' : '暂停'}
            >
              {isPaused ? <Play size={18} /> : <Pause size={18} />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStep}
              className="p-2 rounded-lg bg-[#2a2a3e] text-gray-300 hover:bg-[#3a3a4e] transition-colors"
              title="步进"
            >
              <SkipForward size={18} />
            </motion.button>

            <div className="flex items-center gap-2 ml-2">
              <span className="text-gray-400 text-xs">速度</span>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={timeScale}
                onChange={handleTimeScaleChange}
                className="w-20 accent-[#00f5d4]"
              />
              <span className="text-[#00f5d4] text-xs w-8">{timeScale.toFixed(1)}x</span>
            </div>
          </div>

          <div className="flex items-center gap-1 pr-4 border-r border-[#3a3a4e]">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowGravityControl(!showGravityControl)}
              className={`p-2 rounded-lg transition-colors ${
                showGravityControl
                  ? 'bg-[#9d4edd] text-white'
                  : 'bg-[#2a2a3e] text-gray-300 hover:bg-[#3a3a4e]'
              }`}
              title="重力控制"
            >
              <ArrowDown size={18} />
            </motion.button>

            {showGravityControl && (
              <div className="flex items-center gap-2 ml-2 p-2 bg-[#2a2a3e] rounded-lg">
                <div className="flex flex-col items-center">
                  <span className="text-gray-400 text-xs">X</span>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={gravity.x}
                    onChange={(e) => handleGravityChange('x', parseFloat(e.target.value))}
                    className="w-16 accent-[#9d4edd]"
                  />
                  <span className="text-[#9d4edd] text-xs">{gravity.x.toFixed(1)}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-gray-400 text-xs">Y</span>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={gravity.y}
                    onChange={(e) => handleGravityChange('y', parseFloat(e.target.value))}
                    className="w-16 accent-[#9d4edd]"
                  />
                  <span className="text-[#9d4edd] text-xs">{gravity.y.toFixed(1)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSceneList(true)}
              className="p-2 rounded-lg bg-[#2a2a3e] text-gray-300 hover:bg-[#3a3a4e] transition-colors"
              title="场景列表"
            >
              <Grid3X3 size={18} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (window as any).clearAllBodies?.()}
              className="p-2 rounded-lg bg-[#2a2a3e] text-gray-300 hover:bg-[#3a3a4e] transition-colors"
              title="清空场景"
            >
              <RefreshCw size={18} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (window as any).createNewScene?.()}
              className="p-2 rounded-lg bg-[#2a2a3e] text-gray-300 hover:bg-[#3a3a4e] transition-colors"
              title="新建场景"
            >
              <Plus size={18} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              className="p-2 rounded-lg bg-[#2a2a3e] text-gray-300 hover:bg-[#3a3a4e] transition-colors"
              title="导出场景"
            >
              <Download size={18} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleImportClick}
              className="p-2 rounded-lg bg-[#2a2a3e] text-gray-300 hover:bg-[#3a3a4e] transition-colors"
              title="导入场景"
            >
              <Upload size={18} />
            </motion.button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ControlBar;
