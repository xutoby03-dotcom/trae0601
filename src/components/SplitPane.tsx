import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Split } from '@/types/terminal';
import { cn } from '@/lib/utils';

interface SplitPaneProps {
  split: Split | string;
  panes: Record<string, React.ReactNode>;
  onSizesChange?: (splitId: string, sizes: number[]) => void;
}

interface SplitRendererProps {
  split: Split;
  panes: Record<string, React.ReactNode>;
  onSizesChange?: (splitId: string, sizes: number[]) => void;
}

const SplitRenderer: React.FC<SplitRendererProps> = ({ split, panes, onSizesChange }) => {
  const [activeDivider, setActiveDivider] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef(0);
  const startSizes = useRef<number[]>([]);
  const dividerIndex = useRef(0);

  const totalSize = useCallback(() => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    return split.direction === 'horizontal' ? rect.width : rect.height;
  }, [split.direction]);

  const handleMouseDown = useCallback((e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    dividerIndex.current = index;
    startPos.current = split.direction === 'horizontal' ? e.clientX : e.clientY;
    startSizes.current = [...split.sizes];
    setActiveDivider(index);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [split.direction, split.sizes]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;

    const currentPos = split.direction === 'horizontal' ? e.clientX : e.clientY;
    const delta = currentPos - startPos.current;
    const total = totalSize();
    const deltaPercent = (delta / total) * 100;

    const newSizes = [...startSizes.current];
    const idx = dividerIndex.current;

    const minSize = 10;
    const newFirst = Math.max(minSize, Math.min(100 - minSize, newSizes[idx] + deltaPercent));
    const newSecond = Math.max(minSize, Math.min(100 - minSize, newSizes[idx + 1] - deltaPercent));

    const actualDelta = newFirst - newSizes[idx];
    newSizes[idx] = newFirst;
    newSizes[idx + 1] = newSizes[idx + 1] - actualDelta;

    if (onSizesChange) {
      onSizesChange(split.id, newSizes);
    }
  }, [split.direction, split.id, totalSize, onSizesChange]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    setActiveDivider(null);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const renderChild = (child: Split | string, size: number) => {
    if (typeof child === 'string') {
      return (
        <div
          key={child}
          className="split-pane-child"
          style={{ [split.direction === 'horizontal' ? 'width' : 'height']: `${size}%` }}
        >
          {panes[child]}
        </div>
      );
    }

    return (
      <div
        key={child.id}
        className="split-pane-child"
        style={{ [split.direction === 'horizontal' ? 'width' : 'height']: `${size}%` }}
      >
        <SplitRenderer split={child} panes={panes} onSizesChange={onSizesChange} />
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn('split-pane', split.direction)}
    >
      {split.children.map((child, index) => (
        <React.Fragment key={typeof child === 'string' ? child : child.id}>
          {renderChild(child, split.sizes[index])}
          {index < split.children.length - 1 && (
            <div
              className={cn('split-divider', { active: activeDivider === index })}
              onMouseDown={(e) => handleMouseDown(e, index)}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export const SplitPane: React.FC<SplitPaneProps> = ({ split, panes, onSizesChange }) => {
  if (typeof split === 'string') {
    return <>{panes[split]}</>;
  }

  return <SplitRenderer split={split} panes={panes} onSizesChange={onSizesChange} />;
};

export default SplitPane;
