import { useState, useEffect } from 'react';
import { User, Plus, Search, Edit, Trash2, Cake, Phone, Star } from 'lucide-react';
import { api } from '../lib/api.js';
import { useAppStore } from '../store/index.js';
import { PageHeader } from '../components/PageHeader.js';
import { toast } from '../components/Layout.js';
import type { Master } from '../../shared/types.js';

export default function MasterList() {
  const { masters, fetchMasters, fetchAllBasics } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMaster, setEditingMaster] = useState<Master | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    specialty: '',
    remark: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchMasters(),
        fetchAllBasics(),
      ]);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredMasters = masters.filter(m =>
    !searchText ||
    m.name.toLowerCase().includes(searchText.toLowerCase()) ||
    m.phone.includes(searchText) ||
    m.specialty?.toLowerCase().includes(searchText.toLowerCase())
  );

  const openEditForm = (master: Master) => {
    setEditingMaster(master);
    setFormData({
      name: master.name,
      phone: master.phone || '',
      specialty: master.specialty || '',
      remark: master.remark || '',
    });
    setShowForm(true);
  };

  const openAddForm = () => {
    setEditingMaster(null);
    setFormData({
      name: '',
      phone: '',
      specialty: '',
      remark: '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('请输入师傅姓名');
      return;
    }

    setSaving(true);
    try {
      if (editingMaster) {
        await api.masters.update(editingMaster.id, formData);
        toast.success('师傅信息更新成功');
      } else {
        await api.masters.create(formData);
        toast.success('师傅添加成功');
      }
      await fetchMasters();
      setShowForm(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除师傅「${name}」吗？删除后相关借用记录会保留。`)) {
      return;
    }

    try {
      await api.masters.delete(id);
      toast.success('删除成功');
      await fetchMasters();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="bg-white rounded-2xl shadow-lg p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="师傅管理"
        subtitle="管理烘焙师傅信息"
        icon={<User className="w-6 h-6" />}
        actions={
          <button
            onClick={openAddForm}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-caramel-500 to-caramel-600 text-white rounded-xl font-medium hover:from-caramel-600 hover:to-caramel-700 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            添加师傅
          </button>
        }
      />

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索师傅姓名、电话、专长..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-bold text-caramel-900">
                {editingMaster ? '编辑师傅' : '添加师傅'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    姓名 <span className="text-tomato-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="请输入师傅姓名"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2 text-caramel-600" />
                    联系电话
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="请输入联系电话"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Star className="w-4 h-4 inline mr-2 text-caramel-600" />
                    专长
                  </label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                    placeholder="例如：吐司、蛋糕、面包"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
                  <textarea
                    value={formData.remark}
                    onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
                    placeholder="其他需要记录的信息..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors border border-gray-200 rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving || !formData.name.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-caramel-500 to-caramel-600 text-white rounded-xl font-medium hover:from-caramel-600 hover:to-caramel-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMasters.length > 0 ? (
          filteredMasters.map((master: Master) => (
            <div
              key={master.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-caramel-400 to-caramel-600 rounded-full flex items-center justify-center text-white text-2xl font-serif font-bold shadow-lg">
                    {master.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">{master.name}</h3>
                    {master.specialty && (
                      <div className="flex items-center gap-1 text-sm text-caramel-600">
                        <Star className="w-4 h-4" />
                        <span>{master.specialty}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditForm(master)}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="编辑"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(master.id, master.name)}
                    className="p-2 text-gray-400 hover:text-tomato-500 hover:bg-tomato-50 rounded-lg transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {master.phone && (
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{master.phone}</span>
                </div>
              )}
              
              {master.remark && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
                  {master.remark}
                </div>
              )}
              
              <div className="mt-4 flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 bg-caramel-50 text-caramel-700 rounded text-xs">
                  <Cake className="w-3 h-3" />
                  <span>借用 {master.borrowCount || 0} 次</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16 text-gray-400">
            <User className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无师傅信息</h3>
            <p className="mb-6">点击右上角按钮添加第一位师傅</p>
            <button
              onClick={openAddForm}
              className="inline-flex items-center gap-2 px-6 py-3 bg-caramel-500 text-white rounded-xl font-medium hover:bg-caramel-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              添加师傅
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
