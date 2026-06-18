import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, User, RefreshCw, ArrowRight } from 'lucide-react';
import { useStore } from '../store';
import { recommendBooks } from '../utils/recommend';
import { BookCard } from '../components/Cards';

export default function Recommend() {
  const { books, families, borrowRecords, selectedFamilyId, setSelectedFamily } = useStore();

  const recommendationsByFamily = useMemo(() => {
    return families.map((family) => ({
      family,
      results: recommendBooks(family, books, borrowRecords, 6),
    }));
  }, [families, books, borrowRecords]);

  const currentFamily = families.find((f) => f.id === selectedFamilyId) || families[0];
  const currentRecommendations = currentFamily
    ? recommendBooks(currentFamily, books, borrowRecords, 12)
    : [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-800 mb-2">
          智能推荐 ✨
        </h1>
        <p className="text-gray-500">
          根据孩子年龄和借阅历史，为每个家庭精选最合适的绘本
        </p>
      </div>

      {/* 家庭选择 */}
      <div className="card p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-400/20 flex items-center justify-center">
            <User className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">选择家庭</h2>
            <p className="text-xs text-gray-400">查看不同家庭的专属推荐</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {families.map((f) => {
            const selected = f.id === selectedFamilyId;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedFamily(f.id)}
                className={`px-4 py-2.5 rounded-full font-medium transition-all flex items-center gap-2 ${
                  selected
                    ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-soft'
                    : 'bg-cream-100 text-gray-600 hover:bg-cream-200'
                }`}
              >
                👨‍👩‍👧 {f.name}
                <span className={`text-xs ${selected ? 'text-white/80' : 'text-gray-400'}`}>
                  ({f.childAge}岁)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 当前家庭推荐详情 */}
      {currentFamily && (
        <div className="card p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lavender-400 to-lavender-500 flex items-center justify-center text-2xl text-white animate-float">
                ✨
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {currentFamily.name} 的专属推荐
                </h2>
                <p className="text-sm text-gray-400">
                  孩子 {currentFamily.childAge} 岁 · 共 {currentRecommendations.length} 本精选
                </p>
              </div>
            </div>
            <Link to="/borrow/new" className="btn-primary text-sm !px-4 !py-2">
              <RefreshCw className="w-4 h-4" />
              去借阅
            </Link>
          </div>

          {currentRecommendations.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-5xl mb-3">📭</div>
              <p>暂无可推荐的绘本</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {currentRecommendations.map(({ book, score, reasons }, idx) => (
                <div key={book.id} className="relative" style={{ animationDelay: `${idx * 60}ms` }}>
                  <div className="absolute -top-2 -right-2 z-10 w-12 h-12 rounded-full bg-gradient-to-br from-lavender-500 to-lavender-600 text-white flex flex-col items-center justify-center shadow-card">
                    <span className="text-xs leading-none">匹配</span>
                    <span className="text-sm font-bold leading-none">
                      {Math.min(99, Math.max(30, Math.round(score)))}%
                    </span>
                  </div>
                  <Link to={`/books/${book.id}`}>
                    <BookCard book={book} />
                  </Link>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {reasons.slice(0, 2).map((r, i) => (
                      <span key={i} className="tag text-[10px] !px-2 !py-0.5">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 所有家庭推荐概览 */}
      <div className="card p-6 sm:p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-5">所有家庭推荐一览</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendationsByFamily.map(({ family, results }) => (
            <div key={family.id} className="p-5 bg-cream-50 rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mint-400 to-mint-500 flex items-center justify-center text-white text-lg">
                    👨‍👩‍👧
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{family.name}</p>
                    <p className="text-xs text-gray-400">{family.childAge}岁 · {family.contact}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFamily(family.id)}
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
                >
                  查看 <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {results.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {results.slice(0, 4).map(({ book }) => (
                    <div key={book.id} className="w-16 shrink-0">
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full aspect-square rounded-xl object-cover shadow-sm"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">暂无推荐</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 推荐说明 */}
      <div className="card p-6 bg-gradient-to-br from-lavender-50 to-cream-50 border-lavender-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shrink-0 shadow-sm">
            <Sparkles className="w-6 h-6 text-lavender-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-1">推荐算法说明</h3>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>🎯 <strong>年龄段匹配</strong>：适合的绘本优先推荐，相差1-2岁适当降权</li>
              <li>💖 <strong>主题偏好</strong>：根据历史借阅的主题标签分析孩子兴趣</li>
              <li>🔄 <strong>降低重复</strong>：已经借过的绘本大幅降低推荐权重</li>
              <li>🆕 <strong>新鲜度</strong>：从未借过的全新绘本额外加分</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
