import { Camera, Briefcase, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Document } from '@/types';
import {
  getDocumentStatus,
  getStatusText,
  maskDocumentNumber,
  formatDate,
  getDaysUntil,
} from '@/utils/dateUtils';
import { useTripStore } from '@/store/useTripStore';

interface DocumentRowProps {
  document: Document;
  showEdit?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  mode?: 'list' | 'detail';
}

export default function DocumentRow({
  document,
  showEdit = false,
  onEdit,
  onDelete,
  mode = 'list',
}: DocumentRowProps) {
  const { showSensitive, togglePhotoBackup, toggleInLuggage } = useTripStore();
  const status = getDocumentStatus(document.expiryDate);
  const daysLeft = getDaysUntil(document.expiryDate);

  const compactMode = mode === 'list' && !showSensitive;

  const statusConfig = {
    expired: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-600',
      icon: XCircle,
      pulse: true,
    },
    warning: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-600',
      icon: AlertTriangle,
      pulse: false,
    },
    normal: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-500',
      icon: CheckCircle,
      pulse: false,
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const isConfirmed = document.photoBackup && document.inLuggage;

  return (
    <div
      className={`p-4 rounded-xl border ${config.border} ${config.bg} transition-all duration-300 ${
        config.pulse ? 'animate-pulse-slow' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config.bg} border ${config.border}`}>
            <StatusIcon size={18} className={config.text} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">{document.type}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.text} font-medium`}>
                {getStatusText(status)}
              </span>
              {isConfirmed && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 font-medium">
                  已确认
                </span>
              )}
            </div>
            {!compactMode && (
              <p className="text-sm text-gray-500 mt-0.5 font-mono transition-opacity duration-200">
                {showSensitive ? document.number : maskDocumentNumber(document.number)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!compactMode && (
            <div className="text-right transition-opacity duration-200">
              <p className={`text-sm font-medium ${config.text}`}>
                {formatDate(document.expiryDate)}
              </p>
              <p className="text-xs text-gray-400">
                {status === 'expired'
                  ? `已过期 ${Math.abs(daysLeft)} 天`
                  : status === 'warning'
                  ? `还剩 ${daysLeft} 天`
                  : `剩余 ${daysLeft} 天`}
              </p>
            </div>
          )}

          {showEdit ? (
            <div className="flex gap-1">
              <button
                onClick={onEdit}
                className="p-2 rounded-lg hover:bg-white/60 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Clock size={16} />
              </button>
              <button
                onClick={onDelete}
                className="p-2 rounded-lg hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors"
              >
                <XCircle size={16} />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200/50">
        <button
          onClick={() => togglePhotoBackup(document.id)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
            document.photoBackup
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <Camera size={14} />
          <span>{document.photoBackup ? '已备份照片' : '未备份照片'}</span>
        </button>

        <button
          onClick={() => toggleInLuggage(document.id)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
            document.inLuggage
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <Briefcase size={14} />
          <span>{document.inLuggage ? '已放行李' : '未放行李'}</span>
        </button>

        {document.notes && (
          <span className="text-xs text-gray-400 ml-auto">备注：{document.notes}</span>
        )}
      </div>
    </div>
  );
}
