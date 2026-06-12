import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCoffeeStore } from '../store/useCoffeeStore';
import CoffeeBeanCard from '../components/coffee/CoffeeBeanCard';
import CoffeeBeanForm from '../components/coffee/CoffeeBeanForm';
import BeanFilter from '../components/coffee/BeanFilter';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { CoffeeBean } from '../types';

const CoffeeBeans = () => {
  const { getFilteredBeans, addBean, updateBean, deleteBean } = useCoffeeStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBean, setEditingBean] = useState<CoffeeBean | null>(null);
  const [brewModalBean, setBrewModalBean] = useState<CoffeeBean | null>(null);

  const beans = getFilteredBeans();

  const handleAddBean = () => {
    setEditingBean(null);
    setIsModalOpen(true);
  };

  const handleEditBean = (bean: CoffeeBean) => {
    setEditingBean(bean);
    setIsModalOpen(true);
  };

  const handleDeleteBean = (id: string) => {
    if (window.confirm('确定要删除这款咖啡豆吗？相关的冲煮记录也会被删除。')) {
      deleteBean(id);
    }
  };

  const handleSubmit = (data: Omit<CoffeeBean, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingBean) {
      updateBean(editingBean.id, data);
    } else {
      addBean(data);
    }
    setIsModalOpen(false);
    setEditingBean(null);
  };

  const handleBrew = (bean: CoffeeBean) => {
    setBrewModalBean(bean);
    window.location.href = `/brews?beanId=${bean.id}`;
  };

  return (
    <div className="min-h-screen bg-[#F5EFE6] pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <h1
            className="text-3xl font-bold text-[#4A3728] mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            我的豆库
          </h1>
          <p className="text-[#6B5748]">
            共 {beans.length} 款咖啡豆
          </p>
        </div>

        <BeanFilter />

        {beans.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#E8DFD3] flex items-center justify-center">
              <Plus className="w-8 h-8 text-[#9B8B7D]" />
            </div>
            <h3 className="text-lg font-medium text-[#4A3728] mb-2">
              还没有咖啡豆
            </h3>
            <p className="text-[#9B8B7D] mb-6">
              点击右下角按钮添加你的第一款咖啡豆
            </p>
            <Button onClick={handleAddBean}>添加豆子</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {beans.map((bean) => (
              <CoffeeBeanCard
                key={bean.id}
                bean={bean}
                onEdit={handleEditBean}
                onDelete={handleDeleteBean}
                onBrew={handleBrew}
              />
            ))}
          </div>
        )}

        <button
          onClick={handleAddBean}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[#4A3728] text-white shadow-lg hover:bg-[#3D2E20] hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center z-40"
        >
          <Plus className="w-6 h-6" />
        </button>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingBean(null);
          }}
          title={editingBean ? '编辑咖啡豆' : '添加咖啡豆'}
        >
          <CoffeeBeanForm
            bean={editingBean}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingBean(null);
            }}
          />
        </Modal>
      </div>
    </div>
  );
};

export default CoffeeBeans;
