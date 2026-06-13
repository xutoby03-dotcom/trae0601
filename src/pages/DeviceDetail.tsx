import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Plus, MapPin, ShoppingBag, Calendar, User, Tag, DollarSign, Clock, Package } from 'lucide-react';
import { useFilterStore } from '../store';
import { formatDateDisplay, calculateRemainingDays } from '../utils/dateUtils';

export default function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDeviceById, getRecordsByDeviceId, getInventoryByModel, deleteDevice, deleteRecord } = useFilterStore();

  const device = id ? getDeviceById(id) : undefined;
  const records = id ? getRecordsByDeviceId(id) : [];
  const inventory = device ? getInventoryByModel(device.filterModel) : undefined;
  const latestRecord = records.length > 0 ? records[0] : undefined;
  const remainingDays = latestRecord ? calculateRemainingDays(latestRecord.expectedExpireDate) : null;

  if (!device) {
    return (
      <div className="card text-center py-16">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">设备不存在</h3>
        <Link to="/devices" className="btn-primary inline-flex items-center gap-2 mt-4">
          <ArrowLeft className="w-5 h-5" />
          返回设备列表
        </Link>
      </div>
    );
  }

  const handleDeleteDevice = () => {
    if (window.confirm(`确定要删除 "${device.location}" 的设备吗？相关的更换记录也会被删除。`)) {
      deleteDevice(device.id);
      navigate('/devices');
    }
  };

  const handleDeleteRecord = (recordId: string) => {
    if (window.confirm('确定要删除这条更换记录吗？库存将自动返还。')) {
      deleteRecord(recordId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/devices" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-display text-gray-800">{device.location}</h1>
            <p className="text-gray-500 mt-1">{device.brand} · {device.filterModel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/devices/${device.id}/edit`}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            编辑
          </Link>
          <button
            onClick={handleDeleteDevice}
            className="btn-danger inline-flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="card overflow-hidden p-0">
            <div className="aspect-square bg-gray-100">
              <img
                src={device.photoUrl}
                alt={device.location}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-50">
                  <MapPin className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">安装位置</p>
                  <p className="font-medium text-gray-800">{device.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-50">
                  <Tag className="w-5 h-5 text-violet-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">滤芯型号</p>
                  <p className="font-medium text-gray-800">{device.filterModel}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-50">
                  <Calendar className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">建议更换周期</p>
                  <p className="font-medium text-gray-800">{device.suggestCycleDays} 天</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50">
                  <ShoppingBag className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">购买渠道</p>
                  <p className="font-medium text-gray-800">{device.purchaseChannel}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-50">
                  <DollarSign className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">当前库存</p>
                  <p className={`font-medium ${inventory && inventory.quantity <= 1 ? 'text-danger-500' : 'text-gray-800'}`}>
                    {inventory?.quantity ?? 0} 件
                    {inventory && inventory.quantity <= 1 && <span className="text-xs ml-2">（库存不足）</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {remainingDays !== null && (
            <div className={`card-border ${
              remainingDays < 15 ? 'border-danger-300 bg-danger-50/50' :
              remainingDays <= 30 ? 'border-warning-300 bg-warning-50/50' :
              'border-success-300 bg-success-50/50'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <Clock className={`w-5 h-5 ${
                  remainingDays < 15 ? 'text-danger-500' :
                  remainingDays <= 30 ? 'text-warning-500' :
                  'text-success-500'
                }`} />
                <h3 className="font-semibold text-gray-800">滤芯状态</h3>
              </div>
              <p className={`text-3xl font-bold ${
                remainingDays < 15 ? 'text-danger-500' :
                remainingDays <= 30 ? 'text-warning-500' :
                'text-success-600'
              }`}>
                {remainingDays < 0 ? `已过期 ${Math.abs(remainingDays)} 天` : `剩余 ${remainingDays} 天`}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                预计到期日：{formatDateDisplay(latestRecord!.expectedExpireDate)}
              </p>
              <div className="h-2 bg-white rounded-full overflow-hidden mt-4">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    remainingDays < 15 ? 'bg-danger-500' :
                    remainingDays <= 30 ? 'bg-warning-500' :
                    'bg-success-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, (remainingDays / device.suggestCycleDays) * 100))}%` }}
                />
              </div>
            </div>
          )}

          {device.notes && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-2">备注</h3>
              <p className="text-gray-600">{device.notes}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg text-gray-800">更换记录</h3>
              <Link
                to="/records/new"
                state={{ deviceId: device.id }}
                className="btn-primary inline-flex items-center gap-2 !py-2 !px-4 text-sm"
              >
                <Plus className="w-4 h-4" />
                记录更换
              </Link>
            </div>

            {records.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">暂无更换记录</p>
                <p className="text-sm text-gray-400 mt-1">点击上方按钮记录第一次滤芯更换</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
                <div className="space-y-6">
                  {records.map((record, index) => (
                    <div key={record.id} className="relative pl-16">
                      <div className={`absolute left-4 w-5 h-5 rounded-full border-4 ${
                        index === 0 ? 'bg-primary-500 border-primary-200' : 'bg-white border-gray-300'
                      }`} />
                      <div className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-semibold text-gray-800">
                                {formatDateDisplay(record.installDate)}
                              </span>
                              {index === 0 && (
                                <span className="badge-success">当前使用</span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-sm">
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <Tag className="w-4 h-4 text-gray-400" />
                                批次：{record.batchNumber}
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <User className="w-4 h-4 text-gray-400" />
                                安装：{record.installer}
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <DollarSign className="w-4 h-4 text-gray-400" />
                                费用：¥{record.cost}
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                到期：{formatDateDisplay(record.expectedExpireDate)}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Package className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">更换后库存：</span>
                                <span className={`font-semibold ${
                                  (record.remainingInventory ?? 0) === 0 ? 'text-danger-500' :
                                  (record.remainingInventory ?? 0) <= 1 ? 'text-warning-500' : 'text-success-600'
                                }`}>
                                  {record.remainingInventory ?? '-'} 件
                                </span>
                              </div>
                            </div>
                            {record.notes && (
                              <p className="text-sm text-gray-500 mt-3">{record.notes}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="p-2 rounded-lg text-gray-400 hover:text-danger-500 hover:bg-danger-50 transition-colors ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
