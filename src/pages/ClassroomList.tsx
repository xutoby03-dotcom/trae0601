import { useState } from 'react';
import { Building2, Plus, Edit2, Trash2, Clock, User, MapPin } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Modal } from '../components/Modal';
import type { Classroom } from '../types';
import { cn } from '@/lib/utils';

interface ClassroomFormData {
  building: string;
  roomNumber: string;
  seatCount: number;
  openTime: string;
  closeTime: string;
  teacherInCharge: string;
  photoUrl: string;
}

const initialFormData: ClassroomFormData = {
  building: '',
  roomNumber: '',
  seatCount: 30,
  openTime: '18:00',
  closeTime: '22:00',
  teacherInCharge: '',
  photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20classroom%20interior%20with%20desks%20and%20chairs%20bright%20lighting&image_size=landscape_16_9',
};

export default function ClassroomList() {
  const { classrooms, currentRole, addClassroom, updateClassroom, deleteClassroom } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [formData, setFormData] = useState<ClassroomFormData>(initialFormData);

  const handleOpenModal = (classroom?: Classroom) => {
    if (classroom) {
      setEditingClassroom(classroom);
      setFormData({
        building: classroom.building,
        roomNumber: classroom.roomNumber,
        seatCount: classroom.seatCount,
        openTime: classroom.openTime,
        closeTime: classroom.closeTime,
        teacherInCharge: classroom.teacherInCharge,
        photoUrl: classroom.photoUrl,
      });
    } else {
      setEditingClassroom(null);
      setFormData(initialFormData);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClassroom(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClassroom) {
      updateClassroom(editingClassroom.id, formData);
    } else {
      addClassroom(formData);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个教室吗？相关的预约记录也会被清除。')) {
      deleteClassroom(id);
    }
  };

  const isTeacher = currentRole === 'teacher';

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-display mb-2">
            <Building2 className="inline-block w-8 h-8 mr-3 text-primary-500" />
            教室管理
          </h1>
          <p className="text-slate-500">管理晚自习教室档案信息</p>
        </div>
        {isTeacher && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-accent text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            添加教室
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classrooms.map((classroom, index) => (
          <div
            key={classroom.id}
            className="bg-white rounded-2xl shadow-card overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 animate-fade-in group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={classroom.photoUrl}
                alt={`${classroom.building} ${classroom.roomNumber}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold font-display">
                  {classroom.building}
                </h3>
                <p className="text-2xl font-bold">{classroom.roomNumber}室</p>
              </div>
              {isTeacher && (
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenModal(classroom)}
                    className="p-2 bg-white/90 rounded-lg text-primary-600 hover:bg-white transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(classroom.id)}
                    className="p-2 bg-white/90 rounded-lg text-red-600 hover:bg-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-primary-500" />
                <span>{classroom.building} {classroom.roomNumber}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <User className="w-4 h-4 text-primary-500" />
                <span>值班老师：{classroom.teacherInCharge}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Clock className="w-4 h-4 text-primary-500" />
                <span>开放时间：{classroom.openTime} - {classroom.closeTime}</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm text-slate-500">座位数</span>
                <span className="text-2xl font-bold text-primary-600 font-display">
                  {classroom.seatCount}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingClassroom ? '编辑教室' : '添加教室'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                楼栋
              </label>
              <input
                type="text"
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                placeholder="例如：教学楼A"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                房间号
              </label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                placeholder="例如：301"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                座位数
              </label>
              <input
                type="number"
                min="1"
                value={formData.seatCount}
                onChange={(e) => setFormData({ ...formData, seatCount: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                值班老师
              </label>
              <input
                type="text"
                value={formData.teacherInCharge}
                onChange={(e) => setFormData({ ...formData, teacherInCharge: e.target.value })}
                placeholder="例如：张老师"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                开放时间
              </label>
              <input
                type="time"
                value={formData.openTime}
                onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                关闭时间
              </label>
              <input
                type="time"
                value={formData.closeTime}
                onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              教室照片URL
            </label>
            <input
              type="url"
              value={formData.photoUrl}
              onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              required
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-accent text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {editingClassroom ? '保存修改' : '添加教室'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
