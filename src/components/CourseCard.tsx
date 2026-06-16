import React from 'react';
import {
  MapPin,
  User,
  Calendar,
  Clock,
  Users,
  Star,
  AlertTriangle,
} from 'lucide-react';
import type { CourseWithQuota } from '../types';
import { formatDate, getRiskLevel, calculateAisleRisk } from '../utils/helpers';

interface CourseCardProps {
  course: CourseWithQuota;
  onClick?: () => void;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onClick,
  showActions = false,
  onEdit,
  onDelete,
}) => {
  const remainingQuota = course.auditorQuota - course.usedQuota;
  const riskScore = calculateAisleRisk(course);
  const risk = getRiskLevel(riskScore);

  const progressPercent = (course.usedQuota / course.auditorQuota) * 100;

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
      onClick={onClick}
    >
      <div className="h-2 bg-gradient-to-r from-slate-700 to-slate-800 relative">
        {course.isKeyCourse && (
          <div className="absolute right-3 top-1 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            重点课程
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-bold text-lg text-slate-800 mb-3 group-hover:text-slate-900 transition-colors">
          {course.name}
        </h3>

        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>{course.classroom}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <span>{course.teacher}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{formatDate(course.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>
              {course.startTime} - {course.endTime}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">旁听名额</span>
            </div>
            <span className="text-sm font-medium">
              <span
                className={
                  remainingQuota > 0 ? 'text-green-600' : 'text-red-500'
                }
              >
                {remainingQuota}
              </span>
              <span className="text-slate-400">/{course.auditorQuota}</span>
            </span>
          </div>

          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progressPercent >= 90
                  ? 'bg-red-500'
                  : progressPercent >= 70
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-slate-500">
              固定学生: {course.fixedStudents} / 容量: {course.capacity}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${risk.color} flex items-center gap-1`}>
              <AlertTriangle className="w-3 h-3" />
              {risk.level}
            </span>
          </div>
        </div>
      </div>

      {showActions && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex gap-2">
          <button
            className="flex-1 px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-white rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
          >
            编辑
          </button>
          <button
            className="flex-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
          >
            删除
          </button>
        </div>
      )}
    </div>
  );
};
