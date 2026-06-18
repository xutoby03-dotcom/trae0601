import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, User, Calendar, Handshake, BookOpen } from 'lucide-react';
import { useStore } from '../store';
import { today, addDays } from '../utils/storage';

export default function BorrowForm() {
  const navigate = useNavigate();
  const { books, families, selectedFamilyId, createBorrowRecord, addFamily, setSelectedFamily } = useStore();

  const availableBooks = books.filter((b) => b.status === 'available');

  const [form, setForm] = useState({
    bookId: availableBooks[0]?.id || '',
    familyId: selectedFamilyId || families[0]?.id || '',
    childAge: families.find((f) => f.id === selectedFamilyId)?.childAge || 4,
    borrowDate: today(),
    expectedReturnDate: addDays(today(), 14),
    willingToExchange: false,
  });

  const [showNewFamily, setShowNewFamily] = useState(false);
  const [newFamily, setNewFamily] = useState({ name: '', childAge: 4, contact: '' });

  const selectedFamily = families.find((f) => f.id === form.familyId);
  const selectedBook = books.find((b) => b.id === form.bookId);

  const handleAddFamily = () => {
    if (!newFamily.name.trim()) return;
    const created = addFamily(newFamily);
    setForm((prev) => ({ ...prev, familyId: created.id, childAge: created.childAge }));
    setSelectedFamily(created.id);
    setShowNewFamily(false);
    setNewFamily({ name: '', childAge: 4, contact: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.bookId || !form.familyId) return;
    createBorrowRecord(form);
    navigate('/borrow');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <Link to="/borrow" className="btn-ghost -ml-2">
        <ArrowLeft className="w-5 h-5" />
        返回借阅管理
      </Link>

      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-display font-bold text-gray-800 mb-6">
          📖 登记借出
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 选择绘本 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-3">
              <BookOpen className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              选择绘本
            </label>
            {availableBooks.length === 0 ? (
              <div className="p-6 text-center bg-cream-50 rounded-2xl">
                <p className="text-gray-500">暂无可借的绘本</p>
                <Link to="/books/new" className="btn-primary mt-3 inline-flex text-sm">
                  先去添加绘本
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-80 overflow-y-auto p-2">
                {availableBooks.map((book) => {
                  const selected = form.bookId === book.id;
                  return (
                    <button
                      key={book.id}
                      type="button"
                      onClick={() => setForm({ ...form, bookId: book.id })}
                      className={`p-2 rounded-2xl border-2 transition-all text-left ${
                        selected
                          ? 'border-orange-500 bg-orange-50 shadow-soft'
                          : 'border-transparent bg-cream-50 hover:border-orange-300'
                      }`}
                    >
                      <img src={book.coverUrl} alt={book.title} className="w-full aspect-square rounded-xl object-cover mb-2" />
                      <p className="text-xs font-medium text-gray-700 truncate">{book.title}</p>
                      <p className="text-xs text-gray-400">{book.ageRange}</p>
                    </button>
                  );
                })}
              </div>
            )}
            {selectedBook && (
              <p className="text-sm text-gray-500 mt-2">
                已选：<span className="font-medium text-orange-600">{selectedBook.title}</span>
              </p>
            )}
          </div>

          {/* 选择家庭 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-600">
                <User className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                借阅家庭
              </label>
              <button
                type="button"
                onClick={() => setShowNewFamily(!showNewFamily)}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium"
              >
                + 添加家庭
              </button>
            </div>

            {showNewFamily && (
              <div className="p-4 bg-orange-50 rounded-2xl mb-4 animate-slide-up">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="家庭名称"
                    value={newFamily.name}
                    onChange={(e) => setNewFamily({ ...newFamily, name: e.target.value })}
                    className="input-field text-sm"
                  />
                  <input
                    type="number"
                    placeholder="孩子年龄"
                    min="0"
                    max="15"
                    value={newFamily.childAge}
                    onChange={(e) => setNewFamily({ ...newFamily, childAge: parseInt(e.target.value) || 0 })}
                    className="input-field text-sm"
                  />
                  <input
                    type="text"
                    placeholder="联系方式"
                    value={newFamily.contact}
                    onChange={(e) => setNewFamily({ ...newFamily, contact: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <button type="button" onClick={handleAddFamily} className="btn-primary text-sm !py-2 !px-4">
                  确认添加
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {families.map((family) => {
                const selected = form.familyId === family.id;
                return (
                  <button
                    key={family.id}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, familyId: family.id, childAge: family.childAge });
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      selected
                        ? 'border-orange-500 bg-orange-50 shadow-soft'
                        : 'border-cream-200 bg-cream-50 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">👨‍👩‍👧</span>
                      <span className="font-semibold text-gray-800">{family.name}</span>
                    </div>
                    <p className="text-xs text-gray-500">孩子 {family.childAge} 岁</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{family.contact}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 借阅信息 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                <Calendar className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                借出日期
              </label>
              <input
                type="date"
                value={form.borrowDate}
                onChange={(e) => setForm({ ...form, borrowDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                <Calendar className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                预计归还
              </label>
              <input
                type="date"
                value={form.expectedReturnDate}
                onChange={(e) => setForm({ ...form, expectedReturnDate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">孩子年龄</label>
            <input
              type="number"
              min="0"
              max="15"
              value={form.childAge}
              onChange={(e) => setForm({ ...form, childAge: parseInt(e.target.value) || 0 })}
              className="input-field max-w-xs"
            />
            <p className="text-xs text-gray-400 mt-1">
              {selectedFamily ? `默认使用 ${selectedFamily.name} 的孩子年龄` : '用于推荐匹配'}
            </p>
          </div>

          {/* 交换意愿 */}
          <div className="flex items-center justify-between p-4 bg-cream-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-mint-400/20 flex items-center justify-center text-xl">
                <Handshake className="w-5 h-5 text-mint-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-700">愿意交换绘本</p>
                <p className="text-xs text-gray-400">该家庭也有绘本可以分享给其他家庭</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, willingToExchange: !form.willingToExchange })}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                form.willingToExchange ? 'bg-mint-500' : 'bg-gray-300'
              }`}
            >
              <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                form.willingToExchange ? 'translate-x-6' : ''
              }`} />
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-cream-200">
            <Link to="/borrow" className="btn-secondary">取消</Link>
            <button
              type="submit"
              className="btn-primary"
              disabled={!form.bookId || !form.familyId}
            >
              <Save className="w-5 h-5" />
              确认借出
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
