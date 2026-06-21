import { Link } from 'react-router-dom';
import { Plus, Layers } from 'lucide-react';
import type { Fabric } from '@/types';
import { SEASON_LABELS } from '@/types';

interface FabricCardProps {
  fabric: Fabric;
  onAddToBoard?: () => void;
  isInBoard?: boolean;
}

export function FabricCard({ fabric, onAddToBoard, isInBoard }: FabricCardProps) {
  const properties = [
    { label: '克重', value: `${fabric.weight}g` },
    { label: '弹力', value: `${fabric.elasticity}%` },
    { label: '垂感', value: `${fabric.drape}%` },
    { label: '厚薄', value: `${fabric.thickness}%` },
  ];

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm border border-[#8B5A3C]/10 hover:shadow-xl hover:shadow-[#8B5A3C]/10 transition-all duration-300 hover:-translate-y-1">
      <Link to={`/fabric/${fabric.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-[#F8F4ED]">
          <img
            src={fabric.photoSmooth}
            alt={fabric.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-[#8B5A3C]">
              {SEASON_LABELS[fabric.season]}
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex gap-1.5">
              {properties.map((prop) => (
                <span
                  key={prop.label}
                  className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded text-[10px] text-white"
                >
                  {prop.label} {prop.value}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-serif text-lg text-[#8B5A3C] group-hover:text-[#3D5A45] transition-colors">
            {fabric.name}
          </h3>
          <p className="text-sm text-[#8B5A3C]/60 mt-1 line-clamp-1">{fabric.composition}</p>

          <div className="mt-4 flex gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-[#F8F4ED] to-[#E8B4A0] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#E8B4A0] to-[#8B5A3C]"
                style={{ width: `${fabric.softness}%` }}
              />
            </div>
            <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-[#F8F4ED] to-[#A67C52] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#A67C52] to-[#3D5A45]"
                style={{ width: `${fabric.stiffness}%` }}
              />
            </div>
            <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-[#F8F4ED] to-[#8B5A3C] overflow-hidden">
              <div
                className="h-full bg-[#8B5A3C]"
                style={{ width: `${fabric.roughness}%` }}
              />
            </div>
            <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-[#F8F4ED] to-[#3D5A45] overflow-hidden">
              <div
                className="h-full bg-[#3D5A45]"
                style={{ width: `${fabric.coolness}%` }}
              />
            </div>
          </div>
        </div>
      </Link>

      {onAddToBoard && (
        <div className="px-4 pb-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToBoard();
            }}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              isInBoard
                ? 'bg-[#3D5A45]/10 text-[#3D5A45]'
                : 'bg-[#8B5A3C]/5 text-[#8B5A3C] hover:bg-[#8B5A3C]/10'
            }`}
          >
            {isInBoard ? (
              <>
                <Layers size={16} />
                已加入候选板
              </>
            ) : (
              <>
                <Plus size={16} />
                加入候选板
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
