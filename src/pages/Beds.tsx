import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle, AlertCircle, Clock, Sun, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useAppStore } from '@/store';
import { bedsApi } from '@/api/client';
import type { Bed, BunkType, DisinfectionStatus } from '#shared/types';

const bunkTypeLabels: Record<BunkType, string> = { upper: '上铺', lower: '下铺' };
const disinfectionLabels: Record<DisinfectionStatus, { label: string; color: string }> = {
  completed: { label: '已消毒', color: 'bg-emerald-100 text-emerald-700' },
  pending: { label: '待消毒', color: 'bg-accent-100 text-accent-700' },
  expired: { label: '消毒过期', color: 'bg-red-100 text-red-700' },
};

function BedCard({ bed, onEdit, onDelete, onUpdateDisinfection }: {
  bed: Bed;
  onEdit: (bed: Bed) => void;
  onDelete: (id: number) => void;
  onUpdateDisinfection: (id: number, status: DisinfectionStatus) => void;
}) {
  const dInfo = disinfectionLabels[bed.disinfectionStatus];

  return (
    <div className="glass-card rounded-2xl p-5 hover:shadow-xl transition-all duration-300 group animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold font-display text-gray-800">{bed.room}室</span>
            <span className="text-lg font-semibold text-primary-600">#{bed.bedNumber}</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">创建于 {bed.createdAt?.slice(0, 10)}</p>
        </div>
        <span className={`tag ${dInfo.color}`}>
          {bed.disinfectionStatus === 'completed' && <CheckCircle className="w-3 h-3" />}
          {bed.disinfectionStatus === 'pending' && <AlertCircle className="w-3 h-3" />}
          {bed.disinfectionStatus === 'expired' && <Clock className="w-3 h-3" />}
          {dInfo.label}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="tag bg-sky-100 text-sky-700">
          {bed.bunkType === 'upper' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {bunkTypeLabels[bed.bunkType]}
        </span>
        {bed.isWindowSide && (
          <span className="tag bg-amber-100 text-amber-700">
            <Sun className="w-3 h-3" />
            靠窗
          </span>
        )}
        {bed.disinfectionDate && (
          <span className="tag bg-gray-100 text-gray-600">
            消毒: {bed.disinfectionDate}
          </span>
        )}
      </div>

      <div className="pt-3 border-t border-gray-100 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {bed.disinfectionStatus !== 'completed' && (
          <button
            onClick={() => onUpdateDisinfection(bed.id, 'completed')}
            className="flex-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
          >
            标记已消毒
          </button>
        )}
        <button onClick={() => onEdit(bed)} className="flex-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors flex items-center justify-center gap-1">
          <Edit2 className="w-3 h-3" />编辑
        </button>
        <button onClick={() => onDelete(bed.id)} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

function BedModal({ bed, onClose, onSaved }: {
  bed: Bed | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    room: bed?.room || '',
    bedNumber: bed?.bedNumber || '',
    bunkType: (bed?.bunkType || 'lower') as BunkType,
    isWindowSide: bed?.isWindowSide || false,
    disinfectionStatus: (bed?.disinfectionStatus || 'pending') as DisinfectionStatus,
    disinfectionDate: bed?.disinfectionDate || new Date().toISOString().slice(0, 10),
    photoUrl: bed?.photoUrl || '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (bed) {
        await bedsApi.update(bed.id, form);
      } else {
        await bedsApi.create(form);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="glass-card rounded-3xl p-6 w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-display text-gray-800">{bed ? '编辑床位' : '新增床位'}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">房间号</label>
              <input className="input-field" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="如 101" required />
            </div>
            <div>
              <label className="label-field">床号</label>
              <input className="input-field" value={form.bedNumber} onChange={(e) => setForm({ ...form, bedNumber: e.target.value })} placeholder="如 1" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">铺位类型</label>
              <select className="input-field" value={form.bunkType} onChange={(e) => setForm({ ...form, bunkType: e.target.value as BunkType })}>
                <option value="lower">下铺</option>
                <option value="upper">上铺</option>
              </select>
            </div>
            <div>
              <label className="label-field">消毒状态</label>
              <select className="input-field" value={form.disinfectionStatus} onChange={(e) => setForm({ ...form, disinfectionStatus: e.target.value as DisinfectionStatus })}>
                <option value="pending">待消毒</option>
                <option value="completed">已消毒</option>
                <option value="expired">消毒过期</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label-field">消毒日期</label>
            <input type="date" className="input-field" value={form.disinfectionDate} onChange={(e) => setForm({ ...form, disinfectionDate: e.target.value })} />
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              id="window-side"
              type="checkbox"
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              checked={form.isWindowSide}
              onChange={(e) => setForm({ ...form, isWindowSide: e.target.checked })}
            />
            <label htmlFor="window-side" className="text-sm text-gray-700">靠窗床位</label>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">取消</button>
            <button type="submit" className="flex-1 btn-primary">{bed ? '保存修改' : '添加床位'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Beds() {
  const { beds, fetchBeds } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DisinfectionStatus | ''>('');
  const [showModal, setShowModal] = useState(false);
  const [editingBed, setEditingBed] = useState<Bed | null>(null);

  useEffect(() => {
    fetchBeds();
  }, [fetchBeds]);

  const filteredBeds = beds.filter((b) => {
    const matchSearch = `${b.room}${b.bedNumber}`.includes(search) || search === '';
    const matchStatus = !statusFilter || b.disinfectionStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除该床位吗？')) return;
    await bedsApi.delete(id);
    fetchBeds();
  };

  const handleUpdateDisinfection = async (id: number, status: DisinfectionStatus) => {
    await bedsApi.updateDisinfection(id, status);
    fetchBeds();
  };

  const rooms = [...new Set(beds.map((b) => b.room))].sort();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-display text-gray-800 mb-1">床位管理</h1>
          <p className="text-gray-500">共 {beds.length} 张床位</p>
        </div>
        <button onClick={() => { setEditingBed(null); setShowModal(true); }} className="btn-primary">
          <Plus className="w-4 h-4" />新增床位
        </button>
      </div>

      <div className="glass-card rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input-field pl-10"
            placeholder="搜索房间号或床号..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field w-40"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <option value="">全部状态</option>
          <option value="completed">已消毒</option>
          <option value="pending">待消毒</option>
          <option value="expired">消毒过期</option>
        </select>
      </div>

      {rooms.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-gray-500">
          <Bed className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>暂无床位，点击右上角新增</p>
        </div>
      ) : (
        rooms.map((room) => (
          <div key={room} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary-500 rounded-full" />
              {room}室
              <span className="text-sm font-normal text-gray-400">
                ({filteredBeds.filter(b => b.room === room).length}张)
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBeds.filter(b => b.room === room).map((bed) => (
                <BedCard
                  key={bed.id}
                  bed={bed}
                  onEdit={(b) => { setEditingBed(b); setShowModal(true); }}
                  onDelete={handleDelete}
                  onUpdateDisinfection={handleUpdateDisinfection}
                />
              ))}
            </div>
          </div>
        ))
      )}

      {showModal && (
        <BedModal
          bed={editingBed}
          onClose={() => { setShowModal(false); setEditingBed(null); }}
          onSaved={fetchBeds}
        />
      )}
    </div>
  );
}

function Bed(props: any) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M2 17h20"/><circle cx="7" cy="10" r="2"/></svg>;
}
