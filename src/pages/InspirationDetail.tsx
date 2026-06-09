import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, Trash2, Package, ArrowLeft } from 'lucide-react';
import { useJournalStore } from '@/store/useJournalStore';
import { MATERIAL_TYPE_LABELS } from '@/types';
import type { MaterialType } from '@/types';

const TYPE_BADGE: Record<MaterialType, string> = {
  sticker: 'badge-sticker',
  tape: 'badge-tape',
  memo: 'badge-memo',
  stamp: 'badge-stamp',
};

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

export default function InspirationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { inspirations, inspirationItems, materials, deleteInspiration } = useJournalStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const inspiration = inspirations.find((i) => i.id === id);

  if (!inspiration) {
    return (
      <div className="page-container text-center py-20">
        <Sparkles size={48} className="mx-auto text-brown-muted/50 mb-4" />
        <p className="text-brown-muted text-lg">未找到该搭配灵感</p>
        <button
          onClick={() => navigate('/inspirations')}
          className="btn-primary mt-4 inline-flex items-center gap-1.5"
        >
          <ArrowLeft size={16} />
          返回列表
        </button>
      </div>
    );
  }

  const items = inspirationItems.filter((ii) => ii.inspirationId === inspiration.id);
  const inspirationMaterials = items
    .map((ii) => materials.find((m) => m.id === ii.materialId))
    .filter(Boolean) as typeof materials;

  const handleDelete = () => {
    deleteInspiration(inspiration.id);
    navigate('/inspirations');
  };

  return (
    <div className="page-container">
      <div className="card-paper rounded-2xl overflow-hidden mb-6">
        <div
          className={`h-48 ${
            inspiration.coverPhoto
              ? ''
              : `bg-gradient-to-br ${getThemeGradient(inspiration.theme)}`
          } flex items-center justify-center relative`}
        >
          {inspiration.coverPhoto ? (
            <img
              src={inspiration.coverPhoto}
              alt={inspiration.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Sparkles size={48} className="text-white/70" />
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-serif text-2xl font-semibold text-brown-dark">
                {inspiration.name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                {inspiration.theme && (
                  <span className="badge-sticker">{inspiration.theme}</span>
                )}
                <span className="text-brown-muted text-sm flex items-center gap-1">
                  <Package size={14} />
                  {items.length} 个素材
                </span>
              </div>
            </div>
          </div>

          {inspiration.note && (
            <>
              <div className="stitch-line my-4" />
              <p className="text-brown/80 text-sm whitespace-pre-wrap">{inspiration.note}</p>
            </>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h2 className="section-title">搭配素材</h2>
      </div>

      {inspirationMaterials.length === 0 ? (
        <div className="card-paper rounded-2xl p-8 text-center">
          <Package size={36} className="mx-auto text-brown-muted/40 mb-3" />
          <p className="text-brown-muted/70 text-sm">此搭配暂无素材</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {inspirationMaterials.map((material) => (
            <div key={material.id} className="card-paper rounded-xl overflow-hidden">
              <div className="h-24 bg-cream-dark/30 flex items-center justify-center">
                {material.photo ? (
                  <img
                    src={material.photo}
                    alt={material.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package size={24} className="text-brown-muted/40" />
                )}
              </div>
              <div className="p-2.5">
                <p className="text-sm text-brown-dark truncate font-medium">
                  {material.name}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className={`${TYPE_BADGE[material.type]} text-[10px]`}>
                    {MATERIAL_TYPE_LABELS[material.type]}
                  </span>
                  <span className="text-brown-muted text-xs">
                    库存 {material.quantity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="stitch-line mt-8 mb-4" />

      {!showDeleteConfirm ? (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-1.5 text-coral-deep/70 hover:text-coral-deep transition-colors text-sm"
        >
          <Trash2 size={14} />
          删除搭配
        </button>
      ) : (
        <div className="card-paper rounded-xl p-4 flex items-center justify-between">
          <p className="text-brown-dark text-sm">确定要删除此搭配灵感吗？</p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="btn-secondary text-xs py-1.5"
            >
              取消
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 rounded-lg bg-coral text-white text-xs font-medium hover:bg-coral-deep transition-all"
            >
              确认删除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
