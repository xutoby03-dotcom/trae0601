import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Upload, SkipBack } from 'lucide-react';
import { cn } from '../lib/utils';

interface VirtualDeckProps {
  isPlaying: boolean;
  fileName: string;
  currentTime: number;
  duration: number;
  color: string;
  onPlayPause: () => void;
  onUpload: (file: File) => void;
  onCue: () => void;
  disabled?: boolean;
}

export const VirtualDeck: React.FC<VirtualDeckProps> = ({
  isPlaying,
  fileName,
  currentTime,
  duration,
  color,
  onPlayPause,
  onUpload,
  onCue,
  disabled = false,
}) => {
  const [rotation, setRotation] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }
      
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      
      if (isPlaying) {
        setRotation((prev) => prev + delta * 0.1);
      }
      
      rafRef.current = requestAnimationFrame(animate);
    };
    
    rafRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isPlaying]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div
          className="relative w-48 h-48 rounded-full overflow-hidden"
          style={{
            background: 'conic-gradient(from 0deg, #1a1a1a, #333, #1a1a1a, #333, #1a1a1a)',
            boxShadow: isPlaying
              ? `0 0 40px ${color}40, inset 0 0 30px rgba(0,0,0,0.8)`
              : '0 0 20px rgba(0,0,0,0.5), inset 0 0 30px rgba(0,0,0,0.8)',
          }}
        >
          <div
            className="absolute inset-4 rounded-full"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: `
                repeating-radial-gradient(
                  circle at center,
                  #1a1a1a 0px,
                  #1a1a1a 2px,
                  #2a2a2a 2px,
                  #2a2a2a 4px
                )
              `,
            }}
          />
          
          <div
            className="absolute inset-16 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${color}40, ${color}80)`,
              boxShadow: `0 0 20px ${color}60`,
            }}
          />
          
          <div className="absolute inset-[85px] rounded-full bg-gray-900 border-2 border-gray-700" />
          
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
          />
        </div>
        
        <div
          className="absolute top-0 right-4 w-1.5 h-24 origin-top rounded-full"
          style={{
            background: 'linear-gradient(to bottom, #666, #333)',
            transform: `rotate(${isPlaying ? 15 : -10}deg)`,
            transition: 'transform 0.3s ease-out',
          }}
        >
          <div
            className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
      
      <div className="w-full text-center">
        <p className="text-xs text-gray-400 truncate max-w-[200px] mx-auto">
          {fileName || 'No track loaded'}
        </p>
        <p className="text-lg font-mono font-bold mt-1" style={{ color }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </p>
      </div>
      
      <div className="flex gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/mp3,audio/mpeg,audio/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "p-3 rounded-full transition-all duration-150",
            "bg-gray-800 border-2 border-gray-600",
            "hover:bg-gray-700 hover:border-gray-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          title="Upload MP3"
        >
          <Upload className="w-5 h-5 text-gray-300" />
        </button>
        
        <button
          onClick={onCue}
          className={cn(
            "px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-150",
            "bg-amber-700 border-2 border-amber-500 text-white",
            "hover:bg-amber-600 shadow-lg shadow-amber-500/20",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          CUE
        </button>
        
        <button
          onClick={onPlayPause}
          disabled={disabled || !fileName}
          className={cn(
            "p-3 rounded-full transition-all duration-150",
            "border-2",
            isPlaying
              ? "bg-red-600 border-red-400 shadow-lg shadow-red-500/30 hover:bg-red-500"
              : "bg-green-600 border-green-400 shadow-lg shadow-green-500/30 hover:bg-green-500",
            (disabled || !fileName) && "opacity-50 cursor-not-allowed"
          )}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
};
