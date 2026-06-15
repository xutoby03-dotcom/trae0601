import { useState, useMemo } from 'react';
import { Search, Filter, Shirt } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { CLOTHING_TYPE_LABELS, type ClothingType, type ExchangeRequest } from '@/types';
import ClassGroup from '@/components/ClassGroup';
import ExchangeConfirmModal from '@/components/ExchangeConfirmModal';

export default function RequestsPage() {
  const requests = useAppStore((s) => s.requests);
  const markManual = useAppStore((s) => s.markManual);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ClothingType | 'all'>('all');
  const [selectedRequest, setSelectedRequest] =
    useState<ExchangeRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (filterType !== 'all' && req.clothingType !== filterType) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          req.studentName.toLowerCase().includes(query) ||
          req.className.toLowerCase().includes(query) ||
          req.phone.includes(query)
        );
      }
      return true;
    });
  }, [requests, searchQuery, filterType]);

  const groupedByClass = useMemo(() => {
    const groups: Record<string, ExchangeRequest[]> = {};
    filteredRequests.forEach((req) => {
      if (!groups[req.className]) {
        groups[req.className] = [];
      }
      groups[req.className].push(req);
    });
    return groups;
  }, [filteredRequests]);

  const handleConfirm = (request: ExchangeRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleMarkManual = (request: ExchangeRequest) => {
    markManual(request.id, '王老师', '吊牌问题，登记人工处理');
  };

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const manualCount = requests.filter((r) => r.status === 'manual').length;
  const totalCount = requests.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">待换需求</h2>
          <p className="text-sm text-slate-500 mt-1">
            按班级分组展示所有调换需求
          </p>
        </div>
        <div className="flex gap-2">
          <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm">
            共 <span className="font-bold">{totalCount}</span> 条需求
          </div>
          <div className="bg-amber-50 text-amber-700 px-3 py-2 rounded-lg text-sm">
            <span className="font-bold">{pendingCount}</span> 待处理
          </div>
          <div className="bg-orange-50 text-orange-700 px-3 py-2 rounded-lg text-sm">
            <span className="font-bold">{manualCount}</span> 待人工
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索姓名、班级、电话..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value as ClothingType | 'all')
            }
            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm appearance-none pr-8 cursor-pointer"
          >
            <option value="all">全部类型</option>
            {Object.entries(CLOTHING_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedByClass).length > 0 ? (
          Object.entries(groupedByClass)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([className, classRequests]) => (
              <ClassGroup
                key={className}
                className={className}
                requests={classRequests}
                onConfirm={handleConfirm}
                onMarkManual={handleMarkManual}
              />
            ))
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shirt className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-600 mb-1">
              暂无调换需求
            </h3>
            <p className="text-sm text-slate-400">没有找到匹配的调换记录</p>
          </div>
        )}
      </div>

      <ExchangeConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        request={selectedRequest}
      />
    </div>
  );
}
