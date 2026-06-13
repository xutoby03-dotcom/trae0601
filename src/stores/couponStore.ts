import { create } from 'zustand';
import type { CouponIssue, CouponStatus, SendChannel, MonthlyStats, CouponSnapshot } from '@/types';
import { mockCouponIssues } from '@/data/mockData';
import { generateId, getExpireDate, isCouponIssuedThisYear, getRealStatus, calculateMonthlyStats, getBirthdayMembers, getSnapshotFromCouponType } from '@/utils';
import { getFromStorage, setToStorage } from '@/hooks/useLocalStorage';
import { useMemberStore } from './memberStore';
import { useCouponTypeStore } from './couponTypeStore';

const STORAGE_KEY = 'birthday_coupon_issues';

interface IssueCouponParams {
  memberId: string;
  couponTypeId: string;
  channel: SendChannel;
}

interface CouponState {
  issues: CouponIssue[];
  issueCoupon: (params: IssueCouponParams) => { success: boolean; message: string };
  bulkIssueCoupon: (memberIds: string[], couponTypeId: string, channel: SendChannel) => { success: number; failed: number; messages: string[] };
  updateStatus: (id: string, status: CouponStatus, orderId?: string, orderAmount?: number) => void;
  getIssuesByMember: (memberId: string) => CouponIssue[];
  getMonthlyStats: (month: number, year: number) => MonthlyStats;
  getBirthdayMembersWithStatus: (month: number, year: number) => Array<{ memberId: string; issued: boolean; issueId?: string; status?: CouponStatus }>;
  getExpiredUnused: () => CouponIssue[];
  getMissedMembers: (month: number, year: number) => string[];
}

function buildDefaultSnapshot(couponTypeId: string): CouponSnapshot {
  const ct = useCouponTypeStore.getState().getCouponTypeById(couponTypeId);
  if (ct) return getSnapshotFromCouponType(ct);
  return {
    couponName: '已删除券',
    couponType: '立减券',
    amount: 0,
    threshold: 0,
    validDays: 30,
  };
}

function migrateIssue(issue: CouponIssue): CouponIssue {
  if (issue.snapshot) return issue;
  return {
    ...issue,
    snapshot: buildDefaultSnapshot(issue.couponTypeId),
  };
}

const initialIssues = (): CouponIssue[] => {
  const stored = getFromStorage<CouponIssue[] | null>(STORAGE_KEY, null);
  const rawList = stored && stored.length > 0 ? stored : mockCouponIssues;
  return rawList.map(migrateIssue);
};

export const useCouponStore = create<CouponState>((set, get) => ({
  issues: initialIssues(),

  issueCoupon: ({ memberId, couponTypeId, channel }) => {
    const year = new Date().getFullYear();
    const issues = get().issues;

    if (isCouponIssuedThisYear(issues, memberId, couponTypeId, year)) {
      return { success: false, message: '该会员本年已发放过此券，不可重复发放' };
    }

    const couponType = useCouponTypeStore.getState().getCouponTypeById(couponTypeId);
    if (!couponType) {
      return { success: false, message: '券类型不存在' };
    }

    const today = new Date().toISOString().split('T')[0];
    const newIssue: CouponIssue = {
      id: generateId('ci'),
      memberId,
      couponTypeId,
      year,
      channel,
      status: 'pending',
      issueDate: today,
      expireDate: getExpireDate(today, couponType.validDays),
      snapshot: getSnapshotFromCouponType(couponType),
    };

    const newIssues = [...issues, newIssue];
    set({ issues: newIssues });
    setToStorage(STORAGE_KEY, newIssues);

    return { success: true, message: '发券成功' };
  },

  bulkIssueCoupon: (memberIds, couponTypeId, channel) => {
    const year = new Date().getFullYear();
    const issues = get().issues;
    const couponType = useCouponTypeStore.getState().getCouponTypeById(couponTypeId);
    const messages: string[] = [];
    let success = 0;
    let failed = 0;

    if (!couponType) {
      return { success: 0, failed: memberIds.length, messages: ['券类型不存在'] };
    }

    const today = new Date().toISOString().split('T')[0];
    const newIssues = [...issues];
    const snapshot = getSnapshotFromCouponType(couponType);

    memberIds.forEach((memberId) => {
      const member = useMemberStore.getState().getMemberById(memberId);
      if (!member) {
        failed++;
        messages.push(`会员 ${memberId} 不存在`);
        return;
      }

      if (isCouponIssuedThisYear(newIssues, memberId, couponTypeId, year)) {
        failed++;
        messages.push(`${member.name} 本年已发放过此券，跳过`);
        return;
      }

      const newIssue: CouponIssue = {
        id: generateId('ci'),
        memberId,
        couponTypeId,
        year,
        channel,
        status: 'pending',
        issueDate: today,
        expireDate: getExpireDate(today, couponType.validDays),
        snapshot,
      };
      newIssues.push(newIssue);
      success++;
    });

    set({ issues: newIssues });
    setToStorage(STORAGE_KEY, newIssues);

    return { success, failed, messages };
  },

  updateStatus: (id, status, orderId, orderAmount) => {
    const today = new Date().toISOString().split('T')[0];
    const newIssues = get().issues.map((i) => {
      if (i.id !== id) return i;
      const updated: CouponIssue = { ...i, status };
      if (status === 'claimed' && !i.claimedDate) {
        updated.claimedDate = today;
      }
      if (status === 'used') {
        updated.usedDate = today;
        if (orderId) updated.orderId = orderId;
        if (orderAmount) updated.orderAmount = orderAmount;
      }
      return updated;
    });
    set({ issues: newIssues });
    setToStorage(STORAGE_KEY, newIssues);
  },

  getIssuesByMember: (memberId) => {
    return get().issues.filter((i) => i.memberId === memberId);
  },

  getMonthlyStats: (month, year) => {
    const members = useMemberStore.getState().members;
    return calculateMonthlyStats(get().issues, members, month, year);
  },

  getBirthdayMembersWithStatus: (month, year) => {
    const members = useMemberStore.getState().members;
    const issues = get().issues;
    const birthdayMembers = getBirthdayMembers(members, month);

    return birthdayMembers.map((member) => {
      const memberIssues = issues.filter(
        (i) => i.memberId === member.id && i.year === year
      );
      if (memberIssues.length > 0) {
        const latest = memberIssues.sort((a, b) =>
          new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
        )[0];
        return {
          memberId: member.id,
          issued: true,
          issueId: latest.id,
          status: getRealStatus(latest),
        };
      }
      return { memberId: member.id, issued: false };
    });
  },

  getExpiredUnused: () => {
    return get().issues.filter((i) => {
      const realStatus = getRealStatus(i);
      return realStatus === 'expired' && i.status !== 'used';
    });
  },

  getMissedMembers: (month, year) => {
    const statusList = get().getBirthdayMembersWithStatus(month, year);
    return statusList.filter((s) => !s.issued).map((s) => s.memberId);
  },
}));
