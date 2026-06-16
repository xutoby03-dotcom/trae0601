import { User, Layers } from "lucide-react";
import type { Cabinet, Book } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import StatusBadge from "@/components/StatusBadge";
import { gradeColor, getInCabinetBooks, getAvailableSlots } from "@/utils/helpers";

interface CabinetCardProps {
  cabinet: Cabinet;
  onClick: () => void;
}

export default function CabinetCard({ cabinet, onClick }: CabinetCardProps) {
  const allBooks = useAppStore((state) => state.books);
  const books = getInCabinetBooks(allBooks, cabinet.id);
  const availableBooks = books.filter((b) => b.status === "available");
  const usedCount = books.length;
  const remaining = getAvailableSlots(allBooks, cabinet.id, cabinet.capacity);
  const fillPercent = Math.min((usedCount / cabinet.capacity) * 100, 100);

  const displayBooks = books.slice(0, 4);

  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-2xl bg-white wood-grain border-2 border-amber-200/60 p-4 shadow-cabinet hover:shadow-book-hover hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-serif font-bold text-base text-forest-800 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-primary-600" />
            {cabinet.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{cabinet.location}</p>
        </div>
        <StatusBadge
          status={remaining > 0 ? "available" : "borrowed"}
          size="sm"
        />
      </div>

      <div className="relative h-24 mb-3 rounded-xl bg-gradient-to-b from-cream-100 to-cream-200 border border-amber-100 overflow-hidden p-2 flex items-end gap-1">
        {displayBooks.length > 0 ? (
          displayBooks.map((book: Book, i: number) => (
            <div
              key={book.id}
              className="relative flex-1 h-full rounded-sm book-spine shadow-sm hover:scale-105 transition-transform duration-200 overflow-hidden"
              style={{
                transform: `rotate(${(i - displayBooks.length / 2) * 2}deg)`,
                zIndex: displayBooks.length - i,
              }}
            >
              <img
                src={book.cover}
                alt={book.title}
                className="w-full h-full object-cover"
              />
              {book.status !== "available" && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <StatusBadge status={book.status} size="sm" />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="w-full text-center text-sm text-gray-400 py-8">
            柜格暂无图书
          </div>
        )}
        {books.length > 4 && (
          <div className="absolute right-1 top-1 bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded-md font-medium">
            +{books.length - 4}
          </div>
        )}
      </div>

      {books.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {[...new Set(books.map((b) => b.suitableGrade))].slice(0, 3).map((grade) => (
            <span
              key={grade}
              className={`text-[10px] px-1.5 py-0.5 rounded-md border font-medium ${gradeColor(
                grade
              )}`}
            >
              {grade}
            </span>
          ))}
        </div>
      )}

      <div>
        <div className="flex justify-between text-xs text-gray-600 mb-1.5">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            藏书 {usedCount}
          </span>
          <span className="font-medium">
            空位 <span className={remaining > 0 ? "text-forest-600" : "text-red-500"}>{remaining}</span> / {cabinet.capacity}
          </span>
        </div>
        <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${fillPercent}%`,
              background:
                fillPercent > 85
                  ? "linear-gradient(90deg, #ef4444, #dc2626)"
                  : fillPercent > 60
                  ? "linear-gradient(90deg, #f59e0b, #E87A3F)"
                  : "linear-gradient(90deg, #73AE86, #2D5A3D)",
            }}
          />
        </div>
        <p className="text-[11px] text-gray-500 mt-2">
          可借 <span className="text-forest-600 font-semibold">{availableBooks.length}</span> 本
        </p>
      </div>
    </button>
  );
}
