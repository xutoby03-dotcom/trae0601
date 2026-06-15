import React, { useMemo } from 'react';
import { Package, AlertTriangle, Clock, TrendingUp, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCabinetStore } from '@/store/useCabinetStore';
import { useMedicineStore } from '@/store/useMedicineStore';
import { useRecordStore } from '@/store/useRecordStore';
import { CabinetCard } from '@/components/CabinetCard';
import { useExpiryCheck } from '@/hooks/useExpiryCheck';
import { BUILDING_NAMES } from '@/types';

const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  delay: string;
}> = ({ title, value, icon, color, delay }) => (
  <div 
    className="bg-white rounded-2xl p-5 shadow-sm animate-slide-up"
    style={{ animationDelay: delay }}
  >
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  useExpiryCheck();
  const navigate = useNavigate();
  
  const cabinets = useCabinetStore(state => state.cabinets);
  const getTotalMedicines = useMedicineStore(state => state.getTotalMedicines);
  const getExpiredCount = useMedicineStore(state => state.getExpiredCount);
  const getLowStockCount = useMedicineStore(state => state.getLowStockCount);
  const getPurchaseList = useMedicineStore(state => state.getPurchaseList);
  const getWeeklyUsageCount = useRecordStore(state => state.getWeeklyUsageCount);
  
  const stats = useMemo(() => [
    {
      title: '药品总数',
      value: getTotalMedicines(),
      icon: <Package className="w-6 h-6" />,
      color: 'bg-blue-500',
      delay: '0.1s',
    },
    {
      title: '过期药品',
      value: getExpiredCount(),
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'bg-red-500',
      delay: '0.2s',
    },
    {
      title: '库存预警',
      value: getLowStockCount(),
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-amber-500',
      delay: '0.3s',
    },
    {
      title: '本周领用',
      value: getWeeklyUsageCount(),
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-green-500',
      delay: '0.4s',
    },
  ], [getTotalMedicines, getExpiredCount, getLowStockCount, getWeeklyUsageCount]);
  
  const purchaseList = useMemo(() => getPurchaseList(), [getPurchaseList]);
  
  return (
    <div className="space-y-8 pb-8">
      <div className="animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">药箱总览</h2>
        <p className="text-gray-500">实时监控各楼栋药箱状态，确保应急药品供应</p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">楼栋药箱</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {cabinets.map((cabinet, index) => (
            <CabinetCard key={cabinet.id} cabinet={cabinet} index={index} />
          ))}
        </div>
      </div>
      
      {purchaseList.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">待采购清单</h3>
            <button
              onClick={() => navigate('/purchase')}
              className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <ShoppingCart className="w-4 h-4" />
              查看全部
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">药品名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">所在药箱</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">当前库存</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最低库存</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">缺口</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {purchaseList.slice(0, 5).map(item => (
                  <tr key={item.medicineId} className="bg-red-50/50 hover:bg-red-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{item.medicineName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {BUILDING_NAMES[item.building]} - {item.cabinetName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-red-600 font-medium">{item.currentQuantity}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{item.minimumQuantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        -{item.gap}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
