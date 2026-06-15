import { AlertTriangle, ArrowRight, Edit3 } from 'lucide-react';
import { useCoffeeStore } from '@/store/coffeeStore';
import { NEGATIVE_REASON_LABELS, ROAST_LABELS } from '@/types';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';

export default function LastFailureCard() {
  const records = useCoffeeStore((s) => s.records);

  const lastFailure = useMemo(() => {
    const failures = records
      .filter((r) => r.negativeReason !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return failures[0] || null;
  }, [records]);

  if (!lastFailure) {
    return (
      <div className="card card-hover">
        <div className="px-5 py-3 bg-matcha/10 border-b border-matcha/20 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-matcha" />
          <span className="font-semibold text-matcha">状态良好</span>
        </div>
        <div className="p-6 text-center">
          <p className="text-coffee-600">暂无翻车记录，继续保持！</p>
        </div>
      </div>
    );
  }

  const reasonBadgeColor: Record<string, string> = {
    sour: 'bg-yellow-100 text-yellow-800',
    bitter: 'bg-orange-100 text-orange-800',
    weak: 'bg-blue-100 text-blue-800',
    other: 'bg-gray-100 text-gray-800',
  };

  const dateStr = new Date(lastFailure.createdAt).toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="card card-hover border-2 border-amber animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <div className="px-5 py-3 bg-amber/10 border-b border-amber/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber animate-pulse-slow" />
          <span className="font-semibold text-amber">上次翻车原因</span>
        </div>
        <span className="text-xs text-amber/70">{dateStr}</span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-coffee-800">{lastFailure.beanName}</h4>
            <p className="text-xs text-coffee-500">
              {ROAST_LABELS[lastFailure.roastLevel]} · 批次 {lastFailure.batchDate}
            </p>
          </div>
          {lastFailure.negativeReason && (
            <span className={`badge ${reasonBadgeColor[lastFailure.negativeReason]}`}>
              {NEGATIVE_REASON_LABELS[lastFailure.negativeReason]}
            </span>
          )}
        </div>

        <div className="bg-amber/5 rounded-lg p-3 mb-3">
          <p className="text-sm text-coffee-700">
            <span className="font-medium text-amber">调整说明：</span>
            {lastFailure.adjustmentNote || '未填写'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm mb-4">
          <div className="text-center bg-coffee-50 rounded py-2">
            <p className="text-coffee-500 text-xs">刻度</p>
            <p className="font-semibold text-coffee-800">{lastFailure.grindSetting}</p>
          </div>
          <div className="text-center bg-coffee-50 rounded py-2">
            <p className="text-coffee-500 text-xs">水温</p>
            <p className="font-semibold text-coffee-800">{lastFailure.waterTemp}℃</p>
          </div>
          <div className="text-center bg-coffee-50 rounded py-2">
            <p className="text-coffee-500 text-xs">粉水比</p>
            <p className="font-semibold text-coffee-800">{lastFailure.ratio}</p>
          </div>
        </div>

        {lastFailure.parentId && (
          <Link
            to={`/records/${lastFailure.parentId}/revise`}
            className="flex items-center justify-center gap-1 text-sm text-coffee-600 hover:text-coffee-800 transition-colors"
          >
            基于原参数重新改版
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
        <Link
          to={`/records/${lastFailure.id}/edit`}
          className="mt-2 flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-amber/10 text-amber hover:bg-amber/20 transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          查看并编辑这次改版
        </Link>
      </div>
    </div>
  );
}
