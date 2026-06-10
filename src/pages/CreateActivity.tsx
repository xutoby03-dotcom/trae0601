import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Backpack,
  Image,
  FileText,
  Tag,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { useAppStore } from '../store/appStore.js';
import type { ActivityType, CreateActivityDto } from '../../shared/types.js';

const activityTypes: { value: ActivityType; label: string; color: string }[] = [
  { value: 'lecture', label: '讲座', color: 'bg-blue-100 text-blue-600' },
  { value: 'boardgame', label: '桌游夜', color: 'bg-purple-100 text-purple-600' },
  { value: 'photoshoot', label: '外拍', color: 'bg-amber-100 text-amber-600' },
  { value: 'volunteer', label: '志愿服务', color: 'bg-green-100 text-green-600' },
];

export default function CreateActivity() {
  const navigate = useNavigate();
  const { createActivity } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<CreateActivityDto & { date: string; startTime: string; endTime: string }>({
    title: '',
    type: 'lecture',
    location: '',
    date: '',
    startTime: '19:00',
    endTime: '21:00',
    maxParticipants: 20,
    fee: 0,
    bringItems: '',
    coverImage: '',
    description: '',
    requiresApproval: false,
  });

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.location || !formData.date || !formData.startTime || !formData.endTime) {
      alert('请填写必填项');
      return;
    }

    const startDateTime = new Date(`${formData.date}T${formData.startTime}`).toISOString();
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`).toISOString();

    if (endDateTime <= startDateTime) {
      alert('结束时间必须晚于开始时间');
      return;
    }

    const activityDto: CreateActivityDto = {
      title: formData.title,
      type: formData.type,
      location: formData.location,
      startTime: startDateTime,
      endTime: endDateTime,
      maxParticipants: formData.maxParticipants,
      fee: formData.fee,
      bringItems: formData.bringItems,
      coverImage: formData.coverImage || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=colorful%20campus%20event%20poster%20with%20students%20having%20fun%20bright%20colors&image_size=landscape_16_9',
      description: formData.description,
      requiresApproval: formData.requiresApproval,
    };

    setLoading(true);
    try {
      const result = await createActivity(activityDto);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/activity/${result.id}`);
      }, 1500);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-12 shadow-xl text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">发布成功！</h2>
          <p className="text-gray-500">正在跳转到活动详情...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-500 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">发布新活动</h1>
                <p className="text-white/80 text-sm">填写活动信息，发布后学生即可报名</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* 活动类型 */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-3">
                <Tag className="w-4 h-4 text-primary-500" />
                活动类型
              </label>
              <div className="grid grid-cols-4 gap-2">
                {activityTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleChange('type', type.value)}
                    className={`py-3 px-2 rounded-xl font-medium text-sm transition-all ${
                      formData.type === type.value
                        ? `${type.color} ring-2 ring-offset-2 ring-primary-400 scale-105`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 活动主题 */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <FileText className="w-4 h-4 text-primary-500" />
                活动主题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="input-field"
                placeholder="例如：人工智能前沿技术讲座"
              />
            </div>

            {/* 时间 */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                  <Clock className="w-4 h-4 text-primary-500" />
                  日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-gray-700 font-medium mb-2 block">
                  开始时间 <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-gray-700 font-medium mb-2 block">
                  结束时间 <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            {/* 地点 */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <MapPin className="w-4 h-4 text-primary-500" />
                活动地点 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="input-field"
                placeholder="例如：图书馆学术报告厅"
              />
            </div>

            {/* 人数 & 费用 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                  <Users className="w-4 h-4 text-primary-500" />
                  人数上限
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxParticipants}
                  onChange={(e) => handleChange('maxParticipants', parseInt(e.target.value) || 0)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                  <DollarSign className="w-4 h-4 text-primary-500" />
                  费用（元）
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.fee}
                  onChange={(e) => handleChange('fee', parseFloat(e.target.value) || 0)}
                  className="input-field"
                />
              </div>
            </div>

            {/* 需带物品 */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <Backpack className="w-4 h-4 text-primary-500" />
                需要携带
              </label>
              <input
                type="text"
                value={formData.bringItems}
                onChange={(e) => handleChange('bringItems', e.target.value)}
                className="input-field"
                placeholder="例如：笔记本、笔、水杯"
              />
            </div>

            {/* 封面图 */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <Image className="w-4 h-4 text-primary-500" />
                封面图片 URL
              </label>
              <input
                type="text"
                value={formData.coverImage}
                onChange={(e) => handleChange('coverImage', e.target.value)}
                className="input-field"
                placeholder="留空使用默认图片"
              />
            </div>

            {/* 活动描述 */}
            <div>
              <label className="text-gray-700 font-medium mb-2 block">活动描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="input-field resize-none"
                rows={4}
                placeholder="详细介绍活动内容、亮点等..."
              />
            </div>

            {/* 需要审核 */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                id="requiresApproval"
                checked={formData.requiresApproval}
                onChange={(e) => handleChange('requiresApproval', e.target.checked)}
                className="w-5 h-5 text-primary-500 rounded"
              />
              <label htmlFor="requiresApproval" className="text-gray-700">
                <span className="font-medium">需要审核</span>
                <span className="text-sm text-gray-500 block">报名后需要管理员审核通过</span>
              </label>
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-lg py-4 disabled:opacity-50"
            >
              {loading ? '发布中...' : '发布活动'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
