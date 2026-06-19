import { Link } from 'react-router-dom';
import { Plus, MapPin, Ruler, Droplets, Layers, Calendar, ChevronRight } from 'lucide-react';
import { useAreaStore } from '../../store/useAreaStore';
import { useInspectionStore } from '../../store/useInspectionStore';
import { useTaskStore } from '../../store/useTaskStore';
import { checkRepeatedAnomaly } from '../../utils/anomaly';
import { formatDate } from '../../utils/date';

export default function AreaList() {
  const { areas } = useAreaStore();
  const { inspections } = useInspectionStore();
  const { tasks } = useTaskStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-800 mb-1">区域档案</h2>
          <p className="text-gray-500 text-sm">管理露台区域的基础信息</p>
        </div>
        <Link
          to="/areas/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          新增区域
        </Link>
      </div>

      {areas.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary-50 flex items-center justify-center mb-4">
            <MapPin className="w-10 h-10 text-primary-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">还没有区域档案</h3>
          <p className="text-gray-500 text-sm mb-6">添加第一个露台区域开始记录防水状况</p>
          <Link
            to="/areas/new"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            新增区域
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {areas.map((area, index) => {
            const hasRepeatedAnomaly = checkRepeatedAnomaly(area.id, inspections);
            const areaTasks = tasks.filter(
              (t) => t.areaId === area.id && t.status !== 'completed'
            );
            const latestInspection = inspections
              .filter((i) => i.areaId === area.id)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

            return (
              <Link
                key={area.id}
                to={`/areas/${area.id}`}
                className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slide-up ${
                  hasRepeatedAnomaly ? 'ring-2 ring-danger-500 animate-glow-red' : ''
                }`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="relative h-44 bg-gradient-to-br from-primary-100 to-primary-50 overflow-hidden">
                  {area.photos.length > 0 ? (
                    <img
                      src={area.photos[0]}
                      alt={area.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPin className="w-16 h-16 text-primary-200" />
                    </div>
                  )}
                  {hasRepeatedAnomaly && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-danger-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      连续异常
                    </div>
                  )}
                  {areaTasks.length > 0 && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-warning-500 text-white text-xs font-bold rounded-lg shadow-lg">
                      {areaTasks.length} 个待办
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-serif text-lg font-bold text-gray-800 group-hover:text-primary-600 transition-colors">
                      {area.name}
                    </h3>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-primary-400" />
                      <span>朝向 {area.orientation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Ruler className="w-4 h-4 text-primary-400" />
                      <span>{area.areaSize} ㎡</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Droplets className="w-4 h-4 text-primary-400" />
                      <span>地漏 {area.drainCount} 个</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Layers className="w-4 h-4 text-primary-400" />
                      <span className="truncate">{area.pavingMaterial}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>上次维修：{area.lastRepairDate ? formatDate(area.lastRepairDate) : '无记录'}</span>
                    </div>
                    {latestInspection && (
                      <span className="text-gray-400">
                        最近检查：{formatDate(latestInspection.inspectionDate)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
