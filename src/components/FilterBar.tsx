import { useAppStore } from '../store/useStore';
import { Search, Building2, Home, X } from 'lucide-react';
import { cn } from '../lib/utils';

export function FilterBar() {
  const {
    filterBuilding,
    filterRoom,
    setFilterBuilding,
    setFilterRoom,
    availableBuildings,
    availableRooms,
    searchKeyword,
    setSearchKeyword,
  } = useAppStore();

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="搜索教学楼、房间号、座位号、登记人..."
            className="w-full bg-slate-50 pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-700 placeholder-slate-400 border border-slate-200 focus:outline-none focus:bg-white focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 transition-all"
          />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200"
            >
              <X className="w-3.5 h-3.5 text-slate-500" />
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 lg:w-44">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={filterBuilding}
              onChange={(e) => setFilterBuilding(e.target.value)}
              className={cn(
                'w-full appearance-none bg-slate-50 pl-10 pr-9 py-2.5 rounded-xl text-sm text-slate-700 border border-slate-200 focus:outline-none focus:bg-white focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 transition-all cursor-pointer',
              )}
            >
              <option value="">全部教学楼</option>
              {availableBuildings.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 lg:w-40">
            <Home className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              disabled={!filterBuilding && availableBuildings.length === 0 ? false : false}
              className="w-full appearance-none bg-slate-50 pl-10 pr-9 py-2.5 rounded-xl text-sm text-slate-700 border border-slate-200 focus:outline-none focus:bg-white focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">全部教室</option>
              {availableRooms.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {(filterBuilding || filterRoom) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
          <span className="text-xs text-slate-500">当前筛选：</span>
          <div className="flex flex-wrap gap-2">
            {filterBuilding && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg text-xs font-medium">
                <Building2 className="w-3 h-3" />
                {filterBuilding}
                <button onClick={() => setFilterBuilding('')} className="hover:text-teal-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filterRoom && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-50 text-cyan-700 rounded-lg text-xs font-medium">
                <Home className="w-3 h-3" />
                教室 {filterRoom}
                <button onClick={() => setFilterRoom('')} className="hover:text-cyan-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
