import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import styles from './index.module.scss';
import { useRainStore } from '@/store/useRainStore';
import type { DailyStat, StockOutRank } from '@/types';
import { RAIN_LABEL_MAP, RAIN_EMOJI_MAP } from '@/types';
import dayjs from 'dayjs';

const StatsPage: React.FC = () => {
  const { dailyStats, getRainyDayStats, orders } = useRainStore();
  const rainy = getRainyDayStats();

  const sunnyStats = useMemo(() => {
    const s = dailyStats.filter(d => !d.isRainy);
    if (s.length === 0) return { avgCook: 0, avgTimeout: 0, avgOrders: 0 };
    return {
      avgCook: Math.round(s.reduce((a, b) => a + b.avgCookTime, 0) / s.length),
      avgTimeout: Math.round(s.reduce((a, b) => a + b.timeoutRate * 100, 0) / s.length) / 100,
      avgOrders: Math.round(s.reduce((a, b) => a + b.totalOrders, 0) / s.length)
    };
  }, [dailyStats]);

  const stockOutRank: StockOutRank[] = useMemo(() => {
    const map = new Map<string, { name: string; count: number; category: string }>();
    dailyStats.forEach(d => {
      d.stockOutDishes.forEach((name, i) => {
        const catName = name;
        if (!map.has(name)) {
          const categories = ['面食', '面点', '套餐', '饭类', '汤品', '热菜', '饮品', '凉菜'];
          map.set(name, {
            name,
            count: 0,
            category: categories[(name.charCodeAt(0) + i) % categories.length]
          });
        }
        const entry = map.get(name)!;
        entry.count += 1;
      });
    });
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [dailyStats]);

  const maxOrders = Math.max(...dailyStats.map(d => d.totalOrders), 1);
  const timeoutSummary = useMemo(() => {
    const totalTimeout = dailyStats.reduce((s, d) => s + d.timeoutOrders, 0);
    const totalOrders = dailyStats.reduce((s, d) => s + d.totalOrders, 0);
    const rainyTimeout = dailyStats.filter(d => d.isRainy).reduce((s, d) => s + d.timeoutOrders, 0);
    const rainyTotal = dailyStats.filter(d => d.isRainy).reduce((s, d) => s + d.totalOrders, 0);
    return {
      totalTimeout,
      totalOrders,
      avgRate: totalOrders > 0 ? (totalTimeout / totalOrders * 100).toFixed(1) : '0',
      rainyTimeout,
      rainyTotal,
      rainyRate: rainyTotal > 0 ? (rainyTimeout / rainyTotal * 100).toFixed(1) : '0'
    };
  }, [dailyStats]);

  return (
    <ScrollView scrollY className={styles.page}>
      {/* Hero 雨天均值 */}
      <View className={styles.heroStats}>
        <Text className={styles.heroTitle}>🌧️ 雨天均值（历史7天）</Text>
        <View className={styles.heroGrid}>
          <View className={styles.heroStat}>
            <Text className={styles.heroVal}>{rainy.avgCookTime}</Text>
            <Text className={styles.heroLabel}>平均出餐(分钟)</Text>
          </View>
          <View className={styles.heroStat}>
            <Text className={styles.heroVal}>{(rainy.avgTimeoutRate * 100).toFixed(0)}%</Text>
            <Text className={styles.heroLabel}>平均超时率</Text>
          </View>
          <View className={styles.heroStat}>
            <Text className={styles.heroVal}>{rainy.avgOrders}</Text>
            <Text className={styles.heroLabel}>日均订单量</Text>
          </View>
        </View>
      </View>

      {/* 雨天 vs 晴天对比 */}
      <View className={styles.sectionCard}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>⚖️</Text>
            雨天 vs 晴天对比
          </Text>
          <Text className={styles.sectionBadge}>近7天数据</Text>
        </View>

        {/* 日均单量 */}
        <Text className={styles.chartTitle}>📦 日均订单量对比</Text>
        <View className={styles.vsRow}>
          <View className={styles.vsItem}>
            <Text className={styles.vsVal}>{sunnyStats.avgOrders}</Text>
            <Text className={styles.vsLabel}>☀️ 晴天均值</Text>
          </View>
          <View className={styles.vsDivider}>
            <Text className={styles.vsDividerText}>↑{Math.round((rainy.avgOrders / Math.max(1, sunnyStats.avgOrders) - 1) * 100)}%</Text>
          </View>
          <View className={styles.vsItem + ' ' + styles.vsItemRainy}>
            <Text className={styles.vsVal}>{rainy.avgOrders}</Text>
            <Text className={styles.vsLabel}>🌧️ 雨天均值</Text>
          </View>
        </View>

        {/* 平均出餐 */}
        <Text className={styles.chartTitle} style={{ marginTop: '32rpx' }}>⏱️ 平均出餐时间对比</Text>
        <View className={styles.vsRow}>
          <View className={styles.vsItem}>
            <Text className={styles.vsVal}>{sunnyStats.avgCook}<Text style={{ fontSize: '24rpx', fontWeight: 400 }}> 分</Text></Text>
            <Text className={styles.vsLabel}>☀️ 晴天</Text>
          </View>
          <View className={styles.vsDivider}>
            <Text className={styles.vsDividerText}>+{rainy.avgCookTime - sunnyStats.avgCook}分</Text>
          </View>
          <View className={styles.vsItem + ' ' + styles.vsItemRainy}>
            <Text className={classnames(styles.vsVal, styles.vsValWarn)}>
              {rainy.avgCookTime}<Text style={{ fontSize: '24rpx', fontWeight: 400 }}> 分</Text>
            </Text>
            <Text className={styles.vsLabel}>🌧️ 雨天</Text>
          </View>
        </View>

        {/* 超时率 */}
        <Text className={styles.chartTitle} style={{ marginTop: '32rpx' }}>⏰ 平均超时率对比</Text>
        <View className={styles.vsRow}>
          <View className={styles.vsItem}>
            <Text className={styles.vsVal}>
              {(sunnyStats.avgTimeout * 100).toFixed(0)}<Text style={{ fontSize: '24rpx', fontWeight: 400 }}>%</Text>
            </Text>
            <Text className={styles.vsLabel}>☀️ 晴天</Text>
          </View>
          <View className={styles.vsDivider}>
            <Text className={styles.vsDividerText}>↑{((rainy.avgTimeoutRate - sunnyStats.avgTimeout) * 100).toFixed(0)}%</Text>
          </View>
          <View className={styles.vsItem + ' ' + styles.vsItemRainy}>
            <Text className={classnames(styles.vsVal, styles.vsValDanger)}>
              {(rainy.avgTimeoutRate * 100).toFixed(0)}<Text style={{ fontSize: '24rpx', fontWeight: 400 }}>%</Text>
            </Text>
            <Text className={styles.vsLabel}>🌧️ 雨天</Text>
          </View>
        </View>
      </View>

      {/* 超时单统计 */}
      <View className={styles.sectionCard}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>⏰</Text>
            超时单统计
          </Text>
          <Text className={styles.sectionBadge}>共 {timeoutSummary.totalTimeout} 单</Text>
        </View>
        <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24rpx' }}>
          <View className={styles.vsItem}>
            <Text className={styles.vsVal}>{timeoutSummary.totalTimeout}</Text>
            <Text className={styles.vsLabel}>累计超时单</Text>
          </View>
          <View className={styles.vsItem + ' ' + styles.vsItemRainy}>
            <Text className={classnames(styles.vsVal, styles.vsValDanger)}>{timeoutSummary.rainyTimeout}</Text>
            <Text className={styles.vsLabel}>雨天超时单</Text>
          </View>
          <View className={styles.vsItem}>
            <Text className={styles.vsVal}>{timeoutSummary.avgRate}%</Text>
            <Text className={styles.vsLabel}>整体超时率</Text>
          </View>
          <View className={styles.vsItem + ' ' + styles.vsItemRainy}>
            <Text className={classnames(styles.vsVal, styles.vsValWarn)}>{timeoutSummary.rainyRate}%</Text>
            <Text className={styles.vsLabel}>雨天超时率</Text>
          </View>
        </View>
      </View>

      {/* 趋势图 */}
      <View className={styles.sectionCard}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📈</Text>
            近7日订单趋势
          </Text>
          <Text className={styles.sectionBadge}>柱高=单量</Text>
        </View>
        <Text className={styles.chartTitle}>每日订单量 & 天气</Text>
        <View className={styles.trendRow}>
          {dailyStats.slice().reverse().map(d => (
            <View className={styles.trendBarRow} key={d.date}>
              <View className={styles.trendDate}>
                <Text className={styles.trendRainIcon}>
                  {d.isRainy ? RAIN_EMOJI_MAP[d.rainLevel || 'light'] : '☀️'}
                </Text>
                {dayjs(d.date).format('MM/DD')}
              </View>
              <View className={styles.trendBarWrap}>
                <View
                  className={styles.trendBar + ' ' + (d.isRainy ? styles.trendBarRainy : styles.trendBarNormal)}
                  style={{ width: `${(d.totalOrders / maxOrders) * 100}%` }}
                />
              </View>
              <Text className={styles.trendVal}>
                {d.totalOrders}单 · 超时{d.timeoutOrders}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 最易断货菜品 */}
      <View className={styles.sectionCard}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📉</Text>
            最易断货菜品 TOP {stockOutRank.length}
          </Text>
          <Text className={styles.sectionBadge}>雨天高发</Text>
        </View>
        <View className={styles.rankList}>
          {stockOutRank.map((r, i) => (
            <View className={styles.rankItem} key={r.name}>
              <View className={styles.rankNo + ' ' + (
                i === 0 ? styles.rankNo1 :
                i === 1 ? styles.rankNo2 :
                i === 2 ? styles.rankNo3 : ''
              )}>
                {i + 1}
              </View>
              <View className={styles.rankInfo}>
                <Text className={styles.rankName}>{r.name}</Text>
                <Text className={styles.rankCat}>{r.category}</Text>
              </View>
              <View className={styles.rankCount}>
                <Text className={styles.rankCountVal}>{r.count}</Text>
                <Text className={styles.rankCountLabel}>次断货</Text>
              </View>
            </View>
          ))}
          {stockOutRank.length === 0 && (
            <View style={{ padding: '32rpx 0', textAlign: 'center' }}>
              <Text style={{ color: '#94A3B8', fontSize: '28rpx' }}>暂无断货记录</Text>
            </View>
          )}
        </View>
      </View>

      {/* 经营建议 */}
      <View className={styles.tipsBox}>
        <Text className={styles.tipsTitle}>💡 雨天经营建议</Text>
        <Text className={styles.tipItem}>雨天前提前备货 TOP3 断货菜品的原材料</Text>
        <Text className={styles.tipItem}>雨势达中雨以上时，将承诺配送时长延长15-30分钟</Text>
        <Text className={styles.tipItem}>暴雨预警时提前多安排1-2名后厨和打包人员</Text>
        <Text className={styles.tipItem}>对3km以上订单可设置起送价，优先保障近距离订单</Text>
        <Text className={styles.tipItem}>对超时高风险订单提前电话联系客户说明情况</Text>
        <Text className={styles.tipItem}>雨天结束后可发放优惠券挽回差评客户</Text>
      </View>

      <View style={{ height: '160rpx' }} />
    </ScrollView>
  );
};

export default StatsPage;
