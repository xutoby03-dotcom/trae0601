import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Droplets, Wrench, AlertTriangle, TrendingUp, CheckCircle, XCircle,
  ArrowRight, Plus
} from 'lucide-react';
import { useBoxStore } from '../store/useBoxStore';
import { useRiderStore } from '../store/useRiderStore';
import { useCleaningStore } from '../store/useCleaningStore';
import { useMaintenanceStore } from '../store/useMaintenanceStore';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { AlertBanner } from '../components/ui/AlertBanner';
import { Button } from '../components/ui/Button';
import { formatDate, getTodayString } from '../utils/helpers';
import {
  getCleaningCompletionRate, getPendingCleaningBoxes, getAbnormalBoxes,
  getReplacementWarning, isFullyCleaned
} from '../utils/businessRules';
import { BOX_STATUS_LABELS, ISSUE_TYPE_LABELS } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const { boxes, fetchBoxes } = useBoxStore();
  const { riders, fetchRiders } = useRiderStore();
  const { cleaningRecords, fetchCleaningRecords } = useCleaningStore();
  const { maintenanceRecords, fetchMaintenanceRecords } = useMaintenanceStore();

  useEffect(() => {
    fetchBoxes();
    fetchRiders();
    fetchCleaningRecords();
    fetchMaintenanceRecords();
  }, [fetchBoxes, fetchRiders, fetchCleaningRecords, fetchMaintenanceRecords]);

  const today = getTodayString();
  const activeBoxes = boxes.filter(b => b.status !== 'scrapped');

  const stats = useMemo(() => {
    const completionRate = getCleaningCompletionRate(boxes, cleaningRecords, today);
    const pendingCleaning = getPendingCleaningBoxes(boxes, cleaningRecords, today);
    const abnormalBoxes = getAbnormalBoxes(boxes, maintenanceRecords);
    const needsReplace = activeBoxes.filter(b =>
      getReplacementWarning(b, maintenanceRecords).needsReplace
    ).length;

    return {
      totalBoxes: activeBoxes.length,
      totalRiders: riders.length,
      completionRate,
      pendingCleaning: pendingCleaning.length,
      abnormalBoxes: abnormalBoxes.length,
      needsReplace,
    };
  }, [boxes, cleaningRecords, maintenanceRecords, today, activeBoxes, riders.length]);

  const cleaningTrendData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const rate = getCleaningCompletionRate(boxes, cleaningRecords, dateStr);

      data.push({
        date: formatDate(dateStr, 'MM-dd'),
        完成率: rate,
      });
    }
    return data;
  }, [boxes, cleaningRecords]);

  const pendingCleaningList = useMemo(() => {
    return getPendingCleaningBoxes(boxes, cleaningRecords, today)
      .slice(0, 5)
      .map(box => {
        const rider = riders.find(r => r.id === box.riderId);
        return { box, riderName: rider?.name || '未分配' };
      });
  }, [boxes, cleaningRecords, today, riders]);

  const openMaintenanceList = useMemo(() => {
    return maintenanceRecords
      .filter(r => r.status === 'pending' || r.status === 'in_progress')
      .slice(0, 5)
      .map(record => {
        const box = boxes.find(b => b.id === record.boxId);
        const rider = riders.find(r => r.id === box?.riderId);
        return {
          record,
          boxNumber: box?.boxNumber || '未知',
          riderName: rider?.name || '未分配',
        };
      });
  }, [maintenanceRecords, boxes, riders]);

  const recentCleaningList = useMemo(() => {
    return [...cleaningRecords]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(record => {
        const box = boxes.find(b => b.id === record.boxId);
        return {
          record,
          boxNumber: box?.boxNumber || '未知',
        };
      });
  }, [cleaningRecords, boxes]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
          <p className="text-sm text-gray-500 mt-1">欢迎使用保温箱清洁台账管理系统</p>
        </div>
        <div className="flex gap-3">
          <Link to="/cleaning">
            <Button variant="secondary">
              <Droplets className="w-4 h-4" />
              清洁登记
            </Button>
          </Link>
          <Link to="/maintenance/new">
            <Button>
              <Plus className="w-4 h-4" />
              上报异常
            </Button>
          </Link>
        </div>
      </div>

      {stats.pendingCleaning > 0 && (
        <AlertBanner
          type="warning"
          title="待清洁提醒"
          message={`当前有 ${stats.pendingCleaning} 个保温箱尚未完成今日清洁，请及时处理`}
        />
      )}

      <div className="grid grid-cols-5 gap-4">
        <StatCard
          title="保温箱总数"
          value={stats.totalBoxes}
          icon={Package}
          color="orange"
        />
        <StatCard
          title="骑手总数"
          value={stats.totalRiders}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="今日清洁完成率"
          value={`${stats.completionRate}%`}
          icon={Droplets}
          color="green"
          trend={{ value: stats.completionRate - 85, isPositive: stats.completionRate >= 85 }}
        />
        <StatCard
          title="待清洁箱子"
          value={stats.pendingCleaning}
          icon={XCircle}
          color={stats.pendingCleaning > 0 ? 'red' : 'green'}
        />
        <StatCard
          title="异常箱子"
          value={stats.abnormalBoxes}
          icon={Wrench}
          color={stats.abnormalBoxes > 0 ? 'orange' : 'green'}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            近7天清洁完成率趋势
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cleaningTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="完成率"
                  stroke="#FF6B35"
                  strokeWidth={2}
                  dot={{ fill: '#FF6B35' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            快速概览
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-700">已清洁箱子</span>
              </div>
              <span className="font-bold text-green-600">
                {stats.totalBoxes - stats.pendingCleaning}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-gray-700">待清洁箱子</span>
              </div>
              <span className="font-bold text-orange-600">{stats.pendingCleaning}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-700">维修中箱子</span>
              </div>
              <span className="font-bold text-blue-600">{stats.abnormalBoxes}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-gray-700">需更换箱子</span>
              </div>
              <span className="font-bold text-red-600">{stats.needsReplace}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">待清洁箱子</h3>
            <Link to="/cleaning" className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {pendingCleaningList.length > 0 ? (
              pendingCleaningList.map(({ box, riderName }) => (
                <div key={box.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{box.boxNumber}</p>
                    <p className="text-xs text-gray-500">{riderName}</p>
                  </div>
                  <Link to={`/cleaning/${box.id}`}>
                    <Button size="sm" variant="primary">
                      去清洁
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-300" />
                <p className="text-sm">所有箱子已完成清洁</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">待处理异常</h3>
            <Link to="/maintenance" className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {openMaintenanceList.length > 0 ? (
              openMaintenanceList.map(({ record, boxNumber, riderName }) => (
                <div key={record.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{boxNumber}</span>
                    <StatusBadge status={record.status} label={ISSUE_TYPE_LABELS[record.issueType]} />
                  </div>
                  <p className="text-xs text-gray-500">{riderName} · {formatDate(record.reportedDate)}</p>
                  <p className="text-sm text-gray-600 mt-1 truncate">{record.description}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-300" />
                <p className="text-sm">暂无待处理异常</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">最近清洁</h3>
            <Link to="/cleaning" className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentCleaningList.length > 0 ? (
              recentCleaningList.map(({ record, boxNumber }) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{boxNumber}</p>
                    <p className="text-xs text-gray-500">清洁人: {record.cleanedBy}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge
                      status={isFullyCleaned(record) ? 'active' : 'pending_cleaning'}
                      label={isFullyCleaned(record) ? '完成' : '部分'}
                    />
                    <p className="text-xs text-gray-500 mt-1">{formatDate(record.createdAt, 'HH:mm')}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">暂无清洁记录</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
