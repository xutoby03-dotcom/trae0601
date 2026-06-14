import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  ShoppingCart,
  PlusCircle,
  AlertTriangle,
  User,
  Calendar,
  Package,
  Circle,
  X,
  Check,
} from 'lucide-react';
import { useJarStore } from '@/store/jarStore';
import { useBatchStore } from '@/store/batchStore';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDateTime, formatDate } from '@/utils/date';
import { getOperationLabel, getDamageLabel } from '@/utils/alert';
import { DamageReason } from '@/types';

type ModalType = 'open' | 'sale' | 'refill' | 'damage' | null;

export default function JarDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getJar, getJarOperations, openJar, sellFromJar, refillJar, damageJar } = useJarStore();
  const { batches } = useBatchStore();

  const jar = id ? getJar(id) : undefined;
  const operations = id ? getJarOperations(id) : [];
  const batch = useMemo(() => batches.find((b) => b.id === jar?.batchId), [batches, jar]);

  const [modalType, setModalType] = useState<ModalType>(null);
  const [form, setForm] = useState({
    weight: 0,
    operator: '张店长',
    reason: 'moisture' as DamageReason,
    remark: '',
    source: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!jar || !batch) {
    return (
      <div className="card text-center py-16">
        <p className="text-gray-500">未找到该罐子记录</p>
        <button onClick={() => navigate('/jars')} className="btn-primary mt-4">
          返回列表
        </button>
      </div>
    );
  }

  const operationIcons: Record<string, typeof Play> = {
    seal: Package,
    open: Play,
    sale: ShoppingCart,
    refill: PlusCircle,
    damage: AlertTriangle,
  };

  const operationColors: Record<string, string> = {
    seal: 'bg-teaGreen-100 text-teaGreen-600',
    open: 'bg-amber-100 text-amber-600',
    sale: 'bg-blue-100 text-blue-600',
    refill: 'bg-purple-100 text-purple-600',
    damage: 'bg-red-100 text-red-600',
  };

  const closeModal = () => {
    setModalType(null);
    setForm({ weight: 0, operator: '张店长', reason: 'moisture', remark: '', source: '' });
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (modalType !== 'open' && form.weight <= 0) {
      newErrors.weight = '重量必须大于0';
    }
    if (modalType === 'sale' && form.weight > jar.currentWeight) {
      newErrors.weight = `不能超过当前重量（${jar.currentWeight}g）`;
    }
    if (modalType === 'damage' && form.weight > jar.currentWeight) {
      newErrors.weight = `不能超过当前重量（${jar.currentWeight}g）`;
    }
    if (!form.operator.trim()) {
      newErrors.operator = '请输入操作人';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || !id) return;

    switch (modalType) {
      case 'open':
        openJar(id, form.operator);
        break;
      case 'sale':
        sellFromJar(id, form.weight, form.operator);
        break;
      case 'refill':
        refillJar(id, form.weight, form.operator, form.source);
        break;
      case 'damage':
        damageJar(id, form.weight, form.operator, form.reason, form.remark);
        break;
    }
    closeModal();
  };

  const canOpen = jar.status === 'sealed';
  const canOperate = jar.status === 'open';

  return (
    <div className="space-y-6 max-w-6xl">
      <button
        onClick={() => navigate('/jars')}
        className="flex items-center gap-2 text-gray-500 hover:text-teaGreen-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回封罐列表
      </button>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <img
                  src={batch.photoUrl}
                  alt={batch.name}
                  className="w-20 h-20 rounded-2xl object-cover shadow-md"
                />
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-mono text-sm text-gray-400">{jar.jarNo}</p>
                    <StatusBadge status={jar.status} />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-gray-800 mt-1">{batch.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {batch.origin} · {batch.harvestSeason}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">当前重量</p>
                <p className="text-4xl font-bold text-teaGreen-600 font-serif mt-1">
                  {jar.currentWeight}
                  <span className="text-lg font-normal text-gray-400 ml-1">g</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">封罐时: {jar.sealedWeight}g</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 pt-5 border-t border-tea-100">
              <div className="space-y-1">
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  封罐操作人
                </p>
                <p className="text-sm font-medium text-gray-700">{jar.operator}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  封罐时间
                </p>
                <p className="text-sm font-medium text-gray-700">{formatDateTime(jar.sealedAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Circle className="w-3 h-3" />
                  开罐时间
                </p>
                <p className="text-sm font-medium text-gray-700">
                  {jar.openedAt ? formatDateTime(jar.openedAt) : '-'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  干燥剂批次
                </p>
                <p className="text-sm font-medium text-gray-700 font-mono">
                  {jar.desiccantBatch || '-'}
                </p>
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-tea-100">
              <p className="text-xs text-gray-400 mb-2">密封圈状态</p>
              <StatusBadge status={jar.sealStatus} type="seal" />
            </div>
          </div>

          <div className="card">
            <h3 className="font-serif text-lg font-bold text-gray-800 mb-5">操作历史</h3>
            <div className="relative pl-8">
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-tea-100"></div>
              {operations.map((op, idx) => {
                const Icon = operationIcons[op.type] || Package;
                return (
                  <div key={op.id} className="relative mb-6 last:mb-0">
                    <div
                      className={`absolute -left-8 w-6 h-6 rounded-full flex items-center justify-center ${operationColors[op.type]}`}
                    >
                      <Icon className="w-3 h-3" />
                    </div>
                    <div className="bg-tea-50/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">{getOperationLabel(op.type)}</span>
                          {op.weight > 0 && (
                            <span
                              className={`text-sm font-semibold ${
                                op.type === 'refill' ? 'text-teaGreen-600' : 'text-gray-600'
                              }`}
                            >
                              {op.type === 'refill' ? '+' : '-'}
                              {op.weight}g
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">{formatDateTime(op.operatedAt)}</span>
                      </div>
                      <p className="text-sm text-gray-500">操作人：{op.operator}</p>
                      {op.reason && op.type === 'damage' && (
                        <p className="text-sm text-red-500 mt-1">
                          原因：{getDamageLabel(op.reason.split(' - ')[0])}
                          {op.reason.includes(' - ') && `（${op.reason.split(' - ')[1]}）`}
                        </p>
                      )}
                      {op.reason && op.type === 'refill' && (
                        <p className="text-sm text-gray-500 mt-1">备注：{op.reason}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="font-serif text-lg font-bold text-gray-800 mb-4">快捷操作</h3>
            <div className="space-y-3">
              <button
                onClick={() => setModalType('open')}
                disabled={!canOpen}
                className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all ${
                  canOpen
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-2 border-amber-200'
                    : 'bg-gray-50 text-gray-300 border-2 border-gray-100 cursor-not-allowed'
                }`}
              >
                <Play className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">开罐</p>
                  <p className="text-xs opacity-70">
                    {canOpen ? '准备开始售卖' : '已开罐'}
                  </p>
                </div>
              </button>

              <button
                onClick={() => setModalType('sale')}
                disabled={!canOperate}
                className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all ${
                  canOperate
                    ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-200'
                    : 'bg-gray-50 text-gray-300 border-2 border-gray-100 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">售卖</p>
                  <p className="text-xs opacity-70">
                    {canOperate ? `当前可售 ${jar.currentWeight}g` : '需先开罐'}
                  </p>
                </div>
              </button>

              <button
                onClick={() => setModalType('refill')}
                disabled={!canOperate}
                className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all ${
                  canOperate
                    ? 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-2 border-purple-200'
                    : 'bg-gray-50 text-gray-300 border-2 border-gray-100 cursor-not-allowed'
                }`}
              >
                <PlusCircle className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">补罐</p>
                  <p className="text-xs opacity-70">
                    {canOperate ? '从其他罐/批次补入' : '需先开罐'}
                  </p>
                </div>
              </button>

              <button
                onClick={() => setModalType('damage')}
                disabled={jar.status === 'sold' || jar.status === 'damaged'}
                className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all ${
                  jar.status !== 'sold' && jar.status !== 'damaged'
                    ? 'bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200'
                    : 'bg-gray-50 text-gray-300 border-2 border-gray-100 cursor-not-allowed'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">报损</p>
                  <p className="text-xs opacity-70">受潮/变质等处理</p>
                </div>
              </button>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-teaGreen-50 to-tea-50">
            <h3 className="font-serif text-sm font-bold text-teaGreen-700 mb-3">批次信息</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">进货日期</span>
                <span className="text-gray-700">{formatDate(batch.purchaseDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">批次剩余</span>
                <span className="font-semibold text-teaGreen-700">{batch.remainingWeight}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">保质期</span>
                <span className="text-gray-700">{batch.shelfLifeDays}天</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalType && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-tea-100">
              <h3 className="font-serif text-lg font-bold text-gray-800">
                {modalType === 'open' && '开罐确认'}
                {modalType === 'sale' && '售卖记录'}
                {modalType === 'refill' && '补罐操作'}
                {modalType === 'damage' && '报损登记'}
              </h3>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {modalType !== 'open' && (
                <div>
                  <label className="label-field">
                    {modalType === 'sale' && '售卖重量（克）'}
                    {modalType === 'refill' && '补入重量（克）'}
                    {modalType === 'damage' && '报损重量（克）'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.weight || ''}
                    onChange={(e) => setForm({ ...form, weight: parseInt(e.target.value) || 0 })}
                    className={`input-field text-lg font-semibold ${errors.weight ? 'border-red-300' : ''}`}
                    placeholder="请输入重量"
                  />
                  {errors.weight && <p className="text-xs text-dangerRed mt-1">{errors.weight}</p>}
                </div>
              )}

              <div>
                <label className="label-field">操作人</label>
                <input
                  type="text"
                  value={form.operator}
                  onChange={(e) => setForm({ ...form, operator: e.target.value })}
                  className={`input-field ${errors.operator ? 'border-red-300' : ''}`}
                />
                {errors.operator && <p className="text-xs text-dangerRed mt-1">{errors.operator}</p>}
              </div>

              {modalType === 'refill' && (
                <div>
                  <label className="label-field">来源备注</label>
                  <input
                    type="text"
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                    className="input-field"
                    placeholder="如：从 LJ-2026-003 补入"
                  />
                </div>
              )}

              {modalType === 'damage' && (
                <>
                  <div>
                    <label className="label-field">报损原因</label>
                    <select
                      value={form.reason}
                      onChange={(e) => setForm({ ...form, reason: e.target.value as DamageReason })}
                      className="input-field"
                    >
                      <option value="moisture">受潮</option>
                      <option value="deterioration">变质</option>
                      <option value="other">其他</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-field">备注</label>
                    <textarea
                      value={form.remark}
                      onChange={(e) => setForm({ ...form, remark: e.target.value })}
                      className="input-field h-20 resize-none"
                      placeholder="可填写详细情况"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-tea-100 bg-gray-50/50">
              <button onClick={closeModal} className="btn-secondary">
                取消
              </button>
              <button onClick={handleSubmit} className="btn-primary flex items-center gap-2">
                <Check className="w-4 h-4" />
                确认{modalType === 'open' ? '开罐' : modalType === 'sale' ? '售卖' : modalType === 'refill' ? '补罐' : '报损'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
