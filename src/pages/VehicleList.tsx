import { Link } from 'react-router-dom';
import { Car, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { useVehicleStore } from '@/store/useVehicleStore';
import { useInspectionStore } from '@/store/useInspectionStore';
import { useInstallationStore } from '@/store/useInstallationStore';
import { useSeatStore } from '@/store/useSeatStore';
import VehicleCard from '@/components/common/VehicleCard';
import { getAllVehicleRecheckInfo } from '@/utils/statistics';

export default function VehicleList() {
  const { vehicles } = useVehicleStore();
  const { seats } = useSeatStore();
  const { installations } = useInstallationStore();
  const { inspections } = useInspectionStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVehicles = vehicles.filter(v => 
    v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recheckInfo = getAllVehicleRecheckInfo(vehicles, installations, inspections, seats);

  const getVehicleInfo = (vehicleId: string) => {
    return recheckInfo.find(info => info.vehicle.id === vehicleId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-500">车辆管理</h1>
          <p className="text-gray-500 mt-1">
            共 {vehicles.length} 辆车
          </p>
        </div>
        <Link to="/vehicles/new" className="btn-primary w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          新增车辆
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="搜索车辆品牌、型号或车牌号..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-10"
        />
      </div>

      {filteredVehicles.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? '未找到匹配的车辆' : '暂无车辆档案'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery ? '请尝试其他搜索关键词' : '添加您的第一辆车开始使用'}
          </p>
          <Link to="/vehicles/new" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            新增车辆
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((vehicle, index) => {
            const info = getVehicleInfo(vehicle.id);
            return (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                lastInspectionDate={info?.lastInspection?.date}
                daysSinceLastInspection={info?.daysSinceLastInspection}
                status={info?.status || 'normal'}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
