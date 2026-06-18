import { MapPin, Calendar, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { Probe, Equipment } from '@/types';
import { formatDateTime, addHours } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';
import StatusBadge from '@/components/common/StatusBadge';

interface ProbeStatusProps {
  probes: Probe[];
  equipments: Equipment[];
}

const statusIcon = {
  normal: CheckCircle,
  need_calibration: AlertTriangle,
  fault: XCircle,
};

const statusText: Record<Probe['status'], string> = {
  normal: '正常',
  need_calibration: '需校准',
  fault: '故障',
};

export default function ProbeStatus({ probes, equipments }: ProbeStatusProps) {
  const getEquipment = (equipmentId: string) =>
    equipments.find((eq) => eq.id === equipmentId);

  const getDaysUntilNextCalibration = (probe: Probe): number => {
    const lastCalibration = new Date(probe.lastCalibration);
    const nextCalibration = addHours(lastCalibration, probe.calibrationCycle * 24);
    const now = Date.now();
    const diff = nextCalibration.getTime() - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const needsWarning = (probe: Probe): boolean => {
    if (probe.status === 'need_calibration' || probe.status === 'fault') return true;
    const daysUntil = getDaysUntilNextCalibration(probe);
    return daysUntil <= 7;
  };

  return (
    <div className="card animate-fadeInUp" style={{ animationDelay: '150ms' }}>
      <h3 className="font-display text-lg font-semibold text-gray-900 mb-4">
        探头状态
        <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
          共 {probes.length} 个
        </span>
      </h3>

      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {probes.map((probe, index) => {
          const equipment = getEquipment(probe.equipmentId);
          const warning = needsWarning(probe);
          const daysUntil = getDaysUntilNextCalibration(probe);
          const Icon = statusIcon[probe.status];

          return (
            <div
              key={probe.id}
              className={cn(
                'rounded-lg p-3 transition-all duration-300 border animate-stagger animate-fadeInUp',
                warning
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-white border-gray-100 hover:border-gray-200'
              )}
              style={{ '--stagger': index } as React.CSSProperties}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'p-2 rounded-lg',
                      warning ? 'bg-yellow-100' : 'bg-gray-100'
                    )}
                  >
                    <MapPin
                      className={cn(
                        'w-4 h-4',
                        warning ? 'text-yellow-600' : 'text-gray-500'
                      )}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {probe.position}
                      </span>
                      <StatusBadge status={probe.status === 'normal' ? 'normal' : probe.status === 'fault' ? 'abnormal' : 'warning'}>
                        <Icon className="w-3 h-3 mr-1" />
                        {statusText[probe.status]}
                      </StatusBadge>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      设备: {equipment?.code || probe.equipmentId}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>上次校准: {formatDateTime(probe.lastCalibration)}</span>
                      </div>
                      <div
                        className={cn(
                          'flex items-center gap-1 text-xs font-medium',
                          daysUntil <= 7 ? 'text-yellow-600' : 'text-gray-500'
                        )}
                      >
                        {daysUntil <= 7 && (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        )}
                        <span>
                          下次校准: {daysUntil > 0 ? `${daysUntil} 天后` : '已过期'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-status-normal"></div>
          <span className="text-xs text-gray-600">正常</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-status-warning"></div>
          <span className="text-xs text-gray-600">需校准/即将过期</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-status-danger"></div>
          <span className="text-xs text-gray-600">故障</span>
        </div>
      </div>
    </div>
  );
}
