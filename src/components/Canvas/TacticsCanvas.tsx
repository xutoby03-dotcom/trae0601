import { useEffect, useRef, useState } from 'react';
import { useTacticsStore } from '@/store/useTacticsStore';
import { FIELD_WIDTH, FIELD_HEIGHT } from '@/types';
import Field from './Field';
import PlayerItem from './PlayerItem';
import DiscItem from './DiscItem';
import RoutePath from './RoutePath';
import FakeNodeItem from './FakeNodeItem';
import TransferWindowIndicator from './TransferWindowIndicator';
import CollisionMarker from './CollisionMarker';
import ActualTrajectory from './ActualTrajectory';
import { getPlayerPositionAtTime, getDiscPositionAtTime } from '@/utils/pathCalculations';

export default function TacticsCanvas() {
  const {
    play,
    currentTool,
    currentTime,
    isPlaying,
    showRoutes,
    showFakeNodes,
    showTransferWindows,
    showCollisionRisks,
    addPlayer,
    addKeyframe,
    addFakeNode,
    setDiscPosition,
    setSelected,
    routeDrawingPlayerId,
    setRouteDrawingPlayer,
    highlightedPlayerId,
    highlightedEventId,
    highlightedEventType,
  } = useTacticsStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(8);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const scaleX = containerWidth / FIELD_WIDTH;
        const scaleY = containerHeight / FIELD_HEIGHT;
        setScale(Math.min(scaleX, scaleY) * 0.95);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const getSvgPoint = (e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    return { x, y };
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const point = getSvgPoint(e);

    if (currentTool === 'offense') {
      addPlayer('offense', point);
    } else if (currentTool === 'defense') {
      addPlayer('defense', point);
    } else if (currentTool === 'disc') {
      setDiscPosition(point);
    } else if (currentTool === 'route' && routeDrawingPlayerId) {
      addKeyframe(routeDrawingPlayerId, currentTime, point);
    } else if (currentTool === 'fake' && routeDrawingPlayerId) {
      addFakeNode(routeDrawingPlayerId, point, currentTime);
    } else if (currentTool === 'select') {
      setSelected(null, null);
    }
  };

  const svgWidth = FIELD_WIDTH * scale;
  const svgHeight = FIELD_HEIGHT * scale;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-[#0a0f0d]"
    >
      <svg
        ref={svgRef}
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        onClick={handleCanvasClick}
        className="rounded-lg shadow-2xl"
        style={{
          cursor:
            currentTool === 'select'
              ? 'default'
              : currentTool === 'route' || currentTool === 'fake'
              ? 'crosshair'
              : 'copy',
        }}
      >
        <Field scale={scale} />

        {showRoutes &&
          play.routes.map((route) => {
            const player = play.players.find((p) => p.id === route.playerId);
            if (!player) return null;
            const lastKfTime =
              route.keyframes.length > 0
                ? Math.max(...route.keyframes.map((k) => k.time))
                : 1;
            const progress = Math.min(1, currentTime / lastKfTime);
            const isHighlightedRoute = highlightedPlayerId === route.playerId;
            return (
              <RoutePath
                key={route.id}
                route={route}
                player={player}
                scale={scale}
                progress={progress}
                isHighlighted={isHighlightedRoute}
              />
            );
          })}

        {play.players.map((player) => {
          const playerPositions = play.actualPositions.filter(
            (p) => p.playerId === player.id,
          );
          if (playerPositions.length === 0) return null;
          const isHighlighted = highlightedPlayerId === player.id;
          return (
            <ActualTrajectory
              key={`actual-${player.id}`}
              player={player}
              positions={playerPositions}
              deviationStats={play.deviationStats[player.id]}
              scale={scale}
              currentTime={currentTime}
              isHighlighted={isHighlighted}
            />
          );
        })}

        {showTransferWindows &&
          play.transferWindows.map((window) => (
            <TransferWindowIndicator
              key={window.id}
              window={window}
              scale={scale}
              currentTime={currentTime}
              isHighlighted={
                highlightedEventId === window.id &&
                highlightedEventType === 'transfer'
              }
            />
          ))}

        {showCollisionRisks &&
          play.collisionRisks.map((risk) => (
            <CollisionMarker
              key={risk.id}
              risk={risk}
              scale={scale}
              isActive={Math.abs(currentTime - risk.time) < 0.5}
              isHighlighted={
                highlightedEventId === risk.id &&
                highlightedEventType === 'collision'
              }
            />
          ))}

        {showFakeNodes &&
          play.fakeNodes.map((node) => (
            <FakeNodeItem
              key={node.id}
              node={node}
              scale={scale}
              isActive={Math.abs(currentTime - node.time) < 0.3}
              isHighlighted={
                highlightedEventId === node.id &&
                highlightedEventType === 'fake'
              }
            />
          ))}

        {play.players.map((player) => {
          const pos = getPlayerPositionAtTime(player, play.routes, currentTime);
          return (
            <PlayerItem
              key={player.id}
              player={player}
              currentX={pos.x}
              currentY={pos.y}
              scale={scale}
              isAnimated={isPlaying}
            />
          );
        })}

        <DiscItem
          x={getDiscPositionAtTime(play.disc, play.players, play.routes, currentTime).x}
          y={getDiscPositionAtTime(play.disc, play.players, play.routes, currentTime).y}
          scale={scale}
        />
      </svg>
    </div>
  );
}
