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
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { useFreezerStore } from '@/store/freezerStore';
import { useInspectionStore } from '@/store/inspectionStore';
import { useLossReportStore } from '@/store/lossReportStore';
import { formatDateTime, formatCurrency } from '@/utils/format';
import { shiftLabels, softeningLabels } from '@/utils/mockData';

export default function FreezerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getFreezerById, deleteFreezer } = useFreezerStore();
  const { getInspectionsByFreezer } = useInspectionStore();
  const { getLossReportsByFreezer } = useLossReportStore();

  const freezer = getFreezerById(id || '');
  const inspections = getInspectionsByFreezer(id || '');
  const lossReports = getLossReportsByFreezer(id || '');

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
              {inspections.length === 0 ? (
                <div className="p-8 text-center text-slate-400">暂无巡查记录</div>
              ) : (
                inspections.slice(0, 5).map((inspection) => (
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
        </div>
      </div>
    </div>
  );
}
