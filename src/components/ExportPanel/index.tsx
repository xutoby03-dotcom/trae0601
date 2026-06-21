import { useState, useMemo } from 'react';
import { useWindStore } from '../../store/useWindStore';
import { useWindSimulation } from '../../hooks/useWindSimulation';
import { exportToCSV, exportToJSON, exportRiskList, downloadFile } from '../../utils/exportUtils';
import { getRiskLevel } from '../../utils/riskAssessment';
import { RISK_TYPE_LABELS } from '../../types';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Download, FileText, FileSpreadsheet, FileJson, AlertTriangle, CheckCircle2, Eye } from 'lucide-react';

export const ExportPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { poles, riskMarks, rooftop, windData, focusPole } = useWindStore();
  const { allPoleStats, riskSummary } = useWindSimulation();

  const riskListPreview = useMemo(() => {
    return poles
      .map(pole => {
        const stat = allPoleStats.find(s => s.poleId === pole.id);
        const mark = riskMarks.find(m => m.poleId === pole.id);
        if (!stat || stat.riskScore <= 30) return null;
        const risk = getRiskLevel(stat.riskScore);
        return {
          pole,
          stat,
          mark,
          risk,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.stat.riskScore - a!.stat.riskScore);
  }, [poles, allPoleStats, riskMarks]);

  const handleExportCSV = () => {
    const csv = exportToCSV(poles, allPoleStats, riskMarks, windData.hours);
    const filename = `风场风险评估_${rooftop.name}_${new Date().toISOString().split('T')[0]}.csv`;
    downloadFile(csv, filename, 'text/csv;charset=utf-8');
  };

  const handleExportJSON = () => {
    const json = exportToJSON(poles, allPoleStats, riskMarks, windData.hours, rooftop.name);
    const filename = `风场风险评估_${rooftop.name}_${new Date().toISOString().split('T')[0]}.json`;
    downloadFile(json, filename, 'application/json');
  };

  const handleExportRiskList = () => {
    const report = exportRiskList(poles, allPoleStats, riskMarks);
    const filename = `安装前风险清单_${rooftop.name}_${new Date().toISOString().split('T')[0]}.txt`;
    downloadFile(report, filename, 'text/plain;charset=utf-8');
  };

  return (
    <>
      <Button
        variant="default"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Download size={16} />
        导出报告
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <Card className="w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download size={18} className="text-cyan-400" />
                导出风险评估报告
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/30">
                <div className="flex items-center gap-2 mb-2">
                  {riskSummary.highRisk > 0 ? (
                    <AlertTriangle size={16} className="text-amber-400" />
                  ) : (
                    <CheckCircle2 size={16} className="text-green-400" />
                  )}
                  <span className="text-sm font-medium text-slate-200">报告概览</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-slate-400">项目名称:</div>
                  <div className="text-slate-200 font-mono">{rooftop.name}</div>
                  <div className="text-slate-400">旗杆总数:</div>
                  <div className="text-slate-200 font-mono">{riskSummary.totalPoles} 根</div>
                  <div className="text-slate-400">高风险:</div>
                  <div className="text-red-400 font-mono">{riskSummary.highRisk} 根</div>
                  <div className="text-slate-400">中风险:</div>
                  <div className="text-amber-400 font-mono">{riskSummary.mediumRisk} 根</div>
                  <div className="text-slate-400">已标记:</div>
                  <div className="text-cyan-400 font-mono">{riskSummary.markedPoles} 根</div>
                  <div className="text-slate-400">平均风险分:</div>
                  <div className="text-slate-200 font-mono">{riskSummary.averageRiskScore}</div>
                </div>
              </div>

              <div className="rounded-lg bg-slate-900/50 border border-slate-700/30 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-700/30">
                  <Eye size={16} className="text-cyan-400" />
                  <span className="text-sm font-medium text-slate-200">风险清单预览</span>
                  <span className="text-xs text-slate-400 ml-auto">
                    共 {riskListPreview.length} 根需处理
                  </span>
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {riskListPreview.length === 0 ? (
                    <div className="p-6 text-center">
                      <CheckCircle2 size={28} className="mx-auto text-green-400 mb-2" />
                      <div className="text-sm text-green-400 font-medium">所有旗杆风险评估为低风险</div>
                      <div className="text-xs text-slate-400 mt-1">可按原方案正常安装</div>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-700/30">
                      {riskListPreview.map((item) => (
                        <div
                          key={item!.pole.id}
                          className="p-3 hover:bg-slate-800/50 transition-colors cursor-pointer group"
                          onClick={() => {
                            focusPole(item!.pole.id);
                            setIsOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                item!.risk.level === 'high'
                                  ? 'bg-red-400'
                                  : 'bg-amber-400'
                              }`}
                            />
                            <span className="text-sm font-medium text-slate-200">
                              {item!.pole.id.replace('pole-', '旗杆 #')}
                            </span>
                            <span
                              className={`ml-auto text-xs font-mono px-1.5 py-0.5 rounded ${
                                item!.risk.level === 'high'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-amber-500/20 text-amber-400'
                              }`}
                            >
                              {item!.stat.riskScore}分
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mb-1.5">
                            高缠绕 {item!.stat.tanglingHours}h/天 · 最大阵风 {item!.stat.maxGustSpeed}m/s
                          </div>
                          {item!.mark ? (
                            <div className="text-xs">
                              <span className="text-cyan-400">
                                标记: {RISK_TYPE_LABELS[item!.mark.type]}
                              </span>
                              {item!.mark.note && (
                                <span className="text-slate-400 ml-2">
                                  · 备注: {item!.mark.note}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-slate-500">
                              未标记 — 点击在画布中定位并评估
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="default"
                  className="w-full justify-start gap-3"
                  onClick={handleExportRiskList}
                >
                  <FileText size={18} className="text-amber-400" />
                  <div className="text-left">
                    <div className="font-medium">安装前风险清单</div>
                    <div className="text-xs text-slate-400">TXT 格式，仅包含需处理的旗杆</div>
                  </div>
                </Button>

                <Button
                  variant="secondary"
                  className="w-full justify-start gap-3"
                  onClick={handleExportCSV}
                >
                  <FileSpreadsheet size={18} className="text-green-400" />
                  <div className="text-left">
                    <div className="font-medium">完整数据报表</div>
                    <div className="text-xs text-slate-400">CSV 格式，包含所有数据和24小时风场</div>
                  </div>
                </Button>

                <Button
                  variant="secondary"
                  className="w-full justify-start gap-3"
                  onClick={handleExportJSON}
                >
                  <FileJson size={18} className="text-purple-400" />
                  <div className="text-left">
                    <div className="font-medium">结构化数据</div>
                    <div className="text-xs text-slate-400">JSON 格式，便于程序处理</div>
                  </div>
                </Button>
              </div>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                关闭
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
