import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Download, Printer, CheckCircle, AlertTriangle,
  Car, Armchair, ShieldCheck, Calendar, FileText,
  Clock, AlertCircle, ChevronRight, ListTodo
} from 'lucide-react';
import { useVehicleStore } from '@/store/useVehicleStore';
import { useSeatStore } from '@/store/useSeatStore';
import { useInstallationStore } from '@/store/useInstallationStore';
import { useInspectionStore } from '@/store/useInspectionStore';
import { useTaskStore } from '@/store/useTaskStore';
import { INSPECTION_ITEMS, ORIENTATION_LABELS, Task, InspectionItemKey } from '@/types';
import { formatDate, formatDateTime } from '@/utils/date';

export default function QuickCheckCard() {
  const { id } = useParams<{ id: string }>();
  const { vehicles } = useVehicleStore();
  const { seats } = useSeatStore();
  const { installations } = useInstallationStore();
  const { inspections } = useInspectionStore();
  const { getTasksByInspectionId } = useTaskStore();
  
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

  const relatedTasks = inspection ? getTasksByInspectionId(inspection.id) : [];

  const getItemKeyMatchKeywords = (itemKey: InspectionItemKey): string[] => {
    const keywordMap: Record<InspectionItemKey, string[]> = {
      seatbeltLocked: ['安全带'],
      isofixLocked: ['ISOFIX', 'isofix'],
      supportLeg: ['支撑腿'],
      headrestHeight: ['头枕'],
      harnessPosition: ['肩带'],
      wobbleAmount: ['晃动', '摇晃', '稳固'],
    };
    return keywordMap[itemKey] || [];
  };

  const getTaskForItem = (itemKey: InspectionItemKey): Task | undefined => {
    let task = relatedTasks.find(t => t.itemKey === itemKey);
    if (task) return task;

    const keywords = getItemKeyMatchKeywords(itemKey);
    task = relatedTasks.find(t => {
      if (t.itemKey) return false;
      const text = `${t.title} ${t.description}`;
      return keywords.some(kw => text.includes(kw));
    });
    return task;
  };

  const getTaskStatusConfig = (task?: Task) => {
    if (!task) return null;
    const configs = {
      pending: { bg: 'bg-amber-500', label: '待处理', icon: Clock, text: 'text-amber-700', badgeBg: 'bg-amber-100' },
      in_progress: { bg: 'bg-blue-500', label: '进行中', icon: AlertCircle, text: 'text-blue-700', badgeBg: 'bg-blue-100' },
      completed: { bg: 'bg-emerald-500', label: '已完成', icon: CheckCircle, text: 'text-emerald-700', badgeBg: 'bg-emerald-100' },
    };
    return configs[task.status];
  };

  const tasksUrl = inspection ? `/tasks?inspectionId=${inspection.id}` : '/tasks';

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
║  安装朝向: ${ORIENTATION_LABELS[installation!.orientation].padEnd(50)}║
║  固定方式: ${installation!.installationMethod === 'seatbelt' ? '安全带' : 'ISOFIX'.padEnd(50)}║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  检查项目                                                    ║
║  ──────────────────────────────────────────────────────────  ║
${INSPECTION_ITEMS.map(item => {
  const checked = inspection![item.key].checked;
  const task = getTaskForItem(item.key);
  let statusStr = checked ? '通过' : '未通过';
  if (task && task.status === 'completed') statusStr = '已处理';
  return `║  ${checked ? '✓' : '✗'} ${item.label.padEnd(30)} ${statusStr.padEnd(10)}         ║`;
}).join('\n')}
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  检查结果: ${inspection.passed 
  ? '✅ 全部通过，可以安全出行' 
  : `⚠️  ${relatedTasks.filter(t => t.status === 'completed').length}/${relatedTasks.length}项任务已处理`.padEnd(30)}║
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
  const totalTasks = relatedTasks.length;
  const completedTasks = relatedTasks.filter(t => t.status === 'completed').length;
  const allTasksCompleted = totalTasks > 0 && completedTasks === totalTasks;

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

      {!inspection.passed && totalTasks > 0 && (
        <div className={`card p-4 no-print ${
          allTasksCompleted 
            ? 'bg-emerald-50 border border-emerald-200' 
            : 'bg-amber-50 border border-amber-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                allTasksCompleted ? 'bg-emerald-100' : 'bg-amber-100'
              }`}>
                <ListTodo className={`w-5 h-5 ${
                  allTasksCompleted ? 'text-emerald-600' : 'text-amber-600'
                }`} />
              </div>
              <div>
                <p className={`font-semibold ${
                  allTasksCompleted ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  任务处理进度：{completedTasks}/{totalTasks} 已完成
                </p>
                <p className={`text-sm ${
                  allTasksCompleted ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {allTasksCompleted 
                    ? '太棒了！所有待办任务已处理完成，可以重新进行检查确认'
                    : '点击下方异常项进入任务管理，处理完成后状态会实时更新'
                  }
                </p>
              </div>
            </div>
            <Link to={tasksUrl} className={`${
              allTasksCompleted ? 'btn-success' : 'btn-primary'
            } text-sm whitespace-nowrap`}>
              <ChevronRight className="w-4 h-4 mr-1" />
              任务管理
            </Link>
          </div>
        </div>
      )}

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
            : allTasksCompleted
              ? 'bg-blue-50 border border-blue-200'
              : 'bg-amber-50 border border-amber-200'
        }`}>
          {inspection.passed 
            ? <CheckCircle className="w-8 h-8 text-emerald-500 flex-shrink-0" />
            : allTasksCompleted
              ? <CheckCircle className="w-8 h-8 text-blue-500 flex-shrink-0" />
              : <AlertTriangle className="w-8 h-8 text-amber-500 flex-shrink-0" />
          }
          <div>
            <h3 className={`font-bold ${
              inspection.passed 
                ? 'text-emerald-700' 
                : allTasksCompleted
                  ? 'text-blue-700'
                  : 'text-amber-700'
            }`}>
              {inspection.passed 
                ? '✅ 全部通过，可以安全出行'
                : allTasksCompleted
                  ? '🔧 所有任务已处理，建议重新检查' 
                  : '⚠️ 需要调整，请完成相关任务'
              }
            </h3>
            <p className={`text-sm ${
              inspection.passed 
                ? 'text-emerald-600' 
                : allTasksCompleted
                  ? 'text-blue-600'
                  : 'text-amber-600'
            }`}>
              {passedCount}/{INSPECTION_ITEMS.length} 项检查通过
              {!inspection.passed && totalTasks > 0 && ` · ${completedTasks}/${totalTasks} 任务已处理`}
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">检查明细</h3>
            {!inspection.passed && (
              <span className="text-xs text-gray-400">
                点击异常项查看对应任务
              </span>
            )}
          </div>
          {INSPECTION_ITEMS.map(item => {
            const checked = inspection[item.key].checked;
            const task = getTaskForItem(item.key);
            const taskConfig = getTaskStatusConfig(task);
            const isClickable = !checked && task;

            return (
              <div 
                key={item.key}
                className={`relative flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                  checked 
                    ? 'bg-emerald-50' 
                    : task?.status === 'completed'
                      ? 'bg-emerald-50'
                      : 'bg-red-50'
                } ${
                  isClickable 
                    ? 'cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99]' 
                    : ''
                }`}
                onClick={() => isClickable && (window.location.href = tasksUrl)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    checked || task?.status === 'completed' 
                      ? 'bg-emerald-500' 
                      : 'bg-red-500'
                  }`}>
                    {checked || task?.status === 'completed'
                      ? <CheckCircle className="w-3 h-3 text-white" />
                      : <AlertTriangle className="w-3 h-3 text-white" />
                    }
                  </div>
                  <span className={`${
                    checked || task?.status === 'completed' 
                      ? 'text-emerald-700' 
                      : 'text-red-700'
                  }`}>
                    {item.label}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {task && taskConfig && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${taskConfig.badgeBg} ${taskConfig.text} no-print`}>
                      <taskConfig.icon className="w-3 h-3" />
                      {taskConfig.label}
                    </span>
                  )}
                  <span className={`text-sm font-medium ${
                    checked || task?.status === 'completed'
                      ? 'text-emerald-600' 
                      : 'text-red-600'
                  }`}>
                    {checked ? '通过' : task?.status === 'completed' ? '已处理' : '未通过'}
                  </span>
                  {isClickable && (
                    <ChevronRight className="w-4 h-4 text-gray-400 no-print" />
                  )}
                </div>
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
          <Link to={tasksUrl} className={`${
            allTasksCompleted ? 'btn-success' : 'btn-secondary'
          } flex-1`}>
            <ListTodo className="w-4 h-4 mr-2" />
            {allTasksCompleted 
              ? `${completedTasks}/${totalTasks} 已完成`
              : `待办任务 ${completedTasks}/${totalTasks}`
            }
          </Link>
        )}
      </div>
    </div>
  );
}
