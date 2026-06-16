import { useState, useMemo } from 'react';
import { User, Package, AlertTriangle, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLayout } from '../components/layout/PageLayout';
import { Alert } from '../components/common/Alert';
import { Modal } from '../components/common/Modal';
import { useFleetStore } from '../store/fleetStore';
import { cn, equipmentCategoryConfig } from '../utils/helpers';
import { PersonTag } from '../components/allocation/PersonTag';
import { EquipmentTag } from '../components/allocation/EquipmentTag';
import { VehicleAllocation } from '../components/allocation/VehicleAllocation';
import type { EquipmentCategory } from '../types';

type PoolTab = 'people' | 'equipment';

export default function Allocation() {
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PoolTab>('people');

  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonPhone, setNewPersonPhone] = useState('');

  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [newEquipName, setNewEquipName] = useState('');
  const [newEquipCategory, setNewEquipCategory] = useState<EquipmentCategory>('other');
  const [newEquipSize, setNewEquipSize] = useState<number>(0);
  const [newEquipCritical, setNewEquipCritical] = useState(false);

  const { vehicles, people, passengers, equipment, getWarnings, addPerson, addEquipment } = useFleetStore();

  const warnings = getWarnings();

  const unassignedPeople = useMemo(() => {
    const assignedPersonIds = new Set(passengers.map((p) => p.personId));
    return people.filter((p) => !assignedPersonIds.has(p.id));
  }, [people, passengers]);

  const unassignedEquipment = useMemo(() => {
    return equipment.filter((e) => e.vehicleId === null);
  }, [equipment]);

  const handlePersonClick = (personId: string) => {
    setSelectedPersonId((prev) => (prev === personId ? null : personId));
  };

  const handleEquipmentClick = (equipmentId: string) => {
    setSelectedEquipmentId((prev) => (prev === equipmentId ? null : equipmentId));
  };

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;
    addPerson({ name: newPersonName.trim(), phone: newPersonPhone.trim() });
    setNewPersonName('');
    setNewPersonPhone('');
  };

  const handleResetEquipmentForm = () => {
    setNewEquipName('');
    setNewEquipCategory('other');
    setNewEquipSize(0);
    setNewEquipCritical(false);
  };

  const handleAddEquipment = () => {
    if (!newEquipName.trim()) return;
    const newId = addEquipment({
      name: newEquipName.trim(),
      category: newEquipCategory,
      size: Number(newEquipSize) || 0,
      vehicleId: null,
      isCritical: newEquipCritical,
    });
    setSelectedEquipmentId(newId);
    handleResetEquipmentForm();
    setShowEquipmentModal(false);
  };

  const tabs: { key: PoolTab; label: string; icon: typeof User; count: number }[] = [
    { key: 'people', label: '待分配人员', icon: User, count: unassignedPeople.length },
    { key: 'equipment', label: '待分配装备', icon: Package, count: unassignedEquipment.length },
  ];

  return (
    <PageLayout
      title="人员与装备分配"
      subtitle="将人员和装备分配到各车辆，注意座位和后备箱容量限制"
    >
      {warnings.length > 0 && (
        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-warm-600" />
            <h2 className="font-semibold text-warm-800">预警信息</h2>
            <span className="px-2 py-0.5 rounded-full bg-warm-100 text-warm-700 text-xs font-medium">
              {warnings.length}
            </span>
          </div>
          {warnings.map((warning) => (
            <Alert
              key={warning.id}
              type={warning.level}
              message={warning.message}
            />
          ))}
        </div>
      )}

      <div className="flex gap-6 h-[calc(100vh-260px)]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-80 flex-shrink-0 bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden flex flex-col"
        >
          <div className="border-b border-cream-100">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all relative',
                    activeTab === tab.key
                      ? 'text-forest-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-cream-50'
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded-full text-xs font-medium',
                      activeTab === tab.key ? 'bg-forest-100 text-forest-700' : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {tab.count}
                  </span>
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-forest-500"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-3">
            <AnimatePresence mode="wait">
              {activeTab === 'people' ? (
                <motion.div
                  key="people"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  <form onSubmit={handleAddPerson} className="bg-cream-50 rounded-xl p-3 border border-cream-200">
                    <p className="text-xs font-semibold text-forest-700 mb-2 flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" />
                      补加成员
                    </p>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newPersonName}
                        onChange={(e) => setNewPersonName(e.target.value)}
                        placeholder="姓名 *"
                        className="input text-sm py-1.5"
                      />
                      <input
                        type="tel"
                        value={newPersonPhone}
                        onChange={(e) => setNewPersonPhone(e.target.value)}
                        placeholder="电话"
                        className="input text-sm py-1.5"
                      />
                      <button
                        type="submit"
                        disabled={!newPersonName.trim()}
                        className="btn-primary w-full text-sm py-1.5"
                      >
                        加入待分配
                      </button>
                    </div>
                  </form>

                  {unassignedPeople.length > 0 ? (
                    unassignedPeople.map((person) => (
                      <PersonTag
                        key={person.id}
                        person={person}
                        selected={selectedPersonId === person.id}
                        onClick={() => handlePersonClick(person.id)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <User className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">所有人员已分配</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="equipment"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  <button
                    onClick={() => {
                      handleResetEquipmentForm();
                      setShowEquipmentModal(true);
                    }}
                    className="w-full bg-warm-50 border-2 border-dashed border-warm-300 rounded-xl p-3 text-warm-700 hover:bg-warm-100 hover:border-warm-400 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    添加新装备
                  </button>

                  {unassignedEquipment.length > 0 ? (
                    unassignedEquipment.map((item) => (
                      <EquipmentTag
                        key={item.id}
                        equipment={item}
                        selected={selectedEquipmentId === item.id}
                        onClick={() => handleEquipmentClick(item.id)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">所有装备已分配</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-3 border-t border-cream-100 bg-cream-50/50">
            <p className="text-xs text-gray-500 text-center">
              点击选中后，再点击右侧车辆的「添加」按钮进行分配
            </p>
          </div>
        </motion.div>

        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-min">
            {vehicles.map((vehicle) => (
              <VehicleAllocation
                key={vehicle.id}
                vehicle={vehicle}
                selectedPersonId={selectedPersonId}
                selectedEquipmentId={selectedEquipmentId}
                onPersonSelectUsed={() => setSelectedPersonId(null)}
                onEquipmentSelectUsed={() => setSelectedEquipmentId(null)}
              />
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showEquipmentModal}
        onClose={() => setShowEquipmentModal(false)}
        title="添加新装备"
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowEquipmentModal(false)}
              className="btn-ghost"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleAddEquipment}
              disabled={!newEquipName.trim()}
              className="btn-warm"
            >
              保存到待分配
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">装备名称 *</label>
            <input
              type="text"
              value={newEquipName}
              onChange={(e) => setNewEquipName(e.target.value)}
              placeholder="例如：烧烤架、保温箱..."
              className="input"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">分类</label>
              <select
                value={newEquipCategory}
                onChange={(e) => setNewEquipCategory(e.target.value as EquipmentCategory)}
                className="input"
              >
                {Object.entries(equipmentCategoryConfig).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">体积 (L)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={newEquipSize}
                onChange={(e) => setNewEquipSize(Number(e.target.value))}
                className="input"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
            <button
              type="button"
              role="switch"
              aria-checked={newEquipCritical}
              onClick={() => setNewEquipCritical(!newEquipCritical)}
              className={cn(
                'relative w-12 h-7 rounded-full transition-colors flex-shrink-0',
                newEquipCritical ? 'bg-red-500' : 'bg-gray-300'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform',
                  newEquipCritical ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-800">关键装备</p>
              <p className="text-xs text-red-600">未分配会冒红色提醒，缺了不行的重要物资</p>
            </div>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}
