import React, { useState, useMemo } from 'react';
import { View, Text, Image, Button, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { useFoodStore } from '@/store/foodStore';
import { ProcessType, PROCESS_LABELS } from '@/types/food';
import { getRemainingDays, formatDateCN, isExpired, isExpiringSoon } from '@/utils/date';
import StatusBadge from '@/components/StatusBadge';
import styles from './index.module.scss';

const DetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id as string;
  const getFoodById = useFoodStore(state => state.getFoodById);
  const processFood = useFoodStore(state => state.processFood);

  const food = useMemo(() => getFoodById(id), [id, getFoodById]);

  const [showModal, setShowModal] = useState(false);
  const [processType, setProcessType] = useState<ProcessType | null>(null);
  const [reason, setReason] = useState('');

  if (!food) {
    return (
      <View className={styles.container}>
        <View style={{ padding: 100, textAlign: 'center' }}>
          <Text>找不到该记录</Text>
        </View>
      </View>
    );
  }

  const remainingDays = getRemainingDays(food.cookDate, food.expectedDays);
  const expired = isExpired(food.cookDate, food.expectedDays);
  const expiring = isExpiringSoon(food.cookDate, food.expectedDays);
  const isProcessed = !!food.processInfo;

  const getDaysClass = () => {
    if (remainingDays < 0) return styles.danger;
    if (remainingDays <= 1) return styles.warning;
    return styles.normal;
  };

  const handleProcess = (type: ProcessType) => {
    setProcessType(type);
    setReason('');
    setShowModal(true);
  };

  const handleConfirm = () => {
    if (!processType) return;
    if (!reason.trim()) {
      Taro.showToast({ title: '请输入原因', icon: 'none' });
      return;
    }

    try {
      processFood(id, processType, reason.trim());
      console.log('[DetailPage] Food processed:', id, processType);
      Taro.showToast({ title: '操作成功', icon: 'success' });
      setShowModal(false);
      setTimeout(() => {
        Taro.navigateBack();
      }, 1000);
    } catch (e) {
      console.error('[DetailPage] Process error:', e);
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  const getProcessIcon = (type: ProcessType) => {
    switch (type) {
      case 'eaten': return '🍽️';
      case 'discarded': return '🗑️';
      case 'transformed': return '✨';
    }
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        {food.photo ? (
          <Image className={styles.image} src={food.photo} mode="aspectFill" />
        ) : (
          <View className={styles.imagePlaceholder}>
            <Text>🍽️</Text>
          </View>
        )}
        <View className={styles.headerOverlay}>
          <Text className={styles.name}>{food.name}</Text>
          <View className={styles.statusRow}>
            <StatusBadge status={food.status} />
          </View>
        </View>
      </View>

      {!isProcessed && (expiring || expired) && (
        <View className={classnames(styles.warningBanner, expired ? styles.expired : styles.expiring)}>
          <Text className={styles.warningIcon}>
            {expired ? '⚠️' : '⏰'}
          </Text>
          <View className={styles.warningContent}>
            <Text className={styles.warningTitle}>
              {expired ? '已过期！' : '即将过期！'}
            </Text>
            <Text className={styles.warningText}>
              {expired
                ? `这份菜已经过期 ${-remainingDays} 天了，建议尽快处理掉，不要食用`
                : `这份菜还有 ${remainingDays} 天就要过期了，记得尽快吃掉哦`
              }
            </Text>
          </View>
        </View>
      )}

      <View className={styles.infoSection}>
        <Text className={styles.sectionTitle}>基本信息</Text>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>保鲜盒位置</Text>
          <Text className={styles.infoValue}>{food.location}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>做饭日期</Text>
          <Text className={styles.infoValue}>{formatDateCN(food.cookDate)}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>预计保存天数</Text>
          <Text className={styles.infoValue}>{food.expectedDays} 天</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>剩余天数</Text>
          <Text className={classnames(styles.infoValue, styles.daysValue, getDaysClass())}>
            {remainingDays > 0 ? `${remainingDays} 天` : remainingDays === 0 ? '今天到期' : `已过期 ${-remainingDays} 天`}
          </Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>适合谁吃</Text>
          <View className={styles.suitableTags}>
            {food.suitableFor.map(item => (
              <Text key={item} className={styles.suitableTag}>{item}</Text>
            ))}
          </View>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>可二次加热</Text>
          <Text className={classnames(styles.infoValue, styles.boolValue, food.canReheat ? styles.yes : styles.no)}>
            {food.canReheat ? '✓ 可以' : '✗ 不可以'}
          </Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>冷冻保存</Text>
          <Text className={classnames(styles.infoValue, styles.boolValue, food.isFrozen ? styles.yes : styles.no)}>
            {food.isFrozen ? '✓ 是' : '✗ 否'}
          </Text>
        </View>
      </View>

      {isProcessed && food.processInfo && (
        <View className={styles.processedSection}>
          <Text className={styles.sectionTitle}>处理记录</Text>
          <View className={styles.processedHeader}>
            <Text className={styles.processedIcon}>
              {getProcessIcon(food.processInfo.type)}
            </Text>
            <View>
              <Text className={styles.processedType}>
                {PROCESS_LABELS[food.processInfo.type]}
              </Text>
              <Text className={styles.processedDate}>
                {formatDateCN(food.processInfo.date)}
              </Text>
            </View>
          </View>
          <View className={styles.processedReason}>
            {food.processInfo.reason}
          </View>
        </View>
      )}

      {!isProcessed && (
        <View className={styles.actionSection}>
          <View className={styles.actionButtons}>
            <Button
              className={classnames(styles.actionButton, styles.eat)}
              onClick={() => handleProcess('eaten')}
            >
              吃掉
            </Button>
            <Button
              className={classnames(styles.actionButton, styles.discard)}
              onClick={() => handleProcess('discarded')}
            >
              倒掉
            </Button>
            <Button
              className={classnames(styles.actionButton, styles.transform)}
              onClick={() => handleProcess('transformed')}
            >
              改造
            </Button>
          </View>
        </View>
      )}

      {showModal && processType && (
        <View className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>
              记录{PROCESS_LABELS[processType]}原因
            </Text>
            <Textarea
              className={styles.modalTextarea}
              placeholder={`请输入${PROCESS_LABELS[processType]}的原因...`}
              value={reason}
              onInput={(e) => setReason(e.detail.value)}
              maxlength={100}
            />
            <View className={styles.modalButtons}>
              <Button
                className={classnames(styles.modalButton, styles.cancel)}
                onClick={() => setShowModal(false)}
              >
                取消
              </Button>
              <Button
                className={classnames(styles.modalButton, styles.confirm)}
                onClick={handleConfirm}
              >
                确定
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default DetailPage;
