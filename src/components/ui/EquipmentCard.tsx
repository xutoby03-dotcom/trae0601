import { Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Equipment } from '../../types';
import { equipmentTypeLabels, equipmentStatusLabels, getStatusColor, getUserName } from '../../utils/helpers';
import { EquipmentTypeIcon } from './EquipmentTypeIcon';
import { useEquipmentStore } from '../../store/equipmentStore';

interface EquipmentCardProps {
  equipment: Equipment;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export function EquipmentCard({ equipment, onEdit, onDelete, showActions = true }: EquipmentCardProps) {
  const navigate = useNavigate();
  const { users } = useEquipmentStore();
  const owner = getUserName(equipment.ownerId, users);

  const handleClick = () => {
    navigate(`/equipment/${equipment.id}`);
  };

  const unchargedBatteries = equipment.batteries.filter(b => b.chargeLevel < 100).length;
  const needsCard = ['camera', 'memory_card'].includes(equipment.type) && equipment.memoryCards.length === 0;

  return (
    <div
      className="card p-4 cursor-pointer group hover:translate-y-[-2px] transition-all duration-300"
      onClick={handleClick}
    >
      <div className="flex gap-4">
        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0">
          {equipment.photo ? (
            <img
              src={equipment.photo}
              alt={`${equipment.brand} ${equipment.model}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-800">
              <EquipmentTypeIcon type={equipment.type} size={32} className="text-neutral-500" />
            </div>
          )}
          <div className="absolute top-1 left-1 p-1.5 bg-background-lighter/90 rounded">
            <EquipmentTypeIcon type={equipment.type} size={14} className="text-primary" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-neutral-500 mb-0.5">
                {equipmentTypeLabels[equipment.type]}
              </p>
              <h4 className="font-semibold text-neutral-100 truncate">
                {equipment.brand} {equipment.model}
              </h4>
            </div>
            <span className={`status-badge flex-shrink-0 ${getStatusColor(equipment.status)}`}>
              {equipmentStatusLabels[equipment.status]}
            </span>
          </div>

          <div className="mt-2 space-y-1">
            <p className="text-xs text-neutral-400">
              拥有者: <span className="text-neutral-300">{owner}</span>
            </p>
            {equipment.batteries.length > 0 && (
              <p className={`text-xs ${unchargedBatteries > 0 ? 'text-danger' : 'text-success'}`}>
                电池: {equipment.batteries.length} 块
                {unchargedBatteries > 0 && ` (${unchargedBatteries} 块待充电)`}
              </p>
            )}
            {needsCard && (
              <p className="text-xs text-warning">⚠️ 缺少存储卡</p>
            )}
          </div>

          {showActions && (
            <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-neutral-700/50 hover:bg-neutral-700 text-neutral-300 rounded transition-colors"
              >
                <Edit size={12} />
                编辑
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-danger/10 hover:bg-danger/20 text-danger rounded transition-colors"
              >
                <Trash2 size={12} />
                删除
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
