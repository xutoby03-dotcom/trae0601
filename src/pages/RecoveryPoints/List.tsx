import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Phone,
  User,
  Calendar,
  Search,
  Filter,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { CapacityProgress } from '../../components/CapacityProgress';
import { RecoveryPointForm } from './Form';
import { useRecoveryPointsStore } from '../../store/recoveryPoints';
import { useDropRecordsStore } from '../../store/dropRecords';
import { useSortingRecordsStore } from '../../store/sortingRecords';
import type { RecoveryPoint } from '../../types';
import { formatDate, formatPhone } from '../../utils/formatters';
import { Modal } from '../../components/Modal';

export const RecoveryPointsList: React.FC = () => {
  const { recoveryPoints, deleteRecoveryPoint } = useRecoveryPointsStore();
  const { getRecordsByRecoveryPoint } = useDropRecordsStore();
  const { getRecordsByRecoveryPoint: getSortingRecords } = useSortingRecordsStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editPoint, setEditPoint] = useState<RecoveryPoint | null>(null);
  const [detailPoint, setDetailPoint] = useState<RecoveryPoint | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredPoints = recoveryPoints.filter(point => {
    const matchesSearch = point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      point.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      point.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || point.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (point: RecoveryPoint) => {
    setEditPoint(point);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个回收点吗？')) {
      deleteRecoveryPoint(id);
    }
  };

  const handleAdd = () => {
    setEditPoint(null);
    setIsFormOpen(true);
  };

  const statusFilters = [
    { value: 'all', label: '全部' },
    { value: 'normal', label: '正常' },
    { value: 'warning', label: '容量预警' },
    { value: 'full', label: '满箱' },
    { value: 'exception', label: '异常' },
  ];

  return (
    <div>
      <PageHeader
        title="回收点档案"
        description="管理所有回收点的基础信息"
        icon={MapPin}
        actions={
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-200"
          >
            <Plus className="w-4 h-4" />
            新增回收点
          </button>
        }
      />

      {/* 筛选和搜索 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索回收点名称、位置、负责人..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <div className="flex flex-wrap gap-2">
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

      {/* 回收点列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPoints.map((point, index) => {
          const dropRecords = getRecordsByRecoveryPoint(point.id);
          const sortingRecords = getSortingRecords(point.id);
          
          return (
            <div
              key={point.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-300 group animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* 卡片头部 - 图片 */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={point.photoUrl}
                  alt={point.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-4 right-4">
                  <StatusBadge status={point.status} />
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg font-semibold text-white mb-1">{point.name}</h3>
                  <p className="text-sm text-white/80 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {point.location}
                  </p>
                </div>
              </div>

              {/* 卡片内容 */}
              <div className="p-5">
                {/* 容量进度 */}
                <div className="mb-4">
                  <CapacityProgress point={point} />
                </div>

                {/* 基本信息 */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>负责人：{point.manager}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>电话：{formatPhone(point.phone)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>清运：{point.collectionSchedule}</span>
                  </div>
                </div>

                {/* 统计信息 */}
                <div className="flex items-center justify-between py-3 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{dropRecords.length}</p>
                    <p className="text-xs text-gray-500">投放记录</p>
                  </div>
                  <div className="w-px h-10 bg-gray-200" />
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{sortingRecords.length}</p>
                    <p className="text-xs text-gray-500">分拣记录</p>
                  </div>
                  <div className="w-px h-10 bg-gray-200" />
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(point.updatedAt).split(' ')[0]}
                    </p>
                    <p className="text-xs text-gray-500">更新时间</p>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setDetailPoint(point)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    详情
                  </button>
                  <button
                    onClick={() => handleEdit(point)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(point.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    删除
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPoints.length === 0 && (
        <div className="text-center py-16">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">暂无符合条件的回收点</p>
          <p className="text-gray-400 text-sm mt-2">尝试调整搜索条件或新增回收点</p>
        </div>
      )}

      {/* 表单弹窗 */}
      <RecoveryPointForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        editPoint={editPoint}
      />

      {/* 详情弹窗 */}
      <Modal
        isOpen={!!detailPoint}
        onClose={() => setDetailPoint(null)}
        title="回收点详情"
        size="lg"
      >
        {detailPoint && (
          <div>
            <div className="flex gap-6 mb-6">
              <img
                src={detailPoint.photoUrl}
                alt={detailPoint.name}
                className="w-48 h-48 rounded-xl object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">{detailPoint.name}</h3>
                  <StatusBadge status={detailPoint.status} />
                </div>
                <p className="text-gray-600 mb-4">{detailPoint.location}</p>
                <CapacityProgress point={detailPoint} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">负责人</p>
                <p className="font-medium text-gray-900">{detailPoint.manager}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">联系电话</p>
                <p className="font-medium text-gray-900">{detailPoint.phone}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">设计容量</p>
                <p className="font-medium text-gray-900">{detailPoint.capacityKg} kg</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">清运时间</p>
                <p className="font-medium text-gray-900">{detailPoint.collectionSchedule}</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex-1 text-center">
                <p className="text-2xl font-semibold text-primary-600">
                  {getRecordsByRecoveryPoint(detailPoint.id).length}
                </p>
                <p className="text-sm text-gray-500">投放记录</p>
              </div>
              <div className="w-px bg-gray-200" />
              <div className="flex-1 text-center">
                <p className="text-2xl font-semibold text-blue-600">
                  {getSortingRecords(detailPoint.id).length}
                </p>
                <p className="text-sm text-gray-500">分拣记录</p>
              </div>
              <div className="w-px bg-gray-200" />
              <div className="flex-1 text-center">
                <p className="text-2xl font-semibold text-gray-600">
                  {formatDate(detailPoint.createdAt).split(' ')[0]}
                </p>
                <p className="text-sm text-gray-500">创建时间</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
