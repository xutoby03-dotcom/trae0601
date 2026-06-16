import { Link } from "react-router-dom";
import { X, User, BookOpen, Tag, Sparkles } from "lucide-react";
import type { Cabinet, Book } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import StatusBadge from "@/components/StatusBadge";
import { gradeColor, getInCabinetBooks, getAvailableSlots } from "@/utils/helpers";

interface CabinetDrawerProps {
  cabinet: Cabinet | null;
  onClose: () => void;
}

export default function CabinetDrawer({ cabinet, onClose }: CabinetDrawerProps) {
  const allBooks = useAppStore((state) => state.books);

  if (!cabinet) return null;

  const booksInCabinet = getInCabinetBooks(allBooks, cabinet.id);
  const borrowedInCabinet = allBooks.filter(
    (b) => b.cabinetId === cabinet.id && b.status === "borrowed"
  );
  const displayedBooks = [...booksInCabinet, ...borrowedInCabinet];
  const occupiedCount = booksInCabinet.length;
  const remaining = getAvailableSlots(allBooks, cabinet.id, cabinet.capacity);

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-cream-50 shadow-2xl animate-slide-in-right flex flex-col h-full">
        <div className="sticky top-0 bg-gradient-to-r from-forest-500 to-forest-600 text-white px-5 py-4 z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold">{cabinet.name}</h2>
              <p className="text-forest-100 text-sm mt-0.5">{cabinet.location}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              占位 {occupiedCount} / {cabinet.capacity}
            </span>
            <span>
              空位 {remaining}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4">
          {displayedBooks.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-gray-500">这个柜格还是空的</p>
              <p className="text-sm text-gray-400 mt-1">期待有同学来捐书哦～</p>
            </div>
          ) : (
            displayedBooks.map((book: Book) => (
              <div
                key={book.id}
                className="bg-white rounded-xl p-4 shadow-book hover:shadow-book-hover transition-shadow"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden shadow-sm">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-serif font-bold text-gray-900 leading-tight line-clamp-1">
                        {book.title}
                      </h3>
                      <StatusBadge status={book.status} />
                    </div>
                    <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {book.author}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${gradeColor(
                          book.suitableGrade
                        )}`}
                      >
                        {book.suitableGrade}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-cream-200 text-gray-700 border border-cream-300 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {book.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      捐赠者：{book.donorClass} · {book.donorName}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      已被借阅 {book.borrowCount} 次
                    </p>
                  </div>
                </div>
                {book.status === "available" && (
                  <Link
                    to={`/borrow/${book.id}`}
                    onClick={onClose}
                    className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold hover:from-primary-600 hover:to-primary-700 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    📖 借走这本书
                  </Link>
                )}
                {book.status === "borrowed" && (
                  <div className="mt-3 w-full py-2.5 rounded-xl bg-gray-100 text-gray-500 text-sm text-center">
                    已被其他同学借走啦～
                  </div>
                )}
                {book.status === "damaged" && (
                  <div className="mt-3 w-full py-2.5 rounded-xl bg-red-50 text-red-600 text-sm text-center">
                    书籍破损，等待修复
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
