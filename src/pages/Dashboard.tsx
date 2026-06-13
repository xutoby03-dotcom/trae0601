import { Link } from 'react-router-dom';
import { Droplets, DollarSign, ShoppingCart, Calendar, Plus, ArrowRight } from 'lucide-react';
import { useFilterStore } from '../store';
import StatCard from '../components/StatCard';
import ReminderCard from '../components/ReminderCard';
import { getCurrentYear, formatDateDisplay } from '../utils/dateUtils';

export default function Dashboard() {
  const {
    devices,
    inventory,
    getRemindersByUrgency,
    getYearlyTotalCost,
    getPurchaseSuggestions,
    getRemainingDaysByDevice,
  } = useFilterStore();

  const { urgent, warning, normal } = getRemindersByUrgency();
  const yearlyCost = getYearlyTotalCost();
  const purchaseSuggestions = getPurchaseSuggestions();
  const remainingDays = getRemainingDaysByDevice();
  const currentYear = getCurrentYear();

  const totalDevices = devices.length;
  const totalInventoryValue = inventory.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const lowStockItems = inventory.filter((i) => i.quantity <= 1).length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="设备总数"
          value={totalDevices}
          subtitle="台净水器"
          icon={Droplets}
          gradient="bg-gradient-to-br from-primary-500 to-cyan-500"
        />
        <StatCard
          title={`${currentYear}年花费`}
          value={`¥${yearlyCost.toLocaleString()}`}
          subtitle="滤芯更换费用"
          icon={DollarSign}
          gradient="bg-gradient-to-br from-violet-500 to-purple-600"
        />
        <StatCard
          title="库存预警"
          value={lowStockItems}
          subtitle="个型号库存不足"
          icon={ShoppingCart}
          gradient="bg-gradient-to-br from-amber-500 to-orange-500"
        />
        <StatCard
          title="待处理提醒"
          value={urgent.length + warning.length}
          subtitle="项需要关注"
          icon={Calendar}
          gradient="bg-gradient-to-br from-rose-500 to-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ReminderCard reminders={urgent} urgency="urgent" title="紧急更换" />
        <ReminderCard reminders={warning} urgency="warning" title="临期提醒" />
        <ReminderCard reminders={normal} urgency="normal" title="状态正常" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800 text-lg">各设备剩余天数</h3>
            <Link to="/records" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {remainingDays.slice(0, 4).map((item) => {
              const percentage = Math.min(100, Math.max(0, (item.remainingDays / 180) * 100));
              const barColor =
                item.remainingDays < 15
                  ? 'bg-danger-500'
                  : item.remainingDays <= 30
                  ? 'bg-warning-500'
                  : 'bg-success-500';
              return (
                <div key={item.deviceId}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-800">{item.location}</p>
                      <p className="text-xs text-gray-500">{item.filterModel}</p>
                    </div>
                    <span
                      className={`font-bold ${
                        item.remainingDays < 15
                          ? 'text-danger-500'
                          : item.remainingDays <= 30
                          ? 'text-warning-500'
                          : 'text-success-600'
                      }`}
                    >
                      {item.remainingDays} 天
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800 text-lg">采购建议</h3>
            <Link to="/inventory" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              管理库存 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {purchaseSuggestions.length > 0 ? (
            <div className="space-y-3">
              {purchaseSuggestions.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{item.filterModel}</p>
                      <p className="text-sm text-amber-700 mt-1">{item.reason}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        建议采购日期：{formatDateDisplay(item.suggestedPurchaseDate)}
                      </p>
                    </div>
                    <span className={`badge ${item.currentStock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                      库存 {item.currentStock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-success-50 flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8 text-success-500" />
              </div>
              <p className="text-gray-600 font-medium">库存充足</p>
              <p className="text-sm text-gray-400 mt-1">暂无需要采购的滤芯型号</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <Link to="/devices/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-5 h-5" />
          添加新设备
        </Link>
        <Link to="/records/new" className="btn-secondary inline-flex items-center gap-2">
          <Plus className="w-5 h-5" />
          记录更换
        </Link>
        <Link to="/inventory" className="btn-secondary inline-flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          补充库存
        </Link>
      </div>
    </div>
  );
}
