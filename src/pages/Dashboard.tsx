import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Percent,
  DollarSign,
  AlertTriangle,
  Cake,
  ChevronRight,
  Bell,
  Gift,
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import StatusTag from '@/components/StatusTag';
import LevelTag from '@/components/LevelTag';
import { useCouponStore } from '@/stores/couponStore';
import { useMemberStore } from '@/stores/memberStore';
import { getBirthdayMembers, formatMonthDay, getRealStatus, maskPhone, getIssueCouponName } from '@/utils';

export default function Dashboard() {
  const { issues, getMonthlyStats, getMissedMembers } = useCouponStore();
  const { members } = useMemberStore();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const stats = useMemo(
    () => getMonthlyStats(currentMonth, currentYear),
    [getMonthlyStats, currentMonth, currentYear]
  );

  const birthdayMembers = useMemo(
    () => getBirthdayMembers(members, currentMonth),
    [members, currentMonth]
  );

  const missedMemberIds = useMemo(
    () => getMissedMembers(currentMonth, currentYear),
    [getMissedMembers, currentMonth, currentYear]
  );

  const missedMembers = useMemo(
    () => members.filter((m) => missedMemberIds.includes(m.id)),
    [members, missedMemberIds]
  );

  const recentIssues = useMemo(() => {
    return [...issues]
      .sort(
        (a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
      )
      .slice(0, 5);
  }, [issues]);

  const getMemberName = (id: string) => {
    const m = members.find((mem) => mem.id === id);
    return m ? m.name : '未知';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-800">
            数据概览
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {currentYear} 年 {currentMonth} 月 · 共 {birthdayMembers.length} 位会员本月生日
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 rounded-xl bg-white shadow-soft hover:shadow-card transition-all">
            <Bell className="w-5 h-5 text-gray-500" />
          </button>
          <div className="px-4 py-2 bg-gradient-to-r from-gold-400 to-gold-500 rounded-full text-white text-sm font-medium shadow-soft">
            <Gift className="w-4 h-4 inline mr-1.5" />
            本月生日月
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="本月发券数"
          value={stats.totalIssued}
          icon={Ticket}
          trend={12.5}
          trendLabel="较上月"
          color="primary"
          delay={0}
        />
        <StatCard
          title="券使用率"
          value={`${stats.usageRate}%`}
          icon={Percent}
          trend={5.2}
          trendLabel="较上月"
          color="green"
          delay={100}
        />
        <StatCard
          title="带来订单金额"
          value={`¥${stats.totalOrderAmount.toLocaleString()}`}
          icon={DollarSign}
          trend={18.3}
          trendLabel="较上月"
          color="gold"
          delay={200}
        />
        <StatCard
          title="漏发人数"
          value={stats.missedCount}
          icon={AlertTriangle}
          color={stats.missedCount > 0 ? 'orange' : 'green'}
          delay={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-semibold text-gray-800">
              <Cake className="w-5 h-5 inline mr-2 text-primary-500" />
              本月生日会员
            </h2>
            <Link
              to="/coupons"
              className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
            >
              查看全部
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {birthdayMembers.slice(0, 5).map((member, index) => {
              const isIssued = !missedMemberIds.includes(member.id);
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-11 h-11 rounded-full bg-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">
                        {member.name}
                      </span>
                      <LevelTag level={member.level} />
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {formatMonthDay(member.birthday)} 生日 · {maskPhone(member.phone)}
                    </p>
                  </div>
                  {isIssued ? (
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-medium">
                      已发券
                    </span>
                  ) : (
                    <span className="text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full font-medium animate-pulse-soft">
                      待发放
                    </span>
                  )}
                </div>
              );
            })}
            {birthdayMembers.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                本月暂无生日会员
              </div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-semibold text-gray-800">
              <AlertTriangle className="w-5 h-5 inline mr-2 text-orange-500" />
              漏发预警
            </h2>
            {missedMembers.length > 0 && (
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                {missedMembers.length} 人
              </span>
            )}
          </div>

          {missedMembers.length > 0 ? (
            <div className="space-y-3">
              {missedMembers.slice(0, 4).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-orange-50/50 border border-orange-100"
                >
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-9 h-9 rounded-full bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {member.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatMonthDay(member.birthday)} 生日
                    </p>
                  </div>
                  <Link
                    to="/coupons"
                    className="text-xs bg-primary-500 text-white px-3 py-1.5 rounded-full hover:bg-primary-600 transition-colors font-medium"
                  >
                    补发
                  </Link>
                </div>
              ))}
              {missedMembers.length > 4 && (
                <p className="text-center text-xs text-gray-400 pt-2">
                  还有 {missedMembers.length - 4} 位会员待发券
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                <Gift className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-sm text-gray-600 font-medium">本月生日券已全部发放</p>
              <p className="text-xs text-gray-400 mt-1">太棒了，没有漏发！</p>
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold text-gray-800">
            <Ticket className="w-5 h-5 inline mr-2 text-gold-500" />
            最近发券记录
          </h2>
          <Link
            to="/coupons"
            className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
          >
            查看全部
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">会员</th>
                <th className="pb-3 font-medium">券类型</th>
                <th className="pb-3 font-medium">发送渠道</th>
                <th className="pb-3 font-medium">发放时间</th>
                <th className="pb-3 font-medium">状态</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentIssues.map((issue) => (
                <tr key={issue.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={members.find((m) => m.id === issue.memberId)?.avatar}
                        alt=""
                        className="w-8 h-8 rounded-full bg-gray-100"
                      />
                      <span className="text-gray-700">
                        {getMemberName(issue.memberId)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-gray-700">
                    {getIssueCouponName(issue)}
                  </td>
                  <td className="py-3 text-gray-600">{issue.channel}</td>
                  <td className="py-3 text-gray-500">{issue.issueDate}</td>
                  <td className="py-3">
                    <StatusTag status={getRealStatus(issue)} size="sm" />
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
