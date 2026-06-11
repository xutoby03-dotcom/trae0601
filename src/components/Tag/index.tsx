import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

export type TagColor =
  | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  | 'meituan' | 'eleme' | 'jddj' | 'default' | 'rain' | 'hot';

interface TagProps {
  text: string;
  color?: TagColor;
  size?: 'sm' | 'md';
  className?: string;
}

const Tag: React.FC<TagProps> = ({ text, color = 'default', size = 'sm', className }) => {
  return (
    <View className={classnames(styles.tag, styles[color], styles[size], className)}>
      <Text className={styles.tagText}>{text}</Text>
    </View>
  );
};

export default Tag;
