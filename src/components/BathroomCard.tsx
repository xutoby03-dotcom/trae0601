import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Droplets, RefreshCw, MapPin, Calendar } from 'lucide-react';
import type { Bathroom } from '../types';
import { RiskBadge } from './RiskBadge';
import { StatusIndicator } from './StatusIndicator';
import { getRiskBgColor } from '../utils/riskCalculator';
import { formatDate, getDaysSince } from '../utils/dateUtils';

interface BathroomCardProps {
  bathroom: Bathroom;
}

export const BathroomCard = ({ bathroom }: BathroomCardProps) => {
  const navigate = useNavigate();
  const usageDays = getDaysSince(bathroom.purchaseDate);
  const lifespanPercent = Math.min((usageDays / bathroom.recommendedLifespanDays) * 100, 100);

  const isOverdue = usageDays > bathroom.recommendedLifespanDays;

  return (
    <div
      className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${getRiskBgColor(bathroom.riskLevel)}`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-gray-900">{bathroom.name}</h3>
              <RiskBadge level={bathroom.riskLevel} size="sm" />
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin size={14} />
              <span>{bathroom.location}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">使用时长</div>
            <div className={`text-lg font-bold ${isOverdue ? 'text-red-600' : 'text-gray-800'}`}>
              {usageDays} 天
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">使用寿命进度</span>
            <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-800'}`}>
              {isOverdue ? '已过期' : `${lifespanPercent.toFixed(0)}%`}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isOverdue ? 'bg-red-500' : lifespanPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(lifespanPercent, 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <StatusIndicator type="suction" status={bathroom.suctionStatus} showLabel={false} />
          <StatusIndicator type="corner" status={bathroom.cornerStatus} showLabel={false} />
          <StatusIndicator type="mold" status={bathroom.moldStatus} showLabel={false} />
        </div>

        <div className="flex flex-wrap gap-2 mb-4 text-xs">
          <span className="px-2 py-1 bg-white/60 rounded-full text-gray-600">
            尺寸: {bathroom.matSize}
          </span>
          <span className="px-2 py-1 bg-white/60 rounded-full text-gray-600">
            材质: {bathroom.matMaterial}
          </span>
          <span className="px-2 py-1 bg-white/60 rounded-full text-gray-600">
            吸盘: {bathroom.suctionCupsCount}个
          </span>
        </div>

        {bathroom.lastInspectionDate && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
            <Calendar size={14} />
            <span>上次检查: {formatDate(bathroom.lastInspectionDate)}</span>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/inspection/${bathroom.id}`)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-all duration-300 hover:shadow-lg"
          >
            <ClipboardCheck size={18} />
            周检查
          </button>
          <button
            onClick={() => navigate('/cleaning-records')}
            className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:border-orange-400 hover:text-orange-500 transition-all duration-300"
          >
            <Droplets size={18} />
          </button>
          <button
            onClick={() => navigate('/tasks')}
            className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:border-orange-400 hover:text-orange-500 transition-all duration-300"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
