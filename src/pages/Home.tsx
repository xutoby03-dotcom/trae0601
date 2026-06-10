import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, BookOpen, Wand2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { groupBooks, searchBooks } from '@/utils/bookUtils';
import type { BookGroup } from '@/types';
import GroupTabs from '@/components/bookshelf/GroupTabs';
import BookCell from '@/components/bookshelf/BookCell';
import EmptyState from '@/components/common/EmptyState';

export const Home = () => {
  const books = useAppStore((s) => s.books);
  const borrowRecords = useAppStore((s) => s.borrowRecords);
  const [activeGroup, setActiveGroup] = useState<BookGroup>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const counts = useMemo(() => {
    const all = books.length;
    const newB = books.filter((b) => groupBooks([b], 'new', borrowRecords).length).length;
    const hot = books.filter((b) => groupBooks([b], 'hot', borrowRecords).length).length;
    const pending = books.filter((b) => groupBooks([b], 'pending-return', borrowRecords).length).length;
    const idle = books.filter((b) => groupBooks([b], 'idle', borrowRecords).length).length;
    return { all, new: newB, hot, 'pending-return': pending, idle };
  }, [books, borrowRecords]);

  const displayedBooks = useMemo(() => {
    let result = groupBooks(books, activeGroup, borrowRecords);
    if (searchQuery) result = searchBooks(result, searchQuery);
    return result;
  }, [books, activeGroup, borrowRecords, searchQuery]);

  const availableCount = books.filter((b) => b.status === 'available').length;
  const borrowedCount = books.filter((b) => b.status === 'borrowed').length;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-wood-700 via-wood-600 to-wood-800 p-6 md:p-10 shadow-2xl">
        <div className="absolute inset-0 wood-grain opacity-30" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-accent-orange/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-accent-olive/10 rounded-full blur-3xl translate-y-1/2" />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-paper-100 text-xs font-medium mb-4 border border-white/10">
              <Wand2 className="w-3.5 h-3.5 text-accent-orangeLight" />
              让每一本好书，找到有缘人
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-paper-50 mb-3 leading-tight">
              办公室 · 漂流书柜
            </h1>
            <p className="text-wood-100/90 text-base md:text-lg leading-relaxed mb-6 max-w-xl">
              闲置的好书，不该落灰。登记、借阅、分享、传递书香，
              让每一本书都开启属于它的漂流旅程。
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <Link to="/register" className="btn-warm !px-6 !py-3 text-base shadow-lg">
                <PlusCircle className="w-5 h-5" />
                登记一本新书
              </Link>
              <div className="flex items-center gap-6 text-sm text-paper-100/90">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-paper-50">{books.length}</div>
                    <div className="text-[11px] text-wood-200">累计图书</div>
                  </div>
                </div>
                <div className="w-px h-10 bg-white/15" />
                <div>
                  <div className="font-bold text-lg text-accent-olive">{availableCount}</div>
                  <div className="text-[11px] text-wood-200">可借阅</div>
                </div>
                <div>
                  <div className="font-bold text-lg text-accent-orangeLight">{borrowedCount}</div>
                  <div className="text-[11px] text-wood-200">漂流中</div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative lg:max-w-sm w-full">
            <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 shadow-2xl">
              <Search className="w-5 h-5 absolute left-6 top-6 text-wood-200" />
              <input
                type="text"
                placeholder="搜索书名、作者或类别..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/95 text-wood-800 placeholder:text-wood-400 text-base font-medium focus:outline-none focus:ring-4 focus:ring-accent-orange/30 shadow-inner"
              />
              {searchQuery && (
                <p className="mt-3 text-xs text-paper-100/80 text-center">
                  找到 <span className="font-bold text-accent-orangeLight">{displayedBooks.length}</span> 本相关图书
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="section-title !mb-0">
              <BookOpen className="w-6 h-6 text-wood-600" />
              浏览书柜
            </h2>
            <p className="mt-2 text-sm text-wood-500 ml-9 md:ml-0">
              悬停书脊查看详情，点击进入图书主页
            </p>
          </div>
        </div>

        <GroupTabs active={activeGroup} onChange={setActiveGroup} counts={counts} />

        <div className="relative rounded-3xl bg-gradient-to-b from-wood-600 via-wood-700 to-wood-800 p-4 md:p-6 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 wood-grain opacity-40 pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-wood-900/40 to-transparent" />
          <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-wood-900/50 to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-wood-900/50 to-transparent" />

          <div className="relative grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4 md:gap-x-4 md:gap-y-8">
            {displayedBooks.map((book, i) => (
              <div key={book.id} className="relative">
                <BookCell book={book} index={i} />
                <div className="absolute -bottom-3 left-1 right-1 h-1.5 bg-wood-900/60 rounded-full shadow-inner" />
              </div>
            ))}
          </div>

          {displayedBooks.length === 0 && (
            <div className="relative py-16">
              <EmptyState
                icon={activeGroup === 'all' ? 'empty-shelf' : 'no-books'}
                title={searchQuery ? '没有找到匹配的图书' : '这一层还是空的'}
                description={
                  searchQuery
                    ? '换个关键词试试，或者看看其他分类'
                    : activeGroup === 'new'
                    ? '最近7天还没有人登记新书哦'
                    : activeGroup === 'hot'
                    ? '大家加油借阅，让书柜热起来！'
                    : activeGroup === 'pending-return'
                    ? '所有图书都已按时归还，点赞！'
                    : activeGroup === 'idle'
                    ? '太棒了，没有长期闲置的图书'
                    : '点击右上角按钮登记第一本图书吧'
                }
                action={
                  !searchQuery && activeGroup === 'all' ? (
                    <Link to="/register" className="btn-warm">
                      <PlusCircle className="w-4 h-4" />
                      立即登记
                    </Link>
                  ) : undefined
                }
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
