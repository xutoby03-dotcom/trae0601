import { format, getMonth, getDate, isBefore, isAfter, addDays, startOfMonth, endOfMonth } from 'date-fns';
import type { Member, CouponIssue, CouponType, CouponStatus, MonthlyStats, CouponSnapshot } from '@/types';

export function formatDate(date: string | Date, fmt = 'yyyy-MM-dd'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, fmt);
}

export function formatDateCN(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy年MM月dd日');
}

export function formatMonthDay(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MM月dd日');
}

export function getBirthdayMembers(members: Member[], month: number): Member[] {
  return members.filter((m) => {
    const birthday = new Date(m.birthday);
    return getMonth(birthday) === month - 1;
  }).sort((a, b) => {
    const dayA = getDate(new Date(a.birthday));
    const dayB = getDate(new Date(b.birthday));
    return dayA - dayB;
  });
}

export function isCouponIssuedThisYear(
  issues: CouponIssue[],
  memberId: string,
  couponTypeId: string,
  year: number
): boolean {
  return issues.some(
    (i) => i.memberId === memberId && i.couponTypeId === couponTypeId && i.year === year
  );
}

export function getRealStatus(issue: CouponIssue): CouponStatus {
  if (issue.status === 'used') return 'used';
  const now = new Date();
  const expireDate = new Date(issue.expireDate);
  if (isBefore(now, expireDate) === false) {
    return 'expired';
  }
  return issue.status;
}

export function getStatusText(status: CouponStatus): string {
  const map: Record<CouponStatus, string> = {
    pending: '待领取',
    claimed: '已领取',
    used: '已使用',
    expired: '已过期',
  };
  return map[status];
}

export function getStatusColorClass(status: CouponStatus): string {
  const map: Record<CouponStatus, string> = {
    pending: 'bg-amber-100 text-amber-700',
    claimed: 'bg-blue-100 text-blue-700',
    used: 'bg-emerald-100 text-emerald-700',
    expired: 'bg-gray-200 text-gray-500',
  };
  return map[status];
}

export function getLevelColorClass(level: string): string {
  const map: Record<string, string> = {
    '普通会员': 'bg-gray-100 text-gray-600',
    '银卡会员': 'bg-slate-200 text-slate-600',
    '金卡会员': 'bg-amber-100 text-amber-700',
    '钻石会员': 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700',
  };
  return map[level] || 'bg-gray-100 text-gray-600';
}

export function calculateMonthlyStats(
  issues: CouponIssue[],
  members: Member[],
  month: number,
  year: number
): MonthlyStats {
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));

  const monthIssues = issues.filter((i) => {
    const issueDate = new Date(i.issueDate);
    return isAfter(issueDate, monthStart) || issueDate.getTime() === monthStart.getTime()
      ? isBefore(issueDate, monthEnd) || issueDate.getTime() === monthEnd.getTime()
      : false;
  });

  const usedIssues = monthIssues.filter((i) => i.status === 'used');
  const totalOrderAmount = usedIssues.reduce((sum, i) => sum + (i.orderAmount || 0), 0);
  const usageRate = monthIssues.length > 0 ? (usedIssues.length / monthIssues.length) * 100 : 0;

  const birthdayMembers = getBirthdayMembers(members, month);
  const issuedMemberIds = new Set(
    monthIssues.map((i) => i.memberId)
  );
  const missedCount = birthdayMembers.filter((m) => !issuedMemberIds.has(m.id)).length;

  const now = new Date();
  const expiredUnused = issues.filter((i) => {
    const realStatus = getRealStatus(i);
    return realStatus === 'expired' && i.status !== 'used';
  }).length;

  return {
    totalIssued: monthIssues.length,
    totalUsed: usedIssues.length,
    usageRate: Math.round(usageRate * 10) / 10,
    totalOrderAmount,
    missedCount,
    expiredUnused,
  };
}

export function generateId(prefix: string): string {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function getExpireDate(issueDate: string, validDays: number): string {
  const date = new Date(issueDate);
  return format(addDays(date, validDays), 'yyyy-MM-dd');
}

export function getCouponDisplayText(couponType: CouponType | CouponSnapshot): string {
  const typeField = 'type' in couponType ? couponType.type : couponType.couponType;
  if (typeField === '折扣券') {
    return `${couponType.amount / 10}折`;
  }
  return `¥${couponType.amount}`;
}

export function getSnapshotFromCouponType(couponType: CouponType): CouponSnapshot {
  return {
    couponName: couponType.name,
    couponType: couponType.type,
    amount: couponType.amount,
    threshold: couponType.threshold,
    validDays: couponType.validDays,
  };
}

export function getIssueCouponName(issue: CouponIssue): string {
  return issue.snapshot?.couponName || '未知券';
}

export function getIssueCouponDisplay(issue: CouponIssue): string {
  if (!issue.snapshot) return '--';
  if (issue.snapshot.couponType === '折扣券') {
    return `${issue.snapshot.amount / 10}折`;
  }
  return `¥${issue.snapshot.amount}`;
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 11) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}
