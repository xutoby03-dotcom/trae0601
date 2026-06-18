import { useState, useMemo } from 'react';
import { AlertTriangle, Package, Coffee, DollarSign, TrendingUp } from 'lucide-react';
import { useCoffeeStore } from '../store/useCoffeeStore';
import { useSupplyStore } from '../store/useSupplyStore';
import { usePurchaseStore } from '../store/usePurchaseStore';
import { FlavorCard } from '../components/ui/FlavorCard';
import { Modal } from '../components/ui/Modal';
import { ConsumeForm } from '../components/ui/ConsumeForm';
import { useToast } from '../components/ui/Toast';
import type { FlavorWithStock } from '../types';

export function Dashboard() {
  const [selectedFlavor, setSelectedFlavor] = useState<FlavorWithStock | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const flavorsWithStock = useCoffeeStore((state) => state.getAllFlavorsWithStock());
  const lowStockFlavors = useCoffeeStore((state) => state.getLowStockFlavors());
  const lowStockSupplies = useSupplyStore((state) => state.getLowStockSupplies());
  const consumeCoffee = useCoffeeStore((state) => state.consumeCoffee);
  const autoGeneratePurchaseList = usePurchaseStore((state) => state.autoGeneratePurchaseList);
  const { showToast } = useToast();

  const stats = useMemo(() => {
    const totalStock = flavorsWithStock.reduce((sum, f) => sum + f.totalStock, 0);
    const totalFlavors = flavorsWithStock.filter((f) => f.stockStatus !== 'out_of_stock').length;
    const totalValue = flavorsWithStock.reduce((sum, f) => sum + f.totalStock * f.unitPrice, 0);
    const today = new Date().toDateString();
    const todayConsumption = useCoffeeStore.getState().logs
      .filter((log) => new Date(log.consumedAt).toDateString() === today)
      .reduce((sum, log) => sum + log.quantity, 0);

    return { totalStock, totalFlavors, totalValue, todayConsumption };
  }, [flavorsWithStock]);

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

  const allLowStock = [...lowStockFlavors, ...lowStockSupplies];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-coffee-900 mb-2">库存总览</h1>
          <p className="text-coffee-500">实时查看咖啡胶囊和配套物品库存状态</p>
        </div>
      </div>

      {allLowStock.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-accent-orange/30 rounded-xl p-5 animate-pulse-slow">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-accent-orange/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-accent-orange" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-coffee-900 mb-2">库存预警</h3>
              <p className="text-sm text-coffee-600 mb-3">
                以下品项库存已低于安全线，请及时采购：
              </p>
              <div className="flex flex-wrap gap-2">
                {allLowStock.slice(0, 5).map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center px-3 py-1 bg-white rounded-full text-sm text-coffee-700 border border-coffee-200"
                  >
                    {item.name}
                    <span className="ml-2 text-accent-orange font-medium">
                      {'totalStock' in item ? item.totalStock : item.quantity} 件
                    </span>
                  </span>
                ))}
                {allLowStock.length > 5 && (
                  <span className="inline-flex items-center px-3 py-1 bg-white rounded-full text-sm text-coffee-500 border border-coffee-200">
                    +{allLowStock.length - 5} 项
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-coffee-100 rounded-xl flex items-center justify-center">
              <Coffee className="w-6 h-6 text-coffee-700" />
            </div>
            <div>
              <p className="text-sm text-coffee-500">总库存</p>
              <p className="font-display text-2xl font-bold text-coffee-900">{stats.totalStock} 颗</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-accent-green" />
            </div>
            <div>
              <p className="text-sm text-coffee-500">可用口味</p>
              <p className="font-display text-2xl font-bold text-coffee-900">{stats.totalFlavors} 种</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-coffee-500">库存价值</p>
              <p className="font-display text-2xl font-bold text-coffee-900">¥{stats.totalValue.toFixed(0)}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-accent-orange" />
            </div>
            <div>
              <p className="text-sm text-coffee-500">今日取用</p>
              <p className="font-display text-2xl font-bold text-coffee-900">{stats.todayConsumption} 颗</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display text-2xl font-bold text-coffee-900 mb-4">咖啡库存</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {flavorsWithStock.map((flavor, index) => (
            <FlavorCard
              key={flavor.id}
              flavor={flavor}
              index={index}
              onConsume={() => handleConsume(flavor)}
            />
          ))}
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
