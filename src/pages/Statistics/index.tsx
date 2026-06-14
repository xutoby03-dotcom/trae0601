import { useMemo } from 'react';
import {
  BarChart3,
  Users,
  Clock,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Flame,
  Building2,
} from 'lucide-react';
import { useInspectionStore } from '@/store/inspectionStore';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  calculateBuildingStats,
  calculateResidentStats,
  calculateCleanupStats,
  calculateRiskPoints,
} from '@/utils/helpers';
import { formatDate } from '@/utils/date';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function Statistics() {
  const { inspections } = useInspectionStore();

  const buildingStats = useMemo(() => calculateBuildingStats(inspections), [inspections]);
  const residentStats = useMemo(() => calculateResidentStats(inspections), [inspections]);
  const cleanupStats = useMemo(() => calculateCleanupStats(inspections), [inspections]);
  const riskPoints = useMemo(() => calculateRiskPoints(inspections), [inspections]);

  const itemTypeData = useMemo(() => {
    const map = new Map<string, number>();
    inspections.forEach((i) => {
      map.set(i.itemType, (map.get(i.itemType) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [inspections]);

  const barData = buildingStats.map((b) => ({
    name: b.building,
    待处理: b.pendingCount + b.overdueCount,
    已清理: b.cleanedCount,
  }));

  const cleanupDistributionData = [
    { name: '3天内', value: cleanupStats.within3Days, color: '#10b981' },
    { name: '7天内', value: cleanupStats.within7Days, color: '#f59e0b' },
    { name: '7天以上', value: cleanupStats.over7Days, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">平均清理天数</p>
                <p className="text-3xl font-bold text-gray-800">{cleanupStats.avgDays}<span className="text-base font-normal text-gray-400 ml-1">天</span></p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">累计已清理</p>
                <p className="text-3xl font-bold text-gray-800">{cleanupStats.totalCleaned}<span className="text-base font-normal text-gray-400 ml-1">条</span></p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">重复堆放住户</p>
                <p className="text-3xl font-bold text-gray-800">{residentStats.length}<span className="text-base font-normal text-gray-400 ml-1">户</span></p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">高风险点位</p>
                <p className="text-3xl font-bold text-gray-800">{riskPoints.filter(r => r.riskLevel === 'high').length}<span className="text-base font-normal text-gray-400 ml-1">处</span></p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-800">各楼栋未处理数量</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="待处理" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="已清理" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-gray-800">物品类型分布</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={itemTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {itemTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-gray-800">重复堆放住户排行</h3>
            </div>
          </CardHeader>
          <CardBody>
            {residentStats.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>暂无重复堆放住户记录</p>
              </div>
            ) : (
              <div className="space-y-3">
                {residentStats.map((resident, index) => (
                  <div
                    key={resident.resident}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0
                          ? 'bg-amber-500 text-white'
                          : index === 1
                          ? 'bg-gray-400 text-white'
                          : index === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{resident.resident}</p>
                      <p className="text-xs text-gray-500">{resident.building}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">{resident.count} 次</p>
                      <p className="text-xs text-gray-500">
                        最近：{formatDate(resident.lastOccurrence, 'MM-dd')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-gray-800">清理时效分布</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {cleanupDistributionData.map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-600">{item.name}</span>
                    <span className="text-sm font-medium text-gray-800">{item.value} 条</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: cleanupStats.totalCleaned > 0
                          ? `${(item.value / cleanupStats.totalCleaned) * 100}%`
                          : '0%',
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-100 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">平均清理时长</span>
                  <span className="text-xl font-bold text-gray-800">{cleanupStats.avgDays} 天</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-gray-800">高风险点位</h3>
          </div>
        </CardHeader>
        <CardBody>
          {riskPoints.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无风险点位记录</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {riskPoints.slice(0, 9).map((point, index) => (
                <div
                  key={`${point.building}-${point.floor}-${point.location}-${index}`}
                  className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                    point.riskLevel === 'high'
                      ? 'bg-red-50 border-red-200'
                      : point.riskLevel === 'medium'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin
                        className={`w-5 h-5 ${
                          point.riskLevel === 'high'
                            ? 'text-red-500'
                            : point.riskLevel === 'medium'
                            ? 'text-amber-500'
                            : 'text-gray-500'
                        }`}
                      />
                      <span className="font-medium text-gray-800">
                        {point.building} {point.floor}
                      </span>
                    </div>
                    <StatusBadge type="risk" status={point.riskLevel} size="sm" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{point.location}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>累计 {point.count} 次</span>
                    <span>最近：{formatDate(point.lastOccurrence, 'MM-dd')}</span>
                  </div>
                  {point.isFireExit && (
                    <div className="flex items-center gap-1 mt-3 text-xs text-red-600">
                      <Flame className="w-3.5 h-3.5" />
                      <span>消防通道</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
