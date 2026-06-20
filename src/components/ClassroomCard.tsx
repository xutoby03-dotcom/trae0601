import { Building2, MapPin, Ruler, Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Classroom } from '@/types';
import StatusBadge from './StatusBadge';
import { formatDate, getFloorLifeRemaining, isFloorLifeWarning } from '@/utils/dateUtils';

interface ClassroomCardProps {
  classroom: Classroom;
}

export default function ClassroomCard({ classroom }: ClassroomCardProps) {
  const navigate = useNavigate();
  const lifeWarning = isFloorLifeWarning(classroom.installDate);
  const lifeRemaining = getFloorLifeRemaining(classroom.installDate);

  return (
    <div
      onClick={() => navigate(`/classrooms/${classroom.id}`)}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={classroom.photos[0]}
          alt={classroom.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={classroom.status} type="classroom" size="sm" />
        </div>
        
        {/* Floor info */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-medium">{classroom.floor}楼</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-slate-800 text-lg mb-3 group-hover:text-teal-600 transition-colors">
          {classroom.name}
        </h3>

        <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-slate-400" />
            <span>{classroom.area}㎡</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="truncate">{classroom.floorBrand.split(' ')[0]}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{classroom.installDate.slice(0, 4)}年</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span>{classroom.clubs.length}个社团</span>
          </div>
        </div>

        {/* Life warning */}
        {lifeWarning && (
          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700 font-medium">
              ⚠️ 地胶寿命仅剩 {lifeRemaining.years}年{lifeRemaining.months}月
            </p>
          </div>
        )}

        {/* Last inspection */}
        {classroom.lastInspectionDate && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              上次巡检：{formatDate(classroom.lastInspectionDate)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
