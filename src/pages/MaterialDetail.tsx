import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, Package, Tag, Building, Palette, Hash, DollarSign, MapPin, AlertTriangle } from 'lucide-react';
import { useJournalStore } from '@/store/useJournalStore';
import { MATERIAL_TYPE_LABELS } from '@/types';
import type { MaterialType } from '@/types';

const BADGE_CLASS: Record<MaterialType, string> = {
  sticker: 'badge-sticker',
  tape: 'badge-tape',
  memo: 'badge-memo',
  stamp: 'badge-stamp',
};

export default function MaterialDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { materials, usageItems, deleteMaterial } = useJournalStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const material = materials.find((m) => m.id === id);

  if (!material) {
    return (
      <div className="page-container flex flex-col items-center justify-center py-20">
        <Package size={48} className="text-brown-muted/25 mb-3" />
        <p className="font-serif text-lg text-brown-muted">未找到该素材</p>
        <Link to="/materials" className="btn-primary mt-4">
          返回素材列表
        </Link>
      </div>
    );
  }

  const usageCount = usageItems
    .filter((ui) => ui.materialId === material.id)
    .reduce((sum, ui) => sum + ui.quantityUsed, 0);

  const handleDelete = () => {
    deleteMaterial(material.id);
    navigate('/materials');
  };

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/materials')} className="text-brown-muted hover:text-brown-dark transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="page-title mb-0">素材详情</h1>
      </div>

      <div className="card-paper rounded-xl overflow-hidden max-w-lg mx-auto">
        <div className="aspect-[4/3] bg-cream-dark/30 relative">
          {material.photo ? (
            <img
              src={material.photo}
              alt={material.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={64} className="text-brown-muted/20" />
            </div>
          )}
          <span className={`absolute top-3 right-3 ${BADGE_CLASS[material.type]}`}>
            {MATERIAL_TYPE_LABELS[material.type]}
          </span>
        </div>

        <div className="p-5">
          <h2 className="font-serif text-xl font-semibold text-brown-dark">{material.name}</h2>

          <div className="stitch-line my-4" />

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Tag size={16} className="text-brown-muted shrink-0" />
              <span className="text-sm text-brown-muted w-16">类型</span>
              <span className={BADGE_CLASS[material.type]}>
                {MATERIAL_TYPE_LABELS[material.type]}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Building size={16} className="text-brown-muted shrink-0" />
              <span className="text-sm text-brown-muted w-16">品牌</span>
              <span className="text-sm text-brown-dark">{material.brand || '未填写'}</span>
            </div>

            <div className="flex items-center gap-3">
              <Palette size={16} className="text-brown-muted shrink-0" />
              <span className="text-sm text-brown-muted w-16">主题</span>
              <span className="text-sm text-brown-dark">{material.theme || '未填写'}</span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full border border-brown-muted/30 shrink-0"
                style={{ backgroundColor: material.color || '#E8B4B8' }}
              />
              <span className="text-sm text-brown-muted w-16">颜色</span>
              <span className="text-sm text-brown-dark font-mono">{material.color || '未选择'}</span>
            </div>

            <div className="flex items-center gap-3">
              <Hash size={16} className="text-brown-muted shrink-0" />
              <span className="text-sm text-brown-muted w-16">数量</span>
              <span className="text-sm text-brown-dark">×{material.quantity}</span>
              {material.quantity <= 2 && (
                <span className="badge bg-coral/20 text-coral-deep text-xs">库存低</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <DollarSign size={16} className="text-brown-muted shrink-0" />
              <span className="text-sm text-brown-muted w-16">购买价</span>
              <span className="text-sm text-brown-dark">¥{material.price.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-brown-muted shrink-0" />
              <span className="text-sm text-brown-muted w-16">收纳</span>
              <span className="text-sm text-brown-dark">{material.storageLocation || '未填写'}</span>
            </div>

            {usageCount > 0 && (
              <div className="flex items-center gap-3">
                <Package size={16} className="text-brown-muted shrink-0" />
                <span className="text-sm text-brown-muted w-16">已使用</span>
                <span className="text-sm text-brown-dark">×{usageCount}</span>
              </div>
            )}
          </div>

          <div className="stitch-line my-4" />

          <div className="flex gap-3">
            <Link
              to={`/materials/add?edit=${material.id}`}
              className="btn-secondary flex-1 inline-flex items-center justify-center gap-1.5"
            >
              <Pencil size={14} />
              编辑
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-secondary flex-1 inline-flex items-center justify-center gap-1.5 text-coral hover:bg-coral/10 hover:border-coral/30"
            >
              <Trash2 size={14} />
              删除
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-brown-dark/40 flex items-center justify-center z-50 p-4">
          <div className="card-paper rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={20} className="text-coral" />
              <h3 className="font-serif font-semibold text-brown-dark">确认删除</h3>
            </div>
            <p className="text-sm text-brown-muted mb-5">
              确定要删除「{material.name}」吗？此操作无法撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 rounded-lg bg-coral text-white font-medium hover:bg-coral-deep transition-all active:scale-[0.98]"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
