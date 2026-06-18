import { BookOpen, AlertTriangle } from 'lucide-react';
import type { Book } from '../types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: 'books' | 'borrowed' | 'overdue' | 'damaged' | 'families';
  gradient: string;
  delay?: number;
}

export default function StatCard({ title, value, icon, gradient, delay = 0 }: StatCardProps) {
  const iconMap: Record<string, string> = {
    books: '📚',
    borrowed: '📖',
    overdue: '⚠️',
    damaged: '🔧',
    families: '👨‍👩‍👧',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 animate-slide-up`}
      style={{ background: gradient, animationDelay: `${delay}ms` }}
    >
      <div className="absolute -right-4 -top-4 text-8xl opacity-15">
        {iconMap[icon]}
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
          <span className="text-xl">{iconMap[icon]}</span>
          {title}
        </div>
        <div className="text-4xl font-bold font-display tracking-wide">
          {value}
        </div>
      </div>
    </div>
  );
}

interface BookCardProps {
  book: Book;
  onClick?: () => void;
}

export function BookCard({ book, onClick }: BookCardProps) {
  const statusConfig = {
    available: { label: '可借', className: 'tag-mint' },
    borrowed: { label: '借出中', className: 'tag-orange' },
    damaged: { label: '待维修', className: 'tag-coral' },
  } as const;

  const status = statusConfig[book.status];

  return (
    <div
      onClick={onClick}
      className="card group cursor-pointer hover:shadow-hover hover:-translate-y-1 transition-all duration-300 animate-fade-in"
    >
      <div className="aspect-square overflow-hidden bg-cream-100 relative">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 right-3">
          <span className={status.className}>{status.label}</span>
        </div>
        {book.hasMechanism && (
          <div className="absolute top-3 left-3">
            <span className="tag-orange">🎲 机关书</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-lg mb-2 truncate">{book.title}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <BookOpen className="w-4 h-4" />
          <span>{book.pages}页</span>
          <span>·</span>
          <span>{book.ageRange}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {book.themes.slice(0, 3).map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
        {book.damageLocation && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-coral-500">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="truncate">{book.damageLocation}</span>
          </div>
        )}
      </div>
    </div>
  );
}
