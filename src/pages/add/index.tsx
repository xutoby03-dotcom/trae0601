import React, { useState } from 'react';
import { View, Text, Input, Switch, Button, Image, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import dayjs from 'dayjs';
import { useFoodStore } from '@/store/foodStore';
import { formatDate } from '@/utils/date';
import styles from './index.module.scss';

const SUITABLE_OPTIONS = ['全家', '孩子', '老人', '成年人', '素食者'];
const FOOD_IMAGE_IDS = [292, 312, 326, 401, 431, 570, 580, 625, 835, 1080];

const AddPage: React.FC = () => {
  const addFood = useFoodStore(state => state.addFood);

  const [name, setName] = useState('');
  const [cookDate, setCookDate] = useState(formatDate(new Date()));
  const [location, setLocation] = useState('');
  const [expectedDays, setExpectedDays] = useState('3');
  const [suitableFor, setSuitableFor] = useState<string[]>([]);
  const [canReheat, setCanReheat] = useState(true);
  const [isFrozen, setIsFrozen] = useState(false);
  const [photo, setPhoto] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const handleDateChange = (e: any) => {
    setCookDate(e.detail.value);
  };

  const toggleSuitable = (item: string) => {
    setSuitableFor(prev => {
      if (prev.includes(item)) {
        return prev.filter(s => s !== item);
      }
      return [...prev, item];
    });
  };

  const handleChooseImage = () => {
    const randomId = FOOD_IMAGE_IDS[Math.floor(Math.random() * FOOD_IMAGE_IDS.length)];
    const imageUrl = `https://picsum.photos/id/${randomId}/300/300`;
    setPhoto(imageUrl);
    console.log('[AddPage] Selected photo:', imageUrl);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请输入菜名', icon: 'none' });
      return;
    }
    if (!location.trim()) {
      Taro.showToast({ title: '请输入保鲜盒位置', icon: 'none' });
      return;
    }
    const days = parseInt(expectedDays);
    if (isNaN(days) || days < 1) {
      Taro.showToast({ title: '请输入有效的保存天数', icon: 'none' });
      return;
    }
    if (suitableFor.length === 0) {
      Taro.showToast({ title: '请选择适合人群', icon: 'none' });
      return;
    }

    setSubmitting(true);
    try {
      addFood({
        name: name.trim(),
        cookDate,
        location: location.trim(),
        expectedDays: days,
        suitableFor,
        canReheat,
        isFrozen,
        photo
      });
      console.log('[AddPage] Food added successfully');
      Taro.showToast({ title: '添加成功', icon: 'success' });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1000);
    } catch (e) {
      console.error('[AddPage] Add food error:', e);
      Taro.showToast({ title: '添加失败', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className={styles.container}>
      <View className={styles.form}>
        <View className={styles.formItem}>
          <Text className={styles.label}>
            菜名<Text className={styles.required}>*</Text>
          </Text>
          <Input
            className={styles.input}
            placeholder="请输入菜名"
            value={name}
            onInput={(e) => setName(e.detail.value)}
            maxlength={20}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>
            做饭日期<Text className={styles.required}>*</Text>
          </Text>
          <Picker
            mode="date"
            value={cookDate}
            onChange={handleDateChange}
            end={formatDate(new Date())}
          >
            <View className={styles.inputWrapper}>
              <Text className={styles.inputValue}>{cookDate}</Text>
              <Text className={styles.arrow}>▾</Text>
            </View>
          </Picker>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>
            保鲜盒位置<Text className={styles.required}>*</Text>
          </Text>
          <Input
            className={styles.input}
            placeholder="如：冷藏上层左1"
            value={location}
            onInput={(e) => setLocation(e.detail.value)}
            maxlength={30}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>
            预计保存天数<Text className={styles.required}>*</Text>
          </Text>
          <Input
            className={styles.input}
            type="number"
            placeholder="请输入天数"
            value={expectedDays}
            onInput={(e) => setExpectedDays(e.detail.value)}
            maxlength={2}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>
            适合谁吃<Text className={styles.required}>*</Text>
          </Text>
          <View className={styles.tagGroup}>
            {SUITABLE_OPTIONS.map(option => (
              <Text
                key={option}
                className={classnames(styles.tag, suitableFor.includes(option) && styles.active)}
                onClick={() => toggleSuitable(option)}
              >
                {option}
              </Text>
            ))}
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>其他设置</Text>
          <View className={styles.switchRow}>
            <Text className={styles.switchLabel}>是否可二次加热</Text>
            <Switch
              className={styles.switch}
              checked={canReheat}
              onChange={(e) => setCanReheat(e.detail.value)}
              color="#FF7A45"
            />
          </View>
          <View className={styles.switchRow}>
            <Text className={styles.switchLabel}>是否冷冻保存</Text>
            <Switch
              className={styles.switch}
              checked={isFrozen}
              onChange={(e) => setIsFrozen(e.detail.value)}
              color="#FF7A45"
            />
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>照片（可选）</Text>
          <View className={styles.photoSection}>
            <View className={styles.photoPreview}>
              {photo ? (
                <Image className={styles.image} src={photo} mode="aspectFill" />
              ) : (
                <Text className={styles.photoPlaceholder}>📸</Text>
              )}
            </View>
            <Button className={styles.photoButton} onClick={handleChooseImage}>
              {photo ? '重新选择' : '添加照片'}
            </Button>
          </View>
        </View>
      </View>

      <View className={styles.footer}>
        <Button
          className={styles.submitButton}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? '保存中...' : '保存'}
        </Button>
      </View>
    </View>
  );
};

export default AddPage;
