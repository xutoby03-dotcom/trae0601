import { Link } from 'react-router-dom';
import type { Material, MaterialType } from '@/types';
import { MATERIAL_TYPE_LABELS } from '@/types';
import { Package } from 'lucide-react';

interface MaterialCardProps {
  material: Material;
}

const badgeClass: Record<MaterialType, string> = {
  sticker: 'badge-sticker',
  tape: 'badge-tape',
  memo: 'badge-memo',
  stamp: 'badge-stamp',
};

export default function MaterialCard({ material }: MaterialCardProps) {
  return (
    <Link
      to={`/materials/${material.id}`}
      className="card-paper rounded-xl overflow-hidden transition-all hover:-translate-y-0.5 group"
    >
      <div className="aspect-[4/3] bg-cream-dark/30 relative overflow-hidden">
        {material.photo ? (
          <img
            src={material.photo}
            alt={material.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={32} className="text-brown-muted/30" />
          </div>
        )}
        <span className={`absolute top-2 right-2 ${badgeClass[material.type]}`}>
          {MATERIAL_TYPE_LABELS[material.type]}
        </span>
        {material.quantity <= 2 && (
          <span className="absolute top-2 left-2 badge bg-coral/80 text-white">
            即将用完
          </span>
        )}
        {material.quantity >= 10 && (
          <span className="absolute top-2 left-2 badge bg-blue-400/70 text-white">
            库存充足
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-serif font-semibold text-brown-dark text-sm truncate">
          {material.name}
        </h3>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-brown-muted">{material.brand || '未填品牌'}</span>
          <span className="text-xs font-medium text-brown">×{material.quantity}</span>
        </div>
      </div>
    </Link>
  );
}
