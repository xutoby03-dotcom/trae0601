import React, { useEffect, useRef } from 'react';
import { cn } from '../lib/utils';

interface WaveformProps {
  audioBuffer: AudioBuffer | null;
  currentTime: number;
  duration: number;
  onSeek?: (time: number) => void;
  color?: string;
  cuePoints?: number[];
  height?: number;
}

export const Waveform: React.FC<WaveformProps> = ({
  audioBuffer,
  currentTime,
  duration,
  onSeek,
  color = '#00f5ff',
  cuePoints = [],
  height = 80,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBuffer) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const halfHeight = height / 2;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    const channelData = audioBuffer.getChannelData(0);
    const samples = Math.floor(channelData.length / width);

    ctx.beginPath();
    ctx.moveTo(0, halfHeight);

    for (let i = 0; i < width; i++) {
      const startSample = i * samples;
      let max = 0;
      
      for (let j = 0; j < samples && startSample + j < channelData.length; j++) {
        const sample = Math.abs(channelData[startSample + j]);
        if (sample > max) max = sample;
      }

      const barHeight = max * halfHeight * 0.9;
      
      ctx.lineTo(i, halfHeight - barHeight);
    }

    for (let i = width - 1; i >= 0; i--) {
      const startSample = i * samples;
      let max = 0;
      
      for (let j = 0; j < samples && startSample + j < channelData.length; j++) {
        const sample = Math.abs(channelData[startSample + j]);
        if (sample > max) max = sample;
      }

      const barHeight = max * halfHeight * 0.9;
      
      ctx.lineTo(i, halfHeight + barHeight);
    }

    ctx.closePath();
    
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, `${color}80`);
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, `${color}80`);
    
    ctx.fillStyle = gradient;
    ctx.fill();

    const progress = duration > 0 ? currentTime / duration : 0;
    const playheadX = progress * width;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, playheadX, height);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(playheadX, 0, width - playheadX, height);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
    ctx.shadowBlur = 0;

    cuePoints.forEach((cueTime, index) => {
      if (cueTime > 0 && duration > 0) {
        const cueX = (cueTime / duration) * width;
        ctx.fillStyle = '#ffcc00';
        ctx.shadowColor = '#ffcc00';
        ctx.shadowBlur = 5;
        
        ctx.beginPath();
        ctx.moveTo(cueX - 6, 0);
        ctx.lineTo(cueX + 6, 0);
        ctx.lineTo(cueX, 10);
        ctx.closePath();
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${index + 1}`, cueX, 9);
      }
    });

  }, [audioBuffer, currentTime, duration, color, cuePoints, height]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek || !containerRef.current || duration <= 0) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = x / rect.width;
    onSeek(progress * duration);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={cn(
        "relative w-full rounded-lg overflow-hidden",
        "border-2 border-gray-700",
        onSeek && "cursor-pointer hover:border-gray-600 transition-colors"
      )}
      style={{ height }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      
      {!audioBuffer && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <span className="text-gray-500 text-sm">No track loaded</span>
        </div>
      )}
    </div>
  );
};
