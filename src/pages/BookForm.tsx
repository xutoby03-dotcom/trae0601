import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Image as ImageIcon } from 'lucide-react';
import { useStore } from '../store';
import { AGE_RANGES, THEMES } from '../types';
import type { Book } from '../types';

const defaultCover = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=colorful%20children%20picture%20book%20cover%20cute%20animals%20illustration%20warm%20tones&image_size=square';

export default function BookForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { books, addBook, updateBook, deleteBook } = useStore();
  const isEdit = !!id;
  const existingBook = books.find((b) => b.id === id);

  const [form, setForm] = useState<Omit<Book, 'id' | 'createdAt'>>({
    title: '',
    ageRange: AGE_RANGES[1],
    themes: [],
    pages: 32,
    hasMechanism: false,
    damageLocation: '',
    coverUrl: defaultCover,
    status: 'available',
  });

  useEffect(() => {
    if (existingBook) {
      const { id: _id, createdAt: _c, ...rest } = existingBook;
      setForm(rest);
    }
  }, [existingBook]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    if (isEdit && id) {
      updateBook(id, form);
    } else {
      addBook(form);
    }
    navigate('/books');
  };

  const toggleTheme = (theme: string) => {
    setForm((f) => ({
      ...f,
      themes: f.themes.includes(theme)
        ? f.themes.filter((t) => t !== theme)
        : [...f.themes, theme],
    }));
  };

  const handleDelete = () => {
    if (!id) return;
    if (confirm('确定要删除这本绘本吗？')) {
      deleteBook(id);
      navigate('/books');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link to="/books" className="btn-ghost -ml-2">
          <ArrowLeft className="w-5 h-5" />
          返回列表
        </Link>
        {isEdit && (
          <button onClick={handleDelete} className="btn-ghost text-coral-500 hover:!bg-coral-50">
            <Trash2 className="w-5 h-5" />
            删除
          </button>
        )}
      </div>

      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-display font-bold text-gray-800 mb-6">
          {isEdit ? '✏️ 编辑绘本' : '➕ 新增绘本'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 封面预览 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">封面预览</label>
              <div className="aspect-square rounded-2xl overflow-hidden bg-cream-100 border-2 border-cream-200">
                <img
                  src={form.coverUrl || defaultCover}
                  alt="封面预览"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = defaultCover; }}
                />
              </div>
            </div>
            <div className="sm:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">封面图片 URL</label>
                <div className="relative">
                  <ImageIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    value={form.coverUrl}
                    onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
                    className="input-field pl-12"
                    placeholder="粘贴图片链接..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  书名 <span className="text-coral-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input-field text-lg font-medium"
                  placeholder="请输入绘本名称"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">年龄段</label>
                  <select
                    value={form.ageRange}
                    onChange={(e) => setForm({ ...form, ageRange: e.target.value })}
                    className="input-field"
                  >
                    {AGE_RANGES.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">页数</label>
                  <input
                    type="number"
                    min="1"
                    value={form.pages}
                    onChange={(e) => setForm({ ...form, pages: parseInt(e.target.value) || 0 })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">状态</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as Book['status'] })}
                  className="input-field"
                >
                  <option value="available">可借 ✅</option>
                  <option value="borrowed">借出中 📖</option>
                  <option value="damaged">破损待修 🔧</option>
                </select>
              </div>
            </div>
          </div>

          {/* 机关书开关 */}
          <div className="flex items-center justify-between p-4 bg-cream-50 rounded-2xl">
            <div>
              <p className="font-semibold text-gray-700">🎲 机关书</p>
              <p className="text-sm text-gray-400">翻翻书、立体书、推拉书等带互动机关</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, hasMechanism: !form.hasMechanism })}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                form.hasMechanism ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                form.hasMechanism ? 'translate-x-6' : ''
              }`} />
            </button>
          </div>

          {/* 主题标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-3">主题标签</label>
            <div className="flex flex-wrap gap-2">
              {THEMES.map((theme) => {
                const selected = form.themes.includes(theme);
                return (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => toggleTheme(theme)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selected
                        ? 'bg-lavender-500 text-white shadow-soft'
                        : 'bg-cream-100 text-gray-600 hover:bg-cream-200'
                    }`}
                  >
                    {theme}
                  </button>
                );
              })}
            </div>
            {form.themes.length === 0 && (
              <p className="text-sm text-gray-400 mt-2">请选择至少一个主题标签</p>
            )}
          </div>

          {/* 破损情况 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">破损位置描述</label>
            <textarea
              rows={3}
              value={form.damageLocation}
              onChange={(e) => setForm({ ...form, damageLocation: e.target.value })}
              className="input-field resize-none"
              placeholder="如无破损请留空，例如：封面右下角折痕、第12页有涂鸦..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-cream-200">
            <Link to="/books" className="btn-secondary">取消</Link>
            <button type="submit" className="btn-primary">
              <Save className="w-5 h-5" />
              {isEdit ? '保存修改' : '添加绘本'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
