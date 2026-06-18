import { useEffect } from 'react';
import { Thermometer, Droplets, Activity } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getTempStatus } from '@/utils/tempUtils';
import BatchCard from '@/components/dashboard/BatchCard';
import UpcomingBatches from '@/components/dashboard/UpcomingBatches';
import TemperatureChart from '@/components/dashboard/TemperatureChart';
import AbnormalAlert from '@/components/dashboard/AbnormalAlert';
import ProbeStatus from '@/components/dashboard/ProbeStatus';
import NumberAnimation from '@/components/common/NumberAnimation';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const initData = useStore((state) => state.initData);
  const batches = useStore((state) => state.batches);
  const equipments = useStore((state) => state.equipments);
  const inspections = useStore((state) => state.inspections);
  const temperatureRecords = useStore((state) => state.temperatureRecords);
  const abnormalLogs = useStore((state) => state.abnormalLogs);
  const probes = useStore((state) => state.probes);

  useEffect(() => {
    initData();
  }, [initData]);

  const latestInspection = inspections[0];
  const currentTemp = latestInspection?.actualTemp ?? 4.0;
  const currentHumidity = latestInspection?.humidity ?? 70;
  const tempStatus = getTempStatus(currentTemp);
  const hasPendingAbnormal = abnormalLogs.some((log) => log.status === 'pending');

  const statusColor = hasPendingAbnormal
    ? 'bg-status-danger'
    : tempStatus === 'normal'
      ? 'bg-status-normal'
      : 'bg-status-warning';

  const statusText = hasPendingAbnormal
    ? '存在异常'
    : tempStatus === 'normal'
      ? '运行正常'
      : '温度异常';

  const fermentingBatches = batches.filter((batch) => batch.status === 'fermenting');

  const getEquipment = (equipmentId: string) =>
    equipments.find((eq) => eq.id === equipmentId);

  const batchesByEquipment = fermentingBatches.reduce((acc, batch) => {
    if (!acc[batch.equipmentId]) {
      acc[batch.equipmentId] = [];
    }
    acc[batch.equipmentId].push(batch);
    return acc;
  }, {} as Record<string, typeof fermentingBatches>);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card animate-fadeInUp" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-cold-500" />
              <span className="text-sm font-medium text-gray-600">当前温度</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn('status-dot animate-pulse', statusColor)}></span>
              <span className="text-sm text-gray-500">{statusText}</span>
            </div>
          </div>
          <div className="temp-value">
            <NumberAnimation value={currentTemp} suffix="°C" decimals={1} />
          </div>
        </div>

        <div className="card animate-fadeInUp" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <Droplets className="w-5 h-5 text-primary-500" />
            <span className="text-sm font-medium text-gray-600">当前湿度</span>
          </div>
          <div className="temp-value">
            <NumberAnimation value={currentHumidity} suffix="%" decimals={0} />
          </div>
        </div>

        <div className="card animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-status-normal" />
            <span className="text-sm font-medium text-gray-600">发酵中批次</span>
          </div>
          <div className="temp-value">
            <NumberAnimation value={fermentingBatches.length} suffix=" 批" decimals={0} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="animate-fadeInUp" style={{ animationDelay: '150ms' }}>
            <h2 className="font-display text-xl font-semibold text-gray-900 mb-4">
              当前发酵批次
            </h2>
            {Object.entries(batchesByEquipment).length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-500">暂无发酵中的批次</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(batchesByEquipment).map(([equipmentId, equipmentBatches], groupIndex) => {
                  const equipment = getEquipment(equipmentId);
                  return (
                    <div key={equipmentId}>
                      <h3 className="font-display text-lg font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                        {equipment?.code || equipmentId}
                        <span className="text-sm text-gray-400 font-normal">
                          ({equipmentBatches.length} 批)
                        </span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {equipmentBatches.map((batch, index) => (
                          <BatchCard
                            key={batch.id}
                            batch={batch}
                            equipment={equipment}
                            abnormalLogs={abnormalLogs}
                            stagger={groupIndex * 10 + index}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AbnormalAlert
                abnormalLogs={abnormalLogs}
                inspections={inspections}
                batches={batches}
              />
              <ProbeStatus probes={probes} equipments={equipments} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <UpcomingBatches batches={batches} equipments={equipments} />
          <TemperatureChart records={temperatureRecords} />
        </div>
      </div>
    </div>
  );
}
