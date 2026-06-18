import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Grid3X3,
  Users,
  Shield,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Dog,
  Cat,
  LayoutGrid,
  AlertTriangle,
  CheckCircle,
  Circle
} from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { Cage as CageType, User } from '../../../shared/types';
import { StatusBadge } from '@/components/Common/StatusBadge';
import { ConfirmDialog } from '@/components/Common/ConfirmDialog';
import { cn } from '@/lib/utils';

interface CageFormData {
  code: string;
  name: string;
  type: 'normal' | 'isolation';
  suitableFor: 'dog' | 'cat' | 'both';
  size: 'small' | 'medium' | 'large';
  notes?: string;
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cages' | 'users'>('cages');
  const [cages, setCages] = useState<CageType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCageForm, setShowCageForm] = useState(false);
  const [editingCage, setEditingCage] = useState<CageType | null>(null);
  const [cageForm, setCageForm] = useState<CageFormData>({
    code: '',
    name: '',
    type: 'normal',
    suitableFor: 'both',
    size: 'medium',
    notes: ''
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
    type: 'danger' | 'warning';
  }>({ show: false, title: '', message: '', type: 'danger' });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'cages') {
        const response = await apiClient.get<CageType[]>('/api/cages');
        if (response.success && response.data) {
          setCages(response.data);
        }
      } else {
        const response = await apiClient.get<User[]>('/api/users');
        if (response.success && response.data) {
          setUsers(response.data);
        }
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCage = async () => {
    if (!cageForm.code || !cageForm.name) {
      alert('请填写笼位编号和名称');
      return;
    }

    try {
      if (editingCage) {
        const response = await apiClient.put(`/api/cages/${editingCage.id}`, cageForm);
        if (response.success) {
          loadData();
          resetCageForm();
        }
      } else {
        const response = await apiClient.post('/api/cages', { ...cageForm, status: 'available' });
        if (response.success) {
          loadData();
          resetCageForm();
        }
      }
    } catch (error) {
      console.error('保存笼位失败:', error);
      alert('保存失败，请重试');
    }
  };

  const handleDeleteCage = (cage: CageType) => {
    if (cage.status === 'occupied') {
      alert('该笼位正在使用中，无法删除');
      return;
    }
    setConfirmDialog({
      show: true,
      title: '确认删除',
      message: `确定要删除笼位「${cage.name}」吗？此操作不可撤销。`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const response = await apiClient.delete(`/api/cages/${cage.id}`);
          if (response.success) {
            loadData();
          }
        } catch (error) {
          console.error('删除失败:', error);
        }
        setConfirmDialog(prev => ({ ...prev, show: false }));
      }
    });
  };

  const resetCageForm = () => {
    setCageForm({
      code: '',
      name: '',
      type: 'normal',
      suitableFor: 'both',
      size: 'medium',
      notes: ''
    });
    setEditingCage(null);
    setShowCageForm(false);
  };

  const startEditCage = (cage: CageType) => {
    setEditingCage(cage);
    setCageForm({
      code: cage.code,
      name: cage.name,
      type: cage.type,
      suitableFor: cage.suitableFor,
      size: cage.size,
      notes: cage.notes
    });
    setShowCageForm(true);
  };

  const getStatusColor = (status: CageType['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'occupied': return 'bg-blue-100 text-blue-700';
      case 'maintenance': return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getStatusText = (status: CageType['status']) => {
    switch (status) {
      case 'available': return '可用';
      case 'occupied': return '已占用';
      case 'maintenance': return '维护中';
    }
  };

  const getSizeText = (size: CageType['size']) => {
    switch (size) {
      case 'small': return '小型';
      case 'medium': return '中型';
      case 'large': return '大型';
    }
  };

  const getSuitableIcon = (suitableFor: CageType['suitableFor']) => {
    switch (suitableFor) {
      case 'dog': return <Dog className="w-4 h-4" />;
      case 'cat': return <Cat className="w-4 h-4" />;
      case 'both': return (
        <div className="flex -space-x-1">
          <Dog className="w-4 h-4" />
          <Cat className="w-4 h-4" />
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-primary-500" />
          系统设置
        </h1>
        <p className="text-gray-500 mt-1">管理笼位配置、用户账号等系统设置</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('cages')}
            className={cn(
              'flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2',
              activeTab === 'cages'
                ? 'text-primary-600 border-primary-500 bg-primary-50/50'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
            )}
          >
            <Grid3X3 className="w-5 h-5" />
            笼位管理
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={cn(
              'flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2',
              activeTab === 'users'
                ? 'text-primary-600 border-primary-500 bg-primary-50/50'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
            )}
          >
            <Users className="w-5 h-5" />
            用户管理
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'cages' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">笼位列表</h2>
                  <p className="text-sm text-gray-500 mt-1">共 {cages.length} 个笼位</p>
                </div>
                <button
                  onClick={() => setShowCageForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  新增笼位
                </button>
              </div>

              {showCageForm && (
                <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5 text-primary-500" />
                    {editingCage ? '编辑笼位' : '新增笼位'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">笼位编号 *</label>
                      <input
                        type="text"
                        value={cageForm.code}
                        onChange={e => setCageForm(prev => ({ ...prev, code: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        placeholder="如：C001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">笼位名称 *</label>
                      <input
                        type="text"
                        value={cageForm.name}
                        onChange={e => setCageForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        placeholder="如：普通笼位1号"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">笼位类型</label>
                      <select
                        value={cageForm.type}
                        onChange={e => setCageForm(prev => ({ ...prev, type: e.target.value as 'normal' | 'isolation' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      >
                        <option value="normal">普通笼位</option>
                        <option value="isolation">隔离笼位</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">适用宠物</label>
                      <select
                        value={cageForm.suitableFor}
                        onChange={e => setCageForm(prev => ({ ...prev, suitableFor: e.target.value as 'dog' | 'cat' | 'both' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      >
                        <option value="dog">仅犬类</option>
                        <option value="cat">仅猫类</option>
                        <option value="both">犬猫通用</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">笼位大小</label>
                      <select
                        value={cageForm.size}
                        onChange={e => setCageForm(prev => ({ ...prev, size: e.target.value as 'small' | 'medium' | 'large' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      >
                        <option value="small">小型</option>
                        <option value="medium">中型</option>
                        <option value="large">大型</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                      <input
                        type="text"
                        value={cageForm.notes || ''}
                        onChange={e => setCageForm(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        placeholder="可选"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleSaveCage}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      保存
                    </button>
                    <button
                      onClick={resetCageForm}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      取消
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">编号</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">名称</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">类型</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">适用</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">大小</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">状态</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">备注</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cages.map(cage => (
                      <tr key={cage.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm text-gray-700">{cage.code}</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">{cage.name}</td>
                        <td className="py-3 px-4">
                          {cage.type === 'isolation' ? (
                            <StatusBadge status="warning" dot>
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              隔离笼位
                            </StatusBadge>
                          ) : (
                            <StatusBadge status="info" dot>
                              普通笼位
                            </StatusBadge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            {getSuitableIcon(cage.suitableFor)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{getSizeText(cage.size)}</td>
                        <td className="py-3 px-4">
                          <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getStatusColor(cage.status))}>
                            {getStatusText(cage.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-sm">{cage.notes || '-'}</td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => startEditCage(cage)}
                              className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                              title="编辑"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCage(cage)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="删除"
                              disabled={cage.status === 'occupied'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {cages.length === 0 && (
                <div className="text-center py-12">
                  <LayoutGrid className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">暂无笼位数据</p>
                  <button
                    onClick={() => setShowCageForm(true)}
                    className="mt-3 text-primary-500 hover:text-primary-600 font-medium"
                  >
                    + 添加第一个笼位
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">用户列表</h2>
                <p className="text-sm text-gray-500 mt-1">共 {users.length} 个用户</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map(user => (
                  <div key={user.id} className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                      {user.active ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          角色：
                          <span className={cn(
                            'font-medium ml-1',
                            user.role === 'admin' && 'text-purple-600',
                            user.role === 'reception' && 'text-blue-600',
                            user.role === 'caregiver' && 'text-green-600'
                          )}>
                            {user.role === 'admin' ? '管理员' : user.role === 'reception' ? '前台' : '护理员'}
                          </span>
                        </span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-400">📞</span>
                          <span className="text-gray-600">{user.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">📅</span>
                        <span className="text-gray-600">创建于 {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {users.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">暂无用户数据</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialog.show}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, show: false }))}
        onConfirm={() => {
          confirmDialog.onConfirm?.();
          setConfirmDialog(prev => ({ ...prev, show: false }));
        }}
        title={confirmDialog.title}
        description={confirmDialog.message}
        confirmText="确认删除"
        confirmVariant={confirmDialog.type === 'danger' ? 'danger' : 'warning'}
      />
    </div>
  );
};

export default Settings;
