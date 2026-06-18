import { Link } from 'react-router-dom';
import { MapPin, Tag } from 'lucide-react';
import { Device } from '@/types';
import StatusBadge from './StatusBadge';
import { rooms } from '@/data/rooms';
import { cn } from '@/lib/utils';

interface DeviceCardProps {
  device: Device;
  onClick?: () => void;
  className?: string;
}

const DeviceCard = ({ device, onClick, className }: DeviceCardProps) => {
  const room = rooms.find((r) => r.id === device.roomId);

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer group',
        className
      )}
      onClick={onClick}
    >
      <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
        <img
          src={device.photo}
          alt={device.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <StatusBadge status={device.status} size="sm" />
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-medium text-slate-700 border border-slate-200">
            {device.type}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-slate-800 truncate">{device.name}</h3>
        
        <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
          <Tag className="w-3 h-3" />
          <span className="truncate">{device.serialNumber}</span>
        </div>
        
        <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{room?.name || '未分配'}</span>
          {room && <span className="text-slate-400">· {room.floor}</span>}
        </div>
        
        <div className="mt-3 flex flex-wrap gap-1">
          {device.compatibleDevices.slice(0, 2).map((compat) => (
            <span
              key={compat}
              className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md"
            >
              {compat}
            </span>
          ))}
          {device.compatibleDevices.length > 2 && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-md">
              +{device.compatibleDevices.length - 2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceCard;
