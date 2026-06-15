import React, { useMemo } from 'react';
import { ShoppingCart, AlertTriangle, Building2, Package } from 'lucide-react';
import { useMedicineStore } from '@/store/useMedicineStore';
import { useCabinetStore } from '@/store/useCabinetStore';
import { useNavigate } from 'react-router-dom';
import { BUILDING_NAMES, type BuildingType } from '@/types';

export const PurchaseList: React.FC = () => {
  const navigate = useNavigate();
  const getPurchaseList = useMedicineStore(state => state.getPurchaseList);
  const getExpiringSoon = useMedicineStore(state => state.getExpiringSoon);
  const cabinets = useCabinetStore(state => state.cabinets);
  
  const purchaseList = useMemo(() => getPurchaseList(), [getPurchaseList]);
  const expiringSoon = useMemo(() => getExpiringSoon(30), [getExpiringSoon]);
  
  const getCabinetName = (cabinetId: string) => {
    return cabinets.find(c => c.id === cabinetId)?.name || cabinetId;
  };
  
  const groupedByBuilding = useMemo(() => {
    const groups = new Map<BuildingType, typeof purchaseList>();
    
    purchaseList.forEach(item => {
      if (!groups.has(item.building)) {
        groups.set(item.building, []);
      }
      groups.get(item.building)!.push(item);
    });
    
    return Array.from(groups.entries());
  }, [purchaseList]);
  
  const totalGap = useMemo(() => {
    return purchaseList.reduce((sum, item) => sum + item.gap, 0);
  }, [purchaseList]);
  
  return (
    <div className="space-y-8 pb-8">
      <div className="animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">采购清单</h2>
        <p className="text-gray-500">低于最低库存的药品汇总，按楼栋分类展示</p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center text-white">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">待采购品类</p>
              <p className="text-2xl font-bold text-gray-900">{purchaseList.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-5 shadow-sm animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-white">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">总缺口数量</p>
              <p className="text-2xl font-bold text-gray-900">{totalGap}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-5 shadow-sm animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">即将过期</p>
              <p className="text-2xl font-bold text-gray-900">{expiringSoon.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-5 shadow-sm animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">涉及楼栋</p>
              <p className="text-2xl font-bold text-gray-900">{groupedByBuilding.length}</p>
            </div>
          </div>
        </div>
      </div>
      
      {purchaseList.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm animate-fade-in">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">库存充足</h3>
          <p className="text-gray-500">所有药品库存均在最低数量以上，无需采购</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByBuilding.map(([building, items], buildingIndex) => (
            <div 
              key={building} 
              className="bg-white rounded-2xl shadow-sm overflow-hidden animate-slide-up"
              style={{ animationDelay: `${(buildingIndex + 1) * 0.1}s` }}
            >
              <div className="px-6 py-4 bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-primary-600" />
                    <h3 className="font-semibold text-gray-900">{BUILDING_NAMES[building]}</h3>
                  </div>
                  <span className="bg-white text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                    {items.length} 项待采购
                  </span>
                </div>
              </div>
              
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">药品名称</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">所在药箱</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">当前库存</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最低库存</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">缺口</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map(item => (
                    <tr key={item.medicineId} className="bg-red-50/30 hover:bg-red-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">{item.medicineName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{item.cabinetName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-red-600 font-medium">{item.currentQuantity}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{item.minimumQuantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          -{item.gap}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/cabinet/${item.cabinetId}`)}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          查看药箱
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
      
      {expiringSoon.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            即将过期药品（30天内）
          </h3>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">药品名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">所在药箱</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">批号</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">有效期</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">当前库存</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expiringSoon.map(medicine => (
                  <tr key={medicine.id} className="bg-amber-50/30 hover:bg-amber-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{medicine.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {getCabinetName(medicine.cabinetId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-mono text-sm">{medicine.batchNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-amber-600 font-medium">{medicine.expiryDate}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{medicine.currentQuantity}</td>
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
