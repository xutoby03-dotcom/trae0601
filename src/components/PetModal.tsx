import { useState } from 'react';
import { Plus, Edit2, Trash2, Scale, Heart, Building, PawPrint } from 'lucide-react';
import Modal from './Modal';
import type { Pet } from '@/types';
import useAppStore from '@/store/useAppStore';
import { cn } from '@/lib/utils';

interface PetModalProps {
  pet?: Pet;
  isOpen: boolean;
  onClose: () => void;
}

const defaultPet = {
  name: '',
  species: '',
  weight: 0,
  allergies: '',
  hospital: '',
  photo: '',
};

export default function PetModal({ pet, isOpen, onClose }: PetModalProps) {
  const addPet = useAppStore(state => state.addPet);
  const updatePet = useAppStore(state => state.updatePet);
  const [formData, setFormData] = useState(
    pet ? { ...pet } : defaultPet
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pet) {
      updatePet({ ...formData, id: pet.id, createdAt: pet.createdAt });
    } else {
      addPet(formData);
    }
    onClose();
  };

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={pet ? '编辑宠物' : '添加宠物'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            照片 URL
          </label>
          <input
            type="text"
            value={formData.photo}
            onChange={(e) => handleChange('photo', e.target.value)}
            placeholder="输入照片链接"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名字 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="宠物名字"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              品种 *
            </label>
            <input
              type="text"
              value={formData.species}
              onChange={(e) => handleChange('species', e.target.value)}
              placeholder="如：橘猫、柯基"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            体重 (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.weight || ''}
            onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
            placeholder="0.0"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            过敏史
          </label>
          <input
            type="text"
            value={formData.allergies}
            onChange={(e) => handleChange('allergies', e.target.value)}
            placeholder="如：青霉素过敏"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            常去医院
          </label>
          <input
            type="text"
            value={formData.hospital}
            onChange={(e) => handleChange('hospital', e.target.value)}
            placeholder="医院名称"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          className={cn(
            'w-full py-3 px-4 rounded-2xl font-medium text-white transition-all',
            'bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 shadow-lg shadow-orange-200 hover:shadow-orange-300'
          )}
        >
          {pet ? '保存修改' : '添加宠物'}
        </button>
      </form>
    </Modal>
  );
}
