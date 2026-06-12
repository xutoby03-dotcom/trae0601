import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  calculateReceivedQuantity,
  calculateDamagedQuantity,
  getMaterialStatus,
  getDelayDays,
  isDelayed,
  getAfterSaleStatusText,
  getAfterSaleStatusColor,
  getAfterSaleTypeText,
  getAfterSaleTypeColor,
} from '@/utils/helpers';
import Badge from '@/components/common/Badge';
import {
  BarChart3,
  Package,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingDown,
  Wrench,
  Building,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Summary = () => {
  const { materials, deliveries, afterSales } = useAppStore();

  const stats = useMemo(() => {
    const total = materials.length;
    const complete = materials.filter(
      (m) => getMaterialStatus(m, deliveries) === 'complete'
    ).length;
    const partial = materials.filter(
      (m) => getMaterialStatus(m, deliveries) === 'partial'
    ).length;
    const pending = materials.filter(
      (m) => getMaterialStatus(m, deliveries) === 'pending'
    ).length;
    const delayed = materials.filter(
      (m) => getMaterialStatus(m, deliveries) === 'delayed'
    ).length;

    const totalDamaged = deliveries.reduce(
      (sum, d) => sum + d.damagedQuantity,
      0
    );
    const totalReceived = deliveries.reduce(
      (sum, d) => sum + d.receivedQuantity,
      0
    );
    const damageRate = totalReceived > 0 ? (totalDamaged / totalReceived) * 100 : 0;

    const afterSaleStats = {
      total: afterSales.length,
      pending: afterSales.filter((a) => a.status === 'pending').length,
      processing: afterSales.filter((a) => a.status === 'processing').length,
      resolved: afterSales.filter((a) => a.status === 'resolved').length,
    };

    return {
      total,
      complete,
      partial,
      pending,
      delayed,
      totalDamaged,
      totalReceived,
      damageRate,
      afterSaleStats,
    };
  }, [materials, deliveries, afterSales]);

  const supplierStats = useMemo(() => {
    const supplierMap = new Map<
      string,
      {
        name: string;
        totalMaterials: number;
        delayedCount: number;
        totalDelayDays: number;
        totalReceived: number;
        totalDamaged: number;
      }
    >();

    materials.forEach((material) => {
      if (!material.supplier) return;

      if (!supplierMap.has(material.supplier)) {
        supplierMap.set(material.supplier, {
          name: material.supplier,
          totalMaterials: 0,
          delayedCount: 0,
          totalDelayDays: 0,
          totalReceived: 0,
          totalDamaged: 0,
        });
      }

      const supplier = supplierMap.get(material.supplier)!;
      supplier.totalMaterials++;

      const status = getMaterialStatus(material, deliveries);
      if (status === 'delayed' || (status === 'pending' && isDelayed(material.expectedDate))) {
        supplier.delayedCount++;
        supplier.totalDelayDays += getDelayDays(material.expectedDate);
      }

      const received = calculateReceivedQuantity(material.id, deliveries);
      const damaged = calculateDamagedQuantity(material.id, deliveries);
      supplier.totalReceived += received;
      supplier.totalDamaged += damaged;
    });

    const supplierList = Array.from(supplierMap.values()).map((s) => ({
      ...s,
      avgDelayDays: s.delayedCount > 0 ? Math.round(s.totalDelayDays / s.delayedCount) : 0,
      damageRate: s.totalReceived > 0 ? (s.totalDamaged / s.totalReceived) * 100 : 0,
    }));

    supplierList.sort((a, b) => b.avgDelayDays - a.avgDelayDays);

    return supplierList;
  }, [materials, deliveries]);

  const pendingAfterSales = useMemo(() => {
    return afterSales
      .filter((a) => a.status !== 'resolved')
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [afterSales]);

  const getMaterialName = (materialId: string): string => {
    const material = materials.find((m) => m.id === materialId);
    return material?.name || '未知材料';
  };

  const maxDelayDays = Math.max(...supplierStats.map((s) => s.avgDelayDays), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">数据汇总</h1>
        <p className="text-sm text-gray-500 mt-1">
          全局统计概览，快速了解装修材料整体进度
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="总材料数"
          value={stats.total}
          icon={Package}
          color="teal"
          suffix="种"
        />
        <StatCard
          label="已齐套"
          value={stats.complete}
          icon={CheckCircle2}
          color="emerald"
          suffix="种"
        />
        <StatCard
          label="已延期"
          value={stats.delayed}
          icon={AlertTriangle}
          color="red"
          suffix="种"
        />
        <StatCard
          label="破损率"
          value={stats.damageRate.toFixed(1)}
          icon={TrendingDown}
          color="amber"
          suffix="%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">供应商延期排名</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                按平均延期天数排序
              </p>
            </div>
            <Building className="w-5 h-5 text-gray-400" />
          </div>

          {supplierStats.length > 0 ? (
            <div className="space-y-4">
              {supplierStats.map((supplier, index) => (
                <div key={supplier.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                          index === 0
                            ? 'bg-red-100 text-red-600'
                            : index === 1
                            ? 'bg-amber-100 text-amber-600'
                            : index === 2
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">
                        {supplier.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        平均延期
                      </span>
                      <span
                        className={cn(
                          'font-semibold',
                          supplier.avgDelayDays > 0
                            ? 'text-red-600'
                            : 'text-emerald-600'
                        )}
                      >
                        {supplier.avgDelayDays} 天
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        supplier.avgDelayDays > 5
                          ? 'bg-red-500'
                          : supplier.avgDelayDays > 0
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      )}
                      style={{
                        width: `${(supplier.avgDelayDays / maxDelayDays) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>共 {supplier.totalMaterials} 种材料</span>
                    <span>
                      破损率{' '}
                      <span
                        className={cn(
                          'font-medium',
                          supplier.damageRate > 5
                            ? 'text-red-600'
                            : supplier.damageRate > 1
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        )}
                      >
                        {supplier.damageRate.toFixed(1)}%
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500 text-sm">
              暂无供应商数据
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">材料状态分布</h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <StatusBar
                label="已齐套"
                count={stats.complete}
                total={stats.total}
                color="bg-emerald-500"
              />
              <StatusBar
                label="部分到货"
                count={stats.partial}
                total={stats.total}
                color="bg-amber-500"
              />
              <StatusBar
                label="待到货"
                count={stats.pending}
                total={stats.total}
                color="bg-gray-400"
              />
              <StatusBar
                label="已延期"
                count={stats.delayed}
                total={stats.total}
                color="bg-red-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">售后概览</h2>
              <Wrench className="w-5 h-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-xl font-bold text-red-600">
                  {stats.afterSaleStats.pending}
                </p>
                <p className="text-xs text-red-600">待处理</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <p className="text-xl font-bold text-amber-600">
                  {stats.afterSaleStats.processing}
                </p>
                <p className="text-xs text-amber-600">处理中</p>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <p className="text-xl font-bold text-emerald-600">
                  {stats.afterSaleStats.resolved}
                </p>
                <p className="text-xs text-emerald-600">已解决</p>
              </div>
            </div>
            {pendingAfterSales.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">待处理售后</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {pendingAfterSales.map((afterSale) => (
                    <div
                      key={afterSale.id}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {getMaterialName(afterSale.materialId)}
                        </span>
                        <Badge
                          className={getAfterSaleTypeColor(afterSale.type)}
                          size="sm"
                        >
                          {getAfterSaleTypeText(afterSale.type)}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {afterSale.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
  suffix,
}: {
  label: string;
  value: number | string;
  icon: any;
  color: 'teal' | 'emerald' | 'red' | 'amber';
  suffix?: string;
}) => {
  const colorClasses = {
    teal: 'text-teal-600 bg-teal-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    red: 'text-red-600 bg-red-50',
    amber: 'text-amber-600 bg-amber-50',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value}
            {suffix && <span className="text-base font-medium ml-0.5">{suffix}</span>}
          </p>
        </div>
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            colorClasses[color]
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

const StatusBar = ({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-medium text-gray-900">{count}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default Summary;
