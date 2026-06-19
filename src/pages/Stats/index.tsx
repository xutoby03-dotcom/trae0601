import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { TrendingDown, TrendingUp, DollarSign, Package, ShoppingBag, Lightbulb } from 'lucide-react';
import { useProductStore } from '@/store/productStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useSaleStore } from '@/store/saleStore';
import { formatMoney, getDaysUntilExpiry, addDaysToDate, getTodayString, formatDate } from '@/utils/dateUtils';
import { isExpired } from '@/utils/dateUtils';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function StatsPage() {
  const { products, loadProducts } = useProductStore();
  const { batches, loadBatches, refreshBatchStatuses } = useInventoryStore();
  const { sales, loadSales } = useSaleStore();
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

  const expiryDistribution = [
    { name: '正常(>3天)', value: 0, count: 0 },
    { name: '临期(1-3天)', value: 0, count: 0 },
    { name: '清仓(≤1天)', value: 0, count: 0 },
    { name: '已过期', value: 0, count: 0 },
  ];

  batches.forEach(batch => {
    if (batch.remainingQuantity <= 0) return;
    const product = products.find(p => p.id === batch.productId);
    if (!product) return;

    const daysLeft = getDaysUntilExpiry(batch.expiryDate);
    const stockValue = product.salePrice * batch.remainingQuantity;

    if (isExpired(batch.expiryDate)) {
      expiryDistribution[3].value += stockValue;
      expiryDistribution[3].count += batch.remainingQuantity;
    } else if (daysLeft <= 1) {
      expiryDistribution[2].value += stockValue;
      expiryDistribution[2].count += batch.remainingQuantity;
    } else if (daysLeft <= 3) {
      expiryDistribution[1].value += stockValue;
      expiryDistribution[1].count += batch.remainingQuantity;
    } else {
      expiryDistribution[0].value += stockValue;
      expiryDistribution[0].count += batch.remainingQuantity;
    }
  });

  const flavorSales: Record<string, { quantity: number; revenue: number }> = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return;
      const key = product.flavor;
      if (!flavorSales[key]) {
        flavorSales[key] = { quantity: 0, revenue: 0 };
      }
      flavorSales[key].quantity += item.quantity;
      flavorSales[key].revenue += item.subtotal;
    });
  });

  const flavorSalesData = Object.entries(flavorSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 6);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = addDaysToDate(getTodayString(), -6 + i);
    const daySales = sales.filter(s => s.saleTime.startsWith(date));
    return {
      date: formatDate(date, 'MM-dd'),
      销售额: daySales.reduce((sum, s) => sum + s.actualAmount, 0),
      优惠额: daySales.reduce((sum, s) => sum + s.discountAmount, 0),
    };
  });

  const totalRevenue = sales.reduce((sum, s) => sum + s.actualAmount, 0);
  const totalDiscount = sales.reduce((sum, s) => sum + s.discountAmount, 0);
  const totalSalesQty = sales.reduce((sum, s) => sum + s.items.reduce((s2, i) => s2 + i.quantity, 0), 0);

  let discountQty = 0;
  let clearanceQty = 0;
  let normalQty = 0;
  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (item.priceType === 'discount') discountQty += item.quantity;
      else if (item.priceType === 'clearance') clearanceQty += item.quantity;
      else normalQty += item.quantity;
    });
  });

  const savedLossValue = discountQty * 0 + clearanceQty * 0;
  const expiredLossValue = batches
    .filter(b => b.status === 'expired')
    .reduce((sum, b) => {
      const product = products.find(p => p.id === b.productId);
      return sum + (product ? product.costPrice * b.remainingQuantity : 0);
    }, 0);

  const purchaseSuggestions = products.map(product => {
    const productSales = sales.filter(s => s.items.some(i => i.productId === product.id));
    const totalSold = productSales.reduce((sum, s) => 
      sum + s.items.filter(i => i.productId === product.id).reduce((s2, i) => s2 + i.quantity, 0), 0);
    
    const currentStock = batches
      .filter(b => b.productId === product.id && b.remainingQuantity > 0 && !isExpired(b.expiryDate))
      .reduce((sum, b) => sum + b.remainingQuantity, 0);

    const avgDailySales = totalSold / 7;
    const daysOfStock = avgDailySales > 0 ? currentStock / avgDailySales : 999;
    
    let suggestion = '库存充足';
    let urgency = 'low';
    let suggestQty = 0;
    
    if (daysOfStock < 2) {
      suggestion = '紧急补货';
      urgency = 'high';
      suggestQty = Math.max(20, Math.round(avgDailySales * 7));
    } else if (daysOfStock < 5) {
      suggestion = '建议补货';
      urgency = 'medium';
      suggestQty = Math.round(avgDailySales * 5);
    }

    return {
      product,
      currentStock,
      avgDailySales: Math.round(avgDailySales * 10) / 10,
      daysOfStock: Math.round(daysOfStock * 10) / 10,
      suggestion,
      urgency,
      suggestQty,
    };
  }).sort((a, b) => a.daysOfStock - b.daysOfStock);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">统计报表</h1>
        <p className="text-gray-500 mt-1">全方位数据分析，助力经营决策</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">总销售额</p>
              <p className="text-2xl font-bold text-gray-800">{formatMoney(totalRevenue)}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-600">优惠 {formatMoney(totalDiscount)}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">总销量</p>
              <p className="text-2xl font-bold text-gray-800">{totalSalesQty} 件</p>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            其中促销销量 <span className="text-orange-600 font-medium">{discountQty + clearanceQty}</span> 件
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">库存价值</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatMoney(
                  batches
                    .filter(b => !isExpired(b.expiryDate) && b.remainingQuantity > 0)
                    .reduce((sum, b) => {
                      const product = products.find(p => p.id === b.productId);
                      return sum + (product ? product.salePrice * b.remainingQuantity : 0);
                    }, 0)
                )}
              </p>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            过期报损 <span className="text-red-500 font-medium">{formatMoney(expiredLossValue)}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">促销占比</p>
              <p className="text-2xl font-bold text-gray-800">
                {totalSalesQty > 0 ? Math.round((discountQty + clearanceQty) / totalSalesQty * 100) : 0}%
              </p>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            7折 {discountQty} 件 · 4折 {clearanceQty} 件
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">销售趋势（近7天）</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={12} stroke="#9CA3AF" />
                <YAxis fontSize={12} stroke="#9CA3AF" />
                <Tooltip
                  formatter={(value: number) => formatMoney(value)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="销售额" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="优惠额" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">临期库存分布</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expiryDistribution.filter(d => d.count > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="count"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {expiryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#10B981', '#F59E0B', '#EF4444', '#6B7280'][index]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name) => [`${value} 件`, name]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">热销口味排行</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flavorSalesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" fontSize={12} stroke="#9CA3AF" />
                <YAxis dataKey="name" type="category" fontSize={12} stroke="#9CA3AF" width={60} />
                <Tooltip
                  formatter={(value: number, name) => [
                    name === 'quantity' ? `${value} 件` : formatMoney(value),
                    name === 'quantity' ? '销量' : '销售额'
                  ]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="quantity" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">促销效果分析</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div>
                <p className="text-gray-600">原价销售</p>
                <p className="text-2xl font-bold text-green-600">{normalQty} 件</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">占比</p>
                <p className="font-medium text-green-600">
                  {totalSalesQty > 0 ? Math.round(normalQty / totalSalesQty * 100) : 0}%
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
              <div>
                <p className="text-gray-600">7折促销</p>
                <p className="text-2xl font-bold text-orange-600">{discountQty} 件</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">占比</p>
                <p className="font-medium text-orange-600">
                  {totalSalesQty > 0 ? Math.round(discountQty / totalSalesQty * 100) : 0}%
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
              <div>
                <p className="text-gray-600">4折清仓</p>
                <p className="text-2xl font-bold text-red-600">{clearanceQty} 件</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">占比</p>
                <p className="font-medium text-red-600">
                  {totalSalesQty > 0 ? Math.round(clearanceQty / totalSalesQty * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">智能进货建议</h3>
            <p className="text-sm text-gray-500">基于销售速度和库存水平的补货推荐</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm border-b">
                <th className="pb-3 font-medium">商品</th>
                <th className="pb-3 font-medium">当前库存</th>
                <th className="pb-3 font-medium">日均销量</th>
                <th className="pb-3 font-medium">可售天数</th>
                <th className="pb-3 font-medium">建议状态</th>
                <th className="pb-3 font-medium">建议补货量</th>
              </tr>
            </thead>
            <tbody>
              {purchaseSuggestions.map(({ product, currentStock, avgDailySales, daysOfStock, suggestion, urgency, suggestQty }) => (
                <tr key={product.id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <img src={product.imageUrl} alt={product.flavor} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium text-gray-800">{product.brand} {product.flavor}</p>
                        <p className="text-xs text-gray-500">{product.specification}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-medium text-gray-800">{currentStock} 件</td>
                  <td className="py-4 text-gray-600">{avgDailySales} 件/天</td>
                  <td className="py-4">
                    <span className={`font-medium ${
                      daysOfStock < 2 ? 'text-red-600' :
                      daysOfStock < 5 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {daysOfStock >= 999 ? '∞' : `${daysOfStock} 天`}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      urgency === 'high' ? 'bg-red-100 text-red-700' :
                      urgency === 'medium' ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {suggestion}
                    </span>
                  </td>
                  <td className="py-4 font-bold text-blue-600">
                    {suggestQty > 0 ? `${suggestQty} 件` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
