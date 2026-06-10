import React, { useState, useEffect } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { usePickupStore } from '@/store/usePickupStore';

const SchoolEditPage: React.FC = () => {
  const router = useRouter();
  const { schools, getSchoolById, addSchool, updateSchool } = usePickupStore();

  const schoolId = router.params?.id;
  const isEdit = !!schoolId;

  const [form, setForm] = useState({
    name: '',
    address: '',
    dismissTime: '16:30',
    teacherName: '',
    teacherPhone: '',
    grade: '',
    className: '',
  });

  useEffect(() => {
    if (schoolId) {
      const school = getSchoolById(schoolId);
      if (school) {
        setForm({
          name: school.name,
          address: school.address,
          dismissTime: school.dismissTime,
          teacherName: school.teacherName,
          teacherPhone: school.teacherPhone,
          grade: school.grade || '',
          className: school.className || '',
        });
      }
    }
  }, [schoolId]);

  const handleSave = () => {
    if (!form.name.trim()) {
      Taro.showToast({ title: '请输入学校名称', icon: 'none' });
      return;
    }
    if (!form.dismissTime.trim()) {
      Taro.showToast({ title: '请输入放学时间', icon: 'none' });
      return;
    }

    if (isEdit && schoolId) {
      updateSchool({
        id: schoolId,
        ...form,
      });
    } else {
      addSchool(form);
    }

    Taro.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1000);
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.form}>
        <View className={styles.formItem}>
          <Text className={styles.label}>学校名称</Text>
          <Input
            className={styles.input}
            placeholder="请输入学校名称"
            value={form.name}
            onInput={(e) => setForm({ ...form, name: e.detail.value })}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>学校地址</Text>
          <Input
            className={styles.input}
            placeholder="请输入学校地址"
            value={form.address}
            onInput={(e) => setForm({ ...form, address: e.detail.value })}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>年级</Text>
          <Input
            className={styles.input}
            placeholder="如：大班、二年级"
            value={form.grade}
            onInput={(e) => setForm({ ...form, grade: e.detail.value })}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>班级</Text>
          <Input
            className={styles.input}
            placeholder="如：向日葵班、3班"
            value={form.className}
            onInput={(e) => setForm({ ...form, className: e.detail.value })}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>放学时间</Text>
          <Input
            className={styles.input}
            placeholder="请输入放学时间，如：16:30"
            value={form.dismissTime}
            onInput={(e) => setForm({ ...form, dismissTime: e.detail.value })}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>老师姓名</Text>
          <Input
            className={styles.input}
            placeholder="请输入老师姓名"
            value={form.teacherName}
            onInput={(e) => setForm({ ...form, teacherName: e.detail.value })}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>老师电话</Text>
          <Input
            className={styles.input}
            type="number"
            placeholder="请输入老师联系电话"
            value={form.teacherPhone}
            onInput={(e) => setForm({ ...form, teacherPhone: e.detail.value })}
          />
        </View>
      </View>

      <View className={styles.footer}>
        <View className={styles.saveBtn} onClick={handleSave}>
          <Text className={styles.saveBtnText}>{isEdit ? '保存修改' : '添加学校'}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default SchoolEditPage;
