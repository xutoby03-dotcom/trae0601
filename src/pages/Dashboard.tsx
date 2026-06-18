import { useAquaStore } from '@/store/aquaStore';
import { FILTER_MATERIAL_ICONS, WATER_CHANGE_CYCLE_DAYS, type FilterMaterial, type WaterQuality } from '@/types';
import { Link } from 'react-router-dom';
import { AlertTriangle, Package, Droplets, Clock, ArrowRight, Fish } from 'lucide-react';

function daysBetween(dateA: Date, dateB: Date): number {
  const msPerDay = 86400000;
  return Math.floor((dateB.getTime() - dateA.getTime()) / msPerDay);
}

function getDaysRemaining(fm: FilterMaterial): number {
  const installDate = new Date(fm.installDate);
  const now = new Date();
  const daysSinceInstall = daysBetween(installDate, now);
  return fm.replaceCycleDays - daysSinceInstall;
}

function ExpiringFilterCard({ tankId }: { tankId: string }) {
  const filterMaterials = useAquaStore((s) => s.filterMaterials);
  const tankMaterials = filterMaterials.filter((f) => f.tankId === tankId);

  const expiring = tankMaterials
    .map((fm) => ({ fm, daysRemaining: getDaysRemaining(fm) }))
    .filter(({ daysRemaining }) => daysRemaining <= 7);

  const sorted = expiring.sort((a, b) => a.daysRemaining - b.daysRemaining);

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-coral" />
        <h2 className="text-lg font-semibold text-foam">临期滤材</h2>
      </div>

      <div className="flex-1 space-y-2">
        {sorted.length === 0 ? (
          <div className="flex items-center justify-center py-6">
            <span className="text-seaweed text-sm font-medium">✅ 所有滤材状态良好</span>
          </div>
        ) : (
          sorted.map(({ fm, daysRemaining }) => {
            const isExpired = daysRemaining < 0;
            const borderColor = isExpired ? 'border-red-500/60' : 'border-orange-400/60';
            const bgColor = isExpired ? 'bg-red-500/10' : 'bg-orange-400/10';
            const textColor = isExpired ? 'text-red-400' : 'text-orange-400';
            const label = isExpired
              ? `已过期 ${Math.abs(daysRemaining)} 天`
              : daysRemaining === 0
                ? '今日到期'
                : `剩余 ${daysRemaining} 天`;

            return (
              <div
                key={fm.id}
                className={`flex items-center gap-3 rounded-lg border ${borderColor} ${bgColor} px-3 py-2`}
              >
                <span className="text-xl">{FILTER_MATERIAL_ICONS[fm.type]}</span>
                <span className="text-foam text-sm flex-1">{fm.type}</span>
                <span className={`text-xs font-medium ${textColor}`}>{label}</span>
              </div>
            );
          })
        )}
      </div>

      <Link
        to="/filter-materials"
        className="flex items-center gap-1 text-surface hover:text-shallow text-xs mt-4 self-end transition-colors"
      >
        查看滤材详情 <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

function AbnormalWaterCard({ tankId }: { tankId: string }) {
  const waterQualities = useAquaStore((s) => s.waterQualities);
  const tankWQ = waterQualities
    .filter((w) => w.tankId === tankId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const latest = tankWQ[0] as WaterQuality | undefined;

  const abnormalities: { label: string; value: string; severity: 'high' | 'warn' }[] = [];

  if (latest) {
    if (latest.ammonia > 0.5) {
      abnormalities.push({ label: '氨氮', value: `${latest.ammonia} mg/L`, severity: 'high' });
    }
    if (latest.nitrite > 0.1) {
      abnormalities.push({ label: '亚硝酸盐', value: `${latest.nitrite} mg/L`, severity: 'high' });
    }
    if (latest.waterColor === '发绿') {
      abnormalities.push({ label: '水色', value: latest.waterColor, severity: 'warn' });
    }
  }

  const hasAbnormal = abnormalities.length > 0;

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Droplets className="w-5 h-5 text-surface" />
        <h2 className="text-lg font-semibold text-foam">异常水质</h2>
      </div>

      <div className="flex-1 space-y-2">
        {!latest ? (
          <div className="flex items-center justify-center py-6">
            <span className="text-sand text-sm">暂无水质记录</span>
          </div>
        ) : !hasAbnormal ? (
          <div className="flex items-center justify-center py-6">
            <span className="text-seaweed text-sm font-medium">✅ 水质正常</span>
          </div>
        ) : (
          abnormalities.map((item, i) => {
            const bgColor = item.severity === 'high' ? 'bg-red-500/10' : 'bg-orange-400/10';
            const borderColor = item.severity === 'high' ? 'border-red-500/60' : 'border-orange-400/60';
            const textColor = item.severity === 'high' ? 'text-red-400' : 'text-orange-400';
            return (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-lg border ${borderColor} ${bgColor} px-3 py-2`}
              >
                <AlertTriangle className={`w-4 h-4 ${textColor}`} />
                <span className="text-foam text-sm flex-1">{item.label}</span>
                <span className={`text-xs font-medium ${textColor}`}>{item.value}</span>
              </div>
            );
          })
        )}
      </div>

      {hasAbnormal && (
        <Link
          to="/maintenance"
          className="flex items-center gap-1 text-surface hover:text-shallow text-xs mt-4 self-end transition-colors"
        >
          查看关联维护记录 <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

function LowStockCard({ tankId }: { tankId: string }) {
  const filterMaterials = useAquaStore((s) => s.filterMaterials);
  const tankMaterials = filterMaterials.filter((f) => f.tankId === tankId);
  const lowStock = tankMaterials.filter((f) => f.stock <= 1);

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-5 h-5 text-sand" />
        <h2 className="text-lg font-semibold text-foam">库存不足</h2>
      </div>

      <div className="flex-1 space-y-2">
        {lowStock.length === 0 ? (
          <div className="flex items-center justify-center py-6">
            <span className="text-seaweed text-sm font-medium">✅ 库存充足</span>
          </div>
        ) : (
          lowStock.map((fm) => (
            <div
              key={fm.id}
              className="flex items-center gap-3 rounded-lg border border-amber-400/60 bg-amber-400/10 px-3 py-2"
            >
              <span className="text-xl">{FILTER_MATERIAL_ICONS[fm.type]}</span>
              <span className="text-foam text-sm flex-1">{fm.type}</span>
              <span className="text-amber-400 text-xs font-medium">剩余 {fm.stock} 件</span>
            </div>
          ))
        )}
      </div>

      <Link
        to="/filter-materials"
        className="flex items-center gap-1 text-surface hover:text-shallow text-xs mt-4 self-end transition-colors"
      >
        管理库存 <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

function WaterChangeCard({ tankId }: { tankId: string }) {
  const maintenanceLogs = useAquaStore((s) => s.maintenanceLogs);
  const waterChanges = maintenanceLogs
    .filter((m) => m.tankId === tankId && m.type === '换水')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const lastChange = waterChanges[0];
  let daysSince = 0;
  let isOverdue = false;
  let daysUntilNext = 0;

  if (lastChange) {
    daysSince = daysBetween(new Date(lastChange.date), new Date());
    isOverdue = daysSince >= WATER_CHANGE_CYCLE_DAYS;
    daysUntilNext = WATER_CHANGE_CYCLE_DAYS - daysSince;
  }

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-shallow" />
        <h2 className="text-lg font-semibold text-foam">换水提醒</h2>
      </div>

      <div className="flex-1">
        {!lastChange ? (
          <div className="flex items-center justify-center py-6">
            <span className="text-amber-400 text-sm font-medium">⚠️ 尚未记录换水</span>
          </div>
        ) : isOverdue ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center py-3 rounded-lg border border-red-500/60 bg-red-500/10">
              <AlertTriangle className="w-4 h-4 text-red-400 mr-2" />
              <span className="text-red-400 font-semibold text-sm">建议立即换水</span>
            </div>
            <p className="text-foam-dark text-xs text-center">
              上次换水：{lastChange.date}（已 {daysSince} 天）
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center py-3 rounded-lg border border-surface/40 bg-surface/10">
              <Droplets className="w-4 h-4 text-surface mr-2" />
              <span className="text-surface font-semibold text-sm">
                距下次换水还有 {daysUntilNext} 天
              </span>
            </div>
            <p className="text-foam-dark text-xs text-center">
              上次换水：{lastChange.date}
            </p>
          </div>
        )}
      </div>

      <Link
        to="/maintenance"
        className="flex items-center gap-1 text-surface hover:text-shallow text-xs mt-4 self-end transition-colors"
      >
        维护记录 <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const activeTankId = useAquaStore((s) => s.activeTankId);
  const tanks = useAquaStore((s) => s.tanks);

  if (!activeTankId || tanks.length === 0) {
    return (
      <div className="min-h-screen bg-deep-sea flex items-center justify-center">
        <div className="glass-card rounded-2xl p-10 text-center max-w-md">
          <Fish className="w-16 h-16 text-surface mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foam mb-2">还没有鱼缸</h2>
          <p className="text-foam-dark text-sm mb-6">请先创建一个鱼缸，开始追踪滤材和水质</p>
          <Link
            to="/tank"
            className="inline-flex items-center gap-2 bg-surface hover:bg-shallow text-deep-sea font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            创建鱼缸 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-sea p-6">
      <h1 className="text-2xl font-bold text-foam mb-6">鱼缸仪表盘</h1>
      <div className="grid grid-cols-2 gap-4 max-w-4xl">
        <ExpiringFilterCard tankId={activeTankId} />
        <AbnormalWaterCard tankId={activeTankId} />
        <LowStockCard tankId={activeTankId} />
        <WaterChangeCard tankId={activeTankId} />
      </div>
    </div>
  );
}
