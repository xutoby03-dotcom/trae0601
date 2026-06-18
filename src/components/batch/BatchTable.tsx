import { CheckCircle, Package } from 'lucide-react';
import type { Batch, Equipment } from '@/types';
import { formatDateTime } from '@/utils/dateUtils';
import { useStore } from '@/store/useStore';
import StatusBadge from '@/components/common/StatusBadge';

interface BatchTableProps {
  batches: Batch[];
  equipments: Equipment[];
}

export default function BatchTable({ batches, equipments }: BatchTableProps) {
  const updateBatchStatus = useStore((state) => state.updateBatchStatus);

  const getEquipmentCode = (equipmentId: string) => {
    const equipment = equipments.find((eq) => eq.id === equipmentId);
    return equipment?.code || equipmentId;
  };

  const handleMarkComplete = (id: string) => {
    updateBatchStatus(id, 'completed');
  };

  if (batches.length === 0) {
    return (
      <div className="card animate-fadeInUp">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-600 font-medium text-lg">暂无入箱记录</p>
          <p className="text-sm text-gray-400 mt-2">点击右上角"新增"按钮添加新批次</p>
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
                批次编号
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                配方
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                设备
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                重量
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                目标温度
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                入箱时间
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                预计出箱
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                所在层
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {batches.map((batch, index) => (
              <tr
                key={batch.id}
                className="hover:bg-gray-50 transition-colors animate-fadeInUp animate-stagger"
                style={{ '--stagger': index } as React.CSSProperties}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="font-mono text-sm text-gray-900">{batch.id}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="font-medium text-gray-900">{batch.recipe}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{getEquipmentCode(batch.equipmentId)}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="font-mono text-sm text-gray-900">{batch.weight}kg</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="font-mono text-sm text-gray-900">{batch.targetTemp}°C</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{formatDateTime(batch.inTime)}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{formatDateTime(batch.expectOutTime)}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="font-mono text-sm text-gray-900">第 {batch.layer} 层</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <StatusBadge status={batch.status} />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {batch.status === 'fermenting' && (
                    <button
                      onClick={() => handleMarkComplete(batch.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-status-normal hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      标记完成
                    </button>
                  )}
                  {batch.status === 'completed' && (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                  {batch.status === 'abnormal' && (
                    <span className="text-sm text-status-danger">异常</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
