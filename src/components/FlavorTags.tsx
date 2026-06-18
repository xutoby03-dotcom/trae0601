interface FlavorTagsProps {
  tags: string[];
  onTagClick?: (tag: string) => void;
  size?: 'sm' | 'md';
  maxTags?: number;
}

export default function FlavorTags({ tags, onTagClick, size = 'sm', maxTags }: FlavorTagsProps) {
  const displayTags = maxTags ? tags.slice(0, maxTags) : tags;
  const hasMore = maxTags && tags.length > maxTags;

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {displayTags.map((tag, index) => (
        <span
          key={index}
          className={`${sizeClasses[size]} font-medium rounded-full bg-cream-100 text-coffee-700 border border-coffee-100 transition-all duration-200 ${
            onTagClick ? 'cursor-pointer hover:bg-cream-200' : ''
          }`}
          onClick={() => onTagClick?.(tag)}
        >
          {tag}
        </span>
      ))}
      {hasMore && (
        <span className={`${sizeClasses[size]} font-medium rounded-full bg-coffee-50 text-coffee-500 border border-coffee-100`}>
          +{tags.length - maxTags}
        </span>
      )}
    </div>
  );
}
