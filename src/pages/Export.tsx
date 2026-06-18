import { useState } from 'react';
import { Download, Calendar, FileText, CheckCircle, Clock } from 'lucide-react';
import { useAppStore } from '../store';
import { generateCSV, downloadCSV, getDefaultDateRange } from '../services/exportService';
import { cn } from '../lib/utils';
import AlertBanner from '../components/AlertBanner';

export default function Export() {
  const { measurements, device, settings } = useAppStore();
  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const filteredCount = measurements.filter(
    (m) => m.date >= dateRange.startDate && m.date <= dateRange.endDate
  ).length;

  const handleExport = () => {
    setIsExporting(true);
    
    setTimeout(() => {
      const content = generateCSV(
        measurements,
        device,
        settings,
        dateRange.startDate,
        dateRange.endDate
      );
      
      const filename = `血压记录_${dateRange.startDate}_${dateRange.endDate}.csv`;
      downloadCSV(content, filename);
      
      setIsExporting(false);
      setExportSuccess(true);
      
      setTimeout(() => setExportSuccess(false), 3000);
    }, 800);
  };

  const quickRanges = [
    { label: '近7天', days: 7 },
    { label: '近14天', days: 14 },
    { label: '近30天', days: 30 },
    { label: '近90天', days: 90 },
  ];

  const setQuickRange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">数据导出</h1>
        <p className="text-gray-500">导出血压记录，方便复诊时带给医生查看</p>
      </div>

      <AlertBanner />

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">导出 CSV 报告</h3>
            <p className="text-sm text-gray-500">CSV 格式可在 Excel 或 Numbers 中打开</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">快捷选择时间范围</label>
          <div className="grid grid-cols-4 gap-2">
            {quickRanges.map((range) => (
              <button
                key={range.days}
                onClick={() => setQuickRange(range.days)}
                className={cn(
                  'px-3 py-2 rounded-xl font-medium transition-all duration-200 text-sm',
                  dateRange.endDate === new Date().toISOString().split('T')[0] &&
                  new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime() === range.days * 24 * 60 * 60 * 1000
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              开始日期
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              结束日期
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
            />
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">符合条件的记录数</span>
            <span className="font-bold text-lg text-gray-900">{filteredCount} 条</span>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-xl mb-6">
          <h4 className="font-medium text-blue-800 mb-2">导出内容包括</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 设备信息（品牌、型号、校准日期等）</li>
            <li>• 测量记录（日期、时间、血压值、心率等）</li>
            <li>• 异常标记和备注</li>
            <li>• 统计摘要（平均值、最高/最低值等）</li>
          </ul>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting || filteredCount === 0}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200',
            isExporting || filteredCount === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : exportSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
          )}
        >
          {isExporting ? (
            <>
              <Clock className="w-5 h-5 animate-spin" />
              正在导出...
            </>
          ) : exportSuccess ? (
            <>
              <CheckCircle className="w-5 h-5" />
              导出成功！
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              导出 {filteredCount} 条记录
            </>
          )}
        </button>

        {filteredCount === 0 && (
          <p className="text-center text-sm text-gray-500 mt-3">
            所选时间范围内没有记录，请调整日期范围
          </p>
        )}
      </div>

      <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-3">💡 使用建议</h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>复诊前一天导出近一个月的记录，打印或存在手机里带给医生</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>导出的 CSV 文件可以直接用微信发送给医生</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>建议定期（每月）导出备份，避免数据丢失</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
