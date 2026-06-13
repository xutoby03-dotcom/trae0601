import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Pill,
  Syringe,
  AlertTriangle,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { usePetStore } from "../store/petStore";
import {
  countRecordsThisYear,
  getSpeciesEmoji,
  getTypeLabel,
} from "../utils/deworm";
import { daysUntil, formatDateDisplay } from "../utils/date";
import type { DewormRecord } from "../types";

export default function StatisticsPage() {
  const pets = usePetStore((s) => s.pets);
  const records = usePetStore((s) => s.records);

  const totalInternalThisYear = useMemo(() => {
    return pets.reduce((sum, p) => sum + countRecordsThisYear(p.id, records).internal, 0);
  }, [pets, records]);

  const totalExternalThisYear = useMemo(() => {
    return pets.reduce((sum, p) => sum + countRecordsThisYear(p.id, records).external, 0);
  }, [pets, records]);

  const adverseRecords = useMemo(
    () => records.filter((r) => r.hasAdverseReaction),
    [records]
  );

  const upcomingExpiry = useMemo(() => {
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const medicineMap = new Map<
      string,
      { name: string; count: number; latestNextDate: string }
    >();

    for (const r of records) {
      const next = new Date(r.nextDate);
      if (next <= thirtyDaysLater) {
        const existing = medicineMap.get(r.medicineName);
        if (existing) {
          existing.count++;
          if (new Date(r.nextDate) > new Date(existing.latestNextDate)) {
            existing.latestNextDate = r.nextDate;
          }
        } else {
          medicineMap.set(r.medicineName, {
            name: r.medicineName,
            count: 1,
            latestNextDate: r.nextDate,
          });
        }
      }
    }

    return Array.from(medicineMap.values()).sort(
      (a, b) =>
        new Date(a.latestNextDate).getTime() -
        new Date(b.latestNextDate).getTime()
    );
  }, [records]);

  const petYearStats = useMemo(() => {
    return pets.map((p) => {
      const counts = countRecordsThisYear(p.id, records);
      const petRecords = records.filter((r) => r.petId === p.id);
      const lastRecord = petRecords.sort(
        (a, b) =>
          new Date(b.dateUsed).getTime() - new Date(a.dateUsed).getTime()
      )[0];
      return {
        pet: p,
        internal: counts.internal,
        external: counts.external,
        total: counts.internal + counts.external,
        lastRecord,
      };
    });
  }, [pets, records]);

  const maxTotal = Math.max(1, ...petYearStats.map((s) => s.total));

  return (
    <div className="container py-8 pb-20 space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="font-display text-3xl font-bold text-ink-800 flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-mint-600" />
          数据统计
        </h1>
        <p className="text-ink-500 mt-1">
          {new Date().getFullYear()} 年度驱虫健康报告
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4 animate-fade-in-up">
          <div className="flex items-center gap-2 text-ink-400 text-xs font-medium mb-1">
            <Calendar className="w-3.5 h-3.5" />
            总宠物数
          </div>
          <p className="text-2xl font-bold text-ink-800 font-display">
            {pets.length}
          </p>
        </div>
        <div
          className="card p-4 animate-fade-in-up"
          style={{ animationDelay: "60ms" }}
        >
          <div className="flex items-center gap-2 text-warm-500 text-xs font-medium mb-1">
            <Pill className="w-3.5 h-3.5" />
            体内驱虫
          </div>
          <p className="text-2xl font-bold text-warm-600 font-display">
            {totalInternalThisYear}
          </p>
          <p className="text-xs text-ink-400">次（今年）</p>
        </div>
        <div
          className="card p-4 animate-fade-in-up"
          style={{ animationDelay: "120ms" }}
        >
          <div className="flex items-center gap-2 text-mint-600 text-xs font-medium mb-1">
            <Syringe className="w-3.5 h-3.5" />
            体外驱虫
          </div>
          <p className="text-2xl font-bold text-mint-600 font-display">
            {totalExternalThisYear}
          </p>
          <p className="text-xs text-ink-400">次（今年）</p>
        </div>
        <div
          className="card p-4 animate-fade-in-up"
          style={{ animationDelay: "180ms" }}
        >
          <div className="flex items-center gap-2 text-alert-500 text-xs font-medium mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            不良反应
          </div>
          <p className="text-2xl font-bold text-alert-500 font-display">
            {adverseRecords.length}
          </p>
          <p className="text-xs text-ink-400">次记录</p>
        </div>
      </div>

      <div
        className="card p-5 animate-fade-in-up"
        style={{ animationDelay: "240ms" }}
      >
        <h2 className="section-title mb-5">各宠物年度驱虫统计</h2>
        {petYearStats.length === 0 ? (
          <p className="text-ink-400 text-center py-8 text-sm">暂无数据</p>
        ) : (
          <div className="space-y-4">
            {petYearStats.map((s, i) => {
              const internalPercent = (s.internal / Math.max(maxTotal, 1)) * 100;
              const externalPercent = (s.external / Math.max(maxTotal, 1)) * 100;
              return (
                <Link
                  to={`/pet/${s.pet.id}`}
                  key={s.pet.id}
                  className="group block animate-fade-in-up"
                  style={{ animationDelay: `${300 + i * 60}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={s.pet.photoUrl}
                      alt={s.pet.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="font-semibold text-ink-700 group-hover:text-warm-600 transition-colors flex items-center gap-1.5">
                          <span>{getSpeciesEmoji(s.pet.species)}</span>
                          {s.pet.name}
                        </p>
                        <p className="text-sm font-bold text-ink-500">
                          {s.total} 次
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-ink-400 w-10 flex-shrink-0">
                            体内
                          </span>
                          <div className="flex-1 h-2.5 bg-ink-50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-warm-400 rounded-full transition-all duration-700"
                              style={{ width: `${internalPercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-warm-600 font-semibold w-6 text-right">
                            {s.internal}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-ink-400 w-10 flex-shrink-0">
                            体外
                          </span>
                          <div className="flex-1 h-2.5 bg-ink-50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-mint-400 rounded-full transition-all duration-700"
                              style={{ width: `${externalPercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-mint-600 font-semibold w-6 text-right">
                            {s.external}
                          </span>
                        </div>
                      </div>
                      {s.lastRecord && (
                        <p className="text-xs text-ink-400 mt-2">
                          上次: {getTypeLabel(s.lastRecord.type)} ·{" "}
                          {s.lastRecord.medicineName} ·{" "}
                          {formatDateDisplay(s.lastRecord.dateUsed)}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div
        className="card p-5 animate-fade-in-up"
        style={{ animationDelay: "400ms" }}
      >
        <h2 className="section-title mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-warm-500" />
          药品使用提醒
          <span className="text-xs font-normal text-ink-400">（基于下次用药时间）</span>
        </h2>
        {upcomingExpiry.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-ink-400 text-sm">
              🎉 近期没有需要关注的药品，状态良好
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-400 border-b border-ink-100">
                  <th className="py-2 px-3 font-medium">药品名称</th>
                  <th className="py-2 px-3 font-medium">使用次数</th>
                  <th className="py-2 px-3 font-medium">下次使用</th>
                  <th className="py-2 px-3 font-medium">状态</th>
                </tr>
              </thead>
              <tbody>
                {upcomingExpiry.map((m, i) => {
                  const days = daysUntil(m.latestNextDate);
                  const isOverdue = days < 0;
                  const isUrgent = days >= 0 && days <= 3;
                  return (
                    <tr
                      key={m.name}
                      className="border-b border-ink-50 last:border-0 animate-fade-in-up"
                      style={{ animationDelay: `${450 + i * 50}ms` }}
                    >
                      <td className="py-3 px-3 font-semibold text-ink-700">
                        {m.name}
                      </td>
                      <td className="py-3 px-3 text-ink-500">{m.count} 次</td>
                      <td className="py-3 px-3 text-ink-500">
                        {formatDateDisplay(m.latestNextDate)}
                      </td>
                      <td className="py-3 px-3">
                        {isOverdue ? (
                          <span className="chip bg-alert-100 text-alert-600">
                            逾期 {Math.abs(days)} 天
                          </span>
                        ) : isUrgent ? (
                          <span className="chip bg-warm-100 text-warm-600">
                            {days} 天内
                          </span>
                        ) : (
                          <span className="chip bg-mint-100 text-mint-700">
                            {days} 天内
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div
        className="card p-5 animate-fade-in-up"
        style={{ animationDelay: "500ms" }}
      >
        <h2 className="section-title mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-alert-500" />
          不良反应记录
        </h2>
        {adverseRecords.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-ink-400 text-sm">
              🌟 未记录任何不良反应，毛孩子们状态良好
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {adverseRecords.map((r: DewormRecord, i) => {
              const pet = pets.find((p) => p.id === r.petId);
              if (!pet) return null;
              return (
                <Link
                  to={`/pet/${pet.id}`}
                  key={r.id}
                  className="block p-4 rounded-xl bg-alert-50 border border-alert-100 hover:bg-alert-100/50 transition-colors group animate-fade-in-up"
                  style={{ animationDelay: `${550 + i * 60}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={pet.photoUrl}
                      alt={pet.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-ink-800 group-hover:text-alert-600 transition-colors">
                          {getSpeciesEmoji(pet.species)} {pet.name}
                        </p>
                        <span className="chip bg-white text-alert-600">
                          {r.medicineName}
                        </span>
                        <span className="chip bg-white text-ink-500">
                          {getTypeLabel(r.type)}
                        </span>
                      </div>
                      <p className="text-sm text-alert-700 mt-2">
                        {r.reactionNote || "出现不良反应但未描述详情"}
                      </p>
                      <p className="text-xs text-ink-400 mt-1.5">
                        {formatDateDisplay(r.dateUsed)} · 操作人: {r.operator}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
