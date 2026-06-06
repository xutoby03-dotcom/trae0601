import { useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Square, Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';
import { speak, pause, resume, cancel, isSupported, isPaused as checkIsPaused } from '@/utils/speech';

interface AudioPlayerProps {
  text: string;
}

type PlayState = 'idle' | 'playing' | 'paused';

export function AudioPlayer({ text }: AudioPlayerProps) {
  const [playState, setPlayState] = useState<PlayState>('idle');
  const [isSupportedBrowser, setIsSupportedBrowser] = useState(true);

  useEffect(() => {
    setIsSupportedBrowser(isSupported());
    return () => {
      cancel();
    };
  }, []);

  const handleEnd = useCallback(() => {
    setPlayState('idle');
  }, []);

  const handlePlay = async () => {
    if (playState === 'playing') {
      pause();
      setPlayState('paused');
      return;
    }

    if (playState === 'paused') {
      resume();
      setPlayState('playing');
      return;
    }

    try {
      setPlayState('playing');
      await speak(text, handleEnd);
    } catch (e) {
      console.error('语音播放失败:', e);
      setPlayState('idle');
    }
  };

  const handleStop = () => {
    cancel();
    setPlayState('idle');
  };

  if (!isSupportedBrowser) {
    return (
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
        <VolumeX className="w-4 h-4" />
        <span>当前浏览器不支持语音播报</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handlePlay}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gold bg-opacity-20 text-gold hover:bg-opacity-30 transition-all"
      >
        {playState === 'playing' ? (
          <>
            <Pause className="w-4 h-4" />
            <span className="text-sm">暂停</span>
          </>
        ) : playState === 'paused' ? (
          <>
            <Play className="w-4 h-4" />
            <span className="text-sm">继续</span>
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4" />
            <span className="text-sm">语音播报</span>
          </>
        )}
      </motion.button>
      {playState !== 'idle' && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStop}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 bg-opacity-20 text-red-400 hover:bg-opacity-30 transition-all"
        >
          <Square className="w-4 h-4" />
          <span className="text-sm">停止</span>
        </motion.button>
      )}
    </div>
  );
}
