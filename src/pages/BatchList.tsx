import { Link } from 'react-router-dom';
import { Plus, Package } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { BatchCard } from '../components/BatchCard';

export function BatchList() {
  const { batches, orders, deleteBatch } = useAppStore();

  const handleDelete = (id: string) => {
    if (confirm('确认删除此团购批次吗？相关订单也会被删除，此操作不可撤销。')) {
      deleteBatch(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-cyan-600" />
            团购批次管理
          </h1>
          <p className="text-slate-500 mt-1">管理团购商品信息和到货状态</p>
        </div>
        <Link
          to="/batches/new"
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建团购批次
        </Link>
      </div>

      {batches.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            暂无团购批次
          </h3>
          <p className="text-slate-500 mb-4">
            点击上方按钮创建第一个团购批次
          </p>
          <Link
            to="/batches/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建团购批次
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {batches.map((batch) => {
            const batchOrders = orders.filter((o) => o.batchId === batch.id);
            const pickedCount = batchOrders.filter(
              (o) => o.queueStatus === 'picked'
            ).length;
            return (
              <BatchCard
                key={batch.id}
                batch={batch}
                orderCount={batchOrders.length}
                pickedCount={pickedCount}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
