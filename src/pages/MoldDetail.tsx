import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Cake, ArrowLeft, Edit, Calendar, Package, Layers, Tag, FileText, Clock, User } from 'lucide-react';
import { api } from '../lib/api.js';
import { PageHeader } from '../components/PageHeader.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { toast } from '../components/Layout.js';
import type { Mold, MoldType, MoldMaterial, MoldStatus, BorrowRecordWithDetails } from '../../shared/types.js';
import { MoldTypeLabels, MoldMaterialLabels } from '../../shared/types.js';

export default function MoldDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [mold, setMold] = useState<Mold | null>(null);
  const [borrowHistory, setBorrowHistory] = useState<BorrowRecordWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (moldId: string) => {
    setLoading(true);
    try {
      const [moldData, borrowData] = await Promise.all([
        api.molds.get(moldId),
        api.borrows.list({ moldId }),
      ]);
      setMold(moldData);
      setBorrowHistory(borrowData);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = () => {
    if (mold && mold.availableQuantity > 0) {
      navigate(`/borrow/new?moldId=${mold.id}`);
    } else {
      toast.error('该模具已无可用库存');
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="bg-white rounded-2xl shadow-lg p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!mold) {
    return (
      <div className="animate-fade-in">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Cake className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">模具不存在</h3>
          <button
            onClick={() => navigate('/molds')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-caramel-500 text-white rounded-xl font-medium hover:bg-caramel-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={mold.name}
        subtitle={`${MoldTypeLabels[mold.type as MoldType]} · ${mold.size}`}
        icon={<Cake className="w-6 h-6" />}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/molds')}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              返回
            </button>
            <button
              onClick={() => navigate(`/molds/${mold.id}/edit`)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-lg"
            >
              <Edit className="w-5 h-5" />
              编辑
            </button>
            {mold.availableQuantity > 0 && (
              <button
                onClick={handleBorrow}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-caramel-500 to-caramel-600 text-white rounded-xl font-medium hover:from-caramel-600 hover:to-caramel-700 transition-all shadow-lg"
              >
                立即借用
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="aspect-square bg-gradient-to-br from-caramel-100 to-caramel-200 relative">
            {mold.photoUrl ? (
              <img
                src={mold.photoUrl}
                alt={mold.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-24 h-24 text-caramel-400" />
              </div>
            )}
            <div className="absolute top-4 right-4">
              <StatusBadge status={mold.status as MoldStatus} type="mold" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-caramel-900 mb-2">{mold.name}</h2>
              <div className="flex items-center gap-3">
                <span className="bg-caramel-100 text-caramel-700 px-3 py-1 rounded-full text-sm font-medium">
                  {MoldTypeLabels[mold.type as MoldType]}
                </span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                  {mold.size}
                </span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                  {MoldMaterialLabels[mold.material as MoldMaterial]}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-serif font-bold text-gray-800">
                {mold.availableQuantity}
                <span className="text-lg text-gray-400 font-normal">/{mold.quantity}</span>
              </div>
              <div className="text-sm text-gray-500">可用库存</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <Calendar className="w-5 h-5 text-caramel-600 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500">购买日期</div>
                <div className="font-medium text-gray-800">{mold.purchaseDate || '未记录'}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <Layers className="w-5 h-5 text-caramel-600 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500">总库存</div>
                <div className="font-medium text-gray-800">{mold.quantity} 个</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <Tag className="w-5 h-5 text-caramel-600 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500">材质</div>
                <div className="font-medium text-gray-800">{MoldMaterialLabels[mold.material as MoldMaterial]}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <Clock className="w-5 h-5 text-caramel-600 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500">档案创建时间</div>
                <div className="font-medium text-gray-800">{new Date(mold.createdAt).toLocaleDateString('zh-CN')}</div>
              </div>
            </div>
          </div>

          {mold.applicableProducts.length > 0 && (
            <div className="mt-6">
              <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Cake className="w-4 h-4 text-caramel-600" />
                适用产品
              </div>
              <div className="flex flex-wrap gap-2">
                {mold.applicableProducts.map((product, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-caramel-50 text-caramel-700 rounded-lg text-sm"
                  >
                    {product}
                  </span>
                ))}
              </div>
            </div>
          )}

          {mold.remark && (
            <div className="mt-6">
              <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-caramel-600" />
                备注
              </div>
              <p className="text-gray-600">{mold.remark}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h3 className="text-lg font-serif font-bold text-caramel-900 mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-caramel-600" />
          借用记录
        </h3>
        {borrowHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">借用人</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">订单号</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">借用日期</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">预计归还</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">实际归还</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">脱模纸</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                </tr>
              </thead>
              <tbody>
                {borrowHistory.map((record) => (
                  <tr key={record.id} className="border-b border-gray-50 hover:bg-caramel-50/30 transition-colors">
                    <td className="py-4 px-4 font-medium text-gray-800">{record.masterName}</td>
                    <td className="py-4 px-4 text-gray-600 font-mono text-sm">{record.orderNo}</td>
                    <td className="py-4 px-4 text-gray-600">{record.borrowDate}</td>
                    <td className="py-4 px-4 text-gray-600">{record.expectedReturnDate}</td>
                    <td className="py-4 px-4 text-gray-600">{record.actualReturnDate || '-'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        record.needReleasePaper
                          ? 'bg-matcha-100 text-matcha-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {record.needReleasePaper ? '需要' : '不需要'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={record.status} type="borrow" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-3" />
            <p>暂无借用记录</p>
          </div>
        )}
      </div>
    </div>
  );
}
