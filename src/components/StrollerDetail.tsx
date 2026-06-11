import {
  X,
  Building2,
  Phone,
  MapPin,
  Palette,
  Calendar,
  ShieldAlert,
  Tag,
  Edit2,
  AlertTriangle,
} from 'lucide-react';
import { useStrollerStore } from '@/store/useStrollerStore';
import Timeline from './Timeline';
import { getBadgeClass, formatDate, relativeTime, daysBetween, cn } from '@/utils/helpers';
import { LONG_TERM_THRESHOLD_DAYS } from '@/utils/constants';

export default function StrollerDetail() {
  const { activeDetailStrollerId, setActiveDetail, getStrollerById, getRecordsByStrollerId, setActivePatrol, setActiveForm } =
    useStrollerStore();
  const stroller = activeDetailStrollerId ? getStrollerById(activeDetailStrollerId) : null;
  const records = activeDetailStrollerId ? getRecordsByStrollerId(activeDetailStrollerId) : [];

  const isOpen = activeDetailStrollerId !== null;
  if (!isOpen || !stroller) return null;

  const unclaimDays = daysBetween(stroller.updatedAt);
  const isUnclaimed = unclaimDays > LONG_TERM_THRESHOLD_DAYS && stroller.status !== 'moved';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-up"
      onClick={() => setActiveDetail(null)}
    >
      <div
        className="w-full max-w-3xl max-h-[92vh] overflow-y-auto card animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-72 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
          {stroller.photos[0] ? (
            <img
              src={stroller.photos[0]}
              alt={stroller.model}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              暂无车辆照片
            </div>
          )}
          {stroller.photos.length > 1 && (
            <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 text-white rounded-full text-xs backdrop-blur-sm">
              共 {stroller.photos.length} 张照片
            </div>
          )}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {stroller.isFireExit && (
              <span className="badge-fire shadow-md backdrop-blur-sm bg-white/95">
                <ShieldAlert className="w-3.5 h-3.5" />
                消防通道区域
              </span>
            )}
            {stroller.isLongTerm && (
              <span className="badge bg-purple-50 text-purple-700 border-purple-200 shadow-md backdrop-blur-sm bg-white/95">
                <Calendar className="w-3.5 h-3.5" />
                长期停放
              </span>
            )}
            {isUnclaimed && (
              <span className="badge bg-orange-50 text-orange-700 border-orange-200 shadow-md backdrop-blur-sm bg-white/95 animate-pulse">
                ⚠️ 超过 {unclaimDays} 天未更新
              </span>
            )}
            <span className={cn(getBadgeClass(stroller.status), 'shadow-md backdrop-blur-sm bg-white/95')}>
              {stroller.status === 'normal' && '正常'}
              {stroller.status === 'blocking' && '挡路'}
              {stroller.status === 'pending' && '待联系'}
              {stroller.status === 'moved' && '已挪走'}
            </span>
          </div>
          <button
            onClick={() => setActiveDetail(null)}
            className="absolute top-3 right-3 p-2 rounded-xl bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                <Building2 className="inline w-6 h-6 mr-2 -mt-1 text-brand-600" />
                {stroller.building} {stroller.room}
              </h2>
              <div className="text-slate-500 mt-1">{stroller.ownerName}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveDetail(null);
                  setActivePatrol(stroller.id);
                }}
                className={cn(
                  'btn',
                  stroller.status === 'blocking' ? 'btn-danger' : 'btn-warning'
                )}
              >
                <AlertTriangle className="w-4 h-4" />
                巡查标记
              </button>
              <button
                onClick={() => {
                  setActiveDetail(null);
                  setActiveForm(stroller.id);
                }}
                className="btn-primary"
              >
                <Edit2 className="w-4 h-4" />
                编辑信息
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoItem
              icon={<Phone className="w-4 h-4" />}
              label="联系电话"
              value={stroller.phone}
            />
            <InfoItem
              icon={<MapPin className="w-4 h-4" />}
              label="停放位置"
              value={stroller.location}
              highlight={stroller.isFireExit}
            />
            <InfoItem
              icon={<Tag className="w-4 h-4" />}
              label="车型"
              value={stroller.model}
            />
            <InfoItem
              icon={<Palette className="w-4 h-4" />}
              label="颜色"
              value={stroller.color}
            />
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              登记时间：{formatDate(stroller.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              最后更新：{relativeTime(stroller.updatedAt)}
              {isUnclaimed && (
                <span className="text-orange-600 font-medium ml-1">（{unclaimDays} 天）</span>
              )}
            </span>
            <span className="flex items-center gap-1.5">
              巡查记录：{records.length} 条
            </span>
          </div>

          {stroller.photos.length > 1 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">更多照片</h3>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {stroller.photos.slice(1).map((p, i) => (
                  <img
                    key={i}
                    src={p}
                    alt=""
                    className="w-full aspect-square object-cover rounded-xl border border-slate-200 hover:scale-105 transition-transform cursor-pointer"
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-brand-600" />
              巡查记录时间线
            </h3>
            <Timeline records={records} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'p-4 rounded-xl border transition-all',
        highlight
          ? 'bg-red-50 border-red-100'
          : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-brand-200'
      )}
    >
      <div
        className={cn(
          'text-xs font-medium flex items-center gap-1.5 mb-1',
          highlight ? 'text-red-600' : 'text-slate-500'
        )}
      >
        {icon}
        {label}
      </div>
      <div className={cn('text-base font-semibold', highlight ? 'text-red-700' : 'text-slate-800')}>
        {value}
      </div>
    </div>
  );
}
