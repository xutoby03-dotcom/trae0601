import { useEffect, useState } from 'react';
import { Search, CheckCircle, Clock, Filter } from 'lucide-react';
import { useElderlyStore } from '@/store/elderlyStore';
import { useCheckInStore } from '@/store/checkInStore';
import { Elderly, CheckInSource } from '@/types';
import { getToday } from '@/utils/date';
import SourceBadge from '@/components/SourceBadge';
import CheckInModal from '@/components/CheckInModal';
import { mockGrids } from '@/data/grids';

export default function CheckInPage() {
  const { elderlyList, initElderly } = useElderlyStore();
  const { checkInRecords, initCheckIns, getTodayStatus, recordCheckIn } = useCheckInStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [gridFilter, setGridFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'unconfirmed'>('all');
  const [selectedElderly, setSelectedElderly] = useState<Elderly | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    initElderly();
    initCheckIns();
  }, [initElderly, initCheckIns]);

  const today = getToday();

  const filteredElderly = elderlyList.filter(e => {
    const matchesSearch = e.name.includes(searchTerm) || 
                          e.building.includes(searchTerm) ||
                          e.roomNumber.includes(searchTerm);
    const matchesGrid = gridFilter === 'all' || e.gridId === gridFilter;
    
    const todayStatus = getTodayStatus(e.id);
    const isConfirmed = todayStatus?.status === 'confirmed';
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'confirmed' && isConfirmed) ||
                          (statusFilter === 'unconfirmed' && !isConfirmed);
    
    return matchesSearch && matchesGrid && matchesStatus;
  });

  const todayCheckIns = checkInRecords.filter(c => c.checkDate === today);
  const confirmedCount = todayCheckIns.filter(c => c.status === 'confirmed').length;
  const unconfirmedCount = elderlyList.length - confirmedCount;

  const handleQuickConfirm = (elderly: Elderly, source: CheckInSource) => {
    recordCheckIn(elderly.id, source);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">今日登记总数</p>
          <p className="text-3xl font-bold text-blue-600">{elderlyList.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">已确认平安</p>
          <p className="text-3xl font-bold text-green-600">{confirmedCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">待确认</p>
          <p className="text-3xl font-bold text-orange-600">{unconfirmedCount}</p>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索姓名、楼栋..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-64 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={gridFilter}
            onChange={(e) => setGridFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
          >
            <option value="all">全部网格</option>
            {mockGrids.map(grid => (
              <option key={grid.id} value={grid.id}>{grid.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xl p-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === 'confirmed' ? 'bg-green-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              已确认
            </button>
            <button
              onClick={() => setStatusFilter('unconfirmed')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === 'unconfirmed' ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              待确认
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full" key={refreshKey}>
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">老人信息</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">住址</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">今日状态</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">确认来源</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">确认时间</th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-slate-700">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredElderly.map((elderly, index) => {
              const todayStatus = getTodayStatus(elderly.id);
              const isConfirmed = todayStatus?.status === 'confirmed';
              
              return (
                <tr key={elderly.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{elderly.avatar}</span>
                      <div>
                        <p className="font-semibold text-slate-800">{elderly.name}</p>
                        <p className="text-sm text-slate-500">{elderly.gender === 'female' ? '女' : '男'} · {elderly.age}岁</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600">{elderly.building} {elderly.unit} {elderly.roomNumber}</p>
                  </td>
                  <td className="px-6 py-4">
                    {isConfirmed ? (
                      <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200 text-sm font-medium">
                        <CheckCircle size={16} />
                        已确认
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-orange-700 bg-orange-50 px-3 py-1 rounded-full border border-orange-200 text-sm font-medium">
                        <Clock size={16} />
                        待确认
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {todayStatus?.source ? (
                      <SourceBadge source={todayStatus.source} />
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {todayStatus?.checkTime ? (
                      <span className="text-sm text-slate-600 font-mono">
                        {todayStatus.checkTime.split(' ')[1]}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {!isConfirmed ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedElderly(elderly)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                        >
                          登记确认
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <button
                          onClick={() => setSelectedElderly(elderly)}
                          className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          修改记录
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredElderly.length === 0 && (
          <div className="py-16 text-center">
            <Filter size={48} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">暂无匹配的记录</p>
          </div>
        )}
      </div>

      {selectedElderly && (
        <CheckInModal
          elderly={selectedElderly}
          onClose={() => setSelectedElderly(null)}
          onSuccess={() => setRefreshKey(prev => prev + 1)}
        />
      )}
    </div>
  );
}
