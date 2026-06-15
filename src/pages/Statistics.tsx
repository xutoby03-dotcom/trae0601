import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  getLowStockAlerts,
  getExpiryAlerts,
  getVisitAlerts,
  getMissedStats,
} from '../utils/statisticsUtils';
import MedicineAvatar from '../components/Common/MedicineAvatar';
import {
  AlertTriangle,
  CalendarX,
  CalendarClock,
  PackageX,
  TrendingDown,
  BarChart3,
  AlertOctagon,
  CheckCircle2,
  Pill,
} from 'lucide-react';

export default function Statistics() {
  const { medicines, schedules, packingSlots, medicationRecords } = useAppStore();

  const now = new Date();
  const lowStockAlerts = useMemo(
    () => getLowStockAlerts(medicines, schedules),
    [medicines, schedules]
  );

  const expiryAlerts = useMemo(() => getExpiryAlerts(medicines), [medicines]);

  const visitAlerts = useMemo(
    () => getVisitAlerts(medicines, schedules),
    [medicines, schedules]
  );

  const missedStats = useMemo(
    () => getMissedStats(medicationRecords, packingSlots, medicines, schedules, now),
    [medicationRecords, packingSlots, medicines, schedules, now]
  );

  const maxWeekly = Math.max(...missedStats.weeklyDistribution, 1);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: '"Noto Serif SC", serif' }}>
          📊 月度统计
        </h1>
        <p className="mt-1 text-gray-600">
          {now.getFullYear()}年{now.getMonth() + 1}月 · 漏服统计与预警清单
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-3xl shadow-md border border-emerald-100/60 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-red-100 rounded-full -translate-y-8 translate-x-8 opacity-60" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center">
                <AlertOctagon className="h-6 w-6 text-red-600" />
              </div>
              <TrendingDown className="h-5 w-5 text-red-400" />
            </div>
            <div className="text-sm text-gray-500 mb-1">本月漏服次数</div>
            <div className="text-5xl font-bold text-red-600 mb-1">{missedStats.totalMissed}</div>
            <div className="text-xs text-gray-400">
              已服药 {missedStats.totalTaken} 次 · 吐出重服 {missedStats.totalVomited} 次
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-md border border-emerald-100/60 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-amber-100 rounded-full -translate-y-8 translate-x-8 opacity-60" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center">
                <PackageX className="h-6 w-6 text-amber-600" />
              </div>
              <Pill className="h-5 w-5 text-amber-400" />
            </div>
            <div className="text-sm text-gray-500 mb-1">库存不足药品</div>
            <div className="text-5xl font-bold text-amber-600 mb-1">{lowStockAlerts.length}</div>
            <div className="text-xs text-gray-400">剩余不足7天用量，需要补货</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-md border border-emerald-100/60 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-blue-100 rounded-full -translate-y-8 translate-x-8 opacity-60" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                <CalendarClock className="h-6 w-6 text-blue-600" />
              </div>
              <CheckCircle2 className="h-5 w-5 text-blue-400" />
            </div>
            <div className="text-sm text-gray-500 mb-1">近期复诊提醒</div>
            <div className="text-5xl font-bold text-blue-600 mb-1">{visitAlerts.length}</div>
            <div className="text-xs text-gray-400">两周内需复诊 {visitAlerts.filter(v => v.isUrgent).length} 项紧急</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-md border border-emerald-100/60 p-6 mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-emerald-600" />
          本月漏服按周分布
        </h3>
        <div className="flex items-end gap-4 h-40 px-2">
          {missedStats.weeklyDistribution.map((count, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="text-sm font-bold text-red-600 h-5">{count || ''}</div>
              <div className="w-full flex flex-col justify-end h-full">
                <div
                  className="w-full bg-gradient-to-t from-red-500 to-red-300 rounded-t-xl transition-all duration-500"
                  style={{ height: `${(count / maxWeekly) * 100}%`, minHeight: count > 0 ? '8px' : '0' }}
                />
              </div>
              <div className="text-xs text-gray-500 font-medium">第{idx + 1}周</div>
            </div>
          ))}
        </div>
        {missedStats.byMedicine.length > 0 && (
          <div className="mt-6 pt-5 border-t border-gray-100">
            <h4 className="text-sm font-bold text-gray-600 mb-3">漏服最多的药品</h4>
            <div className="flex flex-wrap gap-2">
              {missedStats.byMedicine.slice(0, 5).map((item) => (
                <span
                  key={item.medicineId}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-200"
                >
                  {item.medicineName}
                  <span className="font-bold">{item.count}次</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl shadow-md border-2 border-amber-200 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-100 to-orange-50 px-6 py-4 border-b border-amber-200">
            <h3 className="font-bold text-amber-800 flex items-center gap-2">
              <PackageX className="h-5 w-5" />
              库存预警（{lowStockAlerts.length}）
            </h3>
            <p className="text-xs text-amber-600 mt-0.5">剩余片数不足7天用量</p>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            {lowStockAlerts.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">✅ 库存充足，无需补货</p>
            ) : (
              <div className="space-y-3">
                {lowStockAlerts.map(({ medicine, daysRemaining, dailyUsage }) => (
                  <div
                    key={medicine.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50/50 border border-amber-100"
                  >
                    <MedicineAvatar medicine={medicine} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 text-sm truncate">{medicine.name}</div>
                      <div className="text-xs text-gray-500">
                        剩{medicine.remainingPills}片 · 日需{dailyUsage}片
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${daysRemaining <= 2 ? 'text-red-600' : 'text-amber-600'}`}>
                        {daysRemaining}天
                      </div>
                      <div className="text-[10px] text-gray-400">用量</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-md border-2 border-red-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-100 to-rose-50 px-6 py-4 border-b border-red-200">
            <h3 className="font-bold text-red-800 flex items-center gap-2">
              <CalendarX className="h-5 w-5" />
              过期预警（{expiryAlerts.length}）
            </h3>
            <p className="text-xs text-red-600 mt-0.5">30天内即将过期</p>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            {expiryAlerts.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">✅ 暂无过期药品</p>
            ) : (
              <div className="space-y-3">
                {expiryAlerts.map(({ medicine, daysToExpiry }) => (
                  <div
                    key={medicine.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl border ${
                      daysToExpiry <= 0
                        ? 'bg-red-50 border-red-200'
                        : 'bg-red-50/40 border-red-100'
                    }`}
                  >
                    <MedicineAvatar medicine={medicine} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 text-sm truncate">{medicine.name}</div>
                      <div className="text-xs text-gray-500">过期日：{medicine.expiryDate}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${daysToExpiry <= 0 ? 'text-red-700' : 'text-red-500'}`}>
                        {daysToExpiry <= 0 ? '已过期' : `${daysToExpiry}天`}
                      </div>
                      <div className="text-[10px] text-gray-400">{daysToExpiry <= 0 ? '禁用' : '剩余'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-md border-2 border-blue-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-100 to-sky-50 px-6 py-4 border-b border-blue-200">
            <h3 className="font-bold text-blue-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              复诊提醒（{visitAlerts.length}）
            </h3>
            <p className="text-xs text-blue-600 mt-0.5">两周内需复诊的药品</p>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            {visitAlerts.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">✅ 暂无复诊安排</p>
            ) : (
              <div className="space-y-3">
                {visitAlerts.map(({ medicine, schedule, daysToVisit, isUrgent }) => (
                  <div
                    key={medicine.id + schedule.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl border ${
                      isUrgent ? 'bg-blue-50 border-blue-300' : 'bg-blue-50/40 border-blue-100'
                    }`}
                  >
                    <MedicineAvatar medicine={medicine} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 text-sm truncate">{medicine.name}</div>
                      <div className="text-xs text-gray-500">复诊日：{schedule.nextVisitDate}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${isUrgent ? 'text-blue-700' : 'text-blue-500'}`}>
                        {daysToVisit <= 0 ? '已到期' : `${daysToVisit}天`}
                      </div>
                      <div className="text-[10px] text-gray-400">{isUrgent ? '紧急' : '后'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
