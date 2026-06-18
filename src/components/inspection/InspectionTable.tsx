import { Thermometer, Droplets, DoorOpen, Snowflake, Volume2, CheckCircle, XCircle, ClipboardCheck } from 'lucide-react';
import type { Inspection, Equipment } from '@/types';
import { formatDateTime } from '@/utils/dateUtils';
import { isTempNormal } from '@/utils/tempUtils';

interface InspectionTableProps {
  inspections: Inspection[];
  equipments: Equipment[];
}

export default function InspectionTable({ inspections, equipments }: InspectionTableProps) {
  const getEquipmentCode = (equipmentId: string) => {
    const equipment = equipments.find((eq) => eq.id === equipmentId);
    return equipment?.code || equipmentId;
  };

  const StatusIcon = ({ isAbnormal }: { isAbnormal: boolean }) => {
    return isAbnormal ? (
      <XCircle className="w-4 h-4 text-status-danger" />
    ) : (
      <CheckCircle className="w-4 h-4 text-status-normal" />
    );
  };

  if (inspections.length === 0) {
    return (
      <div className="card animate-fadeInUp">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ClipboardCheck className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-600 font-medium text-lg">暂无巡检记录</p>
          <p className="text-sm text-gray-400 mt-2">点击右上角"新增"按钮添加巡检记录</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-fadeInUp overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                时间
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                设备
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                温度
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                湿度
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                门频繁开关
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                结霜
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                异常声音
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                备注
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {inspections.map((inspection, index) => {
              const tempAbnormal = !isTempNormal(inspection.actualTemp);
              return (
                <tr
                  key={inspection.id}
                  className={`hover:bg-gray-50 transition-colors animate-fadeInUp animate-stagger ${
                    tempAbnormal ? 'bg-status-danger/5' : ''
                  }`}
                  style={{ '--stagger': index } as React.CSSProperties}
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{formatDateTime(inspection.time)}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{getEquipmentCode(inspection.equipmentId)}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Thermometer className={`w-4 h-4 ${tempAbnormal ? 'text-status-danger' : 'text-gray-400'}`} />
                      <span className={`font-mono text-sm ${tempAbnormal ? 'text-status-danger font-semibold' : 'text-gray-900'}`}>
                        {inspection.actualTemp}°C
                      </span>
                      {tempAbnormal && <span className="w-2 h-2 bg-status-danger rounded-full animate-pulse" />}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-gray-400" />
                      <span className="font-mono text-sm text-gray-900">{inspection.humidity}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <DoorOpen className={`w-4 h-4 ${inspection.doorFrequentOpen ? 'text-status-danger' : 'text-gray-400'}`} />
                      <StatusIcon isAbnormal={inspection.doorFrequentOpen} />
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Snowflake className={`w-4 h-4 ${inspection.frosting ? 'text-status-danger' : 'text-gray-400'}`} />
                      <StatusIcon isAbnormal={inspection.frosting} />
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Volume2 className={`w-4 h-4 ${inspection.abnormalSound ? 'text-status-danger' : 'text-gray-400'}`} />
                      <StatusIcon isAbnormal={inspection.abnormalSound} />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-600">{inspection.remark || '-'}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
