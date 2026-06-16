import { User, Package, Plus, Users, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Vehicle } from '../../types';
import { useFleetStore } from '../../store/fleetStore';
import { cn } from '../../utils/helpers';
import { PersonTag } from './PersonTag';
import { EquipmentTag } from './EquipmentTag';

interface VehicleAllocationProps {
  vehicle: Vehicle;
  selectedPersonId: string | null;
  selectedEquipmentId: string | null;
  onPersonSelectUsed?: () => void;
  onEquipmentSelectUsed?: () => void;
}

export function VehicleAllocation({
  vehicle,
  selectedPersonId,
  selectedEquipmentId,
  onPersonSelectUsed,
  onEquipmentSelectUsed,
}: VehicleAllocationProps) {
  const {
    getVehiclePassengers,
    getVehicleEquipment,
    getUsedSeats,
    getUsedTrunkSpace,
    assignPassenger,
    assignEquipment,
  } = useFleetStore();

  const passengers = getVehiclePassengers(vehicle.id);
  const equipments = getVehicleEquipment(vehicle.id);
  const usedSeats = getUsedSeats(vehicle.id);
  const usedTrunkSpace = getUsedTrunkSpace(vehicle.id);

  const isOverloaded = usedSeats > vehicle.totalSeats;
  const isTrunkFull = usedTrunkSpace > vehicle.trunkSpace;
  const seatPercentage = Math.min((usedSeats / vehicle.totalSeats) * 100, 100);
  const trunkPercentage = Math.min((usedTrunkSpace / vehicle.trunkSpace) * 100, 100);

  const handleAddPerson = () => {
    if (selectedPersonId) {
      assignPassenger(selectedPersonId, vehicle.id);
      onPersonSelectUsed?.();
    }
  };

  const handleAddEquipment = () => {
    if (selectedEquipmentId) {
      assignEquipment(selectedEquipmentId, vehicle.id);
      onEquipmentSelectUsed?.();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden flex flex-col"
    >
      <div className="p-4 border-b border-cream-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-cream-100 flex-shrink-0">
            {vehicle.photoUrl ? (
              <img src={vehicle.photoUrl} alt={vehicle.carModel} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-cream-400">
                <User className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-bold text-forest-800 text-lg truncate">{vehicle.carModel}</h3>
            <p className="text-sm text-gray-500">司机：{vehicle.driverName}</p>
            <p className="text-xs text-gray-400">{vehicle.plateNumber}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3 border-b border-cream-100">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">座位</span>
            </div>
            <div className="flex items-center gap-1">
              {isOverloaded && <AlertTriangle className="w-4 h-4 text-red-500" />}
              <span className={cn('text-sm font-semibold', isOverloaded ? 'text-red-600' : 'text-gray-700')}>
                {usedSeats}/{vehicle.totalSeats}
              </span>
            </div>
          </div>
          <div className="h-2 bg-cream-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${seatPercentage}%` }}
              transition={{ duration: 0.3 }}
              className={cn(
                'h-full rounded-full transition-all',
                isOverloaded ? 'bg-red-500' : seatPercentage >= 80 ? 'bg-warm-500' : 'bg-forest-500'
              )}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Package className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">后备箱</span>
            </div>
            <div className="flex items-center gap-1">
              {isTrunkFull && <AlertTriangle className="w-4 h-4 text-warm-500" />}
              <span className={cn('text-sm font-semibold', isTrunkFull ? 'text-warm-600' : 'text-gray-700')}>
                {usedTrunkSpace}L/{vehicle.trunkSpace}L
              </span>
            </div>
          </div>
          <div className="h-2 bg-cream-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${trunkPercentage}%` }}
              transition={{ duration: 0.3 }}
              className={cn(
                'h-full rounded-full transition-all',
                isTrunkFull ? 'bg-warm-500' : trunkPercentage >= 80 ? 'bg-warm-400' : 'bg-blue-500'
              )}
            />
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">乘车人员</h4>
          {passengers.length > 0 ? (
            <div className="space-y-2">
              {passengers.map((person) => (
                <PersonTag
                  key={person.id}
                  person={person}
                  compact
                  onRemove={() => assignPassenger(person.id, null)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-3">暂无乘车人员</p>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">装备清单</h4>
          {equipments.length > 0 ? (
            <div className="space-y-2">
              {equipments.map((equipment) => (
                <EquipmentTag
                  key={equipment.id}
                  equipment={equipment}
                  compact
                  onRemove={() => assignEquipment(equipment.id, null)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-3">暂无装备</p>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-cream-100 grid grid-cols-2 gap-2">
        <button
          onClick={handleAddPerson}
          disabled={!selectedPersonId}
          className={cn(
            'flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all',
            selectedPersonId
              ? 'bg-forest-500 text-white hover:bg-forest-600 active:bg-forest-700'
              : 'bg-cream-100 text-gray-400 cursor-not-allowed'
          )}
        >
          <Plus className="w-4 h-4" />
          <span>添加人员</span>
        </button>
        <button
          onClick={handleAddEquipment}
          disabled={!selectedEquipmentId}
          className={cn(
            'flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all',
            selectedEquipmentId
              ? 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
              : 'bg-cream-100 text-gray-400 cursor-not-allowed'
          )}
        >
          <Plus className="w-4 h-4" />
          <span>添加装备</span>
        </button>
      </div>
    </motion.div>
  );
}
