import { useMemo } from 'react';
import {
  BarChart3,
  Users,
  Calendar,
  FileText,
  Clock,
  TrendingUp,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import StatCard from '@/components/StatCard';
import { cn } from '@/lib/utils';

export default function Statistics() {
  const { visits, patients, records, companions } = useStore();

  const stats = useMemo(() => {
    const now = new Date();
    const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const upcomingVisits = visits.filter(
      (v) => v.status !== 'completed' && v.status !== 'cancelled'
    );
    const completedVisits = visits.filter((v) => v.status === 'completed');

    const nextMonthVisits = upcomingVisits.filter((v) => {
      const visitDate = new Date(v.visitTime);
      return visitDate >= now && visitDate <= oneMonthLater;
    });

    const unpreparedMaterials = upcomingVisits.reduce((acc, visit) => {
      return acc + visit.materials.filter((m) => !m.prepared).length;
    }, 0);

    const companionStats = companions.map((name) => {
      const count = completedVisits.filter((v) => v.companion === name).length;
      const upcomingCount = upcomingVisits.filter((v) => v.companion === name).length;
      return { name, count, upcomingCount };
    }).sort((a, b) => b.count - a.count);

    return {
      totalPatients: patients.length,
      upcomingVisits: upcomingVisits.length,
      completedVisits: completedVisits.length,
      nextMonthVisits: nextMonthVisits.length,
      unpreparedMaterials,
      companionStats,
    };
  }, [visits, patients, records, companions]);

  const upcomingVisitsList = useMemo(() => {
    const now = new Date();
    const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return visits
      .filter((v) => {
        if (v.status === 'completed' || v.status === 'cancelled') return false;
        const visitDate = new Date(v.visitTime);
        return visitDate >= now && visitDate <= oneMonthLater;
      })
      .sort((a, b) => new Date(a.visitTime).getTime() - new Date(b.visitTime).getTime());
  }, [visits]);

  const getPatientName = (patientId: string) => {
    return patients.find((p) => p.id === patientId)?.name || '未知';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const maxCompanionCount = Math.max(...stats.companionStats.map((c) => c.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">统计分析</h2>
        <p className="text-gray-500 mt-1">查看陪同次数、材料准备和就诊安排统计</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="就诊人数"
          value={stats.totalPatients}
          icon={Users}
          color="primary"
          subtitle="位家庭成员"
        />
        <StatCard
          title="待复诊"
          value={stats.upcomingVisits}
          icon={Calendar}
          color="amber"
          subtitle="次复诊安排"
        />
        <StatCard
          title="已完成"
          value={stats.completedVisits}
          icon={FileText}
          color="secondary"
          subtitle="次历史复诊"
        />
        <StatCard
          title="待准备材料"
          value={stats.unpreparedMaterials}
          icon={AlertCircle}
          color="purple"
          subtitle="项未准备"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            陪同次数统计
          </h3>

          {stats.companionStats.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无陪同记录</p>
          ) : (
            <div className="space-y-4">
              {stats.companionStats.map((companion, index) => (
                <div key={companion.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {companion.name}
                      </span>
                      {index === 0 && companion.count > 0 && (
                        <span className="tag bg-amber-100 text-amber-700">最多</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-semibold text-gray-800">
                        {companion.count}
                      </span>
                      <span className="text-gray-400"> 次</span>
                      {companion.upcomingCount > 0 && (
                        <span className="ml-2 text-primary-500">
                          (+{companion.upcomingCount} 待陪)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        index === 0
                          ? 'bg-gradient-to-r from-primary-400 to-primary-600'
                          : index === 1
                          ? 'bg-gradient-to-r from-secondary-400 to-secondary-600'
                          : index === 2
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                          : 'bg-gradient-to-r from-warm-300 to-warm-400'
                      )}
                      style={{
                        width: `${(companion.count / maxCompanionCount) * 100}%`,
                        minWidth: companion.count > 0 ? '10%' : '0',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-secondary-500" />
              未来一月就诊安排
            </h3>
            <span className="text-sm text-gray-500">
              共 {stats.nextMonthVisits} 次
            </span>
          </div>

          {upcomingVisitsList.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              未来一个月暂无复诊安排
            </p>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {upcomingVisitsList.map((visit) => {
                const daysLeft = getDaysUntil(visit.visitTime);
                const isUrgent = daysLeft <= 3;
                const allPrepared = visit.materials.every((m) => m.prepared);

                return (
                  <Link
                    key={visit.id}
                    to={`/visits/${visit.id}`}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl transition-all',
                      isUrgent
                        ? 'bg-primary-50 hover:bg-primary-100 border border-primary-200'
                        : 'bg-warm-50 hover:bg-warm-100 border border-warm-100'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold',
                          isUrgent
                            ? 'bg-primary-200 text-primary-700'
                            : 'bg-secondary-100 text-secondary-600'
                        )}
                      >
                        {daysLeft <= 0 ? '今' : daysLeft}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {visit.department}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getPatientName(visit.patientId)} · {formatDate(visit.visitTime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!allPrepared && (
                        <span className="tag bg-amber-100 text-amber-700">材料未齐</span>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-500" />
          材料准备情况
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visits
            .filter((v) => v.status !== 'completed' && v.status !== 'cancelled')
            .slice(0, 6)
            .map((visit) => {
              const prepared = visit.materials.filter((m) => m.prepared).length;
              const total = visit.materials.length;
              const progress = total > 0 ? (prepared / total) * 100 : 0;

              return (
                <Link
                  key={visit.id}
                  to={`/visits/${visit.id}`}
                  className="p-4 bg-warm-50 rounded-xl hover:bg-warm-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800 text-sm">
                      {visit.department}
                    </span>
                    <span className="text-xs text-gray-500">
                      {getPatientName(visit.patientId)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          progress === 100 ? 'bg-green-500' : 'bg-amber-500'
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {prepared}/{total}
                    </span>
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
    </div>
  );
}
