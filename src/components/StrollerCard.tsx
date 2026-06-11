import { useState } from 'react';
import {
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  Edit2,
  Trash2,
  Eye,
  ShieldAlert,
} from 'lucide-react';
import type { Stroller } from '@/types';
import { useStrollerStore } from '@/store/useStrollerStore';
import { getBadgeClass, relativeTime, cn } from '@/utils/helpers';

interface Props {
  stroller: Stroller;
  index?: number;
}

export default function StrollerCard({ stroller, index = 0 }: Props) {
  const { setActivePatrol, setActiveForm, setActiveDetail, deleteStroller } = useStrollerStore();
  const [showFlash, setShowFlash] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handlePatrolClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 1200);
    setActivePatrol(stroller.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveForm(stroller.id);
  };

  const handleDetail = () => {
    setActiveDetail(stroller.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    } else {
      deleteStroller(stroller.id);
    }
  };

  return (
    <div
      onClick={handleDetail}
      className={cn(
        'card p-0 overflow-hidden cursor-pointer group relative',
        stroller.isFireExit && 'ring-1 ring-red-400/60',
        showFlash && 'animate-pulse-border ring-2',
        'hover:scale-[1.02] hover:-translate-y-0.5'
      )}
      style={{
        animationDelay: `${Math.min(index * 80, 600)}ms`,
        animationName: 'fade-in-up',
        animationDuration: '0.4s',
        animationFillMode: 'both',
        animationTimingFunction: 'ease-out',
      }}
    >
      {stroller.isFireExit && (
        <div className="absolute top-0 left-0 h-full w-1.5 bg-gradient-to-b from-red-500 to-orange-400 z-10" />
      )}

      <div className="relative h-44 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        {stroller.photos[0] ? (
          <img
            src={stroller.photos[0]}
            alt={stroller.model}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <span className="text-sm">暂无照片</span>
          </div>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {stroller.isFireExit && (
            <span className="badge-fire shadow-md backdrop-blur-sm bg-white/90">
              <ShieldAlert className="w-3.5 h-3.5" />
              消防通道
            </span>
          )}
          <span className={cn(getBadgeClass(stroller.status), 'shadow-md backdrop-blur-sm bg-white/95')}>
            {stroller.status === 'normal' && '正常'}
            {stroller.status === 'blocking' && '挡路'}
            {stroller.status === 'pending' && '待联系'}
            {stroller.status === 'moved' && '已挪走'}
          </span>
        </div>
        {stroller.isLongTerm && (
          <span className="absolute top-3 left-3 badge bg-purple-50 text-purple-700 border-purple-200 shadow-md backdrop-blur-sm bg-white/95">
            <Calendar className="w-3.5 h-3.5" />
            长期停放
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-lg font-bold text-slate-800">
              {stroller.building} {stroller.room}
            </div>
            <div className="text-sm text-slate-500 mt-0.5">{stroller.ownerName}</div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{stroller.location}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{stroller.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-slate-500">更新于 {relativeTime(stroller.updatedAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={handlePatrolClick}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
              stroller.status === 'blocking'
                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
            )}
          >
            <AlertTriangle className="inline w-4 h-4 mr-1 -mt-0.5" />
            巡查标记
          </button>
          <button
            onClick={handleEdit}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            title="编辑"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveDetail(stroller.id)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            title="查看详情"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className={cn(
              'p-2 rounded-lg transition-colors',
              confirmDelete
                ? 'bg-red-500 text-white animate-pulse'
                : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
            )}
            title={confirmDelete ? '再次点击确认删除' : '删除'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
