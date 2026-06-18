import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Cake, Save, ArrowLeft, Upload } from 'lucide-react';
import { api } from '../lib/api.js';
import { PageHeader } from '../components/PageHeader.js';
import { toast } from '../components/Layout.js';
import type { Mold, MoldType, MoldMaterial } from '../../shared/types.js';
import { MoldTypeLabels, MoldMaterialLabels } from '../../shared/types.js';

const typeOptions: { value: MoldType; label: string }[] = [
  { value: 'toast_box', label: '吐司盒' },
  { value: 'pound_cake', label: '磅蛋糕模' },
  { value: 'mousse_ring', label: '慕斯圈' },
  { value: 'other', label: '其他' },
];

const materialOptions: { value: MoldMaterial; label: string }[] = [
  { value: 'aluminum', label: '铝合金' },
  { value: 'stainless_steel', label: '不锈钢' },
  { value: 'non_stick', label: '不粘涂层' },
  { value: 'silicone', label: '硅胶' },
  { value: 'other', label: '其他' },
];

export default function MoldForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'toast_box' as MoldType,
    size: '',
    material: 'non_stick' as MoldMaterial,
    quantity: 1,
    applicableProducts: '' as string | string[],
    purchaseDate: new Date().toISOString().split('T')[0],
    photoUrl: '',
    remark: '',
  });

  useEffect(() => {
    if (isEdit && id) {
      loadMold(id);
    }
  }, [isEdit, id]);

  const loadMold = async (moldId: string) => {
    setLoading(true);
    try {
      const mold = await api.molds.get(moldId);
      setFormData({
        name: mold.name,
        type: mold.type,
        size: mold.size,
        material: mold.material,
        quantity: mold.quantity,
        applicableProducts: Array.isArray(mold.applicableProducts)
          ? mold.applicableProducts.join('、')
          : '',
        purchaseDate: mold.purchaseDate,
        photoUrl: mold.photoUrl || '',
        remark: mold.remark || '',
      });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const submitData: Partial<Mold> = {
        ...formData,
        applicableProducts: typeof formData.applicableProducts === 'string'
          ? formData.applicableProducts.split('、').filter(Boolean)
          : formData.applicableProducts,
      };

      if (isEdit && id) {
        await api.molds.update(id, submitData);
        toast.success('模具信息更新成功');
      } else {
        await api.molds.create(submitData);
        toast.success('模具添加成功');
      }
      navigate('/molds');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={isEdit ? '编辑模具' : '新增模具'}
        subtitle={isEdit ? '修改模具的基本信息' : '添加新的模具档案'}
        icon={<Cake className="w-6 h-6" />}
        actions={
          <button
            onClick={() => navigate('/molds')}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回列表
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              模具名称 <span className="text-tomato-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="例如：450g吐司盒"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              模具类型 <span className="text-tomato-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 transition-all"
              required
            >
              {typeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              尺寸规格 <span className="text-tomato-500">*</span>
            </label>
            <input
              type="text"
              value={formData.size}
              onChange={(e) => handleChange('size', e.target.value)}
              placeholder="例如：450g、8寸、12cm"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              材质 <span className="text-tomato-500">*</span>
            </label>
            <select
              value={formData.material}
              onChange={(e) => handleChange('material', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 transition-all"
              required
            >
              {materialOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              库存数量 <span className="text-tomato-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              适用产品
            </label>
            <input
              type="text"
              value={formData.applicableProducts as string}
              onChange={(e) => handleChange('applicableProducts', e.target.value)}
              placeholder="多个产品用顿号（、）分隔，例如：北海道吐司、白吐司"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              购买日期
            </label>
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => handleChange('purchaseDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              照片链接
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.photoUrl}
                onChange={(e) => handleChange('photoUrl', e.target.value)}
                placeholder="https://..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => {
                  const size = ['450g', '250g', '12cm', '8寸', '6寸'][Math.floor(Math.random() * 5)];
                  const url = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`${size} baking mold on white background`)}&image_size=square`;
                  handleChange('photoUrl', url);
                }}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <Upload className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              备注
            </label>
            <textarea
              value={formData.remark}
              onChange={(e) => handleChange('remark', e.target.value)}
              placeholder="其他需要记录的信息..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 focus:border-transparent transition-all resize-none"
            />
          </div>
        </div>

        {formData.photoUrl && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">照片预览</label>
            <div className="w-48 h-48 rounded-xl overflow-hidden border-2 border-dashed border-gray-200">
              <img
                src={formData.photoUrl}
                alt="预览"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/molds')}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 md:flex-none md:min-w-[200px] inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-caramel-500 to-caramel-600 text-white rounded-xl font-medium hover:from-caramel-600 hover:to-caramel-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {saving ? '保存中...' : (isEdit ? '保存修改' : '添加模具')}
          </button>
        </div>
      </form>
    </div>
  );
}
