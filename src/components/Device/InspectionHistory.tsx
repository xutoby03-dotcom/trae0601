import { Calendar, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import type { Inspection } from '@/constants';
import { SOUND_OPTIONS, LIGHT_OPTIONS, VENTILATION_OPTIONS, HOSE_OPTIONS, VALVE_OPTIONS, BATTERY_OPTIONS } from '@/constants';
import { formatDate, formatRelativeDate } from '@/utils/dateUtils';

interface InspectionHistoryProps {
  inspections: Inspection[];
}

const getLevelClass = (level?: 'success' | 'warning' | 'danger') => {
  if (!level) return 'text-gray-600 bg-gray-100';
  return {
    success: 'text-success-600 bg-success-50',
    warning: 'text-warning-600 bg-warning-50',
    danger: 'text-danger-500 bg-danger-50',
  }[level];
};

const getSound = (v: string) => SOUND_OPTIONS.find((o) => o.value === v);
const getLight = (v: string) => LIGHT_OPTIONS.find((o) => o.value === v);
const getVent = (v: string) => VENTILATION_OPTIONS.find((o) => o.value === v);
const getHose = (v: string) => HOSE_OPTIONS.find((o) => o.value === v);
const getValve = (v: string) => VALVE_OPTIONS.find((o) => o.value === v);
const getBattery = (v: string) => BATTERY_OPTIONS.find((o) => o.value === v);

export default function InspectionHistory({ inspections }: InspectionHistoryProps) {
  if (inspections.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">暂无自检记录</p>
        <p className="text-gray-400 text-sm mt-1">点击「立即自检」开始第一次自检</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {inspections.map((ins) => {
        const sound = getSound(ins.sound_status);
        const light = getLight(ins.light_status);
        const vent = getVent(ins.ventilation);
        const hose = getHose(ins.hose_status);
        const valve = getValve(ins.valve_status);
        const battery = getBattery(ins.battery_level);

        return (
          <div
            key={ins.id}
            className={`card p-5 ${
              ins.has_anomaly ? 'border-l-4 border-l-danger-500 anomaly-card' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    ins.has_anomaly ? 'bg-danger-50 text-danger-500' : 'bg-success-50 text-success-500'
                  }`}
                >
                  {ins.has_anomaly ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-800">
                      {ins.has_anomaly ? '发现异常' : '自检正常'}
                    </p>
                    <span className={`tag ${ins.has_anomaly ? 'bg-danger-50 text-danger-500' : 'bg-success-50 text-success-600'}`}>
                      {ins.anomaly_types.length}项问题
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(ins.inspect_date)}</span>
                    <span>·</span>
                    <span>{formatRelativeDate(ins.inspect_date)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-xs text-gray-500 mb-1">声响</p>
                <span className={`tag ${getLevelClass(sound?.level)}`}>{sound?.label}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-xs text-gray-500 mb-1">指示灯</p>
                <span className={`tag ${getLevelClass(light?.level)}`}>{light?.label}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-xs text-gray-500 mb-1">通风</p>
                <span className={`tag ${getLevelClass(vent?.level)}`}>{vent?.label}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-xs text-gray-500 mb-1">软管</p>
                <span className={`tag ${getLevelClass(hose?.level)}`}>{hose?.label}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-xs text-gray-500 mb-1">阀门</p>
                <span className={`tag ${getLevelClass(valve?.level)}`}>{valve?.label}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-xs text-gray-500 mb-1">电池</p>
                <span className={`tag ${getLevelClass(battery?.level)}`}>{battery?.label}</span>
              </div>
            </div>

            {ins.remark && (
              <div className="bg-cream-50 rounded-lg p-3 border border-cream-200/60">
                <p className="text-xs text-gray-500 mb-1">备注</p>
                <p className="text-sm text-gray-700">{ins.remark}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
