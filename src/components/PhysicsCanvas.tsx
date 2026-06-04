import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { usePhysicsStore } from '../store/physicsStore';
import {
  createRectangle,
  createCircle,
  createTriangle,
  createPolygon,
  createFreehand,
  applyExplosion,
  generateId,
} from '../physics/tools';
import { createSpring, createRope, createJoint } from '../physics/constraints';
import {
  initPhysics,
  cleanupPhysics,
  getEngine,
  onCollision,
  setGravity,
  setTimeScale,
  clearWorld,
} from '../physics/engine';
import type { SceneData, BodyData, ConstraintData, EmitterData } from '../types';
import { generateThumbnail, saveScene } from '../utils/indexedDB';

const { Mouse, MouseConstraint, Composite, Events, Bodies, Constraint, Render } =
  Matter;

interface PhysicsCanvasProps {
  onGetPresetData: () => {
    bodies: BodyData[];
    constraints: ConstraintData[];
    emitters: EmitterData[];
    gravityX: number;
    gravityY: number;
    timeScale: number;
    isPaused: boolean;
  };
}

const PhysicsCanvas = ({ onGetPresetData }: PhysicsCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const {
    activeTool,
    setActiveTool,
    selectedBody,
    setSelectedBody,
    gravity,
    timeScale,
    isPaused,
    zoom,
    setZoom,
    pan,
    setPan,
    emitters,
    addEmitter,
    updateEmitter,
    removeEmitter,
    setFps,
    setCollisionCount,
    setScenes,
    currentSceneId,
    setCurrentSceneId,
    setMouseConstraint,
    drawState,
    setDrawState,
  } = usePhysicsStore();

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const isPanningRef = useRef(false);
  const lastPanPosRef = useRef({ x: 0, y: 0 });
  const emitterIntervalsRef = useRef<Map<string, number>>(new Map());

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
    if (!canvasRef.current || dimensions.width === 0) return;

    const { engine, render } = initPhysics(
      canvasRef.current,
      dimensions.width,
      dimensions.height
    );

    const mouse = Mouse.create(canvasRef.current);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false,
        },
      },
    });

    Composite.add(engine.world, mouseConstraint);
    setMouseConstraint(mouseConstraint);

    let collisionCount = 0;
    onCollision(() => {
      collisionCount++;
      setCollisionCount(collisionCount);
    });

    Events.on(engine, 'afterUpdate', () => {
      frameCountRef.current++;
      const now = Date.now();
      if (now - lastTimeRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
    });

    (window as any).updatePhysicsGravity = (x: number, y: number) => {
      setGravity(x, y);
    };

    (window as any).loadSceneData = (scene: SceneData) => {
      loadScene(scene);
    };

    (window as any).clearAllBodies = () => {
      clearUserCreatedBodies();
    };

    (window as any).createNewScene = () => {
      createNewScene();
    };

    return () => {
      cleanupPhysics();
    };
  }, [dimensions]);

  useEffect(() => {
    const engine = getEngine();
    if (engine) {
      setTimeScale(timeScale);
    }
  }, [timeScale]);

  useEffect(() => {
    const engine = getEngine();
    if (!engine || isPaused) return;

    emitterIntervalsRef.current.forEach((interval) => clearInterval(interval));
    emitterIntervalsRef.current.clear();

    emitters.forEach((emitter) => {
      if (!emitter.active) return;

      const interval = window.setInterval(() => {
        const particle = Bodies.circle(
          emitter.x,
          emitter.y,
          emitter.particleSize,
          {
            density: 0.001,
            restitution: 0.5,
            friction: 0.1,
            render: { fillStyle: emitter.color },
            label: 'particle',
          }
        );
        Matter.Body.setVelocity(particle, {
          x: emitter.velocityX,
          y: emitter.velocityY,
        });
        Composite.add(engine.world, particle);
      }, emitter.frequency);

      emitterIntervalsRef.current.set(emitter.id, interval);
    });

    return () => {
      emitterIntervalsRef.current.forEach((interval) => clearInterval(interval));
      emitterIntervalsRef.current.clear();
    };
  }, [emitters, isPaused]);

  const clearUserCreatedBodies = () => {
    const engine = getEngine();
    if (!engine) return;

    const bodies = Composite.allBodies(engine.world);
    const constraints = Composite.allConstraints(engine.world);

    bodies.forEach((body) => {
      if (body.label !== 'ground' && body.label !== 'wall' && body.label !== 'ceiling') {
        Composite.remove(engine.world, body);
      }
    });

    constraints.forEach((constraint) => {
      Composite.remove(engine.world, constraint);
    });

    emitters.forEach((e) => removeEmitter(e.id));
    setSelectedBody(null);
  };

  const createNewScene = () => {
    clearUserCreatedBodies();
    const newSceneId = generateId();
    setCurrentSceneId(newSceneId);
  };

  const loadScene = (scene: SceneData) => {
    const engine = getEngine();
    if (!engine) return;

    clearUserCreatedBodies();
    setCurrentSceneId(scene.id);

    scene.bodies.forEach((bodyData) => {
      let body: Matter.Body;

      if (bodyData.type === 'circle' || bodyData.radius) {
        body = Bodies.circle(bodyData.x, bodyData.y, bodyData.radius || 20, {
          isStatic: bodyData.isStatic,
          density: bodyData.density,
          friction: bodyData.friction,
          restitution: bodyData.restitution,
          render: { fillStyle: bodyData.color },
          label: bodyData.label,
        });
      } else if (bodyData.vertices && bodyData.vertices.length > 0) {
        body = Bodies.fromVertices(
          bodyData.x,
          bodyData.y,
          [bodyData.vertices],
          {
            isStatic: bodyData.isStatic,
            density: bodyData.density,
            friction: bodyData.friction,
            restitution: bodyData.restitution,
            render: { fillStyle: bodyData.color },
            label: bodyData.label,
          }
        );
      } else {
        body = Bodies.rectangle(
          bodyData.x,
          bodyData.y,
          bodyData.width || 50,
          bodyData.height || 50,
          {
            isStatic: bodyData.isStatic,
            density: bodyData.density,
            friction: bodyData.friction,
            restitution: bodyData.restitution,
            render: { fillStyle: bodyData.color },
            label: bodyData.label,
          }
        );
      }

      Matter.Body.setAngle(body, bodyData.angle);
      Composite.add(engine.world, body);
    });

    scene.constraints.forEach((constraintData) => {
      const bodyA = scene.bodies.find((b) => b.id === constraintData.bodyA);
      const bodyB = scene.bodies.find((b) => b.id === constraintData.bodyB);

      const findBodyById = (id: string | null) => {
        if (!id) return null;
        return Composite.allBodies(engine.world).find(
          (b) => String(b.id) === id
        );
      };

      const actualBodyA = findBodyById(constraintData.bodyA);
      const actualBodyB = findBodyById(constraintData.bodyB);

      if (actualBodyA || actualBodyB) {
        const constraint = Constraint.create({
          bodyA: actualBodyA || undefined,
          bodyB: actualBodyB || undefined,
          pointA: constraintData.pointA,
          pointB: constraintData.pointB,
          stiffness: constraintData.stiffness,
          damping: constraintData.damping,
          length: constraintData.length,
          render: {
            visible: true,
            strokeStyle:
              constraintData.type === 'spring'
                ? '#00f5d4'
                : constraintData.type === 'rope'
                ? '#ffe66d'
                : '#ff6b6b',
            lineWidth: constraintData.type === 'joint' ? 4 : 2,
          },
          label: constraintData.type,
        });
        Composite.add(engine.world, constraint);
      }
    });

    scene.emitters.forEach((e) => addEmitter(e));
    setGravity(scene.gravityX, scene.gravityY);
    setTimeScale(scene.timeScale);
  };

  const saveCurrentScene = async () => {
    const engine = getEngine();
    if (!engine) return;

    const presetData = onGetPresetData();

    const scene: SceneData = {
      id: currentSceneId || generateId(),
      name: `场景 ${new Date().toLocaleString()}`,
      thumbnail: canvasRef.current
        ? generateThumbnail(canvasRef.current)
        : undefined,
      gravityX: gravity.x,
      gravityY: gravity.y,
      timeScale,
      isPaused,
      bodies: presetData.bodies,
      constraints: presetData.constraints,
      emitters: presetData.emitters,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await saveScene(scene);

    const savedScenes = (await import('../utils/indexedDB')).getAllScenes();
    setScenes(await savedScenes);
    setCurrentSceneId(scene.id);
  };

  const getCanvasCoords = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };

    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getCanvasCoords(e);
    const engine = getEngine();

    if (e.button === 2) {
      e.preventDefault();
      if (engine) {
        applyExplosion(engine, x, y, 0.5, 200);
      }
      return;
    }

    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      isPanningRef.current = true;
      lastPanPosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (activeTool === 'select') {
      setDrawState({ isDrawing: true, startX: x, startY: y, currentX: x, currentY: y, points: [], constraintStart: null });
    } else if (
      ['rectangle', 'circle', 'triangle', 'polygon', 'freehand'].includes(
        activeTool
      )
    ) {
      setDrawState({
        isDrawing: true,
        startX: x,
        startY: y,
        currentX: x,
        currentY: y,
        points: activeTool === 'freehand' ? [{ x, y }] : [],
        constraintStart: null,
      });
    } else if (['spring', 'rope', 'joint'].includes(activeTool)) {
      const bodies = engine ? Composite.allBodies(engine.world) : [];
      const clickedBody = Matter.Query.point(bodies, { x, y })[0];

      if (drawState.constraintStart) {
        if (engine) {
          let constraint: Matter.Constraint;
          const bodyA = drawState.constraintStart.bodyId
            ? bodies.find(
                (b) => String(b.id) === drawState.constraintStart?.bodyId
              ) || null
            : null;
          const pointA = bodyA
            ? undefined
            : { x: drawState.constraintStart.x, y: drawState.constraintStart.y };

          if (activeTool === 'spring') {
            constraint = createSpring(bodyA, clickedBody || null, pointA, {
              x,
              y,
            });
          } else if (activeTool === 'rope') {
            constraint = createRope(bodyA, clickedBody || null, pointA, {
              x,
              y,
            });
          } else {
            if (!bodyA || !clickedBody) {
              setDrawState({ constraintStart: null });
              return;
            }
            constraint = createJoint(bodyA, clickedBody);
          }

          Composite.add(engine.world, constraint);
        }
        setDrawState({ constraintStart: null });
      } else {
        setDrawState({
          constraintStart: {
            bodyId: clickedBody ? String(clickedBody.id) : null,
            x,
            y,
          },
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { x, y } = getCanvasCoords(e);

    if (isPanningRef.current) {
      const dx = e.clientX - lastPanPosRef.current.x;
      const dy = e.clientY - lastPanPosRef.current.y;
      setPan(pan.x + dx, pan.y + dy);
      lastPanPosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (drawState.isDrawing) {
      if (activeTool === 'freehand') {
        setDrawState({
          currentX: x,
          currentY: y,
          points: [...drawState.points, { x, y }],
        });
      } else {
        setDrawState({ currentX: x, currentY: y });
      }
    }

    const ctx = overlayRef.current?.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      if (drawState.isDrawing) {
        ctx.save();
        ctx.translate(pan.x, pan.y);
        ctx.scale(zoom, zoom);
        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([5 / zoom, 5 / zoom]);

        const startX = drawState.startX;
        const startY = drawState.startY;

        if (activeTool === 'rectangle') {
          const width = x - startX;
          const height = y - startY;
          ctx.strokeRect(startX, startY, width, height);
        } else if (activeTool === 'circle') {
          const radius = Math.sqrt(
            Math.pow(x - startX, 2) + Math.pow(y - startY, 2)
          );
          ctx.beginPath();
          ctx.arc(startX, startY, radius, 0, Math.PI * 2);
          ctx.stroke();
        } else if (activeTool === 'triangle' || activeTool === 'polygon') {
          const radius = Math.sqrt(
            Math.pow(x - startX, 2) + Math.pow(y - startY, 2)
          );
          const sides = activeTool === 'triangle' ? 3 : 6;
          ctx.beginPath();
          for (let i = 0; i <= sides; i++) {
            const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
            const px = startX + radius * Math.cos(angle);
            const py = startY + radius * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        } else if (activeTool === 'freehand' && drawState.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(drawState.points[0].x, drawState.points[0].y);
          drawState.points.forEach((p) => ctx.lineTo(p.x, p.y));
          ctx.stroke();
        }

        ctx.restore();
      }

      if (drawState.constraintStart) {
        ctx.save();
        ctx.translate(pan.x, pan.y);
        ctx.scale(zoom, zoom);
        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([5 / zoom, 5 / zoom]);
        ctx.beginPath();
        ctx.moveTo(drawState.constraintStart.x, drawState.constraintStart.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.restore();
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      return;
    }

    if (!drawState.isDrawing) return;

    const { x, y } = getCanvasCoords(e);
    const engine = getEngine();

    if (activeTool === 'select') {
      const bodies = engine ? Composite.allBodies(engine.world) : [];
      const clickedBody = Matter.Query.point(bodies, { x, y })[0];

      if (clickedBody) {
        setSelectedBody(String(clickedBody.id));
        if (clickedBody.render) {
          (clickedBody.render as any).strokeStyle = '#00f5d4';
          (clickedBody.render as any).lineWidth = 3;
        }
      } else {
        const prevSelected = selectedBody
          ? bodies.find((b) => String(b.id) === selectedBody)
          : null;
        if (prevSelected && prevSelected.render) {
          (prevSelected.render as any).strokeStyle = '#ffffff22';
          (prevSelected.render as any).lineWidth = 2;
        }
        setSelectedBody(null);
      }
    } else if (
      ['rectangle', 'circle', 'triangle', 'polygon'].includes(activeTool)
    ) {
      const startX = drawState.startX;
      const startY = drawState.startY;
      const dx = x - startX;
      const dy = y - startY;
      const size = Math.sqrt(dx * dx + dy * dy);

      if (size < 10) {
        setDrawState({ isDrawing: false });
        return;
      }

      let body: Matter.Body | null = null;

      if (activeTool === 'rectangle') {
        body = createRectangle(
          startX + dx / 2,
          startY + dy / 2,
          Math.abs(dx),
          Math.abs(dy)
        );
      } else if (activeTool === 'circle') {
        body = createCircle(startX, startY, size / 2);
      } else if (activeTool === 'triangle') {
        body = createTriangle(startX, startY, size / 2);
      } else if (activeTool === 'polygon') {
        body = createPolygon(startX, startY, 6, size / 2);
      }

      if (body && engine) {
        Composite.add(engine.world, body);
      }
    } else if (activeTool === 'freehand' && drawState.points.length > 3) {
      const body = createFreehand(drawState.points);
      if (body && engine) {
        Composite.add(engine.world, body);
      }
    }

    setDrawState({ isDrawing: false, points: [] });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(zoom * delta);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-[#1a1a2e]"
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          isPanningRef.current = false;
          setDrawState({ isDrawing: false, points: [] });
        }}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
      />
      <canvas
        ref={overlayRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0 pointer-events-none"
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 245, 212, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 245, 212, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />
    </div>
  );
};

export default PhysicsCanvas;
