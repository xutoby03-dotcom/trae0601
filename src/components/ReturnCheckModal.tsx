import { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useAppStore } from '@/store';
import { CleanlinessStatus } from '@/types';
import Button from '@/components/Button';

interface Props {
  borrowId: string;
  onClose: () => void;
  onConfirm: (status: CleanlinessStatus) => void;
}

export default function ReturnCheckModal({ borrowId, onClose, onConfirm }: Props) {
  const { borrows } = useAppStore();
  const record = borrows.find(b => b.id === borrowId);
  const [status, setStatus] = useState<CleanlinessStatus>(null);

  if (!record) return null;

  const options = [
    { value: 'clean' as const, label: '清洁合格', icon: CheckCircle2, color: 'border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-100' },
    { value: 'needs-cleaning' as const, label: '需清洁', icon: AlertTriangle, color: 'border-warning-500 bg-warning-50 text-warning-700 ring-2 ring-warning-100' },
    { value: 'damaged' as const, label: '已破损', icon: XCircle, color: 'border-danger-500 bg-danger-50 text-danger-700 ring-2 ring-danger-100' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900">归还清洁检查</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-zinc-50 rounded-lg p-4 space-y-1">
            <p className="text-sm text-zinc-500">物品信息</p>
            <p className="font-semibold text-zinc-900">{record.itemName} × {record.quantity}</p>
            <p className="text-sm text-zinc-600">借用人：{record.residentName} · {record.building}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-700 mb-3">请检查清洁状态：</p>
            <div className="space-y-2">
              {options.map(opt => {
                const Icon = opt.icon;
                const selected = status === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-left transition-all ' +
                      (selected ? opt.color : 'border-zinc-200 hover:border-zinc-300 text-zinc-700')
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {status === 'damaged' && (
            <div className="bg-danger-50 rounded-lg p-3 text-sm text-danger-700 border border-danger-100">
              ⚠️ 标记为破损的物品将不会恢复库存
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3 bg-zinc-50">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button disabled={!status} onClick={() => status && onConfirm(status)}>
            确认归还
          </Button>
        </div>
      </div>
    </div>
  );
}
