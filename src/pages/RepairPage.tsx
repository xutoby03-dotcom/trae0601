import { useMemo, useState } from 'react';
import { Wrench, Check, Plus, X, Umbrella } from 'lucide-react';
import { useStore } from '@/store';
import { RepairIssueBadge, CanopyStatusBadge } from '@/components/StatusBadge';
import { formatDateTime } from '@/utils/date';
import { ACCESSORY_META, REPAIR_ISSUE_META } from '@/types';
import type { RepairIssueType, AccessoryType } from '@/types';

interface NewRepairForm {
  canopyId: string;
  issueType: RepairIssueType;
  accessoryType?: AccessoryType;
  description: string;
}

export default function RepairPage() {
  const { repairRecords, canopies, fixRepairRecord, createRepairRecord } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<NewRepairForm>({
    canopyId: canopies[0]?.id || '',
    issueType: 'missing',
    description: '',
  });
  const [filter, setFilter] = useState<'all' | 'pending' | 'fixed'>('pending');

  const filteredRecords = useMemo(() => {
    let list = [...repairRecords];
    if (filter !== 'all') list = list.filter((r) => r.status === filter);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [repairRecords, filter]);

  const pendingCount = repairRecords.filter((r) => r.status === 'pending').length;
  const fixedCount = repairRecords.filter((r) => r.status === 'fixed').length;

  const getCanopy = (id: string) => canopies.find((c) => c.id === id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.canopyId || !form.description) return;
    createRepairRecord({ ...form });
    setForm({ canopyId: canopies[0]?.id || '', issueType: 'missing', description: '' });
    setShowAdd(false);
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">维修管理</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            待处理 {pendingCount} 项，已修复 {fixedCount} 项
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus size={16} />
          登记维修
        </button>
      </div>

      {showAdd && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">新增维修记录</h3>
            <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">雨棚</label>
                <select
                  className="input"
                  value={form.canopyId}
                  onChange={(e) => setForm({ ...form, canopyId: e.target.value })}
                >
                  {canopies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">问题类型</label>
                <select
                  className="input"
                  value={form.issueType}
                  onChange={(e) => setForm({ ...form, issueType: e.target.value as RepairIssueType })}
                >
                  {Object.entries(REPAIR_ISSUE_META).map(([key, meta]) => (
                    <option key={key} value={key}>{meta.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">涉及配件</label>
                <select
                  className="input"
                  value={form.accessoryType || ''}
                  onChange={(e) => setForm({ ...form, accessoryType: (e.target.value as AccessoryType) || undefined })}
                >
                  <option value="">不指定</option>
                  {Object.entries(ACCESSORY_META).map(([key, meta]) => (
                    <option key={key} value={key}>{meta.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label">问题描述</label>
              <input
                type="text"
                className="input"
                placeholder="详细描述问题情况"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">取消</button>
              <button type="submit" className="btn-primary" disabled={!form.description}>确认登记</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-2">
        {(['pending', 'fixed', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-primary-700 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f === 'pending' ? `待处理 (${pendingCount})` : f === 'fixed' ? `已修复 (${fixedCount})` : '全部'}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center">
            <Wrench size={48} className="mx-auto text-gray-300 mb-3" />
            <div className="text-gray-500">暂无维修记录</div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">雨棚</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">问题类型</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">配件</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">描述</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">登记时间</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRecords.map((r) => {
                const canopy = getCanopy(r.canopyId);
                return (
                  <tr key={r.id} className="hover:bg-gray-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                          <Umbrella size={16} />
                        </div>
                        <div className="font-medium text-gray-900">{canopy?.name}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {canopy && <CanopyStatusBadge status={canopy.status} />}
                    </td>
                    <td className="px-5 py-4">
                      <RepairIssueBadge type={r.issueType} />
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {r.accessoryType ? ACCESSORY_META[r.accessoryType].name : '-'}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">{r.description}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {formatDateTime(r.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {r.status === 'pending' ? (
                        <button
                          onClick={() => fixRepairRecord(r.id)}
                          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                        >
                          <Check size={14} />
                          标记修复
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">已完成</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
