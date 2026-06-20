import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Plus, Clock, AlertCircle, Upload, Trash2, Disc, Mic2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatTimeShort } from '@/utils';
import { extractWaveformData, generateMockWaveform } from '@/utils';

export default function Home() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { songs, addSong, deleteSong, getUnresolvedCount, tags } = useAppStore();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      
      await new Promise<void>((resolve, reject) => {
        audio.addEventListener('loadedmetadata', () => resolve());
        audio.addEventListener('error', () => reject(new Error('Failed to load audio')));
      });

      const duration = audio.duration;
      let waveformData: number[];
      
      try {
        waveformData = await extractWaveformData(url, 1200);
      } catch {
        waveformData = generateMockWaveform(1200, Date.now());
      }

      const songName = file.name.replace(/\.[^/.]+$/, '');
      const song = addSong(songName, url, duration, waveformData);
      navigate(`/song/${song.id}`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('音频文件加载失败，请重试');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Disc size={26} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">排练标注台</h1>
              <p className="text-sm text-slate-400">记录每一个需要打磨的细节</p>
            </div>
          </div>
        </header>

        <div className="mb-8">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full p-6 border-2 border-dashed border-slate-700 hover:border-orange-500/50 rounded-2xl bg-slate-800/30 hover:bg-slate-800/50 transition-all group"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-slate-700/50 group-hover:bg-orange-500/20 flex items-center justify-center transition-colors">
                {isUploading ? (
                  <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload size={24} className="text-slate-400 group-hover:text-orange-400 transition-colors" />
                )}
              </div>
              <div>
                <p className="text-slate-300 font-medium">
                  {isUploading ? '正在处理音频...' : '上传排练录音'}
                </p>
                <p className="text-sm text-slate-500 mt-1">支持 MP3、WAV、M4A 等格式</p>
              </div>
            </div>
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Music size={18} className="text-orange-400" />
            我的歌曲
          </h2>
          <span className="text-sm text-slate-500">
            共 {songs.length} 首
          </span>
        </div>

        {songs.length === 0 ? (
          <div className="text-center py-16">
            <Mic2 size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-500">还没有歌曲</p>
            <p className="text-sm text-slate-600 mt-1">上传第一首排练录音开始标注吧</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {songs.map((song) => {
              const unresolvedCount = getUnresolvedCount(song.id);
              const songTags = tags.filter((t) => t.songId === song.id);

              return (
                <div
                  key={song.id}
                  className="group relative bg-slate-800/40 hover:bg-slate-800/70 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/song/${song.id}`)}
                >
                  <div className="h-24 bg-gradient-to-br from-indigo-900/50 to-slate-900 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-end px-2 pb-2">
                      {song.waveformData.slice(0, 120).map((value, i) => (
                        <div
                          key={i}
                          className="flex-1 mx-px bg-indigo-500/40 rounded-t"
                          style={{ height: `${value * 100}%` }}
                        />
                      ))}
                    </div>
                    {unresolvedCount > 0 && (
                      <div className="absolute top-3 right-3">
                        <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-500/90 text-white rounded-full shadow-lg">
                          <AlertCircle size={12} />
                          {unresolvedCount} 待解决
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-medium text-white truncate mb-2 group-hover:text-orange-400 transition-colors">
                      {song.name}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatTimeShort(song.duration)}
                      </span>
                      <span>{formatDate(song.updatedAt)}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                      <span>{songTags.length} 个标签</span>
                      <span>·</span>
                      <span>{songTags.filter((t) => t.status === 'resolved').length} 已解决</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`确定删除 "${song.name}" 吗？`)) {
                        deleteSong(song.id);
                      }
                    }}
                    className="absolute top-3 left-3 p-1.5 rounded-md bg-slate-900/60 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-all"
                    title="删除"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 text-white font-medium rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={20} />
          新建标注
        </button>
      </div>
    </div>
  );
}
