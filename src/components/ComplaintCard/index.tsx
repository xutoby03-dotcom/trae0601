import { useNavigate } from 'react-router-dom';
import { Complaint, NOISE_TYPE_LABELS } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import { formatDateTime, formatDuration, getDuration } from '@/utils/dateUtils';
import { Building2, Clock, User, Phone, ChevronRight, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComplaintCardProps {
  complaint: Complaint;
  viewMode?: 'list' | 'card';
}

export default function ComplaintCard({ complaint, viewMode = 'card' }: ComplaintCardProps) {
  const navigate = useNavigate();

  const latestRecord = complaint.processRecords[complaint.processRecords.length - 1];
  const processingTime = latestRecord
    ? getDuration(complaint.createdAt, latestRecord.actualVisitTime || new Date().toISOString())
    : getDuration(complaint.createdAt, new Date().toISOString());

  if (viewMode === 'list') {
    return (
      <tr
        onClick={() => navigate(`/complaints/${complaint.id}`)}
        className={cn(
          'border-b border-slate-700/50 hover:bg-slate-800/50 cursor-pointer transition-colors',
          complaint.status === 'overdue' && 'bg-red-500/5'
        )}
      >
        <td className="px-4 py-3">
          <span className="font-mono text-sm text-slate-300">{complaint.id.slice(0, 8)}</span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>{complaint.building} {complaint.unit}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className="bg-slate-700/50 px-2 py-1 rounded text-sm">{NOISE_TYPE_LABELS[complaint.noiseType]}</span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1 text-slate-300">
            <User className="w-4 h-4 text-slate-400" />
            <span>{complaint.complainant}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1 text-slate-300">
            <Phone className="w-4 h-4 text-slate-400" />
            <span>{complaint.phone}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-slate-400 text-sm">
          {complaint.timePeriod}
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={complaint.status} size="sm" pulse={complaint.status === 'overdue'} />
        </td>
        <td className="px-4 py-3 text-slate-400 text-sm">
          {formatDateTime(complaint.createdAt)}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1">
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div
      onClick={() => navigate(`/complaints/${complaint.id}`)}
      className={cn(
        'group bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 hover:border-slate-600 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5',
        complaint.status === 'overdue' && 'border-red-500/30 hover:border-red-500/50 animate-pulse'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{complaint.building} {complaint.unit}</h3>
            <p className="text-sm text-slate-400">{NOISE_TYPE_LABELS[complaint.noiseType]}</p>
          </div>
        </div>
        <StatusBadge status={complaint.status} size="sm" pulse={complaint.status === 'overdue'} />
      </div>

      <p className="text-slate-300 text-sm line-clamp-2 mb-4">{complaint.description}</p>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-slate-400">
            <User className="w-4 h-4" />
            <span>{complaint.complainant}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-4 h-4" />
            <span>{complaint.timePeriod}</span>
          </div>
          {complaint.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-blue-400">
              <Paperclip className="w-4 h-4" />
              <span>{complaint.attachments.length}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-slate-500 group-hover:text-slate-300 transition-colors">
          <span className="text-xs">处理时长 {formatDuration(processingTime)}</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
