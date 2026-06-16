import { useMemo } from 'react';
import {
  FireExtinguisher,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Building2,
  MapPin,
  Calendar
} from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { useDeviceStore } from '@/store/deviceStore';
import { useInspectionStore } from '@/store/inspectionStore';
import { useRectificationStore } from '@/store/rectificationStore';
import { daysUntil, isExpiringSoon, isSameMonth, formatDate } from '@/utils/date';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { devices, getBuildings } = useDeviceStore();
  const { inspections, getLatestInspection, getAnomalyCount } = useInspectionStore();
  const { rectifications, getPendingCount } = useRectificationStore();

  const stats = useMemo(() => {
    const totalDevices = devices.length;

    const thisMonthInspections = inspections.filter(i => isSameMonth(i.inspectDate));
    const passedInspections = thisMonthInspections.filter(i => i.result === 'normal');
    const passRate = thisMonthInspections.length > 0
      ? Math.round((passedInspections.length / thisMonthInspections.length) * 100)
      : 0;

    const expiringSoonCount = devices.filter(d => isExpiringSoon(d.expireDate)).length;
    const pendingCount = getPendingCount();

    return {
      totalDevices,
      passRate: passRate + '%',
      expiringSoon: expiringSoonCount,
      pending: pendingCount
    };
  }, [devices, inspections, getPendingCount]);

  const buildingStats = useMemo(() => {
    const buildings = getBuildings();
    return buildings.map(building => {
      const buildingDevices = devices.filter(d => d.building === building);
      const deviceIds = buildingDevices.map(d => d.id);
      const buildingInspections = inspections.filter(i =>
        deviceIds.includes(i.deviceId) && isSameMonth(i.inspectDate)
      );
      const uniqueInspectedDevices = new Set(buildingInspections.map(i => i.deviceId)).size;
      const passedInspections = buildingInspections.filter(i => i.result === 'normal');
      const passRate = buildingInspections.length > 0
        ? Math.round((passedInspections.length / buildingInspections.length) * 100)
        : 0;

      return {
        building,
        total: buildingDevices.length,
        inspected: uniqueInspectedDevices,
        passRate
      };
    });
  }, [devices, inspections, getBuildings]);

  const repeatAnomalies = useMemo(() => {
    const anomalyDevices = devices
      .map(d => {
        const count = getAnomalyCount(d.id);
        const latest = getLatestInspection(d.id);
        return {
          deviceId: d.id,
          deviceCode: d.code,
          location: `${d.building} ${d.floor} ${d.location}`,
          anomalyCount: count,
          lastAnomalyDate: latest?.inspectDate || ''
        };
      })
      .filter(d => d.anomalyCount >= 2)
      .sort((a, b) => b.anomalyCount - a.anomalyCount);

    return anomalyDevices;
  }, [devices, getAnomalyCount, getLatestInspection]);

  const uncheckedThisMonth = useMemo(() => {
    const checkedIds = new Set(
      inspections.filter(i => isSameMonth(i.inspectDate)).map(i => i.deviceId)
    );
    return devices.filter(d => !checkedIds.has(d.id));
  }, [devices, inspections]);

  const expiringDevices = useMemo(() => {
    return devices
      .filter(d => isExpiringSoon(d.expireDate))
      .sort((a, b) => new Date(a.expireDate).getTime() - new Date(b.expireDate).getTime())
      .slice(0, 5);
  }, [devices]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="设备总数"
          value={stats.totalDevices}
          icon={FireExtinguisher}
          color="red"
          trend="2台"
          trendUp
        />
        <StatCard
          title="巡检合格率"
          value={stats.passRate}
          icon={CheckCircle}
          color="green"
          trend="5%"
          trendUp
        />
        <StatCard
          title="即将到期"
          value={stats.expiringSoon}
          icon={Clock}
          color="yellow"
          trend="3台"
          trendUp={false}
        />
        <StatCard
          title="待整改"
          value={stats.pending}
          icon={AlertTriangle}
          color="red"
          trend="1单"
          trendUp
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">楼栋合格率</h3>
            <span className="text-sm text-gray-500">本月数据</span>
          </div>
          <div className="space-y-4">
            {buildingStats.map(stat => (
              <div key={stat.building}>
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{stat.building}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-900">{stat.passRate}%</span>
                    <span className="mx-1">·</span>
                    <span>{stat.inspected}/{stat.total}台已检</span>
                  </div>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      stat.passRate >= 90 ? 'bg-emerald-500' :
                      stat.passRate >= 70 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${stat.passRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">重复异常点</h3>
            <span className="text-sm text-gray-500">累计≥2次</span>
          </div>
          {repeatAnomalies.length > 0 ? (
            <div className="space-y-3">
              {repeatAnomalies.map(item => (
                <div
                  key={item.deviceId}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.deviceCode}</p>
                      <p className="text-xs text-gray-500">
                        <MapPin className="mr-1 inline h-3 w-3" />
                        {item.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">{item.anomalyCount}次</p>
                    <p className="text-xs text-gray-500">最近: {item.lastAnomalyDate}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <CheckCircle className="mb-2 h-10 w-10" />
              <p className="text-sm">暂无重复异常设备</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">即将到期</h3>
            <Link
              to="/devices"
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              查看全部
            </Link>
          </div>
          <div className="space-y-2">
            {expiringDevices.map(device => {
              const days = daysUntil(device.expireDate);
              return (
                <div
                  key={device.id}
                  className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{device.code}</p>
                      <p className="text-xs text-gray-500">
                        {device.building} {device.floor} {device.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      days <= 7 ? 'text-red-600' : 'text-amber-600'
                    }`}>
                      还剩 {days} 天
                    </p>
                    <p className="text-xs text-gray-500">{device.expireDate}到期</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">本月未检</h3>
            <span className="text-sm text-gray-500">共 {uncheckedThisMonth.length} 台</span>
          </div>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {uncheckedThisMonth.slice(0, 6).map(device => (
              <div
                key={device.id}
                className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <Calendar className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{device.code}</p>
                    <p className="text-xs text-gray-500">
                      {device.building} {device.floor} {device.location}
                    </p>
                  </div>
                </div>
                <StatusBadge status="warning" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
