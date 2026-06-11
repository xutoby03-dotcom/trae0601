import { useState, useEffect } from 'react';
import Modal from './Modal';
import type { Medicine, MealTiming, Pet } from '@/types';
import useAppStore from '@/store/useAppStore';
import { getTodayStr } from '@/utils/date';
import { cn } from '@/lib/utils';

interface MedicineModalProps {
  medicine?: Medicine;
  isOpen: boolean;
  onClose: () => void;
}

const defaultMedicine = {
  petId: '',
  name: '',
  dosage: '',
  frequency: 2,
  durationDays: 7,
  mealTiming: 'after' as MealTiming,
  remainingQuantity: 30,
  doctorNote: '',
  startDate: getTodayStr(),
  timeSlots: ['08:00', '20:00'],
};

export default function MedicineModal({ medicine, isOpen, onClose }: MedicineModalProps) {
  const pets = useAppStore(state => state.pets);
  const addMedicine = useAppStore(state => state.addMedicine);
  const updateMedicine = useAppStore(state => state.updateMedicine);
  
  const [formData, setFormData] = useState(defaultMedicine);

  useEffect(() => {
    if (medicine) {
      setFormData({ ...medicine });
    } else {
      setFormData({
        ...defaultMedicine,
        petId: pets[0]?.id || '',
      });
    }
  }, [medicine, pets, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.petId) {
      alert('请选择宠物');
      return;
    }
    if (medicine) {
      updateMedicine({ ...formData, id: medicine.id, createdAt: medicine.createdAt });
    } else {
      addMedicine(formData);
    }
    onClose();
  };

  const handleChange = (field: keyof typeof formData, value: string | number | string[] | MealTiming) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFrequencyChange = (freq: number) => {
    let timeSlots: string[];
    switch (freq) {
      case 1:
        timeSlots = ['09:00'];
        break;
      case 2:
        timeSlots = ['08:00', '20:00'];
        break;
      case 3:
        timeSlots = ['08:00', '14:00', '20:00'];
        break;
      case 4:
        timeSlots = ['08:00', '12:00', '18:00', '22:00'];
        break;
      default:
        timeSlots = ['08:00', '20:00'];
    }
    setFormData(prev => ({ ...prev, frequency: freq, timeSlots }));
  };

  const handleTimeSlotChange = (index: number, value: string) => {
    const newSlots = [...formData.timeSlots];
    newSlots[index] = value;
    setFormData(prev => ({ ...prev, timeSlots: newSlots }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={medicine ? '编辑药品' : '添加药品'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            选择宠物 *
          </label>
          <select
            value={formData.petId}
            onChange={(e) => handleChange('petId', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all bg-white"
          >
            <option value="">请选择宠物</option>
            {pets.map(pet => (
              <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              药名 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="如：阿莫西林"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              剂量 *
            </label>
            <input
              type="text"
              value={formData.dosage}
              onChange={(e) => handleChange('dosage', e.target.value)}
              placeholder="如：半片"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              每日次数 *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleFrequencyChange(num)}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl font-medium transition-all',
                    formData.frequency === num
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {num}次
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              疗程天数 *
            </label>
            <input
              type="number"
              min="1"
              value={formData.durationDays}
              onChange={(e) => handleChange('durationDays', parseInt(e.target.value) || 1)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            喂药时间
          </label>
          <div className="space-y-2">
            {formData.timeSlots.map((slot, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm text-gray-500 w-16">第{index + 1}次</span>
                <input
                  type="time"
                  value={slot}
                  onChange={(e) => handleTimeSlotChange(index, e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            饭前饭后
          </label>
          <div className="flex gap-2">
            {[
              { value: 'before', label: '饭前' },
              { value: 'after', label: '饭后' },
              { value: 'any', label: '不限' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleChange('mealTiming', opt.value as MealTiming)}
                className={cn(
                  'flex-1 py-2.5 rounded-xl font-medium transition-all',
                  formData.mealTiming === opt.value
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            剩余数量
          </label>
          <input
            type="number"
            min="0"
            value={formData.remainingQuantity}
            onChange={(e) => handleChange('remainingQuantity', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            开始日期
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            医生备注
          </label>
          <textarea
            value={formData.doctorNote}
            onChange={(e) => handleChange('doctorNote', e.target.value)}
            placeholder="医生的嘱咐..."
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          className={cn(
            'w-full py-3 px-4 rounded-2xl font-medium text-white transition-all',
            'bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 shadow-lg shadow-orange-200 hover:shadow-orange-300'
          )}
        >
          {medicine ? '保存修改' : '添加药品'}
        </button>
      </form>
    </Modal>
  );
}
