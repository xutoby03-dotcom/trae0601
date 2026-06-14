import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Coffee, AlertTriangle, TrendingDown, ArrowRight, Plus, Clock } from 'lucide-react';
import { useBatchStore } from '@/store/batchStore';
import { useJarStore } from '@/store/jarStore';
import { calculateAlerts } from '@/utils/alert';
import StatusBadge from '@/components/ui/StatusBadge';

export default function Dashboard() {
  const navigate = useNavigate();
  const { batches } = useBatchStore();
  const { jars, operations } = useJarStore();

  const stats = useMemo(() => {
    const totalWeight = batches.reduce((sum, b) => sum + b.remainingWeight, 0) +
      jars.filter(j => j.status !== 'sold' && j.status !== 'damaged').reduce((sum, j) => sum + j.currentWeight, 0);
    const openJars = jars.filter(j => j.status === 'open').length;
    const alerts = calculateAlerts(batches, jars);
    const thisMonthDamage = operations.filter(o => {
      const opDate = new Date(o.operatedAt);
      const now = new Date();
      return o.type === 'damage' && opDate.getMonth() === now.getMonth() && opDate.getFullYear() === now.getFullYear();
    }).reduce((sum, o) => sum + o.weight, 0);

    return { totalWeight, openJars, alertCount: alerts.length, thisMonthDamage };
  }, [batches, jars, operations]);

  const alerts = useMemo(() => calculateAlerts(batches, jars), [batches, jars]);

  const statCards = [
    {
      label: '总库存重量',
      value: `${(stats.totalWeight / 1000).toFixed(1)} kg`,
      icon: Package,
      color: 'from-teaGreen-500 to-teaGreen-600',
      bgLight: 'bg-teaGreen-50',
      iconColor: 'text-teaGreen-600',
    },
    {
      label: '开罐中',
      value: `${stats.openJars} 罐`,
      icon: Coffee,
      color: 'from-amberGold-400 to-amberGold-500',
      bgLight: 'bg-amber-50',
      iconColor: 'text-amber-700',
    },
    {
      label: '待处理预警',
      value: `${stats.alertCount} 条`,
      icon: AlertTriangle,
      color: 'from-warnOrange to-orange-600',
      bgLight: 'bg-orange-50',
      iconColor: 'text-warnOrange',
    },
    {
      label: '本月报损',
      value: `${stats.thisMonthDamage} g`,
      icon: TrendingDown,
      color: 'from-dangerRed to-red-700',
      bgLight: 'bg-red-50',
      iconColor: 'text-dangerRed',
    },
  ];

  const quickActions = [
    { label: '新增批次', icon: Plus, to: '/batches/new', color: 'bg-teaGreen-500 hover:bg-teaGreen-600' },
    { label: '新增封罐', icon: Coffee, to: '/jars/new', color: 'bg-amberGold-500 hover:bg-amberGold-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div key={card.label} className="card !p-0 overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1 font-serif">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${card.bgLight} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
            <div className={`h-1 w-full bg-gradient-to-r ${card.color}`}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-serif text-lg font-bold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warnOrange" />
              预警提醒
            </h3>
            <span className="text-sm text-gray-500">共 {alerts.length} 条</span>
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>暂无预警，一切正常</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => navigate(`/jars/${alert.jarId}`)}
                  className={`p-4 rounded-xl border-2 cursor-pointer hover:shadow-md transition-all ${
                    alert.level === 'danger'
                      ? 'border-red-200 bg-red-50/50 hover:border-red-300'
                      : 'border-amber-200 bg-amber-50/50 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={alert.level} type="alert" />
                      <div>
                        <p className="font-medium text-gray-800">
                          <span className="font-mono text-sm mr-2">{alert.jarNo}</span>
                          {alert.batchName}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">{alert.message}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-serif text-lg font-bold text-gray-800 mb-5">快捷操作</h3>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.to)}
                className={`w-full p-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all hover:shadow-lg ${action.color}`}
              >
                <action.icon className="w-5 h-5" />
                {action.label}
              </button>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-tea-100">
            <h4 className="text-sm font-medium text-gray-500 mb-3">最近批次</h4>
            <div className="space-y-2">
              {batches.slice(0, 3).map((batch) => (
                <div key={batch.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-tea-50 transition-colors">
                  <img
                    src={batch.photoUrl}
                    alt={batch.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{batch.name}</p>
                    <p className="text-xs text-gray-500">{batch.origin}</p>
                  </div>
                  <span className="text-sm font-medium text-teaGreen-600">{batch.remainingWeight}g</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
