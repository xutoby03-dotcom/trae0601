import { useMemo } from 'react';
import { Gift, Clock, AlertTriangle } from 'lucide-react';
import StatusTag from '@/components/StatusTag';
import LevelTag from '@/components/LevelTag';
import { useCouponStore } from '@/stores/couponStore';
import { useMemberStore } from '@/stores/memberStore';
import { formatDateCN, maskPhone, getIssueCouponName, getIssueCouponDisplay } from '@/utils';

export default function ExpiredCoupons() {
  const { getExpiredUnused } = useCouponStore();
  const { members } = useMemberStore();

  const expiredList = useMemo(() => {
    const list = getExpiredUnused();
    return list.sort(
      (a, b) => new Date(b.expireDate).getTime() - new Date(a.expireDate).getTime()
    );
  }, [getExpiredUnused]);

  const getMemberById = (id: string) => members.find((m) => m.id === id);

  const totalAmount = expiredList.reduce((sum, issue) => {
    if (!issue.snapshot) return sum;
    if (issue.snapshot.couponType === '折扣券') {
      return sum;
    }
    return sum + (issue.snapshot.amount || 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-800">
            过期未用券
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            已过期但未使用的生日券列表，便于后续跟进分析
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
              <Gift className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">过期未用券数</p>
              <p className="text-2xl font-display font-bold text-gray-800">
                {expiredList.length} 张
              </p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">涉及会员数</p>
              <p className="text-2xl font-display font-bold text-gray-800">
                {new Set(expiredList.map((i) => i.memberId)).size} 人
              </p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">累计金额</p>
              <p className="text-2xl font-display font-bold text-gray-800">
                ¥{totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="font-medium text-gray-800">过期券明细</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/80">
              <tr className="text-left text-sm text-gray-500">
                <th className="px-6 py-3 font-medium">会员</th>
                <th className="px-6 py-3 font-medium">券类型</th>
                <th className="px-6 py-3 font-medium">发送渠道</th>
                <th className="px-6 py-3 font-medium">发放时间</th>
                <th className="px-6 py-3 font-medium">过期时间</th>
                <th className="px-6 py-3 font-medium">会员等级</th>
                <th className="px-6 py-3 font-medium">状态</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {expiredList.map((issue, index) => {
                const member = getMemberById(issue.memberId);
                return (
                  <tr
                    key={issue.id}
                    className="hover:bg-gray-50/50 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={member?.avatar}
                          alt=""
                          className="w-9 h-9 rounded-full bg-gray-100"
                        />
                        <div>
                          <p className="text-gray-700 font-medium">
                            {member?.name || '未知'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {member ? maskPhone(member.phone) : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-700 font-medium">
                          {getIssueCouponName(issue)}
                        </p>
                        <p className="text-xs text-primary-500 font-medium">
                          {getIssueCouponDisplay(issue)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{issue.channel}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDateCN(issue.issueDate)}
                    </td>
                    <td className="px-6 py-4 text-red-500 font-medium">
                      {formatDateCN(issue.expireDate)}
                    </td>
                    <td className="px-6 py-4">
                      {member && <LevelTag level={member.level} />}
                    </td>
                    <td className="px-6 py-4">
                      <StatusTag status="expired" size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {expiredList.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-3">
              <Gift className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-sm text-gray-600 font-medium">暂无过期未用券</p>
            <p className="text-xs text-gray-400 mt-1">所有发放的券都被使用啦！</p>
          </div>
        )}
      </div>
    </div>
  );
}
