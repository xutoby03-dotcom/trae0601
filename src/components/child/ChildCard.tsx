import type { Child } from '@/types';
import { Phone, MapPin, AlertCircle, Syringe, ChevronRight } from 'lucide-react';
import { calculateAge } from '@/utils/date';
import { useNavigate } from 'react-router-dom';

interface ChildCardProps {
  child: Child;
  vaccineCount?: number;
  completedCount?: number;
  onEdit?: () => void;
}

export default function ChildCard({
  child,
  vaccineCount = 0,
  completedCount = 0,
  onEdit,
}: ChildCardProps) {
  const navigate = useNavigate();
  const age = calculateAge(child.birthday);
  const progress = vaccineCount > 0 ? Math.round((completedCount / vaccineCount) * 100) : 0;
  const hasAllergy = child.allergyHistory && child.allergyHistory.trim() !== '';

  return (
    <div
      className="card card-hover p-5 cursor-pointer group animate-fade-in-up"
      onClick={() => navigate(`/children/${child.id}`)}
    >
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <img
            src={
              child.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(child.name)}`
            }
            alt={child.name}
            className="w-16 h-16 rounded-2xl object-cover bg-slate-100 border-2 border-white shadow-soft"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-card flex items-center justify-center text-xs font-medium text-slate-600">
            {child.gender === '男' ? '♂' : '♀'}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-display text-lg text-slate-800 leading-tight">
                  {child.name}
                </h3>
                {hasAllergy && (
                  <span className="chip bg-danger-50 text-danger-600 border border-danger-100">
                    <AlertCircle className="w-3 h-3" />
                    过敏史
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">{age} · {child.birthday}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 flex items-center justify-center transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          {child.vaccinationSite && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[160px]">{child.vaccinationSite}</span>
            </div>
          )}
          {child.guardianPhone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{child.guardianPhone}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 ml-auto">
            <Syringe className="w-3.5 h-3.5 text-primary-500" />
            <span className="text-primary-700 font-medium">
              {completedCount}/{vaccineCount} 已完成
            </span>
          </div>
        </div>

        <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
