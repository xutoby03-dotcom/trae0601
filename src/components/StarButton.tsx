import { memo } from 'react';
import { Star } from 'lucide-react';

interface StarButtonProps {
  starred: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const StarButton = memo(function StarButton({ starred, onToggle, size = 'md' }: StarButtonProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="p-1.5 rounded-full transition-all duration-200 hover:bg-studio-hover group"
      title={starred ? '取消收藏' : '添加收藏'}
    >
      <Star
        className={`${sizes[size]} transition-all duration-200 ${
          starred
            ? 'text-accent-amber fill-accent-amber drop-shadow-[0_0_8px_rgba(245,165,36,0.5)]'
            : 'text-studio-textDim group-hover:text-accent-amber/70'
        }`}
      />
    </button>
  );
});
