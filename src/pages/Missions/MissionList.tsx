import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, MapPin, User, Clock, Filter } from 'lucide-react';
import type { MissionStatus } from '../../types';
import { missionStatusLabels } from '../../types';
import { useMissionStore } from '../../store/missionStore';
import { useEquipmentStore } from '../../store/equipmentStore';
import { formatDate, getStatusColor, getUserName } from '../../utils/helpers';

const statusFilters: (MissionStatus | 'all')[] = ['all', 'draft', 'packing', 'shooting', 'returning', 'completed'];

export function MissionList() {
  const navigate = useNavigate();
  const { missions } = useMissionStore();
  const { users } = useEquipmentStore();

  const [statusFilter, setStatusFilter] = useState<MissionStatus | 'all'>('all');

  const filteredMissions = missions
    .filter(m => statusFilter === 'all' || m.status === statusFilter)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">出行任务</h1>
          <p className="text-neutral-400">管理所有拍摄任务和器材分配</p>
        </div>
        <button
          onClick={() => navigate('/missions/new')}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          创建任务
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={18} className="text-neutral-500" />
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-primary text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
              }`}
            >
              {status === 'all' ? '全部' : missionStatusLabels[status]}
            </button>
          ))}
        </div>
      </div>

      {filteredMissions.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
            <Calendar size={32} className="text-neutral-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">暂无任务</h3>
          <p className="text-neutral-500 mb-4">创建第一个拍摄任务开始管理</p>
          <button
            onClick={() => navigate('/missions/new')}
            className="btn-primary"
          >
            创建任务
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMissions.map((mission, idx) => {
            const leader = getUserName(mission.leaderId, users);
            return (
              <div
                key={mission.id}
                className="card p-5 cursor-pointer hover:translate-y-[-2px] transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${idx * 50}ms` }}
                onClick={() => navigate(`/missions/${mission.id}`)}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar size={28} className="text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {mission.name}
                      </h3>
                      <span className={`status-badge ${getStatusColor(mission.status)}`}>
                        {missionStatusLabels[mission.status]}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {mission.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatDate(mission.startDate)}
                        {mission.startDate !== mission.endDate && ` - ${formatDate(mission.endDate)}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {leader}
                      </span>
                    </div>

                    {mission.notes && (
                      <p className="text-sm text-neutral-500 mt-2 line-clamp-1">
                        {mission.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">
                        {mission.equipmentList.length}
                      </p>
                      <p className="text-xs text-neutral-500">器材</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      {mission.status === 'draft' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/missions/${mission.id}/pack`);
                          }}
                          className="px-3 py-1.5 text-xs bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors"
                        >
                          开始打包
                        </button>
                      )}
                      {mission.status === 'packing' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/missions/${mission.id}/pack`);
                            }}
                            className="px-3 py-1.5 text-xs bg-warning/20 text-warning rounded hover:bg-warning/30 transition-colors"
                          >
                            打包确认
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/missions/${mission.id}/shooting`);
                            }}
                            className="px-3 py-1.5 text-xs bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors"
                          >
                            开始拍摄
                          </button>
                        </>
                      )}
                      {mission.status === 'shooting' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/missions/${mission.id}/shooting`);
                            }}
                            className="px-3 py-1.5 text-xs bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors"
                          >
                            拍摄记录
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/missions/${mission.id}/return`);
                            }}
                            className="px-3 py-1.5 text-xs bg-success/20 text-success rounded hover:bg-success/30 transition-colors"
                          >
                            开始归还
                          </button>
                        </>
                      )}
                      {mission.status === 'returning' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/missions/${mission.id}/return`);
                          }}
                          className="px-3 py-1.5 text-xs bg-success/20 text-success rounded hover:bg-success/30 transition-colors"
                        >
                          归还检查
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="text-sm text-neutral-500 text-center">
        共 {filteredMissions.length} 个任务
      </div>
    </div>
  );
}
