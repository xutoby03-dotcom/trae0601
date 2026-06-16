import { EventRecord, Vehicle } from '../../types';
import { eventTypeConfig, formatTime, cn } from '../../utils/helpers';
import { Edit2, Trash2, Clock, AlertTriangle, Route, Car, AlertCircle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface EventTimelineProps {
  events: EventRecord[];
  vehicles: Vehicle[];
  onEdit: (event: EventRecord) => void;
  onDelete: (event: EventRecord) => void;
}

const eventIconMap = {
  delay: Clock,
  detour: Route,
  breakdown: Car,
  accident: AlertTriangle,
  other: FileText,
};

export function EventTimeline({ events, vehicles, onEdit, onDelete }: EventTimelineProps) {
  const sortedEvents = [...events].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const getVehicle = (vehicleId: string | null) => {
    if (!vehicleId) return null;
    return vehicles.find((v) => v.id === vehicleId);
  };

  if (sortedEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-cream-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-forest-500" />
        </div>
        <h3 className="font-serif text-xl font-semibold text-forest-800 mb-2">
          暂无事件记录
        </h3>
        <p className="text-gray-500">点击右上角按钮添加第一条事件记录</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-cream-200" />
      <div className="space-y-6">
        {sortedEvents.map((event, index) => {
          const config = eventTypeConfig[event.type];
          const Icon = eventIconMap[event.type];
          const vehicle = getVehicle(event.vehicleId);

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative pl-16"
            >
              <div className={cn(
                'absolute left-0 w-12 h-12 rounded-full border-4 border-white shadow flex items-center justify-center',
                config.color.split(' ')[0].replace('text-', 'bg-').replace('-100', '-500'),
                config.color.split(' ')[0].includes('red') || config.color.split(' ')[0].includes('warm')
                  ? 'bg-red-500'
                  : config.color.split(' ')[0].includes('blue')
                  ? 'bg-blue-500'
                  : config.color.split(' ')[0].includes('yellow')
                  ? 'bg-yellow-500'
                  : 'bg-gray-500'
              )}>
                <Icon className="w-5 h-5 text-white" />
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <span className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium border',
                        config.color
                      )}>
                        {config.label}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTime(event.time)}
                      </span>
                      {vehicle && (
                        <span className="text-sm text-forest-600 flex items-center gap-1">
                          <Car className="w-3.5 h-3.5" />
                          {vehicle.carModel} ({vehicle.plateNumber})
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onEdit(event)}
                      className="p-2 rounded-lg hover:bg-cream-100 text-gray-500 hover:text-forest-600 transition-colors"
                      title="编辑"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(event)}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
