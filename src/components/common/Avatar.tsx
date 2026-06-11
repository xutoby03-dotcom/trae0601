interface AvatarProps {
  name: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Avatar({ name, color, size = 'md' }: AvatarProps) {
  const sizeMap = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  return (
    <div
      className={`${sizeMap[size]} rounded-full flex items-center justify-center text-white font-semibold shadow-softer`}
      style={{ backgroundColor: color }}
      title={name}
    >
      {name.charAt(0)}
    </div>
  );
}
