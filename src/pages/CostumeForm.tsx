import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { costumeApi } from '../services/costumeService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAppStore } from '../stores/appStore';
import type { AccessoryCategory, WashStatus, CostumeStatus } from '../../shared/types';

interface AccessoryFormItem {
  name: string;
  quantity: number;
  category: AccessoryCategory;
}

const categoryOptions: { value: AccessoryCategory; label: string }[] = [
  { value: 'clothes', label: '衣服' },
  { value: 'headdress', label: '头饰' },
  { value: 'belt', label: '腰带' },
  { value: 'shoe_cover', label: '鞋套' },
];

export default function CostumeForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { refreshOverview } = useAppStore();

  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    size: string;
    program: string;
    photo_url: string;
    wash_status: WashStatus;
    status: CostumeStatus;
    notes: string;
  }>({
    id: '',
    name: '',
    size: 'M',
    program: '',
    photo_url: '',
    wash_status: 'clean',
    status: 'available',
    notes: '',
  });
  const [accessories, setAccessories] = useState<AccessoryFormItem[]>([
    { name: '', quantity: 1, category: 'clothes' },
  ]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      loadCostume(id);
    }
  }, [id, isEdit]);

  const loadCostume = async (costumeId: string) => {
    setLoading(true);
    try {
      const costume = await costumeApi.getById(costumeId);
      if (costume) {
        setFormData({
          id: costume.id,
          name: costume.name,
          size: costume.size,
          program: costume.program || '',
          photo_url: costume.photo_url || '',
          wash_status: costume.wash_status,
          status: costume.status,
          notes: costume.notes || '',
        });
        if (costume.accessories && costume.accessories.length > 0) {
          setAccessories(
            costume.accessories.map((a) => ({
              name: a.name,
              quantity: a.quantity,
              category: a.category,
            }))
          );
        }
      }
    } catch (error) {
      console.error('Failed to load costume:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addAccessory = () => {
    setAccessories((prev) => [...prev, { name: '', quantity: 1, category: 'clothes' }]);
  };

  const removeAccessory = (index: number) => {
    setAccessories((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAccessory = (index: number, field: keyof AccessoryFormItem, value: string | number) => {
    setAccessories((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const validAccessories = accessories.filter((a) => a.name.trim() !== '');

      if (isEdit && id) {
        await costumeApi.update(id, {
          ...formData,
          accessories: validAccessories,
        });
      } else {
        if (!formData.id.trim()) {
          alert('请输入服装编号');
          return;
        }
        await costumeApi.create({
          ...formData,
          use_count: 0,
          accessories: validAccessories,
        });
      }
      await refreshOverview();
      navigate('/costumes');
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="bg-white rounded-xl p-6 space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEdit ? '编辑服装' : '新增服装'}
          </h1>
          <p className="text-gray-500">
            {isEdit ? '修改服装档案信息' : '添加新的演出服装到档案库'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">基本信息</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="服装编号"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              placeholder="例如：COST-001"
              disabled={isEdit}
            />
            <Input
              label="款式名称"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="例如：古典舞水袖服"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">尺码</label>
              <select
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="均码">均码</option>
              </select>
            </div>
            <Input
              label="适用节目"
              name="program"
              value={formData.program}
              onChange={handleInputChange}
              placeholder="例如：《惊鸿舞》"
            />
            <Input
              label="照片链接"
              name="photo_url"
              value={formData.photo_url}
              onChange={handleInputChange}
              placeholder="输入图片URL"
            />
            {isEdit && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">状态</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="available">可借用</option>
                    <option value="borrowed">已借出</option>
                    <option value="pending">待处理</option>
                    <option value="washing">待清洗</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">清洗状态</label>
                  <select
                    name="wash_status"
                    value={formData.wash_status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="clean">已清洗</option>
                    <option value="dirty">待清洗</option>
                  </select>
                </div>
              </>
            )}
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">备注</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="输入备注信息..."
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-800">配饰清单</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={addAccessory}
            >
              添加配饰
            </Button>
          </div>

          <div className="space-y-3">
            {accessories.map((acc, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-28">
                  <select
                    value={acc.category}
                    onChange={(e) => updateAccessory(index, 'category', e.target.value as AccessoryCategory)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {categoryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={acc.name}
                    onChange={(e) => updateAccessory(index, 'name', e.target.value)}
                    placeholder="配饰名称"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="w-20">
                  <input
                    type="number"
                    min="1"
                    value={acc.quantity}
                    onChange={(e) => updateAccessory(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeAccessory(index)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link to="/costumes">
            <Button type="button" variant="outline">
              取消
            </Button>
          </Link>
          <Button type="submit" loading={submitLoading} leftIcon={<Save className="w-4 h-4" />}>
            {isEdit ? '保存修改' : '创建服装'}
          </Button>
        </div>
      </form>
    </div>
  );
}
