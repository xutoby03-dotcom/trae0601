import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, User, Hospital, Stethoscope, Pill, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import Modal from '@/components/Modal';
import type { Patient } from '@/types';

const emptyPatient: Omit<Patient, 'id'> = {
  name: '',
  disease: '',
  hospital: '',
  doctor: '',
  medicationNotes: '',
  avatar: '',
};

export default function PatientList() {
  const { patients, addPatient, updatePatient, deletePatient } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<Omit<Patient, 'id'>>(emptyPatient);

  const handleOpenAdd = () => {
    setEditingPatient(null);
    setFormData(emptyPatient);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData(patient);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const avatarUrl = formData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`;
    const patientData = { ...formData, avatar: avatarUrl };

    if (editingPatient) {
      updatePatient(editingPatient.id, patientData);
    } else {
      addPatient(patientData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这位就诊人吗？相关的复诊记录也会被删除。')) {
      deletePatient(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">就诊人档案</h2>
          <p className="text-gray-500 mt-1">管理家人的健康档案信息</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          添加就诊人
        </button>
      </div>

      {patients.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-warm-100 flex items-center justify-center">
            <User className="w-10 h-10 text-warm-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">还没有就诊人档案</h3>
          <p className="text-gray-500 mb-4">添加第一位就诊人开始管理复诊安排</p>
          <button onClick={handleOpenAdd} className="btn-primary">
            添加就诊人
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {patients.map((patient) => (
            <div key={patient.id} className="card card-hover overflow-hidden">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <img
                    src={patient.avatar}
                    alt={patient.name}
                    className="w-16 h-16 rounded-2xl bg-warm-100 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{patient.name}</h3>
                        <span className="tag bg-primary-100 text-primary-700 mt-1">
                          {patient.disease}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Hospital className="w-4 h-4 text-secondary-500" />
                    <span className="truncate">{patient.hospital}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Stethoscope className="w-4 h-4 text-primary-500" />
                    <span>{patient.doctor}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Pill className="w-4 h-4 text-amber-500 mt-0.5" />
                    <span className="line-clamp-2">{patient.medicationNotes || '暂无用药备注'}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-warm-100 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenEdit(patient)}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(patient.id)}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    删除
                  </button>
                  <Link
                    to={`/patients/${patient.id}`}
                    className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    查看详情
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPatient ? '编辑就诊人' : '添加就诊人'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">姓名</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入姓名"
                required
              />
            </div>
            <div>
              <label className="label">疾病</label>
              <input
                type="text"
                className="input"
                value={formData.disease}
                onChange={(e) => setFormData({ ...formData, disease: e.target.value })}
                placeholder="如：高血压、糖尿病"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">常去医院</label>
              <input
                type="text"
                className="input"
                value={formData.hospital}
                onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                placeholder="医院名称"
                required
              />
            </div>
            <div>
              <label className="label">主治医生</label>
              <input
                type="text"
                className="input"
                value={formData.doctor}
                onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                placeholder="医生姓名"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">用药备注</label>
            <textarea
              className="input min-h-[80px] resize-none"
              value={formData.medicationNotes}
              onChange={(e) => setFormData({ ...formData, medicationNotes: e.target.value })}
              placeholder="用药时间、剂量、注意事项等"
              rows={3}
            />
          </div>

          <div>
            <label className="label">头像链接（可选）</label>
            <input
              type="text"
              className="input"
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              placeholder="留空将自动生成头像"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-outline"
            >
              取消
            </button>
            <button type="submit" className="btn-primary">
              {editingPatient ? '保存修改' : '添加'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
