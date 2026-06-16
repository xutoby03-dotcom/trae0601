import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  AlertTriangle,
  Clock,
  CheckCircle,
  Filter,
  Calendar,
  User,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { useRectificationStore } from '@/store/rectificationStore';
import { useDeviceStore } from '@/store/deviceStore';
import { useInspectionStore } from '@/store/inspectionStore';
import { RectificationStatus } from '@/types';
import { formatDate, daysUntil } from '@/utils/date';

const typeLabels: Record<string, string> = {
  pressure: '压力异常',
  expired: '设备过期',
  obstruction: '杂物遮挡',
  other: '其他问题'
};

const typeColors: Record<string, string> = {
  pressure: 'bg-red-100 text-red-700',
  expired: 'bg-orange-100 text-orange-700',
  obstruction: 'bg-amber-100 text-amber-700',
  other: 'bg-gray-100 text-gray-700'
};

export function RectificationList() {
  const navigate = useNavigate();
  const { rectifications } = useRectificationStore();
  const { getDeviceById, getBuildings } = useDeviceStore();
  const { getInspectionById } = useInspectionStore();

  const [activeTab, setActiveTab] = useState<RectificationStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('');
  const [filterType, setFilterType] = useState('');

  const buildings = getBuildings();

  const tabs = [
    { key: 'all', label: '全部', count: rectifications.length },
    { key: 'pending', label: '待处理', count: rectifications.filter(r => r.status === 'pending').length },
    { key: 'processing', label: '处理中', count: rectifications.filter(r => r.status === 'processing').length },
    { key: 'closed', label: '已关闭', count: rectifications.filter(r => r.status === 'closed').length }
  ];

  const filteredRectifications = useMemo(() => {
    return rectifications
      .filter(r => {
        const device = getDeviceById(r.deviceId);
        if (!device) return false;

        if (activeTab !== 'all' && r.status !== activeTab) return false;

        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          if (!device.code.toLowerCase().includes(term) &&
              !r.description.toLowerCase().includes(term)) {
            return false;
          }
        }

        if (filterBuilding && device.building !== filterBuilding) return false;
        if (filterType && r.type !== filterType) return false;

        return true;
      })
      .sort((a, b) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime());
  }, [rectifications, activeTab, searchTerm, filterBuilding, filterType, getDeviceById]);

  const getUrgencyColor = (deadline: string, status: RectificationStatus) => {
    if (status === 'closed') return 'text-gray-400';
    const days = daysUntil(deadline);
    if (days <= 0) return 'text-red-600';
    if (days <= 3) return 'text-red-500';
    if (days <= 7) return 'text-amber-500';
    return 'text-gray-500';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">整改管理</h2>
        <p className="mt-1 text-sm text-gray-500">管理所有整改单的处理进度</p>
      </div>

      <div className="rounded-2xl bg-white shadow-sm">
        <div className="flex border-b border-gray-100 px-4">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as RectificationStatus | 'all')}
              className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 rounded-full px-2 py-0.5 text-xs ${
                activeTab === tab.key
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.count}
              </span>
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 border-b border-gray-100 p-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索设备编号或问题描述..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterBuilding}
              onChange={e => setFilterBuilding(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <option value="">全部楼栋</option>
              {buildings.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <option value="">全部类型</option>
              <option value="pressure">压力异常</option>
              <option value="expired">设备过期</option>
              <option value="obstruction">杂物遮挡</option>
              <option value="other">其他问题</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredRectifications.map(rect => {
            const device = getDeviceById(rect.deviceId);
            const inspection = getInspectionById(rect.inspectionId);
            if (!device) return null;

            const days = daysUntil(rect.deadline);

            return (
              <div
                key={rect.id}
                onClick={() => navigate(`/rectifications/${rect.id}`)}
                className="flex items-center gap-4 p-4 transition-colors hover:bg-gray-50 cursor-pointer"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  rect.status === 'closed' ? 'bg-gray-100' : 'bg-red-100'
                }`}>
                  {rect.status === 'closed' ? (
                    <CheckCircle className="h-6 w-6 text-gray-500" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 truncate">
                      {device.code}
                    </h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      typeColors[rect.type]
                    }`}>
                      {typeLabels[rect.type]}
                    </span>
                    <StatusBadge status={rect.status} />
                  </div>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-1">
                    {rect.description}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    {inspection && (
                      <span className="flex items-center gap-1">
                        <ClipboardList className="h-3.5 w-3.5" />
                        巡检: {formatDate(inspection.inspectDate)} · {inspection.inspector}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      处理: {rect.handler}
                    </span>
                    <span className={`flex items-center gap-1 ${getUrgencyColor(rect.deadline, rect.status)}`}>
                      <Clock className="h-3.5 w-3.5" />
                      {rect.status === 'closed'
                        ? `已于${formatDate(rect.fixDate || '')}完成`
                        : days <= 0
                        ? '已超期'
                        : `剩余 ${days} 天`}
                    </span>
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            );
          })}
        </div>

        {filteredRectifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500">暂无符合条件的整改单</p>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500">
        共 {filteredRectifications.length} 条整改记录
      </div>
    </div>
  );
}
