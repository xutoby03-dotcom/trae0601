import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Search,
  User,
  Clock,
  Package,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import { formatDateTime } from '@/utils/date';

export default function RequestList() {
  const requests = useStore((s) => s.requests);
  const items = useStore((s) => s.items);
  const [statusFilter, setStatusFilter] = useState('all');
  const [keyword, setKeyword] = useState('');

  const urgencyOrder = { urgent: 0, high: 1, normal: 2, low: 3 };

  const filteredRequests = useMemo(() => {
    return requests
      .filter((r) => {
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;
        if (keyword) {
          const item = items.find((i) => i.id === r.itemId);
          const searchText = `${item?.name || ''} ${r.applicantName} ${r.remark}`.toLowerCase();
          if (!searchText.includes(keyword.toLowerCase())) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.status !== b.status) {
          const statusOrder = { pending: 0, processing: 1, completed: 2, cancelled: 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        }
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      });
  }, [requests, items, statusFilter, keyword]);

  const getStatusCounts = () => {
    return {
      all: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      processing: requests.filter((r) => r.status === 'processing').length,
      completed: requests.filter((r) => r.status === 'completed').length,
    };
  };

  const counts = getStatusCounts();

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索物品、申请人、备注..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            {(['all', 'pending', 'processing', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-brand-500 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {status === 'all' ? '全部' : status === 'pending' ? '待处理' : status === 'processing' ? '处理中' : '已完成'}
                <span className={`ml-1.5 ${statusFilter === status ? 'text-brand-100' : 'text-slate-400'}`}>
                  {counts[status]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="w-8 h-8" />}
          title="暂无申请记录"
          description={keyword || statusFilter !== 'all' ? '没有匹配的申请，试试调整筛选条件' : '还没有任何补货申请'}
          action={
            <Link to="/requests/new" className="btn-primary">
              新建申请
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((req) => {
            const item = items.find((i) => i.id === req.itemId);
            return (
              <Link
                key={req.id}
                to={req.status === 'pending' ? '/purchases' : '#'}
                className="card-hover block p-4 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                    {item?.photoUrl ? (
                      <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-display text-xl">
                        {item?.name.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900 truncate">{item?.name || '未知物品'}</h4>
                      <StatusBadge type="urgency" value={req.urgency} />
                      <StatusBadge type="request" value={req.status} />
                    </div>
                    <p className="text-sm text-slate-500 mb-2 line-clamp-1">{req.remark || '无备注'}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {req.applicantName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-3.5 h-3.5" />
                        剩余 {req.currentRemaining}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDateTime(req.createdAt)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors flex-shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
