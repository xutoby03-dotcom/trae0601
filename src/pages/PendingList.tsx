import { useMemo, useState } from 'react';
import { Trash2, RotateCcw, MoreHorizontal, Calendar, MapPin } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { isExpired, daysUntil, formatDate } from '@/utils/dateUtils';
import type { Medicine } from '@/types';
import clsx from 'clsx';

export default function PendingList() {
  const medicines = useStore((s) => s.medicines);
  const disposeMedicine = useStore((s) => s.disposeMedicine);
  const stockRecords = useStore((s) => s.stockRecords);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');

  const expiredMedicines = useMemo(
    () =>
      medicines
        .filter((m) => !m.disposed && isExpired(m.expiryDate))
        .sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate)),
    [medicines]
  );

  const disposedMedicines = useMemo(
    () =>
      medicines
        .filter((m) => m.disposed)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [medicines]
  );

  const getLatestPrice = (medicineId: string): number | null => {
    const restock = stockRecords
      .filter((r) => r.medicineId === medicineId && r.type === 'restock' && r.unitPrice)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
    return restock?.unitPrice ?? null;
  };

  const totalExpiredValue = useMemo(() => {
    let sum = 0;
    expiredMedicines.forEach((m) => {
      const price = getLatestPrice(m.id);
      if (price) sum += price * m.quantity;
    });
    return sum;
  }, [expiredMedicines, stockRecords]);

  const handleDispose = (medicine: Medicine, action: 'discard' | 'return' | 'other') => {
    disposeMedicine(medicine.id, action, notes || undefined);
    setOpenMenu(null);
    setNotes('');
  };

  const Card = ({ m, isDisposed }: { m: Medicine; isDisposed: boolean }) => {
    const daysExpired = Math.abs(daysUntil(m.expiryDate));
    const price = getLatestPrice(m.id);
    const value = price ? price * m.quantity : null;

    return (
      <div
        className={clsx(
          'card p-4 relative overflow-hidden',
          !isDisposed && 'ring-2 ring-danger-200 bg-gradient-to-br from-white to-danger-50/50'
        )}
      >
        {!isDisposed && (
          <div className="absolute top-0 left-0 w-1 h-full bg-danger-500 animate-pulse-slow" />
        )}
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-xl bg-danger-100 flex items-center justify-center text-3xl shrink-0">
            {m.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">{m.name}</h3>
                <p className="text-xs text-gray-500">{m.category}</p>
              </div>
              <span className={isDisposed ? 'badge-info' : 'badge-danger'}>
                {isDisposed ? '已处理' : `过期 ${daysExpired} 天`}
              </span>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1 text-gray-500">
                <Calendar className="w-3 h-3" />
                {formatDate(m.expiryDate)}
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <MapPin className="w-3 h-3" />
                {m.storageLocation}
              </div>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <span className="text-sm">
                剩余 <span className={clsx('font-bold', !isDisposed && 'text-danger-600')}>{m.quantity}</span> {m.unit}
              </span>
              {value !== null && (
                <span className="text-sm text-danger-600">≈ ¥{value.toFixed(2)}</span>
              )}
            </div>

            {!isDisposed && (
              <div className="mt-3 relative">
                {openMenu !== m.id ? (
                  <button
                    onClick={() => setOpenMenu(m.id)}
                    className="btn-sm btn-danger w-full"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                    处理过期药品
                  </button>
                ) : (
                  <div className="space-y-2 animate-fade-in-up">
                    {openMenu === m.id && (
                      <>
                        <input
                          type="text"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="备注（选填）"
                          className="input py-2 text-sm"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => handleDispose(m, 'discard')}
                            className="btn-sm btn-danger justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                            丢弃
                          </button>
                          <button
                            onClick={() => handleDispose(m, 'return')}
                            className="btn-sm btn-ghost justify-center"
                          >
                            <RotateCcw className="w-4 h-4" />
                            回收
                          </button>
                          <button
                            onClick={() => handleDispose(m, 'other')}
                            className="btn-sm btn-ghost justify-center"
                          >
                            其他
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            setOpenMenu(null);
                            setNotes('');
                          }}
                          className="btn-sm btn-ghost w-full"
                        >
                          取消
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-24 md:pb-8">
      <div className="card p-5 mb-6 bg-gradient-to-br from-danger-50 via-white to-warning-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-gray-800 mb-1">⚠️ 待处理清单</h2>
            <p className="text-sm text-gray-500">
              过期药品已自动移除此处，不计入可用库存
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">待处理</p>
              <p className="font-display text-3xl text-danger-600">{expiredMedicines.length}</p>
            </div>
            <div className="w-px bg-gray-200" />
            <div className="text-center">
              <p className="text-xs text-gray-500">潜在浪费</p>
              <p className="font-display text-3xl text-warning-600">
                ¥{totalExpiredValue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {expiredMedicines.length === 0 && disposedMedicines.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-4">🎉</p>
          <p className="text-gray-700 font-medium">太棒了！暂无过期药品</p>
          <p className="text-sm text-gray-400 mt-1">所有药品状态良好</p>
        </div>
      ) : (
        <div className="space-y-6">
          {expiredMedicines.length > 0 && (
            <div>
              <h3 className="section-title">
                <span className="w-2 h-6 bg-danger-500 rounded-full"></span>
                待处理 · {expiredMedicines.length} 种
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 fade-in-stagger">
                {expiredMedicines.map((m) => (
                  <Card key={m.id} m={m} isDisposed={false} />
                ))}
              </div>
            </div>
          )}

          {disposedMedicines.length > 0 && (
            <div>
              <h3 className="section-title text-gray-500">
                <span className="w-2 h-6 bg-gray-300 rounded-full"></span>
                已处理 · {disposedMedicines.length} 种
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70">
                {disposedMedicines.map((m) => (
                  <Card key={m.id} m={m} isDisposed={true} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
