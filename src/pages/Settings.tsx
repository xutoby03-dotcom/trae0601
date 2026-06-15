import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Leaf, Clock, Droplets, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { useBatchStore } from '@/store/useBatchStore';
import { Tea } from '@/types';

export default function Settings() {
  const { teas, initData, addTea, updateTea, deleteTea } = useBatchStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    brewDurationMinutes: 180,
    teaToWaterRatio: 5,
    shelfLifeHours: 12,
    color: '#4A7C59',
    icon: 'Leaf',
  });
  
  useEffect(() => {
    if (!useBatchStore.getState().initialized) {
      initData();
    }
  }, [initData]);
  
  const resetForm = () => {
    setFormData({
      name: '',
      brewDurationMinutes: 180,
      teaToWaterRatio: 5,
      shelfLifeHours: 12,
      color: '#4A7C59',
      icon: 'Leaf',
    });
  };
  
  const handleAdd = () => {
    if (!formData.name.trim()) return;
    
    addTea(formData);
    setShowAddForm(false);
    resetForm();
  };
  
  const handleEdit = (tea: Tea) => {
    setEditingId(tea.id);
    setFormData({
      name: tea.name,
      brewDurationMinutes: tea.brewDurationMinutes,
      teaToWaterRatio: tea.teaToWaterRatio,
      shelfLifeHours: tea.shelfLifeHours,
      color: tea.color,
      icon: tea.icon,
    });
  };
  
  const handleSaveEdit = () => {
    if (!editingId || !formData.name.trim()) return;
    
    updateTea(editingId, formData);
    setEditingId(null);
    resetForm();
  };
  
  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个茶叶品种吗？')) {
      deleteTea(id);
    }
  };
  
  const colorOptions = [
    '#4A7C59', '#D4A574', '#E8B86D', '#C17F59', '#E07A5F',
    '#6B8E23', '#8B4513', '#CD853F', '#BC8F8F', '#708090',
  ];
  
  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-white/80 backdrop-blur-md border-b border-cream-200 sticky top-0 z-30">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-500 text-white flex items-center justify-center shadow-md shadow-gray-200">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 font-serif">基础设置</h1>
              <p className="text-xs text-gray-500">Settings & Configuration</p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container py-6 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-matcha-500" />
              <h2 className="text-lg font-bold text-gray-800 font-serif">茶叶品种管理</h2>
            </div>
            <button
              onClick={() => {
                setShowAddForm(true);
                resetForm();
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-matcha-500 text-white rounded-xl text-sm font-medium hover:bg-matcha-600 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              添加品种
            </button>
          </div>
          
          {showAddForm && (
            <div className="mb-6 p-4 bg-cream-50 rounded-xl border border-cream-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4">添加新茶叶品种</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">茶叶名称</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="如：茉莉绿茶"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-matcha-400 focus:ring-2 focus:ring-matcha-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    <Clock className="w-3 h-3 inline mr-1" />
                    浸泡时长(分钟)
                  </label>
                  <input
                    type="number"
                    value={formData.brewDurationMinutes}
                    onChange={(e) => setFormData({ ...formData, brewDurationMinutes: Number(e.target.value) })}
                    min={30}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-matcha-400 focus:ring-2 focus:ring-matcha-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    <Droplets className="w-3 h-3 inline mr-1" />
                    茶水比(g/L)
                  </label>
                  <input
                    type="number"
                    value={formData.teaToWaterRatio}
                    onChange={(e) => setFormData({ ...formData, teaToWaterRatio: Number(e.target.value) })}
                    min={1}
                    step={0.5}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-matcha-400 focus:ring-2 focus:ring-matcha-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    <Clock className="w-3 h-3 inline mr-1" />
                    安全售卖(小时)
                  </label>
                  <input
                    type="number"
                    value={formData.shelfLifeHours}
                    onChange={(e) => setFormData({ ...formData, shelfLifeHours: Number(e.target.value) })}
                    min={1}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-matcha-400 focus:ring-2 focus:ring-matcha-100 outline-none"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-2">标识颜色</label>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-lg transition-all ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-matcha-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 text-white bg-matcha-500 rounded-lg text-sm hover:bg-matcha-600 transition-colors flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  确认添加
                </button>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            {teas.map((tea) => (
              <div
                key={tea.id}
                className="p-4 bg-cream-50 rounded-xl border border-cream-100 hover:border-cream-200 transition-colors"
              >
                {editingId === tea.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">茶叶名称</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-matcha-400 focus:ring-2 focus:ring-matcha-100 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">浸泡时长(分钟)</label>
                        <input
                          type="number"
                          value={formData.brewDurationMinutes}
                          onChange={(e) => setFormData({ ...formData, brewDurationMinutes: Number(e.target.value) })}
                          min={30}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-matcha-400 focus:ring-2 focus:ring-matcha-100 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">茶水比(g/L)</label>
                        <input
                          type="number"
                          value={formData.teaToWaterRatio}
                          onChange={(e) => setFormData({ ...formData, teaToWaterRatio: Number(e.target.value) })}
                          min={1}
                          step={0.5}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-matcha-400 focus:ring-2 focus:ring-matcha-100 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">安全售卖(小时)</label>
                        <input
                          type="number"
                          value={formData.shelfLifeHours}
                          onChange={(e) => setFormData({ ...formData, shelfLifeHours: Number(e.target.value) })}
                          min={1}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-matcha-400 focus:ring-2 focus:ring-matcha-100 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">颜色</label>
                      <div className="flex gap-2 flex-wrap">
                        {colorOptions.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setFormData({ ...formData, color })}
                            className={`w-6 h-6 rounded-md transition-all ${
                              formData.color === color ? 'ring-2 ring-offset-1 ring-matcha-500 scale-110' : ''
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 text-gray-600 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        取消
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1.5 text-white bg-matcha-500 rounded-lg text-sm hover:bg-matcha-600 transition-colors flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        保存
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: tea.color }}
                      >
                        <Leaf className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{tea.name}</h3>
                        <p className="text-xs text-gray-500">
                          浸泡 {tea.brewDurationMinutes} 分钟 · 茶水比 {tea.teaToWaterRatio}g/L · 安全售卖 {tea.shelfLifeHours}h
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(tea)}
                        className="p-2 text-gray-400 hover:text-matcha-600 hover:bg-matcha-50 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tea.id)}
                        className="p-2 text-gray-400 hover:text-coral-600 hover:bg-coral-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <SettingsIcon className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold text-gray-800 font-serif">系统说明</h2>
          </div>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• <strong>浸泡中</strong>：茶叶正在冷泡中，未到过滤时间</p>
            <p>• <strong>待过滤</strong>：距离目标过滤时间不足10分钟，请准备过滤</p>
            <p>• <strong>已超时</strong>：已超过目标过滤时间，请尽快过滤，避免影响口感</p>
            <p>• <strong>在售中</strong>：已过滤完成，正在冷柜中售卖</p>
            <p>• <strong>已下架</strong>：超过安全售卖时间或手动下架，不可再售卖</p>
          </div>
          <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-sm text-amber-700">
              💡 <strong>小提示：</strong>建议根据门店销量和营业时间，合理安排开泡时间，确保新鲜供应的同时减少浪费。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
