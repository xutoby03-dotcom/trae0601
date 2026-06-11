import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useRainStore } from '@/store/useRainStore';
import type { RainLevel } from '@/types';
import { RAIN_LABEL_MAP, RAIN_EMOJI_MAP } from '@/types';
import FormField, { NumberStepper, SegmentControl } from '@/components/FormField';
import dayjs from 'dayjs';

const rainOptions: RainLevel[] = ['sunny', 'drizzle', 'light', 'medium', 'heavy', 'storm'];

const EntryPage: React.FC = () => {
  const {
    weather, staff, dishStocks, kitchen,
    setWeather, setStaff, setKitchen,
    updateDishStock, generateWarnings
  } = useRainStore();

  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }, []);

  const updateRain = (lvl: RainLevel) => {
    setWeather({ rainLevel: lvl });
    showToast(`天气已更新为${RAIN_LABEL_MAP[lvl]}`);
  };

  const updateForecast = (lvl: RainLevel) => {
    setWeather({ forecastNextHour: lvl });
    showToast(`预报已更新→${RAIN_LABEL_MAP[lvl]}`);
  };

  const updateTemp = (v: number) => {
    setWeather({ temperature: v });
  };

  const updateWind = (v: number) => {
    setWeather({ windLevel: v });
  };

  const updateCookTime = (v: number) => {
    setKitchen({ estimatedCookTime: v });
    showToast(`预计出餐时间: ${v}分钟`);
  };

  const updatePending = (v: number) => {
    setKitchen({ pendingOrderCount: v });
  };

  const updateCurrentOrders = (v: number) => {
    setKitchen({ currentOrderCount: v });
  };

  const updateStock = (id: string, v: number) => {
    updateDishStock(id, { currentStock: v });
  };

  useEffect(() => {
    const t = setTimeout(() => generateWarnings(), 200);
    return () => clearTimeout(t);
  }, [weather.rainLevel, weather.forecastNextHour, kitchen.estimatedCookTime, kitchen.pendingOrderCount]);

  const dishItems = dishStocks
    .slice()
    .sort((a, b) => {
      const ratioA = a.currentStock / Math.max(1, a.safeStock);
      const ratioB = b.currentStock / Math.max(1, b.safeStock);
      return ratioA - ratioB;
    });

  return (
    <ScrollView scrollY className={styles.page}>
      {/* 天气录入 */}
      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>🌤️</Text>
            天气录入
          </Text>
          <Text className={styles.updateTip}>
            {dayjs(weather.recordedAt).format('HH:mm')} 更新
          </Text>
        </View>

        <FormField label="当前雨势" required hint="点击选择立即生效">
          <View className={styles.rainOptions}>
            {rainOptions.map(lvl => (
              <View
                key={lvl}
                className={classnames(
                  styles.rainOption,
                  weather.rainLevel === lvl && styles.rainOptionActive
                )}
                onClick={() => updateRain(lvl)}
              >
                <Text className={styles.rainOptEmoji}>{RAIN_EMOJI_MAP[lvl]}</Text>
                <Text className={styles.rainOptLabel}>{RAIN_LABEL_MAP[lvl]}</Text>
              </View>
            ))}
          </View>
        </FormField>

        <FormField label="未来1小时预报" hint="预警系统的关键参考">
          <View className={styles.rainOptions}>
            {rainOptions.map(lvl => (
              <View
                key={lvl}
                className={classnames(
                  styles.rainOption,
                  weather.forecastNextHour === lvl && styles.rainOptionActive
                )}
                onClick={() => updateForecast(lvl)}
              >
                <Text className={styles.rainOptEmoji}>{RAIN_EMOJI_MAP[lvl]}</Text>
                <Text className={styles.rainOptLabel}>{RAIN_LABEL_MAP[lvl]}</Text>
              </View>
            ))}
          </View>
        </FormField>

        <View style={{ display: 'flex', gap: '24rpx' }}>
          <FormField label="气温(°C)" className={styles.kitchenField}>
            <NumberStepper
              value={weather.temperature}
              min={-10}
              max={45}
              onChange={updateTemp}
              suffix="°C"
            />
          </FormField>
          <FormField label="风力(级)" className={styles.kitchenField}>
            <NumberStepper
              value={weather.windLevel}
              min={0}
              max={12}
              onChange={updateWind}
              suffix="级"
            />
          </FormField>
        </View>
      </View>

      {/* 备餐人手 */}
      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>👥</Text>
            备餐人手
          </Text>
          <Text className={styles.updateTip}>
            {dayjs(staff.updatedAt).format('HH:mm')} 更新
          </Text>
        </View>

        <View className={styles.staffGrid}>
          <View className={styles.staffGroup}>
            <Text className={styles.staffGroupLabel}>🍳 厨师</Text>
            <View className={styles.staffMini}>
              <Text className={styles.staffMiniLabel}>总计</Text>
              <Text className={styles.staffMiniVal}>{staff.totalChefs}</Text>
            </View>
            <FormField label="在岗" hint="">
              <NumberStepper
                value={staff.availableChefs}
                min={0}
                max={staff.totalChefs}
                onChange={v => setStaff({ availableChefs: v })}
              />
            </FormField>
          </View>

          <View className={styles.staffGroup}>
            <Text className={styles.staffGroupLabel}>📦 打包员</Text>
            <View className={styles.staffMini}>
              <Text className={styles.staffMiniLabel}>总计</Text>
              <Text className={styles.staffMiniVal}>{staff.totalPackers}</Text>
            </View>
            <FormField label="在岗" hint="">
              <NumberStepper
                value={staff.availablePackers}
                min={0}
                max={staff.totalPackers}
                onChange={v => setStaff({ availablePackers: v })}
              />
            </FormField>
          </View>

          <View className={styles.staffGroup} style={{ gridColumn: 'span 2' }}>
            <Text className={styles.staffGroupLabel}>🏍️ 骑手（关键指标！）</Text>
            <View className={styles.staffMini}>
              <Text className={styles.staffMiniLabel}>总计合作骑手</Text>
              <Text className={styles.staffMiniVal}>{staff.totalRiders}</Text>
            </View>
            <FormField label="当前在店/可派单" hint="骑手不足将触发预警">
              <NumberStepper
                value={staff.availableRiders}
                min={0}
                max={staff.totalRiders + 10}
                onChange={v => {
                  setStaff({ availableRiders: v });
                  showToast(`可用骑手: ${v}人`);
                }}
              />
            </FormField>
          </View>
        </View>
      </View>

      {/* 热门菜库存 */}
      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>🥡</Text>
            热门菜库存
          </Text>
          <Text className={styles.updateTip}>按库存紧张排序</Text>
        </View>

        <View className={styles.dishList}>
          {dishItems.map(d => {
            const ratio = d.currentStock / Math.max(1, d.safeStock);
            const statusCls = ratio < 0.3 ? styles.dishStatusCritical : ratio < 0.8 ? styles.dishStatusLow : styles.dishStatus;
            return (
              <View className={styles.dishItem} key={d.id}>
                <View className={classnames(styles.dishStatus, statusCls)} />
                <View className={styles.dishInfo}>
                  <View className={styles.dishNameRow}>
                    {d.isHot && <Text className={styles.hotBadge}>🔥</Text>}
                    <Text className={styles.dishName}>{d.name}</Text>
                  </View>
                  <Text className={styles.dishMeta}>
                    {d.category} · 今日售出{d.todaySold}份 · 安全线{d.safeStock}
                  </Text>
                </View>
                <View className={styles.dishStepper}>
                  <NumberStepper
                    value={d.currentStock}
                    min={0}
                    max={999}
                    onChange={v => updateStock(d.id, v)}
                    suffix="份"
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* 出餐与订单 */}
      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>⏱️</Text>
            出餐 & 订单量
          </Text>
          <Text className={styles.updateTip}>
            {dayjs(kitchen.updatedAt).format('HH:mm')} 更新
          </Text>
        </View>

        <FormField
          label="预计出餐时间"
          required
          hint={`今日平均 ${kitchen.avgCookTimeToday} 分钟`}
        >
          <NumberStepper
            value={kitchen.estimatedCookTime}
            min={5}
            max={60}
            step={1}
            onChange={updateCookTime}
            suffix="分钟"
          />
        </FormField>

        <View className={styles.kitchenRow}>
          <FormField label="待制作单量" className={styles.kitchenField}>
            <NumberStepper
              value={kitchen.pendingOrderCount}
              min={0}
              max={200}
              onChange={updatePending}
              suffix="单"
            />
          </FormField>
          <FormField label="今日订单总量" className={styles.kitchenField}>
            <NumberStepper
              value={kitchen.currentOrderCount}
              min={0}
              max={2000}
              onChange={updateCurrentOrders}
              suffix="单"
            />
          </FormField>
        </View>
      </View>

      <View style={{ height: '160rpx' }} />

      {toast && <View className={styles.toast}>{toast}</View>}
    </ScrollView>
  );
};

export default EntryPage;
