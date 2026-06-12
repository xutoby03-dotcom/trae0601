import { useEffect, useState } from "react";
import { PackageOpen, BookCheck, AlertTriangle, AlertOctagon, Plus, Search } from "lucide-react";
import BookCard from "@/components/BookCard";
import Modal from "@/components/Modal";
import BookForm from "@/components/BookForm";
import { useBookStore } from "@/store/bookStore";
import type { BookStatus } from "@/types";
import { STATUS_LABELS } from "@/types";

const STATUS_CONFIG: Record<
  BookStatus,
  { icon: React.ReactNode; title: string; accent: string; badge: string; headerBg: string }
> = {
  in_box: {
    icon: <PackageOpen className="w-5 h-5" />,
    title: "在箱图书",
    accent: "teal",
    badge: "bg-teal-500",
    headerBg: "from-teal-500 to-teal-600",
  },
  borrowed: {
    icon: <BookCheck className="w-5 h-5" />,
    title: "借出中",
    accent: "amber",
    badge: "bg-amber-500",
    headerBg: "from-amber-500 to-amber-600",
  },
  overdue: {
    icon: <AlertTriangle className="w-5 h-5" />,
    title: "逾期未还",
    accent: "red",
    badge: "bg-red-500",
    headerBg: "from-red-500 to-red-600",
  },
  damaged: {
    icon: <AlertOctagon className="w-5 h-5" />,
    title: "破损待修",
    accent: "orange",
    badge: "bg-orange-500",
    headerBg: "from-orange-500 to-orange-600",
  },
};

export default function Dashboard() {
  const { books, checkAndUpdateOverdue, getBooksByStatus } = useBookStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    checkAndUpdateOverdue();
  }, [checkAndUpdateOverdue]);

  const statuses: BookStatus[] = ["in_box", "borrowed", "overdue", "damaged"];

  const filterBooks = (status: BookStatus) => {
    const statusBooks = getBooksByStatus(status);
    if (!searchQuery.trim()) return statusBooks;
    const q = searchQuery.toLowerCase();
    return statusBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.donor.toLowerCase().includes(q)
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-gray-800">图书看板</h2>
          <p className="text-gray-500 mt-1">
            共 <span className="font-semibold text-amber-600">{books.length}</span> 本图书正在漂流
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索书名、作者..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 w-full sm:w-64"
            />
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>新增图书</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {statuses.map((status) => {
          const config = STATUS_CONFIG[status];
          const statusBooks = filterBooks(status);
          return (
            <div
              key={status}
              className="card overflow-hidden flex flex-col animate-slide-up"
              style={{ animationDelay: `${statuses.indexOf(status) * 50}ms` }}
            >
              <div className={`bg-gradient-to-r ${config.headerBg} px-5 py-3.5 flex items-center justify-between`}>
                <div className="flex items-center gap-2.5 text-white">
                  {config.icon}
                  <span className="font-semibold">{config.title}</span>
                  <span className="text-white/80 text-sm">· {STATUS_LABELS[status]}</span>
                </div>
                <span className={`${config.badge} text-white text-xs font-bold px-3 py-1 rounded-full shadow-inner`}>
                  {statusBooks.length}
                </span>
              </div>

              <div className="p-4 max-h-[420px] overflow-y-auto scrollbar-thin flex-1">
                {statusBooks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                      {config.icon}
                    </div>
                    <p className="text-sm">暂无{STATUS_LABELS[status]}图书</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {statusBooks.map((book) => (
                      <BookCard key={book.id} book={book} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="新增图书" size="lg">
        <BookForm
          onClose={() => setIsAddModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
