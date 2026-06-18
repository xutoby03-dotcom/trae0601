import { useState, useMemo } from 'react';
import { Search, Filter, Clock, Building2 } from 'lucide-react';
import { useCoffeeStore } from '../store/useCoffeeStore';
import { useSupplyStore } from '../store/useSupplyStore';
import { usePurchaseStore } from '../store/usePurchaseStore';
import { FlavorCard } from '../components/ui/FlavorCard';
import { Modal } from '../components/ui/Modal';
import { ConsumeForm } from '../components/ui/ConsumeForm';
import { useToast } from '../components/ui/Toast';
import type { FlavorWithStock, ConsumptionLog } from '../types';
import { formatDateTime } from '../utils/date';

export function ConsumeRegister() {
  const [selectedFlavor, setSelectedFlavor] = useState<FlavorWithStock | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterDays, setFilterDays] = useState(7);

  const flavorsWithStock = useCoffeeStore((state) => state.getAllFlavorsWithStock());
  const logs = useCoffeeStore((state) => state.logs);
  const flavors = useCoffeeStore((state) => state.flavors);
  const departments = useSupplyStore((state) => state.departments);
  const consumeCoffee = useCoffeeStore((state) => state.consumeCoffee);
  const autoGeneratePurchaseList = usePurchaseStore((state) => state.autoGeneratePurchaseList);
  const { showToast } = useToast();

  const flavorMap = useMemo(() => {
    return new Map(flavors.map((f) => [f.id, f]));
  }, [flavors]);

  const filteredFlavors = useMemo(() => {
    if (!searchTerm) return flavorsWithStock;
    const term = searchTerm.toLowerCase();
    return flavorsWithStock.filter(
      (f) =>
        f.name.toLowerCase().includes(term) ||
        f.brand.toLowerCase().includes(term)
    );
  }, [flavorsWithStock, searchTerm]);

  const filteredLogs = useMemo(() => {
    const cutoff = new Date(Date.now() - filterDays * 24 * 60 * 60 * 1000);
    return logs
      .filter((log) => {
        const logDate = new Date(log.consumedAt);
        const dateMatch = logDate >= cutoff;
        const deptMatch = !filterDepartment || log.department === filterDepartment;
        return dateMatch && deptMatch;
      })
      .sort((a, b) => new Date(b.consumedAt).getTime() - new Date(a.consumedAt).getTime())
      .slice(0, 50);
  }, [logs, filterDays, filterDepartment]);

  const handleConsume = (flavor: FlavorWithStock) => {
    if (flavor.stockStatus === 'out_of_stock' || flavor.stockStatus === 'expired' || flavor.stockStatus === 'damp') {
      showToast('error', '该口味当前无法取用');
      return;
    }
    setSelectedFlavor(flavor);
    setIsModalOpen(true);
  };

  const handleConsumeSubmit = (quantity: number, department: string) => {
    if (!selectedFlavor) return;
    
    const result = consumeCoffee(selectedFlavor.id, quantity, department);
    if (result.success) {
      showToast('success', result.message);
      setIsModalOpen(false);
      setSelectedFlavor(null);
      
      const updatedFlavor = useCoffeeStore.getState().getFlavorWithStock(selectedFlavor.id);
      if (updatedFlavor && updatedFlavor.stockStatus === 'low') {
        autoGeneratePurchaseList();
        showToast('info', '库存已低于安全线，已自动加入采购清单');
      }
    } else {
      showToast('error', result.message);
    }
  };

  const hotFlavors = useMemo(() => {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const consumptionMap = new Map<string, number>();
    
    logs
      .filter((log) => new Date(log.consumedAt) >= last30Days)
      .forEach((log) => {
        const current = consumptionMap.get(log.flavorId) || 0;
        consumptionMap.set(log.flavorId, current + log.quantity);
      });

    return [...consumptionMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([flavorId, count]) => {
        const flavor = flavorsWithStock.find((f) => f.id === flavorId);
        return { flavor, count };
      })
      .filter((item) => item.flavor);
  }, [logs, flavorsWithStock]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold text-coffee-900 mb-2">取用登记</h1>
        <p className="text-coffee-500">选择咖啡口味，登记部门后快速取用</p>
      </div>

      {hotFlavors.length > 0 && (
        <div className="bg-gradient-to-r from-coffee-50 to-orange-50 rounded-xl p-6 border border-coffee-100">
          <h3 className="font-bold text-coffee-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            本月热门口味
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hotFlavors.map((item, index) => (
              <div
                key={item.flavor!.id}
                onClick={() => handleConsume(item.flavor!)}
                className="bg-white rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all border border-coffee-100"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-cream-100">
                    <img
                      src={item.flavor!.boxPhoto}
                      alt={item.flavor!.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-accent-orange text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-coffee-900">{item.flavor!.name}</p>
                  <p className="text-sm text-coffee-500">本月消耗 {item.count} 颗</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-bold text-coffee-800">
                    {item.flavor!.totalStock}
                  </p>
                  <p className="text-xs text-coffee-500">库存</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-display text-2xl font-bold text-coffee-900 mb-4">选择口味</h2>
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-coffee-400" />
          <input
            type="text"
            placeholder="搜索口味名称或品牌..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-12"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFlavors.map((flavor, index) => (
            <FlavorCard
              key={flavor.id}
              flavor={flavor}
              index={index}
              onConsume={() => handleConsume(flavor)}
            />
          ))}
        </div>
        {filteredFlavors.length === 0 && (
          <p className="text-center text-coffee-500 py-12">没有找到匹配的口味</p>
        )}
      </div>

      <div>
        <h2 className="font-display text-2xl font-bold text-coffee-900 mb-4">取用记录</h2>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-coffee-500" />
            <select
              value={filterDays}
              onChange={(e) => setFilterDays(parseInt(e.target.value))}
              className="select w-auto"
            >
              <option value={1}>最近 1 天</option>
              <option value={7}>最近 7 天</option>
              <option value={30}>最近 30 天</option>
              <option value={90}>最近 90 天</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-coffee-500" />
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="select w-auto"
            >
              <option value="">全部部门</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-50 border-b border-coffee-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-coffee-700">
                    <Clock className="w-4 h-4 inline mr-2" />
                    时间
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-coffee-700">口味</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-coffee-700">数量</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-coffee-700">
                    <Building2 className="w-4 h-4 inline mr-2" />
                    部门
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-coffee-700">金额</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-50">
                {filteredLogs.map((log: ConsumptionLog) => {
                  const flavor = flavorMap.get(log.flavorId);
                  return (
                    <tr key={log.id} className="hover:bg-cream-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-coffee-600">
                        {formatDateTime(log.consumedAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-cream-100">
                            {flavor && (
                              <img
                                src={flavor.boxPhoto}
                                alt={flavor.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <span className="font-medium text-coffee-900">
                            {flavor?.name || '未知口味'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-coffee-600">{log.quantity} 颗</td>
                      <td className="px-6 py-4 text-sm text-coffee-600">{log.department}</td>
                      <td className="px-6 py-4 text-sm text-coffee-900 font-medium text-right">
                        ¥{((flavor?.unitPrice || 0) * log.quantity).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredLogs.length === 0 && (
            <p className="text-center text-coffee-500 py-12">暂无取用记录</p>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedFlavor(null);
        }}
        title="取用咖啡"
        size="md"
      >
        {selectedFlavor && (
          <ConsumeForm
            flavor={selectedFlavor}
            onSubmit={handleConsumeSubmit}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedFlavor(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
