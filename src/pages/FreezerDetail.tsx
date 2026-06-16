import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Thermometer,
  MapPin,
  User,
  Phone,
  Calendar,
  Package,
  Clock,
  AlertTriangle,
  X,
  RefreshCw,
  CheckCircle,
  FileText,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { useFreezerStore } from '@/store/freezerStore';
import { useInspectionStore } from '@/store/inspectionStore';
import { useLossReportStore } from '@/store/lossReportStore';
import { formatDateTime, formatCurrency } from '@/utils/format';
import { shiftLabels, softeningLabels, productStatusLabels } from '@/utils/mockData';

export default function FreezerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getFreezerById, deleteFreezer } = useFreezerStore();
  const { getInspectionsByFreezer, inspections } = useInspectionStore();
  const { getLossReportsByFreezer, getRechecksByFreezer, addRecheck } = useLossReportStore();

  const freezer = getFreezerById(id || '');
  const inspectionList = getInspectionsByFreezer(id || '');
  const lossReports = getLossReportsByFreezer(id || '');
  const rechecks = getRechecksByFreezer(id || '');

  const [showRecheckDialog, setShowRecheckDialog] = useState(false);
  const [recheckForm, setRecheckForm] = useState({
    recheckTime: new Date().toISOString().slice(0, 16),
    rechecker: '',
    temperature: -18,
    productStatus: 'good',
    notes: '',
  });

  if (!freezer) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">冷柜不存在</p>
        <button
          onClick={() => navigate('/freezers')}
          className="mt-4 text-sky-600 hover:text-sky-700"
        >
          返回列表
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('确定要删除这个冷柜吗？')) {
      deleteFreezer(id || '');
      navigate('/freezers');
    }
  };

  const handleRecheckInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setRecheckForm((prev) => ({
      ...prev,
      [name]: name === 'temperature' ? Number(value) : value,
    }));
  };

  const latestAbnormalInspection = inspections.find(
    (i) => i.freezerId === id && i.isAbnormal
  );

  const handleSubmitRecheck = () => {
    if (!recheckForm.rechecker.trim()) {
      alert('请填写复查人');
      return;
    }

    addRecheck({
      freezerId: id || '',
      inspectionId: latestAbnormalInspection?.id || '',
      recheckTime: new Date(recheckForm.recheckTime).toISOString(),
      rechecker: recheckForm.rechecker,
      temperature: recheckForm.temperature,
      productStatus: recheckForm.productStatus as any,
      notes: recheckForm.notes,
      isResolved: true,
    });

    setShowRecheckDialog(false);
    setRecheckForm({
      recheckTime: new Date().toISOString().slice(0, 16),
      rechecker: '',
      temperature: -18,
      productStatus: 'good',
      notes: '',
    });
  };

  const totalProducts = freezer.zones.reduce(
    (sum, zone) => sum + zone.products.length,
    0
  );

  const totalStock = freezer.zones.reduce(
    (sum, zone) => sum + zone.products.reduce((s, p) => s + p.stock, 0),
    0
  );

  const totalValue = freezer.zones.reduce(
    (sum, zone) =>
      sum + zone.products.reduce((s, p) => s + p.retailPrice * p.stock, 0),
    0
  );

  const isAbnormal = freezer.status !== 'normal';

  const getProductStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-emerald-600 bg-emerald-50';
      case 'partial':
        return 'text-amber-600 bg-amber-50';
      case 'bad':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/freezers')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回列表
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div
              className={`h-40 relative ${
                freezer.status === 'abnormal'
                  ? 'bg-gradient-to-br from-red-400 to-rose-500'
                  : freezer.status === 'warning'
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                  : 'bg-gradient-to-br from-sky-400 to-blue-500'
              }`}
            >
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute top-4 right-4">
                <StatusBadge
                  type="freezer"
                  status={freezer.status}
                  className="bg-white/90 backdrop-blur-sm"
                />
              </div>
              <div className="absolute bottom-4 left-6 text-white">
                <h1 className="text-2xl font-bold">{freezer.name}</h1>
                <p className="text-sm opacity-90 flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {freezer.location}
                </p>
              </div>
              {isAbnormal && (
                <div className="absolute bottom-4 right-6">
                  <button
                    onClick={() => setShowRecheckDialog(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 rounded-xl font-medium hover:bg-white/90 transition-colors shadow-lg"
                  >
                    <RefreshCw className="w-5 h-5" />
                    复查登记
                  </button>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">基本信息</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/freezers/${freezer.id}/edit`)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    编辑
                  </button>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    删除
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                    <Thermometer className="w-4 h-4" />
                    温度范围
                  </div>
                  <p className="font-semibold text-slate-900">
                    {freezer.minTemp}°C ~ {freezer.maxTemp}°C
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                    <User className="w-4 h-4" />
                    负责人
                  </div>
                  <p className="font-semibold text-slate-900">{freezer.manager}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                    <Phone className="w-4 h-4" />
                    联系电话
                  </div>
                  <p className="font-semibold text-slate-900">{freezer.managerPhone}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                    <Calendar className="w-4 h-4" />
                    创建时间
                  </div>
                  <p className="font-semibold text-slate-900 text-sm">
                    {formatDateTime(freezer.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {isAbnormal && (
            <div
              className={`rounded-2xl p-5 border ${
                freezer.status === 'abnormal'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    freezer.status === 'abnormal'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-amber-100 text-amber-600'
                  }`}
                >
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">
                    {freezer.status === 'abnormal' ? '温度异常告警' : '温度预警'}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    冷柜当前处于{freezer.status === 'abnormal' ? '异常' : '预警'}状态，请及时检查门封和制冷情况。温度恢复正常后请登记复查。
                  </p>
                </div>
                <button
                  onClick={() => setShowRecheckDialog(true)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    freezer.status === 'abnormal'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-amber-600 text-white hover:bg-amber-700'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  复查登记
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">商品分区</h2>
            </div>
            <div className="p-6 space-y-4">
              {freezer.zones.map((zone) => (
                <div
                  key={zone.id}
                  className="border border-slate-100 rounded-xl overflow-hidden"
                >
                  <div className="bg-slate-50 px-4 py-3 flex items-center justify-between">
                    <h3 className="font-medium text-slate-900">{zone.name}</h3>
                    <span className="text-sm text-slate-500">
                      {zone.products.length} 种商品
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-500 border-b border-slate-100">
                          <th className="px-4 py-2 font-medium">品牌</th>
                          <th className="px-4 py-2 font-medium">口味</th>
                          <th className="px-4 py-2 font-medium">品类</th>
                          <th className="px-4 py-2 font-medium text-right">库存</th>
                          <th className="px-4 py-2 font-medium text-right">零售价</th>
                        </tr>
                      </thead>
                      <tbody>
                        {zone.products.map((product) => (
                          <tr
                            key={product.id}
                            className="border-b border-slate-50 last:border-0"
                          >
                            <td className="px-4 py-2.5 text-slate-900">
                              {product.brand}
                            </td>
                            <td className="px-4 py-2.5 text-slate-600">
                              {product.flavor}
                            </td>
                            <td className="px-4 py-2.5 text-slate-500">
                              {product.category}
                            </td>
                            <td className="px-4 py-2.5 text-right font-medium text-slate-900">
                              {product.stock}
                            </td>
                            <td className="px-4 py-2.5 text-right text-slate-900">
                              {formatCurrency(product.retailPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">最近巡查记录</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {inspectionList.length === 0 ? (
                <div className="p-8 text-center text-slate-400">暂无巡查记录</div>
              ) : (
                inspectionList.slice(0, 5).map((inspection) => (
                  <div key={inspection.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            inspection.isAbnormal
                              ? 'bg-red-100 text-red-600'
                              : 'bg-emerald-100 text-emerald-600'
                          }`}
                        >
                          {inspection.isAbnormal ? (
                            <AlertTriangle className="w-5 h-5" />
                          ) : (
                            <Thermometer className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {inspection.temperature}°C
                          </p>
                          <p className="text-xs text-slate-500">
                            {shiftLabels[inspection.shift]} · {inspection.inspector}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDateTime(inspection.createdAt)}
                        </p>
                        {inspection.isAbnormal && (
                          <p className="text-xs text-red-500 mt-1">
                            软化程度: {softeningLabels[inspection.softeningLevel]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">复查记录</h2>
                {isAbnormal && (
                  <button
                    onClick={() => setShowRecheckDialog(true)}
                    className="inline-flex items-center gap-1.5 text-sm text-sky-600 hover:text-sky-700 font-medium"
                  >
                    <RefreshCw className="w-4 h-4" />
                    新增复查
                  </button>
                )}
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {rechecks.length === 0 ? (
                <div className="p-8 text-center text-slate-400">暂无复查记录</div>
              ) : (
                rechecks.slice(0, 5).map((recheck) => (
                  <div key={recheck.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            recheck.isResolved
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-amber-100 text-amber-600'
                          }`}
                        >
                          {recheck.isResolved ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <Clock className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {recheck.temperature}°C
                          </p>
                          <p className="text-xs text-slate-500">
                            {recheck.rechecker} ·{' '}
                            <span
                              className={`inline-flex px-1.5 py-0.5 rounded text-xs ${getProductStatusColor(
                                recheck.productStatus
                              )}`}
                            >
                              {productStatusLabels[recheck.productStatus as keyof typeof productStatusLabels]}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDateTime(recheck.recheckTime)}
                        </p>
                        {recheck.isResolved && (
                          <p className="text-xs text-emerald-600 mt-1 font-medium">
                            已解除异常
                          </p>
                        )}
                      </div>
                    </div>
                    {recheck.notes && (
                      <p className="text-xs text-slate-500 mt-2 ml-13 pl-13 bg-slate-50 rounded-lg p-2">
                        <span className="font-medium">备注：</span>
                        {recheck.notes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">库存概览</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  商品种类
                </span>
                <span className="font-semibold text-slate-900">{totalProducts} 种</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  库存总数
                </span>
                <span className="font-semibold text-slate-900">{totalStock} 件</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-slate-500">货值总额</span>
                <span className="font-bold text-lg text-emerald-600">
                  {formatCurrency(totalValue)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">报损记录</h3>
            <div className="space-y-3">
              {lossReports.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">暂无报损记录</p>
              ) : (
                lossReports.slice(0, 3).map((report) => (
                  <div
                    key={report.id}
                    onClick={() => navigate(`/loss-reports/${report.id}`)}
                    className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <StatusBadge type="loss" status={report.status} />
                        <p className="text-xs text-slate-500 mt-1.5">
                          {formatDateTime(report.createdAt)}
                        </p>
                      </div>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(report.totalAmount)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">最近复查</h3>
            <div className="space-y-3">
              {rechecks.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">暂无复查记录</p>
              ) : (
                rechecks.slice(0, 3).map((recheck) => (
                  <div
                    key={recheck.id}
                    className="p-3 bg-slate-50 rounded-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-sky-500" />
                        <span className="text-sm font-medium text-slate-700">
                          {recheck.temperature}°C
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getProductStatusColor(
                          recheck.productStatus
                        )}`}
                      >
                        {productStatusLabels[recheck.productStatus as keyof typeof productStatusLabels]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {recheck.rechecker} · {formatDateTime(recheck.recheckTime)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showRecheckDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">复查登记</h3>
                  <p className="text-sm text-slate-500">{freezer.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowRecheckDialog(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    复查时间 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="recheckTime"
                    value={recheckForm.recheckTime}
                    onChange={handleRecheckInputChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    复查人 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="rechecker"
                    value={recheckForm.rechecker}
                    onChange={handleRecheckInputChange}
                    placeholder="请输入复查人姓名"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  复查温度 (°C)
                </label>
                <div className="relative">
                  <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    name="temperature"
                    value={recheckForm.temperature}
                    onChange={handleRecheckInputChange}
                    step="0.5"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  温度范围: {freezer.minTemp}°C ~ {freezer.maxTemp}°C
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  商品状态
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['good', 'partial', 'bad'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setRecheckForm((prev) => ({ ...prev, productStatus: status }))}
                      className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                        recheckForm.productStatus === status
                          ? status === 'good'
                            ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                            : status === 'partial'
                            ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                            : 'bg-red-100 text-red-700 border-2 border-red-300'
                          : 'bg-slate-50 text-slate-600 border-2 border-transparent hover:bg-slate-100'
                      }`}
                    >
                      {productStatusLabels[status as keyof typeof productStatusLabels]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  备注
                </label>
                <textarea
                  name="notes"
                  value={recheckForm.notes}
                  onChange={handleRecheckInputChange}
                  placeholder="请输入复查备注（可选）"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl">
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <span className="font-medium text-emerald-700">提交后自动恢复正常</span>
                  <span className="text-emerald-600 block text-xs mt-0.5">
                    复查登记提交后，冷柜状态将自动恢复为正常，告警提示会同步解除
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowRecheckDialog(false)}
                className="px-5 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmitRecheck}
                className="px-5 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors shadow-sm font-medium"
              >
                提交复查
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
