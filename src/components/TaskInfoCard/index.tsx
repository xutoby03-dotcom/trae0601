import { FileText, Package, Calendar, Hash } from 'lucide-react';
import { useCalibrationStore } from '../../store/useCalibrationStore';

export const TaskInfoCard = () => {
  const task = useCalibrationStore(s => s.task);
  const updateTaskInfo = useCalibrationStore(s => s.updateTaskInfo);
  const plates = useCalibrationStore(s => s.task.plates);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="card-indigo p-5 animate-fade-in-up grain-overlay overflow-hidden" style={{ animationDelay: '0ms' }}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-copper-300/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-copper-300" />
            </div>
            <h2 className="font-serif text-lg font-semibold text-copper-100 tracking-wide">
              校准任务
            </h2>
          </div>
          <div className="chip bg-copper-300/10 border-copper-300/30 text-copper-300">
            <Hash className="w-3 h-3" />
            {task.taskNo}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label-dark">
              <Package className="w-3 h-3 inline mr-1.5 -mt-0.5" />
              纸张批次
            </label>
            <input
              type="text"
              className="input-field-dark"
              placeholder="例如：XZ-2024-06-A01"
              value={task.paperBatch}
              onChange={e => updateTaskInfo({ paperBatch: e.target.value })}
            />
          </div>

          <div>
            <label className="label-dark">纸张类型</label>
            <select
              className="input-field-dark"
              value={task.paperType}
              onChange={e => updateTaskInfo({ paperType: e.target.value })}
            >
              <option value="宣纸">宣纸</option>
              <option value="皮纸">皮纸</option>
              <option value="夹江纸">夹江纸</option>
              <option value="毛边纸">毛边纸</option>
              <option value="铜版纸">铜版纸</option>
              <option value="其他">其他</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-dark">色版数量</label>
              <div className="input-field-dark flex items-center justify-center text-copper-100 font-semibold">
                {plates.length} 版
              </div>
            </div>
            <div>
              <label className="label-dark">
                <Calendar className="w-3 h-3 inline mr-1.5 -mt-0.5" />
                创建时间
              </label>
              <div className="input-field-dark flex items-center justify-center text-copper-200/80 text-xs">
                {formatDate(task.createdAt)}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-indigo-700/60">
            <div className="flex items-center justify-between text-xs">
              <span className="text-copper-200/60">校准状态</span>
              {task.isCompleted ? (
                <span className="status-badge bg-celadon-500/20 text-celadon-400 border border-celadon-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-celadon-400" />
                  已完成
                </span>
              ) : (
                <span className="status-badge bg-copper-300/10 text-copper-300 border border-copper-300/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-copper-300 animate-pulse" />
                  校准中
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
