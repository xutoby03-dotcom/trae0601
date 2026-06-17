import { useNavigate } from 'react-router-dom';
import { Calendar, User, Package, AlertTriangle, Droplets } from 'lucide-react';
import { Clothing } from '@/types';
import { CATEGORY_LABELS } from '@/types';
import useAppStore from '@/store/useAppStore';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import ProcessIcon from './ProcessIcon';
import { formatDateReadable, daysUntilDeadline, isOverdue } from '@/utils/dateUtils';

interface ClothingCardProps {
  clothing: Clothing;
  showActions?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const ClothingCard = ({ clothing, showActions = true, className = '', style }: ClothingCardProps) => {
  const navigate = useNavigate();
  const { materials } = useAppStore();

  const hasMaterialShortage = clothing.materialsNeeded.some((matId) => {
    const mat = materials.find((m) => m.id === matId);
    return mat && mat.quantity <= 0;
  });

  const daysLeft = daysUntilDeadline(clothing.deadline);
  const isOverdueTask = isOverdue(clothing.deadline) && clothing.status !== 'completed';

  const handleClick = () => {
    navigate(`/queue/${clothing.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`card p-5 cursor-pointer stagger-item ${className}`}
      style={style}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <ProcessIcon type={clothing.processType} size="lg" />
          <div>
            <h3 className="font-display font-semibold text-brown-900 text-lg">
              {CATEGORY_LABELS[clothing.category]}
            </h3>
            <p className="text-sm text-brown-500 flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {clothing.owner}
            </p>
          </div>
        </div>
        <StatusBadge status={clothing.status} size="sm" />
      </div>

      {clothing.notes && (
        <p className="text-sm text-brown-600 mb-3 line-clamp-2">{clothing.notes}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <PriorityBadge priority={clothing.priority} size="sm" />
        {clothing.washBefore && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600">
            <Droplets className="w-3 h-3" />
            洗后再改
          </span>
        )}
        {hasMaterialShortage && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-warning-50 text-warning-600 animate-pulse-soft">
            <AlertTriangle className="w-3 h-3" />
            缺材料
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <div
          className={`flex items-center gap-1.5 ${
            isOverdueTask
              ? 'text-warning-600 font-medium'
              : daysLeft <= 3
              ? 'text-warning-500'
              : 'text-brown-500'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>
            {isOverdueTask
              ? '已过期'
              : daysLeft === 0
              ? '今天截止'
              : daysLeft < 0
              ? '已过期'
              : `还剩 ${daysLeft} 天`}
          </span>
        </div>
        <div className="flex items-center gap-1 text-brown-400">
          <Package className="w-4 h-4" />
          <span>{formatDateReadable(clothing.deadline)}</span>
        </div>
      </div>

      {clothing.photoBefore && (
        <div className="mt-4 pt-4 border-t border-brown-100">
          <img
            src={clothing.photoBefore}
            alt="衣物照片"
            className="w-full h-32 object-cover rounded-lg"
          />
        </div>
      )}

      {clothing.timeSpent && clothing.status === 'completed' && (
        <div className="mt-3 pt-3 border-t border-brown-100 text-sm text-brown-500">
          耗时：{clothing.timeSpent} 分钟
        </div>
      )}
    </div>
  );
};

export default ClothingCard;
