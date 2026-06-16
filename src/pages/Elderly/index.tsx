import { useEffect, useState } from 'react';
import { Search, Plus, Edit2, Trash2, X, Save, Building, Phone, Heart, Calendar, User, MapPin, FileText } from 'lucide-react';
import { useElderlyStore } from '@/store/elderlyStore';
import { Elderly, PreferredMethod } from '@/types';
import { mockGrids } from '@/data/grids';
import { preferredMethodLabels } from '@/utils/source';
import SourceBadge from '@/components/SourceBadge';

export default function ElderlyPage() {
  const { elderlyList, initElderly, addElderly, updateElderly, deleteElderly } = useElderlyStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [gridFilter, setGridFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingElderly, setEditingElderly] = useState<Elderly | null>(null);
  const [formData, setFormData] = useState<Partial<Elderly>>({
    name: '',
    gender: 'female',
    age: 70,
    building: '',
    unit: '',
    roomNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    chronicDiseases: '',
    preferredCheckMethod: 'phone',
    visitFrequencyDays: 3,
    gridId: 'grid-1',
    avatar: '👵',
    notes: '',
  });

  useEffect(() => {
    initElderly();
  }, [initElderly]);

  const filteredElderly = elderlyList.filter(e => {
    const matchesSearch = e.name.includes(searchTerm) || 
                          e.building.includes(searchTerm) ||
                          e.roomNumber.includes(searchTerm);
    const matchesGrid = gridFilter === 'all' || e.gridId === gridFilter;
    return matchesSearch && matchesGrid;
  });

  const handleOpenModal = (elderly?: Elderly) => {
    if (elderly) {
      setEditingElderly(elderly);
      setFormData(elderly);
    } else {
      setEditingElderly(null);
      setFormData({
        name: '',
        gender: 'female',
        age: 70,
        building: '',
        unit: '',
        roomNumber: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        chronicDiseases: '',
        preferredCheckMethod: 'phone',
        visitFrequencyDays: 3,
        gridId: 'grid-1',
        avatar: '👵',
        notes: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingElderly(null);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.building || !formData.roomNumber) {
      alert('请填写必填信息');
      return;
    }

    if (editingElderly) {
      updateElderly(editingElderly.id, formData);
    } else {
      addElderly(formData as Omit<Elderly, 'id'>);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这位老人的信息吗？')) {
      deleteElderly(id);
    }
  };

  const getGridName = (gridId: string) => {
    return mockGrids.find(g => g.id === gridId)?.name || '未知网格';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索姓名、楼栋、房号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-80 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={gridFilter}
            onChange={(e) => setGridFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
          >
            <option value="all">全部网格</option>
            {mockGrids.map(grid => (
              <option key={grid.id} value={grid.id}>{grid.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <Plus size={20} />
          添加老人
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">老人信息</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">住址</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">紧急联系人</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">慢病备注</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">确认方式</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">上门周期</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">所属网格</th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-slate-700">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredElderly.map((elderly, index) => (
              <tr 
                key={elderly.id} 
                className="hover:bg-slate-50 transition-colors"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{elderly.avatar}</span>
                    <div>
                      <p className="font-semibold text-slate-800">{elderly.name}</p>
                      <p className="text-sm text-slate-500">{elderly.gender === 'female' ? '女' : '男'} · {elderly.age}岁</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin size={16} className="text-slate-400" />
                    <span className="text-sm">{elderly.building} {elderly.unit} {elderly.roomNumber}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{elderly.emergencyContactName}</p>
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Phone size={14} />
                      <span className="font-mono">{elderly.emergencyContactPhone}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {elderly.chronicDiseases ? (
                    <span className="inline-flex items-center gap-1 text-sm text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                      <Heart size={14} />
                      {elderly.chronicDiseases}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">无</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {preferredMethodLabels[elderly.preferredCheckMethod]}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar size={16} className="text-slate-400" />
                    <span className="text-sm">每 {elderly.visitFrequencyDays} 天</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Building size={16} className="text-slate-400" />
                    <span className="text-sm">{getGridName(elderly.gridId)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleOpenModal(elderly)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(elderly.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredElderly.length === 0 && (
          <div className="py-16 text-center">
            <User size={48} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">暂无匹配的老人信息</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-semibold text-slate-800">
                {editingElderly ? '编辑老人信息' : '添加老人信息'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={22} className="text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{formData.avatar}</span>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">头像</label>
                    <div className="flex gap-2">
                      {['👵', '👴', '👩‍🦳', '👨‍🦳'].map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => setFormData({ ...formData, avatar: emoji })}
                          className={`text-2xl p-2 rounded-lg transition-all ${
                            formData.avatar === emoji ? 'bg-blue-100 ring-2 ring-blue-500' : 'hover:bg-slate-100'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">姓名 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="请输入姓名"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">性别</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    >
                      <option value="female">女</option>
                      <option value="male">男</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">年龄</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      min="50"
                      max="120"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">楼栋 *</label>
                  <input
                    type="text"
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="如：1号楼"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">单元</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="如：2单元"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">房号 *</label>
                  <input
                    type="text"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="如：301"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">紧急联系人姓名</label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="如：李小明（儿子）"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">紧急联系人电话</label>
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                    placeholder="请输入联系电话"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <Heart size={16} className="inline mr-1 text-red-500" />
                  慢病备注
                </label>
                <input
                  type="text"
                  value={formData.chronicDiseases}
                  onChange={(e) => setFormData({ ...formData, chronicDiseases: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="如：高血压、糖尿病"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">常用确认方式</label>
                  <select
                    value={formData.preferredCheckMethod}
                    onChange={(e) => setFormData({ ...formData, preferredCheckMethod: e.target.value as PreferredMethod })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="phone">电话确认</option>
                    <option value="family">家属代报</option>
                    <option value="device">智能设备</option>
                    <option value="visit">上门查看</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">上门周期（天）</label>
                  <input
                    type="number"
                    value={formData.visitFrequencyDays}
                    onChange={(e) => setFormData({ ...formData, visitFrequencyDays: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    min="1"
                    max="30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">所属网格</label>
                <select
                  value={formData.gridId}
                  onChange={(e) => setFormData({ ...formData, gridId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  {mockGrids.map(grid => (
                    <option key={grid.id} value={grid.id}>{grid.name} - {grid.managerName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <FileText size={16} className="inline mr-1" />
                  备注
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows={3}
                  placeholder="其他需要注意的事项..."
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-200 sticky bottom-0 bg-white">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {editingElderly ? '保存修改' : '添加老人'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
