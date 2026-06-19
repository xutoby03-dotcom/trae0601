import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  PauseCircle,
  SprayCan,
  Trash2,
  Calendar,
  User,
  Clock,
  Info,
  MapPin,
  Tag,
  FileText,
  Activity,
  CheckCircle2,
  AlertCircle,
  History,
  Camera,
  Package,
} from 'lucide-react';
import { Device, DeviceStatus, UsageRecord, DisinfectionTask, UsageStatus } from '@shared/types';
import { DeviceBadge, UsageBadge, MaskBadge } from '@/components/StatusBadge';
import { api } from '@/lib/api';
import { formatDateTime, formatDuration, formatDate } from '@/lib/format';
import { useAppStore } from '@/store';

type TabType = 'usage' | 'disinfection' | 'timeline';

function DeviceDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    usages,
    disinfectionRecords: storeDisinfectionRecords,
    fetchDevices,
    fetchUsages,
    fetchDisinfectionRecords,
  } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState<Device | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('usage');
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([]);
  const [disinfectionRecords, setDisinfectionRecords] = useState<DisinfectionTask[]>([]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchDevices(), fetchUsages(), fetchDisinfectionRecords()]);

      const dev = await api.getDevice(id!);
      setDevice(dev);

      const deviceUsages = usages.filter((u) => u.deviceId === id);
      setUsageRecords(deviceUsages.sort((a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      ));

      const deviceDisinfections = storeDisinfectionRecords.filter((t) => t.deviceId === id);
      setDisinfectionRecords(deviceDisinfections.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (err: any) {
      alert(err.message);
      navigate('/devices');
    } finally {
      setLoading(false);
    }
  };

  const handleEndUsage = () => {
    if (!device) return;
    if (window.confirm(`确定要结束设备 ${device.code} 的使用吗？`)) {
      const ongoing = usages.find(
        (u) => u.deviceId === device.id && u.status === UsageStatus.ONGOING
      );
      if (ongoing) {
        api.endUsage(ongoing.id).then(() => {
          loadData();
        }).catch((err) => alert(err.message));
      }
    }
  };

  const handleStartDisinfection = () => {
    if (!device) return;
    const pending = usages.find(
      (u) => u.deviceId === device.id && u.status === UsageStatus.FINISHED
    );
    if (pending) {
      api.startDisinfection(pending.id).then((task) => {
        navigate(`/disinfection/${task.id}`);
      }).catch((err) => alert(err.message));
    } else {
      alert('当前没有待消毒的使用记录');
    }
  };

  const handleScrap = () => {
    if (!device) return;
    if (window.confirm(`确定要报废设备 ${device.code} 吗？此操作不可恢复。`)) {
      api.deleteDevice(device.id).then(() => {
        navigate('/devices');
      }).catch((err) => alert(err.message));
    }
  };

  const tabs = [
    { key: 'usage' as TabType, label: '使用记录', icon: Activity },
    { key: 'disinfection' as TabType, label: '消毒记录', icon: SprayCan },
    { key: 'timeline' as TabType, label: '状态变更', icon: History },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full mr-3" />
        <span className="text-slate-600">加载中...</span>
      </div>
    );
  }

  if (!device) return null;

  const timelineEvents = [
    { time: device.createdAt, event: '设备入库', status: '创建', icon: Package, color: 'bg-slate-100 text-slate-600' },
    device.lastMaintenanceDate && {
      time: device.lastMaintenanceDate,
      event: '完成维护保养',
      status: '维护',
      icon: CheckCircle2,
      color: 'bg-green-100 text-green-600',
    },
    device.status === DeviceStatus.SCRAPPED && {
      time: device.updatedAt,
      event: '设备已报废',
      status: '报废',
      icon: AlertCircle,
      color: 'bg-red-100 text-red-600',
    },
  ].filter(Boolean) as any[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/devices')} className="btn-ghost !p-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">设备详情</h1>
            <p className="text-sm text-slate-500">查看设备完整信息</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/devices/${device.id}/edit`} className="btn-secondary">
            <Pencil className="w-4 h-4 mr-2" />
            编辑
          </Link>
          {device.status === DeviceStatus.IN_USE && (
            <button onClick={handleEndUsage} className="btn-secondary">
              <PauseCircle className="w-4 h-4 mr-2" />
              结束使用
            </button>
          )}
          {device.status === DeviceStatus.PENDING_DISINFECTION && (
            <button onClick={handleStartDisinfection} className="btn-success">
              <SprayCan className="w-4 h-4 mr-2" />
              开始消毒
            </button>
          )}
          {device.status !== DeviceStatus.SCRAPPED && (
            <button onClick={handleScrap} className="btn-danger">
              <Trash2 className="w-4 h-4 mr-2" />
              报废
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div>
            <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50 mb-4">
              {device.photo ? (
                <img
                  src={device.photo}
                  alt={device.code}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <Camera className="w-16 h-16 mb-2" />
                  <p className="text-sm">暂无照片</p>
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{device.code}</h2>
            <DeviceBadge status={device.status} className="!text-sm !py-1" />
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Info className="w-5 h-5 text-slate-600" />
              基本信息
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <Tag className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">品牌型号</p>
                  <p className="font-medium text-slate-800">
                    {device.brand} {device.model}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <User className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">适用年龄</p>
                  <p className="font-medium text-slate-800">{device.ageRange || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <MapPin className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">所在诊室</p>
                  <p className="font-medium text-slate-800">{device.clinicRoom}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <Calendar className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">采购日期</p>
                  <p className="font-medium text-slate-800">
                    {formatDate(device.purchaseDate)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-2">配件清单</p>
              <div className="flex flex-wrap gap-2">
                {device.accessories.length > 0 ? (
                  device.accessories.map((acc) => (
                    <span
                      key={acc}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100"
                    >
                      {acc}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-sm">暂无配件</span>
                )}
              </div>
            </div>

            {device.remark && (
              <div>
                <p className="text-xs text-slate-500 mb-1.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  备注
                </p>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {device.remark}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card !p-0">
        <div className="flex border-b border-slate-200 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={activeTab === tab.key ? 'tab-btn-active' : 'tab-btn-inactive'}
              >
                <Icon className="w-4 h-4 inline mr-1.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'usage' && (
            <div className="overflow-x-auto">
              {usageRecords.length > 0 ? (
                <table className="w-full">
                  <thead className="table-header">
                    <tr>
                      <th className="table-th">时间</th>
                      <th className="table-th">患者</th>
                      <th className="table-th">医生</th>
                      <th className="table-th">药液/剂量</th>
                      <th className="table-th">面罩</th>
                      <th className="table-th">时长</th>
                      <th className="table-th">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageRecords.map((usage) => (
                      <tr key={usage.id} className="table-row-hover">
                        <td className="table-td">
                          <p className="text-slate-800">{formatDateTime(usage.startTime)}</p>
                          {usage.endTime && (
                            <p className="text-xs text-slate-500">
                              结束: {formatDateTime(usage.endTime)}
                            </p>
                          )}
                        </td>
                        <td className="table-td">
                          <p className="font-medium text-slate-800">{usage.patientName}</p>
                          <p className="text-xs text-slate-500">{usage.patientAge}岁</p>
                        </td>
                        <td className="table-td text-slate-700">{usage.doctor}</td>
                        <td className="table-td">
                          <p className="text-slate-800">{usage.medicine}</p>
                          <p className="text-xs text-slate-500">{usage.medicineDose}ml</p>
                        </td>
                        <td className="table-td">
                          <MaskBadge type={usage.maskType} />
                        </td>
                        <td className="table-td text-slate-700">
                          {formatDuration(usage.durationMinutes)}
                        </td>
                        <td className="table-td">
                          <UsageBadge status={usage.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Activity className="w-12 h-12 mb-3 text-slate-300" />
                  <p className="font-medium">暂无使用记录</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'disinfection' && (
            <div className="overflow-x-auto">
              {disinfectionRecords.length > 0 ? (
                <table className="w-full">
                  <thead className="table-header">
                    <tr>
                      <th className="table-th">创建时间</th>
                      <th className="table-th">完成时间</th>
                      <th className="table-th">步骤进度</th>
                      <th className="table-th">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disinfectionRecords.map((task) => (
                      <tr key={task.id} className="table-row-hover">
                        <td className="table-td">{formatDateTime(task.createdAt)}</td>
                        <td className="table-td">
                          {task.completedAt ? formatDateTime(task.completedAt) : '-'}
                        </td>
                        <td className="table-td">
                          <div className="flex gap-1.5">
                            {task.steps.map((step, idx) => (
                              <div
                                key={idx}
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                                  step.finishedAt
                                    ? 'bg-green-500 text-white'
                                    : idx < task.currentStep
                                    ? 'bg-teal-500 text-white'
                                    : 'bg-slate-200 text-slate-500'
                                }`}
                              >
                                {idx + 1}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="table-td">
                          <Link to={`/disinfection/${task.id}`} className="text-blue-600 hover:underline">
                            查看详情
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <SprayCan className="w-12 h-12 mb-3 text-slate-300" />
                  <p className="font-medium">暂无消毒记录</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="relative">
              {timelineEvents.length > 0 ? (
                <div className="space-y-6">
                  {timelineEvents.map((event, idx) => {
                    const Icon = event.icon;
                    return (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`p-2 rounded-full ${event.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {idx < timelineEvents.length - 1 && (
                            <div className="flex-1 w-0.5 bg-slate-200 mt-2" style={{ minHeight: '40px' }} />
                          )}
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-slate-800">{event.event}</p>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDateTime(event.time)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">状态: {event.status}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <History className="w-12 h-12 mb-3 text-slate-300" />
                  <p className="font-medium">暂无状态变更记录</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DeviceDetailPage;
