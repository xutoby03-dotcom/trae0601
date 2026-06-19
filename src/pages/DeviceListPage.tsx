import { useAppStore } from '@/store';
import { Link } from 'react-router-dom';
import { Shield, Plus, AlertTriangle, CheckCircle, Battery, Search, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function DeviceListPage() {
  const { devices, tasks, getBatteryStatus, deleteDevice } = useAppStore();
  const [search, setSearch] = useState('');

  const filteredDevices = devices.filter(d =>
    d.location.toLowerCase().includes(search.toLowerCase()) ||
    d.model.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">设备档案</h1>
          <p className="text-sm text-gray-500 mt-1">管理所有燃气报警器设备</p>
        </div>
        <Link to="/devices/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          新增设备
        </Link>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索设备位置或型号..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-12"
          />
        </div>
      </div>

      {filteredDevices.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.map((device, idx) => {
            const hasAnomaly = tasks.some(t => t.device_id === device.id && t.status !== 'done');
            const pendingTaskCount = tasks.filter(t => t.device_id === device.id && t.status !== 'done').length;
            const batteryStatus = getBatteryStatus(device);

            return (
              <div
                key={device.id}
                className={`card card-hover p-5 animate-fade-in-up cursor-pointer group relative overflow-hidden ${
                  hasAnomaly ? 'border-danger-200 border-2' : ''
                }`}
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                {hasAnomaly && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-danger-500/5 -rotate-45 translate-x-8 -translate-y-8"></div>
                )}

                <Link to={`/devices/${device.id}`} className="block">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      hasAnomaly ? 'bg-danger-50' : 'bg-brand-50'
                    }`}>
                      {hasAnomaly ? (
                        <AlertTriangle className="w-6 h-6 text-danger-500" />
                      ) : (
                        <Shield className="w-6 h-6 text-brand-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/devices/${device.id}/edit`}
                        onClick={e => e.stopPropagation()}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-cream-100 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (confirm('确定删除该设备吗？相关巡检记录和任务也将一并删除。')) {
                            deleteDevice(device.id);
                          }
                        }}
                        className="p-2 rounded-lg text-gray-400 hover:text-danger-500 hover:bg-danger-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-800 text-lg mb-1">{device.location}</h3>
                  <p className="text-sm text-gray-500 mb-4">{device.model}</p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">安装日期</span>
                      <span className="text-gray-700 font-medium">{device.install_date}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">电池类型</span>
                      <span className="text-gray-700 font-medium">{device.battery_type}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-cream-200 flex items-center justify-between">
                    <div className={`flex items-center gap-2 ${
                      batteryStatus.level === 'ok' ? 'text-success-600' :
                      batteryStatus.level === 'warning' ? 'text-warning-600' :
                      'text-danger-600'
                    }`}>
                      <Battery className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {batteryStatus.level === 'ok' ? '电量正常' :
                         batteryStatus.level === 'warning' ? `剩 ${batteryStatus.days} 天` :
                         `需更换 (${batteryStatus.days}天)`}
                      </span>
                    </div>
                    {pendingTaskCount > 0 ? (
                      <span className="tag bg-danger-50 text-danger-600">
                        <AlertTriangle className="w-3 h-3" />
                        {pendingTaskCount} 个异常
                      </span>
                    ) : (
                      <span className="tag bg-success-50 text-success-600">
                        <CheckCircle className="w-3 h-3" />
                        正常
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link
                      to={`/devices/${device.id}/inspection`}
                      onClick={e => e.stopPropagation()}
                      className="flex-1 btn-primary py-2 text-sm"
                    >
                      立即巡检
                    </Link>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Shield className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {search ? '未找到匹配设备' : '暂无设备'}
          </h3>
          <p className="text-gray-500 mb-6">
            {search ? '请尝试其他搜索关键词' : '添加您的第一个燃气报警器设备开始管理'}
          </p>
          {!search && (
            <Link to="/devices/new" className="btn-primary">
              <Plus className="w-4 h-4" />
              添加设备
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
