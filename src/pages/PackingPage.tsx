import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Car as CarIcon, User, Package } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { EQUIPMENT_TYPE_LABELS } from '@/types';
import type { Car as CarType, Equipment } from '@/types';
import { cn } from '@/lib/utils';

const emptyCar: Omit<CarType, 'id'> = {
  plateNumber: '',
  driver: '',
  capacity: 5,
};

export default function PackingPage() {
  const { cars, equipment, members, addCar, updateCar, deleteCar, assignEquipmentToCar } =
    useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<CarType | null>(null);
  const [formData, setFormData] = useState<Omit<CarType, 'id'>>(emptyCar);

  const openAddModal = () => {
    setEditingCar(null);
    setFormData(emptyCar);
    setIsModalOpen(true);
  };

  const openEditModal = (car: CarType) => {
    setEditingCar(car);
    setFormData(car);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCar) {
      updateCar(editingCar.id, formData);
    } else {
      addCar(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这辆车吗？车上的装备将被移除。')) {
      deleteCar(id);
    }
  };

  const getEquipmentInCar = (carId: string): Equipment[] => {
    return equipment.filter((e) => e.carId === carId);
  };

  const getUnassignedEquipment = (): Equipment[] => {
    return equipment.filter((e) => !e.carId);
  };

  const getOwnerName = (ownerId: string) => {
    const member = members.find((m) => m.id === ownerId);
    return member?.name || '未知';
  };

  const handleAssignToCar = (equipmentId: string, carId: string | undefined) => {
    assignEquipmentToCar(equipmentId, carId);
  };

  const unassignedEquipment = getUnassignedEquipment();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">装箱清单</h2>
          <p className="text-slate-500 mt-1">
            出发前按车辆分配装备，确保不遗漏
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-200 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          添加车辆
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {cars.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
              <CarIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600">还没有车辆</h3>
              <p className="text-slate-400 mt-1">添加车辆开始分配装备</p>
              <button
                onClick={openAddModal}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                添加第一辆车
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cars.map((car) => {
                const carEquipment = getEquipmentInCar(car.id);
                const isFull = carEquipment.length >= car.capacity;

                return (
                  <div
                    key={car.id}
                    className={cn(
                      'bg-white rounded-2xl p-5 border transition-all duration-300',
                      isFull
                        ? 'border-emerald-200 shadow-md shadow-emerald-50'
                        : 'border-slate-100 shadow-sm hover:shadow-md'
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            'w-14 h-14 rounded-xl flex items-center justify-center shadow-md',
                            isFull
                              ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                              : 'bg-gradient-to-br from-blue-400 to-cyan-500'
                          )}
                        >
                          <CarIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg">
                            {car.plateNumber}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                            <User className="w-4 h-4" />
                            <span>司机：{car.driver}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div
                            className={cn(
                              'text-2xl font-bold',
                              isFull ? 'text-emerald-500' : 'text-blue-500'
                            )}
                          >
                            {carEquipment.length}
                            <span className="text-base text-slate-400 font-normal">
                              {' / '}
                              {car.capacity}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">件装备</div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditModal(car)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(car.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {carEquipment.map((equip) => (
                        <div
                          key={equip.id}
                          className="group flex items-center justify-between bg-slate-50 hover:bg-blue-50 rounded-lg px-3 py-2 transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-slate-700 truncate">
                              {equip.name || EQUIPMENT_TYPE_LABELS[equip.type]}
                            </div>
                            <div className="text-xs text-slate-400">
                              {getOwnerName(equip.ownerId)} · {equip.size}
                            </div>
                          </div>
                          <button
                            onClick={() => handleAssignToCar(equip.id, undefined)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all ml-2 flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {unassignedEquipment.length > 0 && (
                      <select
                        className="w-full mt-3 text-sm px-3 py-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignToCar(e.target.value, car.id);
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="">+ 装入装备</option>
                        {unassignedEquipment.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name || EQUIPMENT_TYPE_LABELS[item.type]} ({item.size})
                            {' - '}
                            {getOwnerName(item.ownerId)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm h-fit sticky top-24">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-slate-800">待分配装备</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
              {unassignedEquipment.length} 件
            </span>
          </div>

          {unassignedEquipment.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <CheckAllIcon className="w-12 h-12 mx-auto mb-2 text-emerald-300" />
              <p className="text-sm">所有装备已分配完毕</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {unassignedEquipment.map((equip) => (
                <div
                  key={equip.id}
                  className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-700 truncate">
                      {equip.name || EQUIPMENT_TYPE_LABELS[equip.type]}
                    </div>
                    <div className="text-xs text-slate-400">
                      {getOwnerName(equip.ownerId)} · {equip.size}
                    </div>
                  </div>
                  {cars.length > 0 && (
                    <select
                      className="text-xs px-2 py-1 rounded border border-slate-200 bg-white text-slate-500"
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAssignToCar(equip.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="">装车</option>
                      {cars.map((car) => (
                        <option key={car.id} value={car.id}>
                          {car.plateNumber}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {editingCar ? '编辑车辆' : '添加车辆'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  车牌号
                </label>
                <input
                  type="text"
                  value={formData.plateNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, plateNumber: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="如：京A·12345"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  司机
                </label>
                <select
                  value={formData.driver}
                  onChange={(e) =>
                    setFormData({ ...formData, driver: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                >
                  <option value="">选择司机</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.name}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  装备容量（件）
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all"
                >
                  {editingCar ? '保存修改' : '添加车辆'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckAllIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
