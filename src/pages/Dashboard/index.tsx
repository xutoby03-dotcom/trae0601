import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Package, AlertTriangle, DollarSign, ArrowRight, Plus, Calculator } from 'lucide-react';
import { useProductStore } from '@/store/productStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useSaleStore } from '@/store/saleStore';
import { formatMoney, getDaysUntilExpiry, getTodayString } from '@/utils/dateUtils';
import { getBatchStatusColor, getBatchStatusLabel } from '@/utils/priceUtils';
import { isExpired } from '@/utils/dateUtils';

export default function DashboardPage() {
  const { products, loadProducts } = useProductStore();
  const { batches, loadBatches, refreshBatchStatuses } = useInventoryStore();
  const { sales, loadSales, getSalesByDate } = useSaleStore();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadProducts();
    loadBatches();
    loadSales();
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      refreshBatchStatuses();
    }
  }, [loaded, refreshBatchStatuses]);

  const todaySales = getSalesByDate(getTodayString());
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.actualAmount, 0);
  const todayDiscount = todaySales.reduce((sum, s) => sum + s.discountAmount, 0);

  const totalStock = batches
    .filter(b => b.remainingQuantity > 0 && !isExpired(b.expiryDate))
    .reduce((sum, b) => sum + b.remainingQuantity, 0);

  const nearExpiryCount = batches.filter(b => b.status === 'near_expiry').reduce((sum, b) => sum + b.remainingQuantity, 0);
  const clearanceCount = batches.filter(b => b.status === 'clearance').reduce((sum, b) => sum + b.remainingQuantity, 0);
  const expiredCount = batches.filter(b => b.status === 'expired').reduce((sum, b) => sum + b.remainingQuantity, 0);

  const expiredLossValue = batches
    .filter(b => b.status === 'expired')
    .reduce((sum, b) => {
      const product = products.find(p => p.id === b.productId);
      return sum + (product ? product.costPrice * b.remainingQuantity : 0);
    }, 0);

  const urgentBatches = batches
    .filter(b => b.remainingQuantity > 0 && !isExpired(b.expiryDate) && b.status !== 'normal')
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
    .slice(0, 8);

  const stats = [
    {
      label: '今日销售额',
      value: formatMoney(todayRevenue),
      subValue: `优惠 ${formatMoney(todayDiscount)}`,
      icon: DollarSign,
      gradient: 'from-green-400 to-emerald-600',
      iconBg: 'bg-green-500/20',
    },
    {
      label: '库存总量',
      value: totalStock,
      subValue: `${products.length} 种商品`,
      icon: Package,
      gradient: 'from-blue-400 to-blue-600',
      iconBg: 'bg-blue-500/20',
    },
    {
      label: '临期预警',
      value: nearExpiryCount + clearanceCount,
      subValue: `${clearanceCount} 件清仓`,
      icon: AlertTriangle,
      gradient: 'from-orange-400 to-red-500',
      iconBg: 'bg-orange-500/20',
    },
    {
      label: '累计报损',
      value: formatMoney(expiredLossValue),
      subValue: `${expiredCount} 件过期`,
      icon: TrendingUp,
      gradient: 'from-gray-400 to-gray-600',
      iconBg: 'bg-gray-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">仪表盘</h1>
          <p className="text-gray-500 mt-1">欢迎使用临期酸奶促销看板系统</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/inventory"
            className="flex items-center gap-2 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 px-4 py-2.5 rounded-xl font-medium transition-all"
          >
            <Plus className="w-5 h-5" />
            快速入库
          </Link>
          <Link
            to="/pos"
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/30"
          >
            <Calculator className="w-5 h-5" />
            开始收银
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.subValue}</p>
              </div>
              <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 bg-gradient-to-br ${stat.gradient} bg-clip-text`} style={{ color: 'transparent', WebkitTextFillColor: 'transparent' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800">临期预警</h2>
              <p className="text-sm text-gray-500">即将到期的商品，优先促销</p>
            </div>
            <Link
              to="/inventory"
              className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1"
            >
              查看全部
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {urgentBatches.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>暂无临期商品</p>
              </div>
            ) : (
              <div className="divide-y">
                {urgentBatches.map(batch => {
                  const product = products.find(p => p.id === batch.productId);
                  if (!product) return null;
                  const daysLeft = getDaysUntilExpiry(batch.expiryDate);

                  return (
                    <div key={batch.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <img
                          src={product.imageUrl}
                          alt={product.flavor}
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-800 truncate">
                              {product.brand} {product.flavor}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getBatchStatusColor(batch.status)}`}>
                              {getBatchStatusLabel(batch.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {product.specification} · {product.fridgeLocation}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-gray-500">
                              剩余 <span className="font-medium text-gray-700">{batch.remainingQuantity}</span> 件
                            </span>
                            <span className="text-gray-500">
                              到期日 <span className="font-medium text-gray-700">{batch.expiryDate}</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            daysLeft <= 1 ? 'text-red-500' :
                            daysLeft <= 3 ? 'text-orange-500' : 'text-green-600'
                          }`}>
                            {daysLeft > 0 ? `${daysLeft}天` : '今天'}
                          </div>
                          <p className="text-xs text-gray-400">剩余</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-bold text-gray-800 mb-4">快捷操作</h2>
            <div className="space-y-3">
              <Link
                to="/pos"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
              >
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">收银台</p>
                  <p className="text-sm text-blue-100">快速结账收款</p>
                </div>
                <ArrowRight className="w-5 h-5 ml-auto" />
              </Link>
              
              <Link
                to="/inventory"
                className="flex items-center gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
              >
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">商品入库</p>
                  <p className="text-sm text-gray-500">登记新批次</p>
                </div>
                <ArrowRight className="w-5 h-5 ml-auto text-gray-400" />
              </Link>
              
              <Link
                to="/products"
                className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
              >
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">商品管理</p>
                  <p className="text-sm text-gray-500">维护商品档案</p>
                </div>
                <ArrowRight className="w-5 h-5 ml-auto text-gray-400" />
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-5 border border-orange-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">促销建议</h3>
                <p className="text-sm text-gray-500">根据临期情况</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {nearExpiryCount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">7折促销商品</span>
                  <span className="font-medium text-orange-600">{nearExpiryCount} 件</span>
                </div>
              )}
              {clearanceCount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">4折清仓商品</span>
                  <span className="font-medium text-red-600">{clearanceCount} 件</span>
                </div>
              )}
              {nearExpiryCount === 0 && clearanceCount === 0 && (
                <p className="text-gray-500">暂无临期商品需要促销</p>
              )}
            </div>
            {nearExpiryCount > 0 || clearanceCount > 0 ? (
              <Link
                to="/pos"
                className="mt-4 w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-center font-medium transition-colors block"
              >
                去促销
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
