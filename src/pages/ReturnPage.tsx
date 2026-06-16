import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, Droplets, Droplet, AlertTriangle, Plus, X } from 'lucide-react';
import { useStore } from '@/store';
import { formatDateTime } from '@/utils/date';
import AccessoryChecklist from '@/components/AccessoryChecklist';
import { OverdueBadge, WetBadge } from '@/components/StatusBadge';
import type { BorrowItem, RepairIssueType, AccessoryType } from '@/types';
import { ACCESSORY_META, REPAIR_ISSUE_META } from '@/types';
import { isOverdue, getOverdueHours } from '@/utils/date';

interface PendingRepair {
  issueType: RepairIssueType;
  accessoryType?: AccessoryType;
  description: string;
}

export default function ReturnPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { borrowRecords, canopies, returnBorrowRecord, createRepairRecord } = useStore();

  const record = borrowRecords.find((r) => r.id === id);
  const canopy = record ? canopies.find((c) => c.id === record.canopyId) : null;

  const [returnedItems, setReturnedItems] = useState<BorrowItem>(
    record?.borrowedItems || { tarp: 0, pole: 0, bar: 0, stake: 0, bag: 0 }
  );
  const [isWet, setIsWet] = useState(false);
  const [repairs, setRepairs] = useState<PendingRepair[]>([]);
  const [showRepairForm, setShowRepairForm] = useState(false);
  const [newRepair, setNewRepair] = useState<PendingRepair>({
    issueType: 'missing',
    description: '',
  });

  if (!record || !canopy) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">借用记录不存在</p>
        <Link to="/" className="btn-primary mt-4 inline-flex">返回首页</Link>
      </div>
    );
  }

  const overdue = isOverdue(record.dueTime);
  const overdueHrs = getOverdueHours(record.dueTime);

  const handleAddRepair = () => {
    if (!newRepair.description) return;
    setRepairs([...repairs, { ...newRepair }]);
    setNewRepair({ issueType: 'missing', description: '' });
    setShowRepairForm(false);
  };

  const handleRemoveRepair = (idx: number) => {
    setRepairs(repairs.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    returnBorrowRecord(record.id, {
      returnedItems,
      isWet,
    });

    repairs.forEach((r) => {
      createRepairRecord({
        canopyId: record.canopyId,
        borrowRecordId: record.id,
        issueType: r.issueType,
        accessoryType: r.accessoryType,
        description: r.description,
      });
    });

    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800">
        <ArrowLeft size={16} />
        返回今日借用
      </Link>

      <div className="card p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{canopy.name}</h3>
            <p className="text-sm text-gray-500 mt-1">借用单 #{record.id.slice(-6)}</p>
          </div>
          <div className="flex gap-2">
            <OverdueBadge overdue={overdue} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm py-3 border-t border-b border-gray-100">
          <div>
            <span className="text-gray-500">活动名称：</span>
            <span className="text-gray-900 font-medium">{record.activityName}</span>
          </div>
          <div>
            <span className="text-gray-500">楼栋点位：</span>
            <span className="text-gray-900">{record.location}</span>
          </div>
          <div>
            <span className="text-gray-500">联系人：</span>
            <span className="text-gray-900">{record.contact}</span>
          </div>
          <div>
            <span className="text-gray-500">押金：</span>
            <span className="text-gray-900">¥{record.deposit}</span>
          </div>
          <div>
            <span className="text-gray-500">借用时间：</span>
            <span className="text-gray-900">{formatDateTime(record.borrowTime)}</span>
          </div>
          <div>
            <span className="text-gray-500">应归还时间：</span>
            <span className={`${overdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
              {formatDateTime(record.dueTime)}
              {overdue && <span className="ml-2 text-xs">（超时 {overdueHrs} 小时）</span>}
            </span>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-2">配件核对（归还）</h3>
        <p className="text-sm text-gray-500 mb-4">逐项清点归还的配件，与借出时对比</p>
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-2">借出时：</div>
          <AccessoryChecklist items={record.borrowedItems} onChange={() => {}} readOnly />
        </div>
        <div className="mb-2">
          <div className="text-xs text-gray-500 mb-2">归还时：</div>
          <AccessoryChecklist
            items={returnedItems}
            onChange={setReturnedItems}
            maxItems={record.borrowedItems}
            highlightDiff
            compareItems={record.borrowedItems}
          />
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-3">干湿状态</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setIsWet(false)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              !isWet
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${!isWet ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                <Droplets size={18} />
              </div>
              <div>
                <div className="font-medium text-gray-900">干燥</div>
                <div className="text-xs text-gray-500">正常，可直接再借</div>
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setIsWet(true)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              isWet
                ? 'border-sky-500 bg-sky-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isWet ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-500'}`}>
                <Droplet size={18} />
              </div>
              <div>
                <div className="font-medium text-gray-900">潮湿 <WetBadge wet={isWet} /></div>
                <div className="text-xs text-gray-500">需晾干，禁止立即借出</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">
            <AlertTriangle size={16} className="inline mr-1 text-amber-500" />
            维修登记
          </h3>
          <button
            type="button"
            onClick={() => setShowRepairForm(true)}
            className="btn-secondary text-sm"
          >
            <Plus size={14} />
            添加问题
          </button>
        </div>

        {repairs.length === 0 && !showRepairForm && (
          <div className="text-center py-6 text-sm text-gray-500">暂无维修问题，配件完好</div>
        )}

        {repairs.length > 0 && (
          <div className="space-y-2 mb-3">
            {repairs.map((r, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className={`badge border ${REPAIR_ISSUE_META[r.issueType].color}`}>
                    {REPAIR_ISSUE_META[r.issueType].label}
                  </span>
                  {r.accessoryType && (
                    <span className="text-xs text-gray-500">{ACCESSORY_META[r.accessoryType].name}</span>
                  )}
                  <span className="text-sm text-gray-700">{r.description}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveRepair(idx)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {showRepairForm && (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">问题类型</label>
                <select
                  className="input"
                  value={newRepair.issueType}
                  onChange={(e) => setNewRepair({ ...newRepair, issueType: e.target.value as RepairIssueType })}
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
                  value={newRepair.accessoryType || ''}
                  onChange={(e) => setNewRepair({ ...newRepair, accessoryType: (e.target.value as AccessoryType) || undefined })}
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
                placeholder="例：篷布有5cm破洞、少1根横杆"
                value={newRepair.description}
                onChange={(e) => setNewRepair({ ...newRepair, description: e.target.value })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowRepairForm(false)}
                className="btn-ghost text-sm"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleAddRepair}
                className="btn-primary text-sm"
                disabled={!newRepair.description}
              >
                <Plus size={14} />
                添加
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3">
        <Link to="/" className="btn-secondary">
          取消
        </Link>
        <button onClick={handleSubmit} className="btn-primary">
          <Check size={16} />
          确认归还
        </button>
      </div>
    </div>
  );
}
