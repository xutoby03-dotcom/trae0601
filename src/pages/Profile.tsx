import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '@/components/common/EmptyState';
import {
  UserCircle2,
  BookPlus,
  BookCopy,
  Edit2,
  Check,
  X,
  AlertCircle,
  Sparkles,
  LogIn,
  RotateCcw,
  Gift,
  Clock,
  MessageSquarePlus,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { ensureCurrentUser, getBookOverdueInfo } from '@/utils/bookUtils';
import { calcUserStats } from '@/utils/statsUtils';
import { formatRelative, formatDate } from '@/utils/dateUtils';
import { CATEGORY_COLORS } from '@/types';
import { toast } from '@/components/common/Toast';

type TabKey = 'overview' | 'registered' | 'borrowing' | 'info';

export const Profile = () => {
  const navigate = useNavigate();
  const store = useAppStore();
  const users = store.users;
  const books = store.books;
  const records = store.borrowRecords;
  const reviews = store.reviews;
  const returnBook = store.returnBook;
  const setCurrentUser = store.setCurrentUser;
  const updateNickname = store.updateUserNickname;
  const currentUser = ensureCurrentUser(store);

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [editingName, setEditingName] = useState(false);
  const [newNickname, setNewNickname] = useState(currentUser.nickname);

  const stats = useMemo(
    () => calcUserStats(currentUser.id, books, records, reviews),
    [currentUser.id, books, records, reviews]
  );

  const myBooks = useMemo(
    () => books.filter((b) => b.lenderId === currentUser.id),
    [books, currentUser.id]
  );

  const myBorrowing = useMemo(() => {
    const myRecords = records
      .filter((r) => r.userId === currentUser.id && r.action === 'borrow')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return myRecords
      .map((r) => {
        const book = books.find((b) => b.id === r.bookId);
        if (!book) return null;
        const hasReturned = records.some(
          (rr) =>
            rr.action === 'return' &&
            rr.bookId === r.bookId &&
            rr.userId === currentUser.id &&
            new Date(rr.createdAt).getTime() > new Date(r.createdAt).getTime()
        );
        const overdueInfo = !hasReturned ? getBookOverdueInfo(book, records) : null;
        return { record: r, book, hasReturned, overdueInfo };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [records, books, currentUser.id]);

  const overdueList = myBorrowing.filter((x) => !x.hasReturned && x.overdueInfo?.isOverdue);

  const handleSaveName = () => {
    const name = newNickname.trim();
    if (!name) {
      toast.error('昵称不能为空');
      return;
    }
    updateNickname(name);
    setEditingName(false);
    toast.success('昵称已更新');
  };

  const tabs: { key: TabKey; label: string; icon: typeof BookPlus; badge?: number }[] = [
    { key: 'overview', label: '概览', icon: Sparkles },
    { key: 'registered', label: `我登记的 (${myBooks.length})`, icon: BookPlus },
    { key: 'borrowing', label: `我的借阅 (${myBorrowing.length})`, icon: BookCopy, badge: overdueList.length || undefined },
    { key: 'info', label: '账号设置', icon: UserIcon },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="card-paper overflow-hidden">
        <div className="relative h-28 md:h-36 bg-gradient-to-br from-wood-600 via-wood-700 to-wood-800">
          <div className="absolute inset-0 wood-grain opacity-40" />
          <div className="absolute top-6 right-6 w-24 h-24 bg-accent-orange/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-10 w-40 h-16 bg-accent-olive/20 rounded-full blur-2xl" />
        </div>
        <div className="px-6 md:px-8 pb-6 md:pb-8 -mt-10 md:-mt-12 relative">
          <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-accent-orange via-[#F06030] to-[#D4502A] flex items-center justify-center shadow-2xl ring-4 ring-paper-100">
                <UserCircle2 className="w-10 h-10 md:w-12 md:h-12 text-white" strokeWidth={1.8} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2 mb-1">
                  <input
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    className="input-field !py-1.5 !px-3 !text-xl font-serif font-bold max-w-[200px]"
                    maxLength={12}
                    autoFocus
                  />
                  <button onClick={handleSaveName} className="p-2 rounded-lg bg-accent-olive text-white hover:bg-emerald-700 transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingName(false);
                      setNewNickname(currentUser.nickname);
                    }}
                    className="p-2 rounded-lg bg-wood-200 text-wood-700 hover:bg-wood-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-serif text-2xl md:text-3xl font-bold text-wood-800">
                    {currentUser.nickname}
                  </h1>
                  <button
                    onClick={() => setEditingName(true)}
                    className="p-1.5 rounded-lg text-wood-400 hover:bg-paper-200 hover:text-wood-700 transition-colors"
                    title="编辑昵称"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-sm text-wood-500">
                漂流书柜成员 · 加入于 {formatDate(currentUser.createdAt, 'yyyy年MM月')}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="text-center px-4 py-2 rounded-xl bg-paper-200/80">
                <div className="text-2xl font-bold text-wood-800 font-serif">{stats.registeredCount}</div>
                <div className="text-[11px] text-wood-500">登记</div>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-paper-200/80">
                <div className="text-2xl font-bold text-wood-800 font-serif">{stats.borrowedCount}</div>
                <div className="text-[11px] text-wood-500">借阅</div>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-paper-200/80">
                <div className="text-2xl font-bold text-wood-800 font-serif">{stats.reviewCount}</div>
                <div className="text-[11px] text-wood-500">短评</div>
              </div>
              {stats.overdueCount > 0 && (
                <div className="text-center px-4 py-2 rounded-xl bg-red-50 border border-red-200 animate-breathe">
                  <div className="text-2xl font-bold text-accent-brick font-serif">{stats.overdueCount}</div>
                  <div className="text-[11px] text-red-500">逾期</div>
                </div>
              )}
            </div>
          </div>

          {overdueList.length > 0 && (
            <div className="mt-6 rounded-xl border-2 border-accent-brick/40 bg-gradient-to-br from-red-50 to-orange-50 p-4 md:p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-brick/10 rounded-full blur-3xl" />
              <div className="relative flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent-brick/15 flex items-center justify-center flex-shrink-0 animate-breathe">
                  <AlertCircle className="w-5 h-5 text-accent-brick" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-wood-800 mb-1 flex items-center gap-2">
                    有 {overdueList.length} 本书期待早点回家哦
                  </h3>
                  <p className="text-sm text-wood-600 leading-relaxed mb-3">
                    抽空看一看，读完记得归还，让好书继续漂流~ 读完标记「已归还」就可以啦。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {overdueList.slice(0, 3).map((o) => (
                      <Link
                        key={o.record.id}
                        to={`/book/${o.book.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-red-200 text-sm text-wood-700 hover:border-accent-brick hover:text-accent-brick transition-colors shadow-sm"
                      >
                        <Clock className="w-3.5 h-3.5 text-accent-brick" />
                        <span className="truncate max-w-[140px]">{o.book.title}</span>
                        <span className="text-accent-brick text-xs font-bold">
                          逾期{o.overdueInfo?.overdueDays}天
                        </span>
                      </Link>
                    ))}
                    {overdueList.length > 3 && (
                      <button
                        onClick={() => setActiveTab('borrowing')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-wood-700 text-white text-sm hover:bg-wood-800 transition-colors"
                      >
                        查看全部 <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-wood-100 pb-px">
        {tabs.map(({ key, label, icon: Icon, badge }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`relative inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all duration-200 -mb-px
                ${active
                  ? 'bg-white border border-b-0 border-wood-200 text-wood-800 shadow-[0_-2px_8px_rgba(93,64,55,0.06)]'
                  : 'text-wood-500 hover:text-wood-700 hover:bg-paper-100/60'
                }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-accent-orange' : ''}`} />
              <span>{label}</span>
              {badge !== undefined && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-accent-brick text-white text-[10px] font-bold animate-breathe">
                  {badge}
                </span>
              )}
              {active && <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-accent-orange rounded-full" />}
            </button>
          );
        })}
      </div>

      <div className="card-paper p-5 md:p-7 min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-wood-800 font-serif mb-4 flex items-center gap-2">
                <BookPlus className="w-5 h-5 text-accent-orange" />
                最近登记
              </h3>
              <div className="space-y-2">
                {myBooks.slice(0, 5).map((b) => (
                  <Link
                    key={b.id}
                    to={`/book/${b.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-paper-200/60 transition-colors group"
                  >
                    <div className="w-10 h-14 rounded-md overflow-hidden shadow-book flex-shrink-0 group-hover:scale-105 transition-transform">
                      <img src={b.coverUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-wood-800 truncate group-hover:text-accent-orange transition-colors">
                        {b.title}
                      </p>
                      <p className="text-xs text-wood-500 mt-0.5">
                        {b.category} · {formatRelative(b.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`badge ${b.status === 'available' ? 'bg-accent-olive/15 text-emerald-700' : b.status === 'borrowed' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}
                    >
                      {b.status === 'available' ? '在柜' : b.status === 'borrowed' ? '借出中' : '已赠出'}
                    </span>
                  </Link>
                ))}
                {myBooks.length === 0 && (
                  <p className="text-sm text-wood-400 py-8 text-center">
                    还没登记过图书，<Link to="/register" className="text-accent-orange hover:underline">去登记一本 →</Link>
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-wood-800 font-serif mb-4 flex items-center gap-2">
                <BookCopy className="w-5 h-5 text-sky-600" />
                借阅动态
              </h3>
              <div className="space-y-2">
                {myBorrowing.slice(0, 5).map((x) => (
                  <div
                    key={x.record.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/60 border border-wood-50"
                  >
                    <div className="w-10 h-14 rounded-md overflow-hidden shadow-book flex-shrink-0">
                      <img src={x.book.coverUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/book/${x.book.id}`} className="font-medium text-wood-800 truncate hover:text-accent-orange transition-colors block">
                        {x.book.title}
                      </Link>
                      <p className="text-xs text-wood-500 mt-0.5">
                        {x.hasReturned ? (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <Check className="w-3 h-3" /> 已归还 · {formatRelative(x.record.createdAt)}
                          </span>
                        ) : x.overdueInfo?.isOverdue ? (
                          <span className="text-accent-brick flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3 h-3" /> 逾期{x.overdueInfo.overdueDays}天
                          </span>
                        ) : (
                          <span className="text-amber-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 借阅中
                          </span>
                        )}
                      </p>
                    </div>
                    {!x.hasReturned && x.book.currentHolderId === currentUser.id && (
                      <button
                        onClick={() => {
                          returnBook(x.book.id);
                          toast.success(`《${x.book.title}》已归还，感谢！`);
                        }}
                        className="btn-primary !py-1.5 !px-3 !text-xs"
                      >
                        <RotateCcw className="w-3 h-3" /> 归还
                      </button>
                    )}
                  </div>
                ))}
                {myBorrowing.length === 0 && (
                  <p className="text-sm text-wood-400 py-8 text-center">
                    还没借阅过图书，<Link to="/" className="text-accent-orange hover:underline">去书柜看看 →</Link>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'registered' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myBooks.map((b) => {
              const conf = CATEGORY_COLORS[b.category];
              return (
                <Link
                  key={b.id}
                  to={`/book/${b.id}`}
                  className="group flex gap-3 p-3 rounded-xl border border-wood-100 bg-white/60 hover:shadow-paper-raised hover:-translate-y-0.5 transition-all"
                >
                  <div className="w-14 h-20 rounded-md overflow-hidden shadow-book flex-shrink-0 group-hover:scale-105 transition-transform relative">
                    <img src={b.coverUrl} alt="" className="w-full h-full object-cover" />
                    <div className={`absolute left-0 top-0 bottom-0 w-[14%] ${conf.spine}`} />
                  </div>
                  <div className="flex-1 min-w-0 py-0.5 flex flex-col">
                    <p className="font-serif font-bold text-wood-800 leading-tight line-clamp-2 group-hover:text-accent-orange transition-colors">
                      {b.title}
                    </p>
                    <p className="text-xs text-wood-500 mt-1 truncate">{b.author}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <span className={`badge ${conf.bg} ${conf.text} !text-[10px]`}>{b.category}</span>
                      <span
                        className={`badge ${
                          b.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                          b.status === 'borrowed' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        } !text-[10px]`}
                      >
                        {b.status === 'available' ? '在柜' : b.status === 'borrowed' ? '借出' : '已赠出'}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
            {myBooks.length === 0 && (
              <div className="col-span-full">
                <EmptyState
                  icon="no-books"
                  title="还没有登记图书"
                  description="把你闲置的好书分享出来吧，让它遇见下一位有缘人"
                  action={
                    <Link to="/register" className="btn-warm">
                      <BookPlus className="w-4 h-4" /> 立即登记
                    </Link>
                  }
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'borrowing' && (
          <div className="space-y-6">
            {(['active', 'history'] as const).map((section) => {
              const list = myBorrowing.filter((x) => (section === 'active' ? !x.hasReturned : x.hasReturned));
              if (list.length === 0 && section === 'active') return null;
              return (
                <div key={section}>
                  <h3 className="text-sm font-semibold text-wood-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    {section === 'active' ? (
                      <>📖 当前借阅 <span className="text-xs font-normal">({list.length})</span></>
                    ) : (
                      <>📚 历史借阅 <span className="text-xs font-normal">({list.length})</span></>
                    )}
                  </h3>
                  <div className="space-y-2">
                    {list.map((x) => (
                      <div
                        key={x.record.id}
                        className={`flex gap-4 p-4 rounded-xl border transition-colors ${
                          !x.hasReturned && x.overdueInfo?.isOverdue
                            ? 'bg-red-50/60 border-red-200 animate-breathe'
                            : section === 'active'
                            ? 'bg-amber-50/50 border-amber-200/60'
                            : 'bg-white/60 border-wood-100 hover:bg-paper-100'
                        }`}
                      >
                        <Link to={`/book/${x.book.id}`} className="flex-shrink-0 group">
                          <div className="w-14 h-20 rounded-md overflow-hidden shadow-book group-hover:scale-105 transition-transform">
                            <img src={x.book.coverUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <Link to={`/book/${x.book.id}`} className="font-serif font-bold text-wood-800 leading-tight hover:text-accent-orange transition-colors">
                            {x.book.title}
                          </Link>
                          <p className="text-xs text-wood-500 mt-0.5">{x.book.author}</p>
                          <div className="mt-auto pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                            <span className="text-wood-500">
                              借阅：{formatRelative(x.record.createdAt)}
                            </span>
                            {x.record.expectedReturnDate && (
                              <span className={`flex items-center gap-1 ${
                                !x.hasReturned && x.overdueInfo?.isOverdue ? 'text-accent-brick font-semibold' : 'text-wood-500'
                              }`}>
                                <Clock className="w-3 h-3" />
                                应还：{formatDate(x.record.expectedReturnDate, 'MM月dd日')}
                                {!x.hasReturned && x.overdueInfo?.isOverdue && `（逾期${x.overdueInfo.overdueDays}天）`}
                              </span>
                            )}
                            {x.hasReturned && (
                              <span className="inline-flex items-center gap-1 text-emerald-700">
                                <Check className="w-3 h-3" />
                                已归还
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col justify-center items-end gap-2 flex-shrink-0">
                          {!x.hasReturned && x.book.currentHolderId === currentUser.id && (
                            <button
                              onClick={() => {
                                returnBook(x.book.id);
                                toast.success(`《${x.book.title}》已归还，感谢！🌿`);
                              }}
                              className="btn-primary !py-2 !px-4 !text-xs whitespace-nowrap"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> 我已归还
                            </button>
                          )}
                          {x.hasReturned && (
                            <span className="badge bg-emerald-100 text-emerald-700">
                              <Gift className="w-3 h-3" /> 已完成漂流
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {list.length === 0 && section === 'history' && (
                      <p className="text-sm text-wood-400 py-6 text-center">还没有历史借阅记录</p>
                    )}
                  </div>
                </div>
              );
            })}
            {myBorrowing.length === 0 && (
              <EmptyState
                icon="no-records"
                title="暂无借阅记录"
                description="书柜里一定有你感兴趣的书，去逛逛吧"
                action={
                  <Link to="/" className="btn-warm">
                    <BookCopy className="w-4 h-4" /> 去借书
                  </Link>
                }
              />
            )}
          </div>
        )}

        {activeTab === 'info' && (
          <div className="max-w-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-wood-800 font-serif mb-4 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-wood-600" /> 基本信息
              </h3>
              <div className="space-y-3 p-4 rounded-xl bg-paper-200/60">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-wood-500">昵称</span>
                  {editingName ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        value={newNickname}
                        onChange={(e) => setNewNickname(e.target.value)}
                        className="input-field !py-1 !px-2 !text-sm !w-36"
                        maxLength={12}
                      />
                      <button onClick={handleSaveName} className="p-1.5 rounded-md bg-accent-olive text-white">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingName(false);
                          setNewNickname(currentUser.nickname);
                        }}
                        className="p-1.5 rounded-md bg-wood-200 text-wood-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingName(true)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-wood-800 hover:text-accent-orange transition-colors"
                    >
                      {currentUser.nickname}
                      <Edit2 className="w-3.5 h-3.5 text-wood-400" />
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-wood-500">用户 ID</span>
                  <span className="font-mono text-xs text-wood-700 bg-white px-2 py-0.5 rounded">
                    {currentUser.id.slice(0, 16)}…
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-wood-500">加入时间</span>
                  <span className="text-sm text-wood-700">{formatDate(currentUser.createdAt)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-wood-800 font-serif mb-4 flex items-center gap-2">
                <LogIn className="w-5 h-5 text-wood-600" /> 切换身份（体验多用户）
              </h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {users.map((u) => {
                  const isMe = u.id === currentUser.id;
                  const uStats = calcUserStats(u.id, books, records, reviews);
                  return (
                    <button
                      key={u.id}
                      disabled={isMe}
                      onClick={() => {
                        setCurrentUser(u);
                        setNewNickname(u.nickname);
                        toast.success(`已切换到「${u.nickname}」`);
                      }}
                      className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        isMe
                          ? 'bg-wood-700 text-paper-50 shadow-lg cursor-default'
                          : 'bg-white/70 border border-wood-100 hover:bg-paper-200 hover:-translate-y-0.5 hover:shadow-paper'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm ${
                          isMe
                            ? 'bg-white/20 text-white'
                            : 'bg-gradient-to-br from-accent-olive to-emerald-700 text-white'
                        }`}
                      >
                        {u.nickname.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold truncate">{u.nickname}</span>
                          {isMe && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/20 text-[10px]">
                              当前
                            </span>
                          )}
                        </div>
                        <div className={`text-[11px] mt-0.5 ${isMe ? 'text-paper-200' : 'text-wood-500'}`}>
                          登{uStats.registeredCount} · 借{uStats.borrowedCount} · 评{uStats.reviewCount}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-wood-400 leading-relaxed">
                💡 小贴士：这是纯前端演示，切换用户可以体验不同视角（如：登记人/借阅人）。实际项目中应改为登录系统。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
