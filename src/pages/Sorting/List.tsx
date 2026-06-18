import React, { useState } from 'react';
import { Filter, Search, MapPin, Clock, User, Shirt, Check, X, Package, Eye, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { SortingForm } from './Form';
import { useDropRecordsStore } from '../../store/dropRecords';
import { useSortingRecordsStore } from '../../store/sortingRecords';
import { useRecoveryPointsStore } from '../../store/recoveryPoints';
import { formatDate, getCategoryText, getCategoryColor } from '../../utils/formatters';
import { estimateBagWeight } from '../../utils/calculations';
import { calculateTotalWeight } from '../../utils/calculations';
import type { DropRecord, SortingItem } from '../../types';
import { Modal } from '../../components/Modal';

type TabType = 'pending' | 'completed';

export const SortingList: React.FC = () => {
  const { dropRecords, updateDropRecord, deleteDropRecord } = useDropRecordsStore();
  const { sortingRecords, deleteSortingRecord } = useSortingRecordsStore();
  const { recoveryPoints } = useRecoveryPointsStore();

  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDropRecord, setSelectedDropRecord] = useState<DropRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSortingRecord, setSelectedSortingRecord] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [recoveryPointFilter, setRecoveryPointFilter] = useState<string>('all');

  const getRecoveryPointName = (id: string) => {
    return recoveryPoints.find(p => p.id === id)?.name || '未知回收点';
  };

  const pendingRecords = dropRecords.filter(r => r.status === 'pending' || r.status === 'sorting');
  const filteredPending = pendingRecords.filter(record => {
    const pointName = getRecoveryPointName(record.recoveryPointId);
    const matchesSearch = pointName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.contributor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.clothingTypes.some(t => t.includes(searchTerm));
    const matchesPoint = recoveryPointFilter === 'all' || record.recoveryPointId === recoveryPointFilter;
    return matchesSearch && matchesPoint;
  });

  const filteredSorting = sortingRecords.filter(record => {
    const pointName = getRecoveryPointName(record.recoveryPointId);
    const dropRecord = dropRecords.find(d => d.id === record.dropRecordId);
    const contributor = dropRecord?.contributor || '';
    const matchesSearch = pointName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contributor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.sorter.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPoint = recoveryPointFilter === 'all' || record.recoveryPointId === recoveryPointFilter;
    return matchesSearch && matchesPoint;
  });

  const sortedPending = [...filteredPending].sort(
    (a, b) => new Date(b.dropTime).getTime() - new Date(a.dropTime).getTime()
  );

  const sortedCompleted = [...filteredSorting].sort(
    (a, b) => new Date(b.sortingTime).getTime() - new Date(a.sortingTime).getTime()
  );

  const handleStartSorting = (record: DropRecord) => {
    setSelectedDropRecord(record);
    setIsFormOpen(true);
  };

  const handleViewDetail = (record: any) => {
    setSelectedSortingRecord(record);
    setIsDetailOpen(true);
  };

  const tabs = [
    { value: 'pending' as TabType, label: '待分拣', count: pendingRecords.length },
    { value: 'completed' as TabType, label: '分拣记录', count: sortingRecords.length },
  ];

  const totalPendingBags = pendingRecords.reduce((sum, r) => sum + r.bagCount, 0);
  const totalSortedWeight = sortingRecords.reduce((sum, r) => sum + calculateTotalWeight(r.items as SortingItem[]), 0);

  return (
    <div>
      <PageHeader
        title="分拣处理"
        description="按类别分拣旧衣物，记录重量和去向"
        icon={Package}
      />

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">待分拣记录</p>
          <p className="text-2xl font-bold text-orange-600">{pendingRecords.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">待分拣袋数</p>
          <p className="text-2xl font-bold text-primary-600">{totalPendingBags}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">已分拣重量</p>
          <p className="text-2xl font-bold text-emerald-600">{totalSortedWeight.toFixed(1)} kg</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">分拣记录数</p>
          <p className="text-2xl font-bold text-blue-600">{sortingRecords.length}</p>
        </div>
      </div>

      {/* 筛选和搜索 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索回收点、捐赠人、分拣人员..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={recoveryPointFilter}
              onChange={(e) => setRecoveryPointFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">全部回收点</option>
              {recoveryPoints.map(point => (
                <option key={point.id} value={point.id}>{point.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.value
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab.value ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 待分拣列表 */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    回收点
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    袋数/重量
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    衣物类型
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    清洗状态
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    捐赠人
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    投放时间
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedPending.map((record, index) => (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50 transition-colors animate-fade-in-up"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {getRecoveryPointName(record.recoveryPointId)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-900 font-medium">{record.bagCount} 袋</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-500">{estimateBagWeight(record.bagCount)} kg</span>
                        {record.hasShoesBagsToys && (
                          <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                            含鞋包
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {record.clothingTypes.map((type, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full"
                          >
                            <Shirt className="w-3 h-3" />
                            {type}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {record.isCleaned ? (
                          <>
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-green-700 text-sm">已清洗</span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 text-orange-500" />
                            <span className="text-orange-700 text-sm">未清洗</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{record.contributor || '匿名'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500 text-sm">{formatDate(record.dropTime)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {record.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStartSorting(record)}
                              className="px-3 py-1.5 bg-primary-100 text-primary-700 text-sm rounded-lg hover:bg-primary-200 transition-colors font-medium"
                            >
                              开始分拣
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('确定要删除这条投放记录吗？')) {
                                  deleteDropRecord(record.id);
                                }
                              }}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {record.status === 'sorting' && (
                          <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-lg font-medium">
                            分拣中...
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedPending.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">暂无待分拣记录</p>
              <p className="text-gray-400 text-sm mt-2">所有投放记录已完成分拣</p>
            </div>
          )}
        </div>
      )}

      {/* 分拣记录 */}
      {activeTab === 'completed' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    回收点
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    分拣人员
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    总重量
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    分拣类别
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    分拣时间
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedCompleted.map((record, index) => {
                  const totalWeight = calculateTotalWeight(record.items as SortingItem[]);
                  const categories = [...new Set(record.items.map((item: SortingItem) => item.category))];
                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-gray-50 transition-colors animate-fade-in-up"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {getRecoveryPointName(record.recoveryPointId)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{record.sorter}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900 font-medium">{totalWeight.toFixed(1)} kg</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {categories.map((cat, i) => (
                            <span
                              key={i}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full text-white ${getCategoryColor(cat)}`}
                            >
                              {getCategoryText(cat)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500 text-sm">{formatDate(record.sortingTime)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetail(record)}
                            className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('确定要删除这条分拣记录吗？删除后关联的投放记录将恢复为待分拣状态。')) {
                                const dropRecord = dropRecords.find(d => d.id === record.dropRecordId);
                                if (dropRecord) {
                                  updateDropRecord(record.dropRecordId, { status: 'pending' });
                                }
                                deleteSortingRecord(record.id);
                              }
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {sortedCompleted.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">暂无分拣记录</p>
              <p className="text-gray-400 text-sm mt-2">点击"开始分拣"处理待分拣记录</p>
            </div>
          )}
        </div>
      )}

      {/* 分拣表单弹窗 */}
      <SortingForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedDropRecord(null);
        }}
        dropRecord={selectedDropRecord}
      />

      {/* 分拣详情弹窗 */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedSortingRecord(null);
        }}
        size="lg"
      >
        {selectedSortingRecord && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">分拣记录详情</h3>
              <button
                onClick={() => {
                  setIsDetailOpen(false);
                  setSelectedSortingRecord(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="bg-gradient-to-r from-primary-50 to-earth-50 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">回收点：</span>
                  <span className="text-gray-900 font-medium">{getRecoveryPointName(selectedSortingRecord.recoveryPointId)}</span>
                </div>
                <div>
                  <span className="text-gray-500">分拣人员：</span>
                  <span className="text-gray-900 font-medium">{selectedSortingRecord.sorter}</span>
                </div>
                <div>
                  <span className="text-gray-500">分拣时间：</span>
                  <span className="text-gray-900 font-medium">{formatDate(selectedSortingRecord.sortingTime)}</span>
                </div>
                <div>
                  <span className="text-gray-500">总重量：</span>
                  <span className="text-gray-900 font-medium">{calculateTotalWeight(selectedSortingRecord.items as SortingItem[]).toFixed(1)} kg</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">分拣明细</h4>
              {selectedSortingRecord.items.map((item: SortingItem, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-white rounded-xl border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getCategoryColor(item.category)}`} />
                      <span className="font-medium text-gray-900">{getCategoryText(item.category)}</span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {item.weightKg.toFixed(1)} kg
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1 ml-5">
                    <p>去向：{item.destination}</p>
                    {item.partnerOrg && <p>合作机构：{item.partnerOrg}</p>}
                    {item.remark && <p className="text-gray-500">备注：{item.remark}</p>}
                    {item.problemPhotoUrl && (
                      <div className="mt-2">
                        <span className="text-gray-500">问题照片：</span>
                        <img
                          src={item.problemPhotoUrl}
                          alt="问题照片"
                          className="mt-1 w-32 h-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
