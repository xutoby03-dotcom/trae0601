import { useState } from 'react';
import { useStore } from '../store/useStore';
import { CleaningRecordItem } from '../components/CleaningRecordItem';
import { Droplets, Plus, X, User, MapPin, FileText } from 'lucide-react';
import { getToday } from '../utils/dateUtils';
import type { CleaningRecord } from '../types';

export const CleaningRecords = () => {
  const { cleaningRecords, getBathroomById, addCleaningRecord, bathrooms } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<Omit<CleaningRecord, 'id' | 'daysUnhandled'>>>({
    bathroomId: '',
    cleaningDate: getToday(),
    cleanedBy: '',
    dryingLocation: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.bathroomId || !newRecord.cleanedBy || !newRecord.dryingLocation) return;

    addCleaningRecord({
      bathroomId: newRecord.bathroomId,
      cleaningDate: newRecord.cleaningDate || getToday(),
      cleanedBy: newRecord.cleanedBy,
      dryingLocation: newRecord.dryingLocation,
      notes: newRecord.notes || '',
    });

    setShowAddForm(false);
    setNewRecord({
      bathroomId: '',
      cleaningDate: getToday(),
      cleanedBy: '',
      dryingLocation: '',
      notes: '',
    });
  };

  const sortedRecords = [...cleaningRecords].sort(
    (a, b) => new Date(b.cleaningDate).getTime() - new Date(a.cleaningDate).getTime()
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">清洗记录</h2>
          <p className="text-gray-600">
            记录每次清洗信息，追踪清洗频率和晾干情况
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-all duration-300 hover:shadow-lg"
        >
          <Plus size={18} />
          新增记录
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">新增清洗记录</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择浴室
                </label>
                <select
                  value={newRecord.bathroomId}
                  onChange={(e) => setNewRecord((prev) => ({ ...prev, bathroomId: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors"
                  required
                >
                  <option value="">请选择浴室</option>
                  {bathrooms.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  清洗日期
                </label>
                <input
                  type="date"
                  value={newRecord.cleaningDate}
                  onChange={(e) => setNewRecord((prev) => ({ ...prev, cleaningDate: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-1" />
                  清洗人
                </label>
                <input
                  type="text"
                  value={newRecord.cleanedBy}
                  onChange={(e) => setNewRecord((prev) => ({ ...prev, cleanedBy: e.target.value }))}
                  placeholder="请输入清洗人姓名"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-1" />
                  晾干地点
                </label>
                <input
                  type="text"
                  value={newRecord.dryingLocation}
                  onChange={(e) => setNewRecord((prev) => ({ ...prev, dryingLocation: e.target.value }))}
                  placeholder="如：阳台晾晒区、卫生间通风处"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText size={16} className="inline mr-1" />
                  备注
                </label>
                <textarea
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="记录清洗方式、使用的清洁剂等信息"
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
              >
                保存记录
              </button>
            </form>
          </div>
        </div>
      )}

      {sortedRecords.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Droplets size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">暂无清洗记录</h3>
          <p className="text-gray-500">点击右上角按钮添加第一条清洗记录</p>
        </div>
      ) : (
        <div>
          {sortedRecords.map((record, index) => (
            <CleaningRecordItem
              key={record.id}
              record={record}
              bathroom={getBathroomById(record.bathroomId)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
