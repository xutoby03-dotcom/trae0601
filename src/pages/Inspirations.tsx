import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Plus, Trash2, Package } from 'lucide-react';
import { useJournalStore } from '@/store/useJournalStore';

const THEME_GRADIENTS: Record<string, string> = {
  '秋日咖啡': 'from-amber-200 to-orange-300',
  '复古花园': 'from-pink-soft to-mint',
  '海洋微风': 'from-sky-200 to-cyan-300',
  '森林漫步': 'from-mint to-green-300',
  '甜蜜点心': 'from-pink-soft to-coral-light',
  '星空物语': 'from-indigo-200 to-purple-300',
};

function getThemeGradient(theme: string): string {
  if (THEME_GRADIENTS[theme]) return THEME_GRADIENTS[theme];
  const gradients = Object.values(THEME_GRADIENTS);
  let hash = 0;
  for (let i = 0; i < theme.length; i++) {
    hash = theme.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export default function Inspirations() {
  const { inspirations, inspirationItems, deleteInspiration } = useJournalStore();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    deleteInspiration(id);
    setDeleteTarget(null);
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">搭配灵感</h1>
        <Link to="/inspirations/add" className="btn-primary flex items-center gap-1.5">
          <Plus size={16} />
          创建搭配
        </Link>
      </div>

      {inspirations.length === 0 ? (
        <div className="card-paper rounded-2xl p-12 text-center">
          <Sparkles size={48} className="mx-auto text-brown-muted/50 mb-4" />
          <p className="text-brown-muted text-lg mb-2">还没有搭配灵感</p>
          <p className="text-brown-muted/70 text-sm mb-6">创建你的第一个搭配，将喜欢的素材组合在一起</p>
          <Link to="/inspirations/add" className="btn-primary inline-flex items-center gap-1.5">
            <Plus size={16} />
            创建搭配
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {inspirations.map((insp) => {
            const materialCount = inspirationItems.filter(
              (ii) => ii.inspirationId === insp.id
            ).length;

            return (
              <div key={insp.id} className="relative group">
                <Link to={`/inspirations/${insp.id}`}>
                  <div className="card-paper rounded-2xl overflow-hidden transition-all">
                    <div
                      className={`h-32 ${
                        insp.coverPhoto
                          ? ''
                          : `bg-gradient-to-br ${getThemeGradient(insp.theme)}`
                      } flex items-center justify-center`}
                    >
                      {insp.coverPhoto ? (
                        <img
                          src={insp.coverPhoto}
                          alt={insp.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Sparkles size={32} className="text-white/70" />
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-serif font-semibold text-brown-dark text-sm truncate">
                        {insp.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="badge-sticker text-[10px]">{insp.theme}</span>
                        <span className="text-brown-muted text-xs flex items-center gap-0.5">
                          <Package size={10} />
                          {materialCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteTarget(insp.id);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-coral-light text-brown-muted hover:text-coral-deep"
                >
                  <Trash2 size={13} />
                </button>

                {deleteTarget === insp.id && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-2 z-10">
                    <p className="text-brown-dark text-sm font-medium">确定删除此搭配？</p>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteTarget(null);
                        }}
                        className="btn-secondary text-xs py-1 px-3"
                      >
                        取消
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(insp.id);
                        }}
                        className="px-3 py-1 rounded-lg bg-coral text-white text-xs font-medium hover:bg-coral-deep transition-all"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
