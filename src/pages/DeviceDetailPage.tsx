import { useAppStore } from '@/store';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Edit,
  Plus,
  AlertTriangle,
  CheckCircle,
  Battery,
  Phone,
  Calendar,
  Trash2,
  Clock,
  FileText,
  Wrench,
} from 'lucide-react';
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, TASK_TYPE_LABELS } from '@/constants';

export default function DeviceDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getDevice, getInspectionsByDevice, getTasksByDevice, getBatteryStatus, isDeviceInspectedThisMonth, deleteDevice } = useAppStore();

  const device = getDevice(id!);
  const inspections = getInspectionsByDevice(id!);
  const tasks = getTasksByDevice(id!);
  const inspectedThisMonth = isDeviceInspectedThisMonth(id!);
  const batteryStatus = device ? getBatteryStatus(device) : null;
  const pendingTasks = tasks.filter(t => t.status !== 'done');

  if (!device) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex items-center gap-4">
          <Link
            to="/devices"
            className="w-10 h-10 rounded-xl bg-white border border-cream-200 flex items-center justify-center text-gray-600 hover:bg-cream-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">设备不存在</h1>
            <p className="text-sm text-gray-500 mt-1">请返回设备列表</p>
          </div>
        </div>
        <div className="card p-12 text-center">
          <Shield className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-6">未找到该设备信息</p>
          <Link to="/devices" className="btn-primary">返回设备列表</Link>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('确定删除该设备吗？相关巡检记录和任务也将一并删除。')) {
      deleteDevice(device.id);
      navigate('/devices');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <Link
          to="/devices"
          className="w-10 h-10 rounded-xl bg-white border border-cream-200 flex items-center justify-center text-gray-600 hover:bg-cream-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">{device.location}</h1>
          <p className="text-sm text-gray-500 mt-1">{device.model}</p>
        </div>
        <Link
          to={`/devices/${device.id}/edit`}
          className="btn-secondary"
        >
          <Edit className="w-4 h-4" />
          编辑
        </Link>
        <button
          onClick={handleDelete}
          className="p-2.5 rounded-full bg-white border border-danger-200 text-danger-500 hover:bg-danger-50 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pendingTasks.length > 0 ? 'bg-danger-50' : 'bg-success-50'}`}>
              {pendingTasks.length > 0 ? (
                <AlertTriangle className="w-5 h-5 text-danger-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-success-500" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">设备状态</p>
              <p className={`font-bold ${pendingTasks.length > 0 ? 'text-danger-600' : 'text-success-600'}`}>
                {pendingTasks.length > 0 ? `${pendingTasks.length} 个待处理` : '运行正常'}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              batteryStatus!.level === 'ok' ? 'bg-success-50' :
              batteryStatus!.level === 'warning' ? 'bg-warning-50' :
              'bg-danger-50'
            }`}>
              <Battery className={`w-5 h-5 ${
                batteryStatus!.level === 'ok' ? 'text-success-500' :
                batteryStatus!.level === 'warning' ? 'text-warning-500' :
                'text-danger-500'
              }`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">电池状态</p>
              <p className={`font-bold ${
                batteryStatus!.level === 'ok' ? 'text-success-600' :
                batteryStatus!.level === 'warning' ? 'text-warning-600' :
                'text-danger-600'
              }`}>
                {batteryStatus!.level === 'ok' ? '电量充足' :
                 batteryStatus!.level === 'warning' ? `剩 ${batteryStatus!.days} 天` :
                 `请立即更换`}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${inspectedThisMonth ? 'bg-success-50' : 'bg-warning-50'}`}>
              <Calendar className={`w-5 h-5 ${inspectedThisMonth ? 'text-success-500' : 'text-warning-500'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">本月巡检</p>
              <p className={`font-bold ${inspectedThisMonth ? 'text-success-600' : 'text-warning-600'}`}>
                {inspectedThisMonth ? '已完成' : '待巡检'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="section-title mb-4">
            <Shield className="w-5 h-5 text-brand-500" />
            设备信息
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-cream-100">
              <span className="text-gray-500 text-sm">安装位置</span>
              <span className="text-gray-800 font-medium">{device.location}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-cream-100">
              <span className="text-gray-500 text-sm">设备型号</span>
              <span className="text-gray-800 font-medium">{device.model}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-cream-100">
              <span className="text-gray-500 text-sm">安装日期</span>
              <span className="text-gray-800 font-medium">{device.install_date}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-cream-100">
              <span className="text-gray-500 text-sm">电池类型</span>
              <span className="text-gray-800 font-medium">{device.battery_type}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-cream-100">
              <span className="text-gray-500 text-sm">下次更换电池</span>
              <span className="text-gray-800 font-medium">{batteryStatus!.nextDate}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-cream-100">
              <span className="text-gray-500 text-sm">创建时间</span>
              <span className="text-gray-800 font-medium">{device.created_at}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-500 text-sm flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                维修电话
              </span>
              <a href={`tel:${device.maintenance_phone}`} className="text-brand-500 font-medium hover:underline">
                {device.maintenance_phone}
              </a>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-cream-200">
            <Link to={`/devices/${device.id}/inspection`} className="btn-primary w-full">
              <Plus className="w-4 h-4" />
              立即巡检
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">
                <Wrench className="w-5 h-5 text-danger-500" />
                维修任务 ({pendingTasks.length})
              </h2>
              <Link to="/alerts" className="text-sm text-brand-500 hover:text-brand-600 font-medium">
                全部 →
              </Link>
            </div>
            <div className="space-y-3">
              {tasks.length > 0 ? tasks.slice(0, 5).map(task => (
                <div
                  key={task.id}
                  className={`p-3 rounded-xl border-l-4 ${
                    task.status === 'done'
                      ? 'bg-success-50/50 border-success-500'
                      : task.priority === 'high'
                      ? 'bg-danger-50/50 border-danger-500'
                      : 'bg-warning-50/50 border-warning-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="tag bg-white/80 text-gray-600 text-xs">
                          {TASK_TYPE_LABELS[task.task_type]}
                        </span>
                        <span className={`tag text-xs ${
                          task.priority === 'high' ? 'bg-danger-100 text-danger-600' :
                          task.priority === 'medium' ? 'bg-warning-100 text-warning-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {TASK_PRIORITY_LABELS[task.priority]}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-800">{task.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{task.created_at}</p>
                    </div>
                    <span className={`tag text-xs whitespace-nowrap ${
                      task.status === 'done' ? 'bg-success-100 text-success-600' :
                      task.status === 'processing' ? 'bg-warning-100 text-warning-600' :
                      'bg-danger-100 text-danger-600'
                    }`}>
                      {TASK_STATUS_LABELS[task.status]}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 text-gray-400">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">暂无维修任务</p>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">
                <FileText className="w-5 h-5 text-brand-500" />
                巡检记录 ({inspections.length})
              </h2>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {inspections.length > 0 ? inspections.map(inspection => (
                <div
                  key={inspection.id}
                  className={`p-3 rounded-xl border ${
                    inspection.has_anomaly
                      ? 'bg-danger-50/30 border-danger-200'
                      : 'bg-success-50/30 border-success-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {inspection.has_anomaly ? (
                          <span className="tag bg-danger-100 text-danger-600 text-xs">
                            <AlertTriangle className="w-3 h-3" />
                            有异常
                          </span>
                        ) : (
                          <span className="tag bg-success-100 text-success-600 text-xs">
                            <CheckCircle className="w-3 h-3" />
                            正常
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{inspection.inspect_date}</span>
                      </div>
                      {inspection.remark && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">备注：{inspection.remark}</p>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 text-gray-400">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">暂无巡检记录</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
