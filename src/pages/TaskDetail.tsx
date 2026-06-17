import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePetStore } from '../store/usePetStore';
import CheckListItem from '../components/CheckListItem';
import { AbnormalityBadge, AddAbnormalityModal } from '../components/AbnormalityBadge';
import { ArrowLeft, MapPin, Key, Clock, AlertTriangle, CheckCircle2, FileText, RefreshCw } from 'lucide-react';
import { formatDate, getStatusLabel, getStatusColor, cn } from '../utils/helpers';
import type { AbnormalityType } from '../types';
import { abnormalityLabels } from '../types';

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getTaskById,
    getCheckItemsByTaskId,
    completeCheckItem,
    getAbnormalitiesByTaskId,
    addAbnormality,
    updateTaskStatus,
    resetTask,
    getReportByTaskId,
    pet,
  } = usePetStore();

  const [showAbnormalityModal, setShowAbnormalityModal] = useState(false);
  const [showGenerateReport, setShowGenerateReport] = useState(false);

  const task = id ? getTaskById(id) : undefined;
  const checkItems = id ? getCheckItemsByTaskId(id) : [];
  const abnormalities = id ? getAbnormalitiesByTaskId(id) : [];
  const existingReport = id ? getReportByTaskId(id) : undefined;

  const progress = useMemo(() => {
    if (checkItems.length === 0) return 0;
    const completed = checkItems.filter((item) => item.completed).length;
    return Math.round((completed / checkItems.length) * 100);
  }, [checkItems]);

  const allCompleted = checkItems.length > 0 && checkItems.every((item) => item.completed);

  const handleCompleteItem = (itemId: string, photo?: string, note?: string) => {
    if (!id) return;
    completeCheckItem(id, itemId, photo, note);
  };

  const handleAddAbnormality = (type: AbnormalityType, description: string, photo?: string) => {
    if (!id) return;
    addAbnormality(id, type, description, photo);
  };

  const handleStartTask = () => {
    if (!id) return;
    updateTaskStatus(id, 'in-progress');
  };

  const handleReset = () => {
    if (!id) return;
    if (confirm('确定要重置这个任务吗？所有打卡记录和异常记录将被清除。')) {
      resetTask(id);
    }
  };

  if (!task) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl text-gray-600 mb-4">任务不存在</h2>
        <Link to="/tasks" className="text-[#FF8A3D] hover:underline">
          返回任务列表
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 animate-fadeIn">
        <button
          onClick={() => navigate('/tasks')}
          className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#2D2A26]" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            {formatDate(task.date)} 代喂任务
          </h1>
          <p className="text-sm text-gray-500">{pet.name} · {task.time}</p>
        </div>
        <span className={cn(
          'px-3 py-1.5 rounded-full text-xs font-medium',
          getStatusColor(task.status)
        )}>
          {getStatusLabel(task.status)}
        </span>
      </div>

      {task.status === 'pending' && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-lg shadow-orange-200 animate-slideUp">
          <h2 className="text-xl font-bold mb-2">准备开始代喂？</h2>
          <p className="text-white/90 text-sm mb-4">
            点击下方按钮开始任务，系统将记录你的操作时间
          </p>
          <button
            onClick={handleStartTask}
            className="w-full py-3 bg-white text-[#FF8A3D] rounded-xl font-bold hover:bg-orange-50 transition-colors"
          >
            开始任务
          </button>
        </div>
      )}

      {task.status !== 'pending' && (
        <>
          <div className="bg-white rounded-2xl p-5 shadow-lg shadow-orange-100/50 animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#2D2A26] flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[#FF8A3D]" />
                任务进度
              </h3>
              <span className="text-sm font-medium text-gray-500">
                {checkItems.filter(i => i.completed).length}/{checkItems.length} 项完成
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF8A3D] to-[#FFB380] rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2 text-right">{progress}% 完成</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slideUp" style={{ animationDelay: '100ms' }}>
            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <MapPin size={20} className="text-[#FF8A3D]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">门禁方式</p>
                  <p className="font-medium text-[#2D2A26]">{task.accessMethod}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                  <Key size={20} className="text-[#4ECDC4]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">钥匙位置</p>
                  <p className="font-medium text-[#2D2A26] text-sm">{task.keyLocation}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100 animate-slideUp" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-3 mb-2">
              <Clock size={18} className="text-[#FF8A3D]" />
              <h3 className="font-bold text-[#2D2A26]">任务要求</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600 ml-7">
              <li>• 喂食 <span className="font-medium text-[#FF8A3D]">{task.foodGrams}g</span> 猫粮</li>
              <li>• 用药：{task.medication}</li>
              <li>• 陪玩：{task.playRequirements}</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg shadow-orange-100/50 animate-slideUp" style={{ animationDelay: '300ms' }}>
            <h3 className="font-bold text-[#2D2A26] mb-4 flex items-center gap-2">
              <span className="text-xl">📝</span>
              打卡清单
            </h3>
            <div className="space-y-3">
              {checkItems.map((item, index) => (
                <div key={item.id} style={{ animationDelay: `${index * 100 + 400}ms` }} className="animate-slideUp">
                  <CheckListItem
                    item={item}
                    onComplete={handleCompleteItem}
                    disabled={task.status === 'completed'}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="animate-slideUp" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#2D2A26] flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-500" />
                异常记录
                {abnormalities.length > 0 && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                    {abnormalities.length} 项
                  </span>
                )}
              </h3>
              {task.status !== 'completed' && (
                <button
                  onClick={() => setShowAbnormalityModal(true)}
                  className="px-4 py-2 bg-red-50 text-red-500 rounded-full text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-1"
                >
                  <AlertTriangle size={14} />
                  标记异常
                </button>
              )}
            </div>

            {abnormalities.length > 0 ? (
              <div className="space-y-3">
                {abnormalities.map((abnormality, index) => (
                  <div key={abnormality.id} style={{ animationDelay: `${index * 100 + 600}ms` }} className="animate-slideUp">
                    <AbnormalityBadge abnormality={abnormality} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <p className="text-gray-400 text-sm">暂无异常记录，{pet.name}状态良好 ✨</p>
              </div>
            )}
          </div>

          {allCompleted && !existingReport && (
            <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg shadow-green-200 animate-slideUp" style={{ animationDelay: '700ms' }}>
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <CheckCircle2 size={24} />
                太棒了！所有打卡已完成
              </h2>
              <p className="text-white/90 text-sm mb-4">
                确认无误后，生成日报发送给主人
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} />
                  重置任务
                </button>
                <button
                  onClick={() => setShowGenerateReport(true)}
                  className="flex-1 py-3 bg-white text-green-600 rounded-xl font-bold hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                >
                  <FileText size={16} />
                  生成日报
                </button>
              </div>
            </div>
          )}

          {task.status === 'completed' && existingReport && (
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg shadow-teal-200 animate-slideUp">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <CheckCircle2 size={24} />
                任务已完成
              </h2>
              <p className="text-white/90 text-sm mb-4">
                本次代喂任务已完成，日报已生成
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} />
                  重新开始
                </button>
                <Link
                  to={`/report/${task.id}`}
                  className="flex-1 py-3 bg-white text-teal-600 rounded-xl font-bold hover:bg-teal-50 transition-colors flex items-center justify-center gap-2"
                >
                  <FileText size={16} />
                  查看日报
                </Link>
              </div>
            </div>
          )}
        </>
      )}

      <AddAbnormalityModal
        isOpen={showAbnormalityModal}
        onClose={() => setShowAbnormalityModal(false)}
        onAdd={handleAddAbnormality}
      />

      {showGenerateReport && id && (
        <GenerateReportModal
          taskId={id}
          onClose={() => setShowGenerateReport(false)}
          onGenerated={() => {
            setShowGenerateReport(false);
            navigate(`/report/${id}`);
          }}
        />
      )}
    </div>
  );
}

function GenerateReportModal({
  taskId,
  onClose,
  onGenerated,
}: {
  taskId: string;
  onClose: () => void;
  onGenerated: () => void;
}) {
  const { generateReport, getAbnormalitiesByTaskId } = usePetStore();
  const abnormalities = getAbnormalitiesByTaskId(taskId);

  const defaultAbnormalitySummary = abnormalities.length > 0
    ? abnormalities.map((a) => `⚠ ${abnormalityLabels[a.type]}：${a.description}`).join('\n')
    : '';

  const [remainingFood, setRemainingFood] = useState(85);
  const [remainingLitter, setRemainingLitter] = useState(70);
  const [remainingMedicine, setRemainingMedicine] = useState(60);
  const [nextReminder, setNextReminder] = useState('明天上午9点上门');
  const [abnormalitySummary, setAbnormalitySummary] = useState(defaultAbnormalitySummary);
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      generateReport(
        taskId,
        remainingFood,
        remainingLitter,
        remainingMedicine,
        nextReminder,
        abnormalitySummary,
        summary || '本次代喂一切正常，宠物状态良好。'
      );
      setIsGenerating(false);
      onGenerated();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 animate-slideUp max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[#2D2A26] flex items-center gap-2">
            <FileText size={24} className="text-[#FF8A3D]" />
            生成日报
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              剩余猫粮 (%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={remainingFood}
              onChange={(e) => setRemainingFood(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="text-right text-sm text-gray-500 mt-1">{remainingFood}%</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              剩余猫砂 (%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={remainingLitter}
              onChange={(e) => setRemainingLitter(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
            <div className="text-right text-sm text-gray-500 mt-1">{remainingLitter}%</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              剩余药量 (%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={remainingMedicine}
              onChange={(e) => setRemainingMedicine(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
            <div className="text-right text-sm text-gray-500 mt-1">{remainingMedicine}%</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              下次上门提醒
            </label>
            <input
              type="text"
              value={nextReminder}
              onChange={(e) => setNextReminder(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF8A3D] focus:ring-2 focus:ring-orange-100"
              placeholder="下次上门时间和注意事项"
            />
          </div>

          {abnormalities.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <label className="block text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
                <AlertTriangle size={14} />
                异常提醒（将醒目展示给主人）
              </label>
              <textarea
                value={abnormalitySummary}
                onChange={(e) => setAbnormalitySummary(e.target.value)}
                className="w-full h-28 px-4 py-3 border border-red-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none text-sm bg-white text-red-800"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              总结说明
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="今天的代喂情况总结..."
              className="w-full h-28 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF8A3D] focus:ring-2 focus:ring-orange-100 resize-none text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={cn(
                'flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2',
                isGenerating
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#FF8A3D] to-[#FFB380] text-white shadow-lg shadow-orange-200 hover:shadow-xl'
              )}
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  生成中...
                </>
              ) : (
                '生成日报'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
