import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, ChevronRight, Plus, Volume2, Image, Music, Filter, X, RotateCcw } from 'lucide-react';
import { useComplaintStore } from '@/store/useComplaintStore';
import { NOISE_TYPE_LABELS, STATUS_LABELS, type ComplaintStatus, type NoiseType } from '@/types';

const STATUS_TABS: ComplaintStatus[] = ['ongoing', 'pending', 'resolved', 'recurring'];

const NOISE_TYPE_BORDER_COLORS: Record<NoiseType, string> = {
  renovation: 'border-amber-500',
  singing: 'border-purple-500',
  speaker: 'border-rose-500',
  pet: 'border-sky-500',
  other: 'border-slate-500',
};

const NOISE_TYPE_DOT_COLORS: Record<NoiseType, string> = {
  renovation: 'bg-amber-500',
  singing: 'bg-purple-500',
  speaker: 'bg-rose-500',
  pet: 'bg-sky-500',
  other: 'bg-slate-500',
};

const NOISE_TYPES: NoiseType[] = ['renovation', 'singing', 'speaker', 'pet', 'other'];

export default function Home() {
  const [activeTab, setActiveTab] = useState<ComplaintStatus>('ongoing');
  const [filterNoiseType, setFilterNoiseType] = useState<NoiseType | ''>('');
  const [filterLocation, setFilterLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const complaints = useComplaintStore((s) => s.complaints);

  const locationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    complaints.forEach((c) => {
      counts[c.location] = (counts[c.location] || 0) + 1;
    });
    return counts;
  }, [complaints]);

  const uniqueLocations = useMemo(() => {
    return [...new Set(complaints.map((c) => c.location))].sort();
  }, [complaints]);

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      if (c.status !== activeTab) return false;
      if (filterNoiseType && c.noiseType !== filterNoiseType) return false;
      if (filterLocation && c.location !== filterLocation) return false;
      return true;
    });
  }, [complaints, activeTab, filterNoiseType, filterLocation]);

  const countByStatus = (status: ComplaintStatus) =>
    complaints.filter((c) => c.status === status).length;

  const hasActiveFilter = filterNoiseType !== '' || filterLocation !== '';

  const clearFilters = () => {
    setFilterNoiseType('');
    setFilterLocation('');
  };

  const handleLocationClick = (location: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (filterLocation === location) {
      setFilterLocation('');
    } else {
      setFilterLocation(location);
      setShowFilters(true);
    }
  };

  return (
    <div className="pb-20">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex">
          {STATUS_TABS.map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className="flex-1 relative py-3 text-sm text-center"
            >
              <span className={activeTab === status ? 'text-teal-600 font-medium' : 'text-gray-500'}>
                {STATUS_LABELS[status]}
              </span>
              <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-xs bg-gray-100 text-gray-500">
                {countByStatus(status)}
              </span>
              {activeTab === status && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-teal-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border mb-3 transition ${
            hasActiveFilter
              ? 'border-teal-300 text-teal-600 bg-teal-50'
              : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          筛选
          {hasActiveFilter && (
            <span className="ml-0.5 w-4 h-4 rounded-full bg-teal-600 text-white text-[10px] flex items-center justify-center">
              {(filterNoiseType ? 1 : 0) + (filterLocation ? 1 : 0)}
            </span>
          )}
        </button>

        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-3 space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">噪音类型</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setFilterNoiseType('')}
                  className={`px-2.5 py-1 rounded-full text-xs border transition ${
                    filterNoiseType === ''
                      ? 'border-teal-400 text-teal-600 bg-teal-50'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  全部
                </button>
                {NOISE_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterNoiseType(filterNoiseType === type ? '' : type)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition ${
                      filterNoiseType === type
                        ? 'border-teal-400 text-teal-600 bg-teal-50'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${NOISE_TYPE_DOT_COLORS[type]}`} />
                    {NOISE_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">位置</label>
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="">全部位置</option>
                {uniqueLocations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            {hasActiveFilter && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition"
              >
                <RotateCcw className="w-3 h-3" />清除筛选
              </button>
            )}
          </div>
        )}

        {filterLocation && (
          <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
            <span>当前筛选位置：</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 border border-teal-200">
              {filterLocation}
              <X
                className="w-3 h-3 cursor-pointer hover:text-red-500"
                onClick={() => setFilterLocation('')}
              />
            </span>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Volume2 className="w-12 h-12 mb-3" />
            <p className="text-sm">当前暂无{STATUS_LABELS[activeTab]}的投诉</p>
          </div>
        ) : (
          filtered.map((complaint) => {
            const recurrenceCount = locationCounts[complaint.location] || 1;
            const isRecurring = recurrenceCount > 1;
            return (
              <Link
                key={complaint.id}
                to={`/complaint/${complaint.id}`}
                className={`block bg-white rounded-xl shadow-sm p-4 mb-3 hover:shadow-md transition cursor-pointer border-l-[3px] ${NOISE_TYPE_BORDER_COLORS[complaint.noiseType]}`}
              >
                <div className="flex items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400">{NOISE_TYPE_LABELS[complaint.noiseType]}</span>
                      {complaint.affectsRest && (
                        <span className="text-xs text-rose-500 font-medium">影响休息</span>
                      )}
                      <span className="flex items-center gap-0.5 text-xs text-slate-400">
                        <Image className="w-3 h-3" />{(complaint.photoUrls ?? []).length}
                      </span>
                      <span className="flex items-center gap-0.5 text-xs text-slate-400">
                        <Music className="w-3 h-3" />{(complaint.audioUrls ?? []).length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <p
                        className="font-medium text-gray-900 cursor-pointer hover:text-teal-600 transition"
                        onClick={(e) => handleLocationClick(complaint.location, e)}
                      >
                        {complaint.location}
                      </p>
                      {isRecurring && (
                        <span className="inline-flex items-center px-1.5 py-0 rounded-full text-[10px] font-medium bg-orange-100 text-orange-600">
                          {recurrenceCount}次复发
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{new Date(complaint.noiseTime).toLocaleString('zh-CN')}</span>
                      <span>{complaint.durationMinutes}分钟</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Users className="w-3.5 h-3.5" />
                      {complaint.seconds.length}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      <Link
        to="/complaint/new"
        className="fixed bottom-24 right-6 w-14 h-14 bg-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transition flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
}
