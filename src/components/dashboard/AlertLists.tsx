import { useMemo } from 'react';
import { Clock, AlertTriangle, FileSearch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { StatusBadge } from '../ui/Badges';
import { formatDate, daysOverdue, daysUntil, isOverdue } from '../../utils';

export function OverdueList() {
  const navigate = useNavigate();
  const archiveBoxes = useAppStore((s) => s.archiveBoxes);
  const records = useAppStore((s) => s.borrowRecords);
  const boxes = useMemo(() => {
    return records
      .filter((r) => r.status === '借出中' && isOverdue(r.expectedReturnDate))
      .map((r) => archiveBoxes.find((b) => b.id === r.archiveBoxId))
      .filter((b): b is NonNullable<typeof b> => !!b);
  }, [archiveBoxes, records]);

  if (boxes.length === 0) {
    return (
      <div className="card p-5">
        <h3 className="font-serif text-base font-semibold text-navy-900 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-red-500" />
          逾期未还
        </h3>
        <div className="py-8 text-center text-gray-400 text-sm">暂无逾期档案箱</div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <h3 className="font-serif text-base font-semibold text-navy-900 mb-4 flex items-center gap-2">
        <Clock size={18} className="text-red-500" />
        逾期未还
        <span className="ml-auto text-xs font-normal text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
          {boxes.length} 箱
        </span>
      </h3>
      <div className="space-y-3">
        {boxes.map((box, idx) => {
          const record = records.find(
            (r) => r.archiveBoxId === box.id && (r.status === '借出中' || r.status === '已逾期')
          );
          const overdue = record ? daysOverdue(record.expectedReturnDate) : 0;
          return (
            <div
              key={box.id}
              onClick={() => navigate(`/archives/${box.id}`)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors animate-fade-in-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500 flex-shrink-0">
                <Clock size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-navy-800 truncate">{box.boxNumber}</p>
                <p className="text-xs text-gray-500 truncate">
                  {record?.borrowerName} · 柜位 {box.cabinetLocation}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-medium text-red-600">逾期 {overdue} 天</p>
                <p className="text-xs text-gray-400">应还 {record ? formatDate(record.expectedReturnDate) : '-'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SealAlertList() {
  const navigate = useNavigate();
  const archiveBoxes = useAppStore((s) => s.archiveBoxes);
  const boxes = useMemo(() => archiveBoxes.filter((b) => b.status === '异常'), [archiveBoxes]);

  if (boxes.length === 0) {
    return (
      <div className="card p-5">
        <h3 className="font-serif text-base font-semibold text-navy-900 mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-gold-500" />
          封条异常
        </h3>
        <div className="py-8 text-center text-gray-400 text-sm">暂无封条异常</div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <h3 className="font-serif text-base font-semibold text-navy-900 mb-4 flex items-center gap-2">
        <AlertTriangle size={18} className="text-gold-500" />
        封条异常
        <span className="ml-auto text-xs font-normal text-gold-700 bg-gold-50 px-2 py-0.5 rounded-full">
          {boxes.length} 箱
        </span>
      </h3>
      <div className="space-y-3">
        {boxes.map((box, idx) => (
          <div
            key={box.id}
            onClick={() => navigate(`/archives/${box.id}`)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors animate-fade-in-up"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="w-10 h-10 rounded-lg bg-gold-50 flex items-center justify-center text-gold-600 flex-shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-navy-800 truncate">{box.boxNumber}</p>
              <p className="text-xs text-gray-500 truncate">
                {box.department} · 柜位 {box.cabinetLocation}
              </p>
            </div>
            <StatusBadge status={box.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuditReminder() {
  const navigate = useNavigate();
  const archiveBoxes = useAppStore((s) => s.archiveBoxes);
  const boxes = useMemo(() => {
    return archiveBoxes
      .filter((b) => b.auditDate)
      .filter((b) => {
        const audit = new Date(b.auditDate!).getTime();
        const now = Date.now();
        const diff = (audit - now) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 30;
      })
      .sort((a, b) => (a.auditDate || '').localeCompare(b.auditDate || ''));
  }, [archiveBoxes]);

  if (boxes.length === 0) {
    return (
      <div className="card p-5">
        <h3 className="font-serif text-base font-semibold text-navy-900 mb-4 flex items-center gap-2">
          <FileSearch size={18} className="text-navy-600" />
          近期审计
        </h3>
        <div className="py-8 text-center text-gray-400 text-sm">30天内暂无审计计划</div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <h3 className="font-serif text-base font-semibold text-navy-900 mb-4 flex items-center gap-2">
        <FileSearch size={18} className="text-navy-600" />
        近期审计（30天内）
        <span className="ml-auto text-xs font-normal text-navy-700 bg-navy-50 px-2 py-0.5 rounded-full">
          {boxes.length} 箱
        </span>
      </h3>
      <div className="space-y-3">
        {boxes.map((box, idx) => {
          const days = daysUntil(box.auditDate!);
          return (
            <div
              key={box.id}
              onClick={() => navigate(`/archives/${box.id}`)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors animate-fade-in-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center text-navy-600 flex-shrink-0">
                <FileSearch size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-navy-800 truncate">{box.boxNumber}</p>
                <p className="text-xs text-gray-500 truncate">
                  {box.clientName || '—'} · 柜位 {box.cabinetLocation}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-xs font-medium ${days <= 7 ? 'text-red-600' : 'text-navy-600'}`}>
                  {days === 0 ? '今天' : `${days} 天后`}
                </p>
                <p className="text-xs text-gray-400">{formatDate(box.auditDate!)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
