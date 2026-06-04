import { useEffect, useState, useCallback } from 'react';
import Matter from 'matter-js';
import Toolbar from './components/Toolbar';
import PropertyPanel from './components/PropertyPanel';
import ControlBar from './components/ControlBar';
import StatsPanel from './components/StatsPanel';
import SceneSelector from './components/SceneSelector';
import PhysicsCanvas from './components/PhysicsCanvas';
import type { SceneData, BodyData, ConstraintData, EmitterData } from './types';
import { getAllPresets } from './physics/presets';
import { getAllScenes } from './utils/indexedDB';
import { usePhysicsStore } from './store/physicsStore';
import { getEngine } from './physics/engine';

const { Composite } = Matter;

function App() {
  const [presets, setPresets] = useState<SceneData[]>([]);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const { emitters, gravity, timeScale, isPaused, setScenes, setCurrentSceneId } =
    usePhysicsStore();

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const presetScenes = getAllPresets(dimensions.width, dimensions.height);
    setPresets(presetScenes);
  }, [dimensions]);

  useEffect(() => {
    const loadSavedScenes = async () => {
      const saved = await getAllScenes();
      setScenes(saved);
    };
    loadSavedScenes();
  }, []);

  const getPresetData = useCallback((): {
    bodies: BodyData[];
    constraints: ConstraintData[];
    emitters: EmitterData[];
    gravityX: number;
    gravityY: number;
    timeScale: number;
    isPaused: boolean;
  } => {
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

    return {
      bodies,
      constraints,
      emitters,
      gravityX: gravity.x,
      gravityY: gravity.y,
      timeScale,
      isPaused,
    };
  }, [emitters, gravity, timeScale, isPaused]);

  const handleLoadScene = useCallback((scene: SceneData) => {
    (window as any).loadSceneData?.(scene);
  }, []);

  const handleSaveCurrent = useCallback(async () => {
    // 触发PhysicsCanvas中的保存逻辑
    const event = new CustomEvent('saveScene');
    window.dispatchEvent(event);
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#1a1a2e]">
      <PhysicsCanvas onGetPresetData={getPresetData} />
      <Toolbar />
      <PropertyPanel />
      <ControlBar />
      <StatsPanel />
      <SceneSelector
        presets={presets}
        onLoadScene={handleLoadScene}
        onSaveCurrent={handleSaveCurrent}
      />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-[#1a1a2e]/90 backdrop-blur-md rounded-xl px-4 py-2 border border-[#00f5d4]/20 shadow-xl">
          <p className="text-gray-400 text-xs">
            <span className="text-[#00f5d4]">左键拖动</span> 创建物体 |
            <span className="text-[#9d4edd]"> 右键点击</span> 爆炸冲击 |
            <span className="text-[#ff6b6b]"> Alt+拖动</span> 平移视图 |
            <span className="text-[#ffe66d]"> 滚轮</span> 缩放
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
