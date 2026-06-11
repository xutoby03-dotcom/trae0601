import { useState } from 'react';
import { Package, RefreshCw } from 'lucide-react';
import EquipmentCard from '../components/EquipmentCard';
import FilterBar from '../components/FilterBar';
import RentalModal from '../components/RentalModal';
import { useRentalStore } from '../store/useStore';
import type { Equipment, EquipmentType, EquipmentStatus } from '../types';

export default function EquipmentList() {
  const { equipments, persons, rentalRecords, createRental, resetData } = useRentalStore();
  const [selectedType, setSelectedType] = useState<EquipmentType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<EquipmentStatus | 'all'>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredEquipments = equipments.filter((eq) => {
    if (selectedType !== 'all' && eq.type !== selectedType) return false;
    if (selectedStatus !== 'all' && eq.status !== selectedStatus) return false;
    return true;
  });

  const getCurrentUser = (equipmentId: string): string | undefined => {
    const activeRental = rentalRecords.find(
      (r) => r.equipmentId === equipmentId && !r.isReturned
    );
    return activeRental?.userName;
  };

  const handleRentClick = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsModalOpen(true);
  };

  const handleConfirmRent = (data: {
    userName: string;
    startDate: string;
    endDate: string;
    costShare: number;
    returnPerson: string;
  }) => {
    if (!selectedEquipment) return;
    createRental({
      ...data,
      equipmentId: selectedEquipment.id,
    });
  };

  const stats = {
    total: equipments.length,
    available: equipments.filter((e) => e.status === 'available').length,
    rented: equipments.filter((e) => e.status === 'rented').length,
    returned: equipments.filter((e) => e.status === 'returned').length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-100 rounded-xl">
              <Package className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">装备列表</h1>
              <p className="text-sm text-slate-500">共 {stats.total} 件装备</p>
            </div>
          </div>
          <button
            onClick={resetData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            重置数据
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-slate-500">总装备</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-slate-500">可认领</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.available}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-slate-500">使用中</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.rented}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-slate-500">已归还</p>
            <p className="text-2xl font-bold text-slate-400 mt-1">{stats.returned}</p>
          </div>
        </div>

        <FilterBar
          selectedType={selectedType}
          selectedStatus={selectedStatus}
          onTypeChange={setSelectedType}
          onStatusChange={setSelectedStatus}
        />

        {filteredEquipments.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400">暂无符合条件的装备</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEquipments.map((equipment) => (
              <EquipmentCard
                key={equipment.id}
                equipment={equipment}
                onRent={equipment.status === 'available' ? () => handleRentClick(equipment) : undefined}
                currentUser={getCurrentUser(equipment.id)}
              />
            ))}
          </div>
        )}

        {selectedEquipment && (
          <RentalModal
            equipment={selectedEquipment}
            persons={persons}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleConfirmRent}
          />
        )}
      </div>
    </div>
  );
}
