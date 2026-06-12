import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import VaccineCard from '@/components/vaccine/VaccineCard';
import VaccineFormModal from '@/components/vaccine/VaccineFormModal';
import AppointModal from '@/components/vaccine/AppointModal';
import CompleteModal from '@/components/vaccine/CompleteModal';
import DelayModal from '@/components/vaccine/DelayModal';
import type { Vaccine, VaccineStatus } from '@/types';
import { Plus, Filter, Syringe } from 'lucide-react';

const STATUS_FILTERS: { value: VaccineStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'overdue', label: '已逾期' },
  { value: 'pending', label: '待预约' },
  { value: 'appointed', label: '已预约' },
  { value: 'completed', label: '已完成' },
];

export default function VaccineList() {
  const initialize = useAppStore((s) => s.initialize);
  const children = useAppStore((s) => s.children);
  const vaccines = useAppStore((s) => s.vaccines);
  const addVaccine = useAppStore((s) => s.addVaccine);
  const updateVaccine = useAppStore((s) => s.updateVaccine);
  const deleteVaccine = useAppStore((s) => s.deleteVaccine);
  const appointVaccine = useAppStore((s) => s.appointVaccine);
  const completeVaccine = useAppStore((s) => s.completeVaccine);
  const delayVaccine = useAppStore((s) => s.delayVaccine);
  const getChildById = useAppStore((s) => s.getChildById);
  const updateVaccineStatus = useAppStore((s) => s.updateVaccineStatus);

  const [childFilter, setChildFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<VaccineStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [showAppointModal, setShowAppointModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState<Vaccine | null>(null);
  const [targetVaccine, setTargetVaccine] = useState<Vaccine | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    updateVaccineStatus();
  }, [updateVaccineStatus, initialize]);

  const filtered = useMemo(() => {
    return vaccines
      .filter((v) => childFilter === 'all' || v.childId === childFilter)
      .filter((v) => statusFilter === 'all' || v.status === statusFilter)
      .filter((v) =>
        search
          ? v.name.toLowerCase().includes(search.toLowerCase()) ||
            getChildById(v.childId)?.name.toLowerCase().includes(search.toLowerCase())
          : true,
      )
      .sort((a, b) => {
        if (a.status === 'overdue' && b.status !== 'overdue') return -1;
        if (b.status === 'overdue' && a.status !== 'overdue') return 1;
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (b.status === 'completed' && a.status !== 'completed') return -1;
        return (
          new Date(a.suggestedDate).getTime() - new Date(b.suggestedDate).getTime()
        );
      });
  }, [vaccines, childFilter, statusFilter, search, getChildById]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: vaccines.length };
    STATUS_FILTERS.forEach((f) => {
      if (f.value !== 'all') {
        counts[f.value] = vaccines.filter((v) => v.status === f.value).length;
      }
    });
    return counts;
  }, [vaccines]);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl text-slate-800 mb-1">疫苗计划</h1>
          <p className="text-sm text-slate-500">
            共 {vaccines.length} 条记录 · 显示 {filtered.length} 条
          </p>
        </div>
        <button
          onClick={() => {
            if (children.length === 0) {
              alert('请先创建孩子档案');
              return;
            }
            setEditingVaccine(null);
            setShowVaccineModal(true);
          }}
          className="btn-primary"
          disabled={children.length === 0}
        >
          <Plus className="w-4 h-4" />
          添加疫苗
        </button>
      </div>

      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-slate-500">
            <Filter className="w-4 h-4" />
            <span className="text-sm">筛选：</span>
          </div>
          <select
            value={childFilter}
            onChange={(e) => setChildFilter(e.target.value)}
            className="input !w-auto !py-2 !px-3 text-sm"
          >
            <option value="all">全部孩子</option>
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Syringe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索疫苗名或孩子姓名..."
              className="input !pl-10 !py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => {
            const active = statusFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  active
                    ? f.value === 'overdue'
                      ? 'bg-danger-500 text-white shadow-soft'
                      : f.value === 'completed'
                      ? 'bg-primary-500 text-white shadow-soft'
                      : f.value === 'appointed'
                      ? 'bg-accent-500 text-white shadow-soft'
                      : f.value === 'pending'
                      ? 'bg-info-500 text-white shadow-soft'
                      : 'bg-slate-800 text-white shadow-soft'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
                <span
                  className={`ml-1.5 text-xs ${active ? 'text-white/80' : 'text-slate-400'}`}
                >
                  {statusCounts[f.value] || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
            <Syringe className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="font-medium text-slate-700 mb-1">暂无匹配的疫苗记录</h3>
          <p className="text-sm text-slate-500 mb-4">
            {children.length === 0
              ? '请先创建孩子档案，然后添加疫苗计划'
              : '试试调整筛选条件或添加新的疫苗'}
          </p>
          {children.length > 0 && (
            <button
              onClick={() => {
                setEditingVaccine(null);
                setShowVaccineModal(true);
              }}
              className="btn-primary btn-sm"
            >
              <Plus className="w-4 h-4" />
              添加疫苗
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((v, idx) => (
            <div key={v.id} style={{ animationDelay: `${idx * 40}ms` }}>
              <VaccineCard
                vaccine={v}
                child={getChildById(v.childId)}
                onEdit={() => {
                  setEditingVaccine(v);
                  setShowVaccineModal(true);
                }}
                onDelete={() => deleteVaccine(v.id)}
                onAppoint={() => {
                  setTargetVaccine(v);
                  setShowAppointModal(true);
                }}
                onComplete={() => {
                  setTargetVaccine(v);
                  setShowCompleteModal(true);
                }}
                onDelay={() => {
                  setTargetVaccine(v);
                  setShowDelayModal(true);
                }}
              />
            </div>
          ))}
        </div>
      )}

      <VaccineFormModal
        open={showVaccineModal}
        onClose={() => {
          setShowVaccineModal(false);
          setEditingVaccine(null);
        }}
        onSubmit={(data) => {
          if (editingVaccine) {
            updateVaccine(editingVaccine.id, data);
          } else {
            addVaccine(data);
          }
        }}
        children={children.map((c) => ({ id: c.id, name: c.name }))}
        initialData={editingVaccine}
        defaultChildId={childFilter !== 'all' ? childFilter : undefined}
      />

      <AppointModal
        open={showAppointModal}
        onClose={() => {
          setShowAppointModal(false);
          setTargetVaccine(null);
        }}
        onSubmit={(data) => {
          if (targetVaccine) appointVaccine(targetVaccine.id, data);
        }}
        vaccine={targetVaccine}
        defaultLocation={
          targetVaccine ? getChildById(targetVaccine.childId)?.vaccinationSite : ''
        }
      />

      <CompleteModal
        open={showCompleteModal}
        onClose={() => {
          setShowCompleteModal(false);
          setTargetVaccine(null);
        }}
        onSubmit={(data) => {
          if (targetVaccine) completeVaccine(targetVaccine.id, data);
        }}
        vaccine={targetVaccine}
      />

      <DelayModal
        open={showDelayModal}
        onClose={() => {
          setShowDelayModal(false);
          setTargetVaccine(null);
        }}
        onSubmit={(reason) => {
          if (targetVaccine) delayVaccine(targetVaccine.id, reason);
        }}
        vaccine={targetVaccine}
      />
    </div>
  );
}
