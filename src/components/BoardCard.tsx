import { Link } from 'react-router-dom';
import { ChevronRight, Trash2 } from 'lucide-react';
import type { Board, Fabric } from '@/types';

interface BoardCardProps {
  board: Board;
  fabrics: Fabric[];
  onDelete?: (e: React.MouseEvent) => void;
}

export function BoardCard({ board, fabrics, onDelete }: BoardCardProps) {
  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm border border-[#8B5A3C]/10 hover:shadow-xl hover:shadow-[#8B5A3C]/10 transition-all duration-300 hover:-translate-y-1">
      <Link to={`/board/${board.id}`} className="block">
        <div className="relative h-40 bg-gradient-to-br from-[#8B5A3C]/10 to-[#3D5A45]/10 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center gap-2 px-4">
            {fabrics.slice(0, 4).map((fabric, index) => (
              <div
                key={fabric.id}
                className="w-16 h-16 rounded-lg overflow-hidden shadow-md border-2 border-white transition-transform"
                style={{
                  transform: `rotate(${(index - 1.5) * 5}deg) translateX(${index * 2}px)`,
                  zIndex: 10 - index,
                }}
              >
                <img
                  src={fabric.photoSmooth}
                  alt={fabric.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {fabrics.length > 4 && (
              <div className="w-16 h-16 rounded-lg bg-[#8B5A3C]/80 flex items-center justify-center text-white font-medium border-2 border-white shadow-md">
                +{fabrics.length - 4}
              </div>
            )}
            {fabrics.length === 0 && (
              <div className="text-[#8B5A3C]/40 text-sm">暂无面料</div>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-serif text-lg text-[#8B5A3C] group-hover:text-[#3D5A45] transition-colors">
                {board.name}
              </h3>
              {board.description && (
                <p className="text-sm text-[#8B5A3C]/60 mt-1 line-clamp-2">{board.description}</p>
              )}
            </div>
            <ChevronRight size={20} className="text-[#8B5A3C]/30 group-hover:text-[#8B5A3C] transition-colors flex-shrink-0 mt-1" />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="px-3 py-1 bg-[#8B5A3C]/5 rounded-full text-xs font-medium text-[#8B5A3C]">
              {fabrics.length} 款候选面料
            </span>
          </div>
        </div>
      </Link>

      {onDelete && (
        <div className="px-4 pb-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete(e);
            }}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-[#8B5A3C]/50 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
            删除候选板
          </button>
        </div>
      )}
    </div>
  );
}
