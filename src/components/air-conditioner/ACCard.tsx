import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Edit, Trash2, Play, Calendar, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ACWithStatus } from '@/types';
import { STATUS_LABELS } from '@/types';

interface ACCardProps {
  ac: ACWithStatus;
  index: number;
  onDelete: (id: string) => void;
}

const statusColors = {
  overdue: 'bg-red-500',
  drying: 'bg-amber-500',
  pending: 'bg-blue-500',
  completed: 'bg-green-500',
};

export function ACCard({ ac, index, onDelete }: ACCardProps) {
  const handleDelete = () => {
    if (confirm(`确定要删除「${ac.room}」的空调档案吗？相关的清洗记录也会被删除。`)) {
      onDelete(ac.id);
    }
  };

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={ac.photo}
          alt={`${ac.room}空调`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <span
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium text-white shadow-lg',
              statusColors[ac.status]
            )}
          >
            {STATUS_LABELS[ac.status]}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-xl font-bold">{ac.room}</h3>
          <p className="text-sm text-white/80">
            {ac.brand} {ac.model}
          </p>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Wind className="w-4 h-4 text-primary-500" />
            <span>{ac.horsepower}匹</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-primary-500" />
            <span>每{ac.cleaningCycle}天清洗</span>
          </div>
        </div>

        <div className="text-xs text-gray-500 mb-4">
          <p>滤网类型：{ac.filterType}</p>
          {ac.lastCleanDate && (
            <p>
              上次清洗：
              {format(parseISO(ac.lastCleanDate), 'yyyy年MM月dd日', { locale: zhCN })}
            </p>
          )}
          <p>
            下次清洗：
            {format(parseISO(ac.nextCleanDate), 'yyyy年MM月dd日', { locale: zhCN })}
          </p>
        </div>

        <div className="flex gap-2">
          {ac.status !== 'drying' && (
            <Link
              to={`/cleaning-records/new/${ac.id}`}
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white text-sm py-2 px-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-1"
            >
              <Play className="w-4 h-4" />
              清洗
            </Link>
          )}
          <Link
            to={`/air-conditioners/${ac.id}`}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 px-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-1"
          >
            <Edit className="w-4 h-4" />
            编辑
          </Link>
          <button
            onClick={handleDelete}
            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
