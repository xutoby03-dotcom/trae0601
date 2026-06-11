import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  AlertTriangle,
  Package,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Image,
  FileText,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { formatDateDisplay, statusLabel, statusColor } from '@/utils';

export default function Review() {
  const { id } = useParams<{ id: string }>();
  const { getTaskById, getPetById, getTaskStatus, generateReviewReport } = useAppStore();

  const task = id ? getTaskById(id) : undefined;
  const pet = task ? getPetById(task.petId) : undefined;
  const status = task ? getTaskStatus(task) : 'pending';
  const report = id ? generateReviewReport(id) : null;

  if (!task || !report) {
    return (
      <div className="card text-center py-16">
        <div className="text-6xl mb-4">😢</div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">找不到任务或无法生成回顾</h3>
        <Link to="/tasks" className="btn-secondary">返回任务列表</Link>
      </div>
    );
  }

  const completionRate =
    report.totalDays > 0
      ? Math.round((report.completedCheckins / report.totalDays) * 100)
      : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/tasks/${task.id}`} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-brand-500" size={28} />
            交接回顾报告
          </h1>
          <p className="text-slate-500 mt-0.5">
            {task.title} · {pet?.name || '宠物'}
          </p>
        </div>
        <span className={`tag ${statusColor[status]} text-base`}>
          {statusLabel[status]}
        </span>
      </div>

      <div className="card bg-gradient-to-br from-brand-500 to-brand-600 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold">{report.totalDays}</div>
            <div className="text-white/80 text-sm mt-1">寄养天数</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{report.completedCheckins}</div>
            <div className="text-white/80 text-sm mt-1">打卡天数</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{completionRate}%</div>
            <div className="text-white/80 text-sm mt-1">完成率</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">
              {report.checkinPhotos.length}
            </div>
            <div className="text-white/80 text-sm mt-1">照片记录</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-brand-500" />
            寄养时间
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
              <span className="text-slate-600">开始日期</span>
              <span className="font-semibold text-emerald-700">
                {formatDateDisplay(task.startDate)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-600">结束日期</span>
              <span className="font-semibold text-slate-700">
                {formatDateDisplay(task.endDate)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-brand-50 rounded-xl">
              <span className="text-slate-600">实际打卡</span>
              <span className="font-semibold text-brand-700">
                {report.completedCheckins} / {report.totalDays} 天
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Package size={20} className="text-brand-500" />
            粮食物资
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">初始量</span>
              <span className="font-semibold text-slate-800">
                {report.initialFoodAmount} {task.foodUnit || '份'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1">
                <TrendingDown size={16} className="text-amber-500" />
                已消耗
              </span>
              <span className="font-semibold text-amber-600">
                {report.consumedFoodAmount.toFixed(1)} {task.foodUnit || '份'}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    report.initialFoodAmount > 0
                      ? (report.consumedFoodAmount / report.initialFoodAmount) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
              <span className="text-emerald-700">剩余量</span>
              <span className="font-bold text-emerald-700 text-lg">
                {report.remainingFoodAmount.toFixed(1)} {task.foodUnit || '份'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className={`card ${
            report.missedFeedings > 0 || report.missedMedications > 0
              ? 'border-2 border-red-200'
              : ''
          }`}
        >
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle2
              size={20}
              className={
                report.missedFeedings === 0 && report.missedMedications === 0
                  ? 'text-emerald-500'
                  : 'text-red-500'
              }
            />
            任务完成情况
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="flex items-center gap-2">
                <span className="text-xl">🍚</span>
                <span className="text-slate-700">漏喂次数</span>
              </span>
              <span
                className={`font-bold ${
                  report.missedFeedings > 0 ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                {report.missedFeedings > 0 ? `${report.missedFeedings} 次` : '无'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="flex items-center gap-2">
                <span className="text-xl">💊</span>
                <span className="text-slate-700">漏药次数</span>
              </span>
              <span
                className={`font-bold ${
                  report.missedMedications > 0 ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                {report.missedMedications > 0 ? `${report.missedMedications} 次` : '无'}
              </span>
            </div>
          </div>

          {report.missedFeedings === 0 && report.missedMedications === 0 && (
            <div className="mt-4 p-4 bg-emerald-50 rounded-xl text-center">
              <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-emerald-700">太棒了！所有任务都按时完成</p>
            </div>
          )}
        </div>

        <div
          className={`card ${
            report.anomalyRecords.length > 0 ? 'border-2 border-red-200 bg-red-50/30' : ''
          }`}
        >
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle
              size={20}
              className={report.anomalyRecords.length > 0 ? 'text-red-500' : 'text-emerald-500'}
            />
            异常记录
            {report.anomalyRecords.length > 0 && (
              <span className="tag bg-red-100 text-red-700">
                {report.anomalyRecords.length} 条
              </span>
            )}
          </h2>

          {report.anomalyRecords.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-emerald-700">寄养期间一切正常</p>
              <p className="text-sm text-slate-500 mt-1">没有异常情况发生</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {report.anomalyRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-3 bg-red-50 rounded-xl border border-red-100"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle size={16} className="text-red-500" />
                    <span className="font-semibold text-red-800 text-sm">
                      {formatDateDisplay(record.checkinDate)}
                    </span>
                  </div>
                  <p className="text-red-700 text-sm">
                    {record.anomalyDescription || '未描述具体异常'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {report.suppliesToBuy.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ShoppingCart size={20} className="text-amber-500" />
            建议补充清单
          </h2>
          <div className="space-y-2">
            {report.suppliesToBuy.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100"
              >
                <ShoppingCart size={18} className="text-amber-600 flex-shrink-0" />
                <span className="text-amber-800">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {report.checkinPhotos.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Image size={20} className="text-brand-500" />
            打卡照片墙
            <span className="tag bg-slate-100 text-slate-600 ml-2">
              共 {report.checkinPhotos.length} 张
            </span>
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {report.checkinPhotos.map((photo) => (
              <div
                key={photo.id}
                className="aspect-square rounded-xl overflow-hidden border border-slate-200"
              >
                <img
                  src={photo.photoUrl}
                  alt={photo.caption || '打卡照片'}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-center pt-4">
        <Link to="/tasks" className="btn-secondary">
          返回任务列表
        </Link>
        <Link to={`/tasks/${task.id}`} className="btn-primary">
          查看任务详情
        </Link>
      </div>
    </div>
  );
}
