import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, MapPin, CheckCircle, AlertCircle, Ban, History, Play } from 'lucide-react';
import { useFurnitureStore } from '../store/furnitureStore';
import { useInspectionStore } from '../store/inspectionStore';
import { ROOMS, FURNITURE_TYPE_LABELS } from '../types';

export function InspectionList() {
  const furnitureList = useFurnitureStore((state) => state.furnitureList);
  const inspectionRecords = useInspectionStore((state) => state.records);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'tasks' | 'history'>('tasks');

  // 按房间分组统计
  const roomStats = useMemo(() => {
    return ROOMS.map((room) => {
      const roomFurniture = furnitureList.filter((f) => f.room === room);
      const normalCount = roomFurniture.filter((f) => f.status === 'normal').length;
      const problemCount = roomFurniture.filter(
        (f) => f.status === 'pending_repair' || f.status === 'out_of_service'
      ).length;
      const todayRecords = inspectionRecords.filter(
        (r) => r.room === room && r.inspectDate === new Date().toISOString().slice(0, 10)
      );
      const inspectedToday = todayRecords.length > 0;

      return {
        room,
        total: roomFurniture.length,
        normal: normalCount,
        problem: problemCount,
        inspectedToday,
        lastInspectDate: todayRecords.length > 0 ? todayRecords[0].inspectDate : '今日未巡检',
      };
    });
  }, [furnitureList, inspectionRecords]);

  // 历史记录（按日期分组）
  const historyRecords = useMemo(() => {
    const grouped = new Map<string, typeof inspectionRecords>();
    inspectionRecords.forEach((record) => {
      const date = record.inspectDate;
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(record);
    });
    return Array.from(grouped.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [inspectionRecords]);

  return (
    <div className="space-y-6">
      {/* 顶部 */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">巡检管理</h1>
        <p className="text-sm text-gray-500 mt-1">按房间逐件巡检，及时发现问题</p>
      </div>

      {/* 标签切换 */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'tasks'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" />
            巡检任务
          </span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span className="flex items-center gap-2">
            <History className="w-4 h-4" />
            巡检记录
          </span>
        </button>
      </div>

      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {roomStats.map((stat) => (
            <div key={stat.room} className="card card-hover overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-secondary-50 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-secondary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{stat.room}</h3>
                      <p className="text-sm text-gray-500">{stat.total} 件设施</p>
                    </div>
                  </div>
                  {stat.inspectedToday ? (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      今日已巡检
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                      <AlertCircle className="w-3 h-3" />
                      待巡检
                    </span>
                  )}
                </div>

                {/* 状态统计 */}
                <div className="flex gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-600">
                      正常 <span className="font-medium text-gray-800">{stat.normal}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm text-gray-600">
                      异常 <span className="font-medium text-gray-800">{stat.problem}</span>
                    </span>
                  </div>
                </div>

                {/* 进度条 */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-secondary-400 to-secondary-600 rounded-full transition-all"
                    style={{ width: `${(stat.normal / stat.total) * 100}%` }}
                  ></div>
                </div>

                <p className="text-xs text-gray-400 mb-4">
                  上次巡检：{stat.lastInspectDate}
                </p>

                <button
                  onClick={() => navigate(`/inspection/${stat.room}`)}
                  className="w-full btn btn-secondary flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {stat.inspectedToday ? '重新巡检' : '开始巡检'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          {historyRecords.length > 0 ? (
            historyRecords.map(([date, records]) => (
              <div key={date} className="card overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="font-medium text-gray-800">{date}</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {records.map((record) => {
                    const furniture = furnitureList.find((f) => f.id === record.furnitureId);
                    return (
                      <div key={record.id} className="px-5 py-3 flex items-center gap-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            record.result === 'normal'
                              ? 'bg-green-100 text-green-600'
                              : record.result === 'issue'
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {record.result === 'normal' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : record.result === 'issue' ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : (
                            <Ban className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{record.furnitureId}</p>
                          <p className="text-xs text-gray-500">
                            {furniture?.room} · {FURNITURE_TYPE_LABELS[furniture?.type || 'table']}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-700">巡检员：{record.inspector}</p>
                          {record.remark && (
                            <p className="text-xs text-gray-500">{record.remark}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="card p-12 text-center">
              <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">暂无巡检记录</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
