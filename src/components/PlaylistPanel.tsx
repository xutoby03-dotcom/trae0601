import { ListMusic, Volume2, Trash2, X } from 'lucide-react';
import { useAudioStore } from '@/store/audioStore';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { formatTime } from '@/utils/audioAnalyzer';

const PlaylistPanel = () => {
  const {
    playlist,
    currentIndex,
    setCurrentIndex,
    setAudioBuffer,
    setAudioFile,
    setAudioInfo,
    setSliceRange,
    setCurrentTime,
    setIsPlaying,
  } = useAudioStore();
  const { playBuffer } = useAudioEngine();

  const loadTrack = (index: number) => {
    if (index < 0 || index >= playlist.length) return;
    const item = playlist[index];
    setCurrentIndex(index);
    setAudioBuffer(item.buffer);
    setAudioFile(item.file);
    setAudioInfo(item.info);
    setSliceRange(0, item.buffer.duration);
    setCurrentTime(0);
    playBuffer(item.buffer, 0);
  };

  const removeTrack = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const newPlaylist = playlist.filter((_, i) => i !== index);
    
    if (newPlaylist.length === 0) {
      useAudioStore.setState({
        playlist: [],
        currentIndex: 0,
        audioBuffer: null,
        audioFile: null,
        audioInfo: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
      });
      return;
    }
    
    let newIndex = currentIndex;
    if (index === currentIndex) {
      newIndex = index >= newPlaylist.length ? newPlaylist.length - 1 : index;
      const nextItem = newPlaylist[newIndex];
      setCurrentIndex(newIndex);
      setAudioBuffer(nextItem.buffer);
      setAudioFile(nextItem.file);
      setAudioInfo(nextItem.info);
      setSliceRange(0, nextItem.buffer.duration);
      setCurrentTime(0);
      playBuffer(nextItem.buffer, 0);
    } else if (index < currentIndex) {
      newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
    }
    
    useAudioStore.setState({ playlist: newPlaylist });
  };

  const clearAll = () => {
    useAudioStore.setState({
      playlist: [],
      currentIndex: 0,
      audioBuffer: null,
      audioFile: null,
      audioInfo: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
    });
  };

  return (
    <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <ListMusic className="w-5 h-5 text-cyan-400" />
          播放列表
          <span className="text-xs text-gray-500 font-normal">({playlist.length})</span>
        </h3>
        {playlist.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-red-400 
                       bg-white/5 hover:bg-red-500/10 rounded-lg transition-all duration-300"
          >
            <Trash2 className="w-3.5 h-3.5" />
            清空
          </button>
        )}
      </div>

      {playlist.length === 0 ? (
        <div className="text-center py-8">
          <ListMusic className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">播放列表为空</p>
          <p className="text-gray-600 text-xs mt-1">上传多首音乐加入列表</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {playlist.map((item, index) => (
            <div
              key={index}
              onClick={() => loadTrack(index)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group
                ${currentIndex === index 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30' 
                  : 'bg-white/5 hover:bg-white/10 border border-transparent'
                }`}
            >
              <div className="w-6 flex justify-center">
                {currentIndex === index ? (
                  <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
                ) : (
                  <span className="text-xs text-gray-600 font-mono">{index + 1}</span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className={`text-sm truncate ${currentIndex === index ? 'text-cyan-300' : 'text-white'}`}>
                  {item.info.fileName}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                  <span>{formatTime(item.info.duration)}</span>
                  {item.info.bitRate && (
                    <>
                      <span className="text-gray-700">·</span>
                      <span>{item.info.bitRate} kbps</span>
                    </>
                  )}
                </div>
              </div>
              
              <button
                onClick={(e) => removeTrack(index, e)}
                className="p-1.5 text-gray-600 hover:text-red-400 rounded-lg 
                           hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistPanel;
