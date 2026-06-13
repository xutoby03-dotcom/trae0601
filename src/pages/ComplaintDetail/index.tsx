import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useComplaintStore } from '@/store/useComplaintStore';
import { NOISE_TYPE_LABELS } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import Timeline from '@/components/Timeline';
import { formatDateTime, getDuration, formatDuration } from '@/utils/dateUtils';
import {
  ArrowLeft,
  Building2,
  Clock,
  User,
  Phone,
  FileText,
  Image,
  Mic,
  Play,
  Pause,
  CheckCircle,
  Loader2,
  Edit3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessFormData {
  contactPerson: string;
  persuasionResult: string;
  needHomeVisit: boolean;
  promisedTime: string;
  remark: string;
}

const initialFormData: ProcessFormData = {
  contactPerson: '',
  persuasionResult: '',
  needHomeVisit: false,
  promisedTime: '',
  remark: '',
};

export default function ComplaintDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const complaint = useComplaintStore((state) => state.getComplaintById(id || ''));
  const addProcessRecord = useComplaintStore((state) => state.addProcessRecord);
  const completeVisit = useComplaintStore((state) => state.completeVisit);

  const [showProcessForm, setShowProcessForm] = useState(false);
  const [formData, setFormData] = useState<ProcessFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof ProcessFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!complaint) {
      navigate('/complaints');
    }
  }, [complaint, navigate]);

  if (!complaint) return null;

  const processingTime = complaint.processRecords.length > 0
    ? getDuration(complaint.createdAt, complaint.processRecords[complaint.processRecords.length - 1].actualVisitTime || new Date().toISOString())
    : getDuration(complaint.createdAt, new Date().toISOString());

  const latestRecord = complaint.processRecords[complaint.processRecords.length - 1];
  const canComplete = latestRecord && !latestRecord.actualVisitTime;

  const handleInputChange = (field: keyof ProcessFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof ProcessFormData]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProcessFormData, string>> = {};

    if (!formData.contactPerson.trim()) newErrors.contactPerson = '请输入联系对象';
    if (!formData.persuasionResult.trim()) newErrors.persuasionResult = '请输入劝阻结果';
    if (!formData.promisedTime) newErrors.promisedTime = '请选择承诺整改时间';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !complaint) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    addProcessRecord(complaint.id, {
      contactPerson: formData.contactPerson,
      persuasionResult: formData.persuasionResult,
      needHomeVisit: formData.needHomeVisit,
      promisedTime: new Date(formData.promisedTime).toISOString(),
      remark: formData.remark,
    });

    setIsSubmitting(false);
    setShowProcessForm(false);
    setFormData(initialFormData);
  };

  const handleCompleteVisit = async () => {
    if (!complaint || !latestRecord) return;
    completeVisit(complaint.id, latestRecord.id);
  };

  const toggleAudio = (url: string) => {
    if (playingAudio === url) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(url);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        返回列表
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {complaint.building} {complaint.unit}
                  </h1>
                  <p className="text-slate-400 text-sm">投诉编号：{complaint.id}</p>
                </div>
              </div>
              <StatusBadge status={complaint.status} pulse={complaint.status === 'overdue'} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-700/30 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">噪音类型</div>
                <div className="text-white font-medium">{NOISE_TYPE_LABELS[complaint.noiseType]}</div>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">时间段</div>
                <div className="text-white font-medium">{complaint.timePeriod}</div>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">投诉时间</div>
                <div className="text-white font-medium text-sm">{formatDateTime(complaint.createdAt)}</div>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">处理时长</div>
                <div className="text-white font-medium">{formatDuration(processingTime)}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">投诉描述</h3>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-200">{complaint.description}</p>
                </div>
              </div>

              {complaint.attachments.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-3">附件资料</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {complaint.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="bg-slate-700/30 rounded-xl overflow-hidden group"
                      >
                        {attachment.type === 'image' ? (
                          <div
                            onClick={() => setSelectedImage(attachment.url)}
                            className="aspect-square relative cursor-pointer"
                          >
                            <img
                              src={attachment.url}
                              alt={attachment.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                              <Image className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ) : (
                          <div className="p-4">
                            <button
                              onClick={() => toggleAudio(attachment.url)}
                              className="w-full flex items-center gap-3 p-3 bg-slate-600/50 hover:bg-slate-600 rounded-xl transition-colors"
                            >
                              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                {playingAudio === attachment.url ? (
                                  <Pause className="w-5 h-5 text-purple-400" />
                                ) : (
                                  <Play className="w-5 h-5 text-purple-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">{attachment.name}</p>
                                <p className="text-xs text-slate-400">
                                  {(attachment.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </button>
                            {playingAudio === attachment.url && (
                              <audio src={attachment.url} autoPlay onEnded={() => setPlayingAudio(null)} />
                            )}
                          </div>
                        )}
                        <div className="p-2">
                          <p className="text-xs text-slate-400 truncate">{attachment.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                处理记录
              </h2>
              {canComplete && (
                <button
                  onClick={handleCompleteVisit}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-medium text-white transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  标记已回访
                </button>
              )}
            </div>
            <Timeline records={complaint.processRecords} />
          </div>

          {showProcessForm && (
            <div className="bg-slate-800/50 rounded-2xl border border-blue-500/30 p-6 animate-fadeIn">
              <h2 className="text-lg font-semibold text-white mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                添加处理记录
              </h2>
              <form onSubmit={handleSubmitProcess} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      联系对象 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="如：业主本人、租户、装修负责人等"
                      value={formData.contactPerson}
                      onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                      className={cn(
                        'w-full px-4 py-2.5 bg-slate-700/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors',
                        errors.contactPerson ? 'border-red-500' : 'border-slate-600'
                      )}
                    />
                    {errors.contactPerson && <p className="mt-1 text-sm text-red-400">{errors.contactPerson}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      承诺整改时间 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.promisedTime}
                      onChange={(e) => handleInputChange('promisedTime', e.target.value)}
                      className={cn(
                        'w-full px-4 py-2.5 bg-slate-700/50 border rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors',
                        errors.promisedTime ? 'border-red-500' : 'border-slate-600'
                      )}
                    />
                    {errors.promisedTime && <p className="mt-1 text-sm text-red-400">{errors.promisedTime}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    劝阻结果 <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="请描述劝阻的具体情况和对方的回应..."
                    value={formData.persuasionResult}
                    onChange={(e) => handleInputChange('persuasionResult', e.target.value)}
                    className={cn(
                      'w-full px-4 py-2.5 bg-slate-700/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none',
                      errors.persuasionResult ? 'border-red-500' : 'border-slate-600'
                    )}
                  />
                  {errors.persuasionResult && <p className="mt-1 text-sm text-red-400">{errors.persuasionResult}</p>}
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.needHomeVisit}
                      onChange={(e) => handleInputChange('needHomeVisit', e.target.checked)}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className="text-slate-300">需要上门处理</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">备注</label>
                  <textarea
                    rows={2}
                    placeholder="其他需要记录的信息..."
                    value={formData.remark}
                    onChange={(e) => handleInputChange('remark', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/50">
                  <button
                    type="button"
                    onClick={() => setShowProcessForm(false)}
                    className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium text-white transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        提交中...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        提交记录
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
            <h3 className="text-sm font-medium text-slate-400 mb-4">投诉人信息</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">姓名</p>
                  <p className="text-white font-medium">{complaint.complainant}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">联系电话</p>
                  <p className="text-white font-medium">{complaint.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {!showProcessForm && complaint.status !== 'completed' && (
            <button
              onClick={() => setShowProcessForm(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all"
            >
              <Edit3 className="w-5 h-5" />
              添加处理记录
            </button>
          )}

          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
            <h3 className="text-sm font-medium text-slate-400 mb-4">处理进度</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">投诉已登记</p>
                  <p className="text-xs text-slate-500">{formatDateTime(complaint.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  complaint.processRecords.length > 0 ? 'bg-emerald-500/20' : 'bg-slate-700/50'
                )}>
                  <FileText className={cn(
                    'w-4 h-4',
                    complaint.processRecords.length > 0 ? 'text-emerald-400' : 'text-slate-500'
                  )} />
                </div>
                <div className="flex-1">
                  <p className={cn(
                    'text-sm',
                    complaint.processRecords.length > 0 ? 'text-white' : 'text-slate-500'
                  )}>
                    已联系处理
                  </p>
                  {complaint.processRecords.length > 0 && (
                    <p className="text-xs text-slate-500">
                      {formatDateTime(complaint.processRecords[0].createdAt)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  complaint.status === 'completed' ? 'bg-emerald-500/20' : 'bg-slate-700/50'
                )}>
                  <CheckCircle className={cn(
                    'w-4 h-4',
                    complaint.status === 'completed' ? 'text-emerald-400' : 'text-slate-500'
                  )} />
                </div>
                <div className="flex-1">
                  <p className={cn(
                    'text-sm',
                    complaint.status === 'completed' ? 'text-white' : 'text-slate-500'
                  )}>
                    已完成回访
                  </p>
                  {complaint.status === 'completed' && latestRecord?.actualVisitTime && (
                    <p className="text-xs text-slate-500">
                      {formatDateTime(latestRecord.actualVisitTime)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full transition-colors"
          >
            <Play className="w-6 h-6 text-white rotate-45" />
          </button>
        </div>
      )}
    </div>
  );
}
