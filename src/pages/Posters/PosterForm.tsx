import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Save, Image as ImageIcon } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { usePosterStore } from '../../store/usePosterStore';
import { POSTER_SIZES, AREAS } from '../../types';
import type { Poster } from '../../types';

export default function PosterForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const addPoster = usePosterStore((state) => state.addPoster);
  const updatePoster = usePosterStore((state) => state.updatePoster);
  const posters = usePosterStore((state) => state.posters);

  const [formData, setFormData] = useState<Partial<Poster>>({
    activityName: '',
    club: '',
    size: 'A4',
    area: '教学区',
    approvalNumber: '',
    startDate: '',
    endDate: '',
    imageUrl: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      const poster = posters.find(p => p.id === id);
      if (poster) {
        setFormData(poster);
      }
    }
  }, [isEdit, id, posters]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateRandomImage = () => {
    const activity = encodeURIComponent(formData.activityName || 'poster');
    const imageUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${activity}%20poster%20colorful%20creative&image_size=portrait_4_3`;
    setFormData((prev) => ({ ...prev, imageUrl }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.activityName || !formData.club || !formData.approvalNumber || !formData.startDate || !formData.endDate || !formData.imageUrl) {
        alert('请填写所有必填项');
        setLoading(false);
        return;
      }

      if (isEdit && id) {
        updatePoster(id, formData);
      } else {
        addPoster(formData as Omit<Poster, 'id' | 'createdAt' | 'status'>);
      }

      navigate('/posters');
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? '编辑海报' : '新增海报'}
        description={isEdit ? '修改海报档案信息' : '创建新的海报档案'}
        action={
          <button
            onClick={() => navigate('/posters')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            返回列表
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧表单 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-lg font-bold text-gray-900 mb-6">基本信息</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    活动名称 <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="activityName"
                    value={formData.activityName}
                    onChange={handleChange}
                    placeholder="请输入活动名称"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    所属社团 <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="club"
                    value={formData.club}
                    onChange={handleChange}
                    placeholder="请输入所属社团名称"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      海报尺寸 <span className="text-danger">*</span>
                    </label>
                    <select
                      name="size"
                      value={formData.size}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                      {POSTER_SIZES.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      张贴区域 <span className="text-danger">*</span>
                    </label>
                    <select
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                      {AREAS.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    审批编号 <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="approvalNumber"
                    value={formData.approvalNumber}
                    onChange={handleChange}
                    placeholder="如：2026-HY-001"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      开始日期 <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      结束日期 <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧图片上传 */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-lg font-bold text-gray-900 mb-6">海报图片</h3>
              
              <div className="space-y-4">
                {formData.imageUrl ? (
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={formData.imageUrl}
                      alt="海报预览"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                      className="absolute top-3 right-3 bg-danger text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 hover:border-primary-400 transition-colors">
                    <ImageIcon className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-400 text-sm">暂无海报图片</p>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="flex items-center justify-center gap-2 w-full py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl cursor-pointer transition-colors">
                    <Upload className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700 font-medium">上传图片</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={generateRandomImage}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-primary-50 hover:bg-primary-100 border border-primary-200 text-primary-600 rounded-xl transition-colors"
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span className="font-medium">生成示例图片</span>
                  </button>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  支持 JPG、PNG 格式，建议尺寸为竖版海报
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="bg-white rounded-2xl shadow-card p-6 mt-6 flex items-center justify-end gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <button
            type="button"
            onClick={() => navigate('/posters')}
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
            {loading ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
}
