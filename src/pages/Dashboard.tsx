import { Link } from 'react-router-dom';
import {
  Users,
  UtensilsCrossed,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChefHat,
  ScanQrCode,
  BarChart3,
  UserPlus,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import { useStudentStore } from '@/stores/studentStore';
import { usePrepStore } from '@/stores/prepStore';
import { usePickupStore } from '@/stores/pickupStore';
import { useMenuStore } from '@/stores/menuStore';
import AllergyBadge from '@/components/allergy/AllergyBadge';
import { MEAL_TYPE_META } from '@/types';

export default function Dashboard() {
  const { students } = useStudentStore();
  const { getTodayPrepItems } = usePrepStore();
  const { getTodayStats } = usePickupStore();
  const { getCurrentMenu } = useMenuStore();
  const todayPrepItems = getTodayPrepItems();
  const todayStats = getTodayStats();
  const todayMenu = getCurrentMenu();

  const unconfirmedStudents = students.filter((s) => !s.guardianConfirmed);
  const severeAllergyStudents = students.filter((s) =>
    s.allergies.some((a) => a.severity === 'severe')
  );

  const stats = [
    {
      label: '过敏学生总数',
      value: students.length,
      icon: Users,
      color: 'from-primary-400 to-primary-600',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-600',
      sub: `${severeAllergyStudents.length} 名严重过敏`,
    },
    {
      label: '今日过敏餐份数',
      value: todayPrepItems.length,
      icon: UtensilsCrossed,
      color: 'from-info-400 to-info-600',
      bgColor: 'bg-info-50',
      textColor: 'text-info-600',
      sub: `覆盖 ${new Set(todayPrepItems.map((p) => p.studentId)).size} 名学生`,
    },
    {
      label: '已领取',
      value: todayStats.picked,
      icon: CheckCircle2,
      color: 'from-primary-400 to-success-600',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-600',
      sub: todayStats.total > 0 ? `${Math.round((todayStats.picked / todayStats.total) * 100)}% 领取率` : '-',
    },
    {
      label: '待处理异常',
      value: todayStats.notPicked + todayStats.wrongPick,
      icon: AlertTriangle,
      color: 'from-warning-400 to-danger-500',
      bgColor: todayStats.notPicked + todayStats.wrongPick > 0 ? 'bg-danger-50' : 'bg-slate-50',
      textColor: todayStats.notPicked + todayStats.wrongPick > 0 ? 'text-danger-600' : 'text-slate-500',
      pulse: todayStats.notPicked + todayStats.wrongPick > 0,
    },
  ];

  const quickActions = [
    { icon: UserPlus, label: '新增学生档案', path: '/students/new', color: 'bg-primary-500 hover:bg-primary-600' },
    { icon: ChefHat, label: '后厨备餐', path: '/kitchen', color: 'bg-info-500 hover:bg-info-600' },
    { icon: ScanQrCode, label: '领取登记', path: '/pickup', color: 'bg-warning-500 hover:bg-warning-600' },
    { icon: BarChart3, label: '数据统计', path: '/statistics', color: 'bg-slate-700 hover:bg-slate-800' },
  ];

  const mealTypes: ('breakfast' | 'lunch' | 'dinner')[] = ['breakfast', 'lunch', 'dinner'];

  return (
    <div className="space-y-6">
      {unconfirmedStudents.length > 0 && (
        <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-warning-800">
              有 {unconfirmedStudents.length} 名学生档案等待监护人确认
            </p>
            <p className="text-sm text-warning-600 mt-1">
              请及时联系家长完成确认，确保学生用餐安全
            </p>
          </div>
          <Link to="/students" className="btn-warning text-sm">
            查看详情
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`card ${stat.pulse ? 'ring-2 ring-danger-300 animate-pulse-soft' : ''}`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                    <p className={`text-3xl font-bold mt-2 ${stat.textColor}`}>{stat.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl ${stat.bgColor} bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
                  >
                    <Icon size={22} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="card-header">
            <h3 className="font-semibold text-slate-800">今日备餐进度</h3>
            <Link to="/kitchen" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              查看全部 <ArrowRight size={14} />
            </Link>
          </div>
          <div className="card-body">
            <div className="space-y-5">
              {mealTypes.map((mealType) => {
                const items = todayPrepItems.filter((p) => p.mealType === mealType);
                const ready = items.filter((p) => p.status === 'ready' || p.status === 'picked').length;
                const progress = items.length > 0 ? Math.round((ready / items.length) * 100) : 0;
                const meta = MEAL_TYPE_META[mealType];

                return (
                  <div key={mealType}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{meta.icon}</span>
                        <span className="font-medium text-slate-700">{meta.name}</span>
                        <span className="text-xs text-slate-400">共 {items.length} 份</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-600">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {items.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {items.slice(0, 5).map((item) => (
                          <span
                            key={item.id}
                            className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600"
                          >
                            {item.studentName}
                          </span>
                        ))}
                        {items.length > 5 && (
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-400">
                            +{items.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-slate-800">快捷操作</h3>
          </div>
          <div className="card-body grid grid-cols-2 gap-3">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link
                  key={idx}
                  to={action.path}
                  className={`${action.color} text-white rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-lg transition-all hover:-translate-y-0.5`}
                >
                  <Icon size={24} />
                  <span className="text-sm font-medium">{action.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-danger-500" />
              <h3 className="font-semibold text-slate-800">严重过敏学生</h3>
            </div>
            <Link to="/students" className="text-sm text-primary-600 hover:text-primary-700">
              全部档案
            </Link>
          </div>
          <div className="divide-y divide-slate-100 max-h-80 overflow-auto">
            {severeAllergyStudents.slice(0, 6).map((student) => (
              <div key={student.id} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-danger-400 to-warning-500 flex items-center justify-center text-white text-sm font-bold">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{student.name}</p>
                    <p className="text-xs text-slate-400">{student.className} · {student.studentNo}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap justify-end max-w-[180px]">
                  {student.allergies.slice(0, 2).map((allergy) => (
                    <AllergyBadge
                      key={allergy.id}
                      type={allergy.type}
                      severity={allergy.severity}
                      size="sm"
                      showIcon={false}
                    />
                  ))}
                  {student.allergies.length > 2 && (
                    <span className="text-xs text-slate-400">+{student.allergies.length - 2}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-slate-800">今日菜单预览</h3>
            <Link to="/menu" className="text-sm text-primary-600 hover:text-primary-700">
              配置菜单
            </Link>
          </div>
          <div className="card-body">
            {todayMenu ? (
              <div className="grid grid-cols-3 gap-4">
                {mealTypes.map((mealType) => {
                  const meta = MEAL_TYPE_META[mealType];
                  const dishes = todayMenu[mealType];
                  return (
                    <div key={mealType} className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span>{meta.icon}</span>
                        <span className="font-medium text-sm text-slate-700">{meta.name}</span>
                      </div>
                      <ul className="space-y-1">
                        {dishes.slice(0, 4).map((dish) => (
                          <li key={dish.id} className="text-xs text-slate-600 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            {dish.name}
                            {dish.allergies.length > 0 && (
                              <span className="text-[10px] text-danger-500">⚠</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-slate-400 py-8">暂无今日菜单</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
