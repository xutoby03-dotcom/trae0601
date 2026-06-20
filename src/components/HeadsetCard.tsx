import { Link } from 'react-router-dom';
import { Edit2, Trash2, Battery, Package, Wifi, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { Headset } from '@/types';
import { connectionTypeLabels, headsetStatusLabels } from '@/types';
import { cn } from '@/lib/utils';

interface HeadsetCardProps {
  headset: Headset;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export default function HeadsetCard({ headset, onDelete, showActions = true }: HeadsetCardProps) {
  const borrowRecords = useStore(state => state.borrowRecords);
  
  const hasUnreturnedRecord = borrowRecords.some(
    r => r.headsetId === headset.id && (r.status === 'borrowed' || r.status === 'overdue')
  );
  
  const isLowBattery = headset.batteryLevel < 30 && headset.batteryLevel > 0;
  const hasIssues = headset.receiverLost || headset.microphoneIssue;
  const isFaulty = headset.status === 'faulty' || headset.status === 'maintenance';

  const getStatusBadge = () => {
    switch (headset.status) {
      case 'available':
        return <span className="badge badge-success">{headsetStatusLabels[headset.status]}</span>;
      case 'borrowed':
        return <span className="badge badge-info">{headsetStatusLabels[headset.status]}</span>;
      case 'faulty':
        return <span className="badge badge-danger">{headsetStatusLabels[headset.status]}</span>;
      case 'maintenance':
        return <span className="badge badge-warning">{headsetStatusLabels[headset.status]}</span>;
    }
  };

  return (
    <div 
      className={cn(
        "card animate-fade-in",
        (isFaulty || hasIssues) && "card-danger",
        isLowBattery && !isFaulty && !hasIssues && "card-warning"
      )}
    >
      <div className="flex gap-4">
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
          <img 
            src={headset.photo} 
            alt={`${headset.brand} ${headset.model}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-slate-900 truncate">
                {headset.brand} {headset.model}
              </h3>
              <p className="text-sm text-slate-500">{headset.serialNumber}</p>
            </div>
            {getStatusBadge()}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Wifi className="w-4 h-4 text-slate-400" />
              <span>{connectionTypeLabels[headset.connectionType]}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Package className="w-4 h-4 text-slate-400" />
              <span>{headset.cabinet}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Battery className={cn("w-4 h-4", isLowBattery && "text-red-500")} />
              <span className={cn(isLowBattery && "text-danger")}>
                {headset.batteryLevel === 0 ? '有线' : `${headset.batteryLevel}%`}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {headset.compatibleSoftware.map((sw) => (
              <span key={sw} className="badge badge-slate text-xs">
                {sw}
              </span>
            ))}
          </div>
          
          {(headset.receiverLost || headset.microphoneIssue || isLowBattery) && (
            <div className="flex items-center gap-2 text-sm mb-3">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <div className="flex flex-wrap gap-2">
                {headset.receiverLost && (
                  <span className="text-danger">接收器丢失</span>
                )}
                {headset.microphoneIssue && (
                  <span className="text-danger">麦克风异常</span>
                )}
                {isLowBattery && !headset.receiverLost && !headset.microphoneIssue && (
                  <span className="text-danger">低电量</span>
                )}
              </div>
            </div>
          )}
          
          {showActions && (
            <div className="flex items-center gap-2">
              <Link
                to={`/headsets/${headset.id}/edit`}
                className="btn btn-secondary text-sm py-1.5 px-3 flex items-center gap-1"
              >
                <Edit2 className="w-4 h-4" />
                编辑
              </Link>
              {onDelete && (
                <button
                  onClick={() => onDelete(headset.id)}
                  className="btn btn-danger text-sm py-1.5 px-3 flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  删除
                </button>
              )}
              {headset.status === 'available' && !hasIssues && !hasUnreturnedRecord && (
                <Link
                  to={`/borrow?headsetId=${headset.id}`}
                  className="btn btn-primary text-sm py-1.5 px-3 ml-auto"
                >
                  借用
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
