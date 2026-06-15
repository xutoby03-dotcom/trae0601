import { useState, useMemo } from 'react';
import { FileText, Clock, Trash2, AlertTriangle, Package, XCircle, UserX, Search, X } from 'lucide-react';
import { useFoodStore } from '../store/useFoodStore';
import { formatDateTime, isToday } from '../utils/time';

type FilterType = 'all' | 'unclaimed' | 'expired';

function highlightText(text: string, keyword: string): (string | { highlight: string })[] {
  if (!keyword.trim()) {
    return [text];
  }
  
  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.trim().toLowerCase();
  const keywordLen = lowerKeyword.length;
  const result: (string | { highlight: string })[] = [];
  
  let lastIndex = 0;
  let index = lowerText.indexOf(lowerKeyword);
  
  while (index !== -1) {
    if (index > lastIndex) {
      result.push(text.slice(lastIndex, index));
    }
    result.push({ highlight: text.slice(index, index + keywordLen) });
    lastIndex = index + keywordLen;
    index = lowerText.indexOf(lowerKeyword, lastIndex);
  }
  
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }
  
  return result;
}

export default function Records() {
  const { disposalRecords } = useFoodStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [keyword, setKeyword] = useState('');

  const reasonLabels: Record<string, string> = {
    expired: '过期下架',
    unclaimed: '无人认领',
  };

  const reasonColors: Record<string, string> = {
    expired: 'bg-red-100 text-red-700 border-red-200',
    unclaimed: 'bg-amber-100 text-amber-700 border-amber-200',
  };

  const filteredRecords = useMemo(() => {
    let result = [...disposalRecords];
    
    if (filter !== 'all') {
      result = result.filter((r) => r.reason === filter);
    }
    
    if (keyword.trim()) {
      const lowerKeyword = keyword.trim().toLowerCase();
      result = result.filter((r) => 
        r.foodName.toLowerCase().includes(lowerKeyword)
      );
    }
    
    return result.sort((a, b) => 
      new Date(b.disposedAt).getTime() - new Date(a.disposedAt).getTime()
    );
  }, [disposalRecords, filter, keyword]);

  const stats = useMemo(() => {
    const total = disposalRecords.reduce((sum, r) => sum + r.quantity, 0);
    const unclaimedTotal = disposalRecords
      .filter((r) => r.reason === 'unclaimed')
      .reduce((sum, r) => sum + r.quantity, 0);
    const expiredTotal = disposalRecords
      .filter((r) => r.reason === 'expired')
      .reduce((sum, r) => sum + r.quantity, 0);
    
    const todayTotal = disposalRecords
      .filter((r) => isToday(r.disposedAt))
      .reduce((sum, r) => sum + r.quantity, 0);
    const todayUnclaimed = disposalRecords
      .filter((r) => isToday(r.disposedAt) && r.reason === 'unclaimed')
      .reduce((sum, r) => sum + r.quantity, 0);
    const todayExpired = disposalRecords
      .filter((r) => isToday(r.disposedAt) && r.reason === 'expired')
      .reduce((sum, r) => sum + r.quantity, 0);
    
    const filteredTotal = filteredRecords.reduce((sum, r) => sum + r.quantity, 0);
    
    return {
      total,
      unclaimedTotal,
      expiredTotal,
      todayTotal,
      todayUnclaimed,
      todayExpired,
      filteredTotal,
    };
  }, [disposalRecords, filteredRecords]);

  const filterTabs: { key: FilterType; label: string; icon: typeof Package }[] = [
    { key: 'all', label: '全部', icon: Package },
    { key: 'unclaimed', label: '无人认领', icon: UserX },
    { key: 'expired', label: '过期下架', icon: XCircle },
  ];

  const clearSearch = () => {
    setKeyword('');
  };

  return (
    <div className="min-h-screen bg-warm-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
            <Trash2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-coffee-800">处理记录</h1>
            <p className="text-coffee-500 text-sm">所有过期或无人认领的食品处理记录</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-4">
            <div className="text-sm text-coffee-500 mb-1">今日处理</div>
            <div className="text-2xl font-bold text-coffee-800">{stats.todayTotal} 份</div>
          </div>
          <div className="bg-amber-50 rounded-2xl shadow-md p-4 border border-amber-100">
            <div className="text-sm text-amber-600 mb-1">今日无人认领</div>
            <div className="text-2xl font-bold text-amber-700">{stats.todayUnclaimed} 份</div>
          </div>
          <div className="bg-red-50 rounded-2xl shadow-md p-4 border border-red-100">
            <div className="text-sm text-red-600 mb-1">今日过期</div>
            <div className="text-2xl font-bold text-red-700">{stats.todayExpired} 份</div>
          </div>
          <div className="bg-warm-50 rounded-2xl shadow-md p-4 border border-warm-200">
            <div className="text-sm text-coffee-500 mb-1">
              {keyword.trim() || filter !== 'all' ? '筛选结果' : '累计处理'}
            </div>
            <div className="text-2xl font-bold text-coffee-700">
              {keyword.trim() || filter !== 'all' ? stats.filteredTotal : stats.total} 份
            </div>
            {(keyword.trim() || filter !== 'all') && (
              <div className="text-xs text-coffee-400 mt-1">
                共 {filteredRecords.length} 条记录
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="p-4 border-b border-warm-100 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-coffee-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索食品名称，如：葡萄、柠檬茶..."
                className="w-full pl-10 pr-10 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-coffee-800 placeholder-coffee-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all"
              />
              {keyword && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-coffee-400 hover:text-coffee-600 hover:bg-warm-200 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {filterTabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`
                    flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium
                    transition-all duration-200
                    ${filter === key
                      ? key === 'all'
                        ? 'bg-primary-500 text-white shadow-md'
                        : key === 'unclaimed'
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-red-500 text-white shadow-md'
                      : 'bg-warm-100 text-coffee-600 hover:bg-warm-200'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {key === 'all' && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-white/20">
                      {disposalRecords.length}
                    </span>
                  )}
                  {key === 'unclaimed' && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-white/20">
                      {disposalRecords.filter((r) => r.reason === 'unclaimed').length}
                    </span>
                  )}
                  {key === 'expired' && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-white/20">
                      {disposalRecords.filter((r) => r.reason === 'expired').length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {(keyword.trim() || filter !== 'all') && (
              <div className="flex items-center gap-2 text-sm text-coffee-500">
                <span>当前筛选：</span>
                {filter !== 'all' && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${reasonColors[filter]}`}>
                    {reasonLabels[filter]}
                  </span>
                )}
                {keyword.trim() && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                    关键词：{keyword.trim()}
                  </span>
                )}
                <button
                  onClick={() => {
                    setFilter('all');
                    clearSearch();
                  }}
                  className="ml-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  清除所有筛选
                </button>
              </div>
            )}
          </div>

          {filteredRecords.length > 0 ? (
            <div className="divide-y divide-warm-100">
              {filteredRecords.map((record, index) => {
                const isTodayRecord = isToday(record.disposedAt);
                const nameParts = highlightText(record.foodName, keyword);
                return (
                  <div
                    key={record.id}
                    className={`
                      p-4 flex items-center gap-4 hover:bg-warm-50 transition-colors
                      animate-fade-in-up
                      ${isTodayRecord ? 'bg-amber-50/30' : ''}
                    `}
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      record.reason === 'unclaimed'
                        ? 'bg-amber-100'
                        : 'bg-red-100'
                    }`}>
                      {record.reason === 'unclaimed' ? (
                        <UserX className="w-6 h-6 text-amber-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-coffee-800 truncate">
                          {nameParts.map((part, i) =>
                            typeof part === 'string' ? (
                              <span key={i}>{part}</span>
                            ) : (
                              <mark
                                key={i}
                                className="bg-yellow-200 px-0.5 rounded font-semibold"
                              >
                                {part.highlight}
                              </mark>
                            )
                          )}
                        </h3>
                        {isTodayRecord && (
                          <span className="px-1.5 py-0.5 rounded bg-primary-100 text-primary-700 text-xs font-medium flex-shrink-0">
                            今天
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${
                            reasonColors[record.reason]
                          }`}
                        >
                          {reasonLabels[record.reason]}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-coffee-500">
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {record.quantity} 份
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDateTime(record.disposedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-warm-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-coffee-300" />
              </div>
              <h3 className="text-lg font-semibold text-coffee-700 mb-2">暂无匹配记录</h3>
              <p className="text-coffee-500">
                {keyword.trim()
                  ? `没有找到包含"${keyword.trim()}"的记录`
                  : filter === 'unclaimed'
                  ? '没有无人认领的食品，太棒了！'
                  : filter === 'expired'
                  ? '没有过期下架的食品，太棒了！'
                  : '太好了！目前还没有食品被处理掉'}
              </p>
              {(keyword.trim() || filter !== 'all') && (
                <button
                  onClick={() => {
                    setFilter('all');
                    clearSearch();
                  }}
                  className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                >
                  清除筛选条件
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-amber-800 mb-1">温馨提示</div>
              <div className="text-sm text-amber-700">
                <p>• <strong>无人认领</strong>：食品从未被人认领过，过了可食用时间直接下架</p>
                <p>• <strong>过期下架</strong>：有人认领过但没领完，剩余部分过了可食用时间下架</p>
                <p className="mt-1">开封食品超过可食用时间会自动下架进入处理记录。请各部门合理预订茶歇数量，减少食物浪费。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
