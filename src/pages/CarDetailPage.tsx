import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, Calendar, ShieldAlert } from 'lucide-react';
import { useStrollerStore } from '@/store/useStrollerStore';
import Timeline from '@/components/Timeline';
import PatrolModal from '@/components/PatrolModal';
import StrollerForm from '@/components/StrollerForm';
import { getBadgeClass, formatDate, relativeTime, daysBetween, cn } from '@/utils/helpers';
import { LONG_TERM_THRESHOLD_DAYS } from '@/utils/constants';

export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getStrollerById, getRecordsByStrollerId, setActivePatrol, setActiveForm } =
    useStrollerStore();

  const stroller = id ? getStrollerById(id) : undefined;
  const records = id ? getRecordsByStrollerId(id) : [];

  if (!stroller) {
    return <Navigate to="/" replace />;
  }

  const unclaimDays = daysBetween(stroller.updatedAt);
  const isUnclaimed = unclaimDays > LONG_TERM_THRESHOLD_DAYS && stroller.status !== 'moved';

  return (
    <div className="min-h-screen pb-16 bg-slate-50">
      <div className="container py-6">
        <Link to="/" className="btn-ghost -ml-3 mb-4 animate-fade-in-up">
          <ArrowLeft className="w-4 h-4" />
          返回车辆看板
        </Link>

        <div className="card overflow-hidden animate-fade-in-up">
          <div className="relative h-80 md:h-96 bg-gradient-to-br from-slate-100 to-slate-200">
            {stroller.photos[0] ? (
              <img
                src={stroller.photos[0]}
                alt={stroller.model}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-lg">
                暂无车辆照片
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {stroller.isFireExit && (
                <span className="badge-fire shadow-md backdrop-blur-md bg-white/95">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  消防通道区域
                </span>
              )}
              {stroller.isLongTerm && (
                <span className="badge bg-purple-50 text-purple-700 border-purple-200 shadow-md backdrop-blur-md bg-white/95">
                  <Calendar className="w-3.5 h-3.5" />
                  长期停放
                </span>
              )}
              {isUnclaimed && (
                <span className="badge bg-orange-50 text-orange-700 border-orange-200 shadow-md backdrop-blur-md bg-white/95 animate-pulse">
                  ⚠️ {unclaimDays} 天未更新
                </span>
              )}
            </div>
            <div className="absolute top-4 right-4">
              <span
                className={cn(
                  getBadgeClass(stroller.status),
                  '!px-4 !py-2 !text-sm shadow-lg backdrop-blur-md bg-white/95'
                )}
              >
                {stroller.status === 'normal' && '停放正常'}
                {stroller.status === 'blocking' && '⚠️ 挡路占道'}
                {stroller.status === 'pending' && '📞 待联系车主'}
                {stroller.status === 'moved' && '✅ 已挪走'}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-1">
                {stroller.building} {stroller.room}
              </h1>
              <div className="text-lg opacity-90 mb-1">{stroller.ownerName}</div>
              <div className="flex flex-wrap items-center gap-4 text-sm opacity-80">
                <span>📞 {stroller.phone}</span>
                <span>📍 {stroller.location}</span>
                <span>🚼 {stroller.model}（{stroller.color}）</span>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={() => setActivePatrol(stroller.id)}
                className={cn(
                  'btn',
                  stroller.status === 'blocking' ? 'btn-danger' : 'btn-warning'
                )}
              >
                <ShieldAlert className="w-4 h-4" />
                巡查标记
              </button>
              <button onClick={() => setActiveForm(stroller.id)} className="btn-primary">
                编辑车辆信息
              </button>
            </div>

            {stroller.photos.length > 1 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-slate-800 mb-4">车辆相册</h2>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {stroller.photos.map((p, i) => (
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <InfoTile label="登记时间" value={formatDate(stroller.createdAt)} />
              <InfoTile label="最后更新" value={relativeTime(stroller.updatedAt)} />
              <InfoTile label="巡查记录" value={`${records.length} 条`} />
              <InfoTile
                label="停放时长"
                value={`${daysBetween(stroller.createdAt)} 天`}
                highlight={daysBetween(stroller.createdAt) > 30}
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-brand-600" />
                巡查记录时间线
              </h2>
              <Timeline records={records} />
            </div>
          </div>
        </div>
      </div>

      <PatrolModal />
      <StrollerForm />
    </div>
  );
}

function InfoTile({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'p-4 rounded-xl border',
        highlight ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'
      )}
    >
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div
        className={cn(
          'text-lg font-bold',
          highlight ? 'text-amber-700' : 'text-slate-800'
        )}
      >
        {value}
      </div>
    </div>
  );
}
