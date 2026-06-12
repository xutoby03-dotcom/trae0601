import { useState, useMemo } from "react";
import { Plus, Search, Filter } from "lucide-react";
import BookCard from "@/components/BookCard";
import Modal from "@/components/Modal";
import BookForm from "@/components/BookForm";
import { useBookStore } from "@/store/bookStore";
import type { BookStatus } from "@/types";
import { STATUS_LABELS, GRADE_LEVELS } from "@/types";

export default function BookList() {
  const { books, boxes } = useBookStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookStatus | "all">("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [boxFilter, setBoxFilter] = useState<string>("all");

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      if (statusFilter !== "all" && book.status !== statusFilter) return false;
      if (gradeFilter !== "all" && book.gradeLevel !== gradeFilter) return false;
      if (boxFilter !== "all" && book.boxId !== boxFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !book.title.toLowerCase().includes(q) &&
          !book.author.toLowerCase().includes(q) &&
          !book.donor.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [books, searchQuery, statusFilter, gradeFilter, boxFilter]);

  const selectClass = "px-3 py-2 bg-white border border-amber-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-gray-800">图书管理</h2>
          <p className="text-gray-500 mt-1">
            共 <span className="font-semibold text-amber-600">{books.length}</span> 本图书 · 筛选后{" "}
            <span className="font-semibold text-teal-600">{filteredBooks.length}</span> 本
          </p>
        </div>

        <button onClick={() => setIsAddModalOpen(true)} className="btn-primary flex items-center justify-center gap-2 sm:w-auto">
          <Plus className="w-4 h-4" />
          <span>新增图书</span>
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索书名、作者、捐赠人..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 hidden sm:block" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as BookStatus | "all")} className={selectClass}>
              <option value="all">全部状态</option>
              {(Object.keys(STATUS_LABELS) as BookStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className={selectClass}>
              <option value="all">全部年级</option>
              {GRADE_LEVELS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <select value={boxFilter} onChange={(e) => setBoxFilter(e.target.value)} className={selectClass}>
              <option value="all">全部箱子</option>
              {boxes.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <div className="card py-20 flex flex-col items-center justify-center text-gray-400">
          <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
            <Search className="w-10 h-10 text-amber-300" />
          </div>
          <p className="text-lg">没有找到匹配的图书</p>
          <p className="text-sm mt-1">试试调整筛选条件</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBooks.map((book, idx) => (
            <div key={book.id} style={{ animationDelay: `${idx * 30}ms` }} className="animate-slide-up">
              <BookCard book={book} />
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="新增图书" size="lg">
        <BookForm onClose={() => setIsAddModalOpen(false)} />
      </Modal>
    </div>
  );
}
