import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Car,
  CheckCircle,
  AlertTriangle,
  Check,
  Plus,
  Edit3,
  FileText,
  Pill,
  Stethoscope,
  Hospital,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import type { VisitRecord } from '@/types';

export default function VisitDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { visits, patients, records, toggleMaterial, confirmVisit, completeVisit, addRecord, updateRecord } = useStore();

  const visit = visits.find((v) => v.id === id);
  const patient = patients.find((p) => p.id === visit?.patientId);
  const record = records.find((r) => r.visitId === id);

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordForm, setRecordForm] = useState<Omit<VisitRecord, 'id'>>({
    visitId: id || '',
    advice: '',
    nextVisit: '',
    dosageChange: '',
  });

  if (!visit) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">未找到该复诊记录</p>
        <Link to="/visits" className="btn-primary mt-4 inline-block">
          返回列表
        </Link>
      </div>
    );
  }

  const allPrepared = visit.materials.every((m) => m.prepared);
  const preparedCount = visit.materials.filter((m) => m.prepared).length;
  const totalMaterials = visit.materials.length;
  const progress = totalMaterials > 0 ? (preparedCount / totalMaterials) * 100 : 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleConfirm = () => {
    if (!allPrepared) {
      alert('材料未全部准备齐全，无法确认就诊！请先勾选所有材料。');
      return;
    }
    if (confirm('确认由您陪同此次复诊吗？')) {
      confirmVisit(visit.id);
    }
  };

  const handleComplete = () => {
    if (confirm('确定标记此次复诊为已完成吗？')) {
      completeVisit(visit.id);
      setIsRecordModalOpen(true);
      if (record) {
        setRecordForm(record);
      }
    }
  };

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (record) {
      updateRecord(record.id, recordForm);
    } else {
      addRecord(recordForm);
    }
    setIsRecordModalOpen(false);
  };

  const isUpcoming = visit.status !== 'completed' && visit.status !== 'cancelled';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回
      </button>

      <div className="card overflow-hidden">
        <div className={`p-6 ${isUpcoming && !allPrepared ? 'bg-gradient-to-r from-amber-50 to-orange-50' : isUpcoming ? 'bg-gradient-to-r from-secondary-50 to-teal-50' : 'bg-gradient-to-r from-green-50 to-emerald-50'}`}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {patient && (
                <img
                  src={patient.avatar}
                  alt={patient.name}
                  className="w-16 h-16 rounded-2xl bg-white shadow-sm"
                />
              )}
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-800">{visit.department}</h1>
                  <StatusBadge status={visit.status} />
                </div>
                {patient && (
                  <p className="text-gray-600 mt-1">
                    {patient.name} · {patient.disease}
                  </p>
                )}
              </div>
            </div>

            {isUpcoming && (
              <div className="text-right">
                <p className="text-sm text-gray-500">材料准备进度</p>
                <p className="text-2xl font-bold text-gray-800">
                  {preparedCount}/{totalMaterials}
                </p>
                <div className="w-32 h-2 bg-white/60 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      allPrepared ? 'bg-green-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl">
            <Calendar className="w-5 h-5 text-primary-500" />
            <div>
              <p className="text-xs text-gray-500">就诊时间</p>
              <p className="text-sm font-medium text-gray-800">
                {formatDate(visit.visitTime)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl">
            <User className="w-5 h-5 text-secondary-500" />
            <div>
              <p className="text-xs text-gray-500">陪同人</p>
              <p className="text-sm font-medium text-gray-800">
                {visit.companion || '待分配'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl">
            <Car className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-xs text-gray-500">交通方式</p>
              <p className="text-sm font-medium text-gray-800">{visit.transport}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl">
            <Hospital className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-xs text-gray-500">医院</p>
              <p className="text-sm font-medium text-gray-800 truncate">
                {patient?.hospital || '-'}
              </p>
            </div>
          </div>
        </div>

        {visit.checkItems && (
          <div className="px-6 pb-6">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-start gap-3">
                <Stethoscope className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">检查项目</p>
                  <p className="text-sm text-blue-700 mt-1">{visit.checkItems}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-500" />
            携带材料清单
          </h2>
          {allPrepared ? (
            <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              全部准备完毕
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-600 text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />
              还有 {totalMaterials - preparedCount} 项未准备
            </span>
          )}
        </div>

        <div className="space-y-3">
          {visit.materials.map((material) => (
            <div
              key={material.id}
              onClick={() => isUpcoming && toggleMaterial(visit.id, material.id)}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                isUpcoming ? 'cursor-pointer hover:bg-warm-50' : ''
              } ${
                material.prepared
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-warm-50 border border-warm-200'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                  material.prepared
                    ? 'bg-green-500 text-white scale-110'
                    : 'bg-white border-2 border-warm-300'
                }`}
              >
                {material.prepared && <Check className="w-4 h-4" />}
              </div>
              <span
                className={`flex-1 font-medium transition-all duration-200 ${
                  material.prepared
                    ? 'text-green-700 line-through opacity-75'
                    : 'text-gray-700'
                }`}
              >
                {material.name}
              </span>
              <span
                className={`text-sm font-medium ${
                  material.prepared ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {material.prepared ? '已准备' : '未准备'}
              </span>
            </div>
          ))}
        </div>

        {isUpcoming && (
          <p className="mt-4 text-sm text-gray-500 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            点击材料项可以切换准备状态，全部准备完成后才能确认就诊
          </p>
        )}
      </div>

      {isUpcoming && (
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">确认陪同</h3>
              <p className="text-sm text-gray-500 mt-1">
                确认您将陪同此次复诊，请确保所有材料已准备齐全
              </p>
            </div>
            <button
              onClick={handleConfirm}
              disabled={!allPrepared || visit.confirmed}
              className={`btn-primary ${
                !allPrepared || visit.confirmed
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              {visit.confirmed ? '已确认陪同' : '确认陪同就诊'}
            </button>
          </div>
        </div>
      )}

      {visit.status === 'completed' && record && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Pill className="w-5 h-5 text-secondary-500" />
            复诊记录
          </h2>

          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-sm font-medium text-green-800 mb-2">医嘱</p>
              <p className="text-green-700">{record.advice}</p>
            </div>

            {record.nextVisit && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <Calendar className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-blue-800">下次复诊</p>
                  <p className="text-blue-700">{record.nextVisit}</p>
                </div>
              </div>
            )}

            {record.dosageChange && (
              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <Pill className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-amber-800">药量变化</p>
                  <p className="text-amber-700">{record.dosageChange}</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setRecordForm(record);
              setIsRecordModalOpen(true);
            }}
            className="mt-4 text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <Edit3 className="w-4 h-4" />
            编辑记录
          </button>
        </div>
      )}

      {isUpcoming && (
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button onClick={handleComplete} className="btn-secondary">
            标记为已完成
          </button>
        </div>
      )}

      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="填写复诊记录"
        size="lg"
      >
        <form onSubmit={handleRecordSubmit} className="space-y-4">
          <div>
            <label className="label">医嘱</label>
            <textarea
              className="input min-h-[100px] resize-none"
              value={recordForm.advice}
              onChange={(e) => setRecordForm({ ...recordForm, advice: e.target.value })}
              placeholder="医生的诊断和建议"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="label">下次复诊时间</label>
            <input
              type="date"
              className="input"
              value={recordForm.nextVisit}
              onChange={(e) => setRecordForm({ ...recordForm, nextVisit: e.target.value })}
            />
          </div>

          <div>
            <label className="label">药量变化</label>
            <textarea
              className="input min-h-[80px] resize-none"
              value={recordForm.dosageChange}
              onChange={(e) => setRecordForm({ ...recordForm, dosageChange: e.target.value })}
              placeholder="用药剂量的调整变化"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(false)}
              className="btn-outline"
            >
              取消
            </button>
            <button type="submit" className="btn-primary">
              保存记录
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
