import { CheckCircle, AlertTriangle, Phone, ArrowRightCircle, Clock, Camera } from 'lucide-react';
import type { PatrolRecord, StrollerStatus } from '@/types';
import { STATUS_OPTIONS } from '@/utils/constants';
import { formatDateTime, cn, getStatusConfig } from '@/utils/helpers';

interface Props {
  records: PatrolRecord[];
}

const statusIconMap: Record<StrollerStatus, React.ReactNode> = {
  normal: <CheckCircle className="w-4 h-4" />,
  blocking: <AlertTriangle className="w-4 h-4" />,
  pending: <Phone className="w-4 h-4" />,
  moved: <ArrowRightCircle className="w-4 h-4" />,
};

export default function Timeline({ records }: Props) {
  if (records.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm">
        <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
        暂无巡查记录
      </div>
    );
  }

  return (
    <div className="relative pl-2">
      <div className="absolute left-[18px] top-2 bottom-2 w-px bg-slate-200" />
      <div className="space-y-5">
        {records.map((r, idx) => {
          const cfg = getStatusConfig(r.status);
          return (
            <div
              key={r.id}
              className="relative pl-12 animate-fade-in-up"
              style={{ animationDelay: `${Math.min(idx * 60, 400)}ms` }}
            >
              <div
                className={cn(
                  'absolute left-0 top-0.5 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md',
                  cfg.bgClass
                )}
              >
                {statusIconMap[r.status]}
              </div>
              <div className={cn('card p-4 border-l-4', cfg.borderClass)}>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={cfg.badge}>{STATUS_OPTIONS.find((s) => s.value === r.status)?.label}</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(r.createdAt)}
                  </span>
                </div>
                {r.remark && (
                  <p className="text-sm text-slate-700 leading-relaxed mb-3">{r.remark}</p>
                )}
                {r.handleTime && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg mb-3 w-fit">
                    <Clock className="w-3.5 h-3.5" />
                    处理时间：{formatDateTime(r.handleTime)}
                  </div>
                )}
                {r.scenePhotos.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                      <Camera className="w-3.5 h-3.5" />
                      现场照片 ({r.scenePhotos.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {r.scenePhotos.map((p, i) => (
                        <img
                          key={i}
                          src={p}
                          alt=""
                          className="w-20 h-20 object-cover rounded-lg border border-slate-200 hover:scale-110 transition-transform cursor-pointer"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
