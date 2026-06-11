import React from 'react';
import { getInitials, getAvatarColor } from '../utils/helpers';

interface AvatarProps {
  name: string;
  avatar?: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ name, avatar, size = 40 }) => {
  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    backgroundColor: getAvatarColor(name),
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size * 0.4,
    fontWeight: 600,
    flexShrink: 0
  };

  if (avatar) {
    return <img src={avatar} alt={name} style={{ ...style, objectFit: 'cover' }} />;
  }

  return <div style={style}>{getInitials(name)}</div>;
};
