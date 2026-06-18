import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ClipboardList, Save, ArrowLeft, AlertTriangle, Package, User, Calendar, FileText } from 'lucide-react';
import { api } from '../lib/api.js';
import { useAppStore } from '../store/index.js';
import { PageHeader } from '../components/PageHeader.js';
import { toast } from '../components/Layout.js';
import type { Mold, Master } from '../../shared/types.js';

export default function BorrowForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedMoldId = searchParams.get('moldId');
  const { molds, masters, fetchAllBasics } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedMold, setSelectedMold] = useState<Mold | null>(null);
  const [formData, setFormData] = useState({
    moldId: '',
    masterId: '',
    orderNo: '',
    borrowDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: '',
    needReleasePaper: false,
    remark: '',
  });

  useEffect(() => {
    initData();
  }, []);

  useEffect(() => {
    if (preSelectedMoldId && molds.length > 0) {
      const mold = molds.find(m => m.id === preSelectedMoldId);
      if (mold) {
        setSelectedMold(mold);
        setFormData(prev => ({ ...prev, moldId: preSelectedMoldId }));
      }
    }
  }, [preSelectedMoldId, molds]);

  const initData = async () => {
    setLoading(true);
    try {
      await fetchAllBasics();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData(prev => ({
        ...prev,
        expectedReturnDate: tomorrow.toISOString().split('T')[0],
      }));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMoldChange = (moldId: string) => {
    const mold = molds.find(m => m.id === moldId);
    setSelectedMold(mold || null);
    setFormData(prev => ({ ...prev, moldId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.moldId || !formData.masterId || !formData.orderNo) {
      toast.error('请填写完整信息');
      return;
    }

    if (selectedMold && selectedMold.availableQuantity <= 0) {
      toast.error('该模具已无可用库存');
      return;
    }

    setSaving(true);
    try {
      await api.borrows.create(formData);
      toast.success('借用记录创建成功');
      navigate('/borrow');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const availableMolds = molds.filter(m => m.availableQuantity > 0);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="新建借用"
        subtitle="登记模具借用信息"
        icon={<ClipboardList className="w-6 h-6" />}
        actions={
          <button
            onClick={() => navigate('/borrow')}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回列表
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="w-4 h-4 inline mr-2 text-caramel-600" />
              选择模具 <span className="text-tomato-500">*</span>
            </label>
            <select
              value={formData.moldId}
              onChange={(e) => handleMoldChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 transition-all"
              required
            >
              <option value="">请选择模具...</option>
              {availableMolds.map(mold => (
                <option key={mold.id} value={mold.id}>
                  {mold.name} ({mold.size}) - 可用: {mold.availableQuantity}个
                </option>
              ))}
            </select>
            {selectedMold && selectedMold.availableQuantity < 3 && (
              <div className="mt-2 flex items-center gap-2 text-amber-600 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>库存不足，仅剩 {selectedMold.availableQuantity} 个可用</span>
              </div>
            )}
            {availableMolds.length === 0 && (
              <div className="mt-2 text-tomato-600 text-sm">
                暂无可用模具，请先添加模具档案
              </div>
            )}
          </div>

          {selectedMold && (
            <div className="md:col-span-2 bg-caramel-50 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                  {selectedMold.photoUrl ? (
                    <img src={selectedMold.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-caramel-400" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-800">{selectedMold.name}</div>
                  <div className="text-sm text-gray-500">
                    {selectedMold.size} · {selectedMold.availableQuantity}/{selectedMold.quantity} 个可用
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2 text-caramel-600" />
              借用师傅 <span className="text-tomato-500">*</span>
            </label>
            <select
              value={formData.masterId}
              onChange={(e) => setFormData(prev => ({ ...prev, masterId: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 transition-all"
              required
            >
              <option value="">请选择师傅...</option>
              {masters.map((master: Master) => (
                <option key={master.id} value={master.id}>
                  {master.name} ({master.specialty || '未指定专长'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2 text-caramel-600" />
              订单号 <span className="text-tomato-500">*</span>
            </label>
            <input
              type="text"
              value={formData.orderNo}
              onChange={(e) => setFormData(prev => ({ ...prev, orderNo: e.target.value }))}
              placeholder="例如：DD20250101001"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2 text-caramel-600" />
              借用日期
            </label>
            <input
              type="date"
              value={formData.borrowDate}
              onChange={(e) => setFormData(prev => ({ ...prev, borrowDate: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2 text-caramel-600" />
              预计归还日期 <span className="text-tomato-500">*</span>
            </label>
            <input
              type="date"
              value={formData.expectedReturnDate}
              onChange={(e) => setFormData(prev => ({ ...prev, expectedReturnDate: e.target.value }))}
              min={formData.borrowDate}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={formData.needReleasePaper}
                onChange={(e) => setFormData(prev => ({ ...prev, needReleasePaper: e.target.checked }))}
                className="w-5 h-5 rounded border-gray-300 text-caramel-600 focus:ring-caramel-500"
              />
              <div>
                <div className="font-medium text-gray-800">需要脱模纸</div>
                <div className="text-sm text-gray-500">借出时一并提供脱模纸</div>
              </div>
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
            <textarea
              value={formData.remark}
              onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
              placeholder="其他需要记录的信息..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 focus:border-transparent transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/borrow')}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={saving || !formData.moldId || !formData.masterId || !formData.orderNo || !formData.expectedReturnDate}
            className="flex-1 md:flex-none md:min-w-[200px] inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-caramel-500 to-caramel-600 text-white rounded-xl font-medium hover:from-caramel-600 hover:to-caramel-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {saving ? '保存中...' : '确认借用'}
          </button>
        </div>
      </form>
    </div>
  );
}
