import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Save,
  Flame,
  Fish,
  TreePine,
  Leaf,
  AlertTriangle,
} from 'lucide-react';
import { usePlanStore } from '@/store/usePlanStore';
import { useMemberStore } from '@/store/useMemberStore';
import { cn } from '@/lib/utils';
import { SPICINESS_OPTIONS } from '../../../shared/types';

export default function PlanDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    currentPlan,
    fetchPlanById,
    addDish,
    updateDish,
    deleteDish,
    loading,
  } = usePlanStore();
  const { members } = useMemberStore();

  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [showAddDish, setShowAddDish] = useState(false);
  const [dishForm, setDishForm] = useState<Omit<Dish, 'id'>>({
    name: '',
    spiciness: 'none',
    hasSeafood: false,
    hasNuts: false,
    isVegetarian: false,
    price: 0,
    notes: '',
  });

  useEffect(() => {
    if (id) {
      fetchPlanById(id);
    }
  }, [id, fetchPlanById]);

  useEffect(() => {
    if (editingDish) {
      setDishForm({
        name: editingDish.name,
        spiciness: editingDish.spiciness,
        hasSeafood: editingDish.hasSeafood,
        hasNuts: editingDish.hasNuts,
        isVegetarian: editingDish.isVegetarian,
        price: editingDish.price,
        notes: editingDish.notes,
      });
      setShowAddDish(true);
    }
  }, [editingDish]);

  const handleSaveDish = async () => {
    if (!id || !dishForm.name.trim()) return;

    try {
      if (editingDish) {
        await updateDish(id, editingDish.id, dishForm);
      } else {
        await addDish(id, dishForm);
      }
      setShowAddDish(false);
      setEditingDish(null);
      setDishForm({
        name: '',
        spiciness: 'none',
        hasSeafood: false,
        hasNuts: false,
        isVegetarian: false,
        price: 0,
        notes: '',
      });
    } catch (error) {
      console.error('保存菜品失败:', error);
    }
  };

  const handleDeleteDish = async (dishId: string) => {
    if (!id || !window.confirm('确定要删除这道菜吗？')) return;
    await deleteDish(id, dishId);
  };

  const highRiskDishes = currentPlan?.dishes.filter((dish) => {
    const hasSeafoodAllergy = members.some((m) => m.allergies.includes('seafood'));
    const hasNutsAllergy = members.some((m) => m.allergies.includes('nuts'));
    const hasSpicyAllergy = members.some((m) => m.allergies.includes('spicy'));

    return (
      (dish.hasSeafood && hasSeafoodAllergy) ||
      (dish.hasNuts && hasNutsAllergy) ||
      (dish.spiciness !== 'none' && hasSpicyAllergy)
    );
  });

  if (!currentPlan && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">方案不存在</p>
        <Link to="/plans" className="btn-primary mt-4">
          返回方案列表
        </Link>
      </div>
    );
  }

  const totalDishPrice = currentPlan?.dishes.reduce((sum, d) => sum + d.price, 0) || 0;
  const estimatedTotal = totalDishPrice * (currentPlan?.totalTables || 0);
  const budgetDiff = (currentPlan?.budget || 0) - estimatedTotal;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <Link
            to="/plans"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            返回方案列表
          </Link>
          <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
            {currentPlan?.name}
          </h1>
          <p className="text-slate-500">
            {currentPlan?.restaurant} · {currentPlan?.date}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to={`/plans/${id}/seating`}
            className="btn-secondary"
          >
            智能分桌
          </Link>
          <Link
            to={`/plans/${id}/export`}
            className="btn-primary"
          >
            导出清单
          </Link>
        </div>
      </div>

      {highRiskDishes && highRiskDishes.length > 0 && (
        <div className="bg-danger-50 border border-danger-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-danger-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-danger-800 mb-1">
                高风险菜品预警 ({highRiskDishes.length}道)
              </h3>
              <p className="text-sm text-danger-700">
                以下菜品可能导致成员过敏，建议替换：
                {highRiskDishes.map((d) => d.name).join('、')}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-slate-900">
                菜品清单
              </h2>
              <button
                onClick={() => setShowAddDish(true)}
                className="btn-primary text-sm"
              >
                <Plus size={16} />
                添加菜品
              </button>
            </div>

            {currentPlan?.dishes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf size={24} className="text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium mb-1">还没有添加菜品</p>
                <p className="text-sm text-slate-400">
                  点击上方按钮添加菜品
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentPlan?.dishes.map((dish, index) => {
                  const isHighRisk = highRiskDishes?.some((d) => d.id === dish.id);
                  const spicyOption = SPICINESS_OPTIONS.find(
                    (o) => o.value === dish.spiciness
                  );

                  return (
                    <div
                      key={dish.id}
                      className={cn(
                        'p-4 rounded-xl border transition-all animate-fade-in-up',
                        isHighRisk
                          ? 'bg-danger-50 border-danger-200'
                          : 'bg-white border-slate-100 hover:border-slate-200'
                      )}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                            {dish.name}
                            {isHighRisk && (
                              <span className="badge bg-danger-100 text-danger-700 animate-pulse-soft">
                                高风险
                              </span>
                            )}
                          </h4>
                          <p className="text-lg font-bold text-primary-600 mt-1">
                            ¥{dish.price}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingDish(dish)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteDish(dish.id)}
                            className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className={cn('tag', spicyOption?.color)}>
                          <Flame size={12} className="mr-1" />
                          {spicyOption?.label}
                        </span>
                        {dish.hasSeafood && (
                          <span className="tag bg-blue-50 text-blue-700 border-blue-200">
                            <Fish size={12} className="mr-1" />
                            海鲜
                          </span>
                        )}
                        {dish.hasNuts && (
                          <span className="tag bg-amber-50 text-amber-700 border-amber-200">
                            <TreePine size={12} className="mr-1" />
                            坚果
                          </span>
                        )}
                        {dish.isVegetarian && (
                          <span className="tag bg-emerald-50 text-emerald-700 border-emerald-200">
                            <Leaf size={12} className="mr-1" />
                            素食
                          </span>
                        )}
                      </div>

                      {dish.notes && (
                        <p className="text-sm text-slate-500 mt-3">{dish.notes}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-display text-lg font-bold text-slate-900 mb-4">
              方案信息
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">总桌数</span>
                <span className="font-medium text-slate-900">
                  {currentPlan?.totalTables} 桌
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">每桌人数</span>
                <span className="font-medium text-slate-900">
                  {currentPlan?.seatsPerTable} 人
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">菜品数量</span>
                <span className="font-medium text-slate-900">
                  {currentPlan?.dishes.length} 道
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">素菜数量</span>
                <span className="font-medium text-slate-900">
                  {currentPlan?.dishes.filter((d) => d.isVegetarian).length} 道
                </span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-display text-lg font-bold text-slate-900 mb-4">
              酒水配置
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-slate-500 block mb-2">含酒精</span>
                <div className="flex flex-wrap gap-1">
                  {currentPlan?.drinks.alcoholic.length === 0 ? (
                    <span className="text-slate-400">无</span>
                  ) : (
                    currentPlan?.drinks.alcoholic.map((d, i) => (
                      <span key={i} className="tag bg-amber-50 text-amber-700 border-amber-200">
                        {d}
                      </span>
                    ))
                  )}
                </div>
              </div>
              <div>
                <span className="text-slate-500 block mb-2">无酒精</span>
                <div className="flex flex-wrap gap-1">
                  {currentPlan?.drinks.nonAlcoholic.length === 0 ? (
                    <span className="text-slate-400">无</span>
                  ) : (
                    currentPlan?.drinks.nonAlcoholic.map((d, i) => (
                      <span key={i} className="tag bg-slate-100 text-slate-700 border-slate-200">
                        {d}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-primary-50 to-teal-50">
            <h3 className="font-display text-lg font-bold text-primary-700 mb-4">
              预算分析
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">菜品单价合计</span>
                <span className="font-medium text-slate-900">
                  ¥{totalDishPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">桌数</span>
                <span className="font-medium text-slate-900">
                  × {currentPlan?.totalTables}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-primary-200">
                <span className="text-slate-600">预估总价</span>
                <span className="font-bold text-slate-900">
                  ¥{estimatedTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">预算</span>
                <span className="font-medium text-slate-900">
                  ¥{currentPlan?.budget.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-primary-200">
                <span className="font-medium text-slate-700">差额</span>
                <span
                  className={cn(
                    'font-bold text-lg',
                    budgetDiff >= 0 ? 'text-success-600' : 'text-danger-600'
                  )}
                >
                  {budgetDiff >= 0 ? '+' : ''}
                  ¥{budgetDiff.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddDish && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="card p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto animate-bounce-in">
            <h3 className="font-display text-xl font-bold text-slate-900 mb-6">
              {editingDish ? '编辑菜品' : '添加菜品'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="label">
                  菜品名称 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={dishForm.name}
                  onChange={(e) =>
                    setDishForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="input"
                  placeholder="请输入菜品名称"
                />
              </div>

              <div>
                <label className="label">
                  价格 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="number"
                  value={dishForm.price}
                  onChange={(e) =>
                    setDishForm((prev) => ({
                      ...prev,
                      price: Number(e.target.value),
                    }))}
                  className="input"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="label mb-2">辣度</label>
                <div className="grid grid-cols-4 gap-2">
                  {SPICINESS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setDishForm((prev) => ({
                          ...prev,
                          spiciness: option.value as Dish['spiciness'],
                        }))}
                      className={cn(
                        'py-2 px-3 rounded-lg text-sm font-medium border-2 transition-all',
                        dishForm.spiciness === option.value
                          ? option.color
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label mb-2">属性</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setDishForm((prev) => ({
                        ...prev,
                        hasSeafood: !prev.hasSeafood,
                      }))}
                    className={cn(
                      'py-2 px-3 rounded-lg text-sm font-medium border-2 transition-all flex items-center justify-center gap-1',
                      dishForm.hasSeafood
                        ? 'bg-primary-50 border-primary-400 text-primary-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    )}
                  >
                    <Fish size={14} />
                    海鲜
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDishForm((prev) => ({
                        ...prev,
                        hasNuts: !prev.hasNuts,
                      }))}
                    className={cn(
                      'py-2 px-3 rounded-lg text-sm font-medium border-2 transition-all flex items-center justify-center gap-1',
                      dishForm.hasNuts
                        ? 'bg-primary-50 border-primary-400 text-primary-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    )}
                  >
                    <TreePine size={14} />
                    坚果
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDishForm((prev) => ({
                        ...prev,
                        isVegetarian: !prev.isVegetarian,
                      }))}
                    className={cn(
                      'py-2 px-3 rounded-lg text-sm font-medium border-2 transition-all flex items-center justify-center gap-1',
                      dishForm.isVegetarian
                        ? 'bg-primary-50 border-primary-400 text-primary-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    )}
                  >
                    <Leaf size={14} />
                    素食
                  </button>
                </div>
              </div>

              <div>
                <label className="label">备注</label>
                <textarea
                  value={dishForm.notes}
                  onChange={(e) =>
                    setDishForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="input resize-none min-h-[80px]"
                  placeholder="其他说明..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowAddDish(false);
                  setEditingDish(null);
                }}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveDish}
                className="btn-primary"
                disabled={!dishForm.name.trim()}
              >
                <Save size={16} />
                {editingDish ? '保存修改' : '添加菜品'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
