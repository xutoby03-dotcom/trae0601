import { useMemo, useState } from 'react';
import {
  BarChart3,
  Users,
  Clock,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Flame,
  Building2,
  Calendar,
  ChevronRight,
  X,
  Home,
  Layers,
  Activity,
} from 'lucide-react';
import { useInspectionStore } from '@/store/inspectionStore';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import {
  calculateBuildingStats,
  calculateResidentStats,
  calculateCleanupStats,
  calculateRiskPoints,
} from '@/utils/helpers';
import { formatDate } from '@/utils/date';
import { Inspection, ResidentStats } from '@/types';
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

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop';

export default function Statistics() {
  const { inspections } = useInspectionStore();
  const [selectedResident, setSelectedResident] = useState<ResidentStats | null>(null);
  const [showResidentModal, setShowResidentModal] = useState(false);

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

  const residentDetailRecords = useMemo(() => {
    if (!selectedResident) return [];
    return inspections
      .filter((i) => i.suspectedResident === selectedResident.resident)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [selectedResident, inspections]);

  const residentSummary = useMemo(() => {
    if (!selectedResident || residentDetailRecords.length === 0) return null;
    const records = residentDetailRecords;
    const buildings = Array.from(new Set(records.map((r) => r.building))).join('、');
    const floors = Array.from(new Set(records.map((r) => `${r.building}${r.floor}`)));
    const itemTypes = Array.from(new Set(records.map((r) => r.itemType)));
    const pendingCount = records.filter((r) => r.status !== 'cleaned').length;
    const latestRecord = records[0];
    return { buildings, floors, itemTypes, pendingCount, latestRecord };
  }, [selectedResident, residentDetailRecords]);

  const handleResidentClick = (resident: ResidentStats) => {
    setSelectedResident(resident);
    setShowResidentModal(true);
  };

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
                    onClick={() => handleResidentClick(resident)}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-amber-50 hover:border-amber-200 border border-transparent cursor-pointer transition-all group"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                        index === 0
                          ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm'
                          : index === 1
                          ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-sm'
                          : index === 2
                          ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-white shadow-sm'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 group-hover:text-amber-700 transition-colors">{resident.resident}</p>
                      <p className="text-xs text-gray-500 truncate">{resident.building} · 累计 {resident.count} 次</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-500 mb-1">最近堆放</p>
                      <p className="text-sm font-medium text-gray-700">{formatDate(resident.lastOccurrence, 'MM-dd')}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
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

      <Modal
        isOpen={showResidentModal && selectedResident !== null}
        onClose={() => setShowResidentModal(false)}
        title={`重复堆放住户详情 - ${selectedResident?.resident || ''}`}
        size="xl"
        footer={
          <div className="flex justify-between w-full">
            <div className="text-sm text-gray-500">
              共 <span className="font-semibold text-gray-700">{selectedResident?.count}</span> 条历史记录
            </div>
            <Button variant="secondary" onClick={() => setShowResidentModal(false)}>关闭</Button>
          </div>
        }
      >
        {selectedResident && residentSummary && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-xl font-bold text-gray-800">{selectedResident.resident}</h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                      <Activity className="w-3 h-3" />
                      重复堆放 {selectedResident.count} 次
                    </span>
                    {residentSummary.pendingCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                        {residentSummary.pendingCount} 条待处理
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-amber-100">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Building2 className="w-4 h-4 text-amber-600" />
                    <span className="text-xs text-amber-700 font-medium">涉及楼栋</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{residentSummary.buildings}</p>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-amber-100">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Home className="w-4 h-4 text-amber-600" />
                    <span className="text-xs text-amber-700 font-medium">涉及楼层</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{residentSummary.floors.length} 处</p>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-amber-100">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <span className="text-xs text-amber-700 font-medium">物品类型</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">
                    {residentSummary.itemTypes.slice(0, 3).join('、')}
                    {residentSummary.itemTypes.length > 3 && ` +${residentSummary.itemTypes.length - 3}`}
                  </p>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-amber-100">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span className="text-xs text-amber-700 font-medium">最近一次</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{formatDate(residentSummary.latestRecord.createdAt, 'MM-dd')}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-4">
                {residentSummary.floors.map((f) => (
                  <span key={f} className="inline-block px-2 py-1 bg-white/80 text-amber-800 text-xs rounded-md border border-amber-200">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  历史堆放记录
                </h4>
                <span className="text-xs text-gray-500">按时间倒序排列</span>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin pr-1">
                {residentDetailRecords.map((record) => (
                  <div
                    key={record.id}
                    className={`border rounded-xl overflow-hidden bg-white hover:shadow-sm transition-all ${
                      record.isFireExit ? 'border-red-200' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative w-full sm:w-28 h-28 flex-shrink-0 bg-gray-100">
                        <img
                          src={record.photo || DEFAULT_PHOTO}
                          alt={record.location}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PHOTO; }}
                        />
                        {record.isFireExit && (
                          <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 bg-red-600 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                            <Flame className="w-2.5 h-2.5" />
                            消防
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-3 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 text-sm">
                              {record.building} {record.floor} {record.location}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                              <Layers className="w-3 h-3" />
                              {record.itemType} · {record.area}㎡
                            </p>
                          </div>
                          <StatusBadge type="inspection" status={record.status} size="sm" />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(record.createdAt, 'yyyy-MM-dd')}
                          </span>
                          {record.recheckCount && record.recheckCount > 0 ? (
                            <span className="text-amber-600 font-medium">复查 {record.recheckCount} 次</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
