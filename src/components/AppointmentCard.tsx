import { Phone, User, AlertCircle, Clock } from 'lucide-react';
import StatusBadge from './StatusBadge';
import type { Appointment } from '@/types';

interface AppointmentCardProps {
  appointment: Appointment;
  onCheckIn?: (id: string) => void;
  onStart?: (id: string) => void;
  onComplete?: (id: string) => void;
  onNoShow?: (id: string) => void;
  onPostpone?: (id: string) => void;
  showActions?: boolean;
}

export default function AppointmentCard({
  appointment,
  onCheckIn,
  onStart,
  onComplete,
  onNoShow,
  onPostpone,
  showActions = true,
}: AppointmentCardProps) {
  return (
    <div className="card p-4 hover:shadow-medium transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-warm-800">{appointment.elderName}</h3>
            <p className="text-sm text-warm-500">{appointment.age}岁</p>
          </div>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="space-y-2 text-sm text-warm-600">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-warm-400" />
          <span>{appointment.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-warm-400" />
          <span>偏好 {appointment.preferredTime}</span>
        </div>
        {appointment.mobilityIssue && (
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-warning-500" />
            <span className="text-warning-600">行动不便</span>
          </div>
        )}
        {appointment.queueNumber !== null && (
          <div className="text-primary-600 font-medium">
            排队号: {String(appointment.queueNumber).padStart(3, '0')}
          </div>
        )}
        {appointment.postponeCount > 0 && (
          <div className="text-danger-600 text-xs">
            已顺延 {appointment.postponeCount} 次
          </div>
        )}
      </div>

      {showActions && (
        <div className="mt-4 pt-3 border-t border-warm-100 flex flex-wrap gap-2">
          {appointment.status === 'booked' && onCheckIn && (
            <button
              onClick={() => onCheckIn(appointment.id)}
              className="btn-success flex-1 text-xs py-1.5"
            >
              签到
            </button>
          )}
          {appointment.status === 'checked-in' && onStart && (
            <button
              onClick={() => onStart(appointment.id)}
              className="btn-primary flex-1 text-xs py-1.5"
            >
              开始服务
            </button>
          )}
          {appointment.status === 'serving' && onComplete && (
            <button
              onClick={() => onComplete(appointment.id)}
              className="btn-success flex-1 text-xs py-1.5"
            >
              完成
            </button>
          )}
          {appointment.status === 'serving' && onPostpone && (
            <button
              onClick={() => onPostpone(appointment.id)}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              过号顺延
            </button>
          )}
          {(appointment.status === 'booked' || appointment.status === 'checked-in') && onNoShow && (
            <button
              onClick={() => onNoShow(appointment.id)}
              className="btn-ghost text-danger-600 text-xs py-1.5 px-3 hover:bg-danger-50"
            >
              标记爽约
            </button>
          )}
        </div>
      )}
    </div>
  );
}
