import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  UtensilsCrossed,
  Trash2,
  Eye,
  Armchair,
  FileDown,
} from 'lucide-react';
import { usePlanStore } from '@/store/usePlanStore';

export default function PlanList() {
  const { plans, loading, fetchPlans, deletePlan } = usePlanStore();

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这个方案吗？')) {
      await deletePlan(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
            餐厅方案
          </h1>
          <p className="text-slate-500">
            管理聚餐方案、菜品配置和预算
          </p>
        </div>
        <Link to="/plans/new" className="btn-primary">
          <Plus size={18} />
          新建方案
        </Link>
      </div>

      {loading ? (
        <div className="card p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-500">加载中...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <UtensilsCrossed size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            还没有餐厅方案
          </h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            创建一个新的聚餐方案，添加菜品、设置桌数和预算，然后智能分桌。
          </p>
          <Link to="/plans/new" className="btn-primary">
            <Plus size={18} />
            创建第一个方案
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => {
            const totalDishPrice = plan.dishes.reduce((sum, d) => sum + d.price, 0);
            const estimatedTotal = totalDishPrice * plan.totalTables;
            const budgetDiff = plan.budget - estimatedTotal;

            return (
              <div
                key={plan.id}
                className="card-hover p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-bold text-slate-900 mb-1">
                      {plan.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin size={14} />
                      <span>{plan.restaurant}</span>
                    </div>
                  </div>
                  <span
                    className={`badge ${
                      budgetDiff >= 0
                        ? 'bg-success-100 text-success-700'
                        : 'bg-danger-100 text-danger-700'
                    }`}
                  >
                    {budgetDiff >= 0 ? '预算内' : '超支'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center text-slate-400 mb-1">
                      <Calendar size={16} />
                    </div>
                    <p className="text-xs text-slate-500">日期</p>
                    <p className="font-semibold text-slate-900">{plan.date}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center text-slate-400 mb-1">
                      <Users size={16} />
                    </div>
                    <p className="text-xs text-slate-500">桌数</p>
                    <p className="font-semibold text-slate-900">
                      {plan.totalTables}桌 × {plan.seatsPerTable}人
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center text-slate-400 mb-1">
                      <UtensilsCrossed size={16} />
                    </div>
                    <p className="text-xs text-slate-500">菜品</p>
                    <p className="font-semibold text-slate-900">
                      {plan.dishes.length}道
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">预算</span>
                    <span className="font-semibold text-slate-900">
                      ¥{plan.budget.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">预估</span>
                    <span className="font-semibold text-slate-900">
                      ¥{estimatedTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="text-sm text-slate-600">差额</span>
                    <span
                      className={`font-semibold ${
                        budgetDiff >= 0 ? 'text-success-600' : 'text-danger-600'
                      }`}
                    >
                      {budgetDiff >= 0 ? '+' : ''}
                      ¥{budgetDiff.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/plans/${plan.id}`}
                    className="flex-1 btn-secondary text-sm"
                  >
                    <Eye size={16} />
                    查看
                  </Link>
                  <Link
                    to={`/plans/${plan.id}/seating`}
                    className="flex-1 btn-secondary text-sm"
                  >
                    <Armchair size={16} />
                    分桌
                  </Link>
                  <Link
                    to={`/plans/${plan.id}/export`}
                    className="flex-1 btn-secondary text-sm"
                  >
                    <FileDown size={16} />
                    导出
                  </Link>
                  <button
                    onClick={(e) => handleDelete(plan.id, e)}
                    className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
