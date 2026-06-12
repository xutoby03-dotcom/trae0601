import { Link } from "react-router-dom";
import { Book, User, MapPin } from "lucide-react";
import type { Book as BookType } from "@/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/types";
import { useBookStore } from "@/store/bookStore";

interface BookCardProps {
  book: BookType;
  onClick?: () => void;
}

export default function BookCard({ book, onClick }: BookCardProps) {
  const { boxes } = useBookStore();
  const box = boxes.find((b) => b.id === book.boxId);
  const colors = STATUS_COLORS[book.status];

  return (
    <Link
      to={`/books/${book.id}`}
      onClick={onClick}
      className="group card p-3 flex gap-3 cursor-pointer animate-fade-in hover:-translate-y-1"
    >
      <div className="relative w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden shadow-md bg-amber-100">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Book className="w-8 h-8 text-amber-400" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-800 truncate text-sm group-hover:text-amber-600 transition-colors">
            {book.title}
          </h3>
          <span className={`badge ${colors.bg} ${colors.text} flex-shrink-0`}>
            {STATUS_LABELS[book.status]}
          </span>
        </div>

        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          <User className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{book.author}</span>
        </div>

        <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{box?.name || "未知箱子"}</span>
        </div>

        <div className="mt-auto pt-2">
          <span className="badge bg-amber-50 text-amber-600 border border-amber-100">
            {book.gradeLevel}
          </span>
        </div>
      </div>
    </Link>
  );
}
