import { PageLayout } from '../components/layout/PageLayout';
import { useFleetStore } from '../store/fleetStore';
import { Car, Users, MapPin, DollarSign, AlertTriangle, ChevronRight, Tent } from 'lucide-react';
import { formatMoney, cn, formatTime, itineraryTypeConfig } from '../utils/helpers';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../components/common/Alert';

export default function Dashboard() {
  const navigate = useNavigate();
  const { vehicles, people, itinerary, getWarnings, getUsedSeats, getTotalExpenses } = useFleetStore();
  const warnings = getWarnings();

  const sortedItinerary = [...itinerary].sort((a, b) => new Date(a.arriveTime).getTime() - new Date(b.arriveTime).getTime()).slice(0, 3);
  const totalExpenses = getTotalExpenses();

  const statCards = [
    {
      label: '车辆数',
      value: vehicles.length,
      icon: Car,
      gradient: 'from-forest-500 to-forest-700',
    },
    {
      label: '总人数',
      value: people.length,
      icon: Users,
      gradient: 'from-warm-500 to-warm-700',
    },
    {
      label: '行程节点',
      value: itinerary.length,
      icon: MapPin,
      gradient: 'from-blue-500 to-blue-700',
    },
    {
      label: '总费用',
      value: formatMoney(totalExpenses),
      icon: DollarSign,
      gradient: 'from-purple-500 to-purple-700',
    },
  ];

  const quickActions = [
    {
      label: '添加车辆',
      description: '登记新的车辆信息',
      icon: Car,
      onClick: () => navigate('/vehicles'),
      color: 'bg-forest-50 text-forest-700 border-forest-200 hover:bg-forest-100',
    },
    {
      label: '添加行程',
      description: '规划新的行程节点',
      icon: MapPin,
      onClick: () => navigate('/itinerary'),
      color: 'bg-warm-50 text-warm-700 border-warm-200 hover:bg-warm-100',
    },
    {
      label: '记录费用',
      description: '添加新的费用支出',
      icon: DollarSign,
      onClick: () => navigate('/settlement'),
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    },
  ];

  const getWarningNavigatePath = (warning: { type: string; vehicleId?: string; equipmentId?: string }) => {
    if (warning.type === 'overload' || warning.type === 'trunk_full') {
      return '/allocation';
    }
    if (warning.type === 'critical_equipment') {
      return '/allocation';
    }
    return '/';
  };

  return (
    <PageLayout title="仪表盘" subtitle="坝上草原三日露营 · 行程概览">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                whileHover={{ y: -4 }}
                className={cn('relative overflow-hidden rounded-xl p-5 text-white shadow-card cursor-pointer bg-gradient-to-br', card.gradient)}
              >
                <div className="absolute right-0 top-0 opacity-10">
                  <Icon className="w-32 h-32 -mr-4 -mt-4" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium opacity-90">{card.label}</span>
                  </div>
                  <p className="font-serif text-3xl font-bold">{card.value}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {warnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warm-600" />
              <h3 className="font-serif text-lg font-semibold text-forest-800">预警提醒</h3>
              <span className="badge bg-warm-100 text-warm-700">{warnings.length}</span>
            </div>
            <div className="space-y-2">
              {warnings.map((warning) => (
                <div
                  key={warning.id}
                  onClick={() => navigate(getWarningNavigatePath(warning))}
                  className="cursor-pointer transition-transform hover:-translate-y-0.5"
                >
                  <Alert
                    type={warning.level as 'error' | 'warning'}
                    message={warning.message}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <h3 className="font-serif text-lg font-semibold text-forest-800 mb-3">快速操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, idx) => {
              const ActionIcon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 + idx * 0.05, duration: 0.4 }}
                  whileHover={{ y: -2 }}
                  onClick={action.onClick}
                  className={cn('card p-5 text-left flex items-center justify-between border-2 transition-all', action.color)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-soft">
                      <ActionIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold">{action.label}</p>
                      <p className="text-sm opacity-80 mt-0.5">{action.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold text-forest-800">行程概览</h3>
              <button
                onClick={() => navigate('/itinerary')}
                className="btn-ghost text-sm"
              >
                查看全部 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {sortedItinerary.map((step, idx) => {
                const typeConfig = itineraryTypeConfig[step.type];
                return (
                  <div key={step.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={cn('w-3 h-3 rounded-full', typeConfig.color)} />
                      {idx < sortedItinerary.length - 1 && (
                        <div className="w-0.5 flex-1 bg-cream-300 my-1 min-h-[32px]" />
                      )}
                    </div>
                    <div className="flex-1 pb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn('badge text-white', typeConfig.color)}>{typeConfig.label}</span>
                        <span className="text-sm text-gray-500">{formatTime(step.arriveTime)}</span>
                      </div>
                      <p className="font-medium text-forest-800">{step.name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{step.address}</p>
                    </div>
                  </div>
                );
              })}
              {sortedItinerary.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Tent className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暂无行程安排</p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold text-forest-800">车辆状态</h3>
              <button
                onClick={() => navigate('/vehicles')}
                className="btn-ghost text-sm"
              >
                查看全部 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {vehicles.map((vehicle) => {
                const usedSeats = getUsedSeats(vehicle.id);
                const seatPercentage = (usedSeats / vehicle.totalSeats) * 100;
                const isOverload = usedSeats > vehicle.totalSeats;
                return (
                  <div
                    key={vehicle.id}
                    onClick={() => navigate('/vehicles')}
                    className="flex items-center gap-4 p-3 rounded-xl bg-cream-50 hover:bg-cream-100 transition-colors cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-cream-200 flex-shrink-0">
                      <img
                        src={vehicle.photoUrl}
                        alt={vehicle.carModel}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-forest-800 truncate">{vehicle.carModel}</p>
                        <span className="text-xs text-gray-500">{vehicle.plateNumber}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">司机：{vehicle.driverName}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-cream-200 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-300',
                              isOverload ? 'bg-red-500' : 'bg-forest-500'
                            )}
                            style={{ width: `${Math.min(seatPercentage, 100)}%` }}
                          />
                        </div>
                        <span className={cn('text-xs font-medium whitespace-nowrap', isOverload ? 'text-red-600' : 'text-gray-600')}>
                          {usedSeats}/{vehicle.totalSeats} 座
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {vehicles.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Car className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暂无车辆信息</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
}
