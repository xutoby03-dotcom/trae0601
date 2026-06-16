import { useState } from 'react';
import { Coffee, AlertTriangle, Calendar, Sparkles } from 'lucide-react';
import { useCoffeeStore } from '../store/useCoffeeStore';
import { BeanCard } from '../components/BeanCard';
import { Modal } from '../components/Modal';
import { getFlavorStatus, getFlavorStatusText } from '../utils/flavorUtils';
import { formatDateChinese, getToday } from '../utils/dateUtils';
import type { WasteType } from '../types';

export function BarView() {
  const { beans, setTodayPick, dispenseCoffee, recordWaste, grinders } = useCoffeeStore();
  const [selectedBean, setSelectedBean] = useState<string | null>(null);
  const [showWasteModal, setShowWasteModal] = useState(false);
  const [wasteType, setWasteType] = useState<WasteType>('试机');
  const [wasteWeight, setWasteWeight] = useState('');
  const [wasteNote, setWasteNote] = useState('');
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [dispenseGrams, setDispenseGrams] = useState('18');

  const todayPick = beans.find((b) => b.isTodayPick);
  const expiredCount = beans.filter((b) => getFlavorStatus(b) === 'expired').length;
  const nearExpiryCount = beans.filter((b) => getFlavorStatus(b) === 'nearExpiry').length;

  const sortedBeans = [...beans].sort((a, b) => {
    const statusOrder = { best: 0, nearExpiry: 1, resting: 2, expired: 3 };
    const statusA = statusOrder[getFlavorStatus(a)];
    const statusB = statusOrder[getFlavorStatus(b)];
    if (statusA !== statusB) return statusA - statusB;
    if (a.isTodayPick) return -1;
    if (b.isTodayPick) return 1;
    return b.remainingWeight - a.remainingWeight;
  });

  const handleSetPick = (beanId: string) => {
    setTodayPick(beanId);
  };

  const handleOpenWaste = (beanId: string) => {
    setSelectedBean(beanId);
    setWasteType('试机');
    setWasteWeight('');
    setWasteNote('');
    setShowWasteModal(true);
  };

  const handleSubmitWaste = () => {
    if (!selectedBean || !wasteWeight) return;
    recordWaste(selectedBean, wasteType, Number(wasteWeight), wasteNote);
    setShowWasteModal(false);
  };

  const handleOpenDispense = (beanId: string) => {
    setSelectedBean(beanId);
    setDispenseGrams('18');
    setShowDispenseModal(true);
  };

  const handleSubmitDispense = () => {
    if (!selectedBean || !dispenseGrams) return;
    const grinder = grinders.find((g) => g.beanId === selectedBean);
    if (grinder) {
      dispenseCoffee(grinder.id, Number(dispenseGrams));
    }
    setShowDispenseModal(false);
  };

  const bean = selectedBean ? beans.find((b) => b.id === selectedBean) : null;

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-stone-800">风味窗口</h1>
                <p className="text-sm text-stone-500">吧台豆子状态总览</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-stone-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">{formatDateChinese(getToday())}</span>
              </div>

              {todayPick && (
                <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-4 py-2 rounded-full">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-700">
                    今日主推：{todayPick.name}
                  </span>
                </div>
              )}

              {(expiredCount > 0 || nearExpiryCount > 0) && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 px-4 py-2 rounded-full">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {expiredCount > 0 && `${expiredCount} 支超期`}
                    {expiredCount > 0 && nearExpiryCount > 0 && ' · '}
                    {nearExpiryCount > 0 && `${nearExpiryCount} 支临期`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {sortedBeans.map((bean, index) => (
            <div
              key={bean.id}
              className="animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <BeanCard
                bean={bean}
                onSetPick={() => handleSetPick(bean.id)}
                onDispense={() => handleOpenDispense(bean.id)}
                onRecordWaste={() => handleOpenWaste(bean.id)}
              />
            </div>
          ))}
        </div>
      </main>

      <Modal
        isOpen={showWasteModal}
        onClose={() => setShowWasteModal(false)}
        title="记录损耗"
        size="md"
      >
        {bean && (
          <div className="space-y-4">
            <div className="p-3 bg-stone-50 rounded-lg">
              <p className="font-medium text-stone-800">{bean.name}</p>
              <p className="text-sm text-stone-500">
                剩余 {bean.remainingWeight}g · {getFlavorStatusText(getFlavorStatus(bean))}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                损耗类型
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['试机', '撒漏', '校磨'] as WasteType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setWasteType(type)}
                    className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                      wasteType === type
                        ? 'bg-stone-800 text-white border-stone-800'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                损耗克数 (g)
              </label>
              <input
                type="number"
                value={wasteWeight}
                onChange={(e) => setWasteWeight(e.target.value)}
                placeholder="请输入克数"
                className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent text-lg font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                备注（可选）
              </label>
              <textarea
                value={wasteNote}
                onChange={(e) => setWasteNote(e.target.value)}
                placeholder="补充说明..."
                rows={2}
                className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent resize-none"
              />
            </div>

            <button
              onClick={handleSubmitWaste}
              disabled={!wasteWeight || Number(wasteWeight) <= 0}
              className="w-full py-3 bg-stone-800 text-white font-medium rounded-lg hover:bg-stone-900 active:scale-98 transition-all disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed"
            >
              确认记录
            </button>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showDispenseModal}
        onClose={() => setShowDispenseModal(false)}
        title="出杯扣减"
        size="sm"
      >
        {bean && (
          <div className="space-y-4">
            <div className="p-3 bg-stone-50 rounded-lg">
              <p className="font-medium text-stone-800">{bean.name}</p>
              <p className="text-sm text-stone-500">
                剩余 {bean.remainingWeight}g
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                扣减克数 (g)
              </label>
              <div className="flex gap-2 mb-3">
                {[18, 36, 20].map((g) => (
                  <button
                    key={g}
                    onClick={() => setDispenseGrams(String(g))}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${
                      dispenseGrams === String(g)
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {g}g
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={dispenseGrams}
                onChange={(e) => setDispenseGrams(e.target.value)}
                className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent text-lg font-medium"
              />
            </div>

            <button
              onClick={handleSubmitDispense}
              disabled={!dispenseGrams || Number(dispenseGrams) <= 0 || Number(dispenseGrams) > bean.remainingWeight}
              className="w-full py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 active:scale-98 transition-all disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed"
            >
              确认扣减
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
