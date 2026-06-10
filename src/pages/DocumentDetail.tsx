import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit, Trash2, Calendar, MapPin, User, FileText, Camera,
  Clock, Bell, CheckCircle, Circle, Plus, X, AlertTriangle, CalendarCheck,
  FileCheck, Package, Award
} from 'lucide-react';
import { useDocumentStore } from '@/store/documentStore';
import { DocumentIcon } from '@/components/DocumentIcon';
import { StatusBadge } from '@/components/StatusBadge';
import {
  DOCUMENT_TYPE_LABELS, PROCESS_STATUS_LABELS
} from '@/types';
import type { ProcessStatus, Material } from '@/types';
import {
  getDocumentStatus, formatExpiryDisplay, formatDate, getDaysUntilExpiry
} from '@/utils/dateUtils';

const PROCESS_STEPS: { status: ProcessStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'appointment', label: '已预约', icon: <CalendarCheck className="w-5 h-5" /> },
  { status: 'submitted', label: '已提交材料', icon: <FileCheck className="w-5 h-5" /> },
  { status: 'waiting', label: '等待领取', icon: <Package className="w-5 h-5" /> },
  { status: 'completed', label: '已拿到', icon: <Award className="w-5 h-5" /> },
];

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    getDocumentById, updateDocument, deleteDocument,
    getMaterialsByDocumentId, toggleMaterial, addMaterial, deleteMaterial,
    updateProcessStatus
  } = useDocumentStore();

  const document = id ? getDocumentById(id) : null;
  const materials = id ? getMaterialsByDocumentId(id) : [];

  const [newMaterialName, setNewMaterialName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!document || !id) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
        <p className="text-slate-600 mb-4">证件不存在</p>
        <button
          onClick={() => navigate('/')}
          className="text-primary-500 hover:underline"
        >
          返回首页
        </button>
      </div>
    );
  }

  const status = getDocumentStatus(document);
  const expiryInfo = formatExpiryDisplay(document.expireDate);
  const daysUntil = getDaysUntilExpiry(document.expireDate);
  const currentStepIndex = PROCESS_STEPS.findIndex(s => s.status === document.processStatus);

  const handleDelete = () => {
    deleteDocument(id);
    navigate('/');
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMaterialName.trim()) {
      addMaterial(id, newMaterialName.trim());
      setNewMaterialName('');
    }
  };

  const getStepStatus = (index: number) => {
    if (document.processStatus === 'not_started') return 'pending';
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return 'current';
    return 'pending';
  };

  const handleStepClick = (status: ProcessStatus, index: number) => {
    if (document.processStatus === 'completed' && index < 3) {
      updateProcessStatus(id, status);
    } else if (document.processStatus === 'not_started') {
      updateProcessStatus(id, 'appointment');
    } else if (index <= currentStepIndex + 1 || index <= currentStepIndex) {
      updateProcessStatus(id, status);
    }
  };

  const handleResetProgress = () => {
    updateProcessStatus(id, 'not_started');
  };

  const readyCount = materials.filter(m => m.isReady).length;
  const totalMaterials = materials.length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-primary-500 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <DocumentIcon type={document.type} className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {DOCUMENT_TYPE_LABELS[document.type]}
              </h1>
              <p className="text-slate-500">持有人：{document.holder}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={status} />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800">基本信息</h2>
            <div className="flex gap-2">
              <Link
                to={`/edit/${id}`}
                className="p-2 text-slate-500 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <Edit className="w-5 h-5" />
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <User className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">持有人</p>
                <p className="font-medium text-slate-800">{document.holder}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <Calendar className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">到期日期</p>
                <p className={`font-medium ${expiryInfo.colorClass}`}>
                  {expiryInfo.text}
                </p>
              </div>
            </div>

            {document.issueLocation && (
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">办理地点</p>
                  <p className="font-medium text-slate-800">{document.issueLocation}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <Bell className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">提前提醒</p>
                <p className="font-medium text-slate-800">{document.remindDays} 天</p>
              </div>
            </div>

            {document.needAnnualReview && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-amber-600">需要年审</p>
                  <p className="font-medium text-amber-800">请注意年审时间</p>
                </div>
              </div>
            )}

            {document.photo && (
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <Camera className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">证件照片</p>
                  <p className="font-medium text-slate-800 truncate max-w-[150px]">
                    {document.photo}
                  </p>
                </div>
              </div>
            )}
          </div>

          {document.notes && (
            <div className="mt-4 p-4 bg-primary-50 rounded-xl">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-primary-600 mb-1">备注</p>
                  <p className="text-slate-700">{document.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800">办理进度</h2>
            {document.processStatus !== 'not_started' && (
              <button
                onClick={handleResetProgress}
                className="text-sm text-slate-500 hover:text-red-500 transition-colors"
              >
                重置进度
              </button>
            )}
          </div>

          {document.processStatus === 'not_started' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 mb-4">尚未开始办理</p>
              <button
                onClick={() => updateProcessStatus(id, 'appointment')}
                className="px-6 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium"
              >
                开始办理
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute top-6 left-0 right-0 h-1 bg-slate-200 mx-8">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{
                    width: `${Math.max(0, currentStepIndex * 33.33)}%`
                  }}
                />
              </div>

              <div className="flex justify-between relative">
                {PROCESS_STEPS.map((step, index) => {
                  const stepStatus = getStepStatus(index);
                  const isClickable = document.processStatus === 'completed'
                    ? index <= 3
                    : index <= currentStepIndex + 1;

                  return (
                    <button
                      key={step.status}
                      onClick={() => isClickable && handleStepClick(step.status, index)}
                      disabled={!isClickable}
                      className={`flex flex-col items-center relative z-10 ${
                        isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                          stepStatus === 'completed'
                            ? 'bg-green-500 text-white'
                            : stepStatus === 'current'
                            ? 'bg-primary-500 text-white ring-4 ring-primary-100 animate-pulse'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {stepStatus === 'completed' ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          step.icon
                        )}
                      </div>
                      <span
                        className={`mt-2 text-xs font-medium text-center max-w-[80px] ${
                          stepStatus === 'completed' || stepStatus === 'current'
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">材料清单</h2>
              <p className="text-sm text-slate-500">
                已备齐 {readyCount}/{totalMaterials} 项
              </p>
            </div>
          </div>

          {totalMaterials > 0 && (
            <div className="h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                style={{ width: `${totalMaterials > 0 ? (readyCount / totalMaterials) * 100 : 0}%` }}
              />
            </div>
          )}

          <div className="space-y-2 mb-4">
            {materials.map((material) => (
              <MaterialItem
                key={material.id}
                material={material}
                onToggle={() => toggleMaterial(material.id)}
                onDelete={() => deleteMaterial(material.id)}
              />
            ))}
          </div>

          <form onSubmit={handleAddMaterial} className="flex gap-2">
            <input
              type="text"
              value={newMaterialName}
              onChange={(e) => setNewMaterialName(e.target.value)}
              placeholder="添加新材料..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!newMaterialName.trim()}
              className="px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              添加
            </button>
          </form>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">确认删除</h3>
                <p className="text-sm text-slate-500">此操作不可撤销</p>
              </div>
            </div>
            <p className="text-slate-600 mb-6">
              确定要删除这个{DOCUMENT_TYPE_LABELS[document.type]}吗？
              相关的材料清单也会被一并删除。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MaterialItem({
  material,
  onToggle,
  onDelete
}: {
  material: Material;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
        material.isReady ? 'bg-green-50' : 'bg-slate-50 hover:bg-slate-100'
      }`}
    >
      <button
        onClick={onToggle}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
          material.isReady
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-slate-300 hover:border-primary-400'
        }`}
      >
        {material.isReady && <CheckCircle className="w-4 h-4" />}
      </button>
      <span
        className={`flex-1 ${
          material.isReady ? 'text-slate-500 line-through' : 'text-slate-700'
        }`}
      >
        {material.name}
      </span>
      <button
        onClick={onDelete}
        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
