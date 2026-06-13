import { useState, useMemo } from 'react';
import {
  Calendar,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle,
  AlertCircle,
  Filter,
  Gift,
} from 'lucide-react';
import Modal from '@/components/Modal';
import StatusTag from '@/components/StatusTag';
import LevelTag from '@/components/LevelTag';
import { useCouponStore } from '@/stores/couponStore';
import { useMemberStore } from '@/stores/memberStore';
import { useCouponTypeStore } from '@/stores/couponTypeStore';
import type { SendChannel, CouponStatus, CouponIssue } from '@/types';
import {
  getBirthdayMembers,
  getRealStatus,
  formatMonthDay,
  getCouponDisplayText,
  maskPhone,
  formatDateCN,
  getIssueCouponName,
  getIssueCouponDisplay,
} from '@/utils';

const channelOptions: SendChannel[] = ['短信', '微信', 'APP推送', '门店发放'];
const statusOptions: { value: CouponStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '待领取' },
  { value: 'claimed', label: '已领取' },
  { value: 'used', label: '已使用' },
  { value: 'expired', label: '已过期' },
];

export default function Coupons() {
  const { issues, issueCoupon, bulkIssueCoupon, getBirthdayMembersWithStatus, updateStatus } =
    useCouponStore();
  const { members } = useMemberStore();
  const { couponTypes } = useCouponTypeStore();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear] = useState(now.getFullYear());
  const [activeTab, setActiveTab] = useState<'birthday' | 'records'>('birthday');
  const [statusFilter, setStatusFilter] = useState<CouponStatus | 'all'>('all');
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedCouponTypeId, setSelectedCouponTypeId] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<SendChannel>('短信');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const birthdayMembers = useMemo(
    () => getBirthdayMembers(members, selectedMonth),
    [members, selectedMonth]
  );

  const birthdayStatus = useMemo(
    () => getBirthdayMembersWithStatus(selectedMonth, selectedYear),
    [getBirthdayMembersWithStatus, selectedMonth, selectedYear]
  );

  const memberStatusMap = useMemo(() => {
    const map = new Map<string, { issued: boolean; status?: CouponStatus; issueId?: string }>();
    birthdayStatus.forEach((s) => map.set(s.memberId, s));
    return map;
  }, [birthdayStatus]);

  const filteredIssues = useMemo(() => {
    let result = issues;
    if (statusFilter !== 'all') {
      result = result.filter((i) => getRealStatus(i) === statusFilter);
    }
    return result.sort(
      (a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
    );
  }, [issues, statusFilter]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleMonthChange = (delta: number) => {
    let newMonth = selectedMonth + delta;
    if (newMonth > 12) newMonth = 1;
    if (newMonth < 1) newMonth = 12;
    setSelectedMonth(newMonth);
  };

  const handleOpenIssue = (memberIds: string[]) => {
    setSelectedMemberIds(memberIds);
    if (couponTypes.length > 0) {
      setSelectedCouponTypeId(couponTypes[0].id);
    }
    setIsIssueModalOpen(true);
  };

  const handleConfirmIssue = () => {
    if (!selectedCouponTypeId) {
      showToast('error', '请选择券类型');
      return;
    }

    if (selectedMemberIds.length === 1) {
      const result = issueCoupon({
        memberId: selectedMemberIds[0],
        couponTypeId: selectedCouponTypeId,
        channel: selectedChannel,
      });
      showToast(result.success ? 'success' : 'error', result.message);
    } else {
      const result = bulkIssueCoupon(selectedMemberIds, selectedCouponTypeId, selectedChannel);
      showToast(
        result.success > 0 ? 'success' : 'error',
        `成功发放 ${result.success} 张，失败 ${result.failed} 张`
      );
    }

    setIsIssueModalOpen(false);
    setSelectedMemberIds([]);
  };

  const getMemberById = (id: string) => members.find((m) => m.id === id);

  const missedMembers = birthdayMembers.filter(
    (m) => !memberStatusMap.get(m.id)?.issued
  );

  const issuedCount = birthdayMembers.filter(
    (m) => memberStatusMap.get(m.id)?.issued
  ).length;

  const handleMarkClaimed = (id: string) => {
    updateStatus(id, 'claimed');
    showToast('success', '已标记为已领取');
  };

  const handleMarkUsed = (id: string) => {
    updateStatus(id, 'used', `ORD${Date.now()}`, Math.floor(Math.random() * 500) + 100);
    showToast('success', '已标记为已使用');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-800">
            生日券管理
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            管理会员生日券发放、记录与状态追踪
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('birthday')}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'birthday'
              ? 'bg-white text-primary-600 shadow-soft border border-primary-100'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
          }`}
        >
          <Gift className="w-4 h-4 inline mr-1.5" />
          本月生日列表
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'records'
              ? 'bg-white text-primary-600 shadow-soft border border-primary-100'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
          }`}
        >
          <Ticket className="w-4 h-4 inline mr-1.5" />
          发放记录
        </button>
      </div>

      {activeTab === 'birthday' && (
        <>
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleMonthChange(-1)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-center min-w-32">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-500" />
                    <span className="font-display text-xl font-bold text-gray-800">
                      {selectedYear} 年 {selectedMonth} 月
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    共 {birthdayMembers.length} 位生日会员 · 已发 {issuedCount} 人 · 待发 {missedMembers.length} 人
                  </p>
                </div>
                <button
                  onClick={() => handleMonthChange(1)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {missedMembers.length > 0 && (
                <button
                  onClick={() =>
                    handleOpenIssue(missedMembers.map((m) => m.id))
                  }
                  className="btn-primary flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  一键补发 ({missedMembers.length})
                </button>
              )}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80">
                  <tr className="text-left text-sm text-gray-500">
                    <th className="px-6 py-4 font-medium">会员</th>
                    <th className="px-6 py-4 font-medium">生日</th>
                    <th className="px-6 py-4 font-medium">等级</th>
                    <th className="px-6 py-4 font-medium">常购品类</th>
                    <th className="px-6 py-4 font-medium">发券状态</th>
                    <th className="px-6 py-4 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {birthdayMembers.map((member, index) => {
                    const status = memberStatusMap.get(member.id);
                    return (
                      <tr
                        key={member.id}
                        className="hover:bg-gray-50/50 transition-colors animate-fade-in"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-10 h-10 rounded-full bg-gray-100"
                            />
                            <div>
                              <p className="font-medium text-gray-800">
                                {member.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {maskPhone(member.phone)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {formatMonthDay(member.birthday)}
                        </td>
                        <td className="px-6 py-4">
                          <LevelTag level={member.level} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-48">
                            {member.favoriteCategories.slice(0, 2).map((cat) => (
                              <span
                                key={cat}
                                className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {status?.issued ? (
                            status?.status && <StatusTag status={status.status} size="sm" />
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full font-medium">
                              <AlertCircle className="w-3 h-3" />
                              待发放
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {status?.issued ? (
                            <span className="text-xs text-gray-400">已发放</span>
                          ) : (
                            <button
                              onClick={() => handleOpenIssue([member.id])}
                              className="text-xs bg-primary-500 text-white px-3 py-1.5 rounded-full hover:bg-primary-600 transition-colors font-medium inline-flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              发券
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {birthdayMembers.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                本月暂无生日会员
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'records' && (
        <>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <div className="flex gap-2">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStatusFilter(opt.value as CouponStatus | 'all')}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      statusFilter === opt.value
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <span className="ml-auto text-sm text-gray-400">
                共 {filteredIssues.length} 条记录
              </span>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80">
                  <tr className="text-left text-sm text-gray-500">
                    <th className="px-6 py-4 font-medium">会员</th>
                    <th className="px-6 py-4 font-medium">券类型</th>
                    <th className="px-6 py-4 font-medium">发送渠道</th>
                    <th className="px-6 py-4 font-medium">发放时间</th>
                    <th className="px-6 py-4 font-medium">有效期至</th>
                    <th className="px-6 py-4 font-medium">状态</th>
                    <th className="px-6 py-4 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {filteredIssues.slice(0, 20).map((issue, index) => {
                    const member = getMemberById(issue.memberId);
                    const realStatus = getRealStatus(issue);
                    return (
                      <tr
                        key={issue.id}
                        className="hover:bg-gray-50/50 transition-colors animate-fade-in"
                        style={{ animationDelay: `${index * 20}ms` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={member?.avatar}
                              alt=""
                              className="w-9 h-9 rounded-full bg-gray-100"
                            />
                            <span className="text-gray-700 font-medium">
                              {member?.name || '未知'}
                            </span>
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
                        <td className="px-6 py-4 text-gray-500">{issue.issueDate}</td>
                        <td className="px-6 py-4 text-gray-500">{issue.expireDate}</td>
                        <td className="px-6 py-4">
                          <StatusTag status={realStatus} size="sm" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          {realStatus === 'pending' && (
                            <button
                              onClick={() => handleMarkClaimed(issue.id)}
                              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                            >
                              标记领取
                            </button>
                          )}
                          {realStatus === 'claimed' && (
                            <button
                              onClick={() => handleMarkUsed(issue.id)}
                              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                              标记使用
                            </button>
                          )}
                          {realStatus === 'used' && issue.orderAmount && (
                            <span className="text-xs text-gray-400">
                              订单 ¥{issue.orderAmount}
                            </span>
                          )}
                          {realStatus === 'expired' && (
                            <span className="text-xs text-gray-400">已过期</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredIssues.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                暂无发放记录
              </div>
            )}
          </div>
        </>
      )}

      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title={`发放生日券 (${selectedMemberIds.length} 人)`}
        size="md"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择券类型
            </label>
            <div className="space-y-2">
              {couponTypes.map((ct) => (
                <label
                  key={ct.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedCouponTypeId === ct.id
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="couponType"
                    value={ct.id}
                    checked={selectedCouponTypeId === ct.id}
                    onChange={(e) => setSelectedCouponTypeId(e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedCouponTypeId === ct.id
                        ? 'border-primary-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedCouponTypeId === ct.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{ct.name}</p>
                    <p className="text-xs text-gray-500">
                      {ct.type} · 有效期 {ct.validDays} 天
                    </p>
                  </div>
                  <span className="text-lg font-display font-bold text-primary-500">
                    {getCouponDisplayText(ct)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              发送渠道
            </label>
            <div className="flex flex-wrap gap-2">
              {channelOptions.map((ch) => (
                <button
                  key={ch}
                  onClick={() => setSelectedChannel(ch)}
                  className={`px-4 py-2 rounded-xl text-sm transition-all ${
                    selectedChannel === ch
                      ? 'bg-primary-500 text-white shadow-soft'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-amber-800 font-medium">发券规则说明</p>
                <p className="text-xs text-amber-600 mt-1">
                  同一会员同一年同一券类型只能发放一次，系统会自动校验重复发放。
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsIssueModalOpen(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button onClick={handleConfirmIssue} className="btn-primary">
              确认发放
            </button>
          </div>
        </div>
      </Modal>

      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-card animate-fade-in-up flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
