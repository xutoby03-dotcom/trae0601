import { Link } from 'react-router-dom';
import { Refrigerator, Layers, Droplets, Thermometer, AlertTriangle, CheckCircle, XCircle, Calendar, Image } from 'lucide-react';
import type { Equipment, Probe, Maintenance } from '@/types';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDate } from '@/utils/dateUtils';

interface EquipmentCardProps {
  equipment: Equipment;
  probes: Probe[];
  maintenances: Maintenance[];
}

export default function EquipmentCard({ equipment, probes, maintenances }: EquipmentCardProps) {
  const equipmentProbes = probes.filter(p => p.equipmentId === equipment.id);
  const equipmentMaintenances = maintenances
    .filter(m => m.equipmentId === equipment.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const lastMaintenance = equipmentMaintenances[0];

  const normalCount = equipmentProbes.filter(p => p.status === 'normal').length;
  const needCalibrationCount = equipmentProbes.filter(p => p.status === 'need_calibration').length;
  const faultCount = equipmentProbes.filter(p => p.status === 'fault').length;

  const getOverallStatus = () => {
    if (faultCount > 0) return 'abnormal';
    if (needCalibrationCount > 0) return 'warning';
    return 'normal';
  };

  const overallStatus = getOverallStatus();

  return (
    <Link
      to={`/equipment/${equipment.id}`}
      className="card block hover:shadow-lg transition-all duration-300 group"
    >
      <div className="flex gap-4">
        <div className="relative flex-shrink-0">
          {equipment.photo ? (
            <div className="w-24 h-36 rounded-xl overflow-hidden">
              <img
                src={equipment.photo}
                alt={equipment.code}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-36 rounded-xl bg-gradient-to-br from-cold-400 via-cold-500 to-cold-600 shadow-inner relative overflow-hidden">
              {Array.from({ length: equipment.layers }).map((_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 h-px bg-white/20"
                  style={{ top: `${((i + 1) / (equipment.layers + 1)) * 100}%` }}
                />
              ))}
              <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white/30" />
              <div className="absolute bottom-3 right-3 w-2 h-8 rounded bg-white/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Refrigerator className="w-8 h-8 text-white/60" />
              </div>
            </div>
          )}
          <div className="absolute -top-2 -right-2">
            <StatusBadge status={overallStatus} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-display text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                {equipment.code}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                发酵箱 · {equipment.layers} 层
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cold-50">
                <Droplets className="w-3.5 h-3.5 text-cold-600" />
              </div>
              <div>
                <p className="data-label">容量</p>
                <p className="font-mono font-medium text-sm">{equipment.capacity}kg</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary-50">
                <Layers className="w-3.5 h-3.5 text-primary-600" />
              </div>
              <div>
                <p className="data-label">层数</p>
                <p className="font-mono font-medium text-sm">{equipment.layers} 层</p>
              </div>
            </div>
          </div>

          {(equipment.photoName || lastMaintenance) && (
            <div className="mb-3 pb-3 border-b border-gray-100 space-y-1.5">
              {equipment.photoName && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Image className="w-3 h-3" />
                  <span className="truncate">{equipment.photoName}</span>
                </div>
              )}
              {lastMaintenance && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Calendar className="w-3 h-3 text-green-600" />
                  <span className="text-green-700 font-medium">最近保养：{formatDate(lastMaintenance.date)}</span>
                </div>
              )}
            </div>
          )}

          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 mb-2">
              <Thermometer className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-700">探头状态</span>
              <span className="text-xs text-gray-400 ml-auto">共 {equipmentProbes.length} 个</span>
            </div>
            <div className="flex items-center gap-3">
              {normalCount > 0 && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-gray-600">{normalCount} 正常</span>
                </div>
              )}
              {needCalibrationCount > 0 && (
                <div className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-gray-600">{needCalibrationCount} 需校准</span>
                </div>
              )}
              {faultCount > 0 && (
                <div className="flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-gray-600">{faultCount} 故障</span>
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              保养记录：{equipmentMaintenances.length} 条
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
