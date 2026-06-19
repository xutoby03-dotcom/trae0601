import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon, MapPin, Users, Phone, Hash, Pin } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { useApplicationStore } from '../../store/useApplicationStore';
import { usePosterStore } from '../../store/usePosterStore';
import { useBulletinBoardStore } from '../../store/useBulletinBoardStore';
import type { Poster } from '../../types';
import { AREAS } from '../../types';

interface FormData {
  posterId: string;
  bulletinBoardId: string;
  quantity: number;
  contactName: string;
  contactPhone: string;
  needTop: boolean;
}

export default function ApplicationForm() {
  const navigate = useNavigate();
  const addApplication = useApplicationStore((state) => state.addApplication);
  const posters = usePosterStore((state) => state.posters);
  const bulletinBoards = useBulletinBoardStore((state) => state.bulletinBoards);

  const [formData, setFormData] = useState<FormData>({
    posterId: '',
    bulletinBoardId: '',
    quantity: 1,
    contactName: '',
    contactPhone: '',
    needTop: false,
  });

  const [loading, setLoading] = useState(false);
  const [selectedArea, setSelectedArea] = useState<string>('');

  const approvedPosters = useMemo(() => {
    return posters.filter((p) => p.status === 'approved');
  }, [posters]);

  const filteredBoards = useMemo(() => {
    if (!selectedArea) return bulletinBoards;
    return bulletinBoards.filter((b) => b.area === selectedArea);
  }, [bulletinBoards, selectedArea]);

  const selectedPoster = useMemo(() => {
    return posters.find((p) => p.id === formData.posterId);
  }, [posters, formData.posterId]);

  const selectedBoard = useMemo(() => {
    return bulletinBoards.find((b) => b.id === formData.bulletinBoardId);
  }, [bulletinBoards, formData.bulletinBoardId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      const numValue = parseInt(value, 10) || 1;
      setFormData((prev) => ({ ...prev, [name]: Math.max(1, numValue) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const getAvailableSlots = () => {
    if (!selectedBoard) return 0;
    return selectedBoard.totalSlots - selectedBoard.occupiedSlots;
  };

  const validateForm = (): boolean => {
    if (!formData.posterId) {
      alert('请选择海报');
      return false;
    }
    if (!formData.bulletinBoardId) {
      alert('请选择公告栏');
      return false;
    }
    if (!formData.contactName.trim()) {
      alert('请填写联系人姓名');
      return false;
    }
    if (!formData.contactPhone.trim()) {
      alert('请填写联系电话');
      return false;
    }
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(formData.contactPhone)) {
      alert('请输入有效的手机号码');
      return false;
    }
    const availableSlots = getAvailableSlots();
    if (formData.quantity > availableSlots) {
      alert(`所选公告栏剩余位置不足，当前剩余 ${availableSlots} 个位置`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      addApplication({
        posterId: formData.posterId,
        applicant: formData.contactName,
        contact: formData.contactPhone,
        bulletinBoardId: formData.bulletinBoardId,
        quantity: formData.quantity,
        needTop: formData.needTop,
      });

      navigate('/applications');
    } catch (error) {
      console.error('提交申请失败:', error);
      alert('提交申请失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const renderPosterOption = (poster: Poster) => (
    <option key={poster.id} value={poster.id}>
      {poster.activityName} - {poster.club}
    </option>
  );

  return (
    <div>
      <PageHeader
        title="新建张贴申请"
        description="填写海报张贴申请信息"
        action={
          <button
            onClick={() => navigate('/applications')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            返回列表
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary-500" />
                选择海报
              </h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    选择海报 <span className="text-danger">*</span>
                  </label>
                  <select
                    name="posterId"
                    value={formData.posterId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="">请选择要张贴的海报</option>
                    {approvedPosters.length > 0 ? (
                      approvedPosters.map(renderPosterOption)
                    ) : (
                      <option value="" disabled>暂无已通过审批的海报</option>
                    )}
                  </select>
                  <p className="text-xs text-gray-400 mt-2">仅显示已通过审批的海报</p>
                </div>

                {selectedPoster && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex gap-4">
                      <div className="w-24 h-32 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={selectedPoster.imageUrl}
                          alt={selectedPoster.activityName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 mb-1">{selectedPoster.activityName}</h4>
                        <p className="text-sm text-gray-500 mb-2">{selectedPoster.club}</p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded">{selectedPoster.size}</span>
                          <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded">{selectedPoster.area}</span>
                          <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded font-mono">
                            {selectedPoster.approvalNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-500" />
                选择公告栏
              </h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    筛选区域
                  </label>
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="">全部区域</option>
                    {AREAS.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    公告栏 <span className="text-danger">*</span>
                  </label>
                  <select
                    name="bulletinBoardId"
                    value={formData.bulletinBoardId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="">请选择公告栏</option>
                    {filteredBoards.map((board) => (
                      <option key={board.id} value={board.id}>
                        {board.name} - {board.location} (剩余 {board.totalSlots - board.occupiedSlots}/{board.totalSlots})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedBoard && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{selectedBoard.name}</h4>
                        <p className="text-sm text-gray-500">{selectedBoard.location}</p>
                      </div>
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                        {selectedBoard.area}
                      </span>
                    </div>
                    <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-primary-500 transition-all duration-500"
                        style={{ width: `${(selectedBoard.occupiedSlots / selectedBoard.totalSlots) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>已占用 {selectedBoard.occupiedSlots} 个</span>
                      <span>剩余 {selectedBoard.totalSlots - selectedBoard.occupiedSlots} 个</span>
                      <span>共 {selectedBoard.totalSlots} 个</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    张贴数量 <span className="text-danger">*</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                      className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xl transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      min="1"
                      max={getAvailableSlots() || undefined}
                      className="w-20 text-center px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-bold text-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, quantity: Math.min(getAvailableSlots(), prev.quantity + 1) }))}
                      className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xl transition-colors"
                    >
                      +
                    </button>
                    <span className="text-sm text-gray-500">
                      最多可张贴 {getAvailableSlots()} 张
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="needTop"
                    name="needTop"
                    checked={formData.needTop}
                    onChange={handleChange}
                    className="w-5 h-5 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="needTop" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                    <Pin className="w-4 h-4 text-primary-500" />
                    需要置顶位置
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-500" />
                联系信息
              </h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      联系人姓名 <span className="text-danger">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    placeholder="请输入联系人姓名"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      联系电话 <span className="text-danger">*</span>
                    </span>
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="请输入联系电话"
                    maxLength={11}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-card p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Hash className="w-5 h-5 text-primary-500" />
                申请摘要
              </h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">海报</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedPoster ? selectedPoster.activityName : '未选择'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">公告栏</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedBoard ? selectedBoard.name : '未选择'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">张贴数量</p>
                  <p className="text-sm font-medium text-gray-900">{formData.quantity} 张</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">置顶位置</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formData.needTop ? '需要' : '不需要'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">联系人</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formData.contactName || '未填写'}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">
                    {formData.contactPhone || ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-primary-50 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <h4 className="font-bold text-primary-900 mb-3">温馨提示</h4>
              <ul className="text-sm text-primary-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500">•</span>
                  申请提交后状态为"待审核"
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500">•</span>
                  审核通过后会自动生成张贴任务
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500">•</span>
                  请确保联系电话畅通以便及时沟通
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6 mt-6 flex items-center justify-end gap-4 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <button
            type="button"
            onClick={() => navigate('/applications')}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {loading ? '提交中...' : '提交申请'}
          </button>
        </div>
      </form>
    </div>
  );
}
