import React from 'react';
import { TaskNode, Dependency, LinkDragState, DependencyType } from '../types';

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
  resourceFilter: string | null;
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
  resourceFilter,
}) => {
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

    const direction = targetPt.y > sourcePt.y ? 1 : -1;
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

  const getArrowMarker = (type: DependencyType) => {
    const colors: Record<DependencyType, string> = {
      FS: '#52c41a',
      SS: '#1890ff',
      FF: '#722ed1',
      SF: '#fa8c16',
    };
    return colors[type] || '#999';
  };

  const handleDeleteClick = (e: React.MouseEvent, depId: string) => {
    e.stopPropagation();
    if (confirm('确定要删除这条依赖关系吗？')) {
      onDeleteDependency(depId);
    }
  };

  const filteredDependencies = resourceFilter
    ? dependencies.filter((dep) => {
        const source = getTaskById(dep.sourceId);
        const target = getTaskById(dep.targetId);
        return (
          source?.assignees.includes(resourceFilter) ||
          target?.assignees.includes(resourceFilter)
        );
      })
    : dependencies;

  return (
    <svg
      className="dependency-svg"
      width={chartWidth}
      height={chartHeight}
      style={{ zIndex: 1 }}
    >
      <defs>
        <marker
          id="arrowhead-fs"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#52c41a" />
        </marker>
        <marker
          id="arrowhead-ss"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#1890ff" />
        </marker>
        <marker
          id="arrowhead-ff"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#722ed1" />
        </marker>
        <marker
          id="arrowhead-sf"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#fa8c16" />
        </marker>
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
        const strokeColor = getArrowMarker(dep.type);

        return (
          <g key={dep.id}>
            <path
              className="dependency-line"
              d={path}
              stroke={strokeColor}
              strokeWidth={2}
              markerEnd={`url(#${markerId})`}
              style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
              onClick={(e) => handleDeleteClick(e, dep.id)}
            />
            <title>
              {dep.type} - 点击删除
              {dep.lag > 0 && ` (延滞${dep.lag}天)`}
            </title>
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
  );
};

export default DependencyArrows;
