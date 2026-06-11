import { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  User,
  CheckCircle2,
  XCircle,
  MapPin,
  Footprints,
  Clock,
  Award,
} from 'lucide-react';
import { usePatrolStore } from '@/store/usePatrolStore';
import { getRiskLevelColor, getRiskLevelText, isLateArrival } from '@/utils/helpers';

export default function Statistics() {
  const { routes, patrolRecords, checkInRecords, exceptionEvents, officers, getMissedCheckIns } = usePatrolStore();

  const stats = useMemo(() => {
    const completedRecords = patrolRecords.filter((r) => r.status === 'completed');
    const totalPoints = completedRecords.reduce((sum, r) => {
      const route = routes.find((rt) => rt.id === r.routeId);
      return sum + (route?.points.length || 0);
    }, 0);
    const missedCount = getMissedCheckIns().length;
    const checkedCount = checkInRecords.filter((c) => !c.isMissed && c.arrivalTime).length;
    const abnormalCount = checkInRecords.filter((c) => c.isAbnormal).length;

    return {
      totalPatrols: completedRecords.length,
      totalPoints,
      checkedCount,
      missedCount,
      abnormalCount,
      completionRate: totalPoints > 0 ? Math.round(((totalPoints - missedCount) / totalPoints) * 100) : 0,
      onTimeRate:
        checkedCount > 0 ? Math.round(((checkedCount - abnormalCount) / checkedCount) * 100) : 0,
    };
  }, [patrolRecords, routes, checkInRecords, getMissedCheckIns]);

  const routeStats = useMemo(() => {
    return routes.map((route) => {
      const records = patrolRecords.filter(
        (r) => r.routeId === route.id && r.status === 'completed'
      );
      const totalExpected = records.length * route.points.length;
      const pointCheckIns = checkInRecords.filter((c) => {
        const record = patrolRecords.find((r) => r.id === c.patrolRecordId);
        return record?.routeId === route.id;
      });
      const missed = pointCheckIns.filter((c) => c.isMissed).length;
      const abnormal = pointCheckIns.filter((c) => c.isAbnormal).length;

      return {
        route,
        totalPatrols: records.length,
        totalExpected,
        missed,
        abnormal,
        completionRate:
          totalExpected > 0 ? Math.round(((totalExpected - missed) / totalExpected) * 100) : 0,
      };
    });
  }, [routes, patrolRecords, checkInRecords]);

  const abnormalHotspots = useMemo(() => {
    const pointCounts: Record<string, number> = {};
    checkInRecords
      .filter((c) => c.isAbnormal)
      .forEach((c) => {
        pointCounts[c.pointId] = (pointCounts[c.pointId] || 0) + 1;
      });

    return Object.entries(pointCounts)
      .map(([pointId, count]) => {
        let pointName = '';
        let riskLevel = 'medium';
        for (const route of routes) {
          const pt = route.points.find((p) => p.id === pointId);
          if (pt) {
            pointName = pt.name;
            riskLevel = pt.riskLevel;
            break;
          }
        }
        return { pointId, pointName, count, riskLevel };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [checkInRecords, routes]);

  const officerStats = useMemo(() => {
    const patrolOfficers = officers.filter((o) => o.role === 'officer');
    return patrolOfficers.map((officer) => {
      const records = patrolRecords.filter(
        (r) => r.patrolOfficerId === officer.id && r.status === 'completed'
      );
      const officerCheckIns = checkInRecords.filter((c) => {
        const record = patrolRecords.find((r) => r.id === c.patrolRecordId);
        return record?.patrolOfficerId === officer.id;
      });
      const total = officerCheckIns.length;
      const missed = officerCheckIns.filter((c) => c.isMissed).length;
      const abnormal = officerCheckIns.filter((c) => c.isAbnormal).length;
      const late = officerCheckIns.filter((c) => {
        if (c.isMissed || !c.arrivalTime) return false;
        const record = patrolRecords.find((r) => r.id === c.patrolRecordId);
        if (!record) return false;
        const route = routes.find((r) => r.id === record.routeId);
        if (!route) return false;
        const point = route.points.find((p) => p.id === c.pointId);
        if (!point) return false;
        return isLateArrival(c.arrivalTime, point.suggestedTime, 5);
      }).length;
      const onTime = total - missed - late;
      const punctuality = total > 0 ? Math.round((onTime / total) * 100) : 0;

      return {
        officer,
        totalPatrols: records.length,
        totalCheckIns: total,
        missed,
        abnormal,
        late,
        punctuality,
      };
    });
  }, [officers, patrolRecords, checkInRecords, routes]);

  const maxAbnormal = abnormalHotspots[0]?.count || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">统计分析</h1>
        <p className="text-slate-400 text-sm mt-1">巡逻完成率、异常热点和巡逻员表现</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-primary-900/40 flex items-center justify-center">
              <Footprints className="w-5 h-5 text-primary-400" />
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalPatrols}</p>
          <p className="text-slate-400 text-sm mt-1">巡逻总次数</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-900/40 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-emerald-400 text-xs font-medium">{stats.completionRate}%</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.checkedCount}</p>
          <p className="text-slate-400 text-sm mt-1">正常打卡</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-orange-900/40 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-orange-400 text-xs font-medium">{stats.missedCount}</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.missedCount}</p>
          <p className="text-slate-400 text-sm mt-1">漏打卡</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-red-900/40 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-red-400 text-xs font-medium">{stats.abnormalCount}</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.abnormalCount}</p>
          <p className="text-slate-400 text-sm mt-1">异常事件</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-primary-400" />
            <h3 className="text-white font-semibold">各路线完成率</h3>
          </div>
          <div className="space-y-4">
            {routeStats.map(({ route, completionRate, totalPatrols, missed, abnormal }) => (
              <div key={route.id} className="animate-fade-in-up">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-white text-sm font-medium">{route.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-400">{totalPatrols}次</span>
                    {missed > 0 && (
                      <span className="text-orange-400">漏{missed}</span>
                    )}
                    {abnormal > 0 && (
                      <span className="text-red-400">异{abnormal}</span>
                    )}
                    <span className={`font-bold ${
                      completionRate >= 90 ? 'text-emerald-400' :
                      completionRate >= 70 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {completionRate}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      completionRate >= 90 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                      completionRate >= 70 ? 'bg-gradient-to-r from-amber-500 to-orange-400' :
                      'bg-gradient-to-r from-red-500 to-orange-500'
                    }`}
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h3 className="text-white font-semibold">异常热点 TOP 5</h3>
          </div>
          <div className="space-y-4">
            {abnormalHotspots.length === 0 ? (
              <div className="py-8 text-center text-slate-500">暂无异常数据</div>
            ) : (
              abnormalHotspots.map((hotspot, idx) => (
                <div key={hotspot.pointId} className="animate-fade-in-up">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? 'bg-red-500 text-white' :
                        idx === 1 ? 'bg-orange-500 text-white' :
                        idx === 2 ? 'bg-amber-500 text-white' :
                        'bg-slate-600 text-white'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-white text-sm font-medium">{hotspot.pointName}</span>
                      <span className={`tag ${getRiskLevelColor(hotspot.riskLevel)} !text-[10px] !py-px`}>
                        {getRiskLevelText(hotspot.riskLevel)}
                      </span>
                    </div>
                    <span className="text-red-400 text-sm font-bold">{hotspot.count} 次</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 rounded-full transition-all duration-700"
                      style={{ width: `${(hotspot.count / maxAbnormal) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-5 h-5 text-primary-400" />
          <h3 className="text-white font-semibold">巡逻员表现</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-3 px-4 text-slate-400 text-xs font-medium uppercase tracking-wider">巡逻员</th>
                <th className="text-center py-3 px-4 text-slate-400 text-xs font-medium uppercase tracking-wider">巡逻次数</th>
                <th className="text-center py-3 px-4 text-slate-400 text-xs font-medium uppercase tracking-wider">打卡总数</th>
                <th className="text-center py-3 px-4 text-slate-400 text-xs font-medium uppercase tracking-wider">漏打卡</th>
                <th className="text-center py-3 px-4 text-slate-400 text-xs font-medium uppercase tracking-wider">迟到</th>
                <th className="text-center py-3 px-4 text-slate-400 text-xs font-medium uppercase tracking-wider">发现异常</th>
                <th className="text-center py-3 px-4 text-slate-400 text-xs font-medium uppercase tracking-wider">准点率</th>
              </tr>
            </thead>
            <tbody>
              {officerStats.map(({ officer, totalPatrols, totalCheckIns, missed, late, abnormal, punctuality }) => (
                <tr key={officer.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors animate-fade-in-up">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm">
                        {officer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm flex items-center gap-2">
                          {officer.name}
                          {punctuality >= 95 && (
                            <span className="inline-flex items-center gap-0.5 text-amber-400 text-xs">
                              <Award className="w-3 h-3" />
                              优秀
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center text-white text-sm font-medium">{totalPatrols}</td>
                  <td className="py-4 px-4 text-center text-slate-300 text-sm">{totalCheckIns}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={missed > 0 ? 'text-orange-400 font-medium' : 'text-slate-400'}>
                      {missed}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={late > 0 ? 'text-amber-400 font-medium' : 'text-slate-400'}>
                      {late}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={abnormal > 0 ? 'text-red-400 font-medium' : 'text-slate-400'}>
                      {abnormal}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            punctuality >= 95 ? 'bg-emerald-500' :
                            punctuality >= 80 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${punctuality}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold ${
                        punctuality >= 95 ? 'text-emerald-400' :
                        punctuality >= 80 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {punctuality}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
