import { useState } from 'react';
import { AlertTriangle, Clock, ChevronDown, CheckCircle } from 'lucide-react';
import type { AbnormalLog, Inspection, Batch } from '@/types';
import { formatDateTime } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';

interface AbnormalAlertProps {
  abnormalLogs: AbnormalLog[];
  inspections: Inspection[];
  batches: Batch[];
}

const typeText: Record<AbnormalLog['type'], string> = {
  temp_high: '温度过高',
  temp_low: '温度过低',
  other: '其他异常',
};

export default function AbnormalAlert({ abnormalLogs, inspections, batches }: AbnormalAlertProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const resolveAbnormalLog = useStore((state) => state.resolveAbnormalLog);

  const pendingLogs = abnormalLogs.filter((log) => log.status === 'pending');

  const getInspection = (inspectionId: string) =>
    inspections.find((ins) => ins.id === inspectionId);

  const getAffectedBatches = (batchIds: string[]) =>
    batches.filter((batch) => batchIds.includes(batch.id));

  if (pendingLogs.length === 0) {
    return (
      <div className="card animate-fadeInUp">
        <h3 className="font-display text-lg font-semibold text-gray-900 mb-4">
          异常预警
        </h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle className="w-12 h-12 text-status-normal mb-3" />
          <p className="text-gray-600 font-medium">暂无异常</p>
          <p className="text-sm text-gray-400 mt-1">所有批次运行正常</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-fadeInUp">
      <h3 className="font-display text-lg font-semibold text-gray-900 mb-4">
        异常预警
        <span className="ml-2 px-2 py-0.5 bg-status-danger text-white text-xs rounded-full">
          {pendingLogs.length}
        </span>
      </h3>

      <div className="space-y-3">
        {pendingLogs.map((log, index) => {
          const inspection = getInspection(log.inspectionId);
          const affectedBatches = getAffectedBatches(log.batchIds);
          const isExpanded = expandedId === log.id;

          return (
            <div
              key={log.id}
              className={cn(
                'rounded-lg p-4 transition-all duration-300 animate-stagger animate-fadeInUp',
                'bg-red-50 border border-red-200',
                log.type === 'temp_high' || log.type === 'temp_low'
                  ? 'animate-pulseRed'
                  : ''
              )}
              style={{ '--stagger': index } as React.CSSProperties}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-status-danger flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-red-800">
                        {typeText[log.type]}
                      </span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                        {log.tempDeviation > 0 ? '+' : ''}
                        {log.tempDeviation}°C
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-red-600">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{inspection ? formatDateTime(inspection.time) : '未知时间'}</span>
                    </div>
                    {inspection && (
                      <p className="text-sm text-red-700 mt-1">
                        当前温度: <span className="font-mono font-medium">{inspection.actualTemp}°C</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => resolveAbnormalLog(log.id)}
                    className="btn-danger text-sm py-1.5 px-3"
                  >
                    <CheckCircle className="w-4 h-4 mr-1 inline" />
                    标记已解决
                  </button>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    className="p-1 rounded hover:bg-red-100 transition-colors"
                  >
                    <ChevronDown
                      className={cn(
                        'w-5 h-5 text-red-600 transition-transform duration-200',
                        isExpanded && 'rotate-180'
                      )}
                    />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-red-200">
                  <p className="text-sm font-medium text-red-800 mb-2">
                    受影响的批次 ({affectedBatches.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {affectedBatches.map((batch) => {
                      const equipment = batches.find(
                        (b) => b.equipmentId === batch.equipmentId
                      );
                      return (
                        <div
                          key={batch.id}
                          className="bg-white/80 rounded-lg p-3 text-sm"
                        >
                          <p className="font-medium text-gray-900">{batch.recipe}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            设备: {equipment?.id || batch.equipmentId} · 第 {batch.layer} 层 · {batch.weight}kg
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
