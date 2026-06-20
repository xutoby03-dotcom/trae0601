import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  ArrowLeftRight,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { BORROW_STATUS_LABEL, BorrowStatus, CATEGORY_LABEL, NEEDS_CLEAN_CHECK } from '@/types';
import { daysUntil, formatDate } from '@/utils';
import Button from '@/components/Button';
import ReturnCheckModal from '@/components/ReturnCheckModal';

const statusBadgeClass: Record<BorrowStatus, string> = {
  borrowing: 'badge-success',
  returned: 'badge-neutral',
  overdue: 'badge-danger',
};

const statusIcon = {
  borrowing: Clock,
  returned: CheckCircle2,
  overdue: AlertCircle,
};

export default function BorrowList() {
  const { borrows, returnBorrow } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BorrowStatus | 'all'>('all');
  const [returnTarget, setReturnTarget] = useState<string | null>(null);

  const filtered = borrows
    .filter(b => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (
        search &&
        !b.residentName.includes(search) &&
        !b.building.includes(search) &&
        !b.itemName.includes(search)
      )
        return false;
      return true;
    })
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));

  const handleReturn = (id: string) => {
    const record = borrows.find(b => b.id === id);
    if (!record) return;
    if (NEEDS_CLEAN_CHECK.includes(record.category)) {
      setReturnTarget(id);
    } else {
      if (confirm('确认该物品已归还？')) {
        returnBorrow(id);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">借用管理</h1>
          <p className="text-sm text-zinc-500 mt-1">居民物品借用登记与归还管理</p>
        </div>
        <Link to="/borrows/new">
          <Button>
            <Plus className="w-4 h-4" />
            借用登记
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-zinc-100 p-4 shadow-card flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="搜索居民姓名、楼栋、物品..."
            className="input pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input max-w-[180px]"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as BorrowStatus | 'all')}
        >
          <option value="all">全部状态</option>
          <option value="borrowing">借用中</option>
          <option value="returned">已归还</option>
          <option value="overdue">已逾期</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-zinc-400">暂无借用记录</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-100">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-zinc-600">居民信息</th>
                  <th className="text-left px-5 py-3 font-medium text-zinc-600">借用物品</th>
                  <th className="text-left px-5 py-3 font-medium text-zinc-600">用途</th>
                  <th className="text-left px-5 py-3 font-medium text-zinc-600">借用日期</th>
                  <th className="text-left px-5 py-3 font-medium text-zinc-600">预计归还</th>
                  <th className="text-left px-5 py-3 font-medium text-zinc-600">归还日期</th>
                  <th className="text-left px-5 py-3 font-medium text-zinc-600">状态</th>
                  <th className="text-right px-5 py-3 font-medium text-zinc-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filtered.map(b => {
                  const StatusIcon = statusIcon[b.status];
                  const days = daysUntil(b.expectedReturnDate);
                  return (
                    <tr key={b.id} className="hover:bg-zinc-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-zinc-900">{b.residentName}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{b.building}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-zinc-900">{b.itemName}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {CATEGORY_LABEL[b.category]} × {b.quantity}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-zinc-600 max-w-[160px] truncate">
                        {b.purpose}
                      </td>
                      <td className="px-5 py-3 text-zinc-600 font-mono">{formatDate(b.borrowDate)}</td>
                      <td className="px-5 py-3">
                        <span className="font-mono text-zinc-600">{b.expectedReturnDate}</span>
                        {!b.actualReturnDate && (
                          <p className={
                            'text-xs mt-0.5 ' +
                            (days < 0 ? 'text-danger-600' : days <= 1 ? 'text-warning-600' : 'text-zinc-400')
                          }>
                            {days < 0 ? '逾期 ' + Math.abs(days) + ' 天' : days === 0 ? '今日到期' : '剩余 ' + days + ' 天'}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {b.actualReturnDate ? (
                          <span className="font-mono text-zinc-600">{formatDate(b.actualReturnDate)}</span>
                        ) : (
                          <span className="text-zinc-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className={statusBadgeClass[b.status]}>
                          <StatusIcon className="w-3 h-3" />
                          {BORROW_STATUS_LABEL[b.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {!b.actualReturnDate && (
                          <Button size="sm" variant="primary" onClick={() => handleReturn(b.id)}>
                            <ArrowLeftRight className="w-4 h-4" />
                            归还
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {returnTarget && (
        <ReturnCheckModal
          borrowId={returnTarget}
          onClose={() => setReturnTarget(null)}
          onConfirm={(cleanStatus) => {
            returnBorrow(returnTarget, cleanStatus);
            setReturnTarget(null);
          }}
        />
      )}
    </div>
  );
}
