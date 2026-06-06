import { useRef, useState } from 'react';
import { Upload, Mic, MicOff, Music, Loader2, ListMusic } from 'lucide-react';
import { useAudioStore } from '@/store/audioStore';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { detectBPM } from '@/utils/audioAnalyzer';
import type { AudioInfo } from '@/types';

const AudioUploader = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    setAudioFile,
    setAudioInfo,
    setSliceRange,
    setAudioBuffer,
    isRecording,
    audioBuffer,
    playlist,
    addToPlaylist,
    clearPlaylist,
    setCurrentIndex,
  } = useAudioStore();
  const { loadAudioFile, startRecording, stopRecording, initAudioContext, playBuffer } = useAudioEngine();

  const processFile = async (file: File, isFirst: boolean = false) => {
    initAudioContext();
    const buffer = await loadAudioFile(file);
    
    const bpm = detectBPM(buffer);
    const bitRate = buffer.duration > 0 ? Math.round((file.size * 8) / buffer.duration / 1000) : 0;
    const info: AudioInfo = {
      fileName: file.name,
      duration: buffer.duration,
      sampleRate: buffer.sampleRate,
      numberOfChannels: buffer.numberOfChannels,
      bitRate: bitRate || undefined,
      bpm: bpm || undefined,
      fileSize: file.size,
    };

    addToPlaylist({ file, buffer, info });

    if (isFirst) {
      setAudioFile(file);
      setAudioBuffer(buffer);
      setAudioInfo(info);
      setSliceRange(0, buffer.duration);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsLoading(true);
    clearPlaylist();
    
    try {
      for (let i = 0; i < files.length; i++) {
        await processFile(files[i], i === 0);
      }
      setCurrentIndex(0);
      
      if (files.length > 0 && playlist.length === 0) {
        playBuffer(useAudioStore.getState().playlist[0].buffer, 0);
      }
    } catch (error) {
      console.error('Failed to load audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      try {
        await startRecording();
      } catch (error) {
        console.error('Failed to start recording:', error);
        alert('无法访问麦克风，请检查权限设置');
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('audio/'));
    if (files.length === 0) return;

    setIsLoading(true);
    clearPlaylist();
    
    try {
      for (let i = 0; i < files.length; i++) {
        await processFile(files[i], i === 0);
      }
      setCurrentIndex(0);
    } catch (error) {
      console.error('Failed to load audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex items-center gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 
                   border border-cyan-500/30 rounded-lg text-cyan-400 hover:border-cyan-400 
                   hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Upload className="w-5 h-5" />
        )}
        <span className="text-sm font-medium">上传音频</span>
      </button>

      <button
        onClick={handleMicClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300
          ${isRecording 
            ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse' 
            : 'bg-purple-500/20 border-purple-500/30 text-purple-400 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20'
          }`}
      >
        {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        <span className="text-sm font-medium">{isRecording ? '停止录音' : '麦克风'}</span>
      </button>

      {playlist.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <ListMusic className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-400">{playlist.length} 首</span>
        </div>
      )}
    </div>
  );
};

export default AudioUploader;
