import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarClock,
  Gift,
  MapPin,
  User as UserIcon,
  MessageSquarePlus,
  Star,
  HandHeart,
  RotateCcw,
  BookCopy,
  AlertTriangle,
  Sparkles,
  Tag,
  Eye,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  getBookRecords,
  getBookReviews,
  getLender,
  getCurrentHolder,
  ensureCurrentUser,
} from '@/utils/bookUtils';
import { formatDate, formatRelative, daysFromNow, addDaysFromNow } from '@/utils/dateUtils';
import { CATEGORY_COLORS } from '@/types';
import { toast } from '@/components/common/Toast';
import ActivityTimeline from '@/components/common/ActivityTimeline';
import EmptyState from '@/components/common/EmptyState';

export const BookDetail = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const book = useAppStore((s) => s.books.find((b) => b.id === id));
  const users = useAppStore((s) => s.users);
  const records = useAppStore((s) => s.borrowRecords);
  const allReviews = useAppStore((s) => s.reviews);
  const borrowBook = useAppStore((s) => s.borrowBook);
  const returnBook = useAppStore((s) => s.returnBook);
  const claimBook = useAppStore((s) => s.claimBook);
  const addReview = useAppStore((s) => s.addReview);
  const state = useAppStore.getState();
  const currentUser = ensureCurrentUser(state);

  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [expectedReturn, setExpectedReturn] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [reviewContent, setReviewContent] = useState('');
  const [reviewReason, setReviewReason] = useState('');
  const [rating, setRating] = useState(5);

  const bookRecords = useMemo(() => (book ? getBookRecords(book.id, records) : []), [book, records]);
  const reviews = useMemo(() => (book ? getBookReviews(book.id, allReviews) : []), [book, allReviews]);
  const lender = book ? getLender(book, users) : undefined;
  const holder = book ? getCurrentHolder(book, records, users) : undefined;

  const colors = book ? CATEGORY_COLORS[book.category] : CATEGORY_COLORS['其他'];

  const timelineEvents = useMemo(
    () =>
      bookRecords.map((r) => ({
        id: r.id,
        action: r.action,
        userId: r.userId,
        date: r.createdAt,
        extra:
          r.action === 'borrow' && r.expectedReturnDate
            ? `预计归还：${formatDate(r.expectedReturnDate, 'MM月dd日')}`
            : r.action === 'return' && r.actualReturnDate
            ? `实际归还：${formatDate(r.actualReturnDate, 'MM月dd日')}`
            : undefined,
      })),
    [bookRecords]
  );

  if (!book) {
    return (
      <div className="max-w-xl mx-auto py-20">
        <EmptyState
          icon="no-books"
          title="未找到这本书"
          description="可能已被移除或链接有误"
          action={
            <Link to="/" className="btn-primary">
              <ArrowLeft className="w-4 h-4" />
              返回书柜
            </Link>
          }
        />
      </div>
    );
  }

  const isBorrowed = book.status === 'borrowed';
  const isGifted = book.status === 'gifted';
  const isAvailable = book.status === 'available';
  const isMine = book.lenderId === currentUser.id;
  const amHolder = book.currentHolderId === currentUser.id && isBorrowed;

  const lastBorrowRecord = [...bookRecords]
    .reverse()
    .find((r) => r.action === 'borrow');
  const isOverdue =
    isBorrowed &&
    lastBorrowRecord?.expectedReturnDate &&
    daysFromNow(lastBorrowRecord.expectedReturnDate) < 0;
  const overdueDays = isOverdue
    ? Math.abs(daysFromNow(lastBorrowRecord!.expectedReturnDate!))
    : 0;

  const handleBorrow = () => {
    if (!expectedReturn) {
      toast.error('请选择预计归还日期');
      return;
    }
    borrowBook(book.id, new Date(expectedReturn).toISOString());
    toast.success(`借阅成功！请在 ${formatDate(new Date(expectedReturn).toISOString(), 'MM月dd日')} 前归还`);
    setShowBorrowModal(false);
  };

  const handleReturn = () => {
    returnBook(book.id);
    toast.success('归还成功！感谢你让这本书继续漂流🌊');
  };

  const handleClaim = () => {
    claimBook(book.id);
    toast.success(`《${book.title}》是你的啦！希望你喜欢 🎉`);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewContent.trim()) {
      toast.error('请写点评论内容');
      return;
    }
    addReview(book.id, reviewContent.trim(), reviewReason.trim() || undefined, rating);
    toast.success('评论发布成功！');
    setReviewContent('');
    setReviewReason('');
    setRating(5);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="btn-ghost !px-0">
        <ArrowLeft className="w-4 h-4" />
        返回书柜
      </button>

      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        <div className="space-y-5">
          <div className="relative group mx-auto max-w-[240px]">
            <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-accent-orange/20 via-transparent to-accent-olive/20 blur-xl" />
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-2xl ring-4 ring-white/60">
              <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
              <div className={`absolute left-0 top-0 bottom-0 w-[14%] ${colors.spine} shadow-inner`} />
            </div>
          </div>

          <div className="card-paper p-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-wood-500 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> 柜格
              </span>
              <span className="font-mono font-bold text-wood-800 bg-wood-100 px-2 py-0.5 rounded">
                {book.shelfId}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-wood-500 flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> 借阅次数
              </span>
              <span className="font-bold text-wood-800">{book.borrowCount} 次</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-wood-500 flex items-center gap-1.5">
                <MessageSquarePlus className="w-4 h-4" /> 短评
              </span>
              <span className="font-bold text-wood-800">{reviews.length} 条</span>
            </div>
            <div className="pt-2 border-t border-wood-100 text-xs text-wood-400">
              登记于 {formatDate(book.createdAt)}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-paper p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`badge ${colors.bg} ${colors.text}`}>
                    <Tag className="w-3 h-3" /> {book.category}
                  </span>
                  <span className="badge bg-wood-100 text-wood-700">成色：{book.condition}</span>
                  {isOverdue && (
                    <span className="badge bg-red-100 text-red-700 animate-breathe">
                      <AlertTriangle className="w-3 h-3" /> 逾期 {overdueDays} 天
                    </span>
                  )}
                  {!isOverdue && isBorrowed && (
                    <span className="badge bg-amber-100 text-amber-700">
                      <CalendarClock className="w-3 h-3" /> 借出中
                    </span>
                  )}
                  {isGifted && (
                    <span className="badge bg-emerald-100 text-emerald-700">
                      <Gift className="w-3 h-3" /> 已赠出
                    </span>
                  )}
                  {isAvailable && book.lendType === 'gift' && (
                    <span className="badge bg-accent-orange/10 text-accent-orange">
                      <Sparkles className="w-3 h-3" /> 可直接领取
                    </span>
                  )}
                  {isAvailable && book.lendType === 'borrow' && (
                    <span className="badge bg-accent-olive/15 text-emerald-700">
                      <BookCopy className="w-3 h-3" /> 可借阅
                    </span>
                  )}
                </div>
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-wood-800 leading-tight">
                  {book.title}
                </h1>
                <p className="mt-2 text-lg text-wood-600">
                  <span className="text-wood-400 mr-1">作者：</span>
                  <span className="font-medium">{book.author}</span>
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-5 border-t border-wood-100 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-paper-200/60">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-olive to-emerald-700 flex items-center justify-center shadow-md">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-wood-500">登记人</p>
                  <p className="font-semibold text-wood-800">
                    {lender?.nickname || '匿名'}
                    {isMine && <span className="ml-1.5 text-xs text-accent-olive">(我)</span>}
                  </p>
                </div>
              </div>
              {holder && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200/60">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
                    <HandHeart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-wood-500">当前持有人</p>
                    <p className="font-semibold text-wood-800">
                      {holder.nickname}
                      {amHolder && <span className="ml-1.5 text-xs text-accent-orange">(我)</span>}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {isAvailable && book.lendType === 'borrow' && (
                <button onClick={() => setShowBorrowModal(true)} className="btn-warm !px-6">
                  <BookCopy className="w-4 h-4" /> 我要借阅
                </button>
              )}
              {isAvailable && book.lendType === 'gift' && (
                <button onClick={handleClaim} className="btn-warm !px-6">
                  <Gift className="w-4 h-4" /> 直接带走
                </button>
              )}
              {amHolder && (
                <button onClick={handleReturn} className="btn-primary !px-6">
                  <RotateCcw className="w-4 h-4" /> 我来归还
                </button>
              )}
              {!isAvailable && !amHolder && (
                <button disabled className="btn-secondary !px-6 cursor-not-allowed">
                  {isBorrowed ? '已被借出' : '已被领取'}
                </button>
              )}
            </div>
          </div>

          <div className="card-paper p-6 md:p-8">
            <h2 className="section-title !text-xl !mb-5">流转记录</h2>
            <ActivityTimeline events={timelineEvents} />
          </div>

          <div className="card-paper p-6 md:p-8">
            <h2 className="section-title !text-xl !mb-5">
              <MessageSquarePlus className="w-5 h-5 text-wood-600" />
              短评 & 推荐
            </h2>

            <form onSubmit={handleSubmitReview} className="mb-8 p-4 rounded-xl bg-paper-200/70 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-wood-700">推荐理由（可选）</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        type="button"
                        key={n}
                        onClick={() => setRating(n)}
                        className="p-0.5 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-5 h-5 transition-colors ${
                            n <= rating ? 'fill-amber-400 text-amber-400' : 'text-wood-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="一句话推荐理由，如：文笔细腻、脑洞大开..."
                  value={reviewReason}
                  onChange={(e) => setReviewReason(e.target.value)}
                  className="input-field"
                  maxLength={30}
                />
              </div>
              <textarea
                placeholder="写下你的阅读感受吧~"
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                rows={3}
                className="input-field resize-none"
                maxLength={300}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-wood-400">
                  {reviewContent.length}/300 字
                </span>
                <button type="submit" className="btn-primary" disabled={!reviewContent.trim()}>
                  <Sparkles className="w-4 h-4" /> 发布短评
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {reviews.map((r) => {
                const u = users.find((x) => x.id === r.userId);
                return (
                  <div key={r.id} className="p-4 rounded-xl border border-wood-100 bg-white/60 hover:shadow-paper transition-shadow">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-olive to-emerald-700 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                          {u?.nickname?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-wood-800 leading-tight">
                            {u?.nickname || '匿名'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-wood-400">
                              {formatRelative(r.createdAt)}
                            </span>
                            {r.rating && (
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < r.rating! ? 'fill-amber-400 text-amber-400' : 'text-wood-200'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {r.recommendReason && (
                      <div className="mb-2">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-accent-orange/10 text-accent-orange text-xs font-medium">
                          💡 {r.recommendReason}
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-wood-700 leading-relaxed whitespace-pre-wrap">
                      {r.content}
                    </p>
                  </div>
                );
              })}
              {reviews.length === 0 && (
                <EmptyState
                  icon="no-records"
                  title="还没有短评"
                  description="成为第一个分享阅读感受的人吧"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {showBorrowModal && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div
            className="w-full max-w-md bg-paper-50 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 bg-gradient-to-br from-wood-600 to-wood-800">
              <div className="flex items-center gap-2 text-paper-100 text-sm mb-2">
                <BookCopy className="w-4 h-4" /> 办理借阅
              </div>
              <h3 className="text-2xl font-serif font-bold text-paper-50">
                《{book.title}》
              </h3>
              <p className="text-paper-100/80 text-sm mt-1">{book.author}</p>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-wood-700 mb-2 flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-accent-orange" />
                  预计归还日期
                </label>
                <input
                  type="date"
                  value={expectedReturn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setExpectedReturn(e.target.value)}
                  className="input-field"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {[7, 14, 21, 30].map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => {
                        const dt = new Date();
                        dt.setDate(dt.getDate() + d);
                        setExpectedReturn(dt.toISOString().split('T')[0]);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-paper-200 text-wood-700 hover:bg-wood-200 hover:text-wood-800 transition-colors"
                    >
                      {d} 天后
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-emerald-50 border border-emerald-200/60 p-4 text-sm text-emerald-800 space-y-1.5">
                <p className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> 温馨提示
                </p>
                <ul className="text-xs space-y-1 text-emerald-700/90 list-disc list-inside leading-relaxed">
                  <li>请按时归还，让更多人有机会阅读</li>
                  <li>爱护图书，保持书本整洁</li>
                  <li>逾期会有温和提醒，记得标记归还哦</li>
                </ul>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBorrowModal(false)}
                  className="btn-secondary flex-1"
                >
                  取消
                </button>
                <button type="button" onClick={handleBorrow} className="btn-primary flex-1">
                  确认借阅
                </button>
              </div>
            </div>
          </div>
          <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </div>
      )}
    </div>
  );
};

export default BookDetail;
