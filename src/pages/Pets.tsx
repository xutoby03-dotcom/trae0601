import { useState } from 'react';
import { Plus, Edit2, Trash2, Scale, Heart, Building, PawPrint } from 'lucide-react';
import PetModal from '@/components/PetModal';
import type { Pet } from '@/types';
import useAppStore from '@/store/useAppStore';

export default function Pets() {
  const pets = useAppStore(state => state.pets);
  const deletePet = useAppStore(state => state.deletePet);
  const getMedicinesByPetId = useAppStore(state => state.getMedicinesByPetId);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | undefined>();

  const handleAdd = () => {
    setEditingPet(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet);
    setIsModalOpen(true);
  };

  const handleDelete = (petId: string) => {
    if (confirm('确定要删除这只宠物吗？相关的药品记录也会被删除。')) {
      deletePet(petId);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            我的宠物 🐾
          </h1>
          <p className="text-gray-500 mt-1">
            共 {pets.length} 只毛孩子
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
          <PawPrint className="w-20 h-20 mx-auto text-orange-200 mb-4" />
          <p className="text-gray-500 text-lg">还没有添加宠物</p>
          <p className="text-sm text-gray-400 mt-2">点击右上角添加你的第一只毛孩子吧~</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pets.map((pet) => {
            const medicines = getMedicinesByPetId(pet.id);
            return (
              <div
                key={pet.id}
                className="bg-white rounded-3xl p-5 border border-orange-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={pet.photo || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20pet%20avatar&image_size=square'}
                      alt={pet.name}
                      className="w-20 h-20 rounded-2xl object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-800 truncate">
                      {pet.name}
                    </h3>
                    <p className="text-sm text-orange-500 font-medium">
                      {pet.species}
                    </p>
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      {medicines.length > 0 && (
                        <span className="text-xs px-2 py-1 bg-rose-50 text-rose-500 rounded-full font-medium">
                          {medicines.length} 种药
                        </span>
                      )}
                      {pet.allergies && (
                        <span className="text-xs px-2 py-1 bg-amber-50 text-amber-600 rounded-full font-medium">
                          有过敏
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-orange-50 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-gray-600">
                      {pet.weight || '-'} kg
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span className="text-sm text-gray-600 truncate">
                      {pet.allergies || '无过敏'}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <Building className="w-4 h-4 text-teal-400" />
                    <span className="text-sm text-gray-600 truncate">
                      {pet.hospital || '未填写'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(pet)}
                    className="flex-1 py-2 px-4 rounded-xl text-sm font-medium bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(pet.id)}
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
      )}

      <PetModal
        pet={editingPet}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
