import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ZoomIn, ZoomOut, Maximize2, PanelRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { WaveformCanvas } from '@/components/WaveformCanvas';
import { PlayerControls } from '@/components/PlayerControls';
import { TagToolbar } from '@/components/TagToolbar';
import { TagList } from '@/components/TagList';
import { TagFilters } from '@/components/TagFilters';
import { SectionEditor } from '@/components/SectionEditor';
import { PracticeArea } from '@/components/PracticeArea';
import type { TagType } from '@/types';

export default function SongEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'tags' | 'sections'>('tags');

  const {
    songs,
    tags,
    sections,
    members,
    currentTime,
    isPlaying,
    playbackRate,
    zoom,
    scrollLeft,
    selectedTagId,
    filterStatus,
    filterType,
    filterAssignee,
    setCurrentTime,
    setIsPlaying,
    setPlaybackRate,
    setZoom,
    setScrollLeft,
    setSelectedTagId,
    setFilterStatus,
    setFilterType,
    setFilterAssignee,
    setCurrentSongId,
    addTag,
    deleteTag,
    updateTag,
    setTagStatus,
    setTagAssignee,
    addSection,
    deleteSection,
    updateSection,
    getCurrentTags,
    getCurrentSections,
    getFilteredTags,
    initData,
  } = useAppStore();

  const song = songs.find((s) => s.id === id);
  const songTags = tags.filter((t) => t.songId === id);
  const songSections = sections.filter((s) => s.songId === id).sort((a, b) => a.startTime - b.startTime);
  const filteredTags = getFilteredTags();

  useEffect(() => {
    if (songs.length === 0) {
      initData();
    }
  }, []);

  useEffect(() => {
    if (id) {
      setCurrentSongId(id);
    }
    return () => {
      setCurrentSongId(null);
    };
  }, [id, setCurrentSongId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !song?.audioUrl) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [song?.audioUrl, setCurrentTime, setIsPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleSeek = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const handleSkipBack = () => {
    handleSeek(Math.max(0, currentTime - 5));
  };

  const handleSkipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    handleSeek(Math.min(audio.duration || song?.duration || 0, currentTime + 5));
  };

  const handleAddTag = (type: TagType) => {
    if (!id) return;
    addTag(id, currentTime, type);
  };

  const handleTagClick = (tagId: string) => {
    setSelectedTagId(tagId);
    const tag = tags.find((t) => t.id === tagId);
    if (tag) {
      handleSeek(tag.time);
    }
  };

  const handleZoomIn = () => setZoom(zoom + 0.5);
  const handleZoomOut = () => setZoom(zoom - 0.5);
  const handleZoomReset = () => setZoom(1);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      setZoom(zoom + delta);
    } else {
      setScrollLeft(scrollLeft + e.deltaY);
    }
  };

  if (!song) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">歌曲不存在</p>
          <button
            onClick={() => navigate('/')}
            className="text-orange-400 hover:text-orange-300"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const unresolvedCount = songTags.filter((t) => t.status !== 'resolved').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col">
      {song.audioUrl && (
        <audio ref={audioRef} src={song.audioUrl} />
      )}

      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-white">{song.name}</h1>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>{songTags.length} 个标签</span>
              {unresolvedCount > 0 && (
                <span className="text-red-400">{unresolvedCount} 待解决</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="缩小"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-xs text-slate-500 w-12 text-center font-mono">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="放大"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={handleZoomReset}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors ml-1"
              title="重置"
            >
              <Maximize2 size={16} />
            </button>
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-lg transition-colors ${
              isSidebarOpen
                ? 'bg-orange-500/20 text-orange-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="切换侧边栏"
          >
            <PanelRight size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div
          ref={containerRef}
          className="flex-1 flex flex-col p-6 gap-4 overflow-hidden"
          onWheel={handleWheel}
        >
          <div className="flex-1 flex flex-col justify-center">
            <WaveformCanvas
              waveformData={song.waveformData}
              duration={song.duration}
              currentTime={currentTime}
              sections={songSections}
              tags={songTags}
              zoom={zoom}
              scrollLeft={scrollLeft}
              selectedTagId={selectedTagId}
              onSeek={handleSeek}
              onTagClick={handleTagClick}
              height={280}
            />
          </div>

          <div className="text-center">
            <span className="text-3xl font-mono text-white font-light tracking-wider">
              {Math.floor(currentTime / 60).toString().padStart(2, '0')}:
              {Math.floor(currentTime % 60).toString().padStart(2, '0')}.
              {Math.floor((currentTime % 1) * 100).toString().padStart(2, '0')}
            </span>
          </div>

          <PlayerControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={song.duration}
            playbackRate={playbackRate}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
            onSkipBack={handleSkipBack}
            onSkipForward={handleSkipForward}
            onPlaybackRateChange={setPlaybackRate}
          />

          <TagToolbar onAddTag={handleAddTag} currentTime={currentTime} />
        </div>

        {isSidebarOpen && (
          <aside className="w-80 border-l border-slate-800/50 bg-slate-900/30 flex flex-col">
            <div className="flex border-b border-slate-800/50">
              <button
                onClick={() => setActiveTab('tags')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'tags'
                    ? 'text-orange-400 border-b-2 border-orange-400'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                问题标签
                <span className="ml-1.5 text-xs opacity-60">
                  ({songTags.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab('sections')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'sections'
                    ? 'text-orange-400 border-b-2 border-orange-400'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                段落
                <span className="ml-1.5 text-xs opacity-60">
                  ({songSections.length})
                </span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-4">
                <PracticeArea
                  sections={songSections}
                  tags={songTags}
                  members={members}
                  onJumpToTime={handleSeek}
                />
              </div>

              {activeTab === 'tags' ? (
                <div className="space-y-4">
                  <TagFilters
                    filterStatus={filterStatus}
                    filterType={filterType}
                    filterAssignee={filterAssignee}
                    members={members}
                    onStatusChange={setFilterStatus}
                    onTypeChange={setFilterType}
                    onAssigneeChange={setFilterAssignee}
                  />
                  <TagList
                    tags={filteredTags}
                    members={members}
                    selectedTagId={selectedTagId}
                    onSelectTag={setSelectedTagId}
                    onDeleteTag={deleteTag}
                    onUpdateTagStatus={setTagStatus}
                    onUpdateTagAssignee={setTagAssignee}
                    onUpdateTagDescription={(id, desc) => updateTag(id, { description: desc })}
                    onSeekTo={handleSeek}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <SectionEditor
                    sections={songSections}
                    tags={songTags}
                    songDuration={song.duration}
                    songId={song.id}
                    onSectionClick={handleSeek}
                    onAddSection={addSection}
                    onDeleteSection={deleteSection}
                    onUpdateSection={updateSection}
                  />
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
