import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { useStore } from '@/store/useStore';
import InspectionTable from '@/components/inspection/InspectionTable';

export default function InspectionList() {
  const navigate = useNavigate();
  const inspections = useStore((state) => state.inspections);
  const equipments = useStore((state) => state.equipments);

  const [filterEquipmentId, setFilterEquipmentId] = useState<string>('all');

  const filteredInspections = inspections.filter((inspection) => {
    if (filterEquipmentId === 'all') return true;
    return inspection.equipmentId === filterEquipmentId;
  });

  const getEquipmentCount = (equipmentId: string) => {
    if (equipmentId === 'all') return inspections.length;
    return inspections.filter((i) => i.equipmentId === equipmentId).length;
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">巡检记录</h1>
          <p className="text-sm text-gray-500 mt-1">管理所有巡检记录</p>
        </div>
        <button
          onClick={() => navigate('/inspections/new')}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新增巡检
        </button>
      </div>

      <div className="card animate-fadeInUp" style={{ animationDelay: '50ms' }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">设备筛选：</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterEquipmentId('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                filterEquipmentId === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
              <span className={`ml-1 ${
                filterEquipmentId === 'all' ? 'text-primary-100' : 'text-gray-400'
              }`}>
                ({getEquipmentCount('all')})
              </span>
            </button>
            {equipments.map((eq) => (
              <button
                key={eq.id}
                onClick={() => setFilterEquipmentId(eq.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  filterEquipmentId === eq.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {eq.code}
                <span className={`ml-1 ${
                  filterEquipmentId === eq.id ? 'text-primary-100' : 'text-gray-400'
                }`}>
                  ({getEquipmentCount(eq.id)})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <InspectionTable inspections={filteredInspections} equipments={equipments} />
    </div>
  );
}
