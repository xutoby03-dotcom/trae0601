import { memo, useCallback } from 'react';
import { Filter, RotateCcw, Star, ArrowUpDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ALL_MICROPHONES, ALL_PREAMPS, ALL_ROOM_POSITIONS, MIN_DISTANCE, MAX_DISTANCE, MIN_GAIN, MAX_GAIN } from '../data/mockTakes';

export const FilterBar = memo(function FilterBar() {
  const filters = useStore((s) => s.filters);
  const setFilter = useStore((s) => s.setFilter);
  const resetFilters = useStore((s) => s.resetFilters);
  const takes = useStore((s) => s.takes);
  const starredCount = takes.filter((t) => t.starred).length;

  const handleMicChange = useCallback(
    (mic: string) => {
      const current = filters.microphones;
      const next = current.includes(mic) ? current.filter((m) => m !== mic) : [...current, mic];
      setFilter('microphones', next);
    },
    [filters.microphones, setFilter]
  );

  const handlePreampChange = useCallback(
    (preamp: string) => {
      const current = filters.preamps;
      const next = current.includes(preamp) ? current.filter((p) => p !== preamp) : [...current, preamp];
      setFilter('preamps', next);
    },
    [filters.preamps, setFilter]
  );

  const handleRoomChange = useCallback(
    (room: string) => {
      const current = filters.roomPositions;
      const next = current.includes(room) ? current.filter((r) => r !== room) : [...current, room];
      setFilter('roomPositions', next);
    },
    [filters.roomPositions, setFilter]
  );

  const toggleSortOrder = useCallback(() => {
    setFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
  }, [filters.sortOrder, setFilter]);

  const hasActiveFilters =
    filters.microphones.length > 0 ||
    filters.preamps.length > 0 ||
    filters.roomPositions.length > 0 ||
    filters.distances[0] !== MIN_DISTANCE ||
    filters.distances[1] !== MAX_DISTANCE ||
    filters.gains[0] !== MIN_GAIN ||
    filters.gains[1] !== MAX_GAIN ||
    filters.popFilter !== null ||
    filters.starredOnly;

  return (
    <div className="bg-studio-panel border-b border-studio-border sticky top-0 z-30 backdrop-blur-sm bg-opacity-90">
      <div className="container px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-accent-amber" />
            <h2 className="font-display font-semibold text-studio-text">筛选与排序</h2>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="btn-studio text-xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                重置筛选
              </button>
            )}
            <button
              onClick={() => setFilter('starredOnly', !filters.starredOnly)}
              className={`btn-studio text-xs flex items-center gap-1.5 ${
                filters.starredOnly ? 'border-accent-amber text-accent-amber' : ''
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${filters.starredOnly ? 'fill-accent-amber' : ''}`} />
              仅显示收藏 ({starredCount})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="label-dim block mb-1.5">麦克风</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_MICROPHONES.map((mic) => (
                <button
                  key={mic}
                  onClick={() => handleMicChange(mic)}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    filters.microphones.includes(mic)
                      ? 'bg-accent-amber/20 border-accent-amber/50 text-accent-amber'
                      : 'bg-studio-card border-studio-border text-studio-textDim hover:border-studio-textDim/50'
                  }`}
                >
                  {mic.split(' ').slice(0, 2).join(' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label-dim block mb-1.5">前级放大器</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_PREAMPS.map((preamp) => (
                <button
                  key={preamp}
                  onClick={() => handlePreampChange(preamp)}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    filters.preamps.includes(preamp)
                      ? 'bg-accent-purple/20 border-accent-purple/50 text-accent-purple'
                      : 'bg-studio-card border-studio-border text-studio-textDim hover:border-studio-textDim/50'
                  }`}
                >
                  {preamp.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label-dim block mb-1.5">
              拾音距离: {filters.distances[0]} - {filters.distances[1]} cm
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={MIN_DISTANCE}
                max={MAX_DISTANCE}
                step={5}
                value={filters.distances[0]}
                onChange={(e) =>
                  setFilter('distances', [parseInt(e.target.value), filters.distances[1]] as [number, number])
                }
                className="flex-1"
              />
              <span className="text-mono text-studio-textDim">~</span>
              <input
                type="range"
                min={MIN_DISTANCE}
                max={MAX_DISTANCE}
                step={5}
                value={filters.distances[1]}
                onChange={(e) =>
                  setFilter('distances', [filters.distances[0], parseInt(e.target.value)] as [number, number])
                }
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <label className="label-dim block mb-1.5">
              增益: {filters.gains[0] > 0 ? '+' : ''}{filters.gains[0]} -{' '}
              {filters.gains[1] > 0 ? '+' : ''}{filters.gains[1]} dB
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={MIN_GAIN}
                max={MAX_GAIN}
                step={6}
                value={filters.gains[0]}
                onChange={(e) =>
                  setFilter('gains', [parseInt(e.target.value), filters.gains[1]] as [number, number])
                }
                className="flex-1"
              />
              <span className="text-mono text-studio-textDim">~</span>
              <input
                type="range"
                min={MIN_GAIN}
                max={MAX_GAIN}
                step={6}
                value={filters.gains[1]}
                onChange={(e) =>
                  setFilter('gains', [filters.gains[0], parseInt(e.target.value)] as [number, number])
                }
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 pt-3 border-t border-studio-border">
          <div>
            <label className="label-dim block mb-1.5">房间位置</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_ROOM_POSITIONS.map((room) => (
                <button
                  key={room}
                  onClick={() => handleRoomChange(room)}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    filters.roomPositions.includes(room)
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                      : 'bg-studio-card border-studio-border text-studio-textDim hover:border-studio-textDim/50'
                  }`}
                >
                  {room}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label-dim block mb-1.5">防喷罩</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('popFilter', filters.popFilter === true ? null : true)}
                className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                  filters.popFilter === true
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-studio-card border-studio-border text-studio-textDim hover:border-studio-textDim/50'
                }`}
              >
                开启
              </button>
              <button
                onClick={() => setFilter('popFilter', filters.popFilter === false ? null : false)}
                className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                  filters.popFilter === false
                    ? 'bg-red-500/20 border-red-500/50 text-red-400'
                    : 'bg-studio-card border-studio-border text-studio-textDim hover:border-studio-textDim/50'
                }`}
              >
                关闭
              </button>
            </div>
          </div>

          <div>
            <label className="label-dim block mb-1.5">排序</label>
            <div className="flex items-center gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilter('sortBy', e.target.value as any)}
                className="bg-studio-card border border-studio-border rounded px-3 py-1.5 text-sm text-studio-text flex-1 focus:outline-none focus:border-accent-amber/50"
              >
                <option value="createdAt">录制时间</option>
                <option value="name">名称</option>
                <option value="distance">拾音距离</option>
                <option value="gain">增益设置</option>
                <option value="emotion">情绪表现</option>
              </select>
              <button
                onClick={toggleSortOrder}
                className="p-1.5 bg-studio-card border border-studio-border rounded hover:bg-studio-hover transition-colors"
                title={filters.sortOrder === 'asc' ? '升序' : '降序'}
              >
                <ArrowUpDown
                  className={`w-4 h-4 transition-transform ${
                    filters.sortOrder === 'desc' ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
