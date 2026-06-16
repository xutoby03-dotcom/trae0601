import { getInitials, getAvatarColor } from '../utils/format';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Avatar({ name, size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-xl',
  };

  return (
    <div
      className={`${sizeClasses[size]} ${getAvatarColor(name)} rounded-full flex items-center justify-center font-medium`}
    >
      {getInitials(name)}
    </div>
  );
}
