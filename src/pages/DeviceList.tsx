import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, MapPin, ShoppingBag, Calendar } from 'lucide-react';
import { useFilterStore } from '../store';
import { formatDateDisplay, calculateRemainingDays } from '../utils/dateUtils';

export default function DeviceList() {
  const { devices, deleteDevice, getLatestRecordByDeviceId, getInventoryByModel } = useFilterStore();

  const handleDelete = (id: string, location: string) => {
    if (window.confirm(`确定要删除 "${location}" 的设备吗？相关的更换记录也会被删除。`)) {
      deleteDevice(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-800">设备档案</h1>
          <p className="text-gray-500 mt-1">管理您的所有净水设备信息</p>
        </div>
        <Link to="/devices/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-5 h-5" />
          添加设备
        </Link>
      </div>

      {devices.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary-50 flex items-center justify-center mb-6">
            <MapPin className="w-10 h-10 text-primary-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">暂无设备</h3>
          <p className="text-gray-500 mb-6">点击上方按钮添加您的第一台净水设备</p>
          <Link to="/devices/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            添加设备
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {devices.map((device) => {
            const latestRecord = getLatestRecordByDeviceId(device.id);
            const inventory = getInventoryByModel(device.filterModel);
            const remainingDays = latestRecord
              ? calculateRemainingDays(latestRecord.expectedExpireDate)
              : null;

            let statusClass = 'border-gray-200';
            let statusBadge = null;

            if (remainingDays !== null) {
              if (remainingDays < 15) {
                statusClass = 'border-danger-300';
                statusBadge = <span className="badge-danger">急需更换</span>;
              } else if (remainingDays <= 30) {
                statusClass = 'border-warning-300';
                statusBadge = <span className="badge-warning">即将到期</span>;
              } else {
                statusClass = 'border-success-300';
                statusBadge = <span className="badge-success">运行正常</span>;
              }
            }

            return (
              <div
                key={device.id}
                className={`card-border ${statusClass} overflow-hidden group`}
              >
                <div className="aspect-video bg-gray-100 relative overflow-hidden -m-6 mb-4">
                  <img
                    src={device.photoUrl}
                    alt={device.location}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">{statusBadge}</div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{device.location}</h3>
                    <p className="text-sm text-gray-500">{device.brand} · {device.filterModel}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-primary-400" />
                      <span>建议周期：{device.suggestCycleDays}天</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <ShoppingBag className="w-4 h-4 text-primary-400" />
                      <span>库存：{inventory?.quantity ?? 0}件</span>
                    </div>
                  </div>

                  {latestRecord && remainingDays !== null && (
                    <div className="p-3 rounded-xl bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">剩余使用</span>
                        <span
                          className={`font-bold ${
                            remainingDays < 15
                              ? 'text-danger-500'
                              : remainingDays <= 30
                              ? 'text-warning-500'
                              : 'text-success-600'
                          }`}
                        >
                          {remainingDays < 0 ? `已过期${Math.abs(remainingDays)}天` : `${remainingDays}天`}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        上次更换：{formatDateDisplay(latestRecord.installDate)}
                      </div>
                    </div>
                  )}

                  {device.notes && (
                    <p className="text-sm text-gray-500 line-clamp-2">{device.notes}</p>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <Link
                      to={`/devices/${device.id}`}
                      className="flex-1 btn-ghost text-center inline-flex items-center justify-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      详情
                    </Link>
                    <Link
                      to={`/devices/${device.id}/edit`}
                      className="flex-1 btn-secondary text-center inline-flex items-center justify-center gap-1 !px-3 !py-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      编辑
                    </Link>
                    <button
                      onClick={() => handleDelete(device.id, device.location)}
                      className="p-2 rounded-xl text-gray-400 hover:text-danger-500 hover:bg-danger-50 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
