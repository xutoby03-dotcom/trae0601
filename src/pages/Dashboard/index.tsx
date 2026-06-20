import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Bell,
  AlertCircle,
  ChevronRight,
  LifeBuoy,
  Ruler,
  TriangleAlert,
  Heart,
  Camera,
  Sun,
  Flame,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useAppStore } from '@/store/appStore';
import StatCard from '@/components/StatCard';
import StatusBadge, { TypeBadge } from '@/components/StatusBadge';
import { isSummerPeak, getDaysUntilSummerEnd, formatDate, getTodayStr } from '@/utils/dateUtils';
import { getPassRateColor } from '@/utils/statusUtils';
import { EquipmentType, EquipmentTypeLabels } from '@/types';

const typeIcons: Record<EquipmentType, typeof LifeBuoy> = {
  lifebuoy: LifeBuoy,
  rescue_pole: Ruler,
  warning_sign: TriangleAlert,
  first_aid_kit: Heart,
  camera: Camera,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const equipments = useAppStore((state) => state.equipments);
  const inspections = useAppStore((state) => state.inspections);
  const tasks = useAppStore((state) => state.tasks);
  const isReady = useAppStore((state) => state.isPoolReady());

  const today = getTodayStr();

  const { stats, abnormalEquipments, zoneRates, chartData } = useMemo(() => {
    const todayInspections = inspections.filter((ins) => ins.inspectionDate === today);
    const inspected = todayInspections.length;
    const pending = equipments.length - inspected;
    const abnormal = equipments.filter((eq) => eq.status === 'abnormal').length;
    const processingTasks = tasks.filter(
      (t) => t.status === 'pending' || t.status === 'processing'
    ).length;
    const overallPassRate =
      todayInspections.length > 0
        ? Math.round(
            (todayInspections.filter((ins) => ins.status === 'pass').length /
              todayInspections.length) *
              100
          )
        : equipments.length > 0
        ? Math.round(
            (equipments.filter((e) => e.status === 'normal').length / equipments.length) * 100
          )
        : 100;

    const stats = { inspected, pending, abnormal, processingTasks, overallPassRate };

    const abnormalEquipments = equipments.filter(
      (eq) => eq.status === 'abnormal' || eq.status === 'maintaining'
    );

    const zones = [...new Set(equipments.map((eq) => eq.zone))];
    const zoneRates = zones.map((zone) => {
      const zoneEquipments = equipments.filter((eq) => eq.zone === zone);
      const zoneTodayInspections = inspections.filter(
        (ins) =>
          ins.inspectionDate === today &&
          zoneEquipments.some((eq) => eq.id === ins.equipmentId)
      );

      const passed = zoneTodayInspections.filter((ins) => ins.status === 'pass').length;
      const total = zoneEquipments.length;
      const inspectedCount = zoneTodayInspections.length;
      const passRate =
        inspectedCount > 0
          ? Math.round((passed / inspectedCount) * 100)
          : total === zoneEquipments.filter((e) => e.status === 'normal').length
          ? 100
          : Math.round(
              (zoneEquipments.filter((e) => e.status === 'normal').length / total) * 100
            );

      return {
        zone,
        passRate: Math.min(passRate, 100),
        total,
        passed: zoneEquipments.filter((e) => e.status === 'normal').length,
      };
    });

    const chartData = zoneRates.map((z) => ({
      name: z.zone.split('-')[1] || z.zone,
      合格率: z.passRate,
      fullName: z.zone,
    }));

    return { stats, abnormalEquipments, zoneRates, chartData };
  }, [equipments, inspections, tasks, today]);

  const getBarColor = (value: number) => {
    if (value >= 90) return '#10B981';
    if (value >= 70) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="space-y-6">
      {!isReady && (
        <div className="status-alert-bar bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">泳池状态异常！禁止开放</h3>
              <p className="text-red-100">
                当前有 {stats.abnormal} 件器材异常，{stats.processingTasks} 个待处理任务，请立即处理所有问题后方可开放
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/tasks')}
            className="px-5 py-2.5 bg-white text-red-600 rounded-lg font-bold hover:bg-red-50 transition-colors"
          >
            查看异常 →
          </button>
        </div>
      )}

      {isSummerPeak() && (
        <div className="status-alert-bar bg-gradient-to-r from-safety-orange to-orange-500 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Sun className="w-5 h-5" />
                暑期高峰安全提醒
              </h3>
              <p className="text-orange-100">
                当前为暑期人流高峰，距暑期结束还有 {getDaysUntilSummerEnd()} 天。请加强点检频次，确保所有救援器材100%可用
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/inspection')}
            className="px-5 py-2.5 bg-white text-orange-600 rounded-lg font-bold hover:bg-orange-50 transition-colors"
          >
            开始点检 →
          </button>
        </div>
      )}

      {isReady && !isSummerPeak() && (
        <div className="status-alert-bar bg-gradient-to-r from-safety-green to-green-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">泳池状态正常</h3>
              <p className="text-green-100">所有救援器材均处于良好状态，可正常开放</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="今日已点检"
          value={stats.inspected}
          suffix={`/ ${equipments.length}`}
          icon={ClipboardCheck}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          accent="from-green-500 to-green-600"
        />
        <StatCard
          title="待点检数量"
          value={stats.pending}
          icon={ClipboardCheck}
          iconBg="bg-yellow-50"
          iconColor="text-yellow-600"
          accent="from-yellow-500 to-yellow-600"
        />
        <StatCard
          title="异常器材"
          value={stats.abnormal}
          icon={AlertTriangle}
          iconBg="bg-red-50"
          iconColor="text-red-600"
          accent="from-red-500 to-red-600"
        />
        <StatCard
          title="处理中任务"
          value={stats.processingTasks}
          icon={Wrench}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          accent="from-primary-500 to-primary-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">各区域合格率</h3>
              <p className="text-sm text-slate-500">基于今日点检数据统计</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                ≥90%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                ≥70%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                {'<70%'}
              </span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#94A3B8"
                  fontSize={13}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={13}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    padding: '12px 16px',
                  }}
                  formatter={(value: number) => [`${value}%`, '合格率']}
                  labelFormatter={(label, payload: any) =>
                    payload?.[0]?.payload?.fullName || label
                  }
                />
                <Bar dataKey="合格率" radius={[8, 8, 0, 0]} barSize={50}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.合格率)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-5 gap-3 mt-4">
            {zoneRates.map((zone) => (
              <div key={zone.zone} className="text-center p-3 rounded-lg bg-slate-50">
                <p className="text-xs text-slate-500 mb-1">{zone.zone.split('-')[1]}</p>
                <p className={`text-xl font-bold ${getPassRateColor(zone.passRate)}`}>
                  {zone.passRate}%
                </p>
                <p className="text-xs text-slate-400">
                  {zone.passed}/{zone.total}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-800">异常器材</h3>
              <p className="text-sm text-slate-500">共 {abnormalEquipments.length} 件待处理</p>
            </div>
            <button
              onClick={() => navigate('/tasks')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              全部处理 <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {abnormalEquipments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <CheckCircle2 className="w-16 h-16 mb-3 text-green-400" />
              <p className="font-medium text-slate-600">暂无异常器材</p>
              <p className="text-sm">所有器材状态良好</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {abnormalEquipments.map((eq) => {
                const Icon = typeIcons[eq.type];
                return (
                  <div
                    key={eq.id}
                    onClick={() => navigate(`/equipment/${eq.id}`)}
                    className="p-4 rounded-xl border-l-4 border-red-500 bg-red-50/50 hover:bg-red-50 cursor-pointer transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-slate-800 truncate">{eq.name}</p>
                          <StatusBadge type="equipment" status={eq.status} />
                        </div>
                        <p className="text-sm text-slate-500 mb-1">
                          <span className="mr-2">{eq.code}</span>
                          <TypeBadge type={eq.type} />
                        </p>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Bell className="w-3 h-3" />
                          {eq.location}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          上次点检: {formatDate(eq.lastInspectionDate || '')}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-800">器材类型分布</h3>
            <p className="text-sm text-slate-500">各类型救援器材数量统计</p>
          </div>
          <button
            onClick={() => navigate('/equipment')}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            器材档案 <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {(Object.keys(EquipmentTypeLabels) as EquipmentType[]).map((type) => {
            const count = equipments.filter((e) => e.type === type).length;
            const Icon = typeIcons[type];
            const abnormalCount = equipments.filter(
              (e) => e.type === type && e.status !== 'normal'
            ).length;
            return (
              <div
                key={type}
                className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 hover:shadow-card-hover transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      {EquipmentTypeLabels[type]}
                    </p>
                    <p className="text-2xl font-bold text-slate-800">{count}</p>
                  </div>
                </div>
                {abnormalCount > 0 && (
                  <p className="text-xs text-red-600 bg-red-50 rounded-lg px-2 py-1 inline-block">
                    {abnormalCount} 件异常
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
