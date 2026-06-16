import { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  Wrench,
  Shield,
  Gauge,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useAppStore } from '../store';
import { BUILDINGS, UNITS, cn } from '../lib/utils';
import StatusBadge from '../components/StatusBadge';
import type { Elevator, Maintenance, ElevatorTimeSlot } from '../../shared/types';

interface ElevatorFormData {
  name: string;
  building: string;
  unit: string;
  maxLoad: number | '';
  allowsProtectionMat: boolean;
  status: Elevator['status'];
}

interface MaintenanceFormData {
  date: string;
  startTime: string;
  endTime: string;
  description: string;
}

interface TimeSlotFormData {
  startTime: string;
  endTime: string;
}

const initialFormData: ElevatorFormData = {
  name: '',
  building: '',
  unit: '',
  maxLoad: '',
  allowsProtectionMat: true,
  status: 'active',
};

const initialMaintenanceForm: MaintenanceFormData = {
  date: '',
  startTime: '09:00',
  endTime: '12:00',
  description: '',
};

const initialTimeSlotForm: TimeSlotFormData = {
  startTime: '08:00',
  endTime: '10:00',
};

export default function Elevators() {
  const { elevators, fetchElevators, createElevator, updateElevator, deleteElevator } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ElevatorFormData>(initialFormData);
  const [selectedElevator, setSelectedElevator] = useState<Elevator | null>(null);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState<MaintenanceFormData>(initialMaintenanceForm);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [timeSlotForm, setTimeSlotForm] = useState<TimeSlotFormData>(initialTimeSlotForm);
  const [editingTimeSlotId, setEditingTimeSlotId] = useState<string | null>(null);

  useEffect(() => {
    fetchElevators();
  }, [fetchElevators]);

  useEffect(() => {
    if (editingId) {
      const elevator = elevators.find(e => e.id === editingId);
      if (elevator) {
        setFormData({
          name: elevator.name,
          building: elevator.building,
          unit: elevator.unit,
          maxLoad: elevator.maxLoad,
          allowsProtectionMat: elevator.allowsProtectionMat,
          status: elevator.status,
        });
      }
    }
  }, [editingId, elevators]);

  const handleInputChange = (field: keyof ElevatorFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.building || !formData.unit || !formData.maxLoad) return;
    
    try {
      const data = {
        name: formData.name,
        building: formData.building,
        unit: formData.unit,
        maxLoad: formData.maxLoad as number,
        allowsProtectionMat: formData.allowsProtectionMat,
        status: formData.status,
      };
      
      if (editingId) {
        await updateElevator(editingId, data);
      } else {
        await createElevator(data);
      }
      
      handleCloseForm();
    } catch (error) {
      // Error handled by store
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  const handleEdit = (elevator: Elevator) => {
    setEditingId(elevator.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这部电梯吗？')) {
      await deleteElevator(id);
    }
  };

  const handleAddMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedElevator || !maintenanceForm.date) return;
    
    try {
      const { elevatorApi } = await import('../lib/api');
      await elevatorApi.addMaintenance(selectedElevator.id, maintenanceForm);
      
      const updated = await elevatorApi.getById(selectedElevator.id);
      setSelectedElevator(updated);
      
      setShowMaintenanceForm(false);
      setMaintenanceForm(initialMaintenanceForm);
    } catch (error) {
      // Error handled by store
    }
  };

  const handleDeleteMaintenance = async (maintenanceId: string) => {
    if (!selectedElevator) return;
    if (confirm('确定要删除这条检修安排吗？')) {
      try {
        const { elevatorApi } = await import('../lib/api');
        await elevatorApi.deleteMaintenance(maintenanceId);
        
        const updated = await elevatorApi.getById(selectedElevator.id);
        setSelectedElevator(updated);
      } catch (error) {
        // Error handled by store
      }
    }
  };

  const handleOpenTimeSlots = (elevator: Elevator) => {
    setSelectedElevator(elevator);
    setShowTimeSlotModal(true);
    setEditingTimeSlotId(null);
    setTimeSlotForm(initialTimeSlotForm);
  };

  const handleCloseTimeSlots = () => {
    setShowTimeSlotModal(false);
    setSelectedElevator(null);
    setEditingTimeSlotId(null);
    setTimeSlotForm(initialTimeSlotForm);
  };

  const handleAddTimeSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedElevator) return;
    
    try {
      const { elevatorApi } = await import('../lib/api');
      
      if (editingTimeSlotId) {
        await elevatorApi.updateTimeSlot(editingTimeSlotId, timeSlotForm);
      } else {
        await elevatorApi.addTimeSlot(selectedElevator.id, timeSlotForm);
      }
      
      const updated = await elevatorApi.getById(selectedElevator.id);
      setSelectedElevator(updated);
      
      setEditingTimeSlotId(null);
      setTimeSlotForm(initialTimeSlotForm);
      
      await fetchElevators();
    } catch (error) {
      // Error handled by store
    }
  };

  const handleEditTimeSlot = (slot: ElevatorTimeSlot) => {
    setEditingTimeSlotId(slot.id);
    setTimeSlotForm({
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
  };

  const handleDeleteTimeSlot = async (slotId: string) => {
    if (!selectedElevator) return;
    if (confirm('确定要删除这个时段吗？')) {
      try {
        const { elevatorApi } = await import('../lib/api');
        await elevatorApi.deleteTimeSlot(slotId);
        
        const updated = await elevatorApi.getById(selectedElevator.id);
        setSelectedElevator(updated);
        
        await fetchElevators();
      } catch (error) {
        // Error handled by store
      }
    }
  };

  const activeElevators = elevators.filter(e => e.status === 'active').length;
  const maintenanceElevators = elevators.filter(e => e.status === 'maintenance').length;
  const totalCapacity = elevators.reduce((sum, e) => sum + e.maxLoad, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-sky-600" />
            电梯档案管理
          </h1>
          <p className="text-slate-500 mt-1">管理小区电梯信息、载重配置和检修安排</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          新增电梯
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">电梯总数</p>
              <p className="text-2xl font-bold text-slate-800">{elevators.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">正常运行</p>
              <p className="text-2xl font-bold text-green-600">{activeElevators}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Wrench className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">检修中</p>
              <p className="text-2xl font-bold text-orange-600">{maintenanceElevators}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Gauge className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">总载重</p>
              <p className="text-2xl font-bold text-purple-600">{totalCapacity}kg</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {elevators.map(elevator => (
          <div
            key={elevator.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-800">{elevator.name}</h3>
                <p className="text-sm text-slate-500">{elevator.building} {elevator.unit}</p>
              </div>
              <StatusBadge status={elevator.status} />
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Gauge className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">最大载重:</span>
                <span className="font-medium text-slate-800">{elevator.maxLoad} kg</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">保护垫:</span>
                <span className={cn(
                  'font-medium',
                  elevator.allowsProtectionMat ? 'text-green-600' : 'text-slate-500'
                )}>
                  {elevator.allowsProtectionMat ? '支持' : '不支持'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(elevator)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                编辑
              </button>
              <button
                onClick={() => handleOpenTimeSlots(elevator)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Clock className="w-4 h-4" />
                时段
              </button>
              <button
                onClick={() => setSelectedElevator(elevator)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Wrench className="w-4 h-4" />
                检修
              </button>
              <button
                onClick={() => handleDelete(elevator.id)}
                className="px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {elevators.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-3" />
            <p>暂无电梯档案</p>
            <p className="text-sm">点击上方按钮添加电梯</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800">
                {editingId ? '编辑电梯' : '新增电梯'}
              </h2>
              <button
                onClick={handleCloseForm}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  电梯名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="如：1栋A单元货梯"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    楼栋 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.building}
                    onChange={(e) => handleInputChange('building', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    required
                  >
                    <option value="">请选择</option>
                    {BUILDINGS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    单元 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    required
                  >
                    <option value="">请选择</option>
                    {UNITS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  最大载重 (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="100"
                  value={formData.maxLoad}
                  onChange={(e) => handleInputChange('maxLoad', parseInt(e.target.value) || '')}
                  placeholder="如：1000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </div>
              
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowsProtectionMat}
                    onChange={(e) => handleInputChange('allowsProtectionMat', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-slate-700">支持铺设保护垫</span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  状态 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as Elevator['status'])}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  required
                >
                  <option value="active">正常</option>
                  <option value="maintenance">检修中</option>
                  <option value="disabled">禁用</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                >
                  {editingId ? '保存修改' : '添加电梯'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedElevator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">检修安排</h2>
                <p className="text-sm text-slate-500">{selectedElevator.name}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedElevator(null);
                  setShowMaintenanceForm(false);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-slate-700">检修计划</h3>
                <button
                  onClick={() => setShowMaintenanceForm(!showMaintenanceForm)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  添加检修
                </button>
              </div>
              
              {showMaintenanceForm && (
                <form onSubmit={handleAddMaintenance} className="bg-slate-50 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">日期</label>
                      <input
                        type="date"
                        value={maintenanceForm.date}
                        onChange={(e) => setMaintenanceForm(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">时段</label>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={maintenanceForm.startTime}
                          onChange={(e) => setMaintenanceForm(prev => ({ ...prev, startTime: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                          required
                        />
                        <span className="self-center text-slate-500">-</span>
                        <input
                          type="time"
                          value={maintenanceForm.endTime}
                          onChange={(e) => setMaintenanceForm(prev => ({ ...prev, endTime: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">检修内容</label>
                    <input
                      type="text"
                      value={maintenanceForm.description}
                      onChange={(e) => setMaintenanceForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="如：年度检修、例行保养等"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMaintenanceForm(false);
                        setMaintenanceForm(initialMaintenanceForm);
                      }}
                      className="px-4 py-2 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                    >
                      保存
                    </button>
                  </div>
                </form>
              )}
              
              <div className="space-y-3">
                {selectedElevator.maintenanceSchedule && selectedElevator.maintenanceSchedule.length > 0 ? (
                  selectedElevator.maintenanceSchedule.map(maint => (
                    <div
                      key={maint.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-orange-500" />
                          <span className="font-medium text-slate-800">{maint.description || '检修'}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          {maint.date} {maint.startTime} - {maint.endTime}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteMaintenance(maint.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p>暂无检修安排</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showTimeSlotModal && selectedElevator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">可用时段管理</h2>
                <p className="text-sm text-slate-500">{selectedElevator.name}</p>
              </div>
              <button
                onClick={handleCloseTimeSlots}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-slate-700">时段列表</h3>
                <button
                  onClick={() => {
                    setEditingTimeSlotId(null);
                    setTimeSlotForm(initialTimeSlotForm);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  添加时段
                </button>
              </div>

              <form onSubmit={handleAddTimeSlot} className="bg-slate-50 rounded-xl p-4 mb-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">开始时间</label>
                    <input
                      type="time"
                      value={timeSlotForm.startTime}
                      onChange={(e) => setTimeSlotForm(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      required
                    />
                  </div>
                  <span className="pb-2 text-slate-500">-</span>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">结束时间</label>
                    <input
                      type="time"
                      value={timeSlotForm.endTime}
                      onChange={(e) => setTimeSlotForm(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    {editingTimeSlotId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTimeSlotId(null);
                          setTimeSlotForm(initialTimeSlotForm);
                        }}
                        className="px-4 py-2 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        取消
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                    >
                      {editingTimeSlotId ? '修改' : '添加'}
                    </button>
                  </div>
                </div>
              </form>
              
              <div className="space-y-3">
                {selectedElevator.timeSlots && selectedElevator.timeSlots.length > 0 ? (
                  selectedElevator.timeSlots.map(slot => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-sky-600" />
                        </div>
                        <div>
                          <span className="font-medium text-slate-800">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditTimeSlot(slot)}
                          className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTimeSlot(slot.id)}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p>暂无可用时段</p>
                    <p className="text-sm">请先为这部电梯添加可用时段</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
