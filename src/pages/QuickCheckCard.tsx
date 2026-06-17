import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Download, Printer, CheckCircle, AlertTriangle,
  Car, Armchair, ShieldCheck, Calendar, FileText
} from 'lucide-react';
import { useVehicleStore } from '@/store/useVehicleStore';
import { useSeatStore } from '@/store/useSeatStore';
import { useInstallationStore } from '@/store/useInstallationStore';
import { useInspectionStore } from '@/store/useInspectionStore';
import { INSPECTION_ITEMS, ORIENTATION_LABELS } from '@/types';
import { formatDate, formatDateTime } from '@/utils/date';

export default function QuickCheckCard() {
  const { id } = useParams<{ id: string }>();
  const { vehicles } = useVehicleStore();
  const { seats } = useSeatStore();
  const { installations } = useInstallationStore();
  const { inspections } = useInspectionStore();
  
  let inspection = id ? inspections.find(i => i.id === id) : undefined;
  
  if (!inspection && inspections.length > 0) {
    inspection = [...inspections].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  }

  const installation = inspection 
    ? installations.find(i => i.id === inspection.installationId)
    : undefined;
  
  const vehicle = installation 
    ? vehicles.find(v => v.id === installation.vehicleId)
    : undefined;
  
  const seat = installation 
    ? seats.find(s => s.id === installation.seatId)
    : undefined;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!inspection || !vehicle || !seat) return;

    const cardContent = `
╔══════════════════════════════════════════════════════════════╗
║                儿童安全座椅检查确认卡                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  检查日期: ${formatDateTime(inspection.date).padEnd(44)}║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  车辆信息                                                    ║
║  ──────────────────────────────────────────────────────────  ║
║  品牌型号: ${`${vehicle.brand} ${vehicle.model}`.padEnd(47)}║
║  车牌号: ${vehicle.plateNumber.padEnd(51)}║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  座椅信息                                                    ║
║  ──────────────────────────────────────────────────────────  ║
║  品牌型号: ${`${seat.brand} ${seat.model}`.padEnd(47)}║
║  适用体重: ${seat.weightRange.padEnd(50)}║
║  安装朝向: ${ORIENTATION_LABELS[installation.orientation].padEnd(50)}║
║  固定方式: ${installation.installationMethod === 'seatbelt' ? '安全带' : 'ISOFIX'.padEnd(50)}║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  检查项目                                                    ║
║  ──────────────────────────────────────────────────────────  ║
${INSPECTION_ITEMS.map(item => {
  const checked = inspection[item.key].checked;
  return `║  ${checked ? '✓' : '✗'} ${item.label.padEnd(30)} ${checked ? '通过' : '未通过'.padEnd(10)}         ║`;
}).join('\n')}
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  检查结果: ${inspection.passed ? '✅ 全部通过，可以安全出行' : '⚠️  需要调整，请完成相关任务'.padEnd(30)}║
║                                                              ║
║  检查员签字: ______________    日期: ______________         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `.trim();

    const blob = new Blob([cardContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `安全座椅检查卡_${formatDate(inspection.date)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!inspection || !vehicle || !seat || !installation) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-secondary-500">快速检查卡</h1>
            <p className="text-gray-500 mt-1">
              没有找到检查记录
            </p>
          </div>
        </div>
        <div className="card p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无检查记录</h3>
          <p className="text-gray-500 mb-4">请先完成一次安装检查</p>
          <Link to="/inspection" className="btn-primary">
            开始检查
          </Link>
        </div>
      </div>
    );
  }

  const passedCount = INSPECTION_ITEMS.filter(item => inspection[item.key].checked).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors no-print">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-secondary-500">快速检查卡</h1>
            <p className="text-gray-500 mt-1">
              出行前安全确认
            </p>
          </div>
        </div>
        <div className="flex gap-2 no-print">
          <button onClick={handleDownload} className="btn-outline">
            <Download className="w-4 h-4 mr-2" />
            下载
          </button>
          <button onClick={handlePrint} className="btn-secondary">
            <Printer className="w-4 h-4 mr-2" />
            打印
          </button>
        </div>
      </div>

      <div className="card p-8 bg-gradient-to-br from-white to-gray-50 border-2 border-primary-200 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-secondary-500 font-display">
            儿童安全座椅检查确认卡
          </h2>
          <p className="text-gray-500 mt-2">
            {formatDateTime(inspection.date)}
          </p>
        </div>

        <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
          inspection.passed 
            ? 'bg-emerald-50 border border-emerald-200' 
            : 'bg-amber-50 border border-amber-200'
        }`}>
          {inspection.passed 
            ? <CheckCircle className="w-8 h-8 text-emerald-500 flex-shrink-0" />
            : <AlertTriangle className="w-8 h-8 text-amber-500 flex-shrink-0" />
          }
          <div>
            <h3 className={`font-bold ${inspection.passed ? 'text-emerald-700' : 'text-amber-700'}`}>
              {inspection.passed 
                ? '✅ 全部通过，可以安全出行' 
                : '⚠️ 需要调整，请完成相关任务'}
            </h3>
            <p className={`text-sm ${inspection.passed ? 'text-emerald-600' : 'text-amber-600'}`}>
              {passedCount}/{INSPECTION_ITEMS.length} 项检查通过
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Car className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium text-gray-500">车辆信息</span>
            </div>
            <p className="font-semibold text-gray-900">{vehicle.brand} {vehicle.model}</p>
            <p className="text-sm text-gray-500">{vehicle.plateNumber}</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Armchair className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium text-gray-500">座椅信息</span>
            </div>
            <p className="font-semibold text-gray-900">{seat.brand} {seat.model}</p>
            <p className="text-sm text-gray-500">{seat.weightRange}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-gray-500">安装配置</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">安装朝向：</span>
              <span className="font-medium text-gray-900">
                {ORIENTATION_LABELS[installation.orientation]}
              </span>
            </div>
            <div>
              <span className="text-gray-500">固定方式：</span>
              <span className="font-medium text-gray-900">
                {installation.installationMethod === 'seatbelt' ? '安全带' : 'ISOFIX'}
              </span>
            </div>
            {inspection.manualPage && (
              <div className="col-span-2">
                <span className="text-gray-500">说明书参考页码：</span>
                <span className="font-medium text-gray-900">第 {inspection.manualPage} 页</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500 mb-3">检查明细</h3>
          {INSPECTION_ITEMS.map(item => {
            const checked = inspection[item.key].checked;
            return (
              <div 
                key={item.key}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  checked ? 'bg-emerald-50' : 'bg-red-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    checked ? 'bg-emerald-500' : 'bg-red-500'
                  }`}>
                    {checked 
                      ? <CheckCircle className="w-3 h-3 text-white" />
                      : <AlertTriangle className="w-3 h-3 text-white" />
                    }
                  </div>
                  <span className={checked ? 'text-emerald-700' : 'text-red-700'}>
                    {item.label}
                  </span>
                </div>
                <span className={`text-sm font-medium ${
                  checked ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {checked ? '通过' : '未通过'}
                </span>
              </div>
            );
          })}
        </div>

        {inspection.notes && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="text-sm font-medium text-gray-500 mb-2">检查备注</h3>
            <p className="text-gray-700">{inspection.notes}</p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-400">
            本检查卡由「安全座椅管家」生成
          </p>
        </div>
      </div>

      <div className="flex gap-3 no-print">
        <Link to="/inspection" className="btn-outline flex-1">
          重新检查
        </Link>
        {!inspection.passed && (
          <Link to="/tasks" className="btn-secondary flex-1">
            查看待办任务
          </Link>
        )}
      </div>
    </div>
  );
}
