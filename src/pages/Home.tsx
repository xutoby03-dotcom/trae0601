import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarHeart,
  Users,
  FileText,
  AlertTriangle,
  ChevronRight,
  Clock,
  Pill,
  TrendingUp,
  Plus,
  Bell,
  CheckCircle,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import StatCard from '@/components/StatCard';
import { cn } from '@/lib/utils';

export default function Home() {
  const { patients, visits, records, companions } = useStore();

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

    const urgentVisits = upcomingVisits.filter((v) => {
      const daysUntil = Math.ceil(
        (new Date(v.visitTime).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntil <= 3 && daysUntil >= 0;
    });

    return {
      totalPatients: patients.length,
      upcomingVisits: upcomingVisits.length,
      completedVisits: completedVisits.length,
      nextMonthVisits: nextMonthVisits.length,
      unpreparedMaterials,
      urgentVisits: urgentVisits.length,
    };
  }, [visits, patients]);

  const upcomingVisits = useMemo(() => {
    const now = new Date();
    return visits
      .filter((v) => {
        if (v.status === 'completed' || v.status === 'cancelled') return false;
        return new Date(v.visitTime) >= now;
      })
      .sort((a, b) => new Date(a.visitTime).getTime() - new Date(b.visitTime).getTime())
      .slice(0, 5);
  }, [visits]);

  const recentRecords = useMemo(() => {
    return records
      .slice()
      .sort((a, b) => {
        const visitA = visits.find((v) => v.id === a.visitId);
        const visitB = visits.find((v) => v.id === b.visitId);
        if (!visitA || !visitB) return 0;
        return new Date(visitB.visitTime).getTime() - new Date(visitA.visitTime).getTime();
      })
      .slice(0, 3);
  }, [records, visits]);

  const getPatientName = (patientId: string) => {
    return patients.find((p) => p.id === patientId)?.name || '未知';
  };

  const getPatientAvatar = (patientId: string) => {
    return patients.find((p) => p.id === patientId)?.avatar || '';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const topCompanions = useMemo(() => {
    const completedVisits = visits.filter((v) => v.status === 'completed');
    return companions
      .map((name) => ({
        name,
        count: completedVisits.filter((v) => v.companion === name).length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [visits, companions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">早上好 👋</h1>
          <p className="text-gray-500 mt-1">今天也要好好照顾家人健康哦</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-full bg-white shadow-sm border border-warm-100 hover:bg-warm-50 transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            {stats.urgentVisits > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                {stats.urgentVisits}
              </span>
            )}
          </button>
        </div>
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
          icon={CalendarHeart}
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
          icon={AlertTriangle}
          color="purple"
          subtitle="项未准备"
        />
      </div>

      {stats.urgentVisits > 0 && (
        <div className="card p-5 bg-gradient-to-r from-primary-50 to-amber-50 border-primary-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">
                有 {stats.urgentVisits} 次复诊即将到来
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                请记得确认陪同安排并准备好所有材料
              </p>
            </div>
            <Link
              to="/visits"
              className="btn-primary text-sm whitespace-nowrap"
            >
              查看详情
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <CalendarHeart className="w-5 h-5 text-primary-500" />
              即将复诊
            </h2>
            <Link
              to="/visits"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              查看全部
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {upcomingVisits.length === 0 ? (
            <div className="card p-8 text-center">
              <CalendarHeart className="w-12 h-12 text-warm-300 mx-auto mb-3" />
              <p className="text-gray-500">暂无即将到来的复诊</p>
              <Link to="/visits" className="btn-primary mt-4 inline-block text-sm">
                添加复诊
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingVisits.map((visit) => {
                const daysLeft = getDaysUntil(visit.visitTime);
                const isUrgent = daysLeft <= 3;
                const allPrepared = visit.materials.every((m) => m.prepared);

                return (
                  <Link
                    key={visit.id}
                    to={`/visits/${visit.id}`}
                    className={cn(
                      'card p-4 flex items-center gap-4 transition-all',
                      isUrgent ? 'ring-2 ring-primary-200 ring-offset-1' : ''
                    )}
                  >
                    <img
                      src={getPatientAvatar(visit.patientId)}
                      alt=""
                      className="w-12 h-12 rounded-xl bg-warm-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-800 truncate">
                          {visit.department}
                        </h3>
                        {isUrgent && (
                          <span className="tag bg-primary-100 text-primary-700 text-xs">
                            {daysLeft <= 0 ? '今天' : `${daysLeft}天后`}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5 truncate">
                        {getPatientName(visit.patientId)} · {formatDate(visit.visitTime)} {formatTime(visit.visitTime)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">
                          陪同：{visit.companion || '待分配'}
                        </span>
                        {allPrepared ? (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            材料齐全
                          </span>
                        ) : (
                          <span className="text-xs text-amber-600 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            材料未齐
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary-500" />
              陪同排行
            </h3>
            {topCompanions.filter(c => c.count > 0).length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">暂无陪同记录</p>
            ) : (
              <div className="space-y-3">
                {topCompanions.filter(c => c.count > 0).map((companion, index) => (
                  <div
                    key={companion.name}
                    className="flex items-center gap-3"
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold',
                        index === 0
                          ? 'bg-amber-100 text-amber-700'
                          : index === 1
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-amber-50 text-amber-600'
                      )}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">
                        {companion.name}
                      </p>
                      <p className="text-xs text-gray-500">{companion.count} 次</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Pill className="w-5 h-5 text-amber-500" />
              最近复诊记录
            </h3>
            {recentRecords.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">暂无记录</p>
            ) : (
              <div className="space-y-3">
                {recentRecords.map((record) => {
                  const visit = visits.find((v) => v.id === record.visitId);
                  if (!visit) return null;

                  return (
                    <Link
                      key={record.id}
                      to={`/visits/${visit.id}`}
                      className="block p-3 bg-warm-50 rounded-xl hover:bg-warm-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-800 text-sm">
                          {visit.department}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(visit.visitTime)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {record.advice}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
            <Link
              to="/records"
              className="mt-4 text-sm text-primary-600 hover:text-primary-700 flex items-center justify-center gap-1 w-full"
            >
              查看全部记录
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-500" />
            就诊人档案
          </h3>
          <Link
            to="/patients"
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            管理档案
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {patients.slice(0, 4).map((patient) => (
            <Link
              key={patient.id}
              to={`/patients/${patient.id}`}
              className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl hover:bg-warm-100 transition-colors"
            >
              <img
                src={patient.avatar}
                alt={patient.name}
                className="w-12 h-12 rounded-xl bg-white"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{patient.name}</p>
                <p className="text-xs text-gray-500 truncate">{patient.disease}</p>
              </div>
            </Link>
          ))}
          {patients.length === 0 && (
            <div className="col-span-full text-center py-4">
              <p className="text-gray-400 text-sm">暂无就诊人档案</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <Link
          to="/stats"
          className="btn-secondary flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          查看详细统计
        </Link>
      </div>
    </div>
  );
}
