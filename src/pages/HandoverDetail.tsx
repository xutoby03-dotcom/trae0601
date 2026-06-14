import { useEffect, useState } from 'react';
import { ArrowLeft, AlertTriangle, QrCode, ClipboardList, Banknote } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Handover } from '../../shared/types';
import {
  formatCurrency,
  formatDateTime,
  getShiftLabel,
  getShiftColor,
  getStatusLabel,
  getStatusColor,
  getScanCodeLabel,
  getScanCodeColor,
} from '@/utils/format';

export default function HandoverDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [handover, setHandover] = useState<Handover | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/handovers/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('记录不存在');
        return r.json();
      })
      .then((d) => setHandover(d))
      .catch(() => navigate('/handovers'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-gray-400">加载中...</div>
      </div>
    );
  }

  if (!handover) return null;

  const isDanger = handover.status === 'danger';
  const isWarning = handover.status === 'warning';
  const hasDifference = handover.difference !== 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/handovers')}
          className="p-2 rounded-lg text-gray-500 hover:bg-warm-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-serif font-bold text-gray-900">交接详情</h1>
          <p className="text-sm text-gray-500 mt-1">
            {handover.registerCode} · {formatDateTime(handover.handoverTime)}
          </p>
        </div>
        <span className={`text-xs px-3 py-1.5 rounded-full ${getStatusColor(handover.status)} font-medium`}>
          {getStatusLabel(handover.status)}
        </span>
      </div>

      {(isDanger || isWarning) && hasDifference && (
        <div
          className={`rounded-2xl p-5 border flex items-start gap-3 ${
            isDanger
              ? 'bg-red-50 border-red-200 animate-pulse-danger'
              : 'bg-amber-50 border-amber-200'
          }`}
        >
          <AlertTriangle
            className={`shrink-0 mt-0.5 ${isDanger ? 'text-red-600' : 'text-amber-600'}`}
            size={22}
          />
          <div className="flex-1">
            <div className={`font-semibold ${isDanger ? 'text-red-800' : 'text-amber-800'}`}>
              {isDanger ? '大额差额警告' : '小额差额提醒'}
            </div>
            <div className={`text-sm mt-1 ${isDanger ? 'text-red-700' : 'text-amber-700'}`}>
              交接金额与默认备用金差额：
              <span className="font-bold mx-1">
                {handover.difference > 0 ? '+' : ''}
                {formatCurrency(handover.difference)}
              </span>
            </div>
            {handover.differenceReason && (
              <div className={`text-sm mt-2 ${isDanger ? 'text-red-600' : 'text-amber-600'}`}>
                原因说明：{handover.differenceReason}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard label="收银台编号" value={handover.registerCode} />
        <InfoCard
          label="班次"
          value={
            <span className={`text-xs px-2.5 py-1 rounded-full ${getShiftColor(handover.shift)}`}>
              {getShiftLabel(handover.shift)}
            </span>
          }
        />
        <InfoCard label="交接日期" value={handover.shiftDate} />
        <InfoCard label="交接人" value={handover.handoverPerson} />
        <InfoCard label="接班人" value={handover.successorPerson} />
        <InfoCard
          label="是否准时"
          value={
            handover.isOnTime ? (
              <span className="text-green-600 font-medium">准时</span>
            ) : (
              <span className="text-red-600 font-medium">延迟</span>
            )
          }
        />
      </div>

      <div className="bg-white rounded-2xl border border-warm-200 p-6">
        <h2 className="font-serif font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Banknote size={18} className="text-primary-600" />
          现金面额明细
        </h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-5">
          {handover.denominations.map((d) => (
            <div key={d.denomination} className="bg-warm-50 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-500">¥{d.denomination}</div>
              <div className="text-xl font-bold text-gray-900 mt-1">{d.count}</div>
              <div className="text-xs text-primary-600 mt-1">
                {formatCurrency(d.denomination * d.count)}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-warm-100">
          <div>
            <div className="text-sm text-gray-500">默认备用金</div>
            <div className="text-lg font-semibold text-gray-700">
              {formatCurrency(handover.defaultAmount)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">实点金额</div>
            <div className="text-2xl font-serif font-bold text-gray-900">
              {formatCurrency(handover.actualAmount)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">差额</div>
            <div
              className={`text-2xl font-serif font-bold ${
                handover.difference > 0
                  ? 'text-emerald-600'
                  : handover.difference < 0
                  ? 'text-red-600'
                  : 'text-gray-900'
              }`}
            >
              {handover.difference > 0 ? '+' : ''}
              {formatCurrency(handover.difference)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-warm-200 p-6">
          <h2 className="font-serif font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <QrCode size={18} className="text-primary-600" />
            扫码备用码状态
          </h2>
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-xs px-2.5 py-1 rounded-full ${getScanCodeColor(handover.scanCodeStatus)}`}>
              {getScanCodeLabel(handover.scanCodeStatus)}
            </span>
          </div>
          {handover.scanCodeNote && (
            <p className="text-sm text-gray-500 mt-2">备注：{handover.scanCodeNote}</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-warm-200 p-6">
          <h2 className="font-serif font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ClipboardList size={18} className="text-primary-600" />
            上一班未结事项
          </h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {handover.pendingItems || '无'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-warm-200 p-6">
        <h2 className="font-serif font-semibold text-gray-900 mb-5">签名确认</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              交接人：<span className="text-gray-900">{handover.handoverPerson}</span>
            </div>
            {handover.handoverSignature ? (
              <div className="border-2 border-warm-200 rounded-lg p-2 bg-warm-50">
                <img
                  src={handover.handoverSignature}
                  alt="交接人签名"
                  className="w-full h-28 object-contain"
                />
              </div>
            ) : (
              <div className="border-2 border-dashed border-warm-200 rounded-lg h-28 flex items-center justify-center text-gray-400 text-sm">
                未签名
              </div>
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              接班人：<span className="text-gray-900">{handover.successorPerson}</span>
            </div>
            {handover.successorSignature ? (
              <div className="border-2 border-warm-200 rounded-lg p-2 bg-warm-50">
                <img
                  src={handover.successorSignature}
                  alt="接班人签名"
                  className="w-full h-28 object-contain"
                />
              </div>
            ) : (
              <div className="border-2 border-dashed border-warm-200 rounded-lg h-28 flex items-center justify-center text-gray-400 text-sm">
                未签名
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-warm-200 p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-gray-900 font-medium mt-1">{value}</div>
    </div>
  );
}
