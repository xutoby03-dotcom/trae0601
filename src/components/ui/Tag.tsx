import { FC } from 'react';
import { FlavorTag, FLAVOR_TAG_LABELS } from '../../types';
import { cn } from '../../lib/utils';

interface TagProps {
  tag: FlavorTag;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
}

const flavorColors: Record<FlavorTag, { bg: string; text: string; border: string }> = {
  sour: { bg: 'bg-[#FFF4E6]', text: 'text-[#E07B39]', border: 'border-[#E07B39]/30' },
  sweet: { bg: 'bg-[#FFF0F5]', text: 'text-[#D4709A]', border: 'border-[#D4709A]/30' },
  bitter: { bg: 'bg-[#EDE8E4]', text: 'text-[#6B5748]', border: 'border-[#6B5748]/30' },
  nutty: { bg: 'bg-[#F5EFE6]', text: 'text-[#8B6914]', border: 'border-[#8B6914]/30' },
  floral: { bg: 'bg-[#F0F7EA]', text: 'text-[#7BA05B]', border: 'border-[#7BA05B]/30' },
  fruity: { bg: 'bg-[#FFEFEA]', text: 'text-[#E85D4E]', border: 'border-[#E85D4E]/30' },
  chocolate: { bg: 'bg-[#EFE5DC]', text: 'text-[#6B4423]', border: 'border-[#6B4423]/30' },
  caramel: { bg: 'bg-[#FFF5E0]', text: 'text-[#C28B3B]', border: 'border-[#C28B3B]/30' },
};

const Tag: FC<TagProps> = ({ tag, selected = false, onClick, size = 'sm' }) => {
  const colors = flavorColors[tag];
  const label = FLAVOR_TAG_LABELS[tag];

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3.5 py-1 text-sm';

  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full font-medium border transition-all duration-200',
        sizeClasses,
        selected
          ? `${colors.bg} ${colors.text} ${colors.border} scale-105 shadow-sm`
          : `${colors.bg} ${colors.text} ${colors.border} ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-sm' : ''}`,
      )}
    >
      {label}
    </span>
  );
};

export default Tag;
