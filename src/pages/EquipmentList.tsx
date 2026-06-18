import { Refrigerator } from 'lucide-react';
import { useStore } from '@/store/useStore';
import EquipmentCard from '@/components/equipment/EquipmentCard';

export default function EquipmentList() {
  const { equipments, probes, maintenances } = useStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary-100">
          <Refrigerator className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">设备档案</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            管理所有发酵箱设备信息
            <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              共 {equipments.length} 台设备
            </span>
          </p>
        </div>
      </div>

      {equipments.length === 0 ? (
        <div className="card text-center py-16">
          <Refrigerator className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无设备</h3>
          <p className="text-gray-500 text-sm">设备数据加载中...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {equipments.map((equipment, index) => (
            <div
              key={equipment.id}
              className="animate-fadeInUp animate-stagger"
              style={{ '--stagger': index } as React.CSSProperties}
            >
              <EquipmentCard
                equipment={equipment}
                probes={probes}
                maintenances={maintenances}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
