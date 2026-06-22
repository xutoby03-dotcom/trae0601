import { useState, useMemo } from 'react';
import { Download, X, Check, FileDown, Info } from 'lucide-react';
import { useSpecimenStore } from '@/store/useSpecimenStore';
import { exportToCSV, downloadCSV, getExhibitionReadySpecimens } from '@/utils/export';
import { formatDate } from '@/utils/date';

export default function ExportPanel() {
  const specimens = useSpecimenStore((s) => s.specimens);
  const [isOpen, setIsOpen] = useState(false);
  const [exportMode, setExportMode] = useState<'ready' | 'all'>('ready');
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const readyCount = useMemo(() => getExhibitionReadySpecimens(specimens).length, [specimens]);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      const targetSpecimens =
        exportMode === 'ready' ? getExhibitionReadySpecimens(specimens) : specimens;
      const csv = exportToCSV(targetSpecimens);
      const filename = `标本清单_${formatDate(new Date().toISOString())}_${
        exportMode === 'ready' ? '展柜可用' : '全部'
      }.csv`;
      downloadCSV(csv, filename);
      setExporting(false);
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        setIsOpen(false);
      }, 1500);
    }, 800);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-forest-500 hover:bg-forest-600 transition-all duration-200 shadow-card hover:shadow-card-hover active:scale-[0.98]"
      >
        <Download className="w-5 h-5" />
        导出清单
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-paper-50 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-paper-200 bg-white">
              <div className="flex items-center gap-2">
                <FileDown className="w-5 h-5 text-forest-600" />
                <h3 className="font-serif text-lg font-bold text-gray-800">导出标本清单</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-forest-50 border border-forest-100 flex items-start gap-3">
                <Info className="w-5 h-5 text-forest-500 shrink-0 mt-0.5" />
                <p className="text-sm text-forest-700">
                  导出格式为 CSV（逗号分隔值），可直接用 Excel 或 WPS 打开。
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">选择导出范围：</p>

                <button
                  onClick={() => setExportMode('ready')}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    exportMode === 'ready'
                      ? 'border-forest-500 bg-forest-50'
                      : 'border-gray-200 bg-white hover:border-forest-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">展柜可用标本</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        已完成干燥、无发霉、无卷边、无褪色、标签完整
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-sm font-bold bg-forest-500 text-white">
                        {readyCount} 份
                      </span>
                      {exportMode === 'ready' && (
                        <div className="w-6 h-6 rounded-full bg-forest-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setExportMode('all')}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    exportMode === 'all'
                      ? 'border-forest-500 bg-forest-50'
                      : 'border-gray-200 bg-white hover:border-forest-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">全部标本</p>
                      <p className="text-xs text-gray-500 mt-0.5">包含所有状态的标本记录</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-sm font-bold bg-gray-200 text-gray-700">
                        {specimens.length} 份
                      </span>
                      {exportMode === 'all' && (
                        <div className="w-6 h-6 rounded-full bg-forest-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="px-6 py-4 bg-white border-t border-paper-200 flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleExport}
                disabled={
                  exporting ||
                  exportSuccess ||
                  (exportMode === 'ready' && readyCount === 0) ||
                  (exportMode === 'all' && specimens.length === 0)
                }
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 ${
                  exportSuccess
                    ? 'bg-green-500'
                    : exporting
                    ? 'bg-forest-400 cursor-wait'
                    : 'bg-forest-500 hover:bg-forest-600 active:scale-[0.98]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {exportSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    导出成功
                  </>
                ) : exporting ? (
                  <>
                    <Download className="w-5 h-5 animate-bounce" />
                    导出中...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    确认导出
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
