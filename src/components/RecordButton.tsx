import React from 'react';
import { Mic, MicOff, Download, Square } from 'lucide-react';
import { cn } from '../lib/utils';

interface RecordButtonProps {
  isRecording: boolean;
  recordedBlob: Blob | null;
  onStart: () => void;
  onStop: () => void;
  onDownload: () => void;
  disabled?: boolean;
}

export const RecordButton: React.FC<RecordButtonProps> = ({
  isRecording,
  recordedBlob,
  onStart,
  onStop,
  onDownload,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        RECORDING
      </span>
      
      <div className="flex items-center gap-3">
        <button
          onClick={isRecording ? onStop : onStart}
          disabled={disabled}
          className={cn(
            "relative p-4 rounded-full transition-all duration-150",
            "border-4",
            isRecording
              ? "bg-red-600 border-red-400 shadow-lg shadow-red-500/50 animate-pulse"
              : "bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-red-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {isRecording ? (
            <Square className="w-6 h-6 text-white fill-white" />
          ) : (
            <Mic className="w-6 h-6 text-red-400" />
          )}
          
          {isRecording && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
          )}
        </button>
        
        <button
          onClick={onDownload}
          disabled={!recordedBlob || disabled}
          className={cn(
            "p-3 rounded-full transition-all duration-150",
            "border-2",
            recordedBlob
              ? "bg-green-600 border-green-400 shadow-lg shadow-green-500/30 hover:bg-green-500"
              : "bg-gray-800 border-gray-700",
            (!recordedBlob || disabled) && "opacity-50 cursor-not-allowed"
          )}
          title="Download MP3"
        >
          <Download className="w-5 h-5 text-white" />
        </button>
      </div>
      
      <div className="text-xs">
        {isRecording ? (
          <span className="text-red-400 font-bold animate-pulse">● RECORDING</span>
        ) : recordedBlob ? (
          <span className="text-green-400">✓ Recording ready</span>
        ) : (
          <span className="text-gray-500">Ready to record</span>
        )}
      </div>
    </div>
  );
};
