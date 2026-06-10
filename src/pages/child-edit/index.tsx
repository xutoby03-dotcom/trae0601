import React, { useState, useEffect } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { usePickupStore } from '@/store/usePickupStore';
import classnames from 'classnames';

const ChildEditPage: React.FC = () => {
  const router = useRouter();
  const { schools, familyMembers, getChildById, addChild, updateChild } = usePickupStore();

  const childId = router.params?.id;
  const isEdit = !!childId;

  const [form, setForm] = useState({
    name: '',
    gender: 'boy' as 'boy' | 'girl',
    schoolId: '',
    fixedPickupId: '',
    backupContactIds: [] as string[],
  });

  useEffect(() => {
    if (childId) {
      const child = getChildById(childId);
      if (child) {
        setForm({
          name: child.name,
          gender: child.gender || 'boy',
          schoolId: child.schoolId,
          fixedPickupId: child.fixedPickupId,
          backupContactIds: child.backupContactIds,
        });
      }
    }
  }, [childId]);

  const handleSave = () => {
    if (!form.name.trim()) {
      Taro.showToast({ title: '请输入孩子姓名', icon: 'none' });
      return;
    }
    if (!form.schoolId) {
      Taro.showToast({ title: '请选择学校', icon: 'none' });
      return;
    }
    if (!form.fixedPickupId) {
      Taro.showToast({ title: '请选择固定接送人', icon: 'none' });
      return;
    }

    if (isEdit && childId) {
      updateChild({
        id: childId,
        ...form,
      });
    } else {
      addChild(form);
    }

    Taro.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1000);
  };

  const toggleBackup = (memberId: string) => {
    setForm((prev) => ({
      ...prev,
      backupContactIds: prev.backupContactIds.includes(memberId)
        ? prev.backupContactIds.filter((id) => id !== memberId)
        : [...prev.backupContactIds, memberId],
    }));
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.form}>
        <View className={styles.formItem}>
          <Text className={styles.label}>孩子姓名</Text>
          <Input
            className={styles.input}
            placeholder="请输入孩子姓名"
            value={form.name}
            onInput={(e) => setForm({ ...form, name: e.detail.value })}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>性别</Text>
          <View className={styles.genderOptions}>
            <View
              className={classnames(styles.genderOption, {
                [styles.active]: form.gender === 'boy',
              })}
              onClick={() => setForm({ ...form, gender: 'boy' })}
            >
              <Text className={styles.genderEmoji}>👦</Text>
              <Text className={styles.genderText}>男孩</Text>
            </View>
            <View
              className={classnames(styles.genderOption, {
                [styles.active]: form.gender === 'girl',
              })}
              onClick={() => setForm({ ...form, gender: 'girl' })}
            >
              <Text className={styles.genderEmoji}>👧</Text>
              <Text className={styles.genderText}>女孩</Text>
            </View>
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>所属学校</Text>
          <View className={styles.optionList}>
            {schools.map((school) => (
              <View
                key={school.id}
                className={classnames(styles.optionItem, {
                  [styles.selected]: form.schoolId === school.id,
                })}
                onClick={() => setForm({ ...form, schoolId: school.id })}
              >
                <Text className={styles.optionName}>{school.name}</Text>
                {form.schoolId === school.id && (
                  <Text className={styles.checkIcon}>✓</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>固定接送人</Text>
          <View className={styles.memberGrid}>
            {familyMembers.map((member) => (
              <View
                key={member.id}
                className={classnames(styles.memberOption, {
                  [styles.selected]: form.fixedPickupId === member.id,
                })}
                onClick={() => setForm({ ...form, fixedPickupId: member.id })}
              >
                <View
                  className={styles.memberAvatar}
                  style={{ backgroundColor: member.color }}
                >
                  <Text className={styles.memberInitial}>{member.name.charAt(0)}</Text>
                </View>
                <Text className={styles.memberName}>{member.name}</Text>
                <Text className={styles.memberRole}>{member.role}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>备用联系人</Text>
          <Text className={styles.hint}>可多选，紧急情况联系不上固定接送人时会通知</Text>
          <View className={styles.memberGrid}>
            {familyMembers.map((member) => (
              <View
                key={member.id}
                className={classnames(styles.memberOption, {
                  [styles.selected]: form.backupContactIds.includes(member.id),
                })}
                onClick={() => toggleBackup(member.id)}
              >
                <View
                  className={styles.memberAvatar}
                  style={{ backgroundColor: member.color }}
                >
                  <Text className={styles.memberInitial}>{member.name.charAt(0)}</Text>
                </View>
                <Text className={styles.memberName}>{member.name}</Text>
                <Text className={styles.memberRole}>{member.role}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.footer}>
        <View className={styles.saveBtn} onClick={handleSave}>
          <Text className={styles.saveBtnText}>{isEdit ? '保存修改' : '添加孩子'}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ChildEditPage;
