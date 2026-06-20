import { useRef, useEffect, useCallback } from 'react';
import type { Section, Tag } from '@/types';
import { SECTION_TYPE_COLORS, TAG_TYPE_COLORS } from '@/types';

interface WaveformCanvasProps {
  waveformData: number[];
  duration: number;
  currentTime: number;
  sections: Section[];
  tags: Tag[];
  zoom: number;
  scrollLeft: number;
  selectedTagId: string | null;
  onSeek: (time: number) => void;
  onTagClick: (tagId: string) => void;
  height?: number;
}

export function WaveformCanvas({
  waveformData,
  duration,
  currentTime,
  sections,
  tags,
  zoom,
  scrollLeft,
  selectedTagId,
  onSeek,
  onTagClick,
  height = 200,
}: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const totalWidth = width * zoom;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    const visibleStart = scrollLeft;
    const visibleEnd = scrollLeft + width;

    sections.forEach((section) => {
      const startX = (section.startTime / duration) * totalWidth - visibleStart;
      const endX = (section.endTime / duration) * totalWidth - visibleStart;

      if (endX < 0 || startX > width) return;

      const x = Math.max(0, startX);
      const w = Math.min(width, endX) - x;

      ctx.fillStyle = SECTION_TYPE_COLORS[section.type] || 'rgba(107, 114, 128, 0.2)';
      ctx.fillRect(x, 0, w, height);

      if (w > 60) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '11px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(section.name, x + w / 2, 6);
      }
    });

    const barWidth = Math.max(1, (totalWidth / waveformData.length) * 0.7);
    const step = totalWidth / waveformData.length;

    const startIndex = Math.floor(visibleStart / step);
    const endIndex = Math.ceil(visibleEnd / step);

    const centerY = height / 2;

    for (let i = startIndex; i <= endIndex && i < waveformData.length; i++) {
      const x = i * step - visibleStart;
      const value = waveformData[i] || 0;
      const barHeight = value * (height - 40);

      const gradient = ctx.createLinearGradient(x, centerY - barHeight / 2, x, centerY + barHeight / 2);
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.9)');
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.95)');
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0.9)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, 1);
      ctx.fill();
    }

    tags.forEach((tag) => {
      const x = (tag.time / duration) * totalWidth - visibleStart;
      if (x < -10 || x > width + 10) return;

      const color = TAG_TYPE_COLORS[tag.type] || '#fff';
      const isSelected = tag.id === selectedTagId;
      const tagY = 20;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, tagY + 14);
      ctx.lineTo(x - 5, tagY + 8);
      ctx.lineTo(x + 5, tagY + 8);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, height - 25, isSelected ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (tag.status === 'pending') {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(x, height - 25, isSelected ? 10 : 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();
    });

    const playheadX = (currentTime / duration) * totalWidth - visibleStart;
    if (playheadX >= 0 && playheadX <= width) {
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();

      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(playheadX - 6, 0);
      ctx.lineTo(playheadX + 6, 0);
      ctx.lineTo(playheadX, 10);
      ctx.closePath();
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
  }, [waveformData, duration, currentTime, sections, tags, zoom, scrollLeft, selectedTagId, height]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollLeft;
    const totalWidth = rect.width * zoom;
    const time = (x / totalWidth) * duration;

    const clickedTag = tags.find((tag) => {
      const tagX = (tag.time / duration) * totalWidth;
      return Math.abs(tagX - (e.clientX - rect.left + scrollLeft)) < 12;
    });

    if (clickedTag) {
      onTagClick(clickedTag.id);
    } else {
      onSeek(Math.max(0, Math.min(duration, time)));
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-lg border border-slate-700/50 bg-slate-900 cursor-pointer select-none"
      style={{ height }}
      onClick={handleClick}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
