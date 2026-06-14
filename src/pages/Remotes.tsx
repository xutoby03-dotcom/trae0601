import { useState } from 'react';
import { Plus, Edit2, Trash2, MapPin, Battery, Calendar, AlertCircle, Search } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { StatusBadge } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { Remote, CONFERENCE_ROOMS, BATTERY_MODELS } from '../data/types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function Remotes() {
  const { remotes, addRemote, updateRemote, deleteRemote, markRemoteLost } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRemote, setEditingRemote] = useState<Remote | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    code: '',
    conferenceRoom: CONFERENCE_ROOMS[0],
    batteryModel: BATTERY_MODELS[0],
    storageLocation: '',
    photoUrl: '',
    batteryLevel: 100,
  });

  const photoOptions = [
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20black%20projector%20remote%20control%20on%20white%20background%20product%20photo&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=silver%20slim%20projector%20remote%20control%20professional%20photo&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dark%20gray%20projector%20remote%20control%20studio%20shot&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=white%20minimalist%20projector%20remote%20control%20top%20view&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20metallic%20projector%20remote%20control%20photography&image_size=square_hd',
  ];

  const filteredRemotes = remotes.filter(remote => {
    const matchesSearch = remote.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      remote.conferenceRoom.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || remote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (remote?: Remote) => {
    if (remote) {
      setEditingRemote(remote);
      setFormData({
        code: remote.code,
        conferenceRoom: remote.conferenceRoom,
        batteryModel: remote.batteryModel,
        storageLocation: remote.storageLocation,
        photoUrl: remote.photoUrl,
        batteryLevel: remote.batteryLevel,
      });
    } else {
      setEditingRemote(null);
      setFormData({
        code: '',
        conferenceRoom: CONFERENCE_ROOMS[0],
        batteryModel: BATTERY_MODELS[0],
        storageLocation: '',
        photoUrl: photoOptions[0],
        batteryLevel: 100,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.code.trim()) {
      alert('请输入遥控器编号');
      return;
    }
    if (!formData.storageLocation.trim()) {
      alert('请输入存放位置');
      return;
    }

    if (editingRemote) {
      updateRemote(editingRemote.id, formData);
    } else {
      addRemote({
        ...formData,
        status: 'available',
        lastBatteryChange: new Date().toISOString(),
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个遥控器吗？')) {
      deleteRemote(id);
    }
  };

  const handleMarkLost = (id: string) => {
    const reason = prompt('请输入丢失原因：');
    if (reason) {
      markRemoteLost(id, reason);
    }
  };

  const getBatteryColor = (level: number) => {
    if (level >= 50) return 'bg-green-500';
    if (level >= 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-display">遥控器档案</h1>
          <p className="text-gray-500 mt-1">管理所有投影遥控器的档案信息</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新增遥控器
        </button>
      </div>

      <div className="card-base p-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索遥控器编号、会议室..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">全部状态</option>
            <option value="available">可用</option>
            <option value="borrowed">借用中</option>
            <option value="maintenance">维修中</option>
            <option value="lost">已丢失</option>
          </select>
        </div>
      </div>

      {filteredRemotes.length === 0 ? (
        <div className="card-base p-12 text-center animate-fade-in-up">
          <AlertCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">暂无遥控器档案</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRemotes.map((remote, index) => (
            <div
              key={remote.id}
              className="card-base overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${(index + 2) * 50}ms` }}
            >
              <div className="aspect-square bg-gray-100 relative">
                <img
                  src={remote.photoUrl}
                  alt={remote.code}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <StatusBadge status={remote.status} />
                </div>
                {remote.batteryLevel < 20 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Battery className="w-3 h-3" />
                    低电量
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 font-display">{remote.code}</h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(remote)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                    {remote.status !== 'lost' && (
                      <button
                        onClick={() => handleMarkLost(remote.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="标记丢失"
                      >
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(remote.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{remote.conferenceRoom}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Battery className="w-4 h-4 text-gray-400" />
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getBatteryColor(remote.batteryLevel)} transition-all duration-500`}
                          style={{ width: `${remote.batteryLevel}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{remote.batteryLevel}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-xs">
                      电池: {remote.batteryModel} · {format(new Date(remote.lastBatteryChange), 'M月d日', { locale: zhCN })}更换
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    <span className="font-medium text-gray-600">存放位置：</span>
                    {remote.storageLocation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRemote ? '编辑遥控器' : '新增遥控器'}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">遥控器编号 *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="如: RC-001"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">适配会议室</label>
              <select
                value={formData.conferenceRoom}
                onChange={(e) => setFormData({ ...formData, conferenceRoom: e.target.value })}
                className="input-field"
              >
                {CONFERENCE_ROOMS.map(room => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">电池型号</label>
              <select
                value={formData.batteryModel}
                onChange={(e) => setFormData({ ...formData, batteryModel: e.target.value })}
                className="input-field"
              >
                {BATTERY_MODELS.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">默认存放点 *</label>
              <input
                type="text"
                value={formData.storageLocation}
                onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                placeholder="如: 1楼前台"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                电池电量: {formData.batteryLevel}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.batteryLevel}
                onChange={(e) => setFormData({ ...formData, batteryLevel: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">外观照片</label>
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-3">
              <img
                src={formData.photoUrl || photoOptions[0]}
                alt="预览"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {photoOptions.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setFormData({ ...formData, photoUrl: url })}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    formData.photoUrl === url ? 'border-primary-500 ring-2 ring-primary-200' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
          <button
            onClick={() => setIsModalOpen(false)}
            className="btn-secondary"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
          >
            {editingRemote ? '保存修改' : '新增遥控器'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
