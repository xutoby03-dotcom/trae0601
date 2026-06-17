import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePetStore } from '../store/usePetStore';
import StatCard from '../components/StatCard';
import { AbnormalityBadge } from '../components/AbnormalityBadge';
import { ArrowLeft, FileText, Clock, Bell, CheckCircle2, AlertTriangle, Share2, Download, Calendar } from 'lucide-react';
import { formatDate, formatTime, formatDateTime, cn } from '../utils/helpers';

export default function Report() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getTaskById,
    getCheckItemsByTaskId,
    getAbnormalitiesByTaskId,
    getReportByTaskId,
    pet,
  } = usePetStore();

  const task = id ? getTaskById(id) : undefined;
  const checkItems = id ? getCheckItemsByTaskId(id) : [];
  const abnormalities = id ? getAbnormalitiesByTaskId(id) : [];
  const report = id ? getReportByTaskId(id) : undefined;

  const timelineEvents = useMemo(() => {
    const events: Array<{
      time: string;
      title: string;
      description: string;
      type: 'check' | 'abnormality' | 'complete';
      photo?: string;
    }> = [];

    checkItems
      .filter((item) => item.completed && item.completedAt)
      .forEach((item) => {
        events.push({
          time: item.completedAt!,
          title: item.label,
          description: item.note || '已完成',
          type: 'check',
          photo: item.photo,
        });
      });

    abnormalities.forEach((abn) => {
      events.push({
        time: abn.reportedAt,
        title: `异常：${abn.type}`,
        description: abn.description,
        type: 'abnormality',
        photo: abn.photo,
      });
    });

    if (report) {
      events.push({
        time: report.createdAt,
        title: '日报生成',
        description: report.summary,
        type: 'complete',
      });
    }

    return events.sort((a, b) => a.time.localeCompare(b.time));
  }, [checkItems, abnormalities, report]);

  if (!task || !report) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl text-gray-600 mb-4">报告不存在</h2>
        <Link to="/tasks" className="text-[#FF8A3D] hover:underline">
          返回任务列表
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${pet.name}的代喂日报 - ${formatDate(task.date)}`,
        text: report.summary,
      });
    } else {
      alert('分享功能已触发（演示模式）');
    }
  };

  const handleDownload = () => {
    const abnormalitySection = report.abnormalitySummary
      ? `\n⚠️ 异常提醒（请重点关注）\n${report.abnormalitySummary}\n`
      : '';

    const content = `
${pet.name}的代喂日报
====================
日期：${formatDate(task.date)}
时间：${task.time}
${abnormalitySection}
一、物资剩余
- 猫粮：${report.remainingFood}%
- 猫砂：${report.remainingLitter}%
- 药量：${report.remainingMedicine}%

二、打卡记录
${checkItems.map((item) => `[${item.completed ? '✓' : '✗'}] ${item.label}${item.note ? ` - ${item.note}` : ''}`).join('\n')}

${abnormalities.length > 0 ? `三、异常记录\n${abnormalities.map((a) => `⚠ ${a.type}: ${a.description}`).join('\n')}` : ''}

四、总结
${report.summary}

五、下次提醒
${report.nextReminder}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pet.name}_代喂日报_${task.date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
            代喂日报 📄
          </h1>
          <p className="text-sm text-gray-500">{formatDate(task.date)} · {pet.name}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="下载"
          >
            <Download size={18} className="text-gray-600" />
          </button>
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="分享"
          >
            <Share2 size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-lg shadow-orange-200 animate-slideUp">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <FileText size={32} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1">{formatDate(task.date)} 代喂完成</h2>
            <p className="text-white/90 text-sm">
              {task.time} · 共完成 {checkItems.filter(i => i.completed).length} 项任务
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <img
                  src={pet.photos[0]}
                  alt={pet.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <span className="text-sm font-medium">{pet.name} · {pet.breed}</span>
            </div>
          </div>
        </div>
      </div>

      {report.abnormalitySummary && (
        <div className="bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl p-5 text-white shadow-lg shadow-red-200 animate-slideUp border-2 border-red-300" style={{ animationDelay: '50ms' }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={22} className="animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                ⚠️ 异常提醒
              </h3>
              <div className="text-white/95 text-sm whitespace-pre-line leading-relaxed">
                {report.abnormalitySummary}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="animate-slideUp" style={{ animationDelay: '100ms' }}>
        <h3 className="text-lg font-bold text-[#2D2A26] mb-4 flex items-center gap-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>
          <span className="text-xl">📦</span>
          物资剩余
        </h3>
        <StatCard report={report} />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg shadow-orange-100/50 animate-slideUp" style={{ animationDelay: '200ms' }}>
        <h3 className="text-lg font-bold text-[#2D2A26] mb-4 flex items-center gap-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>
          <CheckCircle2 size={20} className="text-green-500" />
          打卡清单
        </h3>
        <div className="space-y-3">
          {checkItems.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl transition-all',
                item.completed ? 'bg-green-50' : 'bg-gray-50'
              )}
              style={{ animationDelay: `${index * 50 + 250}ms` }}
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                item.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
              )}>
                <CheckCircle2 size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'font-medium text-sm',
                  item.completed ? 'text-green-700' : 'text-gray-500'
                )}>
                  {item.label}
                </p>
                {item.note && (
                  <p className="text-xs text-gray-500 mt-0.5">💬 {item.note}</p>
                )}
                {item.completedAt && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatTime(item.completedAt)} 完成
                  </p>
                )}
              </div>
              {item.photo && (
                <div className="w-12 h-12 rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                  <img src={item.photo} alt="打卡" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {abnormalities.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-red-100/50 border-2 border-red-100 animate-slideUp" style={{ animationDelay: '300ms' }}>
          <h3 className="text-lg font-bold text-[#2D2A26] mb-4 flex items-center gap-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            <AlertTriangle size={20} className="text-red-500" />
            异常记录
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
              {abnormalities.length} 项
            </span>
          </h3>
          <div className="space-y-3">
            {abnormalities.map((abnormality, index) => (
              <div key={abnormality.id} style={{ animationDelay: `${index * 100 + 350}ms` }} className="animate-slideUp">
                <AbnormalityBadge abnormality={abnormality} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-lg shadow-orange-100/50 animate-slideUp" style={{ animationDelay: '400ms' }}>
        <h3 className="text-lg font-bold text-[#2D2A26] mb-4 flex items-center gap-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>
          <Clock size={20} className="text-[#FF8A3D]" />
          时间线
        </h3>
        <div className="relative pl-8">
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#FF8A3D] via-[#4ECDC4] to-green-500" />
          {timelineEvents.map((event, index) => (
            <div
              key={index}
              className="relative pb-6 last:pb-0 animate-slideUp"
              style={{ animationDelay: `${index * 100 + 450}ms` }}
            >
              <div className={cn(
                'absolute -left-5 w-4 h-4 rounded-full border-2 border-white shadow-md',
                event.type === 'check' && 'bg-green-500',
                event.type === 'abnormality' && 'bg-red-500',
                event.type === 'complete' && 'bg-[#FF8A3D]'
              )} />
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-[#2D2A26] text-sm">{event.title}</span>
                  <span className="text-xs text-gray-400">{formatTime(event.time)}</span>
                </div>
                <p className="text-sm text-gray-600">{event.description}</p>
                {event.photo && (
                  <img
                    src={event.photo}
                    alt="记录照片"
                    className="mt-2 w-20 h-20 object-cover rounded-lg"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-lg shadow-orange-200 animate-slideUp" style={{ animationDelay: '500ms' }}>
        <div className="flex items-start gap-3 mb-3">
          <Bell size={24} className="flex-shrink-0" />
          <div>
            <h3 className="font-bold text-lg mb-1" style={{ fontFamily: "'Noto Serif SC', serif" }}>
              下次上门提醒
            </h3>
            <p className="text-white/90 text-sm">{report.nextReminder}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="opacity-80" />
            <span className="text-sm opacity-80">日报生成时间</span>
          </div>
          <p className="font-medium">{formatDateTime(report.createdAt)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg shadow-orange-100/50 animate-slideUp" style={{ animationDelay: '600ms' }}>
        <h3 className="text-lg font-bold text-[#2D2A26] mb-3 flex items-center gap-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>
          <span className="text-xl">💭</span>
          总结说明
        </h3>
        <p className="text-gray-600 leading-relaxed">{report.summary}</p>
      </div>

      <div className="flex gap-3 pt-4">
        <Link
          to="/tasks"
          className="flex-1 py-4 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-center"
        >
          返回任务列表
        </Link>
        <Link
          to="/"
          className="flex-1 py-4 rounded-xl bg-gradient-to-r from-[#FF8A3D] to-[#FFB380] text-white font-bold shadow-lg shadow-orange-200 hover:shadow-xl transition-all text-center"
        >
          查看{pet.name}资料
        </Link>
      </div>
    </div>
  );
}
