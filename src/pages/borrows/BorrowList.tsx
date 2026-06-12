import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ArrowRightLeft, Clock, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store';
import { BORROW_STATUS_COLORS, BORROW_STATUS_LABELS, type BorrowStatus, DEVICE_STATUS_LABELS } from '@/types';

export default function BorrowList() {
  const { borrows, devices } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BorrowStatus | 'all'>('all');

  const deviceMap = useMemo(() => {
    const map = new Map<string, (typeof devices)[number]>();
    devices.forEach((d) => map.set(d.id, d));
    return map;
  }, [devices]);

  const filteredBorrows = useMemo(() => {
    return borrows.filter((b) => {
      const device = deviceMap.get(b.deviceId);
      const matchSearch =
        b.borrower.toLowerCase().includes(search.toLowerCase()) ||
        b.purpose.toLowerCase().includes(search.toLowerCase()) ||
        (device?.code.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [borrows, deviceMap, search, statusFilter]);

  const stats = useMemo(() => ({
    total: borrows.length,
    borrowing: borrows.filter((b) => b.status === 'borrowing').length,
    overdue: borrows.filter((b) => b.status === 'overdue').length,
    returned: borrows.filter((b) => b.status === 'returned').length,
  }), [borrows]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">借用管理</h1>
          <p className="text-sm text-slate-500 mt-1">
            借用中 <span className="text-blue-600 font-medium">{stats.borrowing}</span> · 逾期{' '}
            <span className="text-rose-600 font-medium">{stats.overdue}</span> · 已归还{' '}
            <span className="text-emerald-600 font-medium">{stats.returned}</span>
          </p>
        </div>
        <Link to="/borrows/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          发起借用
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索借用人、用途、设备编号..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BorrowStatus | 'all')}
            className="input w-40"
          >
            <option value="all">全部状态</option>
            {Object.entries(BORROW_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  设备
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  借用人
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  用途
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  借用时间
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  预计归还
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  状态
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBorrows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-slate-400">
                    暂无借用记录
                  </td>
                </tr>
              ) : (
                filteredBorrows.map((borrow) => {
                  const device = deviceMap.get(borrow.deviceId);
                  const isOverdue = borrow.status === 'overdue';
                  const isActive = borrow.status === 'borrowing' || borrow.status === 'overdue';
                  return (
                    <tr
                      key={borrow.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isOverdue ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {device && (
                            <img
                              src={device.photo}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-slate-800">
                              {device?.code || '未知设备'}
                            </div>
                            <div className="text-xs text-slate-500">{device?.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-700">{borrow.borrower}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-600 max-w-[200px] truncate">
                        {borrow.purpose}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{borrow.borrowDate}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-sm flex items-center gap-1 ${
                            isOverdue ? 'text-rose-600 font-medium' : 'text-slate-500'
                          }`}
                        >
                          {isOverdue && <AlertTriangle className="w-4 h-4" />}
                          {borrow.expectedReturnDate}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`badge ${BORROW_STATUS_COLORS[borrow.status]}`}>
                          {BORROW_STATUS_LABELS[borrow.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {isActive ? (
                          <Link
                            to={`/returns/${borrow.id}`}
                            className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                            归还验收
                          </Link>
                        ) : (
                          <span className="text-sm text-slate-400">
                            {borrow.actualReturnDate || '-'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
