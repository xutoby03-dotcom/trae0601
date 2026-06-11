import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { Order, OrderStatus, TimeoutRisk, OrderPlatform } from '@/types';
import { PLATFORM_LABEL_MAP, STATUS_LABEL_MAP, RISK_LABEL_MAP } from '@/types';
import Tag from '@/components/Tag';
import dayjs from 'dayjs';

interface OrderItemProps {
  order: Order;
  onStatusChange?: (orderId: string, status: OrderStatus) => void;
  onRiskChange?: (orderId: string, risk: TimeoutRisk) => void;
  onOrderChange?: (orderId: string, patch: Partial<Order>) => void;
  showActions?: boolean;
  showEdit?: boolean;
}

const statusColors: Record<OrderStatus, 'success' | 'warning' | 'primary' | 'info' | 'default'> = {
  pending: 'warning',
  cooking: 'primary',
  ready: 'info',
  picked: 'default',
  completed: 'success',
  cancelled: 'default'
};

const riskColors: Record<TimeoutRisk, 'success' | 'warning' | 'danger'> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
  critical: 'danger'
};

const nextStatusMap: Record<OrderStatus, { label: string; next: OrderStatus; tone: string } | null> = {
  pending:    { label: '开始制作', next: 'cooking',   tone: 'primary' },
  cooking:    { label: '制作完成', next: 'ready',     tone: 'warning' },
  ready:      { label: '骑手取走', next: 'picked',    tone: 'info' },
  picked:     { label: '确认送达', next: 'completed', tone: 'success' },
  completed:  null,
  cancelled:  null
};

const OrderItem: React.FC<OrderItemProps> = ({
  order,
  onStatusChange,
  onRiskChange,
  onOrderChange,
  showActions = true,
  showEdit = false
}) => {
  const now = Date.now();
  const remaining = Math.max(0, Math.round((order.promisedDeliveryAt - now) / 60000));
  const overdue = order.promisedDeliveryAt < now && order.status !== 'completed' && order.status !== 'cancelled';
  const nextStep = nextStatusMap[order.status];
  const platformColor = order.platform === 'meituan' ? 'meituan' : order.platform === 'eleme' ? 'eleme' : 'jddj';

  const quickRisks: { risk: TimeoutRisk; label: string }[] = [
    { risk: 'low', label: '低' },
    { risk: 'medium', label: '中' },
    { risk: 'high', label: '高' },
    { risk: 'critical', label: '危' }
  ];

  const platformOptions: { key: OrderPlatform; label: string; short: string }[] = [
    { key: 'meituan', label: '美团', short: '美' },
    { key: 'eleme', label: '饿了么', short: '饿' },
    { key: 'jddj', label: '京东', short: '京' }
  ];

  const handlePlatformChange = (p: OrderPlatform) => {
    onOrderChange?.(order.id, { platform: p });
  };

  const handleDistanceChange = (delta: number) => {
    const newDist = Math.max(0.1, Math.round((order.distanceKm + delta) * 10) / 10);
    onOrderChange?.(order.id, { distanceKm: newDist });
  };

  const toggleHotFood = () => {
    onOrderChange?.(order.id, { isHotFood: !order.isHotFood });
  };

  return (
    <View className={classnames(
      styles.card,
      overdue && styles.overdue,
      order.timeoutRisk === 'critical' && styles.critical
    )}>
      <View className={styles.header}>
        <View className={styles.leftHead}>
          {showEdit && onOrderChange ? (
            <View className={styles.platformSwitcher}>
              {platformOptions.map(p => (
                <View
                  key={p.key}
                  className={classnames(
                    styles.platBtn,
                    styles[p.key],
                    order.platform === p.key && styles.platBtnActive
                  )}
                  onClick={() => handlePlatformChange(p.key)}
                >
                  <Text className={styles.platBtnText}>{p.short}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Tag text={PLATFORM_LABEL_MAP[order.platform]} color={platformColor as any} size="md" />
          )}
          <Text className={styles.orderNo}>{order.orderNo.slice(-6)}</Text>
        </View>
        <View className={styles.rightHead}>
          <Tag
            text={`${STATUS_LABEL_MAP[order.status]}`}
            color={statusColors[order.status]}
            size="sm"
          />
        </View>
      </View>

      <View className={styles.customerRow}>
        <Text className={styles.customerName}>{order.customerName}</Text>
        {showEdit && onOrderChange ? (
          <View className={styles.distanceStepper}>
            <View
              className={classnames(styles.distBtn, styles.distMinus)}
              onClick={() => handleDistanceChange(-0.5)}
            >
              <Text className={styles.distBtnText}>−</Text>
            </View>
            <View className={styles.distValueBox}>
              <Text className={styles.distValue}>{order.distanceKm.toFixed(1)}</Text>
              <Text className={styles.distUnit}>km</Text>
            </View>
            <View
              className={classnames(styles.distBtn, styles.distPlus)}
              onClick={() => handleDistanceChange(0.5)}
            >
              <Text className={styles.distBtnText}>+</Text>
            </View>
          </View>
        ) : (
          <View className={styles.distanceBox}>
            <Text className={styles.distanceIcon}>📍</Text>
            <Text className={styles.distanceText}>{order.distanceKm.toFixed(1)}km</Text>
          </View>
        )}
      </View>

      <View className={styles.addressBox}>
        <Text className={styles.address}>{order.address}</Text>
      </View>

      <View className={styles.dishesBox}>
        {order.dishes.slice(0, 3).map((d, i) => (
          <View className={styles.dishChip} key={i}>
            {d.isHot && <Text className={styles.dishHot}>🔥</Text>}
            <Text className={styles.dishName}>{d.dishName}</Text>
            <Text className={styles.dishQty}>×{d.quantity}</Text>
          </View>
        ))}
        {order.dishes.length > 3 && (
          <Text className={styles.dishMore}>+{order.dishes.length - 3}</Text>
        )}
      </View>

      <View className={styles.metaRow}>
        <View className={styles.metaItem}>
          {showEdit && onOrderChange ? (
            <View
              className={classnames(
                styles.hotToggle,
                order.isHotFood && styles.hotToggleOn
              )}
              onClick={toggleHotFood}
            >
              <View className={styles.hotToggleTrack}>
                <View className={styles.hotToggleThumb}>
                  <Text className={styles.hotToggleIcon}>{order.isHotFood ? '🔥' : '🧊'}</Text>
                </View>
              </View>
              <Text className={styles.hotToggleLabel}>
                {order.isHotFood ? '热食' : '非热食'}
              </Text>
            </View>
          ) : (
            order.isHotFood && <Tag text="🔥热食" color="hot" size="sm" />
          )}
        </View>
        <View className={styles.timeBox}>
          <Text className={classnames(styles.timeLeft, overdue && styles.overdueText)}>
            {overdue ? `已超时 ${-remaining}` : remaining}
          </Text>
          <Text className={styles.timeUnit}>{overdue ? '分钟' : '分钟内送达'}</Text>
        </View>
      </View>

      <View className={styles.riskRow}>
        <Text className={styles.riskLabel}>超时风险：</Text>
        {showActions && onRiskChange ? (
          <View className={styles.riskButtons}>
            {quickRisks.map(r => (
              <View
                key={r.risk}
                className={classnames(
                  styles.riskBtn,
                  styles[r.risk],
                  order.timeoutRisk === r.risk && styles.riskActive
                )}
                onClick={() => onRiskChange(order.id, r.risk)}
              >
                <Text className={styles.riskBtnText}>{r.label}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Tag text={RISK_LABEL_MAP[order.timeoutRisk]} color={riskColors[order.timeoutRisk]} size="sm" />
        )}
      </View>

      {order.remark && (
        <View className={styles.remarkBox}>
          <Text className={styles.remarkLabel}>备注：</Text>
          <Text className={styles.remarkText}>{order.remark}</Text>
        </View>
      )}

      {showActions && nextStep && onStatusChange && (
        <View className={styles.actionRow}>
          <Button
            className={classnames(styles.actionBtn, styles[nextStep.tone])}
            onClick={() => onStatusChange(order.id, nextStep.next)}
          >
            <Text className={styles.actionBtnText}>→ {nextStep.label}</Text>
          </Button>
          <Text className={styles.amount}>¥{order.totalAmount.toFixed(1)}</Text>
        </View>
      )}

      {(!nextStep || !showActions) && (
        <View className={styles.footerRow}>
          <Text className={styles.footerInfo}>
            下单：{dayjs(order.createdAt).format('HH:mm')}
          </Text>
          <Text className={styles.amount}>¥{order.totalAmount.toFixed(1)}</Text>
        </View>
      )}
    </View>
  );
};

export default OrderItem;
