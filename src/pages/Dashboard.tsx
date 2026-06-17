import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Plus, Car, Armchair, ClipboardCheck, 
  BarChart3, ListTodo, Bell, AlertTriangle, 
  CheckCircle, ChevronRight, TrendingUp
} from 'lucide-react';
import { useEffect } from 'react';
import { useVehicleStore } from '@/store/useVehicleStore';
import { useSeatStore } from '@/store/useSeatStore';
import { useInspectionStore } from '@/store/useInspectionStore';
import { useTaskStore } from '@/store/useTaskStore';
import { useReminderStore } from '@/store/useReminderStore';
import { useChildProfileStore } from '@/store/useChildProfileStore';
import { useInstallationStore } from '@/store/useInstallationStore';
import { initMockData } from '@/mock';
import ReminderBadge from '@/components/common/ReminderBadge';
import { getInspectionStats, getLongestUnrecheckedVehicle, getExpiringSeats } from '@/utils/statistics';
import { formatDate, formatDateTime } from '@/utils/date';
import { generateAllReminders } from '@/utils/reminder';
import { INSPECTION_ITEMS } from '@/types';

export default function Dashboard() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle, getVehicleById, setVehicles } = useVehicleStore();
  const { seats, addSeat, updateSeat, deleteSeat, getSeatById, setSeats } = useSeatStore();
  const { installations, addInstallation, updateInstallation, setInstallations } = useInstallationStore();
  const { inspections, addInspection, setInspections } = useInspectionStore();
  const { tasks, addTask, completeTask, getPendingTasks, setTasks } = useTaskStore();
  const { reminders, addReminder, getActiveReminders, refreshReminders, setReminders } = useReminderStore();
  const { childProfile, setChildProfile, setChildProfileDirect } = useChildProfileStore();

  useEffect(() => {
    if (vehicles.length === 0 && seats.length === 0) {
      initMockData(
        setVehicles,
        setSeats,
        setInstallations,
        setInspections,
        setTasks,
        setReminders,
        setChildProfileDirect
      );
    }
  }, []);

  useEffect(() => {
    if (seats.length > 0) {
      const newReminders = generateAllReminders(seats, inspections, childProfile || undefined);
      refreshReminders(newReminders);
    }
  }, [seats, inspections, childProfile]);

  const activeReminders = getActiveReminders();
  const pendingTasks = getPendingTasks();
  const inspectionStats = getInspectionStats(inspections);
  const longestUnrechecked = getLongestUnrecheckedVehicle(vehicles, installations, inspections, seats);
  const expiringSeats = getExpiringSeats(seats, 180);
  const recentInspections = [...inspections]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const quickActions = [
    { label: '新增车辆', icon: Car, path: '/vehicles/new', color: 'from-blue-500 to-blue-600' },
    { label: '新增座椅', icon: Armchair, path: '/seats/new', color: 'from-emerald-500 to-emerald-600' },
    { label: '开始检查', icon: ClipboardCheck, path: '/inspection', color: 'from-primary-500 to-primary-600' },
    { label: '查看统计', icon: BarChart3, path: '/statistics', color: 'from-purple-500 to-purple-600' },
  ];

  const statCards = [
    { 
      label: '车辆数量', 
      value: vehicles.length, 
      icon: Car, 
      color: 'bg-blue-50 text-blue-600',
      bgIcon: 'bg-blue-100'
    },
    { 
      label: '座椅数量', 
      value: seats.length, 
      icon: Armchair, 
      color: 'bg-emerald-50 text-emerald-600',
      bgIcon: 'bg-emerald-100'
    },
    { 
      label: '待办任务', 
      value: pendingTasks.length, 
      icon: ListTodo, 
      color: 'bg-amber-50 text-amber-600',
      bgIcon: 'bg-amber-100'
    },
    { 
      label: '检查通过率', 
      value: `${inspectionStats.passRate.toFixed(0)}%`, 
      icon: CheckCircle, 
      color: 'bg-emerald-50 text-emerald-600',
      bgIcon: 'bg-emerald-100'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-500">
            安全座椅管家
          </h1>
          <p className="text-gray-500 mt-1">
            确保每次出行，孩子安全出行安全第一
          </p>
        </div>
        <Link to="/inspection" className="btn-primary w-full sm:w-auto">
          <ClipboardCheck className="w-4 h-4 mr-2" />
          开始安装检查
        </Link>
      </div>

      {activeReminders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                待处理提醒 ({activeReminders.length})
              </h2>
            </div>
            <Link to="/reminders" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              查看全部
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {activeReminders.slice(0, 4).map((reminder, index) => (
              <ReminderBadge key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div 
            key={stat.label}
            className="card p-4 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bgIcon} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color.split(' ')[1]}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          快速操作
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={action.label}
              to={action.path}
              className="card card-hover p-4 flex flex-col items-center text-center animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center mb-3`}>
                <action.icon className="w-7 h-7 text-white" />
              </div>
              <span className="font-medium text-gray-900">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {longestUnrechecked && longestUnrechecked.status !== 'normal' && (
          <div className="card p-5 animate-fade-in-up">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">最久未复查车辆</h3>
                <p className="text-sm text-gray-500">
                  {longestUnrechecked.vehicle.brand} {longestUnrechecked.vehicle.model}
                </p>
              </div>
              <span className={`badge ${longestUnrechecked.status === 'danger' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                {longestUnrechecked.daysSinceLastInspection} 天未检查
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <span>上次检查: {longestUnrechecked.lastInspection 
                ? formatDate(longestUnrechecked.lastInspection.date)
                : '暂无记录'}
              </span>
            </div>
            <Link to="/inspection" className="btn-primary text-sm py-1.5 px-3">
              立即检查
            </Link>
          </div>
        )}

        {expiringSeats.length > 0 && (
          <div className="card p-5 animate-fade-in-up">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">即将过期座椅</h3>
                <p className="text-sm text-gray-500">
                  {expiringSeats.length} 个座椅即将过期
                </p>
              </div>
            </div>
            <div className="space-y-2 mb-3">
              {expiringSeats.slice(0, 2).map((info) => (
                <div key={info.seat.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">
                    {info.seat.brand} {info.seat.model}
                  </span>
                  <span className={`font-medium ${info.status === 'danger' ? 'text-red-600' : 'text-amber-600'}`}>
                    剩余 {info.daysUntilExpiry} 天
                  </span>
                </div>
              ))}
            </div>
            <Link to="/seats" className="text-sm text-primary-600 hover:text-primary-700 flex items-center justify-center gap-1">
              查看全部
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            最近检查记录
          </h2>
          <Link to="/inspection" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
            查看全部
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="card divide-y divide-gray-100">
          {recentInspections.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              暂无检查记录
            </div>
          ) : (
            recentInspections.map((inspection, index) => {
              const installation = installations.find(i => i.id === inspection.installationId);
              const vehicle = installation ? vehicles.find(v => v.id === installation.vehicleId) : null;
              const seat = installation ? seats.find(s => s.id === installation.seatId) : null;
              const passedCount = INSPECTION_ITEMS.filter(item => inspection[item.key].checked).length;

              return (
                <div key={inspection.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        inspection.passed ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        {inspection.passed 
                          ? <CheckCircle className="w-5 h-5 text-emerald-600" />
                          : <AlertTriangle className="w-5 h-5 text-red-600" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {vehicle?.brand} {vehicle?.model} - {seat?.brand} {seat?.model}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDateTime(inspection.date)} · {passedCount}/6 项通过
                        </p>
                      </div>
                    </div>
                    <span className={`badge ${inspection.passed ? 'badge-success' : 'badge-danger'}`}>
                      {inspection.passed ? '检查通过' : '需要调整'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
