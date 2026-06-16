import { useState } from 'react';
import { Coffee, ArrowLeft, Check } from 'lucide-react';
import { useCoffeeStore } from '../store/useCoffeeStore';
import { GrinderCard } from '../components/GrinderCard';
import { Modal } from '../components/Modal';
import { getFlavorStatus } from '../utils/flavorUtils';
import { StatusBadge } from '../components/StatusBadge';
import type { CoffeeBean } from '../types';

export function GrinderView() {
  const { grinders, beans, dispenseCoffee, bindGrinder, getBeanById } = useCoffeeStore();
  const [showBindModal, setShowBindModal] = useState(false);
  const [selectedGrinderId, setSelectedGrinderId] = useState<string | null>(null);
  const [selectedBeanId, setSelectedBeanId] = useState<string | null>(null);

  const handleBind = (grinderId: string) => {
    const grinder = grinders.find((g) => g.id === grinderId);
    setSelectedGrinderId(grinderId);
    setSelectedBeanId(grinder?.beanId || null);
    setShowBindModal(true);
  };

  const handleConfirmBind = () => {
    if (selectedGrinderId && selectedBeanId) {
      bindGrinder(selectedGrinderId, selectedBeanId);
    }
    setShowBindModal(false);
  };

  const handleDispense = (grinderId: string, grams: number) => {
    dispenseCoffee(grinderId, grams);
  };

  const availableBeans = beans.filter((b) => b.remainingWeight > 0);
  const selectedGrinder = grinders.find((g) => g.id === selectedGrinderId);

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 -ml-2 rounded-lg text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-stone-800">磨豆机面板</h1>
                <p className="text-sm text-stone-500">出杯扣减 · 豆仓绑定</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {grinders.map((grinder) => {
            const bean = grinder.beanId ? getBeanById(grinder.beanId) : undefined;
            return (
              <GrinderCard
                key={grinder.id}
                grinder={grinder}
                bean={bean}
                onDispense={(grams) => handleDispense(grinder.id, grams)}
                onBind={() => handleBind(grinder.id)}
              />
            );
          })}
        </div>
      </main>

      <Modal
        isOpen={showBindModal}
        onClose={() => setShowBindModal(false)}
        title="绑定豆仓"
        size="md"
      >
        <div className="space-y-3">
          <p className="text-sm text-stone-500 mb-4">
            为 <span className="font-medium text-stone-700">{selectedGrinder?.name}</span> 选择要绑定的咖啡豆
          </p>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {availableBeans.map((bean: CoffeeBean) => {
              const isSelected = selectedBeanId === bean.id;
              const status = getFlavorStatus(bean);
              return (
                <button
                  key={bean.id}
                  onClick={() => setSelectedBeanId(bean.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-stone-800">{bean.name}</span>
                        <StatusBadge status={status} size="sm" />
                      </div>
                      <p className="text-xs text-stone-500 mb-2">{bean.origin}</p>
                      <p className="text-sm font-medium text-stone-700">
                        剩余 {bean.remainingWeight}g
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleConfirmBind}
            disabled={!selectedBeanId}
            className="w-full py-3 mt-4 bg-stone-800 text-white font-medium rounded-lg hover:bg-stone-900 active:scale-98 transition-all disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed"
          >
            确认绑定
          </button>
        </div>
      </Modal>
    </div>
  );
}
