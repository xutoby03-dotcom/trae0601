import { useStore } from "@/store/useStore";
import { AlertTriangle, Clock, Send, Package } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 800;
    const startTime = performance.now();
    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * value);
      setDisplay(start);
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [value]);
  return <span>{display}</span>;
}

export default function Dashboard() {
  const { getPendingDistributionExams, getPendingCollectionDistributions, getAnomalyCollections, getRoomUsageData, inventory, getTotalRemaining } = useStore();

  const pendingDist = getPendingDistributionExams();
  const pendingColl = getPendingCollectionDistributions();
  const anomalies = getAnomalyCollections();
  const roomUsage = getRoomUsageData();
  const totalRemaining = getTotalRemaining();
  const totalStock = inventory.reduce((s, b) => s + b.totalQuantity, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1e3a5f]">考务看板</h2>
        <p className="text-sm text-slate-500 mt-1">草稿纸发放回收全局状态总览</p>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500 font-medium">待发放</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <Send size={18} className="text-amber-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#1e3a5f]"><AnimatedNumber value={pendingDist.length} /></p>
          <p className="text-xs text-slate-400 mt-1">个考场</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500 font-medium">待回收</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Clock size={18} className="text-blue-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#1e3a5f]"><AnimatedNumber value={pendingColl.length} /></p>
          <p className="text-xs text-slate-400 mt-1">个考场</p>
        </div>

        <div className={`bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow ${anomalies.length > 0 ? "border-red-200 animate-pulse-red" : "border-slate-100"}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500 font-medium">数量异常</span>
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-500"><AnimatedNumber value={anomalies.length} /></p>
          <p className="text-xs text-slate-400 mt-1">个考场</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500 font-medium">剩余库存</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Package size={18} className="text-emerald-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#1e3a5f]"><AnimatedNumber value={totalRemaining} /></p>
          <p className="text-xs text-slate-400 mt-1">张 / 共 {totalStock} 张</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">各考场用量对比</h3>
          {roomUsage.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={roomUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="room" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="distributed" name="发放" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="collected" name="回收" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-sm text-slate-400">暂无数据</div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">库存批次概览</h3>
          {inventory.length > 0 ? (
            <div className="space-y-4">
              {inventory.map((batch) => (
                <div key={batch.id}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-600 font-medium">批次 {batch.batchNumber}</span>
                    <span className="text-slate-400">{batch.remainingQuantity} / {batch.totalQuantity} 张</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(batch.remainingQuantity / batch.totalQuantity) * 100}%`,
                        backgroundColor: batch.remainingQuantity / batch.totalQuantity > 0.3 ? "#22c55e" : batch.remainingQuantity / batch.totalQuantity > 0.1 ? "#eab308" : "#ef4444",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-slate-400">暂无库存数据</div>
          )}
        </div>
      </div>

      {anomalies.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
          <div className="px-6 py-4 bg-red-50 border-b border-red-100">
            <h3 className="text-sm font-semibold text-red-700 flex items-center gap-2">
              <AlertTriangle size={16} />
              异常考场列表
            </h3>
          </div>
          <div className="divide-y divide-red-50">
            {anomalies.map((a) => (
              <div key={a.id} className={`px-6 py-3 flex items-center justify-between ${a.isLocked ? "bg-red-50/50" : ""}`}>
                <div className="flex items-center gap-3">
                  {a.isLocked && <span className="text-red-500 text-xs">🔒</span>}
                  <span className="text-sm font-medium text-slate-700">考场 {a.roomNumber}</span>
                  <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">缺失 {a.missingCount} 张</span>
                </div>
                <span className="text-xs text-slate-400">{new Date(a.collectedAt).toLocaleString("zh-CN")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
