import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, Zap, Ruler, MapPin } from 'lucide-react';
import type { Cable } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { INTERFACE_TYPE_LABELS } from '@/types';
import { useAppStore } from '@/store/useAppStore';

interface CableCardProps {
  cable: Cable;
  onDelete?: (id: string) => void;
}

const interfaceColors: Record<string, string> = {
  'USB-C': 'bg-blue-100 text-blue-700',
  'Lightning': 'bg-purple-100 text-purple-700',
  'Micro-USB': 'bg-green-100 text-green-700',
};

export const CableCard = ({ cable, onDelete }: CableCardProps) => {
  const { currentUser, deleteCable } = useAppStore();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`确定要删除线材 ${cable.code} 吗？`)) {
      const success = deleteCable(cable.id);
      if (!success) {
        alert('该线材正在借用中，无法删除');
      }
    }
  };

  return (
    <Link
      to={`/cables/${cable.id}`}
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={cable.photoUrl}
          alt={cable.code}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 right-3">
          <StatusBadge status={cable.status} size="sm" />
        </div>
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${interfaceColors[cable.interfaceType]}`}>
            {INTERFACE_TYPE_LABELS[cable.interfaceType]}
          </span>
        </div>
        
        {currentUser?.isAdmin && (
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
              to={`/cables/${cable.id}/edit`}
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md hover:bg-blue-50 transition-colors"
            >
              <Edit className="w-4 h-4 text-blue-600" />
            </Link>
            <button
              onClick={handleDelete}
              className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-gray-900">{cable.code}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <MapPin className="w-3 h-3" />
              <span>{cable.defaultLocation}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm font-mono text-gray-700">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{cable.power}W</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <Ruler className="w-3 h-3" />
              <span>{cable.length}m</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <span>累计借用 {cable.borrowCount} 次</span>
          <div className="flex items-center gap-1 text-blue-600 font-medium">
            <Eye className="w-3 h-3" />
            <span>查看详情</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
