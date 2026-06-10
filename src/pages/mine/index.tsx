import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { usePickupStore } from '@/store/usePickupStore';
import Avatar from '@/components/Avatar';
import SectionHeader from '@/components/SectionHeader';

const MinePage: React.FC = () => {
  const { currentUserId, getMemberById, children, schools, familyMembers } = usePickupStore();
  const currentUser = getMemberById(currentUserId);

  const handleEditChild = (childId?: string) => {
    const url = childId
      ? `/pages/child-edit/index?id=${childId}`
      : '/pages/child-edit/index';
    Taro.navigateTo({ url });
  };

  const handleEditSchool = (schoolId?: string) => {
    const url = schoolId
      ? `/pages/school-edit/index?id=${schoolId}`
      : '/pages/school-edit/index';
    Taro.navigateTo({ url });
  };

  const myStats = {
    totalPickups: 12,
    onTimeRate: 92,
    lateCount: 1,
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          {currentUser && (
            <Avatar name={currentUser.name} color={currentUser.color} size="lg" />
          )}
          <View className={styles.userText}>
            <Text className={styles.userName}>{currentUser?.name}</Text>
            <Text className={styles.userRole}>{currentUser?.role}</Text>
          </View>
        </View>

        <View className={styles.myStats}>
          <View className={styles.myStatItem}>
            <Text className={styles.myStatNum}>{myStats.totalPickups}</Text>
            <Text className={styles.myStatLabel}>接送次数</Text>
          </View>
          <View className={styles.myStatItem}>
            <Text className={styles.myStatNum}>{myStats.onTimeRate}%</Text>
            <Text className={styles.myStatLabel}>准时率</Text>
          </View>
          <View className={styles.myStatItem}>
            <Text className={styles.myStatNum}>{myStats.lateCount}</Text>
            <Text className={styles.myStatLabel}>迟到次数</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.section}>
          <SectionHeader title="孩子管理" extra={
            <Text className={styles.addLink} onClick={() => handleEditChild()}>+ 添加</Text>
          } />
          <View className={styles.childList}>
            {children.map((child) => {
              const school = schools.find((s) => s.id === child.schoolId);
              const fixedMember = familyMembers.find((m) => m.id === child.fixedPickupId);
              return (
                <View
                  key={child.id}
                  className={styles.childCard}
                  onClick={() => handleEditChild(child.id)}
                >
                  <View className={styles.childAvatar}>
                    <Text className={styles.childEmoji}>
                      {child.gender === 'girl' ? '👧' : '👦'}
                    </Text>
                  </View>
                  <View className={styles.childInfo}>
                    <Text className={styles.childName}>{child.name}</Text>
                    <Text className={styles.childSchool}>
                      {school?.name} · {school?.className}
                    </Text>
                    <Text className={styles.childFixed}>
                      固定接送：{fixedMember?.name}（{fixedMember?.role}）
                    </Text>
                  </View>
                  <Text className={styles.arrow}>›</Text>
                </View>
              );
            })}
            {children.length === 0 && (
              <View className={styles.emptyCard} onClick={() => handleEditChild()}>
                <Text className={styles.emptyText}>还没有添加孩子，点击添加</Text>
              </View>
            )}
          </View>
        </View>

        <View className={styles.section}>
          <SectionHeader title="学校管理" extra={
            <Text className={styles.addLink} onClick={() => handleEditSchool()}>+ 添加</Text>
          } />
          <View className={styles.schoolList}>
            {schools.map((school) => (
              <View
                key={school.id}
                className={styles.schoolCard}
                onClick={() => handleEditSchool(school.id)}
              >
                <View className={styles.schoolIcon}>
                  <Text className={styles.schoolEmoji}>🏫</Text>
                </View>
                <View className={styles.schoolInfo}>
                  <Text className={styles.schoolName}>{school.name}</Text>
                  <Text className={styles.schoolDetail}>{school.address}</Text>
                  <Text className={styles.schoolTime}>放学时间：{school.dismissTime}</Text>
                </View>
                <Text className={styles.arrow}>›</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <SectionHeader title="家庭成员" subtitle={`${familyMembers.length}人`} />
          <View className={styles.memberGrid}>
            {familyMembers.map((member) => (
              <View key={member.id} className={styles.memberItem}>
                <Avatar name={member.name} color={member.color} size="md" />
                <Text className={styles.memberName}>{member.name}</Text>
                <Text className={styles.memberRole}>{member.role}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.menuList}>
            <View className={styles.menuItem}>
              <Text className={styles.menuIcon}>⚙️</Text>
              <Text className={styles.menuText}>设置</Text>
              <Text className={styles.arrow}>›</Text>
            </View>
            <View className={styles.menuItem}>
              <Text className={styles.menuIcon}>💬</Text>
              <Text className={styles.menuText}>意见反馈</Text>
              <Text className={styles.arrow}>›</Text>
            </View>
            <View className={styles.menuItem}>
              <Text className={styles.menuIcon}>ℹ️</Text>
              <Text className={styles.menuText}>关于我们</Text>
              <Text className={styles.arrow}>›</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default MinePage;
