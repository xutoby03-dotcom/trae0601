import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, X } from 'lucide-react';
import { useStore } from '../store';
import { BookCard } from '../components/Cards';
import { AGE_RANGES, THEMES } from '../types';

export default function BookList() {
  const { books } = useStore();
  const [search, setSearch] = useState('');
  const [ageFilter, setAgeFilter] = useState<string>('');
  const [themeFilter, setThemeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (ageFilter && b.ageRange !== ageFilter) return false;
      if (themeFilter && !b.themes.includes(themeFilter)) return false;
      if (statusFilter && b.status !== statusFilter) return false;
      return true;
    });
  }, [books, search, ageFilter, themeFilter, statusFilter]);

  const hasFilters = ageFilter || themeFilter || statusFilter;

  const clearFilters = () => {
    setAgeFilter('');
    setThemeFilter('');
    setStatusFilter('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800 mb-1">
            绘本档案 📚
          </h1>
          <p className="text-gray-500">共收录 {books.length} 本绘本，当前可借 {books.filter(b => b.status === 'available').length} 本</p>
        </div>
        <Link to="/books/new" className="btn-primary">
          <Plus className="w-5 h-5" />
          新增绘本
        </Link>
      </div>

      {/* 搜索和筛选 */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-12"
              placeholder="搜索绘本名称..."
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary !px-5 ${showFilters ? '!bg-orange-100' : ''}`}
          >
            <Filter className="w-5 h-5" />
            筛选
            {hasFilters && (
              <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center ml-1">
                {[ageFilter, themeFilter, statusFilter].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-cream-200 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">年龄段</label>
              <select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                className="input-field"
              >
                <option value="">全部年龄段</option>
                {AGE_RANGES.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">主题</label>
              <select
                value={themeFilter}
                onChange={(e) => setThemeFilter(e.target.value)}
                className="input-field"
              >
                <option value="">全部主题</option>
                {THEMES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">状态</label>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field flex-1"
                >
                  <option value="">全部状态</option>
                  <option value="available">可借</option>
                  <option value="borrowed">借出中</option>
                  <option value="damaged">破损待修</option>
                </select>
                {hasFilters && (
                  <button onClick={clearFilters} className="btn-ghost">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 绘本网格 */}
      {filteredBooks.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-500 text-lg mb-2">没有找到匹配的绘本</p>
          <p className="text-gray-400 text-sm">试试调整搜索词或筛选条件</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredBooks.map((book) => (
            <Link key={book.id} to={`/books/${book.id}`}>
              <BookCard book={book} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
