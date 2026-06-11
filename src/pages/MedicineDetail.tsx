import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Minus,
  Plus,
  Calendar,
  MapPin,
  Users,
  AlertTriangle,
  Star,
  History,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import UseMedicineModal from '@/components/UseMedicineModal';
import RestockModal from '@/components/RestockModal';
import { daysUntil, isExpired, isExpiringSoon, formatDate } from '@/utils/dateUtils';
import clsx from 'clsx';
import type { Medicine } from '@/types';

export default function MedicineDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const medicines = useStore((s) => s.medicines);
  const stockRecords = useStore((s) => s.stockRecords);
  const deleteMedicine = useStore((s) => s.deleteMedicine);
  const updateMedicine = useStore((s) => s.updateMedicine);

  const [useTarget, setUseTarget] = useState<Medicine | null>(null);
  const [restockTarget, setRestockTarget] = useState<Medicine | null>(null);

  const medicine = medicines.find((m) => m.id === id);
  const records = stockRecords
    .filter((r) => r.medicineId === id)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 10);

  if (!medicine) {
    return (
      <div className="card p-12 text-center">
        <p className="text-5xl mb-4">🤔</p>
        <p className="text-gray-500 mb-4">药品不存在或已删除</p>
        <button onClick={() => navigate('/medicines')} className="btn-primary">
          返回列表
        </button>
      </div>
    );
  }

  const expired = isExpired(medicine.expiryDate);
  const expiringSoon = !expired && isExpiringSoon(medicine.expiryDate);
  const lowStock = medicine.quantity <= medicine.lowStockThreshold;
  const daysLeft = daysUntil(medicine.expiryDate);

  const handleDelete = () => {
    if (confirm(`确定删除 ${medicine.name} 吗？`)) {
      deleteMedicine(medicine.id);
      navigate('/medicines');
    }
  };

  const toggleCommon = () => {
    updateMedicine(medicine.id, { isCommon: !medicine.isCommon });
  };

  return (
    <div className="pb-8">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white shadow-card flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="font-display text-2xl text-gray-800">药品详情</h1>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <div
              className={clsx(
                'w-28 h-28 rounded-2xl flex items-center justify-center text-6xl',
                expired
                  ? 'bg-danger-100'
                  : expiringSoon
                  ? 'bg-warning-100'
                  : 'bg-gradient-to-br from-primary-100 to-accent-100'
              )}
            >
              {medicine.image ? (
                <img
                  src={medicine.image}
                  alt=""
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <span>{medicine.emoji}</span>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-display text-2xl text-gray-800 mb-1">
                  {medicine.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {medicine.category} · {medicine.applicableTo}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {expired ? (
                  <span className="badge-danger">已过期 {Math.abs(daysLeft)} 天</span>
                ) : expiringSoon ? (
                  <span className="badge-warning animate-pulse-slow">
                    {daysLeft} 天后过期
                  </span>
                ) : lowStock ? (
                  <span className="badge-warning">库存低</span>
                ) : (
                  <span className="badge-success">状态良好</span>
                )}
                {medicine.childWarning && (
                  <span className="badge-danger">
                    <AlertTriangle className="w-3 h-3" /> 儿童慎用
                  </span>
                )}
                {medicine.isCommon && (
                  <span className="badge bg-accent-100 text-accent-700">
                    <Star className="w-3 h-3" /> 常用
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">当前库存</p>
                <p className={clsx(
                  'font-display text-2xl',
                  lowStock ? 'text-danger-600' : 'text-gray-800'
                )}>
                  {medicine.quantity} <span className="text-sm font-normal text-gray-500">{medicine.unit}</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">阈值 {medicine.lowStockThreshold}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> 有效期至
                </p>
                <p className={clsx(
                  'font-display text-lg',
                  expired ? 'text-danger-600' : expiringSoon ? 'text-warning-600' : 'text-gray-800'
                )}>
                  {formatDate(medicine.expiryDate)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> 存放位置
                </p>
                <p className="font-medium text-gray-800">{medicine.storageLocation}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3" /> 适用人群
                </p>
                <p className="font-medium text-gray-800">{medicine.applicableTo}</p>
              </div>
            </div>

            {medicine.notes && (
              <div className="mt-4 p-4 bg-primary-50 rounded-xl">
                <p className="text-xs text-primary-600 font-medium mb-1">备注</p>
                <p className="text-sm text-gray-700">{medicine.notes}</p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {!expired && (
                <>
                  <button
                    onClick={() => setUseTarget(medicine)}
                    disabled={medicine.quantity <= 0}
                    className="btn-ghost disabled:opacity-50"
                  >
                    <Minus className="w-4 h-4" /> 使用扣减
                  </button>
                  <button onClick={() => setRestockTarget(medicine)} className="btn-primary">
                    <Plus className="w-4 h-4" /> 补货登记
                  </button>
                </>
              )}
              <button onClick={toggleCommon} className="btn-ghost">
                <Star className={clsx('w-4 h-4', medicine.isCommon && 'fill-accent-500 text-accent-500')} />
                {medicine.isCommon ? '取消常用' : '标记常用'}
              </button>
              <Link to={`/medicines/${medicine.id}/edit`} className="btn-ghost">
                <Edit2 className="w-4 h-4" /> 编辑
              </Link>
              <button onClick={handleDelete} className="btn-danger ml-auto">
                <Trash2 className="w-4 h-4" /> 删除
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-display text-xl text-gray-800 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-primary-500" />
          最近变动记录
        </h3>
        {records.length === 0 ? (
          <p className="text-gray-400 text-center py-8">暂无变动记录</p>
        ) : (
          <div className="space-y-2">
            {records.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
              >
                <div
                  className={clsx(
                    'w-9 h-9 rounded-full flex items-center justify-center',
                    r.type === 'use' ? 'bg-primary-100 text-primary-600' : 'bg-accent-100 text-accent-600'
                  )}
                >
                  {r.type === 'use' ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {r.type === 'use' ? '使用' : '补货'} {r.quantity} {medicine.unit}
                    {r.unitPrice && r.type === 'restock' && (
                      <span className="text-gray-500 font-normal ml-2">
                        ¥{r.unitPrice}/个 · 共 ¥{(r.unitPrice * r.quantity).toFixed(2)}
                      </span>
                    )}
                    {r.purchaseChannel && (
                      <span className="text-gray-500 font-normal ml-2">· {r.purchaseChannel}</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(r.timestamp).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <UseMedicineModal medicine={useTarget} onClose={() => setUseTarget(null)} />
      <RestockModal medicine={restockTarget} onClose={() => setRestockTarget(null)} />
    </div>
  );
}
