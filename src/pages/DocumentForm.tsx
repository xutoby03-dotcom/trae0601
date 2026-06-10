import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, MapPin, User, FileText, Camera, Clock, Bell } from 'lucide-react';
import { useDocumentStore } from '@/store/documentStore';
import { DocumentIcon } from '@/components/DocumentIcon';
import { DOCUMENT_TYPE_LABELS } from '@/types';
import type { DocumentType } from '@/types';

export default function DocumentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const { addDocument, updateDocument, getDocumentById, getReminderDays } = useDocumentStore();
  const existingDoc = id ? getDocumentById(id) : null;
  const defaultDaysForCurrentType = getReminderDays('id_card');

  const [formData, setFormData] = useState({
    type: 'id_card' as DocumentType,
    holder: '',
    expireDate: '',
    issueLocation: '',
    photo: '',
    needAnnualReview: false,
    notes: '',
    remindDays: defaultDaysForCurrentType,
  });

  const [isLongTerm, setIsLongTerm] = useState(false);

  useEffect(() => {
    if (existingDoc) {
      setFormData({
        type: existingDoc.type,
        holder: existingDoc.holder,
        expireDate: existingDoc.expireDate === 'long_term' ? '' : existingDoc.expireDate,
        issueLocation: existingDoc.issueLocation,
        photo: existingDoc.photo,
        needAnnualReview: existingDoc.needAnnualReview,
        notes: existingDoc.notes,
        remindDays: existingDoc.remindDays,
      });
      setIsLongTerm(existingDoc.expireDate === 'long_term');
    }
  }, [existingDoc]);

  const handleTypeChange = (type: DocumentType) => {
    setFormData(prev => {
      if (isEditing) {
        return { ...prev, type };
      }
      const defaultDays = getReminderDays(type);
      return { ...prev, type, remindDays: defaultDays };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const docData = {
      ...formData,
      expireDate: isLongTerm ? 'long_term' : formData.expireDate,
    };

    if (isEditing && id) {
      updateDocument(id, docData);
    } else {
      addDocument(docData);
    }

    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-primary-500 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </button>
        <h1 className="text-2xl font-bold text-slate-800">
          {isEditing ? '编辑证件' : '添加新证件'}
        </h1>
        <p className="text-slate-500 mt-1">
          {isEditing ? '修改证件信息，保持数据最新' : '填写证件信息，开始管理有效期'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 card-shadow">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">选择证件类型</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeChange(type)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                  formData.type === type
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-200 hover:border-primary-300'
                }`}
              >
                <DocumentIcon type={type} className="w-6 h-6" />
                <span className="text-sm font-medium text-slate-700">
                  {DOCUMENT_TYPE_LABELS[type]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 card-shadow space-y-5">
          <h2 className="text-lg font-semibold text-slate-800">基本信息</h2>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <User className="w-4 h-4" />
              持有人
            </label>
            <input
              type="text"
              value={formData.holder}
              onChange={(e) => setFormData(prev => ({ ...prev, holder: e.target.value }))}
              placeholder="如：张三、李四"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Calendar className="w-4 h-4" />
              到期日期
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="longTerm"
                  checked={isLongTerm}
                  onChange={(e) => setIsLongTerm(e.target.checked)}
                  className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                />
                <label htmlFor="longTerm" className="text-sm text-slate-600">
                  长期有效
                </label>
              </div>
              {!isLongTerm && (
                <input
                  type="date"
                  value={formData.expireDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expireDate: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  required={!isLongTerm}
                />
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <MapPin className="w-4 h-4" />
              办理地点
            </label>
            <input
              type="text"
              value={formData.issueLocation}
              onChange={(e) => setFormData(prev => ({ ...prev, issueLocation: e.target.value }))}
              placeholder="如：北京市朝阳区派出所"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Camera className="w-4 h-4" />
              证件照片（可选）
            </label>
            <input
              type="text"
              value={formData.photo}
              onChange={(e) => setFormData(prev => ({ ...prev, photo: e.target.value }))}
              placeholder="输入照片URL或留空"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Bell className="w-4 h-4" />
              提前提醒天数
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="7"
                max="365"
                value={formData.remindDays}
                onChange={(e) => setFormData(prev => ({ ...prev, remindDays: parseInt(e.target.value) }))}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <span className="text-lg font-semibold text-primary-500 min-w-[80px] text-center">
                {formData.remindDays} 天
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              默认提醒：{getReminderDays(formData.type)} 天
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="needReview"
              checked={formData.needAnnualReview}
              onChange={(e) => setFormData(prev => ({ ...prev, needAnnualReview: e.target.checked }))}
              className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
            />
            <label htmlFor="needReview" className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Clock className="w-4 h-4" />
              需要年审
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <FileText className="w-4 h-4" />
              备注
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="记录其他重要信息..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium"
          >
            取消
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {isEditing ? '保存修改' : '添加证件'}
          </button>
        </div>
      </form>
    </div>
  );
}
