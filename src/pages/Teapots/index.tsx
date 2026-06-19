import { useState } from 'react';
import { Plus, Edit2, Trash2, Thermometer, User, Droplets } from 'lucide-react';
import { useTeaStore } from '@/store/useTeaStore';
import type { Teapot } from '@/types';
import TeapotModal from './TeapotModal';
import TeapotDetail from './TeapotDetail';

export default function TeapotsPage() {
  const { teapots, deleteTeapot, getBatchesByTeapot, checkBatchAbnormal } = useTeaStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeapot, setEditingTeapot] = useState<Teapot | null>(null);
  const [selectedTeapot, setSelectedTeapot] = useState<Teapot | null>(null);

  const handleAdd = () => {
    setEditingTeapot(null);
    setIsModalOpen(true);
  };

  const handleEdit = (teapot: Teapot) => {
    setEditingTeapot(teapot);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个茶桶吗？')) {
      deleteTeapot(id);
    }
  };

  const getTeapotStatus = (teapotId: string) => {
    const batches = getBatchesByTeapot(teapotId);
    const activeBatches = batches.filter((b) => b.status === 'active');
    if (activeBatches.length === 0) return { status: 'idle', text: '空闲中' };

    const hasAbnormal = activeBatches.some((b) => checkBatchAbnormal(b.id).isAbnormal);
    if (hasAbnormal) return { status: 'abnormal', text: '异常' };
    return { status: 'active', text: '使用中' };
  };

  const statusColors: Record<string, string> = {
    active: 'bg-matcha-100 text-matcha-700',
    abnormal: 'bg-danger-100 text-danger-600 animate-pulse-slow',
    idle: 'bg-gray-100 text-gray-600',
  };

  if (selectedTeapot) {
    return (
      <TeapotDetail
        teapot={selectedTeapot}
        onBack={() => setSelectedTeapot(null)}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-tea-800">茶桶档案</h2>
          <p className="text-sm text-tea-600 mt-1">管理所有煮茶桶的基本信息</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-tea-500 hover:bg-tea-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all hover:shadow-tea-lg hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          新增茶桶
        </button>
      </div>

      {teapots.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-tea">
          <div className="w-20 h-20 bg-tea-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Droplets className="w-10 h-10 text-tea-400" />
          </div>
          <p className="text-tea-600 mb-4">还没有茶桶档案</p>
          <button
            onClick={handleAdd}
            className="text-tea-500 hover:text-tea-600 font-medium"
          >
            + 添加第一个茶桶
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {teapots.map((teapot) => {
            const status = getTeapotStatus(teapot.id);
            return (
              <div
                key={teapot.id}
                className="bg-white rounded-2xl shadow-tea overflow-hidden hover:shadow-tea-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                onClick={() => setSelectedTeapot(teapot)}
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={teapot.photo}
                    alt={teapot.teaType}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status.status]}`}
                    >
                      {status.text}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="text-xs opacity-80">{teapot.code}</p>
                    <p className="font-display font-bold text-lg">{teapot.teaType}</p>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-tea-600 mb-2">
                    <Thermometer className="w-4 h-4" />
                    <span>保温目标: {teapot.targetTempMin}°C ~ {teapot.targetTempMax}°C</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-tea-600 mb-3">
                    <User className="w-4 h-4" />
                    <span>负责人: {teapot.manager}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-tea-600">
                    <Droplets className="w-4 h-4" />
                    <span>容量: {teapot.capacity}ml</span>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-tea-50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(teapot);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-tea-600 hover:bg-tea-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      编辑
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(teapot.id);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      删除
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <TeapotModal
          teapot={editingTeapot}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
