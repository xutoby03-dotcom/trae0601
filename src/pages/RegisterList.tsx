import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, User, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import {
  formatCurrency,
  getShiftLabel,
  getShiftColor,
} from '@/utils/format';

export default function RegisterList() {
  const navigate = useNavigate();
  const { registers, fetchRegisters, deleteRegister } = useAppStore();
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchRegisters();
  }, [fetchRegisters]);

  const filtered = registers.filter(
    (r) =>
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      r.managerName.includes(search)
  );

  const handleDelete = async (id: string) => {
    await deleteRegister(id);
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">收银台档案</h1>
          <p className="text-sm text-gray-500 mt-1">管理所有收银台的基础信息</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索编号或负责人..."
              className="pl-9 pr-4 py-2 rounded-lg border border-warm-200 bg-white text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 w-64"
            />
          </div>
          <button
            onClick={() => navigate('/registers/new')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={18} />
            <span className="font-medium">新建收银台</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <User size={48} className="mx-auto mb-3 opacity-50" />
            <div>暂无收银台档案</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-warm-50 text-left text-sm text-gray-600">
                  <th className="px-5 py-3 font-medium">收银台编号</th>
                  <th className="px-5 py-3 font-medium">班次</th>
                  <th className="px-5 py-3 font-medium">默认备用金</th>
                  <th className="px-5 py-3 font-medium">差额阈值</th>
                  <th className="px-5 py-3 font-medium">负责人</th>
                  <th className="px-5 py-3 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-warm-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-semibold text-gray-900">{r.code}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${getShiftColor(r.shift)}`}>
                        {getShiftLabel(r.shift)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-700 font-medium">
                      {formatCurrency(r.defaultAmount)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-amber-600 text-sm">超过 {formatCurrency(r.threshold)} 标红</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {r.managerPhoto ? (
                          <img
                            src={r.managerPhoto}
                            alt={r.managerName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-medium">
                            {r.managerName.charAt(0)}
                          </div>
                        )}
                        <span className="text-gray-700">{r.managerName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/registers/${r.id}/edit`)}
                          className="p-2 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        {confirmDelete === r.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(r.id)}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              确认
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(r.id)}
                            className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
