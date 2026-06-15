import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Camera, History } from 'lucide-react';
import { useCabinetStore } from '@/store/useCabinetStore';
import { useMedicineStore } from '@/store/useMedicineStore';
import { useRecordStore } from '@/store/useRecordStore';
import { MedicineCard } from '@/components/MedicineCard';
import { UsageModal } from '@/components/UsageModal';
import { SupplyModal } from '@/components/SupplyModal';
import type { Medicine } from '@/types';
import { formatDateTime } from '@/utils/dateUtils';
import { getMedicineStatus } from '@/utils/statusUtils';
import { BUILDING_NAMES } from '@/types';

export const CabinetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const getCabinetById = useCabinetStore(state => state.getCabinetById);
  const getMedicinesByCabinet = useMedicineStore(state => state.getMedicinesByCabinet);
  const getRecordsByCabinet = useRecordStore(state => state.getRecordsByCabinet);
  
  const [usageModalOpen, setUsageModalOpen] = useState(false);
  const [supplyModalOpen, setSupplyModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [activeTab, setActiveTab] = useState<'medicines' | 'records'>('medicines');
  
  const cabinet = id ? getCabinetById(id) : null;
  const medicines = id ? getMedicinesByCabinet(id) : [];
  const records = id ? getRecordsByCabinet(id) : null;
  
  const sortedMedicines = useMemo(() => {
    return [...medicines].sort((a, b) => {
      const statusOrder = { expired: 0, insufficient: 1, low: 2, sufficient: 3 };
      const statusA = getMedicineStatus(a);
      const statusB = getMedicineStatus(b);
      return statusOrder[statusA] - statusOrder[statusB];
    });
  }, [medicines]);
  
  const handleUse = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setUsageModalOpen(true);
  };
  
  const handleSupply = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setSupplyModalOpen(true);
  };
  
  if (!cabinet) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-500 mb-4">药箱不存在</p>
        <button
          onClick={() => navigate('/')}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          返回首页
        </button>
      </div>
    );
  }
  
  const allRecords = useMemo(() => {
    if (!records) return [];
    return [
      ...records.usage.map(r => ({ ...r, type: 'usage' as const })),
      ...records.supply.map(r => ({ ...r, type: 'supply' as const })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [records]);
  
  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-4 animate-fade-in">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{cabinet.name}</h2>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{BUILDING_NAMES[cabinet.building]} · {cabinet.location}</span>
          </div>
        </div>
      </div>
      
      {cabinet.photos.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <Camera className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">箱内照片</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {cabinet.photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`药箱照片 ${index + 1}`}
                className="w-32 h-32 object-cover rounded-xl flex-shrink-0"
              />
            ))}
          </div>
        </div>
      )}
      
      <div className="flex gap-2 bg-white rounded-xl p-1 w-fit shadow-sm">
        <button
          onClick={() => setActiveTab('medicines')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'medicines'
              ? 'bg-primary-500 text-white shadow'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          药品清单 ({medicines.length})
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'records'
              ? 'bg-primary-500 text-white shadow'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <History className="w-4 h-4 inline mr-1" />
          操作记录 ({allRecords.length})
        </button>
      </div>
      
      {activeTab === 'medicines' && (
        <div className="grid md:grid-cols-2 gap-4">
          {sortedMedicines.map((medicine, index) => (
            <div key={medicine.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
              <MedicineCard
                medicine={medicine}
                onUse={handleUse}
                onSupply={handleSupply}
              />
            </div>
          ))}
        </div>
      )}
      
      {activeTab === 'records' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">药品</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作人</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">备注</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allRecords.map(record => {
                const medicine = medicines.find(m => m.id === record.medicineId);
                return (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDateTime(record.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.type === 'usage'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {record.type === 'usage' ? '领用' : '补给'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {medicine?.name || '未知药品'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={record.type === 'usage' ? 'text-red-600' : 'text-green-600'}>
                        {record.type === 'usage' ? '-' : '+'}{record.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {record.type === 'usage' ? record.operator : record.supplier}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {record.type === 'usage' ? record.purpose : record.source}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {allRecords.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              暂无操作记录
            </div>
          )}
        </div>
      )}
      
      <UsageModal
        isOpen={usageModalOpen}
        onClose={() => setUsageModalOpen(false)}
        medicine={selectedMedicine}
        cabinetId={cabinet.id}
      />
      
      <SupplyModal
        isOpen={supplyModalOpen}
        onClose={() => setSupplyModalOpen(false)}
        medicine={selectedMedicine}
        cabinetId={cabinet.id}
      />
    </div>
  );
};
