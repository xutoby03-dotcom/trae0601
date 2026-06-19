import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, Camera, User, FileText, MapPin } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { todayStr } from '@/utils';

export default function IssueReportPage() {
  const navigate = useNavigate();
  const { facilities, addIssue } = useAppStore();

  const [form, setForm] = useState({
    facilityId: '',
    title: '',
    description: '',
    reporter: '',
    photo: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoPreview = () => {
    const desc = window.prompt('请输入问题照片描述（用于生成示例图片）：', '设施问题');
    if (desc) {
      setForm({ ...form, photo: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(desc)}&image_size=landscape_4_3` });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.facilityId || !form.title || !form.description || !form.reporter) {
      alert('请填写所有必填项');
      return;
    }
    setIsSubmitting(true);

    addIssue({
      facilityId: form.facilityId,
      title: form.title,
      description: form.description,
      reporter: form.reporter,
      photos: form.photo ? [form.photo] : [],
      reportDate: todayStr(),
      status: 'pending',
    });

    setTimeout(() => {
      setIsSubmitting(false);
      alert('问题上报成功！管理员会尽快处理。');
      navigate('/issues');
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/issues" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          返回问题列表
        </Link>
      </div>

      <div className="card p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center mb-3 shadow-glow">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-2xl text-gray-800">上报设施问题</h1>
          <p className="text-gray-500 mt-1 text-sm">感谢您的反馈，一起守护孩子们的安全</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-text flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              选择问题设施 *
            </label>
            <select
              value={form.facilityId}
              onChange={(e) => setForm({ ...form, facilityId: e.target.value })}
              className="input-field"
            >
              <option value="">请选择设施...</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} - {f.location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-text">问题标题 *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field"
              placeholder="简短描述问题，如：滑梯螺丝松动"
            />
          </div>

          <div>
            <label className="label-text flex items-center gap-2">
              <User className="w-4 h-4" />
              您的称呼 *
            </label>
            <input
              type="text"
              value={form.reporter}
              onChange={(e) => setForm({ ...form, reporter: e.target.value })}
              className="input-field"
              placeholder="如：居民王女士"
            />
          </div>

          <div>
            <label className="label-text">详细描述 *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="input-field resize-none"
              placeholder="请详细描述您发现的问题情况..."
            />
          </div>

          <div>
            <label className="label-text flex items-center gap-2">
              <Camera className="w-4 h-4" />
              上传照片
            </label>
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_auto] gap-3 items-start">
              {form.photo ? (
                <img src={form.photo} alt="预览" className="w-full h-32 object-cover rounded-xl border border-gray-200" />
              ) : (
                <div className="w-full h-32 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <input
                type="text"
                value={form.photo}
                onChange={(e) => setForm({ ...form, photo: e.target.value })}
                className="input-field"
                placeholder="图片URL（可选）"
              />
              <button
                type="button"
                onClick={handlePhotoPreview}
                className="btn-secondary whitespace-nowrap"
              >
                生成示例
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">* 照片可帮助管理员更快速准确地判断问题</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Link to="/issues" className="btn-ghost">取消</Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              提交上报
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
