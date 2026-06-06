import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Square, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { speak, stop, isSupported } from '@/utils/speech';

interface AudioPlayerProps {
  text: string;
}

export function AudioPlayer({ text }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupportedBrowser, setIsSupportedBrowser] = useState(true);

  useEffect(() => {
    setIsSupportedBrowser(isSupported());
    return () => {
      stop();
    };
  }, []);

  const handlePlay = async () => {
    if (isPlaying) {
      stop();
      setIsPlaying(false);
      return;
    }

    try {
      setIsPlaying(true);
      await speak(text);
    } catch (e) {
      console.error('语音播放失败:', e);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    stop();
    setIsPlaying(false);
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
        {isPlaying ? (
          <>
            <Square className="w-4 h-4" />
            <span className="text-sm">暂停</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            <span className="text-sm">语音播报</span>
          </>
        )}
      </motion.button>
      {isPlaying && (
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
