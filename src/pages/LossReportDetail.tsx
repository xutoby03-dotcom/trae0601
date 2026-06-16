import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  User,
  Clock,
  Check,
  X,
  Package,
  AlertCircle,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { useFreezerStore } from '@/store/freezerStore';
import { useLossReportStore } from '@/store/lossReportStore';
import { formatDateTime, formatCurrency } from '@/utils/format';

export default function LossReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getLossReportById, approveLossReport, rejectLossReport } = useLossReportStore();
  const { getFreezerById } = useFreezerStore();

  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [reviewer, setReviewer] = useState('王店长');

  const report = getLossReportById(id || '');
  const freezer = report ? getFreezerById(report.freezerId) : null;

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">报损单不存在</p>
        <button
          onClick={() => navigate('/loss-reports')}
          className="mt-4 text-sky-600 hover:text-sky-700"
        >
          返回列表
        </button>
      </div>
    );
  }

  const handleApprove = () => {
    if (confirm('确定要通过这张报损单吗？')) {
      approveLossReport(report.id, reviewer);
    }
  };

  const handleReject = () => {
    if (!rejectNotes.trim()) {
      alert('请填写驳回原因');
      return;
    }
    rejectLossReport(report.id, reviewer, rejectNotes);
    setShowRejectDialog(false);
  };

  const totalQuantity = report.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/loss-reports')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回列表
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      report.type === 'loss'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-sky-100 text-sky-600'
                    }`}
                  >
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-xl font-bold text-slate-900">
                        {freezer?.name || '未知冷柜'}
                      </h1>
                      <StatusBadge type="lossType" status={report.type} />
                      <StatusBadge type="loss" status={report.status} />
                    </div>
                    <p className="text-slate-500 mt-1">
                      单据编号: {report.id.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">商品明细</h2>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-sm">
                      <th className="px-4 py-3 text-left font-medium">品牌</th>
                      <th className="px-4 py-3 text-left font-medium">口味</th>
                      <th className="px-4 py-3 text-left font-medium">品类</th>
                      <th className="px-4 py-3 text-right font-medium">单价</th>
                      <th className="px-4 py-3 text-right font-medium">数量</th>
                      <th className="px-4 py-3 text-right font-medium">小计</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-slate-900 font-medium">
                          {item.brand}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{item.flavor}</td>
                        <td className="px-4 py-3 text-slate-500 text-sm">
                          {item.category}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-700">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 border-t border-slate-200">
                      <td colSpan={4} className="px-4 py-3 text-right text-slate-600">
                        合计
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {totalQuantity} 件
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-lg text-red-600">
                        {formatCurrency(report.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {report.status !== 'pending' && (
            <div
              className={`rounded-2xl border p-6 ${
                report.status === 'approved'
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    report.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {report.status === 'approved' ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <X className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {report.status === 'approved' ? '审核通过' : '已驳回'}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    审核人: {report.reviewer} · 审核时间:{' '}
                    {report.reviewTime && formatDateTime(report.reviewTime)}
                  </p>
                  {report.reviewNotes && (
                    <p className="text-sm text-slate-700 mt-2 bg-white/50 rounded-lg p-3">
                      <span className="font-medium">审核意见:</span> {report.reviewNotes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">基本信息</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-sky-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">所属冷柜</p>
                  <p className="font-medium text-slate-900">{freezer?.name || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">提交人</p>
                  <p className="font-medium text-slate-900">{report.submitter}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">提交时间</p>
                  <p className="font-medium text-slate-900">
                    {formatDateTime(report.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {report.status === 'pending' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">审核操作</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  审核人
                </label>
                <input
                  type="text"
                  value={reviewer}
                  onChange={(e) => setReviewer(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleApprove}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm font-medium"
                >
                  <Check className="w-5 h-5" />
                  审核通过
                </button>
                <button
                  onClick={() => setShowRejectDialog(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-sm font-medium"
                >
                  <X className="w-5 h-5" />
                  驳回申请
                </button>
              </div>

              <div className="mt-4 p-3 bg-amber-50 rounded-xl">
                <p className="text-xs text-amber-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  审核通过后将自动扣减对应库存，报损金额将计入统计报表。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showRejectDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">驳回报损申请</h3>
                  <p className="text-sm text-slate-500">请填写驳回原因</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="请输入驳回原因..."
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowRejectDialog(false)}
                className="px-5 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleReject}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-sm"
              >
                确认驳回
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
