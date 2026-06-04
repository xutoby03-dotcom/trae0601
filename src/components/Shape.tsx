import React from 'react';
import { ShapeType } from '../types';

interface ShapeProps {
  type: ShapeType;
  width: number;
  height: number;
  color: string;
  strokeWidth?: number;
  strokeColor?: string;
}

export const Shape: React.FC<ShapeProps> = ({
  type,
  width,
  height,
  color,
  strokeWidth = 2,
  strokeColor = '#333',
}) => {
  switch (type) {
    case 'rectangle':
      return (
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill={color}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      );
    case 'rounded-rect':
      return (
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          rx="12"
          ry="12"
          fill={color}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      );
    case 'circle':
      return (
        <ellipse
          cx={width / 2}
          cy={height / 2}
          rx={width / 2}
          ry={height / 2}
          fill={color}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      );
    case 'diamond':
      return (
        <polygon
          points={`${width / 2},0 ${width},${height / 2} ${width / 2},${height} 0,${height / 2}`}
          fill={color}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      );
    case 'parallelogram':
      return (
        <polygon
          points={`${width * 0.2},0 ${width},0 ${width * 0.8},${height} 0,${height}`}
          fill={color}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      );
    default:
      return null;
  }
};

interface ShapeIconProps {
  type: ShapeType;
  size?: number;
}

export const ShapeIcon: React.FC<ShapeIconProps> = ({ type, size = 40 }) => {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Shape type={type} width={size} height={size} color="#fff" strokeColor="#666" strokeWidth={1.5} />
    </svg>
  );
};
