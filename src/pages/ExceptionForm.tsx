import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Save, ArrowLeft, Package, User, Calendar, FileText, CheckCircle, Trash2, Wrench, XCircle } from 'lucide-react';
import { api } from '../lib/api.js';
import { PageHeader } from '../components/PageHeader.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { toast } from '../components/Layout.js';
import type { ExceptionRecordWithDetails, ExceptionStatus, ExceptionType } from '../../shared/types.js';

const handleOptions = [
  { value: 'processing', label: '标记为处理中', icon: <Wrench className="w-5 h-5" /> },
  { value: 'resolved', label: '已修复，恢复使用', icon: <CheckCircle className="w-5 h-5" /> },
  { value: 'scrapped', label: '无法修复，报废处理', icon: <Trash2 className="w-5 h-5" /> },
];

export default function ExceptionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [exception, setException] = useState<ExceptionRecordWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    status: '' as ExceptionStatus | '',
    handleNote: '',
    resolvedDate: '',
  });

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (exceptionId: string) => {
    setLoading(true);
    try {
      const data = await api.exceptions.get(exceptionId);
      setException(data);
      setFormData(prev => ({
        ...prev,
        status: data.status,
        handleNote: data.handleNote || '',
        resolvedDate: data.resolvedDate || '',
      }));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!formData.status) {
      toast.error('请选择处理方式');
      return;
    }

    setSaving(true);
    try {
      const resolvedDate = (formData.status === 'resolved' || formData.status === 'scrapped')
        ? formData.resolvedDate || new Date().toISOString().split('T')[0]
        : undefined;

      await api.exceptions.update(id, {
        status: formData.status as ExceptionStatus,
        handleNote: formData.handleNote,
        resolvedDate,
      });

      if (formData.status === 'scrapped') {
        toast.success('已登记报废');
      } else if (formData.status === 'resolved') {
        toast.success('已登记修复完成');
      } else {
        toast.success('状态已更新');
      }
      navigate('/exception');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const isReadOnly = exception?.status === 'resolved' || exception?.status === 'scrapped';

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

  if (!exception) {
    return (
      <div className="animate-fade-in">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">异常记录不存在</h3>
          <button
            onClick={() => navigate('/exception')}
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
        title={isReadOnly ? '异常详情' : '处理异常'}
        subtitle={isReadOnly ? '查看异常处理记录' : '处理模具异常问题'}
        icon={<AlertTriangle className="w-6 h-6" />}
        actions={
          <button
            onClick={() => navigate('/exception')}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回列表
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-serif font-bold text-caramel-900 mb-4">异常信息</h3>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-caramel-100 rounded-xl overflow-hidden flex-shrink-0">
              {exception.photoUrl ? (
                <img src={exception.photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-caramel-400" />
                </div>
              )}
            </div>
            <div>
              <div className="font-medium text-gray-800">{exception.moldName}</div>
              <div className="text-sm text-gray-500">{exception.moldSize}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-tomato-500" />
              <div>
                <div className="text-sm text-gray-500">异常类型</div>
                <div className="font-medium text-gray-800">
                  {exception.type === 'overdue' ? '逾期未还' :
                   exception.type === 'high_temp' ? '高温损坏' : '归还损坏'}
                </div>
              </div>
            </div>
            {exception.masterName && (
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">责任人</div>
                  <div className="font-medium text-gray-800">{exception.masterName}</div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">发现日期</div>
                <div className="font-medium text-gray-800">{exception.foundDate}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 flex items-center justify-center">
                <StatusBadge status={exception.status as ExceptionStatus} type="exception" />
              </div>
              <div>
                <div className="text-sm text-gray-500">当前状态</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="mb-6">
              <h4 className="text-base font-medium text-gray-700 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-caramel-600" />
                异常描述
              </h4>
              <div className="p-4 bg-gray-50 rounded-xl text-gray-700">
                {exception.description}
              </div>
            </div>

            {exception.checks && Object.keys(exception.checks).length > 0 && (
              <div className="mb-6">
                <h4 className="text-base font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-tomato-600" />
                  检查发现的问题
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(exception.checks)
                    .filter(([_, v]) => v)
                    .map(([key]) => (
                      <span key={key} className="px-3 py-1.5 bg-tomato-100 text-tomato-700 rounded-lg text-sm font-medium">
                        {key === 'deformation' ? '变形' :
                         key === 'coating_loss' ? '涂层脱落' :
                         key === 'oil_residue' ? '油污残留' :
                         key === 'missing_parts' ? '零件缺失' : key}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {!isReadOnly && (
              <>
                <div className="mb-6">
                  <h4 className="text-base font-medium text-gray-700 mb-4 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-caramel-600" />
                    选择处理方式
                  </h4>
                  <div className="space-y-3">
                    {handleOptions.map(option => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.status === option.value
                            ? 'border-caramel-500 bg-caramel-50'
                            : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={option.value}
                          checked={formData.status === option.value}
                          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ExceptionStatus }))}
                          className="w-5 h-5 text-caramel-600 focus:ring-caramel-500"
                        />
                        <div className="flex items-center gap-3 flex-1">
                          {option.icon}
                          <span className="font-medium text-gray-800">{option.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {(formData.status === 'resolved' || formData.status === 'scrapped') && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2 text-caramel-600" />
                      处理完成日期
                    </label>
                    <input
                      type="date"
                      value={formData.resolvedDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, resolvedDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 focus:border-transparent transition-all"
                    />
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">处理备注</label>
                  <textarea
                    value={formData.handleNote}
                    onChange={(e) => setFormData(prev => ({ ...prev, handleNote: e.target.value }))}
                    placeholder="记录处理过程、修复情况或报废原因..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </>
            )}

            {isReadOnly && (
              <>
                <div className="mb-6">
                  <h4 className="text-base font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-matcha-600" />
                    处理结果
                  </h4>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <StatusBadge status={exception.status as ExceptionStatus} type="exception" />
                    </div>
                    {exception.handleNote && (
                      <p className="text-gray-700 mb-2">{exception.handleNote}</p>
                    )}
                    {exception.resolvedDate && (
                      <p className="text-sm text-gray-500">处理日期：{exception.resolvedDate}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {!isReadOnly && (
              <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate('/exception')}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving || !formData.status}
                  className="flex-1 md:flex-none md:min-w-[200px] inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-tomato-500 to-tomato-600 text-white rounded-xl font-medium hover:from-tomato-600 hover:to-tomato-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {saving ? '保存中...' : '确认处理'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
