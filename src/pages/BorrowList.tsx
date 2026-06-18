import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowLeftRight, Clock, CheckCircle2, Calendar, User, RefreshCw } from 'lucide-react';
import { useStore } from '../store';
import { formatDate, daysBetween, today } from '../utils/storage';

type TabType = 'active' | 'history';

export default function BorrowList() {
  const { books, families, borrowRecords, updateOverdueStatus } = useStore();
  const [tab, setTab] = useState<TabType>('active');

  const activeRecords = borrowRecords
    .filter((r) => r.status === 'borrowed' || r.status === 'overdue')
    .sort((a, b) => a.expectedReturnDate.localeCompare(b.expectedReturnDate));

  const historyRecords = borrowRecords
    .filter((r) => r.status === 'returned')
    .sort((a, b) => (b.actualReturnDate || '').localeCompare(a.actualReturnDate || ''));

  const displayRecords = tab === 'active' ? activeRecords : historyRecords;

  const getBook = (id: string) => books.find((b) => b.id === id);
  const getFamily = (id: string) => families.find((f) => f.id === id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800 mb-1">
            借阅管理 🔄
          </h1>
          <p className="text-gray-500">
            当前借出 {activeRecords.length} 本，其中逾期 {activeRecords.filter(r => r.status === 'overdue').length} 本
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={updateOverdueStatus} className="btn-secondary !px-4">
            <RefreshCw className="w-4 h-4" />
            刷新状态
          </button>
          <Link to="/borrow/new" className="btn-primary">
            <Plus className="w-5 h-5" />
            登记借出
          </Link>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="card p-2 inline-flex gap-1">
        <button
          onClick={() => setTab('active')}
          className={`px-5 py-2.5 rounded-full font-medium transition-all ${
            tab === 'active'
              ? 'bg-orange-500 text-white shadow-soft'
              : 'text-gray-500 hover:bg-cream-100'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4 inline mr-2" />
          进行中 ({activeRecords.length})
        </button>
        <button
          onClick={() => setTab('history')}
          className={`px-5 py-2.5 rounded-full font-medium transition-all ${
            tab === 'history'
              ? 'bg-orange-500 text-white shadow-soft'
              : 'text-gray-500 hover:bg-cream-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 inline mr-2" />
          历史记录 ({historyRecords.length})
        </button>
      </div>

      {/* 记录列表 */}
      <div className="space-y-3">
        {displayRecords.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="text-6xl mb-4">{tab === 'active' ? '📚' : '📜'}</div>
            <p className="text-gray-500 text-lg">
              {tab === 'active' ? '暂无进行中的借阅' : '暂无历史借阅记录'}
            </p>
            {tab === 'active' && (
              <Link to="/borrow/new" className="btn-primary mt-4 inline-flex">
                <Plus className="w-5 h-5" />
                立即登记借出
              </Link>
            )}
          </div>
        ) : (
          displayRecords.map((record) => {
            const book = getBook(record.bookId);
            const family = getFamily(record.familyId);
            const isOverdue = record.status === 'overdue';
            const daysLate = isOverdue ? daysBetween(record.expectedReturnDate, today()) : 0;

            return (
              <div key={record.id} className="card p-4 sm:p-5 hover:shadow-hover transition-shadow">
                <div className="flex flex-col sm:flex-row gap-4">
                  {book && (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{book?.title || '未知绘本'}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{family?.name || '未知家庭'}</span>
                          <span>·</span>
                          <span>{record.childAge}岁孩子</span>
                          {record.willingToExchange && <span className="tag-mint ml-1">🤝 愿交换</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {record.status === 'returned' ? (
                          <span className="tag-mint text-sm">✓ 已归还</span>
                        ) : isOverdue ? (
                          <span className="tag-coral text-sm">⚠️ 逾期{daysLate}天</span>
                        ) : (
                          <span className="tag-orange text-sm">📖 借阅中</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mt-3">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>借出：{formatDate(record.borrowDate)}</span>
                      </div>
                      <div className={`flex items-center gap-2 ${isOverdue ? 'text-coral-600 font-medium' : 'text-gray-500'}`}>
                        <Clock className="w-4 h-4" />
                        <span>预计归还：{formatDate(record.expectedReturnDate)}</span>
                      </div>
                      {record.actualReturnDate && (
                        <div className="flex items-center gap-2 text-mint-600 font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>实际归还：{formatDate(record.actualReturnDate)}</span>
                        </div>
                      )}
                    </div>

                    {record.damageCheck && (
                      <div className="mt-3 p-3 bg-cream-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1.5">归还检查：</p>
                        <div className="flex flex-wrap gap-2">
                          {record.damageCheck.missingPages && <span className="tag-coral">缺页</span>}
                          {record.damageCheck.doodles && <span className="tag-coral">涂画</span>}
                          {record.damageCheck.tornPages && <span className="tag-coral">撕拉页</span>}
                          {record.damageCheck.stickers && <span className="tag-coral">贴纸</span>}
                          {record.damageCheck.accessories && <span className="tag-coral">附件缺失</span>}
                          {!Object.values(record.damageCheck).some(Boolean) && <span className="tag-mint">✓ 完好无损</span>}
                        </div>
                        {record.damageNotes && (
                          <p className="text-xs text-gray-500 mt-2">备注：{record.damageNotes}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {record.status !== 'returned' && (
                  <div className="mt-4 pt-4 border-t border-cream-200 flex justify-end">
                    <Link to={`/borrow/return/${record.id}`} className="btn-primary !px-5 !py-2">
                      <CheckCircle2 className="w-4 h-4" />
                      办理归还
                    </Link>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
