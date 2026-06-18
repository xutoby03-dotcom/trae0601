import { Link } from 'react-router-dom';
import { Trophy, Wrench, Clock, ArrowRight, Users } from 'lucide-react';
import { useStore } from '../store';
import StatCard from '../components/Cards';
import { getPopularBooks } from '../utils/recommend';
import { daysBetween, today } from '../utils/storage';
import { BookCard } from '../components/Cards';

export default function Dashboard() {
  const { books, families, borrowRecords, selectedFamilyId } = useStore();
  const selectedFamily = families.find((f) => f.id === selectedFamilyId);

  const borrowedBooks = books.filter((b) => b.status === 'borrowed').length;
  const overdueRecords = borrowRecords.filter((r) => r.status === 'overdue');
  const damagedBooks = books.filter((b) => b.status === 'damaged');
  const popularBooks = getPopularBooks(books, borrowRecords, 5).filter((b) => b.borrowCount > 0);

  const familyBorrowStats = families.map((f) => {
    const familyRecords = borrowRecords.filter((r) => r.familyId === f.id);
    const current = familyRecords.filter((r) => r.status === 'borrowed' || r.status === 'overdue');
    return { family: f, total: familyRecords.length, current: current.length };
  });

  const overdueWithDetails = overdueRecords.map((r) => ({
    record: r,
    book: books.find((b) => b.id === r.bookId),
    family: families.find((f) => f.id === r.familyId),
    daysLate: daysBetween(r.expectedReturnDate, today()),
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-800 mb-2">
          欢迎来到绘本部落 🎉
        </h1>
        <p className="text-gray-500">让好绘本流动起来，陪伴每个孩子成长</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="绘本总数"
          value={books.length}
          icon="books"
          gradient="linear-gradient(135deg, #FF8C42 0%, #FFA561 100%)"
          delay={0}
        />
        <StatCard
          title="借出中"
          value={borrowedBooks}
          icon="borrowed"
          gradient="linear-gradient(135deg, #4ECDC4 0%, #6EDDD6 100%)"
          delay={80}
        />
        <StatCard
          title="逾期未还"
          value={overdueRecords.length}
          icon="overdue"
          gradient="linear-gradient(135deg, #FF6B6B 0%, #FF8A8A 100%)"
          delay={160}
        />
        <StatCard
          title="参与家庭"
          value={families.length}
          icon="families"
          gradient="linear-gradient(135deg, #9B8EC7 0%, #B0A5D9 100%)"
          delay={240}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 逾期提醒 */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-coral-400/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-coral-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">逾期提醒</h2>
                <p className="text-xs text-gray-400">请及时联系家庭归还</p>
              </div>
            </div>
            <Link to="/borrow" className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
              全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {overdueWithDetails.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <div className="text-5xl mb-3">✨</div>
              <p>太棒了！暂无逾期绘本</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overdueWithDetails.map(({ record, book, family, daysLate }) => (
                <div key={record.id} className="flex items-center gap-4 p-3 bg-coral-50 rounded-2xl border border-coral-200">
                  {book && (
                    <img src={book.coverUrl} alt={book.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{book?.title || '未知绘本'}</p>
                    <p className="text-sm text-gray-500">
                      👨‍👩‍👧 {family?.name || '未知家庭'} · 逾期 <span className="text-coral-600 font-semibold">{daysLate}</span> 天
                    </p>
                  </div>
                  <Link
                    to={`/borrow/return/${record.id}`}
                    className="btn-primary text-sm !px-4 !py-2 shrink-0"
                  >
                    归还
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 热门绘本 */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-400/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">热门绘本 Top 5</h2>
                <p className="text-xs text-gray-400">借阅次数最多的绘本</p>
              </div>
            </div>
          </div>

          {popularBooks.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <div className="text-5xl mb-3">📚</div>
              <p>暂无借阅记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {popularBooks.map((book, idx) => (
                <div key={book.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-cream-50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                    idx === 0 ? 'bg-yellow-400 text-white' :
                    idx === 1 ? 'bg-gray-300 text-white' :
                    idx === 2 ? 'bg-orange-300 text-white' :
                    'bg-cream-200 text-gray-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <img src={book.coverUrl} alt={book.title} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{book.title}</p>
                    <p className="text-xs text-gray-400">{book.ageRange} · {book.pages}页</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-orange-500">{book.borrowCount}</p>
                    <p className="text-xs text-gray-400">次借阅</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 破损待修 */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-lavender-400/20 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-lavender-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">破损待修</h2>
                <p className="text-xs text-gray-400">需要处理的损坏绘本</p>
              </div>
            </div>
            <Link to="/books" className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
              管理 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {damagedBooks.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <div className="text-5xl mb-3">💚</div>
              <p>所有绘本状态良好</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {damagedBooks.map((book) => (
                <div key={book.id} className="p-3 bg-lavender-50 rounded-2xl border border-lavender-200">
                  <img src={book.coverUrl} alt={book.title} className="w-full aspect-square rounded-xl object-cover mb-2" />
                  <p className="text-sm font-semibold text-gray-800 truncate">{book.title}</p>
                  <p className="text-xs text-lavender-600 mt-1">{book.damageLocation || '待检查'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 家庭借阅概览 */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-mint-400/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-mint-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">家庭借阅概览</h2>
              <p className="text-xs text-gray-400">每个家庭的借阅情况</p>
            </div>
          </div>

          <div className="space-y-3">
            {familyBorrowStats.map(({ family, total, current }) => (
              <div
                key={family.id}
                className={`flex items-center gap-4 p-3 rounded-2xl transition-colors ${
                  selectedFamilyId === family.id ? 'bg-mint-50 border-2 border-mint-300' : 'hover:bg-cream-50'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mint-400 to-mint-500 flex items-center justify-center text-white text-xl shrink-0">
                  👨‍👩‍👧
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{family.name}</p>
                  <p className="text-xs text-gray-400">孩子 {family.childAge} 岁 · {family.contact}</p>
                </div>
                <div className="flex gap-4 text-right shrink-0">
                  <div>
                    <p className="text-lg font-bold text-mint-600">{current}</p>
                    <p className="text-xs text-gray-400">持有中</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-orange-500">{total}</p>
                    <p className="text-xs text-gray-400">累计</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 快速入口 - 推荐绘本预览 */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-400/20 flex items-center justify-center text-xl">
              ✨
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                {selectedFamily ? `${selectedFamily.name}的专属推荐` : '为你推荐'}
              </h2>
              <p className="text-xs text-gray-400">根据孩子年龄和兴趣偏好精选</p>
            </div>
          </div>
          <Link to="/recommend" className="btn-secondary text-sm !px-4 !py-2">
            查看全部推荐
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {books
            .filter((b) => b.status === 'available')
            .slice(0, 6)
            .map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
        </div>
      </div>
    </div>
  );
}
