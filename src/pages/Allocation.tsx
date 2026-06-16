import { useState, useMemo } from 'react';
import { User, Package, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLayout } from '../components/layout/PageLayout';
import { Alert } from '../components/common/Alert';
import { useFleetStore } from '../store/fleetStore';
import { cn } from '../utils/helpers';
import { PersonTag } from '../components/allocation/PersonTag';
import { EquipmentTag } from '../components/allocation/EquipmentTag';
import { VehicleAllocation } from '../components/allocation/VehicleAllocation';

type PoolTab = 'people' | 'equipment';

export default function Allocation() {
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PoolTab>('people');

  const { vehicles, people, passengers, equipment, getWarnings } = useFleetStore();

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
                  className="space-y-2"
                >
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
                    <div className="text-center py-10">
                      <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
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
                  className="space-y-2"
                >
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
                    <div className="text-center py-10">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
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
    </PageLayout>
  );
}
