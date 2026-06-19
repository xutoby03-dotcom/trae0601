import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, User, Package, FileText, Calendar, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { todayStr } from '@/utils';
import type { RepairStatus } from '@/types';

export default function RepairDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { repairs, facilities, issues, addRepair, updateRepair } = useAppStore();

  const existing = id ? repairs.find((r) => r.id === id) : undefined;
  const isNew = !id;
  const isEdit = !!existing;

  const [form, setForm] = useState({
    facilityId: '',
    issueId: '',
    title: '',
    handler: '',
    materials: '',
    repairDate: todayStr(),
    result: '',
    reopenDate: '',
    status: 'pending' as RepairStatus,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        facilityId: existing.facilityId,
        issueId: existing.issueId || '',
        title: existing.title,
        handler: existing.handler,
        materials: existing.materials,
        repairDate: existing.repairDate,
        result: existing.result,
        reopenDate: existing.reopenDate || '',
        status: existing.status,
      });
    }
  }, [existing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.facilityId || !form.title || !form.handler) {
      alert('请填写设施、标题和处理人');
      return;
    }

    if (isNew) {
      addRepair(form);
    } else if (isEdit && id) {
      updateRepair(id, form);
    }
    navigate('/repairs');
  };

  const relatedIssue = form.issueId ? issues.find((i) => i.id === form.issueId) : null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/repairs" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          返回维修列表
        </Link>
      </div>

      <div className="card p-6">
        <h1 className="font-display text-2xl text-gray-800 mb-6">
          {isNew ? '新增维修工单' : isEdit ? '处理维修工单' : '维修详情'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label-text">关联设施 *</label>
              <select
                value={form.facilityId}
                onChange={(e) => setForm({ ...form, facilityId: e.target.value })}
                className="input-field"
                disabled={isEdit}
              >
                <option value="">请选择设施...</option>
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>{f.name} - {f.location}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">关联问题（可选）</label>
              <select
                value={form.issueId}
                onChange={(e) => setForm({ ...form, issueId: e.target.value })}
                className="input-field"
                disabled={isEdit}
              >
                <option value="">无</option>
                {issues.filter(i => i.level && i.level !== 'minor').map((i) => (
                  <option key={i.id} value={i.id}>{i.title}</option>
                ))}
              </select>
            </div>
          </div>

          {relatedIssue && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-sm font-medium text-yellow-800 mb-1">关联问题：{relatedIssue.title}</p>
              <p className="text-sm text-yellow-700">{relatedIssue.description}</p>
            </div>
          )}

          <div>
            <label className="label-text flex items-center gap-2">
              <FileText className="w-4 h-4" />
              维修标题 *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field"
              placeholder="如：滑梯链条更换维修"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label-text flex items-center gap-2">
                <User className="w-4 h-4" />
                处理人 *
              </label>
              <input
                type="text"
                value={form.handler}
                onChange={(e) => setForm({ ...form, handler: e.target.value })}
                className="input-field"
                placeholder="如：李维修"
              />
            </div>
            <div>
              <label className="label-text flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                维修日期
              </label>
              <input
                type="date"
                value={form.repairDate}
                onChange={(e) => setForm({ ...form, repairDate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="label-text flex items-center gap-2">
              <Package className="w-4 h-4" />
              使用材料
            </label>
            <input
              type="text"
              value={form.materials}
              onChange={(e) => setForm({ ...form, materials: e.target.value })}
              className="input-field"
              placeholder="如：不锈钢螺丝×5颗、防锈润滑油、防滑涂层材料..."
            />
          </div>

          <div>
            <label className="label-text flex items-center gap-2">
              <FileText className="w-4 h-4" />
              处理结果
            </label>
            <textarea
              value={form.result}
              onChange={(e) => setForm({ ...form, result: e.target.value })}
              rows={3}
              className="input-field resize-none"
              placeholder="请详细描述维修处理过程和结果..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label-text flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                恢复开放日期
              </label>
              <input
                type="date"
                value={form.reopenDate}
                onChange={(e) => setForm({ ...form, reopenDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-text">工单状态</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as RepairStatus })}
                className="input-field"
              >
                <option value="pending">待处理</option>
                <option value="in_progress">维修中</option>
                <option value="completed">已完成</option>
                <option value="reviewed">已验收</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Link to="/repairs" className="btn-ghost">取消</Link>
            <button type="submit" className="btn-primary inline-flex items-center gap-2">
              <Save className="w-4 h-4" />
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
