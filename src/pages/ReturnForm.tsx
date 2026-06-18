import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckSquare, Save, ArrowLeft, AlertTriangle, Package, User, Calendar, FileText } from 'lucide-react';
import { api } from '../lib/api.js';
import { PageHeader } from '../components/PageHeader.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { toast } from '../components/Layout.js';
import type { BorrowRecordWithDetails, BorrowStatus, ReturnCheckItem } from '../../shared/types.js';

const checkItems: { key: ReturnCheckItem; label: string; description: string }[] = [
  { key: 'deformation', label: '变形检查', description: '检查模具是否有碰撞变形、凹陷' },
  { key: 'coating_loss', label: '涂层脱落', description: '检查不粘涂层是否有剥落、划伤' },
  { key: 'oil_residue', label: '油污残留', description: '检查是否清洁干净，有无油污残留' },
  { key: 'missing_parts', label: '零件缺失', description: '检查配件、盖子等是否齐全' },
];

export default function ReturnForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [borrowRecord, setBorrowRecord] = useState<BorrowRecordWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    actualReturnDate: new Date().toISOString().split('T')[0],
    checks: {} as Record<ReturnCheckItem, boolean>,
    hasDamage: false,
    damageDescription: '',
    remark: '',
  });

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (borrowId: string) => {
    setLoading(true);
    try {
      const record = await api.borrows.get(borrowId);
      setBorrowRecord(record);

      if (record.status === 'returned' && record.returnCheck) {
        const returnCheck = record.returnCheck;
        setFormData({
          actualReturnDate: returnCheck.returnDate,
          checks: returnCheck.checks || {} as Record<ReturnCheckItem, boolean>,
          hasDamage: returnCheck.hasDamage || false,
          damageDescription: returnCheck.damageDescription || '',
          remark: returnCheck.remark || '',
        });
      }

      const initChecks = {} as Record<ReturnCheckItem, boolean>;
      checkItems.forEach(item => {
        if (!initChecks[item.key]) {
          initChecks[item.key] = false;
        }
      });
      setFormData(prev => ({ ...prev, checks: { ...initChecks, ...prev.checks } }));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckChange = (key: ReturnCheckItem, checked: boolean) => {
    setFormData(prev => {
      const newChecks = { ...prev.checks, [key]: checked };
      const hasDamage = Object.values(newChecks).some(v => v);
      return { ...prev, checks: newChecks, hasDamage };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (borrowRecord?.status === 'returned') {
      toast.info('该模具已归还');
      return;
    }

    setSaving(true);
    try {
      const result = await api.returns.create(id, {
        hasDeformation: !!formData.checks.deformation,
        hasCoatingLoss: !!formData.checks.coating_loss,
        hasOilResidue: !!formData.checks.oil_residue,
        hasMissingParts: !!formData.checks.missing_parts,
        remark: [formData.damageDescription, formData.remark].filter(Boolean).join('；') || undefined,
      });

      if (result.hasDamage) {
        toast.success('归还登记成功，已生成异常记录');
      } else {
        toast.success('归还登记成功，模具完好');
      }
      navigate('/borrow');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const isReadOnly = borrowRecord?.status === 'returned';

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="bg-white rounded-2xl shadow-lg p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!borrowRecord) {
    return (
      <div className="animate-fade-in">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">借用记录不存在</h3>
          <button
            onClick={() => navigate('/borrow')}
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
        title={isReadOnly ? '归还详情' : '归还检查'}
        subtitle={isReadOnly ? '查看归还检查记录' : '检查模具状况并登记归还'}
        icon={<CheckSquare className="w-6 h-6" />}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-serif font-bold text-caramel-900 mb-4">借用信息</h3>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-caramel-100 rounded-xl overflow-hidden flex-shrink-0">
              {borrowRecord.photoUrl ? (
                <img src={borrowRecord.photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-caramel-400" />
                </div>
              )}
            </div>
            <div>
              <div className="font-medium text-gray-800">{borrowRecord.moldName}</div>
              <div className="text-sm text-gray-500">{borrowRecord.moldSize}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">借用人</div>
                <div className="font-medium text-gray-800">{borrowRecord.masterName}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">订单号</div>
                <div className="font-mono text-gray-800">{borrowRecord.orderNo}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">借用日期</div>
                <div className="font-medium text-gray-800">{borrowRecord.borrowDate}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">预计归还</div>
                <div className={`font-medium ${borrowRecord.status === 'overdue' ? 'text-tomato-600' : 'text-gray-800'}`}>
                  {borrowRecord.expectedReturnDate}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 flex items-center justify-center">
                <StatusBadge status={borrowRecord.status as BorrowStatus} type="borrow" />
              </div>
              <div>
                <div className="text-sm text-gray-500">当前状态</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            {!isReadOnly && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2 text-caramel-600" />
                  归还日期
                </label>
                <input
                  type="date"
                  value={formData.actualReturnDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, actualReturnDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 focus:border-transparent transition-all"
                />
              </div>
            )}

            <div className="mb-6">
              <h4 className="text-base font-medium text-gray-700 mb-4 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-caramel-600" />
                检查项目
                {formData.hasDamage && (
                  <span className="text-tomato-600 text-sm font-normal flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    发现异常
                  </span>
                )}
              </h4>
              
              <div className="space-y-3">
                {checkItems.map(item => (
                  <label
                    key={item.key}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${
                      formData.checks[item.key]
                        ? 'border-tomato-500 bg-tomato-50'
                        : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                    } ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.checks[item.key] || false}
                      onChange={(e) => !isReadOnly && handleCheckChange(item.key, e.target.checked)}
                      disabled={isReadOnly}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-tomato-600 focus:ring-tomato-500 disabled:cursor-default"
                    />
                    <div className="flex-1">
                      <div className={`font-medium ${
                        formData.checks[item.key] ? 'text-tomato-700' : 'text-gray-800'
                      }`}>
                        {item.label}
                      </div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </div>
                    {formData.checks[item.key] && (
                      <span className="px-2 py-1 bg-tomato-100 text-tomato-700 text-xs rounded-full font-medium">
                        有问题
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {formData.hasDamage && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <AlertTriangle className="w-4 h-4 inline mr-2 text-tomato-600" />
                  损坏详情
                </label>
                <textarea
                  value={formData.damageDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, damageDescription: e.target.value }))}
                  placeholder="请详细描述损坏情况..."
                  rows={3}
                  readOnly={isReadOnly}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
              <textarea
                value={formData.remark}
                onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
                placeholder="其他需要记录的信息..."
                rows={2}
                readOnly={isReadOnly}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {!isReadOnly && (
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
                  disabled={saving}
                  className="flex-1 md:flex-none md:min-w-[200px] inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-matcha-500 to-matcha-600 text-white rounded-xl font-medium hover:from-matcha-600 hover:to-matcha-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {saving ? '保存中...' : (formData.hasDamage ? '登记归还（有异常）' : '确认归还（完好）')}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
