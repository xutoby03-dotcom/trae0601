import { useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { Modal } from '../components/common/Modal';
import { Alert } from '../components/common/Alert';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { VehicleForm } from '../components/vehicles/VehicleForm';
import { useFleetStore } from '../store/fleetStore';
import { Vehicle } from '../types';
import { Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Vehicles() {
  const vehicles = useFleetStore((state) => state.vehicles);
  const addVehicle = useFleetStore((state) => state.addVehicle);
  const updateVehicle = useFleetStore((state) => state.updateVehicle);
  const removeVehicle = useFleetStore((state) => state.removeVehicle);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);

  const handleAddClick = () => {
    setEditingVehicle(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (vehicle: Vehicle) => {
    setDeleteTarget(vehicle);
  };

  const handleFormSubmit = (data: Omit<Vehicle, 'id'>) => {
    if (editingVehicle) {
      updateVehicle(editingVehicle.id, data);
    } else {
      addVehicle(data);
    }
    setIsFormModalOpen(false);
    setEditingVehicle(null);
  };

  const handleFormCancel = () => {
    setIsFormModalOpen(false);
    setEditingVehicle(null);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      removeVehicle(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  return (
    <PageLayout
      title="车辆档案"
      subtitle={`共 ${vehicles.length} 辆车`}
      actions={
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-5 py-2.5 bg-forest-600 text-white rounded-xl hover:bg-forest-700 transition-colors shadow"
        >
          <Plus className="w-5 h-5" />
          添加车辆
        </button>
      }
    >
      {vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-cream-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="w-10 h-10 text-forest-500" />
          </div>
          <h3 className="font-serif text-xl font-semibold text-forest-800 mb-2">
            暂无车辆
          </h3>
          <p className="text-gray-500 mb-6">点击右上角按钮添加第一辆车</p>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-forest-600 text-white rounded-xl hover:bg-forest-700 transition-colors shadow"
          >
            <Plus className="w-5 h-5" />
            添加车辆
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <VehicleCard
                vehicle={vehicle}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <Modal
        isOpen={isFormModalOpen}
        onClose={handleFormCancel}
        title={editingVehicle ? '编辑车辆' : '添加车辆'}
        size="lg"
      >
        <VehicleForm
          vehicle={editingVehicle || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={handleCancelDelete}
        title="确认删除"
        size="sm"
        footer={
          <>
            <button
              onClick={handleCancelDelete}
              className="px-5 py-2.5 rounded-xl border border-cream-200 text-gray-600 hover:bg-cream-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              确认删除
            </button>
          </>
        }
      >
        <Alert
          type="error"
          title="删除确认"
          message={`确定要删除「${deleteTarget?.carModel} (${deleteTarget?.driverName})」吗？此操作不可撤销，关联的乘客分配将被解除。`}
        />
      </Modal>
    </PageLayout>
  );
}
