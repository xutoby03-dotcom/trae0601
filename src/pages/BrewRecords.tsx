import { useState, useEffect } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useCoffeeStore } from '../store/useCoffeeStore';
import BrewRecordCard from '../components/brew/BrewRecordCard';
import BrewForm from '../components/brew/BrewForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

const BrewRecords = () => {
  const { brewRecords, beans, addBrewRecord, deleteBrewRecord } = useCoffeeStore();
  const [searchParams] = useSearchParams();
  const preselectedBeanId = searchParams.get('beanId') || undefined;

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (preselectedBeanId) {
      setIsModalOpen(true);
    }
  }, [preselectedBeanId]);

  const sortedRecords = [...brewRecords].sort(
    (a, b) => new Date(b.brewTime).getTime() - new Date(a.brewTime).getTime(),
  );

  const handleAddRecord = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = (data: Parameters<typeof addBrewRecord>[0]) => {
    addBrewRecord(data);
    setIsModalOpen(false);
    if (preselectedBeanId) {
      window.history.replaceState(null, '', '/brews');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这条冲煮记录吗？库存会相应恢复。')) {
      deleteBrewRecord(id);
    }
  };

  const getBeanById = (id: string) => beans.find((b) => b.id === id);

  return (
    <div className="min-h-screen bg-[#F5EFE6] pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <h1
            className="text-3xl font-bold text-[#4A3728] mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            冲煮记录
          </h1>
          <p className="text-[#6B5748]">共 {brewRecords.length} 条记录</p>
        </div>

        {sortedRecords.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#E8DFD3] flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-[#9B8B7D]" />
            </div>
            <h3 className="text-lg font-medium text-[#4A3728] mb-2">
              还没有冲煮记录
            </h3>
            <p className="text-[#9B8B7D] mb-6">
              记录每一次冲煮，沉淀你的咖啡经验
            </p>
            <Button onClick={handleAddRecord}>添加记录</Button>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedRecords.map((record) => (
              <BrewRecordCard
                key={record.id}
                record={record}
                bean={getBeanById(record.beanId)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <button
          onClick={handleAddRecord}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[#4A3728] text-white shadow-lg hover:bg-[#3D2E20] hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center z-40"
        >
          <Plus className="w-6 h-6" />
        </button>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            if (preselectedBeanId) {
              window.history.replaceState(null, '', '/brews');
            }
          }}
          title="记录冲煮"
        >
          <BrewForm
            preselectedBeanId={preselectedBeanId}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsModalOpen(false);
              if (preselectedBeanId) {
                window.history.replaceState(null, '', '/brews');
              }
            }}
          />
        </Modal>
      </div>
    </div>
  );
};

export default BrewRecords;
