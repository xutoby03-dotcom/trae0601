import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Calendar, User, Package, Droplets, Wrench } from 'lucide-react';
import { useBoxStore } from '../store/useBoxStore';
import { useRiderStore } from '../store/useRiderStore';
import { useCleaningStore } from '../store/useCleaningStore';
import { useMaintenanceStore } from '../store/useMaintenanceStore';
import {
  BOX_STATUS_LABELS, USAGE_TYPE_LABELS, ISSUE_TYPE_LABELS, MAINTENANCE_STATUS_LABELS } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { formatDate, formatDateTime, getDaysSince } from '../utils/helpers';
import { getReplacementWarning, isFullyCleaned } from '../utils/businessRules';
import { AlertBanner } from '../components/ui/AlertBanner';

export function BoxDetail() {
  const { id } = useParams<{ id: string }>();
  const { boxes, fetchBoxes } = useBoxStore();
  const { riders, fetchRiders } = useRiderStore();
  const { cleaningRecords, fetchCleaningRecords } = useCleaningStore();
  const { maintenanceRecords, fetchMaintenanceRecords } = useMaintenanceStore();

  useEffect(() => {
    fetchBoxes();
    fetchRiders();
    fetchCleaningRecords();
    fetchMaintenanceRecords();
  }, [fetchBoxes, fetchRiders, fetchCleaningRecords, fetchMaintenanceRecords]);

  const box = boxes.find(b => b.id === id);
  const rider = riders.find(r => r.id === box?.riderId);
  const boxCleaningRecords = useCleaningStore.getState().getRecordsByBoxId(id || '');
  const boxMaintenanceRecords = useMaintenanceStore.getState().getRecordsByBoxId(id || '');

  if (!box) {
    return <div className="text-center py-12">
      <p className="text-gray-500">箱子不存在</p>
      <Link to="/boxes">
        <Button className="mt-4">返回列表</Button>
      </Link>
    </div>;
  }

  const warning = getReplacementWarning(box, maintenanceRecords);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/boxes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
            返回列表
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{box.boxNumber} 详情</h1>
        </div>
        <Link to={`/boxes/${box.id}/edit`}>
          <Button variant="secondary">
            <Edit2 className="w-4 h-4" />
            编辑
          </Button>
        </Link>
      </div>

      {warning.needsReplace && (
        <AlertBanner type="warning" title="更换预警" message={warning.reason} />
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Package className="w-4 h-4" />
                  箱子编号
                </div>
                <p className="text-lg font-semibold text-gray-900">{box.boxNumber}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  容量
                </div>
                <p className="text-lg font-semibold text-gray-900">{box.capacity}L</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  用途类型
                </div>
                <p className="text-lg font-semibold text-gray-900">{USAGE_TYPE_LABELS[box.usageType]}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  状态
                </div>
                <StatusBadge status={box.status} label={BOX_STATUS_LABELS[box.status]} />
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <User className="w-4 h-4" />
                  所属骑手
                </div>
                <p className="text-lg font-semibold text-gray-900">{rider?.name || '未分配'}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  购买日期
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(box.purchaseDate)}
                </p>
                <p className="text-sm text-gray-500">已使用 {getDaysSince(box.purchaseDate)} 天</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <Droplets className="w-5 h-5 inline mr-2" />
              最近清洁记录
            </h2>
            <div className="space-y-3">
              {boxCleaningRecords.slice(0, 5).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(record.cleaningDate)}
                    </p>
                    <p className="text-xs text-gray-500">
                      清洁人: {record.cleanedBy}
                    </p>
                  </div>
                  <div>
                    {isFullyCleaned(record) ? (
                      <StatusBadge status="active" label="清洁完成" />
                    ) : (
                      <StatusBadge status="pending_cleaning" label="部分清洁" />
                    )}
                  </div>
                </div>
              ))}
              {boxCleaningRecords.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">暂无清洁记录</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <Wrench className="w-5 h-5 inline mr-2" />
              维修记录
            </h2>
            <div className="space-y-3">
              {boxMaintenanceRecords.map((record) => (
                <div key={record.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {ISSUE_TYPE_LABELS[record.issueType]}
                    </span>
                    <StatusBadge status={record.status} label={MAINTENANCE_STATUS_LABELS[record.status]} />
                  </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(record.reportedDate)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{record.description}</p>
                  {record.resolution && (
                    <p className="text-sm text-gray-500 mt-1">
                      处理结果: {record.resolution}
                    </p>
                  )}
                </div>
              ))}
              {boxMaintenanceRecords.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">暂无维修记录</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">照片</h2>
            <img
              src={box.photoUrl}
              alt={box.boxNumber}
              className="w-full aspect-square rounded-lg object-cover"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">骑手信息</h2>
            {rider ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">姓名</p>
                  <p className="font-medium text-gray-900">{rider.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">员工编号</p>
                  <p className="font-medium text-gray-900">{rider.employeeId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">联系电话</p>
                  <p className="font-medium text-gray-900">{rider.phone}</p>
                </div>
              </div>
            ) : (
                <p className="text-sm text-gray-500">暂未分配骑手</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">创建信息</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">创建时间</span>
                <span className="text-gray-900">{formatDateTime(box.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
