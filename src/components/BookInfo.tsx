import { BookOpen } from 'lucide-react';
import type { Book } from '@/types';
import { cn } from '@/lib/utils';

interface BookInfoProps {
  book: Book;
  className?: string;
}

export default function BookInfo({ book, className }: BookInfoProps) {
  return (
    <div
      className={cn(
        'bg-parchment-200 border-b-2 border-ink-700/20 shadow-scroll',
        'p-6 rounded-t-lg',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-parchment-100 rounded-lg border border-parchment-300">
          <BookOpen className="w-8 h-8 text-ink-700" />
        </div>
        <div className="flex-1">
          <h1 className="font-song text-3xl text-ink-900 mb-2">
            {book.name}
          </h1>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-ochre-500 text-white text-sm rounded-full">
              {book.dynasty}
            </span>
            <span className="text-ink-700 text-sm font-hei">
              编号：{book.bookNumber}
            </span>
          </div>
          {book.description && (
            <p className="text-ink-800 font-hei leading-relaxed">
              {book.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
