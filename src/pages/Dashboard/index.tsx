import { Link } from 'react-router-dom';
import {
  Home as HomeIcon,
  Package,
  Calendar,
  Clock,
  AlertTriangle,
  Droplets,
  Bug,
  Ruler,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '@/store';
import PageContainer from '@/components/Layout/PageContainer';
import PageHeader from '@/components/Layout/PageHeader';
import StatCard from '@/components/Card/StatCard';
import {
  calculateStatistics,
  getReminderTypeLabel,
} from '@/utils/statistics';
import { formatDuration, isOverdueForWash, formatDate, getWashStatusText } from '@/utils/date';
import type { ReminderType } from '@/types';

const reminderIcons: Record<ReminderType, React.ReactNode> = {
  overdue: <Calendar size={20} />,
  mold: <Bug size={20} />,
  track: <Ruler size={20} />,
  missing: <Package size={20} />,
};

const reminderColors: Record<ReminderType, string> = {
  overdue: 'bg-coral-100 text-coral-500',
  mold: 'bg-coral-100 text-coral-500',
  track: 'bg-warm-200 text-primary-700',
  missing: 'bg-primary-100 text-primary-700',
};

export default function Dashboard() {
  const { rooms, curtains, records, reminders } = useAppStore();
  const stats = calculateStatistics(rooms, curtains, records);

  const sortedReminders = [...reminders].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const overdueCurtains = curtains.filter((c) => isOverdueForWash(c.lastWashDate, c.washCycleDays));
  const pendingRecords = records.filter((r) => !r.completed);

  return (
    <PageContainer>
      <PageHeader
        title="窗帘清洗管家"
        subtitle="系统化管理窗帘清洗维护，让家居更整洁"
        actions={
          <Link to="/rooms" className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            开始清洗
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="待清洗房间"
          value={stats.roomsToWash}
          icon={<HomeIcon size={24} />}
          gradient="linear-gradient(135deg, #4A6FA5 0%, #6A86B9 100%)"
          subtitle={`共 ${stats.totalCurtains} 幅窗帘`}
          className="animate-stagger-1"
        />
        <StatCard
          title="缺失配件"
          value={stats.missingPartsTotal}
          icon={<Package size={24} />}
          gradient="linear-gradient(135deg, #E8998D 0%, #EEA39A 100%)"
          subtitle="需及时采购补充"
          className="animate-stagger-2"
        />
        <StatCard
          title="本月清洗"
          value={stats.monthlyWashCount}
          icon={<Droplets size={24} />}
          gradient="linear-gradient(135deg, #9CAF88 0%, #AEC49C 100%)"
          subtitle={`累计完成 ${stats.completedWashes} 次`}
          className="animate-stagger-3"
        />
        <StatCard
          title="平均耗时"
          value={formatDuration(stats.averageWashTime)}
          icon={<Clock size={24} />}
          gradient="linear-gradient(135deg, #DDB388 0%, #E6C7A6 100%)"
          subtitle="每次清洗平均用时"
          className="animate-stagger-4"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card opacity-0 animate-fade-in-up animate-stagger-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl">待清洗窗帘</h2>
              <Link to="/rooms" className="text-primary-500 text-sm flex items-center gap-1 hover:gap-2 transition-all">
                查看全部 <ArrowRight size={16} />
              </Link>
            </div>

            {overdueCurtains.length > 0 ? (
              <div className="space-y-3">
                {overdueCurtains.slice(0, 5).map((curtain, index) => {
                  const room = rooms.find((r) => r.id === curtain.roomId);
                  return (
                    <Link
                      key={curtain.id}
                      to={`/rooms/${curtain.roomId}/curtain/${curtain.id}/wash`}
                      className="flex items-center justify-between p-4 rounded-xl bg-warm-50 hover:bg-warm-100 transition-all group"
                      style={{ animationDelay: `${0.1 * index}s` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl">
                          {room?.icon || '🪟'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-primary-800">
                              {room?.name} - {curtain.name}
                            </p>
                            {curtain.hasMold && (
                              <span className="badge badge-coral flex items-center gap-1" title="有霉点需要处理">
                                <AlertTriangle size={10} />
                                霉点
                              </span>
                            )}
                            {curtain.trackStuck && (
                              <span className="badge badge-warm flex items-center gap-1" title="轨道卡顿需要维护">
                                <AlertTriangle size={10} />
                                卡顿
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            上次清洗：{formatDate(curtain.lastWashDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="badge badge-coral animate-breathing">
                          {getWashStatusText(curtain.lastWashDate, curtain.washCycleDays)}
                        </span>
                        <ArrowRight size={18} className="text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-5xl mb-4">✨</div>
                <p>所有窗帘都很整洁</p>
                <p className="text-sm">暂无待清洗项目</p>
              </div>
            )}
          </div>

          {pendingRecords.length > 0 && (
            <div className="card mt-6 opacity-0 animate-fade-in-up animate-stagger-3">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl">进行中的清洗</h2>
              </div>
              <div className="space-y-3">
                {pendingRecords.map((record, index) => {
                  const curtain = curtains.find((c) => c.id === record.curtainId);
                  const room = rooms.find((r) => r.id === curtain?.roomId);
                  return (
                    <Link
                      key={record.id}
                      to={`/rooms/${curtain?.roomId}/curtain/${curtain?.id}/wash`}
                      className="flex items-center justify-between p-4 rounded-xl bg-primary-50 hover:bg-primary-100 transition-all group"
                      style={{ animationDelay: `${0.1 * index}s` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl">
                          {room?.icon || '🪟'}
                        </div>
                        <div>
                          <p className="font-medium text-primary-800">
                            {room?.name} - {curtain?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            开始于：{formatDate(record.startDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="badge badge-primary animate-breathing">
                          进行中
                        </span>
                        <ArrowRight size={18} className="text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="card opacity-0 animate-fade-in-up animate-stagger-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl flex items-center gap-2">
                <AlertTriangle size={20} className="text-coral-500" />
                提醒事项
              </h2>
              <span className="badge badge-coral">{sortedReminders.length}</span>
            </div>

            {sortedReminders.length > 0 ? (
              <div className="space-y-3">
                {sortedReminders.slice(0, 6).map((reminder, index) => (
                  <div
                    key={reminder.id}
                    className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${0.1 * index + 0.3}s` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${reminderColors[reminder.type]}`}>
                        {reminderIcons[reminder.type]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`badge ${reminder.type === 'overdue' || reminder.type === 'mold' ? 'badge-coral' : 'badge-primary'}`}>
                            {getReminderTypeLabel(reminder.type)}
                          </span>
                          {reminder.priority === 'high' && (
                            <span className="text-coral-500 text-xs font-medium">高优先级</span>
                          )}
                        </div>
                        <p className="text-sm text-primary-700">{reminder.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-5xl mb-4">✅</div>
                <p>暂无提醒</p>
                <p className="text-sm">所有事项都已处理</p>
              </div>
            )}
          </div>

          <div className="card mt-6 opacity-0 animate-fade-in-up animate-stagger-4">
            <h3 className="text-lg mb-4">快捷操作</h3>
            <div className="space-y-3">
              <Link to="/rooms" className="flex items-center gap-3 p-3 rounded-xl bg-primary-50 hover:bg-primary-100 transition-all">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary text-white flex items-center justify-center">
                  <HomeIcon size={20} />
                </div>
                <span className="font-medium text-primary-700">管理房间</span>
              </Link>
              <Link to="/statistics" className="flex items-center gap-3 p-3 rounded-xl bg-sage-50 hover:bg-sage-100 transition-all">
                <div className="w-10 h-10 rounded-xl bg-gradient-sage text-white flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <span className="font-medium text-sage-500">查看统计</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
