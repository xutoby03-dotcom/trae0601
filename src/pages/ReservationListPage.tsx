import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, CalendarClock, User, Building2, XCircle, PlayCircle } from 'lucide-react';
import { useStore } from '../store';
import { ReservationStatusBadge, StatusBadge } from '../components/Badges';
import { useToast } from '../components/Toast';
import { TIME_SLOT_LABEL, DEPARTMENTS } from '../types';
import type { ReservationStatus, TimeSlot } from '../types';
import { format, parseISO, formatISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const statusFilters: { value: ReservationStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'reserved', label: '已预约' },
  { value: 'using', label: '使用中' },
  { value: 'returned', label: '已归还' },
  { value: 'cancelled', label: '已取消' },
];

export default function ReservationListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const reservations = useStore((s) => s.reservations);
  const displays = useStore((s) => s.displays);
  const cancelReservation = useStore((s) => s.cancelReservation);
  const updateReservation = useStore((s) => s.updateReservation);
  const updateDisplay = useStore((s) => s.updateDisplay);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(formatISO(new Date(), { representation: 'date' }));

  const displayMap = useMemo(() => {
    const m = new Map<string, typeof displays[number]>();
    displays.forEach((d) => m.set(d.id, d));
    return m;
  }, [displays]);

  const filtered = useMemo(() => {
    return reservations
      .filter((r) => {
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;
        if (deptFilter !== 'all' && r.department !== deptFilter) return false;
        if (dateFilter && r.useDate < dateFilter) return false;
        if (search) {
          const kw = search.toLowerCase();
          if (!r.userName.toLowerCase().includes(kw)
            && !(displayMap.get(r.displayId)?.code.toLowerCase().includes(kw))
            && !r.purpose.toLowerCase().includes(kw)) return false;
        }
        return true;
      })
      .sort((a, b) => (a.useDate + a.createdAt).localeCompare(b.useDate + b.createdAt) * -1);
  }, [reservations, statusFilter, deptFilter, dateFilter, search, displayMap]);

  const handleStartUse = (id: string, displayId: string) => {
    updateReservation(id, { status: 'using', borrowTime: formatISO(new Date()) });
    updateDisplay(displayId, { status: 'borrowed' });
    toast.show('已标记为使用中', 'success');
  };

  const handleCancel = (id: string) => {
    if (!confirm('确定要取消这个预约吗？')) return;
    cancelReservation(id);
    toast.show('预约已取消', 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-1">预约管理</h2>
          <p className="text-sm text-zinc-500">
            共 {reservations.length} 条预约记录，进行中 {reservations.filter(r => r.status === 'using' || r.status === 'reserved').length} 条
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/reservations/new')}>
          <Plus size={18} />
          创建预约
        </button>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input className="input pl-9" placeholder="搜索姓名/编号/用途..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ReservationStatus | 'all')}>
            {statusFilters.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select className="input" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="all">全部部门</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <div>
            <input type="date" className="input" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-100 flex items-center justify-center">
            <CalendarClock size={28} className="text-zinc-400" />
          </div>
          <p className="text-zinc-600 font-medium">暂无预约记录</p>
          <p className="text-sm text-zinc-400 mt-1">调整筛选条件或创建新预约</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100 text-left text-zinc-600">
                  <th className="px-5 py-3.5 font-semibold whitespace-nowrap">预约日期 / 时段</th>
                  <th className="px-5 py-3.5 font-semibold whitespace-nowrap">设备</th>
                  <th className="px-5 py-3.5 font-semibold whitespace-nowrap">使用人 / 部门</th>
                  <th className="px-5 py-3.5 font-semibold whitespace-nowrap">工位 / 用途</th>
                  <th className="px-5 py-3.5 font-semibold whitespace-nowrap">状态</th>
                  <th className="px-5 py-3.5 font-semibold text-right whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map((r) => {
                  const d = displayMap.get(r.displayId);
                  return (
                    <tr key={r.id} className="hover:bg-brand-50/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-zinc-800">
                          {format(parseISO(r.useDate), 'yyyy年M月d日', { locale: zhCN })}
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">
                          {TIME_SLOT_LABEL[r.timeSlot as TimeSlot]}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {d ? (
                          <div className="flex items-center gap-3">
                            <img src={d.photoUrl} className="w-11 h-11 rounded-lg object-cover bg-zinc-100 border border-zinc-100" alt="" />
                            <div>
                              <div className="font-medium text-zinc-800">{d.code}</div>
                              <div className="flex items-center gap-1 mt-0.5">
                                <StatusBadge status={d.status} />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-zinc-400">设备已删除</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-zinc-800 font-medium">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-xs font-bold">
                            {r.userName.charAt(0)}
                          </div>
                          <User size={14} className="text-zinc-400 hidden" />
                          <span>{r.userName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-zinc-500 mt-1.5 ml-9">
                          <Building2 size={12} />
                          {r.department}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-zinc-800 font-medium">{r.workstation}</div>
                        <div className="text-xs text-zinc-500 mt-1 truncate max-w-[180px]" title={r.purpose}>{r.purpose}</div>
                      </td>
                      <td className="px-5 py-4">
                        <ReservationStatusBadge status={r.status} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.status === 'reserved' && (
                            <>
                              <button className="btn-success !py-1.5 !px-3 text-xs" onClick={() => handleStartUse(r.id, r.displayId)}>
                                <PlayCircle size={14} /> 开始使用
                              </button>
                              <button className="btn-danger !py-1.5 !px-3 text-xs !bg-zinc-500 hover:!bg-zinc-600" onClick={() => handleCancel(r.id)}>
                                <XCircle size={14} /> 取消
                              </button>
                            </>
                          )}
                          {r.status === 'using' && (
                            <button className="btn-primary !py-1.5 !px-3 text-xs" onClick={() => navigate('/returns')}>
                              去归还
                            </button>
                          )}
                          {r.status === 'returned' && (
                            <span className="text-xs text-zinc-400">
                              {r.returnTime ? format(parseISO(r.returnTime), 'M月d日 HH:mm') : ''}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
