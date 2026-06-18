import { MapPin, Calendar, Thermometer, AlertTriangle, CheckCircle, XCircle, Plus } from 'lucide-react';
import type { Probe } from '@/types';
import { formatDateTime } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';
import StatusBadge from '@/components/common/StatusBadge';

interface ProbeListProps {
  probes: Probe[];
  onCalibrate: (id: string) => void;
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

export default function ProbeList({ probes, onCalibrate }: ProbeListProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-cold-600" />
          探头列表
          <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
            共 {probes.length} 个
          </span>
        </h3>
      </div>

      {probes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Thermometer className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>暂无探头数据</p>
        </div>
      ) : (
        <div className="space-y-3">
          {probes.map((probe, index) => {
            const Icon = statusIcon[probe.status];
            const badgeStatus = probe.status === 'normal' 
              ? 'normal' 
              : probe.status === 'fault' 
                ? 'abnormal' 
                : 'warning';

            return (
              <div
                key={probe.id}
                className={cn(
                  'rounded-lg p-4 transition-all duration-300 border animate-stagger animate-fadeInUp',
                  probe.status === 'normal'
                    ? 'bg-white border-gray-100 hover:border-gray-200'
                    : probe.status === 'fault'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                )}
                style={{ '--stagger': index } as React.CSSProperties}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'p-2 rounded-lg',
                        probe.status === 'normal'
                          ? 'bg-gray-100'
                          : probe.status === 'fault'
                            ? 'bg-red-100'
                            : 'bg-yellow-100'
                      )}
                    >
                      <MapPin
                        className={cn(
                          'w-4 h-4',
                          probe.status === 'normal'
                            ? 'text-gray-500'
                            : probe.status === 'fault'
                              ? 'text-red-600'
                              : 'text-yellow-600'
                        )}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {probe.position}
                        </span>
                        <StatusBadge status={badgeStatus}>
                          <Icon className="w-3 h-3 mr-1" />
                          {statusText[probe.status]}
                        </StatusBadge>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>上次校准: {formatDateTime(probe.lastCalibration)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span>校准周期: {probe.calibrationCycle} 天</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onCalibrate(probe.id)}
                    className={cn(
                      'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                      probe.status === 'fault'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : probe.status === 'need_calibration'
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                    )}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    校准
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-600">正常</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-xs text-gray-600">需校准</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-xs text-gray-600">故障</span>
        </div>
      </div>
    </div>
  );
}
