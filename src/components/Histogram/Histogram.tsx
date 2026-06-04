import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { calculateHistogram } from '../../utils/canvasUtils';
import type { HistogramData } from '../../types';

export const Histogram = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const { getCompositeImageData, layers } = useEditorStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (layers.length === 0) {
      ctx.fillStyle = '#374151';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('无数据', width / 2, height / 2 + 4);
      return;
    }

    const compositeData = getCompositeImageData();
    if (!compositeData) return;

    const histogram = calculateHistogram(compositeData);

    const drawChannel = (data: number[], color: string, maxVal: number) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;

      for (let i = 0; i < 256; i++) {
        const x = (i / 255) * width;
        const barHeight = (data[i] / maxVal) * (height - 20);
        const y = height - 10 - barHeight;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    };

    const drawBars = (data: number[], color: string, maxVal: number, alpha: number) => {
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;

      for (let i = 0; i < 256; i++) {
        const barWidth = width / 256;
        const x = i * barWidth;
        const barHeight = (data[i] / maxVal) * (height - 20);
        const y = height - 10 - barHeight;

        ctx.fillRect(x, y, barWidth, barHeight);
      }
      ctx.globalAlpha = 1;
    };

    drawBars(histogram.r, '#ef4444', histogram.max, 0.3);
    drawBars(histogram.g, '#22c55e', histogram.max, 0.3);
    drawBars(histogram.b, '#3b82f6', histogram.max, 0.3);

    drawChannel(histogram.r, '#ef4444', histogram.max);
    drawChannel(histogram.g, '#22c55e', histogram.max);
    drawChannel(histogram.b, '#3b82f6', histogram.max);

  }, [getCompositeImageData, layers]);

  return (
    <div className="bg-[#252525] border-t border-gray-700">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-[#2a2a2a] transition-colors"
      >
        <span className="text-sm font-medium text-gray-200">直方图</span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-3">
          <div className="flex items-end gap-4">
            <canvas
              ref={canvasRef}
              width={300}
              height={80}
              className="bg-[#1a1a1a] rounded"
            />
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span className="text-gray-400">R</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span className="text-gray-400">G</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500" />
                <span className="text-gray-400">B</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
