import { cn } from '@/lib/utils';

interface TagSelectorProps {
  tags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  className?: string;
  variant?: 'default' | 'danger' | 'success';
}

export default function TagSelector({
  tags,
  selectedTags,
  onChange,
  className,
  variant = 'default'
}: TagSelectorProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter(t => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const variantStyles = {
    default: {
      selected: 'bg-purple-500/20 border-purple-500/50 text-purple-300',
      unselected: 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-300'
    },
    danger: {
      selected: 'bg-red-500/20 border-red-500/50 text-red-300',
      unselected: 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:border-red-900/50 hover:text-red-400/70'
    },
    success: {
      selected: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
      unselected: 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:border-emerald-900/50 hover:text-emerald-400/70'
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200',
              isSelected ? variantStyles[variant].selected : variantStyles[variant].unselected
            )}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
