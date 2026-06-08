import React, { useState } from 'react';
import { View, Text, Input, Textarea, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { PackageSize } from '@/types/pickup';
import { usePickupStore } from '@/store/pickupStore';
import styles from './index.module.scss';

const lockerOptions = ['丰巢快递柜', '速递易', '菜鸟驿站', '丰巢快递柜A区', '丰巢快递柜B区', '丰巢快递柜C区'];
const sizeOptions: { key: PackageSize; label: string; icon: string }[] = [
  { key: 'small', label: '小件', icon: '📦' },
  { key: 'medium', label: '中件', icon: '📦' },
  { key: 'large', label: '重件', icon: '🏋️' },
];
const rewardOptions = [3, 5, 8, 10, 15];

const PublishPage: React.FC = () => {
  const { publishRequest } = usePickupStore();

  const [lockerIndex, setLockerIndex] = useState(0);
  const [lockerName, setLockerName] = useState('');
  const [pickupCode, setPickupCode] = useState('');
  const [isCodeEncrypted, setIsCodeEncrypted] = useState(true);
  const [packageSize, setPackageSize] = useState<PackageSize>('small');
  const [isFragile, setIsFragile] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [reward, setReward] = useState(5);
  const [customReward, setCustomReward] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!pickupCode.trim()) {
      Taro.showToast({ title: '请输入取件码', icon: 'none' });
      return;
    }
    if (!deliveryLocation.trim()) {
      Taro.showToast({ title: '请输入送达位置', icon: 'none' });
      return;
    }
    if (!deadlineDate || !deadlineTime) {
      Taro.showToast({ title: '请选择最晚取件时间', icon: 'none' });
      return;
    }

    const finalReward = customReward ? parseFloat(customReward) : reward;
    if (isNaN(finalReward) || finalReward <= 0) {
      Taro.showToast({ title: '请输入有效红包金额', icon: 'none' });
      return;
    }

    publishRequest({
      lockerLocation: lockerOptions[lockerIndex],
      lockerName: lockerName || '未指定',
      pickupCode: pickupCode.trim(),
      isCodeEncrypted,
      packageSize,
      isFragile,
      deadline: `${deadlineDate} ${deadlineTime}`,
      deliveryLocation: deliveryLocation.trim(),
      reward: finalReward,
      description: description.trim() || undefined,
    });

    Taro.showToast({ title: '发布成功！', icon: 'success' });
    setTimeout(() => {
      Taro.switchTab({ url: '/pages/home/index' });
    }, 1500);
  };

  const onLockerChange = (e) => {
    setLockerIndex(Number(e.detail.value));
  };

  return (
    <View className={styles.container}>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📍</Text>快递柜信息
        </Text>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            快递柜位置<Text className={styles.required}>*</Text>
          </Text>
          <Picker mode="selector" range={lockerOptions} value={lockerIndex} onChange={onLockerChange}>
            <View className={styles.formInput}>
              <Text className={styles.dateText}>{lockerOptions[lockerIndex]}</Text>
            </View>
          </Picker>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>柜号/货架号</Text>
          <Input
            className={styles.formInput}
            placeholder="如 B区-12号柜"
            value={lockerName}
            onInput={(e) => setLockerName(e.detail.value)}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            取件码<Text className={styles.required}>*</Text>
          </Text>
          <Input
            className={styles.formInput}
            placeholder="输入取件码"
            value={pickupCode}
            onInput={(e) => setPickupCode(e.detail.value)}
          />
        </View>

        <View className={styles.formGroup}>
          <View className={styles.toggleRow}>
            <Text className={styles.toggleLabel}>🔒 加密取件码（接单后可见）</Text>
            <View
              className={classnames(styles.toggleSwitch, isCodeEncrypted && styles.toggleSwitchActive)}
              onClick={() => setIsCodeEncrypted(!isCodeEncrypted)}
            >
              <View className={classnames(styles.toggleDot, isCodeEncrypted && styles.toggleDotActive)} />
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📦</Text>包裹信息
        </Text>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>包裹大小</Text>
          <View className={styles.selectGroup}>
            {sizeOptions.map((opt) => (
              <View
                key={opt.key}
                className={classnames(styles.selectItem, packageSize === opt.key && styles.selectItemActive)}
                onClick={() => setPackageSize(opt.key)}
              >
                <Text
                  className={classnames(styles.selectText, packageSize === opt.key && styles.selectTextActive)}
                >
                  {opt.icon} {opt.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formGroup}>
          <View className={styles.toggleRow}>
            <Text className={styles.toggleLabel}>⚠️ 易碎物品</Text>
            <View
              className={classnames(styles.toggleSwitch, isFragile && styles.toggleSwitchActive)}
              onClick={() => setIsFragile(!isFragile)}
            >
              <View className={classnames(styles.toggleDot, isFragile && styles.toggleDotActive)} />
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>⏰</Text>时间与位置
        </Text>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            最晚取件时间<Text className={styles.required}>*</Text>
          </Text>
          <View className={styles.dateTimeRow}>
            <Picker mode="date" value={deadlineDate} onChange={(e) => setDeadlineDate(e.detail.value)}>
              <View className={styles.dateInput}>
                <Text className={deadlineDate ? styles.dateText : styles.datePlaceholder}>
                  {deadlineDate || '选择日期'}
                </Text>
              </View>
            </Picker>
            <Picker mode="time" value={deadlineTime} onChange={(e) => setDeadlineTime(e.detail.value)}>
              <View className={styles.dateInput}>
                <Text className={deadlineTime ? styles.dateText : styles.datePlaceholder}>
                  {deadlineTime || '选择时间'}
                </Text>
              </View>
            </Picker>
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            送到哪里<Text className={styles.required}>*</Text>
          </Text>
          <Input
            className={styles.formInput}
            placeholder="如 3栋2单元301门口鞋柜旁"
            value={deliveryLocation}
            onInput={(e) => setDeliveryLocation(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>🧧</Text>感谢红包
        </Text>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>选择红包金额</Text>
          <View className={styles.rewardGroup}>
            {rewardOptions.map((amount) => (
              <View
                key={amount}
                className={classnames(
                  styles.rewardItem,
                  !customReward && reward === amount && styles.rewardItemActive
                )}
                onClick={() => {
                  setReward(amount);
                  setCustomReward('');
                }}
              >
                <Text
                  className={classnames(
                    styles.rewardText,
                    !customReward && reward === amount && styles.rewardTextActive
                  )}
                >
                  ¥{amount}
                </Text>
              </View>
            ))}
          </View>
          <View className={styles.customReward}>
            <Input
              className={styles.customRewardInput}
              type="digit"
              placeholder="自定义"
              value={customReward}
              onInput={(e) => setCustomReward(e.detail.value)}
            />
            <Text className={styles.customRewardUnit}>元</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📝</Text>备注说明
        </Text>
        <View className={styles.formGroup}>
          <Textarea
            className={styles.formTextarea}
            placeholder="补充说明，如包裹特征、特别要求等..."
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
            maxlength={200}
          />
        </View>
      </View>

      <View className={styles.submitBar}>
        <View className={styles.submitBtn} onClick={handleSubmit}>
          <Text className={styles.submitText}>发布代取请求</Text>
        </View>
      </View>
    </View>
  );
};

export default PublishPage;
