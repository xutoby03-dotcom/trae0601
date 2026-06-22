import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Disc3,
  Gauge,
  Headphones,
  Wrench,
  RefreshCw,
  ChevronRight,
  CheckCircle2,
  Disc,
  Volume2,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const typeLabels: Record<string, { label: string; icon: typeof Wrench }> = {
  realignment: { label: '重新调平', icon: RefreshCw },
  replace_stylus: { label: '更换针尖', icon: Wrench },
  channel_balance: { label: '声道平衡', icon: Volume2 },
};

export default function DashboardPage() {
  const equipments = useAppStore((s) => s.equipments);
  const calibrations = useAppStore((s) => s.calibrations);
  const listeningTests = useAppStore((s) => s.listeningTests);
  const generateAlerts = useAppStore((s) => s.generateAlerts);
  const getEquipmentName = useAppStore((s) => s.getEquipmentName);
  const getLatestCalibration = useAppStore((s) => s.getLatestCalibration);
  const getLatestTestsByEquipment = useAppStore((s) => s.getLatestTestsByEquipment);

  const alerts = useMemo(() => generateAlerts(), [equipments, calibrations, listeningTests, generateAlerts]);
  const dangerAlerts = alerts.filter((a) => a.severity === 'danger');
  const warningAlerts = alerts.filter((a) => a.severity === 'warning');

  const recentCalibrations = useMemo(
    () =>
      calibrations
        .slice()
        .sort((a, b) => b.calibrationDate.localeCompare(a.calibrationDate))
        .slice(0, 5),
    [calibrations]
  );

  const recentTests = useMemo(
    () =>
      listeningTests
        .slice()
        .sort((a, b) => b.testDate.localeCompare(a.testDate))
        .slice(0, 5),
    [listeningTests]
  );

  const summaryStats = [
    {
      label: '设备总数',
      value: equipments.length,
      icon: Disc3,
      color: 'from-oak-600 to-oak-800',
      path: '/equipment',
    },
    {
      label: '校准记录',
      value: calibrations.length,
      icon: Gauge,
      color: 'from-brass-500 to-brass-700',
      path: '/calibration',
    },
    {
      label: '试听次数',
      value: listeningTests.length,
      icon: Headphones,
      color: 'from-forest-500 to-forest-700',
      path: '/listening',
    },
    {
      label: '待处理告警',
      value: alerts.length,
      icon: AlertTriangle,
      color: alerts.length > 0 ? 'from-red-500 to-red-700' : 'from-ink-400 to-ink-600',
      path: '/analysis',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              to={stat.path}
              className="card hover:shadow-vinyl transition-all duration-300 group block"
            >
              <div className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-oak-500 mb-1">{stat.label}</p>
                  <p className="text-3xl font-serif font-bold text-oak-800">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="px-5 pb-4 flex items-center text-xs text-oak-500 group-hover:text-oak-700 transition-colors">
                查看详情
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {alerts.length > 0 && (
        <div className="card border-l-4 border-red-500">
          <div className="card-header flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse-slow" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-oak-800">设备维护告警</h3>
                <p className="text-xs text-ink-400">
                  检测到 {dangerAlerts.length} 个严重问题，{warningAlerts.length} 个需要关注的问题
                </p>
              </div>
            </div>
            <Link to="/analysis" className="btn-secondary !py-2 !px-4 text-sm">
              查看分析报告
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {alerts.slice(0, 6).map((alert) => {
                const TypeIcon = typeLabels[alert.type]?.icon || AlertTriangle;
                const bgClass =
                  alert.severity === 'danger'
                    ? 'bg-red-50 border-red-200 hover:bg-red-100/60'
                    : 'bg-amber-50 border-amber-200 hover:bg-amber-100/60';
                const iconBg =
                  alert.severity === 'danger' ? 'bg-red-500' : 'bg-amber-500';
                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border ${bgClass} transition-colors flex items-start gap-3`}
                  >
                    <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                      <TypeIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`badge ${alert.severity === 'danger' ? 'badge-danger' : 'badge-warning'}`}>
                          {typeLabels[alert.type]?.label || '告警'}
                        </span>
                        <span className="text-xs font-medium text-oak-700 truncate">
                          {getEquipmentName(alert.equipmentId)}
                        </span>
                      </div>
                      <p className="text-sm text-oak-700">{alert.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <div className="card border-l-4 border-forest-500">
          <div className="card-body flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-forest-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-8 h-8 text-forest-600" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-forest-700 mb-1">全部设备运行正常</h3>
              <p className="text-sm text-oak-600">
                未检测到需要维护的设备，继续保持定期校准和试听记录。
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-oak-800 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-brass-600" />
              最近校准记录
            </h3>
            <Link to="/calibration" className="text-sm text-brass-600 hover:text-brass-700 font-medium">
              全部记录 →
            </Link>
          </div>
          <div className="card-body p-0">
            {recentCalibrations.length === 0 ? (
              <div className="p-8 text-center text-ink-400 text-sm">暂无校准记录</div>
            ) : (
              <div className="divide-y divide-oak-50">
                {recentCalibrations.map((c) => {
                  const eq = equipments.find((e) => e.id === c.equipmentId);
                  const deviation = c.measuredForce - c.targetForce;
                  const outOfRange =
                    eq && (c.measuredForce < eq.targetForceMin || c.measuredForce > eq.targetForceMax);
                  return (
                    <div key={c.id} className="p-4 flex items-center justify-between gap-4 hover:bg-brass-50/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-brass-100 flex items-center justify-center shrink-0">
                          <Gauge className="w-5 h-5 text-brass-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-oak-800 truncate">
                            {getEquipmentName(c.equipmentId)}
                          </p>
                          <p className="text-xs text-ink-400">
                            {c.calibrationDate} · {c.operator || '未填写校准人'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono font-semibold text-oak-800">
                          {c.measuredForce.toFixed(2)} mN
                        </p>
                        <p className={`text-xs ${outOfRange || Math.abs(deviation) > 0.3 ? 'text-red-600 font-medium' : 'text-forest-600'}`}>
                          {deviation >= 0 ? '+' : ''}{deviation.toFixed(2)} 偏差
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-oak-800 flex items-center gap-2">
              <Headphones className="w-5 h-5 text-forest-600" />
              最近试听记录
            </h3>
            <Link to="/listening" className="text-sm text-brass-600 hover:text-brass-700 font-medium">
              全部记录 →
            </Link>
          </div>
          <div className="card-body p-0">
            {recentTests.length === 0 ? (
              <div className="p-8 text-center text-ink-400 text-sm">暂无试听记录</div>
            ) : (
              <div className="divide-y divide-oak-50">
                {recentTests.map((t) => {
                  const issueLevel = Math.max(t.jumpLevel, t.sibilanceLevel);
                  const channelDiff = Math.abs(t.leftChannelDb - t.rightChannelDb);
                  return (
                    <div key={t.id} className="p-4 flex items-center justify-between gap-4 hover:bg-brass-50/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-forest-100 flex items-center justify-center shrink-0">
                          <Disc className="w-5 h-5 text-forest-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-oak-800 truncate">
                            {t.recordName || '未指定唱片'}
                          </p>
                          <p className="text-xs text-ink-400 truncate">
                            {t.testDate} · {getEquipmentName(t.equipmentId)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <div className="flex gap-1.5">
                          <span className={`badge ${t.jumpLevel >= 3 ? 'badge-danger' : t.jumpLevel >= 1 ? 'badge-warning' : 'badge-success'}`}>
                            跳 {t.jumpLevel}
                          </span>
                          <span className={`badge ${t.sibilanceLevel >= 4 ? 'badge-danger' : t.sibilanceLevel >= 2 ? 'badge-warning' : 'badge-success'}`}>
                            齿 {t.sibilanceLevel}
                          </span>
                        </div>
                        <p className={`text-xs ${channelDiff > 2 ? 'text-red-600 font-medium' : 'text-ink-400'}`}>
                          声道差 {channelDiff.toFixed(1)} dB
                          {issueLevel >= 3 && ' · ⚠️ 异常'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-serif text-lg font-bold text-oak-800 flex items-center gap-2">
            <Disc3 className="w-5 h-5 text-oak-600" />
            设备状态概览
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {equipments.map((eq) => {
              const eqAlerts = alerts.filter((a) => a.equipmentId === eq.id);
              const latestCal = getLatestCalibration(eq.id);
              const latestTest = getLatestTestsByEquipment(eq.id, 1)[0];
              const hasDanger = eqAlerts.some((a) => a.severity === 'danger');
              const hasWarning = eqAlerts.some((a) => a.severity === 'warning');
              const statusClass = hasDanger
                ? 'border-l-red-500 bg-red-50/40'
                : hasWarning
                ? 'border-l-amber-500 bg-amber-50/40'
                : 'border-l-forest-500 bg-forest-50/30';

              return (
                <Link
                  key={eq.id}
                  to="/analysis"
                  className={`p-4 rounded-xl border ${statusClass} border-l-4 hover:shadow-md transition-all block`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-oak-800 truncate mb-0.5">
                        {eq.cartridgeModel}
                      </h4>
                      <p className="text-xs text-ink-400 truncate">
                        {eq.turntableModel}
                      </p>
                    </div>
                    {hasDanger ? (
                      <span className="badge badge-danger">需维护</span>
                    ) : hasWarning ? (
                      <span className="badge badge-warning">建议检查</span>
                    ) : (
                      <span className="badge badge-success">正常</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2 rounded-lg bg-white/60">
                      <p className="text-ink-400 mb-0.5">上次针压</p>
                      <p className="font-mono font-semibold text-oak-700">
                        {latestCal ? `${latestCal.measuredForce.toFixed(2)} mN` : '-'}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/60">
                      <p className="text-ink-400 mb-0.5">最近试听</p>
                      <p className="font-medium text-oak-700">
                        {latestTest ? latestTest.testDate : '-'}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
