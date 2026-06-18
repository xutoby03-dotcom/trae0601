import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, Save, Droplets } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '@/store';
import { ERASER_STATUS_LABELS, ERASER_STATUS_COLORS } from '@/utils/constants';
import type { EraserStatus, SupplyType } from '@/types';

const penTypes: { type: SupplyType; label: string; color: string }[] = [
  { type: 'blackPen', label: '黑色白板笔', color: 'bg-slate-800' },
  { type: 'redPen', label: '红色白板笔', color: 'bg-red-500' },
  { type: 'bluePen', label: '蓝色白板笔', color: 'bg-blue-500' },
];

const cleanerLevels = [
  { value: 100, label: '满', color: 'bg-emerald-500' },
  { value: 75, label: '75%', color: 'bg-emerald-400' },
  { value: 50, label: '50%', color: 'bg-amber-500' },
  { value: 25, label: '25%', color: 'bg-orange-500' },
  { value: 0, label: '空', color: 'bg-red-500' },
];

export default function InspectionForm() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { rooms, supplies, addInspection } = useAppStore();

  const room = rooms.find((r) => r.id === roomId);
  const roomSupplies = supplies.filter((s) => s.roomId === roomId);

  const [penStatus, setPenStatus] = useState<Record<string, boolean>>({
    blackPen: true,
    redPen: true,
    bluePen: true,
  });
  const [eraserStatus, setEraserStatus] = useState<EraserStatus>('clean');
  const [cleanerLevel, setCleanerLevel] = useState<number>(
    roomSupplies.find((s) => s.type === 'cleaner')?.remainingPercent ?? 100
  );
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!room) {
    return (
      <div className="card p-16 text-center">
        <h3 className="text-lg font-medium text-slate-600 mb-2">会议室不存在</h3>
        <button onClick={() => navigate('/inspection')} className="btn btn-primary mt-4">
          返回列表
        </button>
      </div>
    );
  }

  const handleSubmit = () => {
    addInspection({
      roomId: roomId!,
      inspector: '当前巡检员',
      inspectionDate: new Date().toISOString(),
      penStatus,
      eraserStatus,
      cleanerLevel,
      notes,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card p-10 text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-5">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">巡检完成！</h3>
          <p className="text-slate-500 mb-6">巡检记录已保存，低库存用品将自动生成补给任务</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/inspection')} className="btn btn-secondary">
              返回巡检列表
            </button>
            <button onClick={() => navigate('/tasks')} className="btn btn-primary">
              查看补给任务
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/inspection')}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h2 className="text-xl font-semibold text-slate-800">执行巡检 - {room.name}</h2>
          <p className="text-sm text-slate-500">{room.floor} · 责任人：{room.responsiblePerson}</p>
        </div>
      </div>

      <div className="card p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-accent-500" />
            白板笔试写检查
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            请在白板上试写每支笔，如能流畅出墨则标记正常
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {penTypes.map((pen) => {
              const supply = roomSupplies.find((s) => s.type === pen.type);
              return (
                <div
                  key={pen.type}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    penStatus[pen.type]
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-red-300 bg-red-50'
                  }`}
                  onClick={() => setPenStatus({ ...penStatus, [pen.type]: !penStatus[pen.type] })}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${pen.color} flex items-center justify-center`}>
                      <span className="text-white font-bold">笔</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">{pen.label}</p>
                      <p className="text-xs text-slate-500">库存：{supply?.quantity || 0} 支</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center h-16 bg-white rounded-lg mb-3">
                    <div className={`h-1 w-24 rounded-full ${pen.color}`} />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    {penStatus[pen.type] ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        penStatus[pen.type] ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {penStatus[pen.type] ? '书写正常' : '出墨异常'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">板擦脏污检查</h3>
          <div className="grid grid-cols-3 gap-3">
            {(['clean', 'normal', 'replace'] as EraserStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setEraserStatus(status)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  eraserStatus === status
                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <p className={`font-medium ${eraserStatus === status ? 'text-primary-700' : 'text-slate-700'}`}>
                  {ERASER_STATUS_LABELS[status]}
                </p>
                <span className={`badge mt-2 ${ERASER_STATUS_COLORS[status]}`}>
                  {status === 'clean' ? '可继续使用' : status === 'normal' ? '建议清洁' : '立即更换'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-teal-500" />
            清洁液余量
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {cleanerLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setCleanerLevel(level.value)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  cleanerLevel === level.value
                    ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="h-16 w-full bg-slate-100 rounded-lg mb-2 flex items-end overflow-hidden">
                  <div
                    className={`w-full ${level.color} rounded-t transition-all`}
                    style={{ height: `${level.value}%` }}
                  />
                </div>
                <p
                  className={`text-sm font-medium text-center ${
                    cleanerLevel === level.value ? 'text-teal-700' : 'text-slate-600'
                  }`}
                >
                  {level.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-3">备注说明</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="记录其他需要注意的事项..."
            rows={3}
            className="input-field resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button onClick={() => navigate('/inspection')} className="btn btn-secondary">
          取消
        </button>
        <button onClick={handleSubmit} className="btn btn-primary">
          <Save className="w-4 h-4" />
          提交巡检记录
        </button>
      </div>
    </div>
  );
}
