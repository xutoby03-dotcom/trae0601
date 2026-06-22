import { useState } from 'react';
import { Save, User, Thermometer, Droplets, MoveRight, MoveDown, CheckCircle, FileText, RotateCcw, Download } from 'lucide-react';
import { useCalibrationStore } from '../../store/useCalibrationStore';
import type { FinalParams } from '../../types/calibration';

export const FinalParamsPanel = () => {
  const task = useCalibrationStore(s => s.task);
  const plates = useCalibrationStore(s => s.task.plates);
  const setFinalParams = useCalibrationStore(s => s.setFinalParams);
  const completeTask = useCalibrationStore(s => s.completeTask);
  const saveToStorage = useCalibrationStore(s => s.saveToStorage);

  const [operator, setOperator] = useState('');
  const [temperature, setTemperature] = useState(22);
  const [humidity, setHumidity] = useState(55);
  const [remark, setRemark] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const avgOffsetX = plates.length ? plates.reduce((s, p) => s + p.offsetX, 0) / plates.length : 0;
  const avgOffsetY = plates.length ? plates.reduce((s, p) => s + p.offsetY, 0) / plates.length : 0;
  const totalTestCount = plates.reduce((s, p) => s + p.testCount, 0);
  const totalIssues = plates.reduce((s, p) => s + p.issues.filter(i => i.marked).length, 0);
  const allPassed = plates.length > 0 && plates.every(p => p.status === 'passed');

  const handleSave = () => {
    const params: FinalParams = {
      confirmedAt: new Date().toISOString(),
      operator,
      overallOffsetX: avgOffsetX,
      overallOffsetY: avgOffsetY,
      temperature,
      humidity,
      remark,
    };
    setFinalParams(params);
    completeTask();
    saveToStorage();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleExport = () => {
    const exportData = JSON.stringify(task, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${task.taskNo}-校准参数.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="card-indigo p-5 animate-fade-in-up grain-overlay overflow-hidden relative"
      style={{ animationDelay: '400ms' }}
    >
      {showSuccess && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-indigo-900/90 backdrop-blur-sm rounded-xl animate-fade-in-up">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-celadon-500/20 flex items-center justify-center animate-pulse-glow">
              <CheckCircle className="w-9 h-9 text-celadon-400" />
            </div>
            <p className="font-serif text-xl font-semibold text-copper-100">校准参数已保存</p>
            <p className="text-sm text-copper-200/70">可在历史记录中查看本次校准数据</p>
          </div>
        </div>
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-copper-300/20 flex items-center justify-center">
              <Save className="w-4 h-4 text-copper-300" />
            </div>
            <h2 className="font-serif text-lg font-semibold text-copper-100 tracking-wide">最终参数</h2>
          </div>
          {task.finalParams && (
            <span className="status-badge bg-celadon-500/20 text-celadon-400 border border-celadon-500/30">
              <CheckCircle className="w-3 h-3" />
              已归档
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-indigo-900/50 rounded-lg px-3 py-2 border border-indigo-700/40">
            <div className="flex items-center gap-1 text-[11px] text-copper-200/60 mb-0.5">
              <MoveRight className="w-3 h-3" />
              平均 X 补偿
            </div>
            <div className="font-mono font-bold text-copper-100 text-lg">
              {avgOffsetX >= 0 ? '+' : ''}{avgOffsetX.toFixed(2)}
              <span className="text-xs font-normal text-copper-200/50 ml-1">mm</span>
            </div>
          </div>
          <div className="bg-indigo-900/50 rounded-lg px-3 py-2 border border-indigo-700/40">
            <div className="flex items-center gap-1 text-[11px] text-copper-200/60 mb-0.5">
              <MoveDown className="w-3 h-3" />
              平均 Y 补偿
            </div>
            <div className="font-mono font-bold text-copper-100 text-lg">
              {avgOffsetY >= 0 ? '+' : ''}{avgOffsetY.toFixed(2)}
              <span className="text-xs font-normal text-copper-200/50 ml-1">mm</span>
            </div>
          </div>
          <div className="bg-indigo-900/50 rounded-lg px-3 py-2 border border-indigo-700/40">
            <div className="text-[11px] text-copper-200/60 mb-0.5">总试印次数</div>
            <div className="font-mono font-bold text-copper-100 text-lg">{totalTestCount}<span className="text-xs font-normal text-copper-200/50 ml-1">次</span></div>
          </div>
          <div className="bg-indigo-900/50 rounded-lg px-3 py-2 border border-indigo-700/40">
            <div className="text-[11px] text-copper-200/60 mb-0.5">问题总数</div>
            <div className={`font-mono font-bold text-lg ${totalIssues > 0 ? 'text-cinnabar-400' : 'text-celadon-400'}`}>
              {totalIssues}<span className="text-xs font-normal text-copper-200/50 ml-1">项</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label-dark">
              <User className="w-3 h-3 inline mr-1.5 -mt-0.5" />
              操作师傅
            </label>
            <input
              type="text"
              className="input-field-dark"
              placeholder="请输入姓名或工号"
              value={operator}
              onChange={e => setOperator(e.target.value)}
              disabled={task.isCompleted}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-dark">
                <Thermometer className="w-3 h-3 inline mr-1.5 -mt-0.5" />
                车间温度
              </label>
              <div className="relative">
                <input
                  type="number"
                  className="input-field-dark pr-7"
                  value={temperature}
                  onChange={e => setTemperature(parseFloat(e.target.value) || 0)}
                  disabled={task.isCompleted}
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-copper-200/50">°C</span>
              </div>
            </div>
            <div>
              <label className="label-dark">
                <Droplets className="w-3 h-3 inline mr-1.5 -mt-0.5" />
                车间湿度
              </label>
              <div className="relative">
                <input
                  type="number"
                  className="input-field-dark pr-7"
                  value={humidity}
                  onChange={e => setHumidity(parseInt(e.target.value) || 0)}
                  disabled={task.isCompleted}
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-copper-200/50">%</span>
              </div>
            </div>
          </div>

          <div>
            <label className="label-dark">
              <FileText className="w-3 h-3 inline mr-1.5 -mt-0.5" />
              校准备注
            </label>
            <textarea
              className="input-field-dark min-h-[60px] resize-none"
              placeholder="记录特殊情况、注意事项..."
              value={remark}
              onChange={e => setRemark(e.target.value)}
              disabled={task.isCompleted}
            />
          </div>
        </div>

        {!allPassed && !task.isCompleted && (
          <div className="mt-3 p-2.5 rounded-lg bg-copper-300/10 border border-copper-300/30">
            <p className="text-xs text-copper-300">
              ⚠ 还有 <span className="font-bold">{plates.filter(p => p.status !== 'passed').length}</span> 个色版未通过校准
            </p>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          {!task.isCompleted ? (
            <>
              <button
                onClick={handleSave}
                disabled={!operator.trim()}
                className="btn-copper flex-1 flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                确认保存参数
              </button>
              <button
                onClick={handleExport}
                className="btn-ghost-dark flex items-center justify-center gap-1.5"
                title="导出 JSON"
              >
                <Download className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleExport}
                className="btn-copper flex-1 flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                导出参数
              </button>
              <button
                onClick={() => {
                  setFinalParams(null);
                  useCalibrationStore.setState(state => ({
                    task: { ...state.task, isCompleted: false },
                  }));
                }}
                className="btn-ghost-dark flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
