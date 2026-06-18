import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Camera, Package, Heart, Recycle, AlertTriangle, Droplets } from 'lucide-react';
import { Modal } from '../../components/Modal';
import type { SortingItem, SortingCategory, DropRecord } from '../../types';
import { useSortingRecordsStore } from '../../store/sortingRecords';
import { useDropRecordsStore } from '../../store/dropRecords';
import { useRecoveryPointsStore } from '../../store/recoveryPoints';
import { getCategoryText, getCategoryColor } from '../../utils/formatters';
import { calculateTotalWeight, estimateBagWeight } from '../../utils/calculations';

interface SortingFormProps {
  isOpen: boolean;
  onClose: () => void;
  dropRecord?: DropRecord | null;
}

const categoryConfigs = [
  { value: 'donatable' as SortingCategory, label: '可捐赠', icon: Heart, color: 'emerald' },
  { value: 'recyclable' as SortingCategory, label: '可再生', icon: Recycle, color: 'blue' },
  { value: 'damaged' as SortingCategory, label: '破损报废', icon: AlertTriangle, color: 'red' },
  { value: 'needs_cleaning' as SortingCategory, label: '需清洗', icon: Droplets, color: 'yellow' },
];

export const SortingForm: React.FC<SortingFormProps> = ({ isOpen, onClose, dropRecord }) => {
  const { addSortingRecord } = useSortingRecordsStore();
  const { updateDropRecord } = useDropRecordsStore();
  const { recoveryPoints } = useRecoveryPointsStore();

  const [sorter, setSorter] = useState('');
  const [items, setItems] = useState<Omit<SortingItem, 'id'>[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<SortingCategory>('donatable');
  const [weightKg, setWeightKg] = useState('');
  const [destination, setDestination] = useState('');
  const [partnerOrg, setPartnerOrg] = useState('');
  const [problemPhotoUrl, setProblemPhotoUrl] = useState('');
  const [remark, setRemark] = useState('');

  useEffect(() => {
    if (dropRecord && isOpen) {
      updateDropRecord(dropRecord.id, { status: 'sorting' });
    }
  }, [dropRecord, isOpen, updateDropRecord]);

  const resetForm = () => {
    setSorter('');
    setItems([]);
    setSelectedCategory('donatable');
    setWeightKg('');
    setDestination('');
    setPartnerOrg('');
    setProblemPhotoUrl('');
    setRemark('');
  };

  const handleAddItem = () => {
    if (!weightKg || parseFloat(weightKg) <= 0) {
      alert('请输入有效的重量');
      return;
    }
    if (!destination) {
      alert('请输入去向');
      return;
    }

    const newItem: Omit<SortingItem, 'id'> = {
      category: selectedCategory,
      weightKg: parseFloat(weightKg),
      destination,
      partnerOrg,
      problemPhotoUrl: problemPhotoUrl || undefined,
      remark: remark || undefined,
    };

    setItems([...items, newItem]);
    setWeightKg('');
    setDestination('');
    setPartnerOrg('');
    setProblemPhotoUrl('');
    setRemark('');
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!dropRecord) return;
    if (!sorter.trim()) {
      alert('请输入分拣人员');
      return;
    }
    if (items.length === 0) {
      alert('请至少添加一项分拣记录');
      return;
    }

    const estimatedWeight = estimateBagWeight(dropRecord.bagCount);
    const totalSortedWeight = calculateTotalWeight(items as SortingItem[]);
    
    if (Math.abs(totalSortedWeight - estimatedWeight) > estimatedWeight * 0.3) {
      if (!confirm(`分拣总重量(${totalSortedWeight.toFixed(1)}kg)与预估重量(${estimatedWeight}kg)相差较大，确定提交吗？`)) {
        return;
      }
    }

    addSortingRecord({
      recoveryPointId: dropRecord.recoveryPointId,
      dropRecordId: dropRecord.id,
      sorter: sorter.trim(),
      items,
    });

    resetForm();
    onClose();
  };

  const handleClose = () => {
    if (dropRecord) {
      updateDropRecord(dropRecord.id, { status: 'pending' });
    }
    resetForm();
    onClose();
  };

  const getRecoveryPointName = (id: string) => {
    return recoveryPoints.find(p => p.id === id)?.name || '未知回收点';
  };

  const totalWeight = calculateTotalWeight(items as SortingItem[]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">分拣处理</h3>
        <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {dropRecord && (
        <div className="bg-gradient-to-r from-primary-50 to-earth-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-primary-600" />
            <span className="font-medium text-gray-900">投放记录信息</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">回收点：</span>
              <span className="text-gray-900 font-medium">{getRecoveryPointName(dropRecord.recoveryPointId)}</span>
            </div>
            <div>
              <span className="text-gray-500">袋数：</span>
              <span className="text-gray-900 font-medium">{dropRecord.bagCount} 袋</span>
            </div>
            <div>
              <span className="text-gray-500">预估重量：</span>
              <span className="text-gray-900 font-medium">{estimateBagWeight(dropRecord.bagCount)} kg</span>
            </div>
            <div>
              <span className="text-gray-500">捐赠人：</span>
              <span className="text-gray-900 font-medium">{dropRecord.contributor || '匿名'}</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">分拣人员</label>
          <input
            type="text"
            value={sorter}
            onChange={(e) => setSorter(e.target.value)}
            placeholder="请输入分拣人员姓名"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-medium text-gray-900 mb-4">添加分拣项</h4>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            {categoryConfigs.map(config => {
              const Icon = config.icon;
              return (
                <button
                  key={config.value}
                  onClick={() => setSelectedCategory(config.value)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    selectedCategory === config.value
                      ? `border-${config.color}-500 bg-${config.color}-50`
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${getCategoryColor(config.value)} bg-opacity-20`}>
                    <Icon className={`w-5 h-5 ${getCategoryColor(config.value).replace('bg-', 'text-')}`} />
                  </div>
                  <span className="font-medium text-gray-900">{config.label}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">重量 (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="0.0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">去向</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="如：捐赠给XX机构"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">合作机构</label>
              <input
                type="text"
                value={partnerOrg}
                onChange={(e) => setPartnerOrg(e.target.value)}
                placeholder="如：红十字会"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">问题照片链接</label>
              <input
                type="text"
                value={problemPhotoUrl}
                onChange={(e) => setProblemPhotoUrl(e.target.value)}
                placeholder="可选"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="可选，记录其他问题..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <button
            onClick={handleAddItem}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            添加此项
          </button>
        </div>

        {items.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">已添加的分拣项</h4>
              <span className="text-sm text-gray-500">
                总重量：<span className="font-bold text-primary-600">{totalWeight.toFixed(1)} kg</span>
              </span>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(item.category)}`} />
                    <div>
                      <div className="font-medium text-gray-900">
                        {getCategoryText(item.category)} · {item.weightKg.toFixed(1)} kg
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.destination} {item.partnerOrg && `· ${item.partnerOrg}`}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-200"
          >
            完成分拣
          </button>
        </div>
      </div>
    </Modal>
  );
};
