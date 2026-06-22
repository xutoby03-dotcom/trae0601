import { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Upload,
  Maximize2,
  Gauge,
  Film,
} from 'lucide-react';
import { usePracticeStore } from '@/store/practiceStore';
import { formatTime } from '@/utils';
import AnnotationCanvas from './AnnotationCanvas';

export default function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const {
    videoUrl,
    videoName,
    currentSignWordId,
    annotations,
    signWords,
    videoCurrentTime,
    videoDuration,
    isPlaying,
    playbackRate,
    setVideo,
    setVideoTime,
    setVideoDuration,
    setPlaying,
    setPlaybackRate,
    videoFps,
  } = usePracticeStore();

  const currentWord = signWords.find((w) => w.id === currentSignWordId);

  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = playbackRate;
    }
  }, [playbackRate, videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => setPlaying(false));
    } else {
      video.pause();
    }
  }, [isPlaying, videoUrl, setPlaying]);

  const lastSeekedTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    if (
      lastSeekedTimeRef.current === null ||
      Math.abs(videoCurrentTime - lastSeekedTimeRef.current) > 0.2
    ) {
      if (Math.abs(video.currentTime - videoCurrentTime) > 0.1) {
        video.currentTime = videoCurrentTime;
      }
      lastSeekedTimeRef.current = videoCurrentTime;
    }
  }, [videoCurrentTime, videoUrl]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      if (
        lastSeekedTimeRef.current === null ||
        Math.abs(currentTime - lastSeekedTimeRef.current) > 0.15
      ) {
        setVideoTime(currentTime);
      }
    }
  }, [setVideoTime]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  }, [setVideoDuration]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setVideoTime(time);
    }
  };

  const stepFrame = (direction: 1 | -1) => {
    if (videoRef.current) {
      const frameTime = 1 / videoFps;
      const newTime = Math.max(
        0,
        Math.min(
          videoRef.current.duration || 0,
          videoCurrentTime + direction * frameTime
        )
      );
      videoRef.current.currentTime = newTime;
      setVideoTime(newTime);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideo(url, file.name);
    }
  };

  const toggleFullscreen = () => {
    containerRef.current?.requestFullscreen();
  };

  const annotationsAtCurrentTime = annotations.filter(
    (a) => Math.abs(a.timestamp - videoCurrentTime) < 0.2
  );

  const progressPercent = videoDuration > 0 ? (videoCurrentTime / videoDuration) * 100 : 0;

  return (
    <div className="card p-4 flex flex-col h-full" ref={containerRef}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title mb-0">
          <Film className="w-5 h-5 text-primary-600" />
          视频回放与逐帧标注
        </h2>
        <div className="flex items-center gap-2">
          {!currentSignWordId && (
            <span className="text-xs text-gray-400 text-sm">请先从左侧选择词条</span>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary text-sm flex items-center gap-1.5 py-2 px-3"
          >
            <Upload className="w-4 h-4" />
            上传视频
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      <div className="relative flex-1 min-h-0 rounded-xl overflow-hidden bg-gray-900 aspect-video">
        {videoUrl ? (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain bg-black"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              muted={isMuted}
              playsInline
            />
            <AnnotationCanvas videoRef={videoRef} />

            {annotationsAtCurrentTime.length > 0 && (
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 animate-fade-in">
                <div className="text-xs text-white/80 mb-1">
                  当前帧标注 ({annotationsAtCurrentTime.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {annotationsAtCurrentTime.map((a) => (
                    <span
                      key={a.id}
                      className="text-xs text-white px-2 py-0.5 rounded"
                      style={{ backgroundColor: a.color }}
                    >
                      {a.type === 'text' ? a.text : a.type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/60">
            <Film className="w-20 h-20 mb-4 opacity-40" />
            <p className="text-base mb-2">暂无视频</p>
            {currentWord ? (
              <>
                <p className="text-sm text-white/40 mb-4">
                  当前词条：<span className="text-white/70 font-medium">{currentWord.name}</span>
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                >
                  点击上传学生练习视频
                </button>
              </>
            ) : (
              <p className="text-sm text-white/40">请先从左侧选择要练习的词条</p>
            )}
          </div>
        )}
      </div>

      {videoUrl && (
        <>
          <div className="mt-4 space-y-3">
            {videoName && (
              <div className="text-xs text-gray-500 truncate text-center">
                📹 {videoName}
              </div>
            )}

            <div className="relative">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              {annotations.length > 0 &&
                annotations.map((ann) => (
                  <div
                    key={ann.id}
                    className="absolute top-0 w-1 h-2 rounded-full"
                    style={{
                      left: `${(ann.timestamp / (videoDuration || 1)) * 100}%`,
                      backgroundColor: ann.color,
                    }}
                    title={`${formatTime(ann.timestamp)} - ${ann.text || ann.type}`}
                  />
                ))}
              <input
                type="range"
                min={0}
                max={videoDuration || 0}
                step={0.01}
                value={videoCurrentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
                style={{ appearance: 'none' }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs font-mono text-gray-600 tabular-nums w-16">
              {formatTime(videoCurrentTime)} / {formatTime(videoDuration)}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => stepFrame(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 hover:text-primary-600 transition-colors text-gray-500"
                title="上一帧"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPlaying(!isPlaying)}
                className="p-3 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-soft"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button
                onClick={() => stepFrame(1)}
                className="p-2 rounded-lg hover:bg-gray-100 hover:text-primary-600 transition-colors text-gray-500"
                title="下一帧"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-lg hover:bg-gray-100 hover:text-primary-600 transition-colors text-gray-500"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="flex items-center gap-1 p-2 rounded-lg hover:bg-gray-100 hover:text-primary-600 transition-colors text-gray-500 text-xs font-medium"
                >
                  <Gauge className="w-4 h-4" />
                  {playbackRate}x
                </button>
                {showSpeedMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-float border border-gray-100 py-1 min-w-24 z-10 animate-fade-in">
                    {playbackRates.map((rate) => (
                      <button
                        key={rate}
                        onClick={() => {
                          setPlaybackRate(rate);
                          setShowSpeedMenu(false);
                        }}
                        className={`block w-full px-4 py-1.5 text-xs text-left hover:bg-primary-50 transition-colors ${
                          playbackRate === rate
                            ? 'text-primary-600 font-bold bg-primary-50'
                            : 'text-gray-600'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg hover:bg-gray-100 hover:text-primary-600 transition-colors text-gray-500"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
