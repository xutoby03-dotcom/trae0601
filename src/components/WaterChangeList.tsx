import { useState } from 'react';
import { Plus, Droplets, Thermometer, FlaskConical, Pill, Sparkles, Calendar } from 'lucide-react';
import { useFishTankStore } from '@/store/useFishTankStore';
import { cn } from '@/lib/utils';
import WaterChangeForm from './WaterChangeForm';

export default function WaterChangeList() {
  const { waterChanges } = useFishTankStore();
  const [showForm, setShowForm] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return {
      main: `${month}月${day}日`,
      sub: weekDays[date.getDay()],
    };
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-sky-100 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
            <Droplets className="text-sky-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">换水记录</h3>
            <p className="text-sm text-gray-500">共 {waterChanges.length} 条记录</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
            showForm
              ? 'bg-gray-100 text-gray-600'
              : 'bg-sky-600 text-white hover:bg-sky-700 shadow-md hover:shadow-lg'
          )}
        >
          <Plus size={16} />
          {showForm ? '收起' : '添加记录'}
        </button>
      </div>

      {showForm && (
        <div className="p-6 bg-sky-50/50 border-b border-sky-100">
          <WaterChangeForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      <div className="p-6 max-h-[500px] overflow-y-auto">
        <div className="relative">
          <div className="absolute left-[22px] top-2 bottom-2 w-0.5 bg-sky-200" />

          <div className="space-y-6">
            {waterChanges.map((record, index) => {
              const dateInfo = formatDate(record.date);
              return (
                <div key={record.id} className="relative pl-14">
                  <div className="absolute left-0 top-1 w-11 h-11 bg-sky-600 rounded-full flex flex-col items-center justify-center text-white shadow-md">
                    <span className="text-xs font-bold leading-tight">{dateInfo.main}</span>
                    <span className="text-[10px] opacity-80">{dateInfo.sub}</span>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors border border-gray-100">
                    <div className="flex flex-wrap gap-3 mb-3">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-100 text-sky-700 rounded-lg text-sm">
                        <Droplets size={14} />
                        <span className="font-medium">{record.ratio}%</span>
                        <span className="text-xs opacity-70">换水</span>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm">
                        <Thermometer size={14} />
                        <span className="font-medium">{record.temperature}°C</span>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm">
                        <FlaskConical size={14} />
                        <span className="font-medium">PH {record.ph}</span>
                      </div>

                      {record.addMedicine && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-sm">
                          <Pill size={14} />
                          <span className="font-medium">{record.medicineName || '加药'}</span>
                        </div>
                      )}

                      {record.cleanFilter && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm">
                          <Sparkles size={14} />
                          <span className="font-medium">洗滤棉</span>
                        </div>
                      )}
                    </div>

                    {record.notes && (
                      <p className="text-sm text-gray-600 flex items-start gap-2">
                        <Calendar size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
                        <span>{record.notes}</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
