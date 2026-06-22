import { useRef, useState, useEffect } from 'react';
import type { CourseElement, ElementType } from '@/types';
import { useAppStore } from '@/store/useAppStore';

interface CanvasProps {
  courseId: string;
  elements: CourseElement[];
  selectedId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CourseElement>) => void;
  mode: 'design' | 'practice';
  clickedOrders?: number[];
  onElementClick?: (order: number) => void;
}

export default function CourseCanvas({
  courseId,
  elements,
  selectedId,
  onSelectElement,
  onUpdateElement,
  mode = 'design',
  clickedOrders = [],
  onElementClick,
}: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const { updateElement } = useAppStore();

  const getSVGPoint = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 800;
    const y = ((clientY - rect.top) / rect.height) * 600;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    if (mode !== 'design') return;
    e.stopPropagation();
    const element = elements.find((el) => el.id === elementId);
    if (!element) return;

    const point = getSVGPoint(e.clientX, e.clientY);
    setDragging(elementId);
    setDragOffset({ x: point.x - element.x, y: point.y - element.y });
    onSelectElement(elementId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || mode !== 'design') return;
    const point = getSVGPoint(e.clientX, e.clientY);
    const newX = Math.max(30, Math.min(770, point.x - dragOffset.x));
    const newY = Math.max(30, Math.min(570, point.y - dragOffset.y));
    onUpdateElement(dragging, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handleCanvasClick = () => {
    if (mode === 'design') {
      onSelectElement(null);
    }
  };

  const handleElementClick = (e: React.MouseEvent, element: CourseElement) => {
    e.stopPropagation();
    if (mode === 'practice' && element.type === 'jump' && onElementClick) {
      onElementClick(element.order);
    } else if (mode === 'design') {
      onSelectElement(element.id);
    }
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [dragging]);

  const renderElement = (element: CourseElement) => {
    const isSelected = selectedId === element.id;
    const isClicked = clickedOrders.includes(element.order) && element.type === 'jump';
    const isNextCorrect =
      mode === 'practice' &&
      element.type === 'jump' &&
      element.order === clickedOrders.length + 1;

    const commonProps = {
      key: element.id,
      onMouseDown: (e: React.MouseEvent) => handleMouseDown(e, element.id),
      onClick: (e: React.MouseEvent) => handleElementClick(e, element),
      style: { cursor: mode === 'design' ? 'move' : 'pointer' },
    };

    switch (element.type) {
      case 'jump':
        return (
          <g {...commonProps} transform={`translate(${element.x}, ${element.y})`}>
            <rect
              x={-30}
              y={-8}
              width={60}
              height={16}
              rx={3}
              fill={isClicked ? '#2E7D32' : '#795548'}
              stroke={isSelected ? '#FFEB3B' : '#5D4037'}
              strokeWidth={isSelected ? 3 : 2}
              className="transition-all duration-200"
            />
            <rect
              x={-28}
              y={-6}
              width={56}
              height={4}
              rx={2}
              fill={isClicked ? '#388E3C' : '#8D6E63'}
            />
            <circle cx={-30} cy={0} r={6} fill="#5D4037" stroke="#3E2723" strokeWidth={1} />
            <circle cx={30} cy={0} r={6} fill="#5D4037" stroke="#3E2723" strokeWidth={1} />
            <text
              y={-20}
              textAnchor="middle"
              fill="#5D4037"
              fontSize={14}
              fontWeight="bold"
              className="font-serif"
            >
              {element.label || element.order}
            </text>
            {isNextCorrect && (
              <circle
                cx={0}
                cy={0}
                r={25}
                fill="none"
                stroke="#2E7D32"
                strokeWidth={2}
                strokeDasharray="4 4"
                className="animate-pulse"
              />
            )}
          </g>
        );

      case 'arrow':
        const rotation = element.rotation || 0;
        return (
          <g {...commonProps} transform={`translate(${element.x}, ${element.y}) rotate(${rotation})`}>
            <path
              d="M -25 0 L 20 0 M 10 -10 L 25 0 L 10 10"
              stroke={isSelected ? '#FFEB3B' : '#D4AF37'}
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx={0}
              cy={0}
              r={30}
              fill="transparent"
              stroke={isSelected ? '#FFEB3B' : 'transparent'}
              strokeWidth={2}
              strokeDasharray="4 4"
            />
          </g>
        );

      case 'step':
        return (
          <g {...commonProps} transform={`translate(${element.x}, ${element.y})`}>
            <ellipse
              cx={0}
              cy={0}
              rx={25}
              ry={18}
              fill="#FFF9C4"
              stroke={isSelected ? '#FFEB3B' : '#FBC02D'}
              strokeWidth={isSelected ? 3 : 2}
            />
            <text
              y={5}
              textAnchor="middle"
              fill="#F57F17"
              fontSize={14}
              fontWeight="bold"
            >
              {element.steps || 0}步
            </text>
          </g>
        );

      case 'turn':
        const radius = element.radius || 50;
        return (
          <g {...commonProps} transform={`translate(${element.x}, ${element.y})`}>
            <circle
              cx={0}
              cy={0}
              r={radius}
              fill="rgba(76, 175, 80, 0.1)"
              stroke={isSelected ? '#FFEB3B' : '#4CAF50'}
              strokeWidth={isSelected ? 3 : 2}
              strokeDasharray="6 4"
            />
            <path
              d={`M ${radius} 0 A ${radius} ${radius} 0 0 1 0 ${radius}`}
              stroke="#4CAF50"
              strokeWidth={2}
              fill="none"
            />
            <text
              y={radius + 20}
              textAnchor="middle"
              fill="#2E7D32"
              fontSize={12}
            >
              转弯
            </text>
          </g>
        );

      case 'forbidden':
        const w = element.width || 80;
        const h = element.height || 60;
        return (
          <g {...commonProps} transform={`translate(${element.x}, ${element.y})`}>
            <rect
              x={-w / 2}
              y={-h / 2}
              width={w}
              height={h}
              fill="rgba(198, 40, 40, 0.15)"
              stroke={isSelected ? '#FFEB3B' : '#C62828'}
              strokeWidth={isSelected ? 3 : 2}
              strokeDasharray="8 4"
            />
            <line
              x1={-w / 2 + 5}
              y1={-h / 2 + 5}
              x2={w / 2 - 5}
              y2={h / 2 - 5}
              stroke="#C62828"
              strokeWidth={2}
            />
            <line
              x1={w / 2 - 5}
              y1={-h / 2 + 5}
              x2={-w / 2 + 5}
              y2={h / 2 - 5}
              stroke="#C62828"
              strokeWidth={2}
            />
            <text
              y={h / 2 + 18}
              textAnchor="middle"
              fill="#C62828"
              fontSize={12}
            >
              禁入区
            </text>
          </g>
        );

      default:
        return null;
    }
  };

  const jumpElements = elements.filter((e) => e.type === 'jump').sort((a, b) => a.order - b.order);

  return (
    <div className="relative w-full bg-equestrian-sand-100 rounded-xl overflow-hidden shadow-elegant border-2 border-equestrian-brown-200">
      <svg
        ref={svgRef}
        viewBox="0 0 800 600"
        className="w-full aspect-[4/3]"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
      >
        <defs>
          <pattern
            id="sandTexture"
            patternUnits="userSpaceOnUse"
            width="20"
            height="20"
          >
            <rect width="20" height="20" fill="#F5F5E8" />
            <circle cx="5" cy="5" r="0.5" fill="#E8E8D0" />
            <circle cx="15" cy="15" r="0.5" fill="#E8E8D0" />
          </pattern>
        </defs>
        <rect width="800" height="600" fill="url(#sandTexture)" />

        {mode === 'design' && (
          <g stroke="#D7CCC8" strokeWidth={1} strokeDasharray="2 4">
            {Array.from({ length: 9 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 100} y1={0} x2={i * 100} y2={600} />
            ))}
            {Array.from({ length: 7 }).map((_, i) => (
              <line key={`h${i}`} x1={0} y1={i * 100} x2={800} y2={i * 100} />
            ))}
          </g>
        )}

        {mode === 'practice' && jumpElements.length > 1 && (
          <g stroke="#BCAAA4" strokeWidth={2} fill="none" strokeDasharray="0">
            {jumpElements.slice(0, clickedOrders.length).map((el, i) => {
              if (i === 0) return null;
              const prev = jumpElements.find((e) => e.order === clickedOrders[i - 1]);
              if (!prev) return null;
              return (
                <line
                  key={`path-${i}`}
                  x1={prev.x}
                  y1={prev.y}
                  x2={el.x}
                  y2={el.y}
                  stroke="#2E7D32"
                  strokeWidth={3}
                />
              );
            })}
          </g>
        )}

        {elements.map(renderElement)}
      </svg>

      {mode === 'design' && (
        <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg text-xs text-equestrian-brown-600">
          拖拽移动元素 · 点击选中编辑
        </div>
      )}
    </div>
  );
}
