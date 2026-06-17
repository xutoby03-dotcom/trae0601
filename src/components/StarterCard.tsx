import { MotherStarter } from '@/types';
import { StatusBadge } from './StatusBadge';
import { getStorageLabel, getWaterRatioDisplay, formatDate, formatTimeAgo } from '@/utils/format';
import { isFeedingDue } from '@/utils/calculations';
import { Cookie, Droplets, Package, Thermometer, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StarterCardProps {
  starter: MotherStarter;
  delay?: number;
}

export default function StarterCard({ starter, delay = 0 }: StarterCardProps) {
  const navigate = useNavigate();
  const feedingDue = isFeedingDue(starter);

  const handleClick = () => {
    navigate(`/starters/${starter.id}`);
  };

  return (
    <div 
      className="card cursor-pointer animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
      onClick={handleClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={starter.photoUrl} 
          alt={starter.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute top-3 right-3">
          <StatusBadge status={starter.status} size="sm" />
        </div>
        {feedingDue && feedingDue.overdue && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium animate-pulse">
            喂养超时
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-display text-lg font-bold">{starter.name}</h3>
          <p className="text-sm text-white/80">{starter.flourType}</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-bread-600">
            <Droplets className="w-4 h-4 text-wheat" />
            <span>水粉比 {getWaterRatioDisplay(starter.waterRatio)}</span>
          </div>
          <div className="flex items-center gap-2 text-bread-600">
            <Package className="w-4 h-4 text-wheat" />
            <span>{starter.container}</span>
          </div>
          <div className="flex items-center gap-2 text-bread-600">
            <Thermometer className="w-4 h-4 text-wheat" />
            <span>{getStorageLabel(starter.storageType)}</span>
          </div>
          <div className="flex items-center gap-2 text-bread-600">
            <Cookie className="w-4 h-4 text-wheat" />
            <span>{starter.currentWeight}g</span>
          </div>
        </div>

        <div className="pt-3 border-t border-bread-100 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-bread-500">
            <Clock className="w-4 h-4" />
            <span>{starter.lastFedAt ? formatTimeAgo(starter.lastFedAt) : '未喂养'}</span>
          </div>
          <div className="text-bread-400 text-xs">
            建立于 {formatDate(starter.createdAt)}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {feedingDue && (
            <span className={`text-xs font-medium ${feedingDue.overdue ? 'text-red-500' : 'text-orange-500'}`}>
              {feedingDue.overdue ? '需立即喂养' : `${Math.round((new Date(feedingDue.dueAt).getTime() - Date.now()) / 3600000)}小时后喂养`}
            </span>
          )}
          <ChevronRight className="w-5 h-5 text-bread-400" />
        </div>
      </div>
    </div>
  );
}
