import React, { useState } from 'react';
import { TaskNode, Dependency, LinkDragState, DependencyType } from '../types';

const DEP_TYPES: DependencyType[] = ['FS', 'SS', 'FF', 'SF'];
const DEP_LABELS: Record<DependencyType, string> = {
  FS: '完成→开始',
  SS: '开始→开始',
  FF: '完成→完成',
  SF: '开始→完成',
};
const DEP_COLORS: Record<DependencyType, string> = {
  FS: '#52c41a',
  SS: '#1890ff',
  FF: '#722ed1',
  SF: '#fa8c16',
};

interface DependencyArrowsProps {
  tasks: TaskNode[];
  dependencies: Dependency[];
  getTaskLeft: (date: string) => number;
  getTaskWidth: (task: TaskNode) => number;
  getTaskTop: (taskId: string) => number;
  dayWidth: number;
  chartWidth: number;
  chartHeight: number;
  linkDragState: LinkDragState;
  onDeleteDependency: (depId: string) => void;
  onUpdateDependency: (depId: string, newType: DependencyType) => void;
  resourceFilter: string | null;
  visibleTaskIds: Set<string>;
}

const DependencyArrows: React.FC<DependencyArrowsProps> = ({
  tasks,
  dependencies,
  getTaskLeft,
  getTaskWidth,
  getTaskTop,
  dayWidth,
  chartWidth,
  chartHeight,
  linkDragState,
  onDeleteDependency,
  onUpdateDependency,
  resourceFilter,
  visibleTaskIds,
}) => {
  const [menuDepId, setMenuDepId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const getTaskById = (id: string): TaskNode | undefined => {
    return tasks.find((t) => t.id === id);
  };

  const getSourcePoint = (
    source: TaskNode,
    target: TaskNode,
    type: DependencyType
  ): { x: number; y: number } => {
    const sourceLeft = getTaskLeft(source.startDate);
    const sourceWidth = getTaskWidth(source);
    const sourceTop = getTaskTop(source.id);

    const y = sourceTop + 12;
    let x: number;

    if (type === 'FS' || type === 'FF') {
      x = sourceLeft + sourceWidth;
    } else {
      x = sourceLeft;
    }

    return { x, y };
  };

  const getTargetPoint = (
    source: TaskNode,
    target: TaskNode,
    type: DependencyType
  ): { x: number; y: number } => {
    const targetLeft = getTaskLeft(target.startDate);
    const targetWidth = getTaskWidth(target);
    const targetTop = getTaskTop(target.id);

    const y = targetTop + 12;
    let x: number;

    if (type === 'FS' || type === 'SS') {
      x = targetLeft;
    } else {
      x = targetLeft + targetWidth;
    }

    return { x, y };
  };

  const generatePath = (
    source: TaskNode,
    target: TaskNode,
    type: DependencyType
  ): string => {
    const sourcePt = getSourcePoint(source, target, type);
    const targetPt = getTargetPoint(source, target, type);

    const sameRow = sourcePt.y === targetPt.y;
    const horizontalGap = 20;
    const verticalGap = 18;

    if (sameRow) {
      if (sourcePt.x <= targetPt.x) {
        return `M ${sourcePt.x} ${sourcePt.y} L ${targetPt.x - 8} ${targetPt.y}`;
      } else {
        const midY = sourcePt.y + verticalGap;
        return `M ${sourcePt.x} ${sourcePt.y} 
                L ${sourcePt.x + horizontalGap} ${sourcePt.y}
                L ${sourcePt.x + horizontalGap} ${midY}
                L ${targetPt.x - horizontalGap} ${midY}
                L ${targetPt.x - horizontalGap} ${targetPt.y}
                L ${targetPt.x - 8} ${targetPt.y}`;
      }
    }

    const midY = (sourcePt.y + targetPt.y) / 2;

    if (sourcePt.x <= targetPt.x) {
      const elbowX1 = sourcePt.x + horizontalGap;
      const elbowX2 = targetPt.x - 8;

      return `M ${sourcePt.x} ${sourcePt.y}
              L ${elbowX1} ${sourcePt.y}
              L ${elbowX1} ${targetPt.y}
              L ${elbowX2} ${targetPt.y}`;
    } else {
      const elbowX1 = sourcePt.x + horizontalGap;
      const elbowX2 = targetPt.x - horizontalGap;

      return `M ${sourcePt.x} ${sourcePt.y}
              L ${elbowX1} ${sourcePt.y}
              L ${elbowX1} ${midY}
              L ${elbowX2} ${midY}
              L ${elbowX2} ${targetPt.y}
              L ${targetPt.x - 8} ${targetPt.y}`;
    }
  };

  const handleLineClick = (e: React.MouseEvent, dep: Dependency) => {
    e.stopPropagation();
    const svgRect = (e.currentTarget.closest('svg') as SVGSVGElement)?.getBoundingClientRect();
    if (!svgRect) return;
    setMenuDepId(dep.id);
    setMenuPos({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleTypeSelect = (type: DependencyType) => {
    if (menuDepId) {
      onUpdateDependency(menuDepId, type);
    }
    setMenuDepId(null);
  };

  const handleDeleteFromMenu = () => {
    if (menuDepId) {
      onDeleteDependency(menuDepId);
    }
    setMenuDepId(null);
  };

  const closeMenu = () => setMenuDepId(null);

  const filteredDependencies = dependencies.filter((dep) => {
    const sourceVisible = visibleTaskIds.has(dep.sourceId);
    const targetVisible = visibleTaskIds.has(dep.targetId);
    if (!sourceVisible || !targetVisible) return false;
    if (!resourceFilter) return true;
    const source = getTaskById(dep.sourceId);
    const target = getTaskById(dep.targetId);
    return (
      source?.assignees.includes(resourceFilter) ||
      target?.assignees.includes(resourceFilter)
    );
  });

  return (
    <>
      <svg
        className="dependency-svg"
        width={chartWidth}
        height={chartHeight}
        style={{ zIndex: 1 }}
      >
        <defs>
          {DEP_TYPES.map((type) => (
            <marker
              key={type}
              id={`arrowhead-${type.toLowerCase()}`}
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill={DEP_COLORS[type]} />
            </marker>
          ))}
          <marker
            id="arrowhead-drag"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#ff4d4f" />
          </marker>
        </defs>

        {filteredDependencies.map((dep) => {
          const source = getTaskById(dep.sourceId);
          const target = getTaskById(dep.targetId);
          if (!source || !target) return null;

          const path = generatePath(source, target, dep.type);
          const markerId = `arrowhead-${dep.type.toLowerCase()}`;
          const strokeColor = DEP_COLORS[dep.type];

          const sourcePt = getSourcePoint(source, target, dep.type);
          const targetPt = getTargetPoint(source, target, dep.type);
          const midX = (sourcePt.x + targetPt.x) / 2;
          const midY = (sourcePt.y + targetPt.y) / 2;

          return (
            <g key={dep.id}>
              <path
                d={path}
                fill="none"
                stroke="transparent"
                strokeWidth={12}
                style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                onClick={(e) => handleLineClick(e, dep)}
              />
              <path
                className="dependency-line"
                d={path}
                stroke={strokeColor}
                strokeWidth={2}
                markerEnd={`url(#${markerId})`}
                style={{ pointerEvents: 'none' }}
              />
              <g
                transform={`translate(${midX}, ${midY})`}
                style={{ cursor: 'pointer', pointerEvents: 'all' }}
                onClick={(e) => handleLineClick(e, dep)}
              >
                <rect
                  x={-16}
                  y={-9}
                  width={32}
                  height={18}
                  rx={3}
                  fill="#fff"
                  stroke={strokeColor}
                  strokeWidth={1}
                />
                <text
                  x={0}
                  y={1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={10}
                  fontWeight={600}
                  fill={strokeColor}
                  style={{ userSelect: 'none' }}
                >
                  {dep.type}
                </text>
              </g>
            </g>
          );
        })}

        {linkDragState.isDragging && linkDragState.sourceId && (
          <g>
            <path
              d={`M ${linkDragState.startX} ${linkDragState.startY} 
                  C ${(linkDragState.startX + linkDragState.currentX) / 2} ${linkDragState.startY},
                    ${(linkDragState.startX + linkDragState.currentX) / 2} ${linkDragState.currentY},
                    ${linkDragState.currentX - 10} ${linkDragState.currentY}`}
              fill="none"
              stroke="#ff4d4f"
              strokeWidth={2}
              strokeDasharray="5,5"
              markerEnd="url(#arrowhead-drag)"
            />
          </g>
        )}
      </svg>

      {menuDepId && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
            onClick={closeMenu}
          />
          <div
            style={{
              position: 'fixed',
              left: menuPos.x,
              top: menuPos.y,
              background: '#fff',
              borderRadius: 6,
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              zIndex: 1000,
              minWidth: 140,
              padding: '4px 0',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '6px 12px',
                fontSize: 11,
                color: '#999',
                borderBottom: '1px solid #f0f0f0',
                fontWeight: 600,
              }}
            >
              切换依赖类型
            </div>
            {DEP_TYPES.map((type) => {
              const dep = dependencies.find((d) => d.id === menuDepId);
              const isCurrent = dep?.type === type;
              return (
                <div
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: isCurrent ? '#f0f5ff' : '#fff',
                    fontWeight: isCurrent ? 600 : 400,
                    color: isCurrent ? DEP_COLORS[type] : '#333',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) (e.currentTarget.style.background = '#fafafa');
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) (e.currentTarget.style.background = '#fff');
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: DEP_COLORS[type],
                      flexShrink: 0,
                    }}
                  />
                  <span>{type}</span>
                  <span style={{ fontSize: 11, color: '#999', marginLeft: 'auto' }}>
                    {DEP_LABELS[type]}
                  </span>
                </div>
              );
            })}
            <div
              style={{ borderTop: '1px solid #f0f0f0', marginTop: 4, paddingTop: 4 }}
            >
              <div
                onClick={handleDeleteFromMenu}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  color: '#ff4d4f',
                  fontSize: 13,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fff2f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff';
                }}
              >
                删除依赖
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default DependencyArrows;
