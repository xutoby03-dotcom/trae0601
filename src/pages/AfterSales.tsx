import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { AfterSale } from '@/types';
import AfterSaleList from '@/components/aftersale/AfterSaleList';
import AfterSaleForm from '@/components/aftersale/AfterSaleForm';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { Plus, Wrench, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAfterSaleTypeText } from '@/utils/helpers';

type StatusFilter = 'all' | 'pending' | 'processing' | 'resolved';
type TypeFilter = 'all' | 'missing' | 'wrong' | 'damaged';

const AfterSales = () => {
  const { materials, afterSales, addAfterSale, updateAfterSale } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingAfterSale, setEditingAfterSale] = useState<AfterSale | null>(null);

  const filteredAfterSales = useMemo(() => {
    return afterSales.filter((afterSale) => {
      if (statusFilter !== 'all' && afterSale.status !== statusFilter) {
        return false;
      }
      if (typeFilter !== 'all' && afterSale.type !== typeFilter) {
        return false;
      }
      return true;
    });
  }, [afterSales, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const total = afterSales.length;
    const pending = afterSales.filter((a) => a.status === 'pending').length;
    const processing = afterSales.filter((a) => a.status === 'processing').length;
    const resolved = afterSales.filter((a) => a.status === 'resolved').length;
    return { total, pending, processing, resolved };
  }, [afterSales]);

  const handleAddClick = () => {
    setEditingAfterSale(null);
    setShowForm(true);
  };

  const handleAfterSaleClick = (afterSale: AfterSale) => {
    setEditingAfterSale(afterSale);
    setShowForm(true);
  };

  const handleFormSubmit = (data: Partial<AfterSale>) => {
    if (editingAfterSale) {
      updateAfterSale(editingAfterSale.id, data);
    } else {
      addAfterSale(data as Omit<AfterSale, 'id' | 'createdAt'>);
    }
    setShowForm(false);
    setEditingAfterSale(null);
  };

  const statusTabs: { key: StatusFilter; label: string; icon: any; color: string }[] = [
    { key: 'all', label: '全部', icon: Wrench, color: 'text-gray-600 bg-gray-50' },
    { key: 'pending', label: '待处理', icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
    { key: 'processing', label: '处理中', icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { key: 'resolved', label: '已解决', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
  ];

  const typeTabs: { key: TypeFilter; label: string }[] = [
    { key: 'all', label: '全部类型' },
    { key: 'missing', label: '缺件' },
    { key: 'wrong', label: '错发' },
    { key: 'damaged', label: '破损' },
  ];

  const materialOptions = materials.map((m) => ({
    id: m.id,
    name: m.name,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">售后管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            共 {stats.total} 个售后工单，待处理 {stats.pending} 个
          </p>
        </div>
        <Button onClick={handleAddClick}>
          <Plus className="w-4 h-4 mr-1.5" />
          新建售后
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="总工单数"
          value={stats.total}
          icon={Wrench}
          color="gray"
        />
        <StatCard
          label="待处理"
          value={stats.pending}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          label="处理中"
          value={stats.processing}
          icon={Clock}
          color="amber"
        />
        <StatCard
          label="已解决"
          value={stats.resolved}
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-1 overflow-x-auto">
              {statusTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                      statusFilter === tab.key
                        ? tab.color + ' ring-1 ring-inset ring-current/20'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-1">
              {typeTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setTypeFilter(tab.key)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    typeFilter === tab.key
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4">
          {filteredAfterSales.length > 0 ? (
            <AfterSaleList
              afterSales={filteredAfterSales}
              materials={materials}
              showMaterial={true}
              onAfterSaleClick={handleAfterSaleClick}
            />
          ) : (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">暂无售后工单</p>
              <Button variant="outline" onClick={handleAddClick}>
                <Plus className="w-4 h-4 mr-1.5" />
                新建售后
              </Button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingAfterSale(null);
        }}
        title={editingAfterSale ? '编辑售后工单' : '新建售后工单'}
        className="max-w-md"
      >
        <AfterSaleForm
          afterSale={editingAfterSale}
          materials={materialOptions}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingAfterSale(null);
          }}
        />
      </Modal>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: any;
  color: 'gray' | 'red' | 'amber' | 'emerald';
}) => {
  const colorClasses = {
    gray: 'text-gray-600 bg-gray-100',
    red: 'text-red-600 bg-red-100',
    amber: 'text-amber-600 bg-amber-100',
    emerald: 'text-emerald-600 bg-emerald-100',
  };

  const textColors = {
    gray: 'text-gray-900',
    red: 'text-red-600',
    amber: 'text-amber-600',
    emerald: 'text-emerald-600',
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            colorClasses[color]
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className={cn('text-xl font-bold', textColors[color])}>{value}</p>
        </div>
      </div>
    </div>
  );
};

export default AfterSales;
