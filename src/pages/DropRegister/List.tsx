import React, { useState } from 'react';
import { PackagePlus, Plus, Search, Filter, Shirt, Check, X, MapPin, Clock, User, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { DropRegisterForm } from './Form';
import { useDropRecordsStore } from '../../store/dropRecords';
import { useRecoveryPointsStore } from '../../store/recoveryPoints';
import { formatDate } from '../../utils/formatters';
import { estimateBagWeight } from '../../utils/calculations';

export const DropRegisterList: React.FC = () => {
  const { dropRecords, deleteDropRecord } = useDropRecordsStore();
  const { recoveryPoints } = useRecoveryPointsStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [recoveryPointFilter, setRecoveryPointFilter] = useState<string>('all');

  const getRecoveryPointName = (id: string) => {
    return recoveryPoints.find(p => p.id === id)?.name || '未知回收点';
  };

  const filteredRecords = dropRecords.filter(record => {
    const pointName = getRecoveryPointName(record.recoveryPointId);
    const matchesSearch = pointName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.contributor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.clothingTypes.some(t => t.includes(searchTerm));
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesPoint = recoveryPointFilter === 'all' || record.recoveryPointId === recoveryPointFilter;
    return matchesSearch && matchesStatus && matchesPoint;
  });

  const sortedRecords = [...filteredRecords].sort(
    (a, b) => new Date(b.dropTime).getTime() - new Date(a.dropTime).getTime()
  );

  const statusFilters = [
    { value: 'all', label: '全部' },
    { value: 'pending', label: '待分拣' },
    { value: 'sorting', label: '分拣中' },
    { value: 'completed', label: '已完成' },
  ];

  return (
    <div>
      <PageHeader
        title="投放登记"
        description="管理居民投放的旧衣记录"
        icon={PackagePlus}
        actions={
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-200"
          >
            <Plus className="w-4 h-4" />
            新增登记
          </button>
        }
      />

      {/* 筛选和搜索 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索回收点、捐赠人、衣物类型..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex items-center gap-4 flex-wrap">
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
          <div className="flex gap-2">
            {statusFilters.map(filter => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                  statusFilter === filter.value
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">总投放记录</p>
          <p className="text-2xl font-bold text-gray-900">{dropRecords.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">待分拣</p>
          <p className="text-2xl font-bold text-orange-600">
            {dropRecords.filter(r => r.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">分拣中</p>
          <p className="text-2xl font-bold text-blue-600">
            {dropRecords.filter(r => r.status === 'sorting').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">总投放袋数</p>
          <p className="text-2xl font-bold text-primary-600">
            {dropRecords.reduce((sum, r) => sum + r.bagCount, 0)}
          </p>
        </div>
      </div>

      {/* 投放记录列表 */}
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
              {sortedRecords.map((record, index) => (
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
                    {record.status === 'pending' && (
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
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedRecords.length === 0 && (
          <div className="text-center py-16">
            <PackagePlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">暂无投放记录</p>
            <p className="text-gray-400 text-sm mt-2">点击右上角按钮新增投放登记</p>
          </div>
        )}
      </div>

      {/* 表单弹窗 */}
      <DropRegisterForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
};
