import { Users, Backpack, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useDiveStore } from '@/store/useDiveStore';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import { EQUIPMENT_TYPE_LABELS } from '@/types';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { members, equipment, allocations, getWarnings, getEquipmentByType } =
    useDiveStore();

  const warnings = getWarnings();
  const errorCount = warnings.filter((w) => w.severity === 'error').length;
  const warningCount = warnings.filter((w) => w.severity === 'warning').length;

  const equipmentByType = Object.keys(EQUIPMENT_TYPE_LABELS)
    .map((type) => ({
      type,
      count: getEquipmentByType(type as keyof typeof EQUIPMENT_TYPE_LABELS).length,
      label: EQUIPMENT_TYPE_LABELS[type as keyof typeof EQUIPMENT_TYPE_LABELS],
    }))
    .filter((item) => item.count > 0);

  const allocationRate =
    members.length > 0
      ? Math.round((allocations.length / (members.length * 4)) * 100)
      : 0;

  return (
    <div>
      <PageHeader
        title="仪表盘"
        subtitle="潜水装备分配总览"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="团队成员"
          value={members.length}
          icon={Users}
          color="blue"
          subtitle="位潜水员"
        />
        <StatCard
          title="装备总数"
          value={equipment.length}
          icon={Backpack}
          color="green"
          subtitle="件装备"
        />
        <StatCard
          title="分配进度"
          value={`${allocationRate}%`}
          icon={CheckCircle2}
          color="yellow"
          subtitle="已分配装备"
        />
        <StatCard
          title="待处理告警"
          value={warnings.length}
          icon={AlertTriangle}
          color="red"
          subtitle={`${errorCount} 个严重, ${warningCount} 个提醒`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-display text-lg font-bold text-ocean-800 mb-4">
              装备分类统计
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {equipmentByType.map((item) => (
                <div
                  key={item.type}
                  className="bg-ocean-50 rounded-xl p-4 text-center hover:bg-ocean-100 transition-colors"
                >
                  <p className="font-display text-2xl font-bold text-ocean-700">
                    {item.count}
                  </p>
                  <p className="text-sm text-ocean-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-display text-lg font-bold text-ocean-800 mb-4">
              快捷操作
            </h3>
            <div className="space-y-3">
              <Link
                to="/members"
                className="flex items-center gap-3 p-3 rounded-xl bg-ocean-50 hover:bg-ocean-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-ocean-500 flex items-center justify-center text-white">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-ocean-800">管理成员</p>
                  <p className="text-xs text-ocean-500">添加或编辑团队成员</p>
                </div>
              </Link>
              <Link
                to="/equipment"
                className="flex items-center gap-3 p-3 rounded-xl bg-seafoam-50 hover:bg-seafoam-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-seafoam-500 flex items-center justify-center text-white">
                  <Backpack className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-ocean-800">装备档案</p>
                  <p className="text-xs text-ocean-500">管理所有潜水装备</p>
                </div>
              </Link>
              <Link
                to="/allocation"
                className="flex items-center gap-3 p-3 rounded-xl bg-sand-50 hover:bg-sand-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-sand-500 flex items-center justify-center text-white">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-ocean-800">智能分配</p>
                  <p className="text-xs text-ocean-500">分配装备并检查问题</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="mt-8 glass-card rounded-2xl p-6">
          <h3 className="font-display text-lg font-bold text-ocean-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-coral-500" />
            告警提醒
          </h3>
          <div className="space-y-3">
            {warnings.map((warning, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-4 rounded-xl ${
                  warning.severity === 'error'
                    ? 'bg-coral-50 border border-coral-200'
                    : 'bg-sand-50 border border-sand-200'
                }`}
              >
                <Badge
                  variant={warning.severity === 'error' ? 'error' : 'warning'}
                  size="sm"
                  className="mt-0.5 shrink-0"
                >
                  {warning.severity === 'error' ? '严重' : '提醒'}
                </Badge>
                <p className="text-sm text-ocean-700">{warning.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
