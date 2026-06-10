import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import styles from './index.module.scss';
import { usePickupStore } from '@/store/usePickupStore';
import SectionHeader from '@/components/SectionHeader';
import Avatar from '@/components/Avatar';
import StatusBadge from '@/components/StatusBadge';
import classnames from 'classnames';
import { getWeekDay, getDateRange, DateRangeType } from '@/utils/dateUtils';
import { PickupRecord } from '@/types';

type StatsTab = 'pickup' | 'late' | 'swap';
type ModalType = 'pickup' | 'late' | 'swap' | null;

const RANGE_OPTIONS: { value: DateRangeType; label: string }[] = [
  { value: 'today', label: '今天' },
  { value: 'tomorrow', label: '明天' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
];

const StatsPage: React.FC = () => {
  const { familyMembers, pickupRecords, getMemberById } = usePickupStore();
  const [activeTab, setActiveTab] = useState<StatsTab>('pickup');
  const [dateRange, setDateRange] = useState<DateRangeType>('week');

  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalMemberId, setModalMemberId] = useState<string>('');
  const [modalDate, setModalDate] = useState<string>('');

  const [rangeStart, rangeEnd] = useMemo(() => getDateRange(dateRange), [dateRange]);

  const filteredRecords = useMemo(() => {
    return pickupRecords.filter((r) => r.date >= rangeStart && r.date <= rangeEnd);
  }, [pickupRecords, rangeStart, rangeEnd]);

  const memberStats = useMemo(() => {
    return familyMembers
      .map((member) => {
        const records = filteredRecords.filter(
          (r) => r.assignedTo === member.id && (r.status === 'picked' || r.status === 'late')
        );
        const totalPickups = records.length;
        const lateCount = records.filter((r) => r.isLate).length;
        const onTimeRate = totalPickups > 0 ? Math.round(((totalPickups - lateCount) / totalPickups) * 100) : 0;
        return { memberId: member.id, member, totalPickups, lateCount, onTimeRate };
      })
      .sort((a, b) => b.totalPickups - a.totalPickups);
  }, [familyMembers, filteredRecords]);

  const lateStats = useMemo(() => {
    return [...memberStats].sort((a, b) => b.lateCount - a.lateCount);
  }, [memberStats]);

  const swapStats = useMemo(() => {
    const swapMap: Record<string, number> = {};
    filteredRecords.forEach((r) => {
      if (r.swapStatus === 'confirmed') {
        swapMap[r.date] = (swapMap[r.date] || 0) + 1;
      }
    });
    return Object.entries(swapMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredRecords]);

  const totalStats = useMemo(() => {
    const totalPickups = memberStats.reduce((sum, s) => sum + s.totalPickups, 0);
    const totalLate = memberStats.reduce((sum, s) => sum + s.lateCount, 0);
    const totalSwapCount = filteredRecords.filter((r) => r.swapStatus === 'confirmed').length;
    const onTimeRate = totalPickups > 0 ? Math.round(((totalPickups - totalLate) / totalPickups) * 100) : 0;
    return { totalPickups, totalLate, totalSwapCount, onTimeRate };
  }, [memberStats, filteredRecords]);

  const hasAnyData = totalStats.totalPickups > 0 || totalStats.totalSwapCount > 0;

  const maxPickups = Math.max(...memberStats.map((s) => s.totalPickups), 1);
  const maxLate = Math.max(...lateStats.map((s) => s.lateCount), 1);

  const openMemberPickupModal = (memberId: string) => {
    setModalType('pickup');
    setModalMemberId(memberId);
    setModalDate('');
  };

  const openMemberLateModal = (memberId: string) => {
    setModalType('late');
    setModalMemberId(memberId);
    setModalDate('');
  };

  const openDateSwapModal = (date: string) => {
    setModalType('swap');
    setModalMemberId('');
    setModalDate(date);
  };

  const closeModal = () => {
    setModalType(null);
    setModalMemberId('');
    setModalDate('');
  };

  const modalMemberRecords = useMemo(() => {
    if (!modalMemberId) return [];
    const records = filteredRecords.filter(
      (r) => r.assignedTo === modalMemberId && (r.status === 'picked' || r.status === 'late')
    );
    if (modalType === 'late') {
      return records.filter((r) => r.isLate);
    }
    return records;
  }, [modalType, modalMemberId, filteredRecords]);

  const modalSwapRecords = useMemo(() => {
    if (!modalDate) return [];
    return filteredRecords.filter(
      (r) => r.date === modalDate && r.swapStatus === 'confirmed'
    );
  }, [modalDate, filteredRecords]);

  const modalMember = modalMemberId ? getMemberById(modalMemberId) : null;

  const rangeLabel = RANGE_OPTIONS.find((o) => o.value === dateRange)?.label || '';

  const getEmptyText = (tab: StatsTab) => {
    switch (tab) {
      case 'pickup':
        return `${rangeLabel}暂无接送记录`;
      case 'late':
        return `${rangeLabel}暂无迟到记录，表现优秀！`;
      case 'swap':
        return `${rangeLabel}暂无换班记录`;
    }
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>数据统计</Text>
        <Text className={styles.headerSubtitle}>{rangeLabel} · 查看接送情况和换班记录</Text>

        <View className={styles.overviewCards}>
          <View className={styles.overviewCard}>
            <Text className={styles.overviewNumber}>{totalStats.totalPickups}</Text>
            <Text className={styles.overviewLabel}>总接送次数</Text>
          </View>
          <View className={styles.overviewCard}>
            <Text className={styles.overviewNumber}>{totalStats.onTimeRate}%</Text>
            <Text className={styles.overviewLabel}>准时率</Text>
          </View>
          <View className={styles.overviewCard}>
            <Text className={styles.overviewNumber}>{totalStats.totalLate}</Text>
            <Text className={styles.overviewLabel}>迟到次数</Text>
          </View>
          <View className={styles.overviewCard}>
            <Text className={styles.overviewNumber}>{totalStats.totalSwapCount}</Text>
            <Text className={styles.overviewLabel}>换班次数</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.rangeBar}>
          {RANGE_OPTIONS.map((opt) => (
            <View
              key={opt.value}
              className={classnames(styles.rangeItem, { [styles.active]: dateRange === opt.value })}
              onClick={() => setDateRange(opt.value)}
            >
              <Text className={styles.rangeText}>{opt.label}</Text>
            </View>
          ))}
        </View>

        <View className={styles.tabBar}>
          <View
            className={classnames(styles.tabItem, { [styles.active]: activeTab === 'pickup' })}
            onClick={() => setActiveTab('pickup')}
          >
            <Text className={styles.tabText}>接送排行</Text>
          </View>
          <View
            className={classnames(styles.tabItem, { [styles.active]: activeTab === 'late' })}
            onClick={() => setActiveTab('late')}
          >
            <Text className={styles.tabText}>迟到统计</Text>
          </View>
          <View
            className={classnames(styles.tabItem, { [styles.active]: activeTab === 'swap' })}
            onClick={() => setActiveTab('swap')}
          >
            <Text className={styles.tabText}>换班统计</Text>
          </View>
        </View>

        {activeTab === 'pickup' && (
          <View className={styles.section}>
            <SectionHeader title="接送次数排行" subtitle={`${rangeLabel} · 按接送次数从多到少`} />
            {hasAnyData ? (
              <View className={styles.rankList}>
                {memberStats.map((stat, index) => (
                  <View
                    key={stat.memberId}
                    className={classnames(styles.rankItem, styles.clickable)}
                    onClick={() => openMemberPickupModal(stat.memberId)}
                  >
                    <View className={styles.rankLeft}>
                      <View
                        className={classnames(styles.rankNumber, {
                          [styles.rank1]: index === 0,
                          [styles.rank2]: index === 1,
                          [styles.rank3]: index === 2,
                        })}
                      >
                        <Text className={styles.rankNumText}>{index + 1}</Text>
                      </View>
                      {stat.member && (
                        <Avatar name={stat.member.name} color={stat.member.color} size="md" />
                      )}
                      <View className={styles.rankInfo}>
                        <Text className={styles.rankName}>{stat.member?.name}</Text>
                        <Text className={styles.rankRole}>{stat.member?.role}</Text>
                      </View>
                    </View>
                    <View className={styles.rankRight}>
                      <Text className={styles.rankCount}>{stat.totalPickups}次</Text>
                      <View className={styles.progressBar}>
                        <View
                          className={styles.progressFill}
                          style={{ width: `${(stat.totalPickups / maxPickups) * 100}%` }}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className={styles.emptyState}>
                <Text className={styles.emptyText}>{getEmptyText('pickup')}</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'late' && (
          <View className={styles.section}>
            <SectionHeader title="迟到次数统计" subtitle={`${rangeLabel} · 按迟到次数从多到少`} />
            <View className={styles.rankList}>
              {lateStats.some((s) => s.lateCount > 0) ? (
                lateStats.map((stat, index) => (
                  <View
                    key={stat.memberId}
                    className={classnames(styles.rankItem, styles.clickable)}
                    onClick={() => openMemberLateModal(stat.memberId)}
                  >
                    <View className={styles.rankLeft}>
                      <View
                        className={classnames(styles.rankNumber, {
                          [styles.rank1]: index === 0 && stat.lateCount > 0,
                          [styles.rank2]: index === 1 && stat.lateCount > 0,
                          [styles.rank3]: index === 2 && stat.lateCount > 0,
                        })}
                      >
                        <Text className={styles.rankNumText}>{index + 1}</Text>
                      </View>
                      {stat.member && (
                        <Avatar name={stat.member.name} color={stat.member.color} size="md" />
                      )}
                      <View className={styles.rankInfo}>
                        <Text className={styles.rankName}>{stat.member?.name}</Text>
                        <Text className={styles.rankRole}>{stat.member?.role}</Text>
                      </View>
                    </View>
                    <View className={styles.rankRight}>
                      <Text className={classnames(styles.rankCount, styles.lateCount)}>
                        {stat.lateCount}次
                      </Text>
                      <View className={styles.progressBar}>
                        <View
                          className={classnames(styles.progressFill, styles.lateFill)}
                          style={{ width: `${(stat.lateCount / maxLate) * 100}%` }}
                        />
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View className={styles.emptyState}>
                  <Text className={styles.emptyText}>{getEmptyText('late')}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {activeTab === 'swap' && (
          <View className={styles.section}>
            <SectionHeader title="临时换班最多的日期" subtitle={`${rangeLabel} · 按换班次数从多到少`} />
            {swapStats.length > 0 ? (
              <View className={styles.swapList}>
                {swapStats.map((item, index) => (
                  <View
                    key={item.date}
                    className={classnames(styles.swapItem, styles.clickable)}
                    onClick={() => openDateSwapModal(item.date)}
                  >
                    <View className={styles.swapLeft}>
                      <View
                        className={classnames(styles.rankNumber, {
                          [styles.rank1]: index === 0,
                          [styles.rank2]: index === 1,
                          [styles.rank3]: index === 2,
                        })}
                      >
                        <Text className={styles.rankNumText}>{index + 1}</Text>
                      </View>
                      <View className={styles.swapDateInfo}>
                        <Text className={styles.swapDate}>{item.date}</Text>
                        <Text className={styles.swapWeekday}>{getWeekDay(item.date)}</Text>
                      </View>
                    </View>
                    <StatusBadge type="confirmed" text={`${item.count}次换班`} size="md" />
                  </View>
                ))}
              </View>
            ) : (
              <View className={styles.emptyState}>
                <Text className={styles.emptyText}>{getEmptyText('swap')}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {modalType && (
        <View className={styles.modalMask} onClick={closeModal}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <View className={styles.modalHeaderLeft}>
                {modalMember && (
                  <Avatar name={modalMember.name} color={modalMember.color} size="md" />
                )}
                {modalDate && (
                  <View className={styles.modalDateBadge}>
                    <Text className={styles.modalDateEmoji}>📅</Text>
                  </View>
                )}
                <View>
                  <Text className={styles.modalTitle}>
                    {modalType === 'pickup' && `${modalMember?.name} · 接送明细`}
                    {modalType === 'late' && `${modalMember?.name} · 迟到明细`}
                    {modalType === 'swap' && `${modalDate} · 换班明细`}
                  </Text>
                  <Text className={styles.modalSubtitle}>
                    {modalType === 'pickup' && `${rangeLabel} · 共 ${modalMemberRecords.length} 次接送记录`}
                    {modalType === 'late' && `${rangeLabel} · 共 ${modalMemberRecords.length} 次迟到记录`}
                    {modalType === 'swap' && `${getWeekDay(modalDate)} · ${rangeLabel} · 共 ${modalSwapRecords.length} 次换班`}
                  </Text>
                </View>
              </View>
              <View className={styles.modalClose} onClick={closeModal}>
                <Text className={styles.modalCloseText}>✕</Text>
              </View>
            </View>

            <ScrollView className={styles.modalBody} scrollY>
              {modalType === 'pickup' && (
                modalMemberRecords.length > 0 ? (
                  <View className={styles.detailList}>
                    {modalMemberRecords.map((r) => (
                      <DetailPickupCard key={r.id} record={r} store={usePickupStore.getState()} />
                    ))}
                  </View>
                ) : (
                  <View className={styles.modalEmpty}>
                    <Text className={styles.modalEmptyText}>{rangeLabel}暂无接送记录</Text>
                  </View>
                )
              )}

              {modalType === 'late' && (
                modalMemberRecords.length > 0 ? (
                  <View className={styles.detailList}>
                    {modalMemberRecords.map((r) => (
                      <DetailLateCard key={r.id} record={r} store={usePickupStore.getState()} />
                    ))}
                  </View>
                ) : (
                  <View className={styles.modalEmpty}>
                    <Text className={styles.modalEmptyText}>{rangeLabel}暂无迟到记录，表现优秀！</Text>
                  </View>
                )
              )}

              {modalType === 'swap' && (
                modalSwapRecords.length > 0 ? (
                  <View className={styles.detailList}>
                    {modalSwapRecords.map((r) => (
                      <DetailSwapCard key={r.id} record={r} store={usePickupStore.getState()} />
                    ))}
                  </View>
                ) : (
                  <View className={styles.modalEmpty}>
                    <Text className={styles.modalEmptyText}>{rangeLabel}该日期暂无换班记录</Text>
                  </View>
                )
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

interface DetailCardProps {
  record: PickupRecord;
  store: ReturnType<typeof usePickupStore.getState>;
}

const DetailPickupCard: React.FC<DetailCardProps> = ({ record, store }) => {
  const child = store.getChildById(record.childId);
  const school = store.getSchoolById(record.schoolId);
  return (
    <View className={styles.detailCard}>
      <View className={styles.detailRow}>
        <Text className={styles.detailLabel}>日期</Text>
        <Text className={styles.detailValue}>
          {record.date} {getWeekDay(record.date)}
        </Text>
      </View>
      <View className={styles.detailRow}>
        <Text className={styles.detailLabel}>孩子</Text>
        <Text className={styles.detailValue}>{child?.name}</Text>
      </View>
      <View className={styles.detailRow}>
        <Text className={styles.detailLabel}>学校</Text>
        <Text className={styles.detailValue}>
          {school?.name} {school?.className}
        </Text>
      </View>
      <View className={styles.detailRow}>
        <Text className={styles.detailLabel}>放学时间</Text>
        <Text className={styles.detailValue}>{school?.dismissTime}</Text>
      </View>
      <View className={styles.detailRow}>
        <Text className={styles.detailLabel}>接到时间</Text>
        <Text className={classnames(styles.detailValue, styles.successValue)}>
          {record.pickedTime}
        </Text>
      </View>
      {record.isLate && (
        <View className={styles.detailRow}>
          <Text className={styles.detailLabel}>迟到</Text>
          <Text className={classnames(styles.detailValue, styles.lateValue)}>
            {record.lateMinutes} 分钟
          </Text>
        </View>
      )}
      {record.remark && (
        <View className={styles.detailRemark}>
          <Text className={styles.detailRemarkText}>{record.remark}</Text>
        </View>
      )}
    </View>
  );
};

const DetailLateCard: React.FC<DetailCardProps> = ({ record, store }) => {
  const child = store.getChildById(record.childId);
  const school = store.getSchoolById(record.schoolId);
  return (
    <View className={classnames(styles.detailCard, styles.lateCard)}>
      <View className={styles.detailRow}>
        <Text className={styles.detailLabel}>日期</Text>
        <Text className={styles.detailValue}>
          {record.date} {getWeekDay(record.date)}
        </Text>
      </View>
      <View className={styles.detailRow}>
        <Text className={styles.detailLabel}>孩子</Text>
        <Text className={styles.detailValue}>{child?.name}</Text>
      </View>
      <View className={styles.detailRow}>
        <Text className={styles.detailLabel}>学校</Text>
        <Text className={styles.detailValue}>
          {school?.name} {school?.className}
        </Text>
      </View>
      <View className={styles.detailRow}>
        <Text className={styles.detailLabel}>放学时间</Text>
        <Text className={styles.detailValue}>{school?.dismissTime}</Text>
      </View>
      <View className={styles.detailRow}>
        <Text className={styles.detailLabel}>接到时间</Text>
        <Text className={styles.detailValue}>{record.pickedTime}</Text>
      </View>
      <View className={styles.detailRow}>
        <Text className={styles.detailLabel}>迟到时长</Text>
        <Text className={classnames(styles.detailValue, styles.lateValue)}>
          ⚠️ {record.lateMinutes} 分钟
        </Text>
      </View>
      {record.remark && (
        <View className={styles.detailRemark}>
          <Text className={styles.detailRemarkText}>{record.remark}</Text>
        </View>
      )}
    </View>
  );
};

const DetailSwapCard: React.FC<DetailCardProps> = ({ record, store }) => {
  const child = store.getChildById(record.childId);
  const swapFrom = record.swapFrom ? store.getMemberById(record.swapFrom) : null;
  const swapTo = record.swapTo ? store.getMemberById(record.swapTo) : null;
  return (
    <View className={classnames(styles.detailCard, styles.swapCard)}>
      <View className={styles.swapChain}>
        {swapFrom && (
          <View className={styles.swapPerson}>
            <Avatar name={swapFrom.name} color={swapFrom.color} size="sm" />
            <Text className={styles.swapPersonName}>{swapFrom.name}</Text>
            <Text className={styles.swapPersonRole}>{swapFrom.role}</Text>
          </View>
        )}
        <View className={styles.swapArrow}>
          <Text className={styles.swapArrowText}>→</Text>
        </View>
        {swapTo && (
          <View className={styles.swapPerson}>
            <Avatar name={swapTo.name} color={swapTo.color} size="sm" />
            <Text className={styles.swapPersonName}>{swapTo.name}</Text>
            <Text className={styles.swapPersonRole}>{swapTo.role}</Text>
          </View>
        )}
      </View>
      <View className={styles.detailRow}>
        <Text className={styles.detailLabel}>孩子</Text>
        <Text className={styles.detailValue}>{child?.name}</Text>
      </View>
      {record.swapRequestTime && (
        <View className={styles.detailRow}>
          <Text className={styles.detailLabel}>申请时间</Text>
          <Text className={styles.detailValue}>{record.swapRequestTime}</Text>
        </View>
      )}
      {record.swapConfirmTime && (
        <View className={styles.detailRow}>
          <Text className={styles.detailLabel}>确认时间</Text>
          <Text className={classnames(styles.detailValue, styles.successValue)}>
            {record.swapConfirmTime}
          </Text>
        </View>
      )}
    </View>
  );
};

export default StatsPage;
