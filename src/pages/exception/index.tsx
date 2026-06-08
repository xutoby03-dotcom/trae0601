import React, { useState } from 'react';
import { View, Text, Textarea, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import type { ExceptionType } from '@/types/pickup';
import { usePickupStore } from '@/store/pickupStore';
import styles from './index.module.scss';

const exceptionTypes: { key: ExceptionType; icon: string; label: string; desc: string }[] = [
  {
    key: 'code_invalid',
    icon: '🔑',
    label: '取件码失效',
    desc: '输入取件码后提示已失效或已过期',
  },
  {
    key: 'door_stuck',
    icon: '🚪',
    label: '柜门打不开',
    desc: '取件码正确但柜门无法打开',
  },
  {
    key: 'package_damaged',
    icon: '💔',
    label: '包裹破损',
    desc: '取出后发现包裹有明显破损',
  },
  {
    key: 'other',
    icon: '❓',
    label: '其他异常',
    desc: '其他无法归类的问题',
  },
];

const ExceptionPage: React.FC = () => {
  const router = useRouter();
  const { reportException } = usePickupStore();
  const requestId = router.params.id || '';

  const [selectedType, setSelectedType] = useState<ExceptionType | ''>('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!selectedType) {
      Taro.showToast({ title: '请选择异常类型', icon: 'none' });
      return;
    }
    if (!description.trim()) {
      Taro.showToast({ title: '请描述异常情况', icon: 'none' });
      return;
    }

    reportException(requestId, selectedType, description.trim());
    Taro.showToast({ title: '已上报异常', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  return (
    <View className={styles.container}>
      <ScrollView scrollY style={{ height: '100vh' }}>
        <View className={styles.header}>
          <Text className={styles.headerIcon}>⚠️</Text>
          <View>
            <Text className={styles.headerTitle}>遇到问题了？</Text>
            <Text className={styles.headerDesc}>选择异常类型，我们会通知发布人处理</Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>异常类型</Text>
          <View className={styles.typeList}>
            {exceptionTypes.map((type) => (
              <View
                key={type.key}
                className={classnames(styles.typeItem, selectedType === type.key && styles.typeItemActive)}
                onClick={() => setSelectedType(type.key)}
              >
                <Text className={styles.typeIcon}>{type.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text
                    className={classnames(styles.typeLabel, selectedType === type.key && styles.typeLabelActive)}
                  >
                    {type.label}
                  </Text>
                  <Text style={{ fontSize: '22rpx', color: '#86909C', marginTop: '2rpx' }}>{type.desc}</Text>
                </View>
                {selectedType === type.key && <Text className={styles.typeCheck}>✓</Text>}
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>详细描述</Text>
          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>请描述遇到的具体问题</Text>
            <Textarea
              className={styles.formTextarea}
              placeholder="例如：输入取件码638291后，屏幕提示"取件码不存在或已过期"，可能是快递被提前取走了..."
              value={description}
              onInput={(e) => setDescription(e.detail.value)}
              maxlength={500}
            />
          </View>

          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>上传照片（可选）</Text>
            <View className={styles.photoUpload}>
              <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Text className={styles.photoUploadIcon}>📷</Text>
                <Text className={styles.photoUploadText}>点击拍照</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.submitBtn} onClick={handleSubmit}>
          <Text className={styles.submitText}>提交异常上报</Text>
        </View>
      </View>
    </View>
  );
};

export default ExceptionPage;
