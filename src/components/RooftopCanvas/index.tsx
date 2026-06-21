import { useRef, useState, useCallback, useEffect } from 'react';
import { useWindStore } from '../../store/useWindStore';
import { useWindSimulation } from '../../hooks/useWindSimulation';
import { useParticleSystem } from '../../hooks/useParticleSystem';
import { RooftopShape } from './RooftopShape';
import { FlagPole } from './FlagPole';
import { Sensor } from './Sensor';
import { WindParticles } from './WindParticles';
import { ZoomIn, ZoomOut, Move, Maximize2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '@/lib/utils';

export const RooftopCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const {
    rooftop,
    poles,
    sensors,
    selectedPoleId,
    focusedPoleId,
    zoom,
    pan,
    contextMenu,
    setZoom,
    setPan,
    setSelectedPoleId,
    setContextMenu,
    getPoleRiskMark,
  } = useWindStore();

  const { currentWindData, getPoleStats, getPoleCurrentTangling } = useWindSimulation();

  const { particles } = useParticleSystem({
    windData: currentWindData,
    canvasWidth: rooftop.width,
    canvasHeight: rooftop.height,
    enabled: true,
  });

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(zoom + delta);
  }, [zoom, setZoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || e.shiftKey) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart, setPan]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as SVGElement).tagName === 'svg') {
      setSelectedPoleId(null);
      setContextMenu(null);
    }
  }, [setSelectedPoleId, setContextMenu]);

  const handlePoleContextMenu = useCallback((e: React.MouseEvent, poleId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      poleId,
    });
  }, [setContextMenu]);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [setContextMenu]);

  useEffect(() => {
    if (!focusedPoleId || !containerRef.current) return;
    const pole = poles.find(p => p.id === focusedPoleId);
    if (!pole) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const poleScreenX = pole.x * zoom;
    const poleScreenY = pole.y * zoom;
    setPan({
      x: centerX - poleScreenX,
      y: centerY - poleScreenY,
    });
    useWindStore.setState({ focusedPoleId: null });
  }, [focusedPoleId, poles, zoom, setPan]);

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full overflow-hidden rounded-xl bg-slate-900/50 border border-slate-700/50',
        isDragging && 'cursor-grabbing'
      )}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
        <Button
          size="icon"
          variant="secondary"
          onClick={() => setZoom(zoom + 0.2)}
          title="放大"
        >
          <ZoomIn size={16} />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={() => setZoom(zoom - 0.2)}
          title="缩小"
        >
          <ZoomOut size={16} />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={handleResetView}
          title="重置视图"
        >
          <Maximize2 size={16} />
        </Button>
      </div>

      <div className="absolute bottom-4 left-4 text-xs text-slate-400 font-mono bg-slate-800/80 px-3 py-1.5 rounded-lg z-20">
        <div className="flex items-center gap-2">
          <Move size={12} className="text-cyan-400" />
          <span>Shift+拖拽平移 | 滚轮缩放 | 点击旗杆查看详情 | 右键标记风险</span>
        </div>
      </div>

      <div className="absolute top-4 left-4 text-xs text-slate-400 font-mono bg-slate-800/80 px-3 py-1.5 rounded-lg z-20">
        <span className="text-cyan-400">{rooftop.name}</span>
        <span className="mx-2">|</span>
        <span>缩放: {(zoom * 100).toFixed(0)}%</span>
      </div>

      <svg
        ref={svgRef}
        width={rooftop.width}
        height={rooftop.height}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'top left',
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        <WindParticles particles={particles} windSpeed={currentWindData.windSpeed} />
        <RooftopShape rooftop={rooftop} />
        {sensors.map((sensor) => (
          <Sensor key={sensor.id} sensor={sensor} />
        ))}
        {poles.map((pole) => (
          <FlagPole
            key={pole.id}
            pole={pole}
            stats={getPoleStats(pole.id)}
            currentTangling={getPoleCurrentTangling(pole.id)}
            windDirection={currentWindData.windDirection}
            isSelected={selectedPoleId === pole.id}
            riskMark={getPoleRiskMark(pole.id)}
            onClick={() => setSelectedPoleId(pole.id)}
            onContextMenu={(e) => handlePoleContextMenu(e, pole.id)}
          />
        ))}
      </svg>

      <div className="absolute bottom-4 right-4 flex gap-3 text-xs font-mono bg-slate-800/80 px-3 py-2 rounded-lg z-20">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-slate-400">低风险</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-slate-400">中风险</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-slate-400">高风险</span>
        </div>
      </div>
    </div>
  );
};
