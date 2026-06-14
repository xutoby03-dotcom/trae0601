import { useMemo } from 'react';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  MapPin,
  User,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { useInspectionStore } from '@/store/inspectionStore';
import StatCard from '@/components/ui/StatCard';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import { calculateBuildingStats, calculateRiskPoints } from '@/utils/helpers';
import { formatDate } from '@/utils/date';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const { inspections } = useInspectionStore();

  const stats = useMemo(() => {
    const pending = inspections.filter((i) => i.status === 'pending').length;
    const notified = inspections.filter((i) => i.status === 'notified').length;
    const cleaned = inspections.filter((i) => i.status === 'cleaned').length;
    const overdue = inspections.filter((i) => i.status === 'overdue' || i.status === 'recheck').length;
    const fireExit = inspections.filter((i) => i.isFireExit && i.status !== 'cleaned').length;
    
    return {
      total: inspections.length,
      pending: pending + notified,
      cleaned,
      overdue,
      fireExit,
    };
  }, [inspections]);

  const buildingStats = useMemo(() => calculateBuildingStats(inspections), [inspections]);
  const riskPoints = useMemo(() => calculateRiskPoints(inspections).slice(0, 5), [inspections]);

  const pendingList = useMemo(() => {
    return inspections
      .filter((i) => i.status !== 'cleaned')
      .sort((a, b) => {
        const priorityOrder = { overdue: 0, recheck: 1, pending: 2, notified: 3 };
        const aPriority = priorityOrder[a.status as keyof typeof priorityOrder] ?? 4;
        const bPriority = priorityOrder[b.status as keyof typeof priorityOrder] ?? 4;
        if (aPriority !== bPriority) return aPriority - bPriority;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      })
      .slice(0, 6);
  }, [inspections]);

  const barData = buildingStats.map((b) => ({
    name: b.building,
    未处理: b.pendingCount + b.overdueCount,
    已清理: b.cleanedCount,
  }));

  const barColors = {
    未处理: '#f59e0b',
    已清理: '#10b981',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="总巡查数"
          value={stats.total}
          icon={ClipboardList}
          color="blue"
          trend={12}
        />
        <StatCard
          title="待处理"
          value={stats.pending}
          icon={Clock}
          color="amber"
          trend={-5}
        />
        <StatCard
          title="已清理"
          value={stats.cleaned}
          icon={CheckCircle2}
          color="green"
          trend={8}
        />
        <StatCard
          title="已超期"
          value={stats.overdue}
          icon={AlertTriangle}
          color="red"
          trend={15}
        />
        <StatCard
          title="消防通道遮挡"
          value={stats.fireExit}
          icon={Flame}
          color="purple"
          trend={-10}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-gray-800">高风险点位</h3>
                </div>
                <button
                  onClick={() => navigate('/statistics')}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                >
                  查看全部 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {riskPoints.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">暂无高风险点位</p>
                ) : (
                  riskPoints.map((point, index) => (
                    <div
                      key={`${point.building}-${point.floor}-${point.location}`}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        point.riskLevel === 'high'
                          ? 'bg-red-50 border-red-200 hover:bg-red-100/50'
                          : point.riskLevel === 'medium'
                          ? 'bg-amber-50 border-amber-200 hover:bg-amber-100/50'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            point.riskLevel === 'high'
                              ? 'bg-red-200 text-red-700'
                              : point.riskLevel === 'medium'
                              ? 'bg-amber-200 text-amber-700'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">
                            {point.building} {point.floor} {point.location}
                          </p>
                          <p className="text-xs text-gray-500">
                            累计出现 {point.count} 次
                            {point.isFireExit && ' · 消防通道'}
                          </p>
                        </div>
                      </div>
                      <StatusBadge type="risk" status={point.riskLevel} size="sm" />
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-800">待处理记录</h3>
                </div>
                <button
                  onClick={() => navigate('/inspections')}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                >
                  全部记录 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {pendingList.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">暂无待处理记录</p>
                ) : (
                  pendingList.map((inspection) => (
                    <div
                      key={inspection.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                      onClick={() => navigate(`/inspections`)}
                    >
                      <img
                        src={inspection.photo}
                        alt={inspection.location}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-800 truncate">
                            {inspection.building} {inspection.floor} {inspection.location}
                          </p>
                          {inspection.isFireExit && (
                            <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" title="消防通道" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {inspection.suspectedResident}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(inspection.createdAt, 'MM-dd')}
                          </span>
                        </div>
                      </div>
                      <StatusBadge type="inspection" status={inspection.status} size="sm" />
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-500" />
                <h3 className="font-semibold text-gray-800">各楼栋分布</h3>
              </div>
            </CardHeader>
            <CardBody>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData}
                    layout="vertical"
                    margin={{ left: 10, right: 10, top: 5, bottom: 5 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={55}
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
                    <Bar dataKey="未处理" stackId="a" radius={[0, 0, 0, 0]}>
                      {barData.map((_, index) => (
                        <Cell key={`cell-1-${index}`} fill={barColors['未处理']} />
                      ))}
                    </Bar>
                    <Bar dataKey="已清理" stackId="a" radius={[0, 4, 4, 0]}>
                      {barData.map((_, index) => (
                        <Cell key={`cell-2-${index}`} fill={barColors['已清理']} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-amber-500" />
                  <span className="text-xs text-gray-600">未处理</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                  <span className="text-xs text-gray-600">已清理</span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-gray-800">消防安全提示</h3>
              </div>
            </CardHeader>
            <CardBody>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-red-800 mb-1">消防通道禁止占用</h4>
                    <p className="text-sm text-red-700 leading-relaxed">
                      发现 {stats.fireExit} 处消防通道被占用，请立即督促相关住户清理，确保生命通道畅通。
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  消防通道宽度不得小于1.4米
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  严禁堆放任何杂物、车辆
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  保持防火门关闭且完好
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
