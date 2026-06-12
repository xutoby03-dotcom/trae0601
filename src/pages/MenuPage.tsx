import { useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { useStore } from "@/store";
import type { Dish, MealType } from "@/types";
import DishCard from "@/components/DishCard";
import DishFormModal from "@/components/DishFormModal";
import MealTypeTabs from "@/components/MealTypeTabs";
import DatePickerTabs from "@/components/DatePickerTabs";
import Modal from "@/components/Modal";
import { showToast } from "@/components/ToastProvider";

export default function MenuPage() {
  const {
    dishes,
    orders,
    selectedDate,
    selectedMealType,
    setSelectedDate,
    setSelectedMealType,
    addDish,
    updateDish,
    deleteDish,
    resetStore,
  } = useStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Dish | null>(null);

  const filteredDishes = useMemo(() => {
    return dishes.filter(
      (d) => d.date === selectedDate && d.mealType === selectedMealType
    );
  }, [dishes, selectedDate, selectedMealType]);

  const handleSubmit = (data: Omit<Dish, "id">) => {
    if (editingDish) {
      updateDish(editingDish.id, data);
      showToast("菜品已更新", "success");
    } else {
      addDish(data);
      showToast("菜品已添加", "success");
    }
    setFormOpen(false);
    setEditingDish(null);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      deleteDish(confirmDelete.id);
      showToast("菜品已删除", "success");
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-900">🍱 菜单管理</h1>
          <p className="mt-1 text-sm text-brand-600">
            维护每日菜单，管理荤素搭配、价格、过敏原和可订份数
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              resetStore();
              showToast("已重置为示例数据", "info");
            }}
            className="btn-secondary"
          >
            <RefreshCw className="h-4 w-4" />
            重置数据
          </button>
          <button
            onClick={() => {
              setEditingDish(null);
              setFormOpen(true);
            }}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" />
            新增菜品
          </button>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="card flex flex-wrap items-center justify-between gap-4 p-4">
        <DatePickerTabs value={selectedDate} onChange={setSelectedDate} />
        <MealTypeTabs
          value={selectedMealType as MealType}
          onChange={setSelectedMealType}
        />
      </div>

      {/* 菜品列表 */}
      {filteredDishes.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-3 text-5xl">🥗</div>
          <p className="text-lg font-medium text-brand-700">当前还没有菜品</p>
          <p className="mt-1 text-sm text-brand-500">点击右上角"新增菜品"添加今天的菜单</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDishes.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              orders={orders}
              onEdit={() => {
                setEditingDish(dish);
                setFormOpen(true);
              }}
              onDelete={() => setConfirmDelete(dish)}
            />
          ))}
        </div>
      )}

      {/* 菜品表单弹窗 */}
      <DishFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingDish(null);
        }}
        title={editingDish ? "编辑菜品" : "新增菜品"}
        onSubmit={handleSubmit}
        initialData={editingDish}
        defaultDate={selectedDate}
        defaultMealType={selectedMealType as MealType}
      />

      {/* 删除确认弹窗 */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="删除菜品"
        footer={
          <>
            <button onClick={() => setConfirmDelete(null)} className="btn-secondary">
              取消
            </button>
            <button onClick={handleDelete} className="btn-danger">
              确认删除
            </button>
          </>
        }
      >
        <p className="text-brand-700">
          确定要删除菜品「<span className="font-semibold">{confirmDelete?.name}</span>」吗？
        </p>
        <p className="mt-2 text-sm text-brand-500">此操作不可恢复。</p>
      </Modal>
    </div>
  );
}
