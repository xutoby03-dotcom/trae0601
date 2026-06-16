import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  FileClock,
  ClipboardCheck,
  DollarSign,
  ChevronRight,
  Thermometer,
  Clock,
  User,
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { useFreezerStore } from '@/store/freezerStore';
import { useInspectionStore } from '@/store/inspectionStore';
import { useLossReportStore } from '@/store/lossReportStore';
import { formatDateTime, formatCurrency } from '@/utils/format';
import { shiftLabels } from '@/utils/mockData';

export default function Dashboard() {
  const navigate = useNavigate();
  const { freezers } = useFreezerStore();
  const { inspections } = useInspectionStore();
  const { lossReports, getStatistics, getPendingCount } = useLossReportStore();

  const stats = getStatistics();
  const abnormalFreezers = freezers.filter((f) => f.status !== 'normal');
  const recentInspections = inspections.slice(0, 5);
  const pendingReports = lossReports.filter((r) => r.status === 'pending');

  const getFreezerName = (freezerId: string) => {
    return freezers.find((f) => f.id === freezerId)?.name || '未知冷柜';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">欢迎回来，王店长</h1>
        <p className="text-slate-500 mt-1">以下是今日冷柜运营概览</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="异常冷柜"
          value={abnormalFreezers.length}
          icon={AlertTriangle}
          color="red"
          trend={{ value: 25, isPositive: false }}
        />
        <StatCard
          title="待审核报损"
          value={getPendingCount()}
          icon={FileClock}
          color="amber"
          trend={{ value: 10, isPositive: false }}
        />
        <StatCard
          title="今日巡查"
          value={`${inspections.filter((i) => {
            const today = new Date().toDateString();
            return new Date(i.createdAt).toDateString() === today;
          }).length}/${freezers.length}`}
          icon={ClipboardCheck}
          color="blue"
        />
        <StatCard
          title="累计报损金额"
          value={formatCurrency(stats.totalLossAmount)}
          icon={DollarSign}
          color="green"
          trend={{ value: 5, isPositive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">最近巡查记录</h2>
              <button
                onClick={() => navigate('/inspections')}
                className="text-sm text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors"
              >
                查看全部 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {recentInspections.length === 0 ? (
              <div className="p-12 text-center text-slate-400">暂无巡查记录</div>
            ) : (
              recentInspections.map((inspection) => (
                <div
                  key={inspection.id}
                  className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => navigate('/inspections')}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          inspection.isAbnormal
                            ? 'bg-red-100 text-red-600'
                            : 'bg-emerald-100 text-emerald-600'
                        }`}
                      >
                        <Thermometer className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {getFreezerName(inspection.freezerId)}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDateTime(inspection.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {inspection.inspector}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`text-lg font-bold ${
                          inspection.isAbnormal ? 'text-red-600' : 'text-emerald-600'
                        }`}
                      >
                        {inspection.temperature}°C
                      </span>
                      <StatusBadge
                        type="freezer"
                        status={inspection.isAbnormal ? 'abnormal' : 'normal'}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">异常冷柜</h2>
            </div>
            <div className="p-4 space-y-3">
              {abnormalFreezers.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  所有冷柜运行正常
                </div>
              ) : (
                abnormalFreezers.map((freezer) => (
                  <div
                    key={freezer.id}
                    className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/freezers/${freezer.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{freezer.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{freezer.location}</p>
                      </div>
                      <StatusBadge type="freezer" status={freezer.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">待审核报损</h2>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                  {pendingReports.length} 条
                </span>
              </div>
            </div>
            <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
              {pendingReports.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">暂无待审核报损</div>
              ) : (
                pendingReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/loss-reports/${report.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900 text-sm">
                          {getFreezerName(report.freezerId)}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {report.type === 'loss' ? '报损' : '隔离'} · {report.items.length} 种商品
                        </p>
                      </div>
                      <span className="font-bold text-red-600 text-sm">
                        {formatCurrency(report.totalAmount)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
