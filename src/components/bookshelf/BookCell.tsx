import type { Book } from '@/types';
import { CATEGORY_COLORS } from '@/types';
import { useNavigate } from 'react-router-dom';
import { Gift, Clock, Sparkles, Ban } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getBookOverdueInfo } from '@/utils/bookUtils';

interface BookCellProps {
  book: Book;
  index?: number;
}

export const BookCell = ({ book, index = 0 }: BookCellProps) => {
  const navigate = useNavigate();
  const borrowRecords = useAppStore((s) => s.borrowRecords);
  const colors = CATEGORY_COLORS[book.category];
  const overdue = getBookOverdueInfo(book, borrowRecords);

  const isBorrowed = book.status === 'borrowed';
  const isGifted = book.status === 'gifted';
  const isAvailable = book.status === 'available';

  const statusBadge = () => {
    if (overdue.isOverdue) {
      return (
        <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-accent-brick text-white text-[10px] font-bold shadow-md animate-breathe">
          <Clock className="w-3 h-3" />
          逾期{overdue.overdueDays}天
        </div>
      );
    }
    if (isBorrowed) {
      return (
        <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-600 text-white text-[10px] font-bold shadow-md">
          <Clock className="w-3 h-3" />
          借出中
        </div>
      );
    }
    if (isGifted) {
      return (
        <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold shadow-md">
          <Gift className="w-3 h-3" />
          已赠出
        </div>
      );
    }
    if (book.lendType === 'gift') {
      return (
        <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-accent-orange text-white text-[10px] font-bold shadow-md">
          <Sparkles className="w-3 h-3" />
          可领取
        </div>
      );
    }
    return null;
  };

  return (
    <div
      onClick={() => navigate(`/book/${book.id}`)}
      className="group relative cursor-pointer perspective-1000 animate-book-fall"
      style={{ animationDelay: `${Math.min(index, 20) * 40}ms` }}
    >
      <div className="aspect-[3/4] relative rounded-md overflow-hidden shadow-book group-hover:shadow-book-hover transition-all duration-300 group-hover:-translate-y-1 group-hover:rotate-y-[-5deg] preserve-3d transform-gpu">
        <div className={`absolute inset-y-0 left-0 w-[14%] ${colors.spine} shadow-inner`}>
          <div className="absolute inset-y-1 left-1 w-px bg-white/15"></div>
          <div className="absolute inset-y-1 right-1 w-px bg-black/10"></div>
        </div>

        <div className="absolute inset-0 left-[14%] overflow-hidden">
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/8 transition-colors duration-300 pointer-events-none" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-2 pt-6 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
          <div className="w-[70%] ml-[30%]">
            <p className="text-white font-serif text-sm font-bold leading-tight line-clamp-2 drop-shadow-md">
              {book.title}
            </p>
            <p className="text-[10px] text-white/80 mt-0.5 truncate">
              {book.author}
            </p>
          </div>
        </div>

        {statusBadge()}

        <div className="absolute bottom-1 left-1 z-10 px-1.5 py-0.5 rounded bg-wood-900/70 text-white text-[9px] font-mono backdrop-blur-sm">
          {book.shelfId}
        </div>

        {!isAvailable && !isGifted && (
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Ban className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-0 group-hover:-translate-y-0.5">
        <span className={`inline-block badge ${colors.bg} ${colors.text}`}>
          {book.category}
        </span>
      </div>
    </div>
  );
};

export default BookCell;
