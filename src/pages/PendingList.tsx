import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Check, Package, Shirt, AlertTriangle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ClothingCard from '@/components/shared/ClothingCard';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { useStore } from '@/store/useStore';

export default function PendingList() {
  const navigate = useNavigate();
  const clothes = useStore((state) => state.clothes);
  const processPendingClothing = useStore((state) => state.processPendingClothing);
  const boxes = useStore((state) => state.boxes);
  const [selectedClothingId, setSelectedClothingId] = useState<string | null>(null);

  const pendingClothes = clothes.filter(c => c.status === 'pending');

  const handleProcess = (clothingId: string, boxId?: string) => {
    processPendingClothing(clothingId, boxId);
    setSelectedClothingId(null);
  };

  return (
    <Layout title="待处理区" showBack>
      <div className="space-y-4">
        <div className="card p-4 bg-amber-50 border-amber-100">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800 mb-1">待清洗衣物</h3>
              <p className="text-sm text-amber-700">
                以下衣物还未清洗，清洗完成后可标记处理并入箱
              </p>
            </div>
          </div>
        </div>

        {pendingClothes.length > 0 ? (
          <div className="space-y-3">
            {pendingClothes.map((clothing) => (
              <div key={clothing.id} className="relative">
                <ClothingCard clothing={clothing} />
                <button
                  onClick={() => setSelectedClothingId(
                    selectedClothingId === clothing.id ? null : clothing.id
                  )}
                  className="mt-3 w-full py-2.5 bg-sage-500 text-white rounded-xl font-medium hover:bg-sage-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  标记已清洗
                </button>

                {selectedClothingId === clothing.id && (
                  <div className="mt-3 card p-4 animate-fade-in-up">
                    <h4 className="font-medium text-warm-700 mb-3">选择入箱</h4>
                    {boxes.length > 0 ? (
                      <div className="space-y-2 mb-3">
                        {boxes.map((box) => (
                          <button
                            key={box.id}
                            onClick={() => handleProcess(clothing.id, box.id)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-warm-50 hover:bg-warm-100 transition-colors"
                          >
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: box.labelColor + '30' }}
                            >
                              <span className="text-xs font-bold" style={{ color: box.labelColor }}>
                                {box.code}
                              </span>
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-medium text-warm-800 text-sm">{box.location}</p>
                            </div>
                            <Package size={16} className="text-warm-400" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-warm-400 mb-3">还没有箱子</p>
                    )}
                    <button
                      onClick={() => handleProcess(clothing.id)}
                      className="w-full py-2 border border-warm-200 text-warm-600 rounded-xl text-sm hover:bg-warm-50 transition-colors"
                    >
                      暂不入箱，仅标记清洗
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Clock}
            title="待处理区空空如也"
            description="所有衣物都已清洗并归档，真棒！"
          />
        )}

        {pendingClothes.length > 0 && (
          <div className="text-center">
            <button
              onClick={() => navigate('/clothes/new')}
              className="btn-secondary"
            >
              继续添加衣物
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
