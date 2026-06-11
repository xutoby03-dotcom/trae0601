import { cn } from '@/lib/utils';
import { extractKeywords, getKeywordColor, getKeywordSize } from '@/utils/keywords';
import type { Feedback } from '@/types';

interface KeywordCloudProps {
  feedbacks: Feedback[];
  onKeywordClick?: (keyword: string) => void;
  selectedKeyword?: string;
  limit?: number;
}

export function KeywordCloud({
  feedbacks,
  onKeywordClick,
  selectedKeyword,
  limit = 15,
}: KeywordCloudProps) {
  const keywords = extractKeywords(feedbacks, limit);
  const maxCount = keywords.length > 0 ? keywords[0].count : 1;

  if (keywords.length === 0) {
    return (
      <div className="text-center py-8 text-brown-400">
        暂无足够反馈数据生成关键词
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 items-center justify-center">
      {keywords.map(({ word, count }) => (
        <button
          key={word}
          onClick={() => onKeywordClick?.(word)}
          className={cn(
            'px-3 py-1.5 rounded-full border transition-all duration-200',
            'hover:scale-105 active:scale-95',
            getKeywordColor(word, count, maxCount),
            getKeywordSize(count, maxCount),
            selectedKeyword === word && 'ring-2 ring-primary-400 ring-offset-1'
          )}
        >
          {word}
          <span className="ml-1 opacity-60 text-xs">{count}</span>
        </button>
      ))}
    </div>
  );
}
