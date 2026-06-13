import { useMemo, useState, useEffect } from 'react';
import { Plus, Search, Filter, X, Edit2, Trash2, Package, Upload, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import type { Medicine, MedicineCategory } from '@/types';
import { CATEGORY_LABELS } from '@/types';
import { isExpired, isExpiringSoon, getMedicineStatus, getStatusColor } from '@/utils/medicine';
import { formatDate, daysUntil } from '@/utils/date';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/common/Badge';
import { StatusTag } from '@/components/common/StatusTag';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';

interface Props {
  editMedicine?: Medicine | null;
  onCloseEdit?: () => void;
}

export function MedicineForm({ editMedicine, onCloseEdit }: Props) {
  const { addMedicine, updateMedicine, familyMembers, medicines } = useAppStore();
  const [form, setForm] = useState({
    name: '',
    category: 'cold' as MedicineCategory,
    applicableTo: 'all',
    dosage: '',
    expiryDate: '',
    storageLocation: '',
    isPrescription: false,
    photoUrl: '',
    stockQuantity: 0,
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editMedicine) {
      setForm({
        name: editMedicine.name,
        category: editMedicine.category,
        applicableTo: editMedicine.applicableTo,
        dosage: editMedicine.dosage,
        expiryDate: editMedicine.expiryDate,
        storageLocation: editMedicine.storageLocation,
        isPrescription: editMedicine.isPrescription,
        photoUrl: editMedicine.photoUrl,
        stockQuantity: editMedicine.stockQuantity,
        notes: editMedicine.notes,
      });
    }
  }, [editMedicine]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, photoUrl: (ev.target?.result as string) || '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      if (editMedicine) {
        updateMedicine(editMedicine.id, form);
      } else {
        addMedicine(form);
      }
      setIsSubmitting(false);
      onCloseEdit?.();
    }, 300);
  };

  const isEdit = !!editMedicine;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-start gap-5">
        <div className="flex-shrink-0">
          <label className="block cursor-pointer group">
            <div
              className={`w-28 h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all ${
                form.photoUrl
                  ? 'border-brand-200'
                  : 'border-slate-200 group-hover:border-brand-300 group-hover:bg-brand-50/30'
              }`}
            >
              {form.photoUrl ? (
                <img src={form.photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera size={24} className="text-slate-400 mb-1" />
                  <span className="text-xs text-slate-500">上传包装</span>
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhoto}
            />
          </label>
          {form.photoUrl && (
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, photoUrl: '' }))}
              className="mt-2 w-full text-xs text-slate-500 hover:text-red-500"
            >
              移除照片
            </button>
          )}
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">药品名称 *</label>
            <input
              required
              className="input-field"
              placeholder="如：布洛芬缓释胶囊"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">药品分类 *</label>
            <select
              className="input-field"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as MedicineCategory })}
            >
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">适用人 *</label>
            <select
              className="input-field"
              value={form.applicableTo}
              onChange={(e) => setForm({ ...form, applicableTo: e.target.value })}
            >
              <option value="all">全家通用</option>
              {familyMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}（{m.relation}）
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">用法用量</label>
          <input
            className="input-field"
            placeholder="如：一次1粒，一日2次"
            value={form.dosage}
            onChange={(e) => setForm({ ...form, dosage: e.target.value })}
          />
        </div>
        <div>
          <label className="label">有效期至 *</label>
          <input
            required
            type="date"
            className="input-field"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
          />
        </div>
        <div>
          <label className="label">存放位置</label>
          <input
            className="input-field"
            placeholder="如：药箱A-上层"
            value={form.storageLocation}
            onChange={(e) => setForm({ ...form, storageLocation: e.target.value })}
          />
        </div>
        <div>
          <label className="label">当前库存（份）*</label>
          <input
            required
            type="number"
            min={0}
            className="input-field"
            value={form.stockQuantity}
            onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/70">
        <label className="flex items-center gap-2 cursor-pointer flex-1">
          <input
            type="checkbox"
            className="w-4 h-4 accent-brand-500"
            checked={form.isPrescription}
            onChange={(e) => setForm({ ...form, isPrescription: e.target.checked })}
          />
          <span className="text-sm text-slate-700">这是处方药（凭处方购买）</span>
        </label>
      </div>

      <div>
        <label className="label">备注</label>
        <textarea
          rows={2}
          className="input-field resize-none"
          placeholder="其他注意事项..."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCloseEdit}>
          取消
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isEdit ? '保存修改' : '添加药品'}
        </Button>
      </div>
    </form>
  );
}

export default function Medicines() {
  const { medicines, familyMembers, deleteMedicine } = useAppStore();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<MedicineCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'normal' | 'expiring' | 'expired'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Medicine | null>(null);

  const filtered = useMemo(() => {
    return medicines.filter((m) => {
      if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCat !== 'all' && m.category !== filterCat) return false;
      if (filterStatus !== 'all') {
        const s = getMedicineStatus(m);
        if (s !== filterStatus) return false;
      }
      return true;
    });
  }, [medicines, search, filterCat, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: medicines.length,
      normal: medicines.filter((m) => !isExpired(m) && !isExpiringSoon(m)).length,
      expiring: medicines.filter(isExpiringSoon).length,
      expired: medicines.filter(isExpired).length,
      lowStock: medicines.filter((m) => m.stockQuantity <= 3 && !isExpired(m)).length,
    };
  }, [medicines]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="section-title">药品档案</h2>
          <p className="section-desc !mb-0">
            管理家庭常备药品，系统会自动提醒临期和过期药品
          </p>
        </div>
        <Link to="/medicines/new" className="hidden">
          <Button leftIcon={<Plus size={18} />} onClick={() => setShowAdd(true)}>
            新建药品
          </Button>
        </Link>
        <Button leftIcon={<Plus size={18} />} onClick={() => setShowAdd(true)}>
          添加药品
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: '药品总数', value: stats.total, color: 'text-brand-600', bg: 'bg-brand-50' },
          { label: '状态正常', value: stats.normal, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: '临期提醒', value: stats.expiring, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: '已过期', value: stats.expired, color: 'text-red-600', bg: 'bg-red-50' },
          { label: '库存不足', value: stats.lowStock, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((s) => (
          <div key={s.label} className={`card !p-4 !rounded-2xl`}>
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card !p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input-field !pl-11"
            placeholder="搜索药品名称..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            className="input-field !w-auto"
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value as any)}
          >
            <option value="all">全部分类</option>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <select
            className="input-field !w-auto"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">全部状态</option>
            <option value="normal">正常</option>
            <option value="expiring">临期</option>
            <option value="expired">过期</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package size={32} />}
          title={medicines.length === 0 ? '还没有药品档案' : '没有匹配的药品'}
          description={medicines.length === 0 ? '点击「添加药品」，录入第一盒家庭常备药吧' : '试试调整筛选条件或搜索关键词'}
          action={
            medicines.length === 0 && (
              <Button leftIcon={<Plus size={18} />} onClick={() => setShowAdd(true)}>
                添加第一个药品
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((m, idx) => {
            const cat = CATEGORY_LABELS[m.category];
            const status = getMedicineStatus(m);
            const statusCfg = getStatusColor(status);
            const appMember = familyMembers.find((fm) => fm.id === m.applicableTo);
            const daysLeft = daysUntil(m.expiryDate);
            return (
              <div
                key={m.id}
                className="card card-hover group animate-fade-in-up"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <div className="flex gap-4">
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        m.photoUrl ? 'overflow-hidden p-0' : cat.color
                      }`}
                    >
                      {m.photoUrl ? (
                        <img src={m.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">💊</span>
                      )}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ring-2 ring-white ${statusCfg.dot} ${
                        status === 'expiring' ? 'animate-pulse-soft' : ''
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 truncate">{m.name}</h3>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => setEditing(m)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600"
                          title="编辑"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`确定删除「${m.name}」吗？`)) deleteMedicine(m.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
                          title="删除"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <Badge variant="brand">{cat.label}</Badge>
                      {m.applicableTo === 'all' ? (
                        <Badge variant="info">全家通用</Badge>
                      ) : (
                        <Badge variant="default">{appMember?.name || '个人'}</Badge>
                      )}
                      {m.isPrescription && <Badge variant="danger">处方药</Badge>}
                    </div>

                    <div className="text-xs text-slate-500 space-y-0.5">
                      <p className="flex items-center gap-1">
                        <Package size={12} className={statusCfg.text} />
                        <span>库存：</span>
                        <span className="font-semibold text-slate-700">{m.stockQuantity} 份</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <span className={statusCfg.text}>有效期至：{formatDate(m.expiryDate)}</span>
                        {!isExpired(m) && (
                          <span className="text-slate-400">（{daysLeft > 0 ? `还剩 ${daysLeft} 天` : '今天到期'}）</span>
                        )}
                      </p>
                    </div>

                    <StatusTag medicine={m} />
                  </div>
                </div>

                {status === 'expired' && (
                  <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 flex items-start gap-2">
                    <span className="text-base">⚠️</span>
                    <span>此药品已过期，请及时清理并更换新药，出行时不要携带！</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={showAdd || !!editing}
        onClose={() => {
          setShowAdd(false);
          setEditing(null);
        }}
        title={editing ? '编辑药品' : '添加新药品'}
      >
        <MedicineForm
          editMedicine={editing}
          onCloseEdit={() => {
            setShowAdd(false);
            setEditing(null);
          }}
        />
      </Modal>
    </div>
  );
}
