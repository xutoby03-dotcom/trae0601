import { useState, useMemo } from 'react';
import { Plus, Search, Eye, Pencil, Trash2, ChevronDown, ChevronUp, Camera, X, Image, AlertCircle, Droplets } from 'lucide-react';
import { useStore } from '../store/useStore';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { COAT_SIZES, LABORATORIES, COAT_STATUS_LABELS, DAMAGE_LEVEL_LABELS } from '../types';
import type { CoatSize, CoatStatus, LabCoat, Lending, DamageRecord, CleaningBatch, DamageStatus, DamageLevel } from '../types';
import { formatDate, getTodayStr } from '../utils/helpers';
import { cn } from '../lib/utils';

function resolveCleaningBatches(
  coat: LabCoat,
  allBatches: CleaningBatch[],
  coatIdBatches: CleaningBatch[]
): CleaningBatch[] {
  const result: CleaningBatch[] = [];
  const seen = new Set<string>();

  if (coat.lastCleaningBatchId) {
    const batchById = allBatches.find((b) => b.id === coat.lastCleaningBatchId);
    if (batchById) {
      result.push(batchById);
      seen.add(batchById.id);
    }
  }

  for (const batch of coatIdBatches) {
    if (!seen.has(batch.id)) {
      result.push(batch);
      seen.add(batch.id);
    }
  }

  return result;
}

function resolveLastBatch(
  coat: LabCoat,
  allBatches: CleaningBatch[],
  coatIdBatches: CleaningBatch[]
): CleaningBatch | undefined {
  if (coat.lastCleaningBatchId) {
    const batchById = allBatches.find((b) => b.id === coat.lastCleaningBatchId);
    if (batchById) return batchById;
  }
  return coatIdBatches[0];
}

export function CoatList() {
  const {
    coats,
    cleaningBatches,
    addCoat,
    updateCoat,
    deleteCoat,
    getLendingsForCoat,
    getDamageRecordsForCoat,
    getCleaningBatchesForCoat,
  } = useStore();

  const [searchCode, setSearchCode] = useState('');
  const [filterSize, setFilterSize] = useState<CoatSize | ''>('');
  const [filterLab, setFilterLab] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<CoatStatus | ''>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoat, setEditingCoat] = useState<LabCoat | null>(null);
  const [detailCoat, setDetailCoat] = useState<LabCoat | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    size: 'M' as CoatSize,
    lab: LABORATORIES[0],
    status: 'available' as CoatStatus,
    photoUrl: '',
    notes: '',
    lastCleaningBatchId: '',
    damageStatus: {
      hasStain: false,
      hasHole: false,
      missingButton: false,
      pocketResidue: false,
      contactHazard: false,
      stainLevel: 'none' as DamageLevel,
      holeLevel: 'none' as DamageLevel,
      buttonLevel: 'none' as DamageLevel,
      lastCheckAt: '',
    },
  });

  const filteredCoats = useMemo(() => {
    return coats.filter((c) => {
      if (searchCode && !c.code.toLowerCase().includes(searchCode.toLowerCase())) return false;
      if (filterSize && c.size !== filterSize) return false;
      if (filterLab && c.lab !== filterLab) return false;
      if (filterStatus && c.status !== filterStatus) return false;
      return true;
    });
  }, [coats, searchCode, filterSize, filterLab, filterStatus]);

  const openAddModal = () => {
    setEditingCoat(null);
    setFormData({
      code: '',
      size: 'M',
      lab: LABORATORIES[0],
      status: 'available',
      photoUrl: '',
      notes: '',
      lastCleaningBatchId: '',
      damageStatus: {
        hasStain: false,
        hasHole: false,
        missingButton: false,
        pocketResidue: false,
        contactHazard: false,
        stainLevel: 'none',
        holeLevel: 'none',
        buttonLevel: 'none',
        lastCheckAt: '',
      },
    });
    setIsModalOpen(true);
  };

  const openEditModal = (coat: LabCoat) => {
    setEditingCoat(coat);
    setFormData({
      code: coat.code,
      size: coat.size,
      lab: coat.lab,
      status: coat.status,
      photoUrl: coat.photoUrl || '',
      notes: coat.notes || '',
      lastCleaningBatchId: coat.lastCleaningBatchId || '',
      damageStatus: coat.damageStatus || {
        hasStain: false,
        hasHole: false,
        missingButton: false,
        pocketResidue: false,
        contactHazard: false,
        stainLevel: 'none',
        holeLevel: 'none',
        buttonLevel: 'none',
        lastCheckAt: '',
      },
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.code.trim()) return;

    const hasDamage = formData.damageStatus.hasStain || formData.damageStatus.hasHole ||
      formData.damageStatus.missingButton || formData.damageStatus.pocketResidue ||
      formData.damageStatus.contactHazard;

    const submitData: Partial<LabCoat> = {
      code: formData.code,
      size: formData.size,
      lab: formData.lab,
      status: formData.status,
      photoUrl: formData.photoUrl.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      lastCleaningBatchId: formData.lastCleaningBatchId.trim() || undefined,
    };

    if (hasDamage || formData.damageStatus.lastCheckAt) {
      submitData.damageStatus = {
        ...formData.damageStatus,
        lastCheckAt: formData.damageStatus.lastCheckAt || getTodayStr(),
      };
    } else {
      submitData.damageStatus = undefined;
    }

    if (editingCoat) {
      updateCoat(editingCoat.id, submitData);
    } else {
      addCoat(submitData as Omit<LabCoat, 'id' | 'createdAt'>);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这件实验服档案吗？')) {
      deleteCoat(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索实验服编号..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterSize}
            onChange={(e) => setFilterSize(e.target.value as CoatSize | '')}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部尺码</option>
            {COAT_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={filterLab}
            onChange={(e) => setFilterLab(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部实验室</option>
            {LABORATORIES.map((lab) => (
              <option key={lab} value={lab}>{lab}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as CoatStatus | '')}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部状态</option>
            {Object.entries(COAT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" />
            新建档案
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">照片</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">编号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">尺码</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">所属实验室</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">破损状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最近清洗</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCoats.map((coat) => (
                <CoatRow
                  key={coat.id}
                  coat={coat}
                  onView={() => setDetailCoat(coat)}
                  onEdit={() => openEditModal(coat)}
                  onDelete={() => handleDelete(coat.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
        {filteredCoats.length === 0 && (
          <div className="py-16 text-center text-gray-400 text-sm">
            暂无符合条件的实验服档案
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCoat ? '编辑实验服档案' : '新建实验服档案'}
        footer={
          <>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.code.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {editingCoat ? '保存' : '创建'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">照片链接</label>
            <input
              type="text"
              value={formData.photoUrl}
              onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
              placeholder="输入照片 URL 地址..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {formData.photoUrl && (
              <div className="mt-2">
                <img
                  src={formData.photoUrl}
                  alt="预览"
                  className="w-full max-h-32 object-cover rounded-lg border border-gray-100"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                    const next = (e.currentTarget as HTMLImageElement).nextElementSibling as HTMLElement;
                    if (next) next.style.display = 'block';
                  }}
                />
                <p className="hidden text-xs text-red-500 mt-1">图片加载失败，请检查链接</p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">编号 *</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="例如: LC-001"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">尺码</label>
              <select
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value as CoatSize })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {COAT_SIZES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">状态</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as CoatStatus })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(COAT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">所属实验室</label>
            <select
              value={formData.lab}
              onChange={(e) => setFormData({ ...formData, lab: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LABORATORIES.map((lab) => (
                <option key={lab} value={lab}>{lab}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              最近清洗批次ID
              <span className="text-gray-400 font-normal ml-1">（系统自动维护，可手动调整）</span>
            </label>
            <input
              type="text"
              value={formData.lastCleaningBatchId}
              onChange={(e) => setFormData({ ...formData, lastCleaningBatchId: e.target.value })}
              placeholder="系统自动记录最近清洗批次"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">破损状态</label>
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="damage-stain"
                    checked={formData.damageStatus.hasStain}
                    onChange={(e) => setFormData({
                      ...formData,
                      damageStatus: {
                        ...formData.damageStatus,
                        hasStain: e.target.checked,
                        stainLevel: e.target.checked ? 'minor' : 'none',
                      },
                    })}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="damage-stain" className="text-sm text-gray-700">污渍</label>
                </div>
                {formData.damageStatus.hasStain && (
                  <select
                    value={formData.damageStatus.stainLevel}
                    onChange={(e) => setFormData({
                      ...formData,
                      damageStatus: {
                        ...formData.damageStatus,
                        stainLevel: e.target.value as DamageLevel,
                      },
                    })}
                    className="px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="minor">轻微</option>
                    <option value="moderate">中度</option>
                    <option value="severe">严重</option>
                  </select>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="damage-hole"
                    checked={formData.damageStatus.hasHole}
                    onChange={(e) => setFormData({
                      ...formData,
                      damageStatus: {
                        ...formData.damageStatus,
                        hasHole: e.target.checked,
                        holeLevel: e.target.checked ? 'minor' : 'none',
                      },
                    })}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="damage-hole" className="text-sm text-gray-700">破洞</label>
                </div>
                {formData.damageStatus.hasHole && (
                  <select
                    value={formData.damageStatus.holeLevel}
                    onChange={(e) => setFormData({
                      ...formData,
                      damageStatus: {
                        ...formData.damageStatus,
                        holeLevel: e.target.value as DamageLevel,
                      },
                    })}
                    className="px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="minor">轻微</option>
                    <option value="moderate">中度</option>
                    <option value="severe">严重</option>
                  </select>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="damage-button"
                    checked={formData.damageStatus.missingButton}
                    onChange={(e) => setFormData({
                      ...formData,
                      damageStatus: {
                        ...formData.damageStatus,
                        missingButton: e.target.checked,
                        buttonLevel: e.target.checked ? 'minor' : 'none',
                      },
                    })}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="damage-button" className="text-sm text-gray-700">扣子缺失</label>
                </div>
                {formData.damageStatus.missingButton && (
                  <select
                    value={formData.damageStatus.buttonLevel}
                    onChange={(e) => setFormData({
                      ...formData,
                      damageStatus: {
                        ...formData.damageStatus,
                        buttonLevel: e.target.value as DamageLevel,
                      },
                    })}
                    className="px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="minor">轻微</option>
                    <option value="moderate">中度</option>
                    <option value="severe">严重</option>
                  </select>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="damage-pocket"
                  checked={formData.damageStatus.pocketResidue}
                  onChange={(e) => setFormData({
                    ...formData,
                    damageStatus: {
                      ...formData.damageStatus,
                      pocketResidue: e.target.checked,
                    },
                  })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="damage-pocket" className="text-sm text-gray-700">口袋残留</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="damage-hazard"
                  checked={formData.damageStatus.contactHazard}
                  onChange={(e) => setFormData({
                    ...formData,
                    damageStatus: {
                      ...formData.damageStatus,
                      contactHazard: e.target.checked,
                    },
                  })}
                  className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                />
                <label htmlFor="damage-hazard" className="text-sm text-red-700">接触危险试剂</label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">备注</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="添加备注信息..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </Modal>

      {detailCoat && (
        <CoatDetailModal
          coat={detailCoat}
          onClose={() => setDetailCoat(null)}
          lendings={getLendingsForCoat(detailCoat.id)}
          damageRecords={getDamageRecordsForCoat(detailCoat.id)}
          cleaningBatches={resolveCleaningBatches(detailCoat, cleaningBatches, getCleaningBatchesForCoat(detailCoat.id))}
        />
      )}
    </div>
  );
}

function DamageStatusBadge({ damageStatus }: { damageStatus?: DamageStatus }) {
  if (!damageStatus) {
    return (
      <span className="text-xs text-gray-400 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        未检查
      </span>
    );
  }

  const issues: string[] = [];
  if (damageStatus.hasStain) issues.push(`污渍${DAMAGE_LEVEL_LABELS[damageStatus.stainLevel]}`);
  if (damageStatus.hasHole) issues.push(`破洞${DAMAGE_LEVEL_LABELS[damageStatus.holeLevel]}`);
  if (damageStatus.missingButton) issues.push(`掉扣${DAMAGE_LEVEL_LABELS[damageStatus.buttonLevel]}`);
  if (damageStatus.pocketResidue) issues.push('口袋残留');
  if (damageStatus.contactHazard) issues.push('接触危化品');

  if (issues.length === 0) {
    return (
      <span className="text-xs text-emerald-600 flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        完好
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {issues.slice(0, 2).map((issue, idx) => (
        <span key={idx} className="text-xs px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded">
          {issue}
        </span>
      ))}
      {issues.length > 2 && (
        <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
          +{issues.length - 2}
        </span>
      )}
    </div>
  );
}

function CoatRow({
  coat,
  onView,
  onEdit,
  onDelete,
}: {
  coat: LabCoat;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { cleaningBatches: allBatches, getCleaningBatchesForCoat } = useStore();
  const coatIdBatches = getCleaningBatchesForCoat(coat.id);
  const lastBatch = resolveLastBatch(coat, allBatches, coatIdBatches);

  return (
    <>
      <tr className="hover:bg-gray-50/50">
        <td className="px-6 py-4 whitespace-nowrap">
          {coat.photoUrl ? (
            <img
              src={coat.photoUrl}
              alt={coat.code}
              className="w-10 h-10 rounded-lg object-cover border border-gray-100"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-100">
              <Image className="w-5 h-5 text-gray-300" />
            </div>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-blue-600"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {coat.code}
          </button>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{coat.size}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{coat.lab}</td>
        <td className="px-6 py-4 whitespace-nowrap">
          <StatusBadge type="coat" status={coat.status} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <DamageStatusBadge damageStatus={coat.damageStatus} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {lastBatch ? (
            <div className="text-xs">
              <p className="text-gray-700 font-medium">{lastBatch.batchNo}</p>
              <p className="text-gray-400 flex items-center gap-1 mt-0.5">
                <Droplets className="w-3 h-3" />
                {formatDate(lastBatch.createdAt)}
              </p>
            </div>
          ) : (
            <span className="text-xs text-gray-400">暂无记录</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onView}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="查看详情"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={onEdit}
              className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              title="编辑"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50/30">
          <td colSpan={8} className="px-6 py-4">
            <div className="text-sm text-gray-600 space-y-1">
              {coat.notes ? (
                <p><span className="text-gray-400">备注：</span>{coat.notes}</p>
              ) : (
                <p className="text-gray-400">暂无备注信息</p>
              )}
              {coat.damageStatus && (
                <p className="text-xs text-gray-400 mt-1">
                  最近检查日期：{formatDate(coat.damageStatus.lastCheckAt)}
                </p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function CoatDetailModal({
  coat,
  onClose,
  lendings,
  damageRecords,
  cleaningBatches,
}: {
  coat: LabCoat;
  onClose: () => void;
  lendings: Lending[];
  damageRecords: DamageRecord[];
  cleaningBatches: CleaningBatch[];
}) {
  const [tab, setTab] = useState<'info' | 'lendings' | 'damage' | 'cleaning'>('info');

  const tabs = [
    { key: 'info', label: '基本信息' },
    { key: 'lendings', label: `领用记录 (${lendings.length})` },
    { key: 'damage', label: `破损记录 (${damageRecords.length})` },
    { key: 'cleaning', label: `清洗记录 (${cleaningBatches.length})` },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-h-[90vh] overflow-hidden flex flex-col max-w-3xl mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {coat.photoUrl ? (
              <img
                src={coat.photoUrl}
                alt={coat.code}
                className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                  const next = (e.currentTarget as HTMLImageElement).nextElementSibling as HTMLElement;
                  if (next) next.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 items-center justify-center" style={{ display: coat.photoUrl ? 'none' : 'flex' }}>
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{coat.code}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge type="coat" status={coat.status} />
                <span className="text-xs text-gray-400">{coat.size} · {coat.lab}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 border-b border-gray-100">
          <div className="flex gap-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  tab === t.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 overflow-y-auto flex-1">
          {tab === 'info' && (
            <div className="space-y-5">
              {coat.photoUrl && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">照片</p>
                  <img
                    src={coat.photoUrl}
                    alt={coat.code}
                    className="w-full max-h-48 object-cover rounded-xl border border-gray-100"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">实验服编号</p>
                  <p className="text-sm font-medium text-gray-900">{coat.code}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">尺码</p>
                  <p className="text-sm font-medium text-gray-900">{coat.size}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">所属实验室</p>
                  <p className="text-sm font-medium text-gray-900">{coat.lab}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">入库日期</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(coat.createdAt)}</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 mb-3">当前破损状态</p>
                {coat.damageStatus ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {coat.damageStatus.hasStain && (
                        <span className="text-xs px-2.5 py-1 bg-red-50 text-red-700 rounded-lg font-medium">
                          污渍: {DAMAGE_LEVEL_LABELS[coat.damageStatus.stainLevel]}
                        </span>
                      )}
                      {coat.damageStatus.hasHole && (
                        <span className="text-xs px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg font-medium">
                          破洞: {DAMAGE_LEVEL_LABELS[coat.damageStatus.holeLevel]}
                        </span>
                      )}
                      {coat.damageStatus.missingButton && (
                        <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg font-medium">
                          扣子缺失: {DAMAGE_LEVEL_LABELS[coat.damageStatus.buttonLevel]}
                        </span>
                      )}
                      {coat.damageStatus.pocketResidue && (
                        <span className="text-xs px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg font-medium">
                          口袋残留
                        </span>
                      )}
                      {coat.damageStatus.contactHazard && (
                        <span className="text-xs px-2.5 py-1 bg-red-100 text-red-800 rounded-lg font-bold">
                          接触危险试剂
                        </span>
                      )}
                      {!coat.damageStatus.hasStain && !coat.damageStatus.hasHole &&
                        !coat.damageStatus.missingButton && !coat.damageStatus.pocketResidue &&
                        !coat.damageStatus.contactHazard && (
                        <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-medium flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          完好无损
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      最近检查日期：{formatDate(coat.damageStatus.lastCheckAt)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    暂无破损检查记录
                  </p>
                )}
              </div>

              {coat.lastCleaningBatchId || cleaningBatches.length > 0 ? (
                <div>
                  <p className="text-xs text-gray-400 mb-2">最近清洗批次</p>
                  {cleaningBatches[0] ? (
                    <div className="p-3 border border-gray-100 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{cleaningBatches[0].batchNo}</span>
                        <StatusBadge type="batch" status={cleaningBatches[0].status} />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(cleaningBatches[0].createdAt)}
                        {cleaningBatches[0].notes && ` · ${cleaningBatches[0].notes}`}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 border border-dashed border-gray-200 rounded-lg">
                      <p className="text-xs text-gray-400">
                        批次ID {coat.lastCleaningBatchId} 未找到对应记录
                      </p>
                    </div>
                  )}
                </div>
              ) : null}

              <div>
                <p className="text-xs text-gray-400 mb-1">备注</p>
                <p className="text-sm text-gray-700">{coat.notes || '暂无备注'}</p>
              </div>
            </div>
          )}

          {tab === 'lendings' && (
            <div className="space-y-3">
              {lendings.length > 0 ? (
                lendings.map((l) => (
                  <div key={l.id} className="p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{l.studentName} ({l.studentId})</span>
                      <StatusBadge type="lending" status={l.status} />
                    </div>
                    <p className="text-xs text-gray-500">{l.course} · {l.teacher}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      实验日期: {formatDate(l.experimentDate)} · 预计归还: {formatDate(l.expectedReturn)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">暂无领用记录</p>
              )}
            </div>
          )}

          {tab === 'damage' && (
            <div className="space-y-3">
              {damageRecords.length > 0 ? (
                damageRecords.map((d) => (
                  <div key={d.id} className="p-3 border border-gray-100 rounded-lg">
                    <p className="text-xs text-gray-400 mb-2">{formatDate(d.createdAt)}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {d.hasStain && (
                        <span className="text-xs px-2 py-0.5 bg-red-50 text-red-700 rounded">
                          污渍: {DAMAGE_LEVEL_LABELS[d.stainLevel]}
                        </span>
                      )}
                      {d.hasHole && (
                        <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-700 rounded">
                          破洞: {DAMAGE_LEVEL_LABELS[d.holeLevel]}
                        </span>
                      )}
                      {d.missingButton && (
                        <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded">
                          扣子缺失: {DAMAGE_LEVEL_LABELS[d.buttonLevel]}
                        </span>
                      )}
                      {d.pocketResidue && (
                        <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded">口袋残留</span>
                      )}
                      {d.contactHazard && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded font-medium">接触危险试剂</span>
                      )}
                    </div>
                    {d.notes && <p className="text-xs text-gray-500">{d.notes}</p>}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">暂无破损记录</p>
              )}
            </div>
          )}

          {tab === 'cleaning' && (
            <div className="space-y-3">
              {cleaningBatches.length > 0 ? (
                cleaningBatches.map((b) => (
                  <div key={b.id} className="p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{b.batchNo}</span>
                      <StatusBadge type="batch" status={b.status} />
                    </div>
                    <p className="text-xs text-gray-400">
                      创建时间: {formatDate(b.createdAt)}
                      {b.completedAt && ` · 完成时间: ${formatDate(b.completedAt)}`}
                    </p>
                    {b.notes && <p className="text-xs text-gray-500 mt-1">{b.notes}</p>}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">暂无清洗记录</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
