import React from 'react';
import { Point } from '../types';

interface EdgeProps {
  points: Point[];
  isTemp?: boolean;
  isSelected?: boolean;
}

export const EdgeComponent: React.FC<EdgeProps> = ({ points, isTemp = false, isSelected = false }) => {
  if (points.length < 2) return null;

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    return `${acc} L ${p.x} ${p.y}`;
  }, '');

  const lastPoint = points[points.length - 1];
  const prevPoint = points[points.length - 2];

  let angle = 0;
  if (prevPoint && lastPoint) {
    const dx = lastPoint.x - prevPoint.x;
    const dy = lastPoint.y - prevPoint.y;
    angle = Math.atan2(dy, dx) * (180 / Math.PI);
  }

  const arrowSize = 10;
  const arrowPoints = [
    { x: -arrowSize, y: -arrowSize / 2 },
    { x: 0, y: 0 },
    { x: -arrowSize, y: arrowSize / 2 },
  ];

  const strokeColor = isTemp ? '#2196f3' : isSelected ? '#f44336' : '#333';
  const strokeWidth = isTemp ? 1.5 : isSelected ? 2.5 : 2;
  const dashArray = isTemp ? '5,3' : 'none';

  return (
    <g>
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
        style={{ pointerEvents: isTemp ? 'none' : 'stroke' }}
      />
      {!isTemp && (
        <g transform={`translate(${lastPoint.x}, ${lastPoint.y}) rotate(${angle})`}>
          <polygon
            points={arrowPoints.map((p) => `${p.x},${p.y}`).join(' ')}
            fill={strokeColor}
          />
        </g>
      )}
    </g>
  );
};
