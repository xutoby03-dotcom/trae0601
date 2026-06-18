import { useState, useMemo } from 'react';
import Header from '../components/Header';
import { SectionTitle, formatDate } from '../components/ui';
import { useAppStore } from '../store';
import {
  Warehouse,
  Plus,
  Package,
  Calendar,
  Store,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  X,
  Layers,
} from 'lucide-react';
import type { FilterBatch } from '../types';

interface StockForm {
  spec: string;
  batchNo: string;
  quantity: number;
  purchaseDate: string;
  supplier: string;
}

const TODAY = '2026-06-19';

export default function Inventory() {
  const batches = useAppStore((s) => s.batches);
  const thresholds = useAppStore((s) => s.thresholds);
  const getTotalStockBySpec = useAppStore((s) => s.getTotalStockBySpec);
  const addStockBatch = useAppStore((s) => s.addStockBatch);
  const deductStock = useAppStore((s) => s.deductStock);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<StockForm>({
    spec: '',
    batchNo: '',
    quantity: 0,
    purchaseDate: TODAY,
    supplier: '',
  });

  const specGroups = useMemo(() => {
    const map = new Map<string, FilterBatch[]>();
    batches.forEach((b) => {
      if (!map.has(b.spec)) map.set(b.spec, []);
      map.get(b.spec)!.push(b);
    });
    return Array.from(map.entries());
  }, [batches]);

  const getStockStatus = (total: number) => {
    if (total === 0) {
      return {
        label: '断货',
        className: 'bg-danger-500 text-white',
        icon: <AlertCircle className="w-3.5 h-3.5" />,
      };
    }
    if (total < thresholds.safeStockPerSpec) {
      return {
        label: '库存不足',
        className: 'bg-warn-500 text-white',
        icon: <AlertCircle className="w-3.5 h-3.5" />,
      };
    }
    return {
      label: '库存充足',
      className: 'bg-air-excellent text-white',
      icon: <CheckCircle className="w-3.5 h-3.5" />,
    };
  };

  const isLowStock = (batch: FilterBatch, total: number) =>
    batch.quantity <= 1 && total < thresholds.safeStockPerSpec;

  const handleSubmit = () => {
    if (!form.spec || !form.batchNo || form.quantity <= 0 || !form.purchaseDate) return;
    addStockBatch({
      spec: form.spec,
      batchNo: form.batchNo,
      quantity: form.quantity,
      purchaseDate: form.purchaseDate,
      supplier: form.supplier || undefined,
    });
    setShowModal(false);
    setForm({ spec: '', batchNo: '', quantity: 0, purchaseDate: TODAY, supplier: '' });
  };

  return (
    <div className="min-h-screen">
      <Header title="滤芯库存管理" subtitle="分规格分批次管理，低库存自动标黄" />

      <div className="px-8 py-6 flex flex-col gap-8">
        <div className="base-card p-6 animate-fade-in-up stagger-1">
          <SectionTitle
            icon={Warehouse}
            title="新增滤芯入库"
            desc="登记新批次滤芯采购入库"
            action={
              <button className="primary-btn" onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4" />
                新增入库单
              </button>
            }
          />
          <p className="text-sm text-brand-500">
            点击右上角「新增入库单」，录入滤芯规格、批次号、数量等信息后即可入库。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {specGroups.map(([spec, specBatches], idx) => {
            const total = getTotalStockBySpec(spec);
            const status = getStockStatus(total);
            const lowTotal = total < thresholds.safeStockPerSpec;
            const zeroTotal = total === 0;
            const staggerClass = `stagger-${Math.min(idx + 2, 6)}` as const;

            return (
              <div
                key={spec}
                className={`base-card p-6 animate-fade-in-up ${staggerClass}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black text-brand-800 mb-1">{spec}</h3>
                    <span
                      className={`text-4xl font-black font-mono ${
                        lowTotal
                          ? 'text-warn-600 animate-breathe'
                          : 'text-brand-700'
                      }`}
                    >
                      {total}
                      <span className="text-lg font-bold ml-1">件</span>
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${status.className}`}
                  >
                    {status.icon}
                    {status.label}
                  </span>
                </div>

                <p className="text-xs text-brand-500 mb-5">
                  安全库存 {thresholds.safeStockPerSpec} 件 · 共 {specBatches.length} 批次
                </p>

                <div>
                  {specBatches.map((batch) => {
                    const batchLow = isLowStock(batch, total);
                    return (
                      <div
                        key={batch.id}
                        className={`p-4 rounded-xl border mb-3 last:mb-0 transition-all ${
                          batchLow
                            ? 'warn-card'
                            : 'border-surface-border bg-white hover:border-brand-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold font-mono text-brand-800 truncate">
                              {batch.batchNo}
                            </p>
                            <div className="flex flex-wrap gap-3 text-xs text-brand-500 mt-1">
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(batch.purchaseDate)}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Store className="w-3 h-3" />
                                {batch.supplier || '未知供应商'}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Layers className="w-3 h-3" />
                                批次
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end ml-3 shrink-0">
                            <div className="flex items-baseline gap-1">
                              <span
                                className={`text-2xl font-black font-mono ${
                                  batchLow ? 'text-warn-700' : 'text-brand-700'
                                }`}
                              >
                                {batch.quantity}
                              </span>
                              <span className="text-sm font-bold text-brand-500">件</span>
                            </div>
                            <div className="flex gap-1 mt-2">
                              <button
                                className="ghost-btn !px-2.5 !py-1.5 text-xs"
                                disabled={batch.quantity < 1}
                                onClick={() =>
                                  deductStock(batch.spec, batch.batchNo, 1)
                                }
                              >
                                <TrendingDown className="w-3.5 h-3.5" />
                                出库1件
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {specGroups.length === 0 && (
            <div className="base-card p-12 md:col-span-2 flex flex-col items-center justify-center text-center animate-fade-in-up stagger-2">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-400 mb-4">
                <Package className="w-8 h-8" />
              </div>
              <p className="text-base font-bold text-brand-700 mb-1">暂无库存数据</p>
              <p className="text-sm text-brand-500">请先添加入库单，登记滤芯批次</p>
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-brand-900/50 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <div className="relative base-card p-6 w-full max-w-lg animate-fade-in-up shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
                    <Warehouse className="w-5 h-5" strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-brand-800">新增入库单</h3>
                    <p className="text-xs text-brand-500">登记滤芯批次采购入库信息</p>
                  </div>
                </div>
                <button
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-brand-400 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="label-base">滤芯规格</label>
                  <input
                    type="text"
                    className="input-base"
                    value={form.spec}
                    onChange={(e) => setForm({ ...form, spec: e.target.value })}
                    placeholder="如：米家 Pro-H 滤芯"
                  />
                </div>

                <div>
                  <label className="label-base">批次号</label>
                  <input
                    type="text"
                    className="input-base font-mono"
                    value={form.batchNo}
                    onChange={(e) => setForm({ ...form, batchNo: e.target.value })}
                    placeholder="如：MH-2026-0618"
                  />
                </div>

                <div>
                  <label className="label-base">入库数量</label>
                  <input
                    type="number"
                    className="input-base"
                    value={form.quantity || ''}
                    min={1}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="请输入数量"
                  />
                </div>

                <div>
                  <label className="label-base">入库日期</label>
                  <input
                    type="date"
                    className="input-base"
                    value={form.purchaseDate}
                    onChange={(e) =>
                      setForm({ ...form, purchaseDate: e.target.value })
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label-base">供应商（可选）</label>
                  <input
                    type="text"
                    className="input-base"
                    value={form.supplier}
                    onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                    placeholder="如：京东自营、小米商城"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  className="secondary-btn"
                  onClick={() => setShowModal(false)}
                >
                  取消
                </button>
                <button
                  className="primary-btn"
                  disabled={
                    !form.spec || !form.batchNo || form.quantity <= 0 || !form.purchaseDate
                  }
                  onClick={handleSubmit}
                >
                  <Plus className="w-4 h-4" />
                  确认入库
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
