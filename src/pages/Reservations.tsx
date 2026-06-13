import { useEffect, useState } from 'react';
import { Plus, CalendarDays, Search, X, AlertTriangle, CheckCircle2, User, AlertCircle, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store';
import { bedsApi, reservationsApi } from '@/api/client';
import type { Bed, Reservation, TimeSlot } from '#shared/types';

const timeSlotLabels: Record<TimeSlot, string> = { morning: '上午', afternoon: '下午', full: '全天' };
const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: '待签到', color: 'bg-sky-100 text-sky-700' },
  checked_in: { label: '已签到', color: 'bg-emerald-100 text-emerald-700' },
  absent: { label: '未到', color: 'bg-red-100 text-red-700' },
  swapped: { label: '已换床', color: 'bg-violet-100 text-violet-700' },
};

function ReservationModal({ onClose, onSaved, availableBeds }: {
  onClose: () => void;
  onSaved: () => void;
  availableBeds: Bed[];
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    bedId: 0,
    className: '',
    studentName: '',
    date: today,
    timeSlot: 'full' as TimeSlot,
    allergyNote: '',
    parentConfirmed: true,
  });
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!form.bedId || !form.date) { setConflict(null); return; }
    setChecking(true);
    reservationsApi.checkConflict(form.bedId, form.date, form.timeSlot).then((r) => {
      setConflict(r.available ? null : r.reason || '不可预约');
    }).finally(() => setChecking(false));
  }, [form.bedId, form.date, form.timeSlot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.bedId) { setError('请选择床位'); return; }
    if (conflict) { setError(conflict); return; }
    try {
      await reservationsApi.create(form);
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const disabledBeds = availableBeds.filter(b => b.disinfectionStatus !== 'completed');

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="glass-card rounded-3xl p-6 w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-display text-gray-800">新增预约</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">班级</label>
              <input className="input-field" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} placeholder="如 一(1)班" required />
            </div>
            <div>
              <label className="label-field">学生姓名</label>
              <input className="input-field" value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} placeholder="如 张三" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">日期</label>
              <input type="date" className="input-field" value={form.date} min={today} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div>
              <label className="label-field">午休时段</label>
              <select className="input-field" value={form.timeSlot} onChange={(e) => setForm({ ...form, timeSlot: e.target.value as TimeSlot })}>
                <option value="full">全天</option>
                <option value="morning">上午</option>
                <option value="afternoon">下午</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label-field">选择床位</label>
            <select
              className="input-field"
              value={form.bedId}
              onChange={(e) => setForm({ ...form, bedId: Number(e.target.value) })}
              required
            >
              <option value={0}>-- 请选择 --</option>
              {availableBeds.map((bed) => {
                const disabled = bed.disinfectionStatus !== 'completed';
                return (
                  <option key={bed.id} value={bed.id} disabled={disabled}>
                    {bed.room}室 #{bed.bedNumber} ({bed.bunkType === 'upper' ? '上铺' : '下铺'})
                    {disabled ? ' - 消毒未完成' : bed.isWindowSide ? ' - 靠窗' : ''}
                  </option>
                );
              })}
            </select>
            {disabledBeds.length > 0 && (
              <p className="text-xs text-accent-600 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                有 {disabledBeds.length} 张床位因消毒未完成无法预约
              </p>
            )}
            {checking && <p className="text-xs text-gray-500 mt-1.5">正在检查可用性...</p>}
            {!checking && conflict && (
              <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1 bg-red-50 px-2 py-1.5 rounded-lg">
                <AlertTriangle className="w-3 h-3" />{conflict}
              </p>
            )}
            {!checking && !conflict && form.bedId > 0 && (
              <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />该床位此时段可预约
              </p>
            )}
          </div>

          <div>
            <label className="label-field">过敏备注</label>
            <textarea
              className="input-field min-h-20 resize-none"
              value={form.allergyNote}
              onChange={(e) => setForm({ ...form, allergyNote: e.target.value })}
              placeholder="如对牛奶、花生过敏等"
            />
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              id="parent-confirmed"
              type="checkbox"
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              checked={form.parentConfirmed}
              onChange={(e) => setForm({ ...form, parentConfirmed: e.target.checked })}
            />
            <label htmlFor="parent-confirmed" className="text-sm text-gray-700">家长已确认</label>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">取消</button>
            <button type="submit" className="flex-1 btn-primary" disabled={!!conflict || checking}>确认预约</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Reservations() {
  const { reservations, beds, fetchReservations, fetchBeds } = useAppStore();
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBeds();
    fetchReservations(dateFilter || undefined);
  }, [fetchBeds, fetchReservations, dateFilter]);

  const filtered = reservations.filter((r) => {
    return !search || r.className.includes(search) || r.studentName.includes(search);
  });

  const handleDelete = async (id: number) => {
    if (!confirm('确认取消该预约吗？')) return;
    await reservationsApi.delete(id);
    fetchReservations(dateFilter || undefined);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-display text-gray-800 mb-1">预约管理</h1>
          <p className="text-gray-500">共 {reservations.length} 条预约记录</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" />新增预约
        </button>
      </div>

      <div className="glass-card rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input-field pl-10"
            placeholder="搜索班级或姓名..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-gray-500" />
          <input
            type="date"
            className="input-field w-40"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          {dateFilter && (
            <button onClick={() => setDateFilter('')} className="text-sm text-primary-600 hover:underline">清除</button>
          )}
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <CalendarDays className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>暂无预约记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">日期/时段</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">班级/学生</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">床位</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">过敏备注</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">状态</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => {
                  const info = statusLabels[r.status];
                  return (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-primary-50/30 transition-colors animate-slide-up" style={{ animationDelay: `${idx * 30}ms` }}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">{r.date}</div>
                        <div className="text-xs text-gray-500">{timeSlotLabels[r.timeSlot]}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{r.studentName}</div>
                            <div className="text-xs text-gray-500">{r.className}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">{r.bed?.room}室 #{r.bed?.bedNumber}</div>
                        <div className="text-xs text-gray-500">
                          {r.bed?.bunkType === 'upper' ? '上铺' : '下铺'}
                          {r.bed?.isWindowSide ? ' · 靠窗' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {r.allergyNote ? <span className="text-accent-600">{r.allergyNote}</span> : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`tag ${info.color}`}>{info.label}</span>
                        {r.parentConfirmed && <span className="ml-2 tag bg-emerald-50 text-emerald-600">家长确认</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {r.status === 'pending' && (
                          <button onClick={() => handleDelete(r.id)} className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors inline-flex">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <ReservationModal
          onClose={() => setShowModal(false)}
          onSaved={() => fetchReservations(dateFilter || undefined)}
          availableBeds={beds}
        />
      )}
    </div>
  );
}
