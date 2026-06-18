import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Search, QrCode, Phone, User, ShieldAlert, AlertTriangle,
} from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useAppStore } from '../store/appStore';
import PackageCard from '../components/PackageCard';
import Modal from '../components/Modal';
import type { Package as PackageType, PickupPayload } from 'shared/types.js';
import { formatDateTime } from '../lib/utils';

export default function Pickup() {
  const location = useLocation();
  const { showToast } = useToast();
  const { updatePackage } = useAppStore();
  const preselectId = (location.state as any)?.preselectId as string | undefined;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<(PackageType & { isOverdue: boolean })[]>([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  const [pickupModalOpen, setPickupModalOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<PackageType | null>(null);

  const [pickupForm, setPickupForm] = useState<PickupPayload>({
    pickedBy: '',
    isProxy: false,
    proxyName: '',
    proxyPhone: '',
  });
  const [abnormalReason, setAbnormalReason] = useState('');
  const [abnormalPkg, setAbnormalPkg] = useState<PackageType | null>(null);
  const [showAbnormalModal, setShowAbnormalModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (preselectId) {
      loadById(preselectId);
    }
  }, [preselectId]);

  async function loadById(id: string) {
    try {
      setSearching(true);
      const pkg = await api.getPackage(id);
      setResults([pkg]);
      setSearched(true);
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setSearching(false);
    }
  }

  async function handleSearch() {
    if (!query) {
      showToast('请输入手机号后四位', 'warning');
      return;
    }
    if (!/^\d{4}$/.test(query)) {
      showToast('请输入4位数字', 'warning');
      return;
    }
    try {
      setSearching(true);
      const data = await api.getPackages({ phone: query });
      setResults(data);
      setSearched(true);
      if (data.length === 0) {
        showToast('未找到匹配的包裹', 'info');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setSearching(false);
    }
  }

  function openPickup(pkg: PackageType) {
    setSelectedPkg(pkg);
    setPickupForm({
      pickedBy: pkg.recipientName,
      isProxy: false,
      proxyName: '',
      proxyPhone: '',
    });
    setPickupModalOpen(true);
  }

  function openAbnormal(pkg: PackageType) {
    setAbnormalPkg(pkg);
    setAbnormalReason('');
    setShowAbnormalModal(true);
  }

  async function confirmPickup() {
    if (!pickupForm.pickedBy) {
      showToast('请填写取件人姓名', 'warning');
      return;
    }
    if (pickupForm.isProxy && (!pickupForm.proxyName || !pickupForm.proxyPhone)) {
      showToast('请填写代领人姓名和手机', 'warning');
      return;
    }
    if (!selectedPkg) return;
    try {
      setSubmitting(true);
      const pkg = await api.pickupPackage(selectedPkg.id, pickupForm);
      updatePackage(pkg);
      showToast(pickupForm.isProxy ? '代领登记成功，包裹已取出' : '取件成功！', 'success');
      setPickupModalOpen(false);
      setResults(prev => prev.filter(p => p.id !== selectedPkg.id));
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmAbnormal() {
    if (!abnormalReason) {
      showToast('请填写异常原因', 'warning');
      return;
    }
    if (!abnormalPkg) return;
    try {
      setSubmitting(true);
      const pkg = await api.markAbnormal(abnormalPkg.id, {
        reason: abnormalReason,
        pickedBy: '前台',
      });
      updatePackage(pkg);
      showToast('异常已记录', 'success');
      setShowAbnormalModal(false);
      setResults(prev => prev.filter(p => p.id !== abnormalPkg.id));
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Search className="w-6 h-6 text-primary-500" />
          取件操作
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">输入手机号后四位查询并领取包裹</p>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              maxLength={4}
              placeholder="请输入收件人手机号后四位"
              className="input-field pl-12 text-lg font-mono tracking-widest"
              value={query}
              onChange={e => setQuery(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button onClick={handleSearch} disabled={searching} className="btn-primary px-8">
            <Search className="w-4 h-4 inline mr-1.5" />
            查询
          </button>
          <button
            className="btn-secondary"
            onClick={() => showToast('扫码功能模拟触发', 'info')}
          >
            <QrCode className="w-4 h-4 inline mr-1.5" />
            扫码
          </button>
        </div>
      </div>

      {!searched ? (
        <div className="card p-14 text-center">
          <Search className="w-16 h-16 mx-auto text-slate-200 mb-4" />
          <p className="text-lg text-slate-500">请输入手机号后四位查询待取包裹</p>
          <p className="text-sm text-slate-400 mt-1">或使用扫码功能扫描包裹二维码</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-500">
              查询结果：找到 <span className="font-semibold text-slate-800">{results.length}</span> 个待取包裹
            </p>
          </div>
          {results.length === 0 ? (
            <div className="card p-10 text-center">
              <User className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">未找到匹配的待取包裹</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map(p => (
                <div key={p.id} className="relative">
                  <PackageCard pkg={p} onAction={openPickup} actionLabel="确认取件" />
                  <button
                    onClick={() => openAbnormal(p)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-accent-rose hover:bg-accent-rose/10 transition-colors"
                    title="异常记录"
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal
        open={pickupModalOpen}
        onClose={() => setPickupModalOpen(false)}
        title="确认取件"
        size="md"
      >
        {selectedPkg && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">收件人</span>
                <span className="font-medium">{selectedPkg.recipientName} · ****{selectedPkg.phoneLast4}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">快递公司</span>
                <span className="font-medium">{selectedPkg.company}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">单号</span>
                <span className="font-mono text-xs">{selectedPkg.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">柜格</span>
                <span className="font-semibold text-primary-500">{selectedPkg.lockerCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">存放时间</span>
                <span>{formatDateTime(selectedPkg.createdAt)}</span>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 mb-3 text-sm">
                <input
                  type="checkbox"
                  checked={pickupForm.isProxy}
                  onChange={e => setPickupForm(prev => ({ ...prev, isProxy: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span>他人代领</span>
              </label>
            </div>

            <div className="space-y-3">
              {!pickupForm.isProxy ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">取件人姓名</label>
                  <input
                    type="text"
                    className="input-field"
                    value={pickupForm.pickedBy}
                    onChange={e => setPickupForm(prev => ({ ...prev, pickedBy: e.target.value }))}
                    placeholder="请输入取件人姓名"
                  />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">代领人姓名 *</label>
                      <input
                        type="text"
                        className="input-field"
                        value={pickupForm.proxyName}
                        onChange={e => setPickupForm(prev => ({ ...prev, proxyName: e.target.value, pickedBy: e.target.value }))}
                        placeholder="代领人姓名"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">代领人手机 *</label>
                      <input
                        type="text"
                        className="input-field font-mono"
                        value={pickupForm.proxyPhone}
                        onChange={e => setPickupForm(prev => ({ ...prev, proxyPhone: e.target.value.replace(/\D/g, '') }))}
                        placeholder="手机号"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    代领人身份将被记录，请核实身份
                  </p>
                </>
              )}
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button onClick={() => setPickupModalOpen(false)} className="btn-secondary flex-1">
                取消
              </button>
              <button onClick={confirmPickup} disabled={submitting} className="btn-success flex-1">
                {submitting ? '处理中...' : '确认取件'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={showAbnormalModal}
        onClose={() => setShowAbnormalModal(false)}
        title="记录异常取件"
        size="md"
      >
        <div className="space-y-4">
          {abnormalPkg && (
            <div className="p-4 rounded-xl bg-slate-50 text-sm">
              <div className="font-medium">{abnormalPkg.recipientName} · {abnormalPkg.company}</div>
              <div className="text-slate-500 mt-1 font-mono text-xs">{abnormalPkg.trackingNumber}</div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              异常原因 <span className="text-accent-rose">*</span>
            </label>
            <textarea
              className="input-field min-h-[100px]"
              value={abnormalReason}
              onChange={e => setAbnormalReason(e.target.value)}
              placeholder="请描述异常情况，如：包裹破损、物品缺失、错件等..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowAbnormalModal(false)} className="btn-secondary flex-1">
              取消
            </button>
            <button onClick={confirmAbnormal} disabled={submitting} className="btn-danger flex-1">
              {submitting ? '处理中...' : '提交异常记录'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
