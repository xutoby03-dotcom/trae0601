import { useState } from 'react';
import { Plus, Edit2, Trash2, Clock, Calendar, Pill, AlertTriangle } from 'lucide-react';
import MedicineModal from '@/components/MedicineModal';
import type { Medicine } from '@/types';
import useAppStore from '@/store/useAppStore';
import { getMealTimingLabel, diffDays, getTodayStr, addDays } from '@/utils/date';
import { cn } from '@/lib/utils';

export default function Medicines() {
  const pets = useAppStore(state => state.pets);
  const medicines = useAppStore(state => state.medicines);
  const deleteMedicine = useAppStore(state => state.deleteMedicine);
  const getPetById = useAppStore(state => state.getPetById);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | undefined>();

  const handleAdd = () => {
    setEditingMedicine(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (med: Medicine) => {
    setEditingMedicine(med);
    setIsModalOpen(true);
  };

  const handleDelete = (medId: string) => {
    if (confirm('确定要删除这个药品吗？相关的喂药记录也会被删除。')) {
      deleteMedicine(medId);
    }
  };

  const getProgress = (med: Medicine) => {
    const today = getTodayStr();
    const daysPassed = diffDays(med.startDate, today) + 1;
    const totalDays = med.durationDays;
    const progress = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
    return progress;
  };

  const isRunningOut = (med: Medicine) => {
    const dailyUsage = med.frequency;
    const daysLeft = med.remainingQuantity / dailyUsage;
    return daysLeft <= 3 && daysLeft > 0;
  };

  const getDaysLeft = (med: Medicine) => {
    const dailyUsage = med.frequency;
    return Math.floor(med.remainingQuantity / dailyUsage);
  };

  const isInProgress = (med: Medicine) => {
    const today = getTodayStr();
    return today >= med.startDate && today <= addDays(med.startDate, med.durationDays - 1);
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            药品管理 💊
          </h1>
          <p className="text-gray-500 mt-1">
            共 {medicines.length} 种药品
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-400 text-white flex items-center justify-center shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {pets.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-orange-100">
          <Pill className="w-20 h-20 mx-auto text-orange-200 mb-4" />
          <p className="text-gray-500 text-lg">请先添加宠物</p>
          <p className="text-sm text-gray-400 mt-2">添加宠物后才能添加药品哦~</p>
        </div>
      ) : medicines.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-orange-100">
          <Pill className="w-20 h-20 mx-auto text-orange-200 mb-4" />
          <p className="text-gray-500 text-lg">还没有添加药品</p>
          <p className="text-sm text-gray-400 mt-2">点击右上角添加药品吧~</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pets.map(pet => {
            const petMedicines = medicines.filter(m => m.petId === pet.id);
            if (petMedicines.length === 0) return null;
            
            return (
              <div key={pet.id}>
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={pet.photo}
                    alt={pet.name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <h2 className="text-lg font-bold text-gray-800">{pet.name}</h2>
                  <span className="text-sm text-gray-400">{petMedicines.length} 种药</span>
                </div>
                
                <div className="space-y-3">
                  {petMedicines.map(med => {
                    const progress = getProgress(med);
                    const runningOut = isRunningOut(med);
                    const inProgress = isInProgress(med);
                    
                    return (
                      <div
                        key={med.id}
                        className={cn(
                          'bg-white rounded-2xl p-4 border transition-all duration-300 hover:shadow-lg',
                          runningOut ? 'border-amber-200 bg-amber-50/30' : 'border-orange-50'
                        )}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'w-12 h-12 rounded-xl flex items-center justify-center',
                              inProgress ? 'bg-gradient-to-br from-orange-400 to-rose-400' : 'bg-gray-200'
                            )}>
                              <Pill className={cn('w-6 h-6', inProgress ? 'text-white' : 'text-gray-400')} />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-800">{med.name}</h3>
                              <p className="text-sm text-gray-500">{med.dosage} · 每日{med.frequency}次</p>
                            </div>
                          </div>
                          
                          {runningOut && (
                            <div className="flex items-center gap-1 text-amber-500">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="text-xs font-medium">剩{getDaysLeft(med)}天</span>
                            </div>
                          )}
                        </div>

                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>疗程进度</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all duration-500',
                                inProgress
                                  ? 'bg-gradient-to-r from-orange-400 to-rose-400'
                                  : 'bg-gray-300'
                              )}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-orange-400" />
                            <span>{getMealTimingLabel(med.mealTiming)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-teal-400" />
                            <span>{med.durationDays}天疗程</span>
                          </div>
                        </div>

                        {med.doctorNote && (
                          <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2 mb-3">
                            💡 {med.doctorNote}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                          <span>喂药时间：</span>
                          {med.timeSlots.map((slot, i) => (
                            <span key={i} className="px-2 py-0.5 bg-orange-50 text-orange-500 rounded-full font-medium">
                              {slot}
                            </span>
                          ))}
                        </div>

                        <div className="flex gap-2 pt-3 border-t border-gray-50">
                          <button
                            onClick={() => handleEdit(med)}
                            className="flex-1 py-2 px-4 rounded-xl text-sm font-medium bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors flex items-center justify-center gap-1"
                          >
                            <Edit2 className="w-4 h-4" />
                            编辑
                          </button>
                          <button
                            onClick={() => handleDelete(med.id)}
                            className="flex-1 py-2 px-4 rounded-xl text-sm font-medium bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            删除
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <MedicineModal
        medicine={editingMedicine}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
