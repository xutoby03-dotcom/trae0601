import { useState } from 'react';
import { useWindStore } from '../../store/useWindStore';
import { useWindSimulation } from '../../hooks/useWindSimulation';
import { exportToCSV, exportToJSON, exportRiskList, downloadFile } from '../../utils/exportUtils';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Download, FileText, FileSpreadsheet, FileJson, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const ExportPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { poles, riskMarks, rooftop, windData } = useWindStore();
  const { allPoleStats, riskSummary } = useWindSimulation();

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
          <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
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
