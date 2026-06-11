import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Snowflake, Wine, AlertTriangle, User, FileText } from 'lucide-react';
import { usePackageStore } from '@/store/usePackageStore';
import { STATUS_LABELS } from '@/types';

export default function Resolve() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pkg = usePackageStore((s) => s.packages.find((p) => p.id === id));
  const resolveAbnormal = usePackageStore((s) => s.resolveAbnormal);

  const [resolvedBy, setResolvedBy] = useState('');
  const [resolvedNote, setResolvedNote] = useState('');
  const [targetStatus, setTargetStatus] = useState<'pending' | 'resolved'>('pending');
  const [showError, setShowError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ by: string; note: string; target: 'pending' | 'resolved' } | null>(null);

  if (!pkg) {
    return (
      <div className="p-6 max-w-md mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-full bg-warm-200 flex items-center justify-center mx-auto mb-4">
          <X className="w-6 h-6 text-warm-400" />
        </div>
        <p className="text-warm-500 text-sm mb-4">未找到该包裹</p>
        <Link to="/" className="text-sm text-primary-500 hover:underline">返回首页</Link>
      </div>
    );
  }

  if (success && successInfo) {
    return (
      <div className="p-6 max-w-md mx-auto text-center py-20">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5 animate-check-pop">
          <Check className="w-9 h-9 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-primary-800 mb-2">处理完成！</h3>
        <p className="text-warm-500 text-sm mb-1">
          {successInfo.by} 已将包裹标记为「{STATUS_LABELS[successInfo.target]}」
        </p>
        {successInfo.note && (
          <p className="text-warm-400 text-xs mb-6">备注：{successInfo.note}</p>
        )}
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors"
        >
          返回首页
        </button>
      </div>
    );
  }

  if (pkg.status !== 'abnormal') {
    return (
      <div className="p-6 max-w-md mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-full bg-warm-200 flex items-center justify-center mx-auto mb-4">
          <X className="w-6 h-6 text-warm-400" />
        </div>
        <h3 className="text-lg font-bold text-primary-800 mb-1">该包裹不是异常状态</h3>
        <p className="text-warm-500 text-sm mb-4">当前状态：{STATUS_LABELS[pkg.status]}</p>
        <Link to="/" className="text-sm text-primary-500 hover:underline">返回首页</Link>
      </div>
    );
  }

  const isOverdue = () => {
    const hours = (Date.now() - new Date(pkg.createdAt).getTime()) / 3600000;
    return pkg.isColdChain ? hours > 4 : hours > 48;
  };

  const handleSubmit = () => {
    if (!resolvedBy.trim()) {
      setShowError(true);
      return;
    }
    const by = resolvedBy.trim();
    const note = resolvedNote.trim();
    resolveAbnormal(pkg.id, by, note, targetStatus);
    setSuccessInfo({ by, note, target: targetStatus });
    setSuccess(true);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="w-8 h-8 rounded-lg bg-white border border-warm-300/60 flex items-center justify-center hover:bg-warm-50 transition-colors">
          <ArrowLeft className="w-4 h-4 text-warm-500" />
        </Link>
        <h2 className="text-xl font-bold text-primary-800">异常处理</h2>
      </div>

      <div className="bg-white rounded-xl border border-coral-300 p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="font-semibold text-primary-800">{pkg.recipientName}</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 font-medium">
            {pkg.department}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-coral-100 text-coral-700 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            异常
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-warm-500">快递公司</span>
            <span className="text-primary-800 font-medium">{pkg.courierCompany}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-warm-500">取件码</span>
            <span className="font-mono font-semibold text-primary-700">{pkg.pickupCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-warm-500">货架位置</span>
            <span className="text-primary-800 font-medium">{pkg.shelfLocation}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          {pkg.isColdChain && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-ice-50 text-ice-700 font-medium flex items-center gap-1">
              <Snowflake className="w-3 h-3" />
              冷藏件
            </span>
          )}
          {pkg.isFragile && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 font-medium flex items-center gap-1">
              <Wine className="w-3 h-3" />
              易碎
            </span>
          )}
        </div>

        <div className="mt-3 bg-coral-50 rounded-lg px-3 py-2 text-xs text-coral-700">
          {isOverdue()
            ? pkg.isColdChain
              ? '冷藏件超时未取（超过4小时）'
              : '普通件超时未取（超过48小时）'
            : '异常包裹'}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-warm-300/50 p-5 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-primary-700 mb-1">处理人 *</label>
          <p className="text-xs text-warm-500 mb-3">填写负责处理该异常的人员姓名</p>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
            <input
              type="text"
              value={resolvedBy}
              onChange={(e) => { setResolvedBy(e.target.value); setShowError(false); }}
              placeholder="输入处理人姓名"
              className={`w-full pl-9 pr-3 py-2.5 bg-warm-50 border rounded-lg text-sm placeholder:text-warm-400 transition-colors ${
                showError
                  ? 'border-coral-400 focus:border-coral-400'
                  : 'border-warm-300/60 focus:border-primary-400'
              }`}
            />
          </div>
          {showError && (
            <p className="text-coral-600 text-xs mt-1.5">请填写处理人姓名</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary-700 mb-1">处理备注</label>
          <p className="text-xs text-warm-500 mb-3">记录异常原因或处理方式</p>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-warm-400" />
            <textarea
              value={resolvedNote}
              onChange={(e) => setResolvedNote(e.target.value)}
              placeholder="如：已联系收件人，确认明天取件..."
              rows={3}
              className="w-full pl-9 pr-3 py-2.5 bg-warm-50 border border-warm-300/60 rounded-lg text-sm placeholder:text-warm-400 focus:border-primary-400 transition-colors resize-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary-700 mb-3">处理方式 *</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTargetStatus('pending')}
              className={`flex flex-col items-center gap-1.5 px-4 py-3.5 rounded-xl border-2 transition-all ${
                targetStatus === 'pending'
                  ? 'border-amber-300 bg-amber-50'
                  : 'border-warm-300/60 bg-warm-50 hover:border-amber-200'
              }`}
            >
              <span className={`text-sm font-semibold ${
                targetStatus === 'pending' ? 'text-amber-700' : 'text-warm-500'
              }`}>
                恢复为待领取
              </span>
              <span className="text-xs text-warm-400">包裹仍在等取</span>
            </button>
            <button
              type="button"
              onClick={() => setTargetStatus('resolved')}
              className={`flex flex-col items-center gap-1.5 px-4 py-3.5 rounded-xl border-2 transition-all ${
                targetStatus === 'resolved'
                  ? 'border-slate-400 bg-slate-50'
                  : 'border-warm-300/60 bg-warm-50 hover:border-slate-300'
              }`}
            >
              <span className={`text-sm font-semibold ${
                targetStatus === 'resolved' ? 'text-slate-700' : 'text-warm-500'
              }`}>
                标记为已处理
              </span>
              <span className="text-xs text-warm-400">关闭此包裹</span>
            </button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!resolvedBy.trim()}
          className="w-full py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors shadow-lg shadow-primary-200/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          确认处理
        </button>
      </div>
    </div>
  );
}
