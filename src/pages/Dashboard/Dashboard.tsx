import { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CalendarX,
  PawPrint,
  FileWarning,
  ShieldAlert,
  AlertTriangle,
  Clock,
  AlertCircle,
  ChevronRight,
  Upload,
  Dog,
  Cat,
  RefreshCw,
  Activity,
  Scissors,
  Wrench,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import {
  DashboardStats,
  ExpiringVaccineItem,
  PendingMaterialItem,
  HighRiskItem,
  Cage,
  Pet,
  VACCINE_TYPE_NAMES,
  URGENT_WARNING_DAYS
} from '../../../shared/types';
import { cn } from '@/lib/utils';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface CageWithPet extends Cage {
  pet?: Pet;
}

const API_BASE = '/api';

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);
  const result: ApiResponse<T> = await response.json();
  if (!result.success || !result.data) {
    throw new Error(result.error || '请求失败');
  }
  return result.data;
}

function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [expiringVaccines, setExpiringVaccines] = useState<ExpiringVaccineItem[]>([]);
  const [pendingMaterials, setPendingMaterials] = useState<PendingMaterialItem[]>([]);
  const [highRiskList, setHighRiskList] = useState<HighRiskItem[]>([]);
  const [cages, setCages] = useState<CageWithPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, vaccinesData, materialsData, riskData, cagesData] = await Promise.all([
        fetchApi<DashboardStats>('/dashboard/stats'),
        fetchApi<ExpiringVaccineItem[]>('/dashboard/expiring-vaccines'),
        fetchApi<PendingMaterialItem[]>('/dashboard/pending-materials'),
        fetchApi<HighRiskItem[]>('/dashboard/high-risk'),
        fetchApi<Cage[]>('/cages')
      ]);

      const staysMap = new Map<number, Pet>();
      for (const item of riskData) {
        if (item.stay.cageId) {
          staysMap.set(item.stay.cageId, item.pet);
        }
      }
      for (const item of materialsData) {
        if (item.stay?.cageId) {
          staysMap.set(item.stay.cageId, item.pet);
        }
      }

      const cagesWithPet: CageWithPet[] = cagesData.map(cage => ({
        ...cage,
        pet: staysMap.get(cage.id)
      }));

      setStats(statsData);
      setExpiringVaccines(vaccinesData);
      setPendingMaterials(materialsData);
      setHighRiskList(riskData);
      setCages(cagesWithPet);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { stats, expiringVaccines, pendingMaterials, highRiskList, cages, loading, error, refresh: loadData };
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  delay?: number;
}

function StatCard({ title, value, icon: Icon, color, delay = 0 }: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-6 shadow-sm border border-gray-100",
        "hover:shadow-lg hover:-translate-y-1 transition-all duration-300",
        "opacity-0 translate-y-4",
        isVisible && "opacity-100 translate-y-0"
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {value}
          </p>
        </div>
        <div className={cn("p-4 rounded-xl", color)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

interface VaccineStatusBadgeProps {
  daysRemaining: number;
}

function VaccineStatusBadge({ daysRemaining }: VaccineStatusBadgeProps) {
  if (daysRemaining <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
        <XCircle className="w-3 h-3" />
        已过期
      </span>
    );
  }
  if (daysRemaining <= URGENT_WARNING_DAYS) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
        <AlertTriangle className="w-3 h-3" />
        紧急
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
      <Clock className="w-3 h-3" />
      临期
    </span>
  );
}

function VaccineTable({ data }: { data: ExpiringVaccineItem[] }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" />
        <p>暂无临期疫苗</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">宠物名</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">疫苗类型</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">到期日期</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">剩余天数</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">状态</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((item, index) => (
            <tr
              key={`${item.pet.id}-${item.vaccine.id}`}
              className="hover:bg-gray-50 transition-colors duration-200"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    {item.pet.species === 'dog' ? (
                      <Dog className="w-4 h-4 text-purple-600" />
                    ) : item.pet.species === 'cat' ? (
                      <Cat className="w-4 h-4 text-pink-600" />
                    ) : (
                      <PawPrint className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <span className="font-medium text-gray-900">{item.pet.name}</span>
                </div>
              </td>
              <td className="py-4 px-4 text-gray-700">{item.vaccine.name}</td>
              <td className="py-4 px-4 text-gray-600">{item.vaccine.expiryDate}</td>
              <td className="py-4 px-4">
                <span className={cn(
                  "font-semibold",
                  item.daysRemaining <= 0 ? "text-red-600" :
                  item.daysRemaining <= URGENT_WARNING_DAYS ? "text-orange-600" : "text-yellow-600"
                )}>
                  {item.daysRemaining <= 0 ? `过期 ${Math.abs(item.daysRemaining)} 天` : `${item.daysRemaining} 天`}
                </span>
              </td>
              <td className="py-4 px-4">
                <VaccineStatusBadge daysRemaining={item.daysRemaining} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PendingMaterialsList({ data }: { data: PendingMaterialItem[] }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" />
        <p>所有宠物材料齐全</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div
          key={item.pet.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
              {item.pet.species === 'dog' ? (
                <Dog className="w-5 h-5 text-amber-600" />
              ) : item.pet.species === 'cat' ? (
                <Cat className="w-5 h-5 text-orange-600" />
              ) : (
                <PawPrint className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">{item.pet.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <FileWarning className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-sm text-gray-500">
                  缺失: {item.missingItems.join(', ')}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                提交时间: {new Date(item.submittedAt).toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors opacity-0 group-hover:opacity-100">
            <Upload className="w-4 h-4" />
            去补材料
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

interface CageCardProps {
  cage: CageWithPet;
}

function CageCard({ cage }: CageCardProps) {
  const statusConfig = {
    available: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      badge: 'bg-green-100 text-green-700',
      icon: CheckCircle2,
      label: '可用'
    },
    occupied: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-700',
      icon: Dog,
      label: '占用'
    },
    maintenance: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-700',
      badge: 'bg-gray-100 text-gray-700',
      icon: Wrench,
      label: '维护'
    }
  };

  const isIsolation = cage.type === 'isolation';
  const config = cage.status === 'occupied' && isIsolation
    ? {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
        badge: 'bg-orange-100 text-orange-700',
        icon: ShieldAlert,
        label: '隔离'
      }
    : statusConfig[cage.status];

  const StatusIcon = config.icon;

  return (
    <div
      className={cn(
        "p-4 rounded-xl border-2 transition-all duration-300",
        "hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
        config.bg,
        config.border
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className={cn("font-bold text-lg", config.text)}>{cage.code}</p>
          <p className="text-xs text-gray-500">{cage.name}</p>
        </div>
        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", config.badge)}>
          {isIsolation && cage.status === 'occupied' ? '隔离' : config.label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <StatusIcon className={cn("w-4 h-4", config.text)} />
        {cage.pet ? (
          <span className={cn("text-sm font-medium", config.text)}>{cage.pet.name}</span>
        ) : (
          <span className="text-sm text-gray-400">
            {cage.status === 'maintenance' ? '维护中' : '空笼位'}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-1">
        <span className="text-xs px-1.5 py-0.5 bg-white/60 rounded text-gray-500">
          {cage.size === 'small' ? '小' : cage.size === 'medium' ? '中' : '大'}
        </span>
        <span className="text-xs px-1.5 py-0.5 bg-white/60 rounded text-gray-500">
          {cage.suitableFor === 'dog' ? '犬' : cage.suitableFor === 'cat' ? '猫' : '通用'}
        </span>
      </div>
    </div>
  );
}

function CageGrid({ cages }: { cages: CageWithPet[] }) {
  const available = cages.filter(c => c.status === 'available').length;
  const occupied = cages.filter(c => c.status === 'occupied').length;
  const isolation = cages.filter(c => c.status === 'occupied' && c.type === 'isolation').length;
  const maintenance = cages.filter(c => c.status === 'maintenance').length;

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-600">可用 {available}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-sm text-gray-600">占用 {occupied - isolation}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-sm text-gray-600">隔离 {isolation}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <span className="text-sm text-gray-600">维护 {maintenance}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {cages.map((cage, index) => (
          <div
            key={cage.id}
            className="animate-fadeIn"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <CageCard cage={cage} />
          </div>
        ))}
      </div>
    </div>
  );
}

function HighRiskCard({ item }: { item: HighRiskItem }) {
  return (
    <div className="relative pl-1">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-full"></div>
      <div className="ml-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-red-200 hover:shadow-md transition-all duration-300">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {item.pet.photoUrl ? (
              <img src={item.pet.photoUrl} alt={item.pet.name} className="w-full h-full object-cover" />
            ) : item.pet.species === 'dog' ? (
              <Dog className="w-6 h-6 text-red-600" />
            ) : item.pet.species === 'cat' ? (
              <Cat className="w-6 h-6 text-orange-600" />
            ) : (
              <PawPrint className="w-6 h-6 text-gray-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-gray-900">{item.pet.name}</h4>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                高风险
              </span>
            </div>
            <div className="mt-2 space-y-1">
              {item.riskReasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">{reason}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button className="flex-1 py-2 px-4 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5">
                <Activity className="w-4 h-4" />
                紧急处理
              </button>
              <button className="py-2 px-4 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                查看详情
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, icon: Icon, action }: { title: string; icon: React.ElementType; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-gray-100 rounded-lg">
          <Icon className="w-4 h-4 text-gray-700" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>
      {action}
    </div>
  );
}

export default function Dashboard() {
  const { stats, expiringVaccines, pendingMaterials, highRiskList, cages, loading, error, refresh } = useDashboardData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-gray-500">加载数据中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">数据看板</h1>
            <p className="text-gray-500 mt-1">实时监控寄养中心运营状态</p>
          </div>
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            刷新数据
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatCard
            title="今日入住"
            value={stats?.todayCheckIn || 0}
            icon={CalendarCheck}
            color="bg-gradient-to-br from-green-400 to-emerald-500"
            delay={0}
          />
          <StatCard
            title="今日退房"
            value={stats?.todayCheckOut || 0}
            icon={CalendarX}
            color="bg-gradient-to-br from-blue-400 to-indigo-500"
            delay={100}
          />
          <StatCard
            title="在住宠物"
            value={stats?.currentlyStaying || 0}
            icon={PawPrint}
            color="bg-gradient-to-br from-purple-400 to-violet-500"
            delay={200}
          />
          <StatCard
            title="待补材料"
            value={stats?.pendingMaterials || 0}
            icon={FileWarning}
            color="bg-gradient-to-br from-amber-400 to-orange-500"
            delay={300}
          />
          <StatCard
            title="隔离宠物"
            value={stats?.isolationCount || 0}
            icon={ShieldAlert}
            color="bg-gradient-to-br from-orange-400 to-red-500"
            delay={400}
          />
          <StatCard
            title="高风险宠物"
            value={stats?.highRiskCount || 0}
            icon={AlertTriangle}
            color="bg-gradient-to-br from-red-400 to-rose-500"
            delay={500}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <SectionHeader
              title="疫苗临期提醒"
              icon={Scissors}
              action={
                <span className="text-sm text-gray-500">30天内到期</span>
              }
            />
            <VaccineTable data={expiringVaccines} />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <SectionHeader
              title="待补材料"
              icon={FileWarning}
              action={
                <span className="text-sm text-gray-500">{pendingMaterials.length} 条待处理</span>
              }
            />
            <PendingMaterialsList data={pendingMaterials} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <SectionHeader
            title="笼位状态"
            icon={PawPrint}
            action={
              <span className="text-sm text-gray-500">共 {cages.length} 个笼位</span>
            }
          />
          <CageGrid cages={cages} />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <SectionHeader
            title="高风险宠物提醒"
            icon={AlertTriangle}
            action={
              <span className="text-sm text-red-500 font-medium">{highRiskList.length} 个需要关注</span>
            }
          />
          {highRiskList.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <p>暂无高风险宠物</p>
            </div>
          ) : (
            <div className="space-y-3">
              {highRiskList.map((item, index) => (
                <div
                  key={item.pet.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <HighRiskCard item={item} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
