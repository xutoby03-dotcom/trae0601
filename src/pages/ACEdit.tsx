import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ArrowLeft, Calendar, Wind, Clock, AlertTriangle } from 'lucide-react';
import { ACForm } from '@/components/air-conditioner/ACForm';
import { useACStatus } from '@/hooks/useACStatus';
import { useAppStore } from '@/store/useAppStore';
import { STATUS_LABELS, DUST_LEVEL_LABELS, DRYING_STATUS_LABELS } from '@/types';
import type { ACFormData } from '@/types';
import { cn } from '@/lib/utils';

const statusColors = {
  overdue: 'bg-red-100 text-red-600',
  drying: 'bg-amber-100 text-amber-600',
  pending: 'bg-blue-100 text-blue-600',
  completed: 'bg-green-100 text-green-600',
};

export default function ACEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getACById, getRecordsByACId } = useACStatus();
  const { updateAirConditioner } = useAppStore();

  const ac = id ? getACById(id) : undefined;
  const records = id ? getRecordsByACId(id) : [];

  if (!ac) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-gray-800 mb-2">未找到该空调</h2>
        <button
          onClick={() => navigate('/air-conditioners')}
          className="text-primary-500 hover:text-primary-600"
        >
          返回列表
        </button>
      </div>
    );
  }

  const handleSubmit = (data: ACFormData) => {
    if (id) {
      updateAirConditioner(id, data);
      navigate('/air-conditioners');
    }
  };

  const initialData: ACFormData = {
    room: ac.room,
    brand: ac.brand,
    model: ac.model,
    horsepower: ac.horsepower,
    filterType: ac.filterType,
    cleaningCycle: ac.cleaningCycle,
    photo: ac.photo,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/air-conditioners')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">空调详情</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="relative h-64">
          <img
            src={ac.photo}
            alt={`${ac.room}空调`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-1">{ac.room}</h1>
                <p className="text-white/80">
                  {ac.brand} {ac.model}
                </p>
              </div>
              <span
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium',
                  statusColors[ac.status]
                )}
              >
                {STATUS_LABELS[ac.status]}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <Wind className="w-6 h-6 text-primary-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{ac.horsepower}匹</p>
              <p className="text-sm text-gray-500">制冷能力</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <Clock className="w-6 h-6 text-primary-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">
                {ac.daysSinceLastClean}天
              </p>
              <p className="text-sm text-gray-500">距上次清洗</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <Calendar className="w-6 h-6 text-primary-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">
                每{ac.cleaningCycle}天
              </p>
              <p className="text-sm text-gray-500">清洗周期</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <AlertTriangle
                className={cn(
                  'w-6 h-6 mx-auto mb-2',
                  ac.status === 'overdue' ? 'text-red-500' : 'text-green-500'
                )}
              />
              <p className="text-2xl font-bold text-gray-800">
                {ac.status === 'overdue'
                  ? `超期${ac.daysSinceLastClean - ac.cleaningCycle}天`
                  : `还有${ac.cleaningCycle - ac.daysSinceLastClean}天`}
              </p>
              <p className="text-sm text-gray-500">下次清洗</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">清洗历史</h3>
            {records.length === 0 ? (
              <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-xl">
                暂无清洗记录
              </p>
            ) : (
              <div className="space-y-4">
                {records.map((record, index) => (
                  <div
                    key={record.id}
                    className="flex gap-4 p-4 bg-gray-50 rounded-xl animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-2 bg-primary-500 rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="font-medium text-gray-800">
                          {record.cleaner}
                        </span>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-medium',
                            record.dustLevel === 'heavy'
                              ? 'bg-red-100 text-red-600'
                              : record.dustLevel === 'medium'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-green-100 text-green-600'
                          )}
                        >
                          灰尘{DUST_LEVEL_LABELS[record.dustLevel]}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                          {DRYING_STATUS_LABELS[record.dryingStatus]}
                        </span>
                        {record.ventWiped && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">
                            已擦出风口
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>
                          拆下：
                          {format(parseISO(record.removedAt), 'yyyy年MM月dd日 HH:mm', {
                            locale: zhCN,
                          })}
                        </p>
                        {record.installedBackAt && (
                          <p>
                            装回：
                            {format(
                              parseISO(record.installedBackAt),
                              'yyyy年MM月dd日 HH:mm',
                              { locale: zhCN }
                            )}
                          </p>
                        )}
                        {record.notes && (
                          <p className="text-gray-600">备注：{record.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ACForm initialData={initialData} onSubmit={handleSubmit} isEditing />
    </div>
  );
}
