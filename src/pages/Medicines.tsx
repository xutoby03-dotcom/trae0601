import { useAppStore } from '@/store/useAppStore';
import MedicineCard from '@/components/Medicine/MedicineCard';
import { Plus, Search, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Medicines() {
  const navigate = useNavigate();
  const { medicines, schedules, deleteMedicine, deleteSchedule } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMedicines = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    if (confirm(`确定要删除药品「${name}」吗？相关医嘱也将一并删除。`)) {
      schedules.filter((s) => s.medicineId === id).forEach((s) => deleteSchedule(s.id));
      deleteMedicine(id);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: '"Noto Serif SC", serif' }}>
            💊 药品管理
          </h1>
          <p className="mt-1 text-gray-600">管理所有药品信息和医嘱计划</p>
        </div>
        <Link
          to="/medicines/new"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          <Plus className="h-5 w-5" />
          添加药品
        </Link>
      </div>

      {medicines.length > 0 && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索药品名称..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
            />
          </div>
        </div>
      )}

      {medicines.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-md border border-emerald-100/60 p-12 text-center">
          <div className="h-20 w-20 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">还没有添加药品</h3>
          <p className="text-gray-600 mb-6">点击上方「添加药品」开始录入老人的药品信息</p>
          <button
            onClick={() => navigate('/medicines/new')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
          >
            <Plus className="h-5 w-5" />
            添加第一个药品
          </button>
        </div>
      ) : filteredMedicines.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-md border border-emerald-100/60 p-12 text-center">
          <p className="text-gray-600">没有找到匹配的药品</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {filteredMedicines.map((medicine, idx) => (
            <div
              key={medicine.id}
              style={{ animation: `fadeInUp 0.5s ease-out ${idx * 0.06}s both` }}
            >
              <MedicineCard
                medicine={medicine}
                schedules={schedules}
                onEdit={() => navigate(`/medicines/${medicine.id}/edit`)}
                onDelete={() => handleDelete(medicine.id, medicine.name)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
