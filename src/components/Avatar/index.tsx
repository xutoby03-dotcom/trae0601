import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface AvatarProps {
  name: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ name, color = '#FF7A45', size = 'md', className }) => {
  const firstChar = name ? name.charAt(0) : '?';

  return (
    <View
      className={classnames(styles.avatar, styles[size], className)}
      style={{ backgroundColor: color }}
    >
      <Text className={styles.text}>{firstChar}</Text>
    </View>
  );
};

export default Avatar;
