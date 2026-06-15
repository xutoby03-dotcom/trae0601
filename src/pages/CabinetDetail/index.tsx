import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Camera, History, Search, X } from 'lucide-react';
import { useCabinetStore } from '@/store/useCabinetStore';
import { useMedicineStore } from '@/store/useMedicineStore';
import { useRecordStore } from '@/store/useRecordStore';
import { MedicineCard } from '@/components/MedicineCard';
import { UsageModal } from '@/components/UsageModal';
import { SupplyModal } from '@/components/SupplyModal';
import type { Medicine, MedicineStatus } from '@/types';
import { formatDateTime, isExpiringSoon } from '@/utils/dateUtils';
import { getMedicineStatus } from '@/utils/statusUtils';
import { BUILDING_NAMES, STATUS_LABELS } from '@/types';

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
  const [statusFilter, setStatusFilter] = useState<'all' | MedicineStatus | 'expiringSoon'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  
  const cabinet = id ? getCabinetById(id) : null;
  const medicines = id ? getMedicinesByCabinet(id) : [];
  const records = id ? getRecordsByCabinet(id) : null;
  
  const statusCounts = useMemo(() => {
    const counts = {
      all: medicines.length,
      insufficient: 0,
      low: 0,
      expiringSoon: 0,
      expired: 0,
    };
    medicines.forEach(m => {
      const status = getMedicineStatus(m);
      if (status === 'insufficient') counts.insufficient++;
      if (status === 'low') counts.low++;
      if (status === 'expired') counts.expired++;
      if (isExpiringSoon(m.expiryDate) && status !== 'expired') counts.expiringSoon++;
    });
    return counts;
  }, [medicines]);
  
  const filteredMedicines = useMemo(() => {
    let result = [...medicines];
    
    if (statusFilter !== 'all') {
      if (statusFilter === 'expiringSoon') {
        result = result.filter(m => isExpiringSoon(m.expiryDate) && !m.isExpired);
      } else {
        result = result.filter(m => getMedicineStatus(m) === statusFilter);
      }
    }
    
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase().trim();
      result = result.filter(m => 
        m.name.toLowerCase().includes(keyword) ||
        m.specification.toLowerCase().includes(keyword)
      );
    }
    
    return result.sort((a, b) => {
      const statusOrder = { expired: 0, insufficient: 1, low: 2, sufficient: 3 };
      const statusA = getMedicineStatus(a);
      const statusB = getMedicineStatus(b);
      return statusOrder[statusA] - statusOrder[statusB];
    });
  }, [medicines, statusFilter, searchKeyword]);
  
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
        <>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
            <div className="flex flex-wrap gap-1 bg-white rounded-xl p-1 shadow-sm flex-1">
              {[
                { key: 'all', label: '全部', count: statusCounts.all },
                { key: 'insufficient', label: '缺货', count: statusCounts.insufficient },
                { key: 'low', label: '偏低', count: statusCounts.low },
                { key: 'expiringSoon', label: '快过期', count: statusCounts.expiringSoon },
                { key: 'expired', label: '过期', count: statusCounts.expired },
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => setStatusFilter(item.key as typeof statusFilter)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    statusFilter === item.key
                      ? 'bg-primary-500 text-white shadow'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                  <span className={`ml-1 text-xs ${
                    statusFilter === item.key ? 'text-white/80' : 'text-gray-400'
                  }`}>
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索药品名或规格..."
                className="w-full sm:w-60 pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {filteredMedicines.map((medicine, index) => (
              <div key={medicine.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                <MedicineCard
                  medicine={medicine}
                  onUse={handleUse}
                  onSupply={handleSupply}
                />
              </div>
            ))}
          </div>
          
          {filteredMedicines.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <p className="text-gray-400">没有找到匹配的药品</p>
              {(statusFilter !== 'all' || searchKeyword) && (
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchKeyword('');
                  }}
                  className="mt-2 text-primary-500 text-sm hover:text-primary-600"
                >
                  清除筛选条件
                </button>
              )}
            </div>
          )}
        </>
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
