import { Vehicle } from '../../types';
import { useFleetStore } from '../../store/fleetStore';
import { cn } from '../../utils/helpers';
import { motion } from 'framer-motion';
import { Edit2, Trash2, User, Users, Package, Fuel, Radio, AlertTriangle } from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
}

export function VehicleCard({ vehicle, onEdit, onDelete }: VehicleCardProps) {
  const getUsedSeats = useFleetStore((state) => state.getUsedSeats);
  const getUsedTrunkSpace = useFleetStore((state) => state.getUsedTrunkSpace);

  const usedSeats = getUsedSeats(vehicle.id);
  const usedTrunkSpace = getUsedTrunkSpace(vehicle.id);

  const isOverload = usedSeats > vehicle.totalSeats;
  const isTrunkFull = usedTrunkSpace > vehicle.trunkSpace;
  const hasWarning = isOverload || isTrunkFull;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'relative bg-white rounded-2xl shadow-card overflow-hidden group',
        hasWarning && 'ring-2 ring-red-400'
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={vehicle.photoUrl}
          alt={vehicle.carModel}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5">
            <User className="w-4 h-4 text-forest-600" />
          </div>
          <span className="text-white font-semibold text-sm drop-shadow">
            {vehicle.driverName}
          </span>
        </div>

        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(vehicle)}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-lg hover:bg-forest-500 hover:text-white text-gray-600 transition-colors shadow"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(vehicle)}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-lg hover:bg-red-500 hover:text-white text-gray-600 transition-colors shadow"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {hasWarning && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-medium shadow">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>
              {isOverload && isTrunkFull
                ? '超载+满载'
                : isOverload
                ? '超载'
                : '满载'}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-serif text-lg font-semibold text-forest-800">
            {vehicle.carModel}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">{vehicle.plateNumber}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="bg-cream-100 p-1.5 rounded-lg">
              <Users className="w-4 h-4 text-forest-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">座位</p>
              <p className={cn(
                'font-medium',
                isOverload ? 'text-red-600' : 'text-gray-700'
              )}>
                {usedSeats}/{vehicle.totalSeats}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="bg-cream-100 p-1.5 rounded-lg">
              <Package className="w-4 h-4 text-forest-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">后备箱</p>
              <p className={cn(
                'font-medium',
                isTrunkFull ? 'text-red-600' : 'text-gray-700'
              )}>
                {usedTrunkSpace}/{vehicle.trunkSpace}L
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="bg-cream-100 p-1.5 rounded-lg">
              <Fuel className="w-4 h-4 text-forest-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">油耗</p>
              <p className="font-medium text-gray-700">
                {vehicle.fuelConsumption}L/100km
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="bg-cream-100 p-1.5 rounded-lg">
              <Radio className="w-4 h-4 text-forest-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">对讲</p>
              <p className="font-medium text-gray-700">{vehicle.radioChannel}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
