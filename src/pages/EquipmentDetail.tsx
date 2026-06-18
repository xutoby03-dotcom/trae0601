import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Refrigerator, Layers, Droplets, Calendar, MapPin, Plus, ArrowLeft, Thermometer, Image, AlertCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatDateTime } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';
import ProbeList from '@/components/equipment/ProbeList';
import MaintenanceForm from '@/components/equipment/MaintenanceForm';
import StatusBadge from '@/components/common/StatusBadge';

export default function EquipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const { equipments, probes, maintenances, addMaintenance, calibrateProbe } = useStore();
  const [showForm, setShowForm] = useState(false);

  const equipment = equipments.find(eq => eq.id === id);
  const equipmentProbes = probes.filter(p => p.equipmentId === id);
  const equipmentMaintenances = maintenances
    .filter(m => m.equipmentId === id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleCalibrate = (probeId: string) => {
    calibrateProbe(probeId);
  };

  const handleAddMaintenance = (data: { equipmentId: string; date: string; content: string; photo?: string }) => {
    addMaintenance({
      equipmentId: data.equipmentId,
      date: data.date,
      content: data.content,
      photo: data.photo,
    });
    setShowForm(false);
  };

  if (!equipment) {
    return (
      <div className="card text-center py-16">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">设备不存在</h3>
        <p className="text-gray-500 text-sm mb-4">未找到指定的设备信息</p>
        <Link
          to="/equipment"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          返回设备列表
        </Link>
      </div>
    );
  }

  const normalCount = equipmentProbes.filter(p => p.status === 'normal').length;
  const needCalibrationCount = equipmentProbes.filter(p => p.status === 'need_calibration').length;
  const faultCount = equipmentProbes.filter(p => p.status === 'fault').length;

  const getOverallStatus = () => {
    if (faultCount > 0) return 'abnormal';
    if (needCalibrationCount > 0) return 'warning';
    return 'normal';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/equipment"
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="p-3 rounded-xl bg-primary-100">
          <Refrigerator className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-gray-900">{equipment.code}</h1>
            <StatusBadge status={getOverallStatus()} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">设备详情 · 发酵箱</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card">
            <div className="w-full aspect-[3/4] rounded-xl bg-gradient-to-br from-cold-400 via-cold-500 to-cold-600 shadow-inner relative overflow-hidden mb-4">
              {Array.from({ length: equipment.layers }).map((_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 h-px bg-white/20"
                  style={{ top: `${((i + 1) / (equipment.layers + 1)) * 100}%` }}
                />
              ))}
              <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/30" />
              <div className="absolute bottom-6 right-6 w-3 h-12 rounded bg-white/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Refrigerator className="w-16 h-16 text-white/60" />
              </div>
            </div>

            <h3 className="font-display text-lg font-semibold text-gray-900 mb-4">设备信息</h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="p-2 rounded-lg bg-cold-50">
                  <Droplets className="w-4 h-4 text-cold-600" />
                </div>
                <div>
                  <p className="data-label">容量</p>
                  <p className="font-mono font-medium">{equipment.capacity} kg</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="p-2 rounded-lg bg-primary-50">
                  <Layers className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="data-label">层数</p>
                  <p className="font-mono font-medium">{equipment.layers} 层</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="p-2 rounded-lg bg-gray-100">
                  <Thermometer className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="data-label">探头数量</p>
                  <p className="font-mono font-medium">{equipmentProbes.length} 个</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="p-2 rounded-lg bg-gray-100">
                  <Calendar className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="data-label">创建时间</p>
                  <p className="text-sm font-medium">{formatDateTime(equipment.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                探头位置
              </p>
              <div className="flex flex-wrap gap-2">
                {equipment.probePositions.map((position, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {position}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2">探头状态统计</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-green-50">
                  <p className="font-mono text-lg font-bold text-green-600">{normalCount}</p>
                  <p className="text-xs text-gray-500">正常</p>
                </div>
                <div className="p-2 rounded-lg bg-yellow-50">
                  <p className="font-mono text-lg font-bold text-yellow-600">{needCalibrationCount}</p>
                  <p className="text-xs text-gray-500">需校准</p>
                </div>
                <div className="p-2 rounded-lg bg-red-50">
                  <p className="font-mono text-lg font-bold text-red-600">{faultCount}</p>
                  <p className="text-xs text-gray-500">故障</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <ProbeList probes={equipmentProbes} onCalibrate={handleCalibrate} />

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                保养记录
                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  共 {equipmentMaintenances.length} 条
                </span>
              </h3>
              <button
                onClick={() => setShowForm(!showForm)}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  showForm
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                )}
              >
                <Plus className={cn('w-3.5 h-3.5 transition-transform', showForm && 'rotate-45')} />
                {showForm ? '取消' : '添加记录'}
              </button>
            </div>

            {showForm && (
              <div className="mb-4 animate-fadeInUp">
                <MaintenanceForm equipmentId={equipment.id} onSubmit={handleAddMaintenance} />
              </div>
            )}

            {equipmentMaintenances.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>暂无保养记录</p>
                <p className="text-xs mt-1">点击上方按钮添加第一条保养记录</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {equipmentMaintenances.map((maintenance, index) => (
                  <div
                    key={maintenance.id}
                    className="p-4 rounded-lg bg-gray-50 border border-gray-100 animate-stagger animate-fadeInUp"
                    style={{ '--stagger': index } as React.CSSProperties}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatDateTime(maintenance.date)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{maintenance.content}</p>
                        {maintenance.photo && (
                          <div className="mt-2">
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <Image className="w-3.5 h-3.5" />
                              <span>照片</span>
                            </div>
                            <a
                              href={maintenance.photo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary-600 hover:underline break-all"
                            >
                              {maintenance.photo}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
