import { useState } from 'react';
import { X, Plus, Upload, Eye, Star, Clock, Play, Film } from 'lucide-react';
import { useMovieStore } from '../store/useMovieStore';
import { cn } from '../lib/utils';

const GENRE_OPTIONS = [
  '动作', '喜剧', '爱情', '科幻', '悬疑', '恐怖', '惊悚',
  '动画', '纪录片', '剧情', '冒险', '传记', '战争', '奇幻',
];

const PLATFORM_OPTIONS = [
  'Netflix', 'Disney+', 'HBO Max', 'Prime Video',
  '爱奇艺', '腾讯视频', '优酷', 'B站',
  '影院', '蓝光碟', 'Apple TV+', '其他',
];

export default function AddMovieModal() {
  const { showAddModal, setShowAddModal, addMovie, currentUserId } = useMovieStore();

  const [form, setForm] = useState({
    title: '',
    genres: [] as string[],
    duration: 120,
    platform: 'Netflix',
    rating: 8.0,
    trailerUrl: '',
    posterUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!showAddModal) return null;

  const toggleGenre = (genre: string) => {
    setForm((f) => ({
      ...f,
      genres: f.genres.includes(genre)
        ? f.genres.filter((g) => g !== genre)
        : [...f.genres, genre],
    }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = '请输入电影名称';
    if (form.genres.length === 0) e.genres = '至少选择一个类型';
    if (form.duration < 1 || form.duration > 500) e.duration = '时长应在1-500分钟';
    if (form.rating < 0 || form.rating > 10) e.rating = '评分应在0-10之间';
    if (!form.posterUrl.trim()) e.posterUrl = '请输入海报图片链接';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    addMovie({
      title: form.title.trim(),
      genres: form.genres,
      duration: Number(form.duration),
      platform: form.platform,
      rating: Number(form.rating),
      trailerUrl: form.trailerUrl.trim(),
      posterUrl: form.posterUrl.trim(),
      addedBy: currentUserId,
    });
    setForm({
      title: '',
      genres: [],
      duration: 120,
      platform: 'Netflix',
      rating: 8.0,
      trailerUrl: '',
      posterUrl: '',
    });
    setErrors({});
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={() => setShowAddModal(false)}
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-[#1A0B2E] border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'scaleIn 0.3s ease-out' }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-b from-[#1A0B2E] via-[#1A0B2E]/95 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-amber-400 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                添加新电影
              </h2>
              <p className="text-xs text-white/40">把想看的电影加进片单吧~</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(false)}
            className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">
                  <Film className="w-4 h-4 inline mr-1.5" />
                  电影名称 *
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="例如：盗梦空间"
                  className={cn(
                    'w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-white/30 text-sm',
                    'focus:outline-none focus:border-pink-500/50 focus:bg-white/[0.07] transition-all',
                    errors.title ? 'border-rose-500/50' : 'border-white/10'
                  )}
                />
                {errors.title && <p className="mt-1 text-xs text-rose-400">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">
                  类型标签 * {form.genres.length > 0 && <span className="text-pink-400">({form.genres.length})</span>}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {GENRE_OPTIONS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGenre(g)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95',
                        form.genres.includes(g)
                          ? 'bg-pink-500/20 border-pink-500/50 text-pink-300 shadow-[0_0_15px_-3px_rgba(236,72,153,0.4)]'
                          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white/80'
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                {errors.genres && <p className="mt-2 text-xs text-rose-400">{errors.genres}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">
                    <Clock className="w-4 h-4 inline mr-1.5" />
                    时长 (分钟)
                  </label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                    min={1}
                    max={500}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-white/30 text-sm',
                      'focus:outline-none focus:border-pink-500/50 focus:bg-white/[0.07] transition-all',
                      errors.duration ? 'border-rose-500/50' : 'border-white/10'
                    )}
                  />
                  {errors.duration && <p className="mt-1 text-xs text-rose-400">{errors.duration}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">
                    <Star className="w-4 h-4 inline mr-1.5 text-amber-400" />
                    豆瓣评分
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    min={0}
                    max={10}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-white/30 text-sm',
                      'focus:outline-none focus:border-pink-500/50 focus:bg-white/[0.07] transition-all',
                      errors.rating ? 'border-rose-500/50' : 'border-white/10'
                    )}
                  />
                  {errors.rating && <p className="mt-1 text-xs text-rose-400">{errors.rating}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">
                  播放平台
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PLATFORM_OPTIONS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm({ ...form, platform: p })}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all active:scale-95',
                        form.platform === p
                          ? 'bg-amber-400/20 border-amber-400/50 text-amber-300'
                          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white/80'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">
                  <Play className="w-4 h-4 inline mr-1.5" />
                  预告片链接 (可选)
                </label>
                <input
                  value={form.trailerUrl}
                  onChange={(e) => setForm({ ...form, trailerUrl: e.target.value })}
                  placeholder="YouTube / B站链接"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-pink-500/50 focus:bg-white/[0.07] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">
                  <Upload className="w-4 h-4 inline mr-1.5" />
                  海报图片链接 *
                </label>
                <input
                  value={form.posterUrl}
                  onChange={(e) => setForm({ ...form, posterUrl: e.target.value })}
                  placeholder="https://..."
                  className={cn(
                    'w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-white/30 text-sm',
                    'focus:outline-none focus:border-pink-500/50 focus:bg-white/[0.07] transition-all',
                    errors.posterUrl ? 'border-rose-500/50' : 'border-white/10'
                  )}
                />
                {errors.posterUrl && <p className="mt-1 text-xs text-rose-400">{errors.posterUrl}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                <Eye className="w-4 h-4 inline mr-1.5" />
                实时预览
              </label>
              <div className="sticky top-0 rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
                <div className="aspect-[2/3] relative">
                  {form.posterUrl ? (
                    <img
                      src={form.posterUrl}
                      alt="预览"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-amber-400/10 text-white/30">
                      <Film className="w-16 h-16 mb-3 opacity-50" />
                      <p className="text-sm">海报预览</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A0B2E] via-transparent to-transparent" />
                </div>
                <div className="p-4 space-y-3">
                  <h3
                    className="text-lg font-bold text-white truncate"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {form.title || '电影名称'}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {form.genres.length > 0 ? (
                      form.genres.map((g) => (
                        <span
                          key={g}
                          className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-white/70"
                        >
                          {g}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-white/30">未选择类型</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span>{form.duration}分钟</span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {form.rating.toFixed(1)}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 text-xs">
                      {form.platform}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-3 p-6 border-t border-white/10 bg-gradient-to-t from-[#1A0B2E] via-[#1A0B2E]/95 to-transparent">
          <button
            onClick={() => setShowAddModal(false)}
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-amber-400 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 inline mr-1.5" />
            添加到片单
          </button>
        </div>
      </div>
    </div>
  );
}
