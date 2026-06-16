import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  MapPin,
  Calendar,
  Gauge,
  Tag,
  Clock,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { useDeviceStore } from '@/store/deviceStore';
import { useInspectionStore } from '@/store/inspectionStore';
import { useRectificationStore } from '@/store/rectificationStore';
import { formatDate, daysUntil, isExpired, isExpiringSoon } from '@/utils/date';

export function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDeviceById } = useDeviceStore();
  const { getInspectionsByDeviceId } = useInspectionStore();
  const { getRectificationsByDeviceId } = useRectificationStore();

  const device = getDeviceById(id || '');
  const inspections = id ? getInspectionsByDeviceId(id) : [];
  const rectifications = id ? getRectificationsByDeviceId(id) : [];

  if (!device) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-gray-500">设备不存在</p>
        <button
          onClick={() => navigate('/devices')}
          className="mt-4 text-red-600 hover:underline"
        >
          返回设备列表
        </button>
      </div>
    );
  }

  const expireStatus = isExpired(device.expireDate)
    ? 'danger'
    : isExpiringSoon(device.expireDate)
    ? 'warning'
    : 'normal';

  const days = daysUntil(device.expireDate);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/devices')}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{device.code}</h2>
          <p className="text-sm text-gray-500">{device.type}</p>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => navigate(`/devices/${device.id}/edit`)}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <Edit className="h-4 w-4" />
            编辑
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 overflow-hidden rounded-xl bg-gray-100">
              <img
                src={device.photo}
                alt={device.code}
                className="h-48 w-full object-cover"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">设备状态</span>
                <StatusBadge status={device.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">有效期状态</span>
                <StatusBadge status={expireStatus} />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-gray-900">基本信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                  <Tag className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">设备编号</p>
                  <p className="font-medium text-gray-900">{device.code}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">设备类型</p>
                  <p className="font-medium text-gray-900">{device.type}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
                  <MapPin className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">安装位置</p>
                  <p className="font-medium text-gray-900">
                    {device.building} {device.floor} {device.location}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
                  <Gauge className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">压力范围</p>
                  <p className="font-medium text-gray-900">
                    {device.minPressure} - {device.maxPressure} MPa
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                  <Calendar className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">有效期至</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(device.expireDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">剩余天数</p>
                  <p className={`font-medium ${
                    days <= 0 ? 'text-red-600' : days <= 30 ? 'text-amber-600' : 'text-gray-900'
                  }`}>
                    {days > 0 ? `${days} 天` : '已过期'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">历史巡检记录</h3>
              <Link
                to="/inspections/new"
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                + 新增巡检
              </Link>
            </div>
            <div className="space-y-3">
              {inspections.length > 0 ? (
                inspections.slice(0, 5).map(inspection => (
                  <div
                    key={inspection.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        inspection.result === 'normal' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {inspection.result === 'normal' ? (
                          <FileText className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(inspection.inspectDate)}
                        </p>
                        <p className="text-xs text-gray-500">
                          检查人: {inspection.inspector} · 压力: {inspection.pressure}MPa
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={inspection.result === 'normal' ? 'normal' : 'danger'} />
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-gray-400">暂无巡检记录</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-gray-900">整改记录</h3>
            <div className="space-y-3">
              {rectifications.length > 0 ? (
                rectifications.slice(0, 3).map(rect => (
                  <div
                    key={rect.id}
                    className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {rect.description}
                      </span>
                      <StatusBadge status={rect.status} />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      创建时间: {formatDate(rect.createDate)} · 处理人: {rect.handler}
                    </p>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-gray-400">暂无整改记录</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
