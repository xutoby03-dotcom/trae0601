import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookPlus, Save, RefreshCw, Gift, BookCheck, Sparkles, MapPin } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { ensureCurrentUser, generateShelfId } from '@/utils/bookUtils';
import { toast } from '@/components/common/Toast';
import FileUpload from '@/components/forms/FileUpload';
import { BOOK_CATEGORIES, BOOK_CONDITIONS, CATEGORY_COLORS } from '@/types';
import type { BookCategory, BookCondition, LendType } from '@/types';

export const RegisterBook = () => {
  const navigate = useNavigate();
  const addBook = useAppStore((s) => s.addBook);
  const state = useAppStore.getState();
  const currentUser = ensureCurrentUser(state);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<BookCategory>('文学小说');
  const [condition, setCondition] = useState<BookCondition>('九成新');
  const [shelfId, setShelfId] = useState(generateShelfId());
  const [coverUrl, setCoverUrl] = useState('');
  const [lendType, setLendType] = useState<LendType>('borrow');
  const [submitting, setSubmitting] = useState(false);

  const validate = (): string | null => {
    if (!title.trim()) return '请填写书名';
    if (!author.trim()) return '请填写作者';
    if (!shelfId.trim()) return '请填写柜格编号';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));

    const book = addBook({
      title: title.trim(),
      author: author.trim(),
      category,
      condition,
      shelfId: shelfId.trim().toUpperCase(),
      coverUrl: coverUrl || getDefaultCover(),
      lenderId: currentUser.id,
      lendType,
    });
    setSubmitting(false);
    toast.success(`《${book.title}》已登记入柜！`);
    setTimeout(() => navigate(`/book/${book.id}`), 700);
  };

  const getDefaultCover = () => {
    const colors = CATEGORY_COLORS[category];
    const spineColor = colors.spine.replace('bg-', '');
    const colorMap: Record<string, string> = {
      'rose-600': '#E11D48', 'sky-600': '#0284C7', 'amber-700': '#B45309',
      'emerald-600': '#059669', 'purple-600': '#7C3AED', 'slate-600': '#475569',
      'teal-600': '#0D9488', 'pink-500': '#DB2777', 'wood-600': '#7D5C37',
    };
    const color = colorMap[spineColor] || '#5D4037';
    const t = title.trim() || '未命名';
    const a = author.trim() || '佚名';
    const titleShort = t.length > 5 ? t.slice(0, 5) + '…' : t;
    const authorShort = a.length > 6 ? a.slice(0, 6) : a;
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="160" height="220" viewBox="0 0 160 220">
        <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.75" />
        </linearGradient></defs>
        <rect width="160" height="220" fill="url(#g)"/>
        <rect x="8" y="8" width="144" height="204" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
        <rect x="0" y="0" width="10" height="220" fill="rgba(0,0,0,0.2)"/>
        <text x="24" y="90" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#FFF8E1" writing-mode="tb">${titleShort}</text>
        <text x="120" y="190" font-family="Georgia, serif" font-size="11" fill="rgba(255,248,225,0.85)" transform="rotate(90, 120, 190)">${authorShort}</text>
      </svg>`;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-orange/10 text-accent-orange text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          分享一本好书
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-wood-800 mb-2">
          登记新书入柜
        </h1>
        <p className="text-wood-500">填写图书信息，放入漂流柜，开启它的旅程</p>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_260px] gap-6">
        <div className="card-paper p-6 md:p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-wood-700 mb-2">
                书名 <span className="text-accent-brick">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="如：百年孤独"
                className="input-field !text-base"
                autoFocus
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-wood-700 mb-2">
                作者 <span className="text-accent-brick">*</span>
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="如：加西亚·马尔克斯"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-wood-700 mb-2">图书类别</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BookCategory)}
                className="input-field appearance-none bg-white pr-10 cursor-pointer"
              >
                {BOOK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-wood-700 mb-2">成色</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as BookCondition)}
                className="input-field appearance-none bg-white pr-10 cursor-pointer"
              >
                {BOOK_CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-wood-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-wood-500" />
                柜格编号
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shelfId}
                  onChange={(e) => setShelfId(e.target.value)}
                  placeholder="A-01"
                  className="input-field font-mono uppercase tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShelfId(generateShelfId())}
                  className="btn-secondary !px-3"
                  title="随机生成"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-1 text-xs text-wood-400">参考格式：行字母(A-E)+柜号(01-12)</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-wood-700 mb-2">漂流方式</label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-paper-200/70">
                {([
                  { k: 'borrow', label: '可借阅', desc: '看完需归还', icon: BookCheck },
                  { k: 'gift', label: '赠送', desc: '直接带走', icon: Gift },
                ] as const).map((opt) => {
                  const selected = lendType === opt.k;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.k}
                      type="button"
                      onClick={() => setLendType(opt.k)}
                      className={`relative flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg transition-all duration-200
                        ${selected
                          ? 'bg-white shadow-md text-wood-800 scale-[1.02]'
                          : 'text-wood-500 hover:text-wood-700'}`}
                    >
                      <Icon className={`w-4 h-4 ${selected ? 'text-accent-orange' : ''}`} />
                      <span className="text-sm font-semibold">{opt.label}</span>
                      <span className="text-[10px] opacity-70">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 border-t border-wood-100">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary order-2 sm:order-1"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary !px-6 order-1 sm:order-2"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> 登记中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> 确认登记入柜
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card-paper p-5">
            <label className="block text-sm font-semibold text-wood-700 mb-3 flex items-center gap-2">
              <BookPlus className="w-4 h-4 text-accent-orange" />
              封面照片
            </label>
            <div className="flex flex-col items-center">
              <FileUpload
                value={coverUrl}
                onChange={setCoverUrl}
                onRemove={() => setCoverUrl('')}
              />
              <p className="mt-3 text-[11px] text-wood-500 text-center leading-relaxed">
                不上传将根据类别自动生成默认封面
              </p>
            </div>
          </div>

          <div className="card-paper p-5 space-y-3 text-sm">
            <h4 className="font-semibold text-wood-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-orange" />
              小贴士
            </h4>
            <ul className="space-y-2 text-wood-600 text-xs leading-relaxed">
              <li className="flex gap-2">
                <span className="text-accent-olive mt-0.5">✓</span>
                真实填写成色，方便他人判断
              </li>
              <li className="flex gap-2">
                <span className="text-accent-olive mt-0.5">✓</span>
                柜格编号请与实际放置位置一致
              </li>
              <li className="flex gap-2">
                <span className="text-accent-olive mt-0.5">✓</span>
                选择赠送 = 这本书可以直接被人带走
              </li>
              <li className="flex gap-2">
                <span className="text-accent-olive mt-0.5">✓</span>
                他人借阅后记得及时归还哦
              </li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterBook;
