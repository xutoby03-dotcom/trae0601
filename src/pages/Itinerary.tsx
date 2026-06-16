import { useState, useMemo } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { Modal } from '../components/common/Modal';
import { Alert } from '../components/common/Alert';
import { useFleetStore } from '../store/fleetStore';
import { ItineraryStep, ItineraryType } from '../types';
import { Timeline } from '../components/itinerary/Timeline';
import { StepForm } from '../components/itinerary/StepForm';
import { Plus, Flag, ShoppingCart, Fuel, Tent, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { itineraryTypeConfig, cn } from '../utils/helpers';

export default function Itinerary() {
  const itinerary = useFleetStore((state) => state.itinerary);
  const addItineraryStep = useFleetStore((state) => state.addItineraryStep);
  const updateItineraryStep = useFleetStore((state) => state.updateItineraryStep);
  const removeItineraryStep = useFleetStore((state) => state.removeItineraryStep);
  const reorderItinerary = useFleetStore((state) => state.reorderItinerary);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<ItineraryStep | undefined>(undefined);
  const [alertVisible, setAlertVisible] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sortedSteps = useMemo(
    () => [...itinerary].sort((a, b) => a.order - b.order),
    [itinerary]
  );

  const stats = useMemo(() => {
    const counts: Record<ItineraryType, number> = {
      meetup: 0,
      supply: 0,
      fuel: 0,
      camp: 0,
      scenic: 0,
    };
    itinerary.forEach((s) => {
      counts[s.type]++;
    });
    return counts;
  }, [itinerary]);

  const handleAdd = () => {
    setEditingStep(undefined);
    setModalOpen(true);
  };

  const handleEdit = (step: ItineraryStep) => {
    setEditingStep(step);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setAlertVisible(true);
  };

  const confirmDelete = () => {
    if (deletingId) {
      removeItineraryStep(deletingId);
      setDeletingId(null);
      setAlertVisible(false);
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
    setEditingStep(undefined);
  };

  const handleSubmit = (data: Omit<ItineraryStep, 'id'>) => {
    if (editingStep) {
      updateItineraryStep(editingStep.id, data);
    } else {
      addItineraryStep({
        ...data,
        order: sortedSteps.length,
      });
    }
    setModalOpen(false);
    setEditingStep(undefined);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      reorderItinerary(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < sortedSteps.length - 1) {
      reorderItinerary(index, index + 1);
    }
  };

  const statIcons: Record<ItineraryType, typeof Flag> = {
    meetup: Flag,
    supply: ShoppingCart,
    fuel: Fuel,
    camp: Tent,
    scenic: Camera,
  };

  return (
    <PageLayout
      title="行程规划"
      subtitle="管理车队的行程路线和停靠节点"
      actions={
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-forest-600 hover:bg-forest-700 text-white rounded-xl font-medium transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" />
          添加节点
        </button>
      }
    >
      {sortedSteps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-wrap gap-3"
        >
          {(Object.keys(stats) as ItineraryType[]).map((type) => {
            if (stats[type] === 0) return null;
            const config = itineraryTypeConfig[type];
            const Icon = statIcons[type];
            return (
              <div
                key={type}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-cream-200 shadow-card"
              >
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-white', config.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm text-gray-600">{config.label}</span>
                <span className="text-sm font-semibold text-forest-700">{stats[type]}</span>
              </div>
            );
          })}
        </motion.div>
      )}

      {sortedSteps.length > 0 ? (
        <Timeline
          steps={sortedSteps}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-cream-100 flex items-center justify-center mb-4">
            <Flag className="w-10 h-10 text-forest-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">暂无行程节点</h3>
          <p className="text-gray-500 mb-6 max-w-sm">
            点击右上角「添加节点」按钮，开始规划你的车队行程路线
          </p>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-forest-600 hover:bg-forest-700 text-white rounded-xl font-medium transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            添加第一个节点
          </button>
        </motion.div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={handleCancel}
        title={editingStep ? '编辑行程节点' : '添加行程节点'}
        size="lg"
      >
        <StepForm
          step={editingStep}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Modal>

      <Modal
        isOpen={alertVisible}
        onClose={() => setAlertVisible(false)}
        title="确认删除"
        size="sm"
      >
        <Alert
          type="warning"
          title="删除确认"
          message="确定要删除这个行程节点吗？此操作不可撤销。"
        />
        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={() => setAlertVisible(false)}
            className="px-5 py-2.5 rounded-xl text-gray-600 bg-cream-100 hover:bg-cream-200 transition-colors font-medium"
          >
            取消
          </button>
          <button
            onClick={confirmDelete}
            className="px-5 py-2.5 rounded-xl text-white bg-red-600 hover:bg-red-700 transition-colors font-medium shadow-md"
          >
            确认删除
          </button>
        </div>
      </Modal>
    </PageLayout>
  );
}
