import { useState } from 'react';
import { Thermometer, Package, AlertTriangle, Droplets, Box, CheckCircle, Clock, Camera } from 'lucide-react';
import { useAppStore } from '@/store';
import type { Inspection } from '@/types';
import { TempBadge, TempZoneBadge } from '@/components/Badges';
import Modal from '@/components/Modal';
import { classNames, formatDateTime, isTempAbnormal } from '@/utils/helpers';

const emptyForm: Omit<Inspection, 'id' | 'inspectedAt'> = {
  productId: '',
  temperature: -18,
  hasDamage: false,
  damageNote: '',
  hasMelt: false,
  meltNote: '',
  shortageQuantity: 0,
  shortageNote: '',
  photos: [],
};

export default function Inspection() {
  const { products, inspections, addInspection, getProductInspection } = useAppStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [formData, setFormData] = useState(emptyForm);

  const openInspectionModal = (productId: string) => {
    const existing = getProductInspection(productId);
    setSelectedProductId(productId);
    if (existing) {
      setFormData({
        productId,
        temperature: existing.temperature,
        hasDamage: existing.hasDamage,
        damageNote: existing.damageNote || '',
        hasMelt: existing.hasMelt,
        meltNote: existing.meltNote || '',
        shortageQuantity: existing.shortageQuantity,
        shortageNote: existing.shortageNote || '',
        photos: existing.photos,
      });
    } else {
      setFormData({ ...emptyForm, productId });
    }
    setModalOpen(true);
  };

  const handleSubmit = () => {
    addInspection(formData);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div>
        <h1 className="text-2xl font-bold text-white">到货验收</h1>
        <p className="text-sm text-slate-400 mt-1">检查并记录保温箱温度、破损、融化和缺货情况</p>
      </div>

      {/* 验收列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {products.map((product) => {
          const inspection = getProductInspection(product.id);
          const isTempAb = inspection ? isTempAbnormal(product.tempZone, inspection.temperature) : false;
          const hasIssues =
            inspection?.hasDamage || inspection?.hasMelt || (inspection?.shortageQuantity || 0) > 0;

          return (
            <div
              key={product.id}
              className={classNames(
                'relative overflow-hidden rounded-2xl border bg-slate-900/60 backdrop-blur-sm transition-all duration-300',
                !inspection
                  ? 'border-amber-500/30'
                  : hasIssues || isTempAb
                  ? 'border-red-500/30'
                  : 'border-emerald-500/30'
              )}
            >
              {/* 状态条 */}
              <div
                className={classNames(
                  'absolute top-0 left-0 right-0 h-1',
                  !inspection
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                    : hasIssues || isTempAb
                    ? 'bg-gradient-to-r from-red-400 to-rose-400'
                    : 'bg-gradient-to-r from-emerald-400 to-teal-400'
                )}
              />

              <div className="p-5">
                {/* 团品信息 */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                    {product.photo ? (
                      <img src={product.photo} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-slate-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">{product.name}</h3>
                    <p className="text-sm text-slate-400 mt-0.5">{product.spec}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <TempZoneBadge zone={product.tempZone} />
                      <span className="text-xs text-slate-500">{product.boxNumber}</span>
                    </div>
                  </div>
                </div>

                {/* 验收状态 */}
                {!inspection ? (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
                    <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-300">待验收</p>
                      <p className="text-xs text-amber-400/70 mt-0.5">请检查保温箱并记录情况</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 mb-4">
                    {/* 温度 */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40">
                      <div className="flex items-center gap-3">
                        <Thermometer className={classNames('w-5 h-5', isTempAb ? 'text-red-400' : 'text-sky-400')} />
                        <span className="text-sm text-slate-300">箱内温度</span>
                      </div>
                      <TempBadge temperature={inspection.temperature} isAbnormal={isTempAb} />
                    </div>

                    {/* 问题标签 */}
                    <div className="flex flex-wrap gap-2">
                      {inspection.hasDamage && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-orange-500/15 text-orange-400 border border-orange-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          包装破损
                        </span>
                      )}
                      {inspection.hasMelt && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/30">
                          <Droplets className="w-3 h-3" />
                          有融化
                        </span>
                      )}
                      {inspection.shortageQuantity > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <Box className="w-3 h-3" />
                          缺货 x{inspection.shortageQuantity}
                        </span>
                      )}
                      {!inspection.hasDamage && !inspection.hasMelt && inspection.shortageQuantity === 0 && !isTempAb && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3" />
                          一切正常
                        </span>
                      )}
                    </div>

                    {/* 验收时间 */}
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      验收于 {formatDateTime(inspection.inspectedAt)}
                    </p>
                  </div>
                )}

                {/* 操作按钮 */}
                <button
                  onClick={() => openInspectionModal(product.id)}
                  className={classNames(
                    'w-full py-3 rounded-xl font-medium transition-all',
                    !inspection
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  )}
                >
                  {!inspection ? '开始验收' : '重新验收'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 验收弹窗 */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="到货验收检查"
        size="lg"
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="px-5 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-medium shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all"
            >
              确认验收
            </button>
          </>
        }
      >
        <div className="space-y-6">
          {/* 温度检查 */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
                <Thermometer className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">箱内温度</h4>
                <p className="text-xs text-slate-400">请使用测温枪测量保温箱内温度</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                step="0.5"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) || 0 })}
                className="flex-1 px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-2xl font-bold text-white text-center focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all"
              />
              <span className="text-2xl font-bold text-slate-400">°C</span>
            </div>
          </div>

          {/* 包装破损 */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">包装破损</h4>
                  <p className="text-xs text-slate-400">外包装是否有压损、破裂等情况</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasDamage}
                  onChange={(e) => setFormData({ ...formData, hasDamage: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
            {formData.hasDamage && (
              <textarea
                value={formData.damageNote}
                onChange={(e) => setFormData({ ...formData, damageNote: e.target.value })}
                placeholder="请描述破损情况..."
                rows={2}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
              />
            )}
          </div>

          {/* 融化情况 */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">融化情况</h4>
                  <p className="text-xs text-slate-400">商品是否有软化、融化、出水等情况</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasMelt}
                  onChange={(e) => setFormData({ ...formData, hasMelt: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>
            {formData.hasMelt && (
              <textarea
                value={formData.meltNote}
                onChange={(e) => setFormData({ ...formData, meltNote: e.target.value })}
                placeholder="请描述融化情况..."
                rows={2}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all resize-none"
              />
            )}
          </div>

          {/* 缺货情况 */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <Box className="w-5 h-5 text-rose-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white">缺货数量</h4>
                <p className="text-xs text-slate-400">实际到货缺少的商品数量</p>
              </div>
              <input
                type="number"
                min="0"
                value={formData.shortageQuantity}
                onChange={(e) => setFormData({ ...formData, shortageQuantity: parseInt(e.target.value) || 0 })}
                className="w-24 px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-xl font-bold text-white text-center focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 transition-all"
              />
            </div>
            {formData.shortageQuantity > 0 && (
              <textarea
                value={formData.shortageNote}
                onChange={(e) => setFormData({ ...formData, shortageNote: e.target.value })}
                placeholder="请备注缺货处理方案..."
                rows={2}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 transition-all resize-none"
              />
            )}
          </div>

          {/* 拍照留证 */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Camera className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">拍照留证</h4>
                <p className="text-xs text-slate-400">如有异常请拍照记录（可输入图片URL）</p>
              </div>
            </div>
            <div className="space-y-2">
              {(formData.photos || []).map((photo, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={photo}
                    onChange={(e) => {
                      const newPhotos = [...(formData.photos || [])];
                      newPhotos[idx] = e.target.value;
                      setFormData({ ...formData, photos: newPhotos });
                    }}
                    placeholder="https://..."
                    className="flex-1 px-4 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all text-sm"
                  />
                  <button
                    onClick={() => {
                      const newPhotos = (formData.photos || []).filter((_, i) => i !== idx);
                      setFormData({ ...formData, photos: newPhotos });
                    }}
                    className="px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    移除
                  </button>
                </div>
              ))}
              <button
                onClick={() => setFormData({ ...formData, photos: [...(formData.photos || []), ''] })}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-600 text-slate-400 hover:border-violet-500/50 hover:text-violet-400 transition-colors text-sm"
              >
                + 添加图片
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
