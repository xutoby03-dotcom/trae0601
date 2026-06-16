import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import CabinetCard from "@/components/CabinetCard";
import CabinetDrawer from "@/components/CabinetDrawer";
import type { Cabinet } from "@/types";
import { Search, Filter } from "lucide-react";

export default function CabinetOverview() {
  const cabinets = useAppStore((state) => state.cabinets);
  const books = useAppStore((state) => state.books);
  const [selectedCabinet, setSelectedCabinet] = useState<Cabinet | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");

  const filteredCabinets = cabinets.filter((cab) => {
    const cabBooks = books.filter((b) => b.cabinetId === cab.id);
    if (!searchQuery && !gradeFilter) return true;

    if (gradeFilter) {
      const hasGrade = cabBooks.some((b) => b.suitableGrade === gradeFilter);
      if (!hasGrade) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const hasMatch =
        cab.name.toLowerCase().includes(q) ||
        cabBooks.some(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q)
        );
      if (!hasMatch) return false;
    }
    return true;
  });

  const totalBooks = books.filter((b) => b.status !== "offline").length;
  const availableBooks = books.filter((b) => b.status === "available").length;
  const borrowedBooks = books.filter((b) => b.status === "borrowed").length;

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-book border border-cream-200">
          <p className="text-xs text-gray-500 mb-1">总柜格数</p>
          <p className="text-2xl font-bold text-forest-700 font-serif">
            {cabinets.length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-book border border-cream-200">
          <p className="text-xs text-gray-500 mb-1">藏书总量</p>
          <p className="text-2xl font-bold text-primary-600 font-serif">
            {totalBooks}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-book border border-cream-200">
          <p className="text-xs text-gray-500 mb-1">可借图书</p>
          <p className="text-2xl font-bold text-forest-500 font-serif">
            {availableBooks}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-book border border-cream-200">
          <p className="text-xs text-gray-500 mb-1">漂流中</p>
          <p className="text-2xl font-bold text-amber-600 font-serif">
            {borrowedBooks}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索书名、作者或柜格名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 text-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-cream-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 text-sm appearance-none cursor-pointer min-w-[140px]"
          >
            <option value="">全部年级</option>
            <option value="一年级">一年级</option>
            <option value="二年级">二年级</option>
            <option value="三年级">三年级</option>
            <option value="四年级">四年级</option>
            <option value="五年级">五年级</option>
            <option value="六年级">六年级</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredCabinets.map((cabinet) => (
          <CabinetCard
            key={cabinet.id}
            cabinet={cabinet}
            onClick={() => setSelectedCabinet(cabinet)}
          />
        ))}
      </div>

      {filteredCabinets.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-500">没有找到匹配的柜格或图书</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setGradeFilter("");
            }}
            className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            清除筛选条件
          </button>
        </div>
      )}

      <CabinetDrawer
        cabinet={selectedCabinet}
        onClose={() => setSelectedCabinet(null)}
      />
    </div>
  );
}
