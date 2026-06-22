import { Plus, Trash2, MoveRight, MoveDown, Clock, Check, Loader, Circle, MapPin } from 'lucide-react';
import { useCalibrationStore } from '../../store/useCalibrationStore';
import { PRESET_COLORS } from '../../types/calibration';
import type { ColorPlate, PlateStatus } from '../../types/calibration';

const statusConfig: Record<PlateStatus, { label: string; icon: typeof Circle; cls: string }> = {
  pending: { label: '待校准', icon: Circle, cls: 'bg-indigo-700/40 text-copper-200/70 border-indigo-600/40' },
  testing: { label: '校准中', icon: Loader, cls: 'bg-copper-300/15 text-copper-300 border-copper-300/30' },
  passed: { label: '已通过', icon: Check, cls: 'bg-celadon-500/15 text-celadon-400 border-celadon-500/30' },
};

const PlateRow = ({ plate, isSelected }: { plate: ColorPlate; isSelected: boolean }) => {
  const updatePlate = useCalibrationStore(s => s.updatePlate);
  const selectPlate = useCalibrationStore(s => s.selectPlate);
  const removePlate = useCalibrationStore(s => s.removePlate);
  const platesCount = useCalibrationStore(s => s.task.plates.length);

  const hasIssue = plate.issues.some(i => i.marked);
  const totalOffset = Math.sqrt(plate.offsetX ** 2 + plate.offsetY ** 2);
  const offsetClass =
    totalOffset > 0.5 ? 'text-cinnabar-500' : totalOffset > 0.2 ? 'text-copper-400' : 'text-celadon-500';

  const status = statusConfig[plate.status];
  const StatusIcon = status.icon;

  return (
    <div
      onClick={() => selectPlate(plate.id)}
      className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-indigo-800/80 border-copper-400/60 shadow-glow-copper'
          : 'bg-indigo-900/40 border-indigo-700/50 hover:border-indigo-600/60 hover:bg-indigo-900/60'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <div
            className="w-10 h-10 rounded-lg border-2 border-copper-300/30 shadow-inner"
            style={{ backgroundColor: plate.colorHex || '#1a1a1a' }}
          />
          <span className="absolute -bottom-1 -right-1 bg-indigo-900 border border-copper-300/40 text-copper-200 text-[10px] font-bold px-1 rounded">
            {plate.plateNumber.replace('P', '')}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={plate.colorName}
                onChange={e => updatePlate(plate.id, { colorName: e.target.value })}
                onClick={e => e.stopPropagation()}
                placeholder="颜色名称"
                className="w-20 bg-transparent border-b border-indigo-600/40 text-copper-100 text-sm font-medium focus:outline-none focus:border-copper-300/60 placeholder-indigo-600/50"
              />
              <span className={`status-badge border ${status.cls}`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
              {hasIssue && (
                <span className="status-badge bg-cinnabar-500/15 text-cinnabar-400 border-cinnabar-500/30 border">
                  有问题
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <select
                value={plate.status}
                onChange={e => updatePlate(plate.id, { status: e.target.value as PlateStatus })}
                onClick={e => e.stopPropagation()}
                className="bg-indigo-900 border border-indigo-700 text-copper-200 text-xs rounded px-1.5 py-0.5 focus:outline-none"
              >
                <option value="pending">待校准</option>
                <option value="testing">校准中</option>
                <option value="passed">已通过</option>
              </select>
              {platesCount > 1 && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    removePlate(plate.id);
                  }}
                  className="p-1 rounded text-copper-200/50 hover:text-cinnabar-400 hover:bg-cinnabar-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <MoveRight className={`w-3 h-3 ${plate.offsetX > 0 ? 'text-copper-300' : plate.offsetX < 0 ? 'text-cinnabar-400' : 'text-indigo-500'}`} />
              <span className="text-indigo-500">X</span>
              <input
                type="number"
                step="0.1"
                value={plate.offsetX}
                onChange={e => updatePlate(plate.id, { offsetX: parseFloat(e.target.value) || 0 })}
                onClick={e => e.stopPropagation()}
                className={`w-16 bg-indigo-900/60 border border-indigo-700/60 rounded px-1.5 py-0.5 text-center font-mono text-sm ${offsetClass}`}
              />
              <span className="text-indigo-500">mm</span>
            </div>

            <div className="flex items-center gap-1">
              <MoveDown className={`w-3 h-3 ${plate.offsetY > 0 ? 'text-copper-300' : plate.offsetY < 0 ? 'text-cinnabar-400' : 'text-indigo-500'}`} />
              <span className="text-indigo-500">Y</span>
              <input
                type="number"
                step="0.1"
                value={plate.offsetY}
                onChange={e => updatePlate(plate.id, { offsetY: parseFloat(e.target.value) || 0 })}
                onClick={e => e.stopPropagation()}
                className={`w-16 bg-indigo-900/60 border border-indigo-700/60 rounded px-1.5 py-0.5 text-center font-mono text-sm ${offsetClass}`}
              />
              <span className="text-indigo-500">mm</span>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-indigo-500" />
              <span className="text-indigo-500">试印</span>
              <input
                type="number"
                min="0"
                value={plate.testCount}
                onChange={e => updatePlate(plate.id, { testCount: parseInt(e.target.value) || 0 })}
                onClick={e => e.stopPropagation()}
                className="w-12 bg-indigo-900/60 border border-indigo-700/60 rounded px-1.5 py-0.5 text-center font-mono text-sm text-copper-200"
              />
              <span className="text-indigo-500">次</span>
            </div>

            <div className="flex items-center justify-end gap-1 text-indigo-500">
              <span>色值</span>
              <input
                type="color"
                value={plate.colorHex}
                onChange={e => updatePlate(plate.id, { colorHex: e.target.value })}
                onClick={e => e.stopPropagation()}
                className="w-6 h-6 rounded cursor-pointer border border-indigo-700/60 bg-transparent"
              />
            </div>
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-indigo-700/40 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-copper-300" />
              <span className="text-copper-200/70">针位</span>
              <span className="text-indigo-500">X</span>
              <input
                type="number"
                step="0.1"
                value={plate.pinPositionX}
                onChange={e => updatePlate(plate.id, { pinPositionX: parseFloat(e.target.value) || 0 })}
                onClick={e => e.stopPropagation()}
                className="w-14 bg-indigo-900/60 border border-indigo-700/60 rounded px-1.5 py-0.5 text-center font-mono text-sm text-copper-200"
              />
              <span className="text-indigo-500">mm</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3" />
              <span className="text-copper-200/70">　</span>
              <span className="text-indigo-500">Y</span>
              <input
                type="number"
                step="0.1"
                value={plate.pinPositionY}
                onChange={e => updatePlate(plate.id, { pinPositionY: parseFloat(e.target.value) || 0 })}
                onClick={e => e.stopPropagation()}
                className="w-14 bg-indigo-900/60 border border-indigo-700/60 rounded px-1.5 py-0.5 text-center font-mono text-sm text-copper-200"
              />
              <span className="text-indigo-500">mm</span>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {PRESET_COLORS.map(c => (
              <button
                key={c.hex}
                onClick={e => {
                  e.stopPropagation();
                  updatePlate(plate.id, { colorHex: c.hex, colorName: plate.colorName || c.name });
                }}
                title={c.name}
                className="w-4 h-4 rounded-full border border-copper-300/20 hover:scale-125 transition-transform"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PlateList = () => {
  const plates = useCalibrationStore(s => s.task.plates);
  const selectedPlateId = useCalibrationStore(s => s.selectedPlateId);
  const addPlate = useCalibrationStore(s => s.addPlate);

  return (
    <div className="card-indigo p-5 animate-fade-in-up grain-overlay overflow-hidden" style={{ animationDelay: '100ms' }}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-semibold text-copper-100 tracking-wide">色版列表</h2>
          <button
            onClick={addPlate}
            className="btn-ghost-dark flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            添加色版
          </button>
        </div>

        <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
          {plates.map(p => (
            <PlateRow key={p.id} plate={p} isSelected={p.id === selectedPlateId} />
          ))}
        </div>
      </div>
    </div>
  );
};
