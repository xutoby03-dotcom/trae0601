import { AlertCircle, Layers, Droplet, Maximize2, CheckCircle2 } from 'lucide-react';
import { useCalibrationStore } from '../../store/useCalibrationStore';
import type { PrintIssueType } from '../../types/calibration';

const issueConfig: Record<PrintIssueType, {
  label: string;
  desc: string;
  icon: typeof AlertCircle;
  color: string;
  bgActive: string;
  borderActive: string;
  glow: string;
}> = {
  ghosting: {
    label: '重影',
    desc: '图像边缘出现双重轮廓，对位不准或压力不均导致',
    icon: Layers,
    color: 'text-cinnabar-500',
    bgActive: 'bg-cinnabar-500/10',
    borderActive: 'border-cinnabar-500/60',
    glow: 'shadow-[0_0_16px_rgba(196,69,54,0.25)]',
  },
  gap: {
    label: '漏白',
    desc: '色块衔接处出现白线，印版收缩或对位偏移导致',
    icon: Droplet,
    color: 'text-copper-500',
    bgActive: 'bg-copper-300/15',
    borderActive: 'border-copper-400/60',
    glow: 'shadow-[0_0_16px_rgba(212,165,116,0.3)]',
  },
  smudge: {
    label: '蹭脏',
    desc: '油墨非预期转移，擦蹭或纸张张力不均造成',
    icon: AlertCircle,
    color: 'text-indigo-700',
    bgActive: 'bg-indigo-800/10',
    borderActive: 'border-indigo-700/40',
    glow: 'shadow-[0_0_16px_rgba(30,58,95,0.2)]',
  },
  stretch: {
    label: '纸张伸缩',
    desc: '纸张受潮/干燥变形，导致套色误差累积',
    icon: Maximize2,
    color: 'text-copper-500',
    bgActive: 'bg-copper-300/15',
    borderActive: 'border-copper-400/60',
    glow: 'shadow-[0_0_16px_rgba(212,165,116,0.3)]',
  },
};

export const IssueMarker = () => {
  const plates = useCalibrationStore(s => s.task.plates);
  const selectedPlateId = useCalibrationStore(s => s.selectedPlateId);
  const toggleIssue = useCalibrationStore(s => s.toggleIssue);
  const updateIssueRemark = useCalibrationStore(s => s.updateIssueRemark);

  const currentPlate = plates.find(p => p.id === selectedPlateId) ?? plates[0];

  if (!currentPlate) {
    return (
      <div className="card-parchment p-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <div className="text-center py-10 text-indigo-700/50">请先添加色版</div>
      </div>
    );
  }

  const totalIssues = currentPlate.issues.filter(i => i.marked).length;

  return (
    <div className="card-parchment p-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cinnabar-500/10 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-cinnabar-500" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-indigo-900 tracking-wide">问题标记</h2>
            <p className="text-xs text-indigo-700/60">勾选当前色版存在的印刷问题</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg border-2 border-copper-200 shadow-sm"
            style={{ backgroundColor: currentPlate.colorHex }}
          />
          <span className="font-semibold text-indigo-900">{currentPlate.colorName || currentPlate.plateNumber}</span>
          {totalIssues > 0 ? (
            <span className="status-badge bg-cinnabar-500/15 text-cinnabar-500 border border-cinnabar-500/30">
              {totalIssues} 项问题
            </span>
          ) : (
            <span className="status-badge bg-celadon-500/15 text-celadon-500 border border-celadon-500/30">
              <CheckCircle2 className="w-3 h-3" />
              无异常
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {currentPlate.issues.map(issue => {
          const cfg = issueConfig[issue.type];
          const Icon = cfg.icon;
          const isActive = issue.marked;

          return (
            <div
              key={issue.type}
              className={`relative rounded-xl border-2 p-3.5 transition-all duration-300 cursor-pointer overflow-hidden ${
                isActive
                  ? `${cfg.bgActive} ${cfg.borderActive} ${cfg.glow}`
                  : 'bg-parchment-50 border-copper-100 hover:border-copper-200 hover:bg-white'
              }`}
              onClick={() => toggleIssue(currentPlate.id, issue.type)}
            >
              {isActive && (
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-30"
                  style={{ color: cfg.color.includes('cinnabar') ? '#c44536' : cfg.color.includes('indigo') ? '#1e3a5f' : '#d4a574' }}
                />
              )}

              <div className="flex items-start gap-2.5">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                    isActive
                      ? `${cfg.borderActive} bg-white`
                      : 'border-copper-200 bg-white'
                  }`}
                >
                  {isActive && <CheckCircle2 className={`w-3.5 h-3.5 ${cfg.color}`} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? cfg.color : 'text-indigo-700/40'}`} />
                    <h3 className={`font-semibold text-sm ${isActive ? 'text-indigo-900' : 'text-indigo-800'}`}>
                      {cfg.label}
                    </h3>
                  </div>
                  <p className="text-[11px] text-indigo-700/55 leading-snug">
                    {cfg.desc}
                  </p>
                </div>
              </div>

              {isActive && (
                <div className="mt-2.5" onClick={e => e.stopPropagation()}>
                  <input
                    type="text"
                    value={issue.remark}
                    onChange={e => updateIssueRemark(currentPlate.id, issue.type, e.target.value)}
                    placeholder="备注位置/程度等细节..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white/80 border border-copper-200 text-xs
                             text-indigo-900 placeholder-indigo-600/30
                             focus:outline-none focus:ring-1 focus:ring-copper-300 focus:border-copper-300"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalIssues > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-cinnabar-500/5 border border-cinnabar-500/15">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-cinnabar-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-800">
              <span className="font-semibold text-cinnabar-500">注意：</span>
              当前色版存在 <span className="font-bold">{totalIssues}</span> 项问题，
              建议调整后再次试印确认。已记录的问题：
              <div className="mt-1 flex flex-wrap gap-1">
                {currentPlate.issues.filter(i => i.marked).map(i => (
                  <span key={i.type} className="px-1.5 py-0.5 rounded bg-cinnabar-500/10 text-cinnabar-500 font-medium">
                    {issueConfig[i.type].label}
                    {i.remark && <span className="text-cinnabar-500/60 ml-0.5">（{i.remark}）</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
