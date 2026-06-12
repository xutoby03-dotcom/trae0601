import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import Button from "@/components/Button";
import {
  Bike,
  AlertTriangle,
  ClipboardList,
  MapPin,
  Zap,
  ArrowRight,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { dashboard, fetchDashboard, loading } = useStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading && !dashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">数据看板</h2>
          <p className="mt-1 text-sm text-slate-500">车棚运行总览 · 实时掌握各区域状态</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate("/patrols")}>
            <ClipboardList size={16} /> 发起巡查
          </Button>
          <Button onClick={() => navigate("/disposals")}>
            <AlertTriangle size={16} /> 处理清单
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="登记车辆总数"
          value={dashboard?.totalVehicles ?? 0}
          hint="辆"
          accent="primary"
          icon={<Bike size={20} />}
        />
        <StatCard
          label="疑似废弃车辆"
          value={dashboard?.totalSuspicious ?? 0}
          hint="辆 · 需关注"
          accent="warning"
          icon={<AlertTriangle size={20} />}
        />
        <StatCard
          label="待处理清单"
          value={dashboard?.pendingDisposals ?? 0}
          hint="辆 · 超期未挪"
          accent="danger"
          icon={<ClipboardList size={20} />}
        />
        <StatCard
          label="车棚区域数"
          value={dashboard?.areas.length ?? 0}
          hint="个"
          accent="success"
          icon={<MapPin size={20} />}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">各区域使用情况</h3>
          <button
            onClick={() => navigate("/areas")}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            查看全部 <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dashboard?.areas.map((area) => {
            const usageRate = area.capacity > 0 ? Math.round((area.used / area.capacity) * 100) : 0;
            const chargingRate =
              area.chargingCapacity > 0
                ? Math.round((area.chargingUsed / area.chargingCapacity) * 100)
                : 0;
            const isWarning = area.suspiciousCount > 0 || usageRate >= 90;
            return (
              <div
                key={area.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-semibold text-slate-800">{area.name}</h4>
                      {isWarning && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-warning-50 text-warning-600 border border-warning-200">
                          需关注
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">容量 {area.capacity} 个车位</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">剩余车位</p>
                    <p className="text-2xl font-bold text-success-600">{area.remaining}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">车位使用率</span>
                      <span className="font-medium text-slate-700">
                        {area.used}/{area.capacity} ({usageRate}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          usageRate >= 90 ? "bg-danger-500" : usageRate >= 70 ? "bg-warning-500" : "bg-success-500"
                        }`}
                        style={{ width: `${usageRate}%` }}
                      />
                    </div>
                  </div>

                  {area.chargingCapacity > 0 && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Zap size={12} /> 充电位
                        </span>
                        <span className="font-medium text-slate-700">
                          {area.chargingUsed}/{area.chargingCapacity} ({chargingRate}%)
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary-500 transition-all"
                          style={{ width: `${chargingRate}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {area.suspiciousCount > 0 && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <StatusBadge status="suspicious" />
                      <span className="text-xs text-slate-500">
                        {area.suspiciousCount} 辆疑似废弃车辆
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
