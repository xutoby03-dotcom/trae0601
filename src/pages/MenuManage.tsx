import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Edit2, AlertTriangle, Check, Users } from 'lucide-react';
import { useMenuStore } from '@/stores/menuStore';
import { useStudentStore } from '@/stores/studentStore';
import { MEAL_TYPE_META, DISH_CATEGORY_META, ALLERGY_META } from '@/types';
import type { MealType, AllergyType } from '@/types';
import { formatDate, addDays, todayStr, getWeekDates } from '@/utils/dateUtils';
import AllergyBadge from '@/components/allergy/AllergyBadge';

export default function MenuManage() {
  const { dailyMenus, menuItems, currentDate, setCurrentDate, getMenuByDate, calculateReplacements, saveDailyMenu } = useMenuStore();
  const { students } = useStudentStore();
  const [activeMeal, setActiveMeal] = useState<MealType>('lunch');
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDates = getWeekDates(new Date(addDays(todayStr(), weekOffset * 7)));
  const currentMenu = getMenuByDate(currentDate) || { date: currentDate, breakfast: [], lunch: [], dinner: [] };
  const currentDishes = currentMenu[activeMeal];

  const replacements = calculateReplacements(currentDate, activeMeal, students);
  const affectedStudents = new Set(replacements.map((r) => r.studentId)).size;

  const hasAllergyWarning = (allergies: AllergyType[]) => {
    return allergies.some((a) => ALLERGY_META[a].highRisk);
  };

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeekOffset(weekOffset - 1)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <ChevronLeft size={20} />
              </button>
              <h3 className="font-semibold text-slate-800 px-2">
                {formatDate(weekDates[0], 'YYYY年MM月DD日')} - {formatDate(weekDates[6], 'MM月DD日')}
              </h3>
              <button
                onClick={() => setWeekOffset(weekOffset + 1)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <ChevronRight size={20} />
              </button>
              {weekOffset !== 0 && (
                <button
                  onClick={() => setWeekOffset(0)}
                  className="btn-secondary text-xs ml-2"
                >
                  回到今天
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weekDates.map((date) => {
              const dateStr = formatDate(date);
              const isToday = dateStr === todayStr();
              const isActive = dateStr === currentDate;
              const menu = getMenuByDate(dateStr);
              const hasAllergyDishes = menu
                ? [...menu.breakfast, ...menu.lunch, ...menu.dinner].some((d) => d.allergies.length > 0)
                : false;

              return (
                <button
                  key={dateStr}
                  onClick={() => setCurrentDate(dateStr)}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    isActive
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <p className={`text-xs mb-1 ${isToday ? 'text-primary-600 font-medium' : 'text-slate-400'}`}>
                    {['一', '二', '三', '四', '五', '六', '日'][date.getDay() === 0 ? 6 : date.getDay() - 1]}
                  </p>
                  <p className={`text-lg font-bold ${isActive ? 'text-primary-600' : 'text-slate-700'}`}>
                    {date.getDate()}
                  </p>
                  <div className="flex justify-center mt-1 gap-0.5">
                    {isToday && <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>}
                    {hasAllergyDishes && <span className="w-1.5 h-1.5 rounded-full bg-danger-500"></span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center gap-2 mb-4">
                {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((meal) => {
                  const meta = MEAL_TYPE_META[meal];
                  const isActive = activeMeal === meal;
                  return (
                    <button
                      key={meal}
                      onClick={() => setActiveMeal(meal)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        isActive
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span className="mr-1">{meta.icon}</span>
                      {meta.name}
                    </button>
                  );
                })}
              </div>

              {currentDishes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentDishes.map((dish) => {
                    const categoryMeta = DISH_CATEGORY_META[dish.category];
                    const dishReplacements = replacements.filter((r) => r.originalDish === dish.name);
                    return (
                      <div
                        key={dish.id}
                        className={`p-4 rounded-xl border transition-all ${
                          dish.allergies.length > 0
                            ? hasAllergyWarning(dish.allergies)
                              ? 'border-danger-200 bg-danger-50/30'
                              : 'border-warning-200 bg-warning-50/30'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{categoryMeta.icon}</span>
                              <h4 className="font-semibold text-slate-800">{dish.name}</h4>
                              {hasAllergyWarning(dish.allergies) && (
                                <AlertTriangle size={16} className="text-danger-500" />
                              )}
                            </div>
                            <p className="text-xs text-slate-400">
                              食材：{dish.ingredients.join('、')}
                            </p>
                          </div>
                          <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                            <Edit2 size={14} />
                          </button>
                        </div>

                        {dish.allergies.length > 0 && (
                          <div className="mb-3">
                            <p className="text-[10px] text-slate-500 mb-1">含过敏源：</p>
                            <div className="flex flex-wrap gap-1.5">
                              {dish.allergies.map((a) => (
                                <AllergyBadge key={a} type={a} size="sm" />
                              ))}
                            </div>
                          </div>
                        )}

                        {dishReplacements.length > 0 && (
                          <div className="pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-1 text-xs text-primary-600 mb-1.5">
                              <Users size={12} />
                              <span>需替换 {dishReplacements.length} 份</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {dishReplacements.slice(0, 4).map((r, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] px-2 py-0.5 rounded bg-primary-100 text-primary-700"
                                >
                                  {r.studentName}
                                </span>
                              ))}
                              {dishReplacements.length > 4 && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                                  +{dishReplacements.length - 4}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <p>暂未配置{MEAL_TYPE_META[activeMeal].name}菜品</p>
                  <button className="btn-primary mt-4 text-sm">
                    <Plus size={14} />
                    添加菜品
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-slate-800">替换统计</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-danger-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-danger-600">
                    {replacements.filter((r) =>
                      r.allergies.some((a) => ALLERGY_META[a as AllergyType].highRisk)
                    ).length}
                  </p>
                  <p className="text-xs text-danger-600">高风险替换</p>
                </div>
                <div className="bg-primary-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-primary-600">{affectedStudents}</p>
                  <p className="text-xs text-primary-600">涉及学生</p>
                </div>
              </div>

              {replacements.length > 0 && (
                <div className="space-y-2 max-h-80 overflow-auto">
                  <p className="text-xs text-slate-500 font-medium">替换详情：</p>
                  {replacements.map((r, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-sm"
                    >
                      <div>
                        <p className="font-medium text-slate-700">{r.studentName}</p>
                        <p className="text-xs text-slate-400">{r.className}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 line-through">{r.originalDish}</p>
                        <p className="text-xs text-primary-600 font-medium">{r.replacementDish}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-slate-800">菜品库</h3>
            </div>
            <div className="card-body">
              <p className="text-xs text-slate-500 mb-3">共 {menuItems.length} 道菜品</p>
              <div className="space-y-1.5 max-h-64 overflow-auto">
                {menuItems.slice(0, 10).map((dish) => (
                  <div
                    key={dish.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2">
                      <span>{DISH_CATEGORY_META[dish.category].icon}</span>
                      <span className="text-sm text-slate-700">{dish.name}</span>
                    </div>
                    {dish.allergies.length > 0 && (
                      <div className="flex gap-1">
                        {dish.allergies.slice(0, 2).map((a) => (
                          <span key={a} className="text-sm">
                            {ALLERGY_META[a].icon}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
