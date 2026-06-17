import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Key, ChevronRight, AlertCircle } from 'lucide-react';
import type { Task } from '../types';
import { formatDate, getStatusLabel, getStatusColor, cn } from '../utils/helpers';

interface TaskCardProps {
  task: Task;
  abnormalitiesCount?: number;
}

export default function TaskCard({ task, abnormalitiesCount = 0 }: TaskCardProps) {
  const navigate = useNavigate();

  const isToday = task.date === new Date().toISOString().split('T')[0];

  return (
    <div
      onClick={() => navigate(`/tasks/${task.id}`)}
      className={cn(
        'bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer',
        'border-2 hover:border-[#FF8A3D]/30',
        isToday && task.status !== 'completed' ? 'border-orange-200 bg-gradient-to-r from-orange-50 to-white' : 'border-transparent'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-14 h-14 rounded-xl flex flex-col items-center justify-center',
            isToday && task.status !== 'completed'
              ? 'bg-gradient-to-br from-[#FF8A3D] to-[#FFB380] text-white'
              : 'bg-gray-100 text-gray-600'
          )}>
            <span className="text-lg font-bold">{task.time.split(':')[0]}</span>
            <span className="text-xs opacity-80">{task.time.split(':')[1]}</span>
          </div>
          <div>
            <h3 className="font-bold text-[#2D2A26]">
              {formatDate(task.date)}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                'text-xs px-2.5 py-0.5 rounded-full font-medium',
                getStatusColor(task.status)
              )}>
                {getStatusLabel(task.status)}
              </span>
              {abnormalitiesCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                  <AlertCircle size={12} />
                  {abnormalitiesCount} 项异常
                </span>
              )}
            </div>
          </div>
        </div>
        <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={14} className="text-[#FF8A3D] flex-shrink-0" />
          <span className="truncate">{task.accessMethod}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Key size={14} className="text-[#4ECDC4] flex-shrink-0" />
          <span className="truncate">{task.keyLocation}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={14} className="text-orange-500 flex-shrink-0" />
          <span>喂食 {task.foodGrams}g · {task.medication}</span>
        </div>
      </div>
    </div>
  );
}
