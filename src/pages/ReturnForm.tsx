import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, BookOpen, User, Calendar } from 'lucide-react';
import { useStore } from '../store';
import DamageForm from '../components/DamageForm';
import type { DamageCheck } from '../types';
import { formatDate, daysBetween, today } from '../utils/storage';

export default function ReturnForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { borrowRecords, books, families, returnBook } = useStore();

  const record = borrowRecords.find((r) => r.id === id);
  const book = books.find((b) => b.id === record?.bookId);
  const family = families.find((f) => f.id === record?.familyId);

  const [damageCheck, setDamageCheck] = useState<DamageCheck>({
    missingPages: false,
    doodles: false,
    tornPages: false,
    stickers: false,
    accessories: false,
  });
  const [damageNotes, setDamageNotes] = useState('');

  if (!record || !book) {
    return (
      <div className="card p-16 text-center">
        <div className="text-5xl mb-4">❓</div>
        <p className="text-gray-500 mb-4">未找到该借阅记录</p>
        <Link to="/borrow" className="btn-primary">返回借阅管理</Link>
      </div>
    );
  }

  const isOverdue = record.expectedReturnDate < today();
  const daysLate = isOverdue ? daysBetween(record.expectedReturnDate, today()) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    returnBook(record.id, damageCheck, damageNotes);
    navigate('/borrow');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <Link to="/borrow" className="btn-ghost -ml-2">
        <ArrowLeft className="w-5 h-5" />
        返回借阅管理
      </Link>

      {/* 借阅信息卡片 */}
      <div className="card p-6 bg-gradient-to-br from-orange-50 to-cream-50">
        <h1 className="text-2xl font-display font-bold text-gray-800 mb-5">
          ✅ 办理归还
        </h1>

        <div className="flex flex-col sm:flex-row gap-5">
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-28 h-28 rounded-2xl object-cover shrink-0 shadow-card"
          />
          <div className="flex-1 space-y-2">
            <h2 className="text-xl font-bold text-gray-800">{book.title}</h2>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-gray-400" />
                {family?.name || '未知家庭'} · {record.childAge}岁
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                借出：{formatDate(record.borrowDate)}
              </div>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              <span className="text-gray-500">
                预计归还：{formatDate(record.expectedReturnDate)}
              </span>
              {isOverdue ? (
                <span className="tag-coral">⚠️ 逾期 {daysLate} 天</span>
              ) : (
                <span className="tag-mint">✓ 按时归还</span>
              )}
            </div>
            <div className="pt-2">
              {record.willingToExchange && <span className="tag-mint mr-2">🤝 愿交换</span>}
              <span className="tag">{book.ageRange}</span>
              {book.themes.slice(0, 2).map((t) => (
                <span key={t} className="tag ml-1">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 损坏检查 */}
      <div className="card p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-coral-400/20 flex items-center justify-center text-xl">
            🔍
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">归还检查</h3>
            <p className="text-sm text-gray-400">请仔细检查绘本状态，勾选存在的问题</p>
          </div>
        </div>

        {/* 档案信息提示 */}
        <div className="mb-6 p-4 rounded-2xl bg-cream-50 border border-cream-200">
          <p className="text-sm font-semibold text-gray-700 mb-3">📋 档案登记信息（供核对参考）</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 w-20 shrink-0">机关书：</span>
              {book.hasMechanism ? (
                <span className="tag-orange">🎲 有机关，注意检查翻翻/立体/推拉结构</span>
              ) : (
                <span className="text-gray-400">无机关</span>
              )}
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-gray-500 w-20 shrink-0 pt-0.5">原有破损：</span>
              {book.damageLocation.trim() ? (
                <span className="text-coral-600 font-medium">⚠️ {book.damageLocation.trim()}</span>
              ) : (
                <span className="text-mint-600">✓ 档案里暂时没登记破损</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 w-20 shrink-0">页数：</span>
              <span className="text-gray-700">{book.pages} 页（请核对是否缺页）</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <DamageForm
            value={damageCheck}
            onChange={setDamageCheck}
            notes={damageNotes}
            onNotesChange={setDamageNotes}
          />

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-cream-200">
            <Link to="/borrow" className="btn-secondary">取消</Link>
            <button type="submit" className="btn-primary">
              <Save className="w-5 h-5" />
              确认归还
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
