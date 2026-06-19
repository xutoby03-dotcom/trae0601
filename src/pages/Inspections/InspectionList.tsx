import { Link } from 'react-router-dom';
import { CloudRain, MapPin, ChevronRight, ClipboardCheck, AlertTriangle } from 'lucide-react';
import { useAreaStore } from '../../store/useAreaStore';
import { useInspectionStore } from '../../store/useInspectionStore';
import { useRainEventStore } from '../../store/useRainEventStore';
import { checkRepeatedAnomaly } from '../../utils/anomaly';
import { formatDate } from '../../utils/date';
import StatusBadge from '../../components/StatusBadge';

export default function InspectionList() {
  const { areas } = useAreaStore();
  const { inspections } = useInspectionStore();
  const { rainEvents, getLatestRainEvent } = useRainEventStore();

  const latestRain = getLatestRainEvent();
  const checkedAreaIds = latestRain
    ? inspections.filter((i) => i.rainEventId === latestRain.id).map((i) => i.areaId)
    : [];
  const uncheckedAreas = areas.filter((a) => !checkedAreaIds.includes(a.id));
  const checkedAreas = areas.filter((a) => checkedAreaIds.includes(a.id));

  const allInspections = [...inspections].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="animate-slide-up">
        <h2 className="font-serif text-2xl font-bold text-gray-800 mb-1">雨后检查</h2>
        <p className="text-gray-500 text-sm">暴雨后对各区域进行防水排查</p>
      </div>

      {latestRain && !latestRain.allChecked && (
        <div className="bg-gradient-to-r from-blue-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg animate-slide-up">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CloudRain className="w-6 h-6" />
                <span className="font-serif text-xl font-bold">
                  {formatDate(latestRain.date)} 暴雨记录
                </span>
              </div>
              <p className="text-blue-100 text-sm">
                {latestRain.duration} · {latestRain.intensity === 'storm' ? '暴雨' : '大雨'} · 还有 {uncheckedAreas.length} 个区域待检查
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm animate-slide-up" style={{ animationDelay: '100ms' }}>
        <h3 className="font-serif text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-warning-500" />
          待检查区域
          {uncheckedAreas.length > 0 && (
            <span className="px-2 py-0.5 bg-warning-100 text-warning-600 text-xs rounded-full">
              {uncheckedAreas.length}
            </span>
          )}
        </h3>

        {uncheckedAreas.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-success-50 flex items-center justify-center mb-3">
              <ClipboardCheck className="w-8 h-8 text-success-500" />
            </div>
            <p className="text-gray-600 font-medium">所有区域已完成检查</p>
            <p className="text-sm text-gray-400 mt-1">干得漂亮！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uncheckedAreas.map((area) => {
              const hasRepeatedAnomaly = checkRepeatedAnomaly(area.id, inspections);
              return (
                <Link
                  key={area.id}
                  to={`/inspections/${area.id}`}
                  className={`relative p-4 rounded-xl border-2 transition-all group ${
                    hasRepeatedAnomaly
                      ? 'border-danger-400 bg-danger-50 hover:border-danger-500'
                      : 'border-warning-200 bg-warning-50 hover:border-warning-400'
                  }`}
                >
                  {hasRepeatedAnomaly && (
                    <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-danger-500 text-white text-xs font-bold rounded-full">
                      ⚠ 重点关注
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                        <MapPin className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{area.name}</p>
                        <p className="text-xs text-gray-500">
                          朝向 {area.orientation} · {area.areaSize}㎡
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {checkedAreas.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h3 className="font-serif text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-success-500" />
            本次暴雨已完成
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {checkedAreas.map((area) => {
              const latestInsp = inspections
                .filter((i) => i.areaId === area.id && i.rainEventId === latestRain?.id)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
              return (
                <div
                  key={area.id}
                  className={`p-4 rounded-xl border ${
                    latestInsp?.hasAnomaly
                      ? 'border-danger-200 bg-danger-50/50'
                      : 'border-success-200 bg-success-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary-500" />
                      <span className="font-bold text-gray-800">{area.name}</span>
                    </div>
                    {latestInsp?.hasAnomaly ? (
                      <span className="text-xs px-2 py-0.5 bg-danger-500 text-white rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        异常
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-success-500 text-white rounded-full">
                        正常
                      </span>
                    )}
                  </div>
                  {latestInsp && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge type="drain" value={latestInsp.drainStatus} />
                      <StatusBadge type="damp" value={latestInsp.wallDampLevel} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm animate-slide-up" style={{ animationDelay: '300ms' }}>
        <h3 className="font-serif text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <CloudRain className="w-5 h-5 text-primary-500" />
          历史检查记录
        </h3>
        {allInspections.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">暂无历史检查记录</p>
        ) : (
          <div className="space-y-3">
            {allInspections.slice(0, 10).map((insp) => {
              const area = areas.find((a) => a.id === insp.areaId);
              const rainEvent = rainEvents.find((r) => r.id === insp.rainEventId);
              return (
                <Link
                  key={insp.id}
                  to={`/inspections/${insp.areaId}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      insp.hasAnomaly ? 'bg-danger-100' : 'bg-success-100'
                    }`}>
                      {insp.hasAnomaly ? (
                        <AlertTriangle className="w-5 h-5 text-danger-600" />
                      ) : (
                        <ClipboardCheck className="w-5 h-5 text-success-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800">{area?.name || '未知区域'}</p>
                        {rainEvent && <StatusBadge type="rain" value={rainEvent.intensity} />}
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatDate(insp.inspectionDate)}
                        {rainEvent && ` · ${rainEvent.duration}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2">
                      <StatusBadge type="drain" value={insp.drainStatus} />
                      <StatusBadge type="damp" value={insp.wallDampLevel} />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
