import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Calendar, DollarSign, Users, Package, Tag, ChevronLeft, Image as ImageIcon } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useTastingStore } from '@/store/useTastingStore';

const FLAVOR_OPTIONS = ['草莓', '巧克力', '抹茶', '芒果', '香草', '提拉米苏', '红豆', '芋泥', '椰香', '咖啡', '原味', '芝士'];
const AUDIENCE_OPTIONS = ['年轻人', '上班族', '学生党', '甜品爱好者', '健身人群', '家庭客群', '儿童', '老人'];

export default function Publish() {
  const navigate = useNavigate();
  const addItem = useTastingStore(state => state.addItem);

  const [formData, setFormData] = useState({
    name: '',
    flavor: '',
    cost: '',
    targetAudience: '',
    totalPortions: '',
    imageUrl: '',
    deadline: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = '请输入试吃品名称';
    if (!formData.flavor) newErrors.flavor = '请选择口味';
    if (!formData.cost || Number(formData.cost) <= 0) newErrors.cost = '请输入有效成本';
    if (!formData.targetAudience) newErrors.targetAudience = '请选择目标客群';
    if (!formData.totalPortions || Number(formData.totalPortions) <= 0) newErrors.totalPortions = '请输入有效份数';
    if (!formData.imageUrl.trim()) newErrors.imageUrl = '请上传或输入图片链接';
    if (!formData.deadline) newErrors.deadline = '请选择截止日期';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    addItem({
      name: formData.name,
      flavor: formData.flavor,
      cost: Number(formData.cost),
      targetAudience: formData.targetAudience,
      totalPortions: Number(formData.totalPortions),
      imageUrl: formData.imageUrl,
      deadline: new Date(formData.deadline).toISOString(),
      description: formData.description,
    });

    navigate('/');
  };

  const sampleImages = [
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop',
  ];

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-warm-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-brown-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>返回</span>
        </button>

        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-brown-800 mb-2">发布试吃品</h1>
          <p className="text-brown-500 mb-8">填写信息，邀请顾客参与试吃反馈</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardContent className="space-y-6">
                <h2 className="text-lg font-semibold text-brown-800 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary-500" />
                  基本信息
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="试吃品名称"
                    placeholder="如：云朵蛋糕"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    error={errors.name}
                  />

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brown-800">
                      <Tag className="w-4 h-4 inline mr-1" />
                      口味
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {FLAVOR_OPTIONS.map(flavor => (
                        <button
                          key={flavor}
                          type="button"
                          onClick={() => handleChange('flavor', flavor)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            formData.flavor === flavor
                              ? 'bg-primary-500 text-white'
                              : 'bg-brown-100 text-brown-600 hover:bg-brown-200'
                          }`}
                        >
                          {flavor}
                        </button>
                      ))}
                    </div>
                    {errors.flavor && <p className="text-sm text-red-500">{errors.flavor}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brown-800">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      成本 (元)
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.cost}
                      onChange={(e) => handleChange('cost', e.target.value)}
                      error={errors.cost}
                      min="0"
                      step="0.5"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brown-800">
                      <Package className="w-4 h-4 inline mr-1" />
                      试吃份数
                    </label>
                    <Input
                      type="number"
                      placeholder="份数"
                      value={formData.totalPortions}
                      onChange={(e) => handleChange('totalPortions', e.target.value)}
                      error={errors.totalPortions}
                      min="1"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brown-800">
                    <Users className="w-4 h-4 inline mr-1" />
                    目标客群
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AUDIENCE_OPTIONS.map(audience => (
                      <button
                        key={audience}
                        type="button"
                        onClick={() => handleChange('targetAudience', audience)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          formData.targetAudience === audience
                            ? 'bg-mint-500 text-white'
                            : 'bg-brown-100 text-brown-600 hover:bg-brown-200'
                        }`}
                      >
                        {audience}
                      </button>
                    ))}
                  </div>
                  {errors.targetAudience && <p className="text-sm text-red-500">{errors.targetAudience}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-6">
                <h2 className="text-lg font-semibold text-brown-800 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary-500" />
                  图片与详情
                </h2>

                <div className="space-y-4">
                  <Input
                    label="图片链接"
                    placeholder="https://..."
                    value={formData.imageUrl}
                    onChange={(e) => handleChange('imageUrl', e.target.value)}
                    error={errors.imageUrl}
                  />

                  <div>
                    <p className="text-sm text-brown-500 mb-2">或选择示例图片：</p>
                    <div className="grid grid-cols-4 gap-2">
                      {sampleImages.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleChange('imageUrl', img)}
                          className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                            formData.imageUrl === img
                              ? 'border-primary-500 ring-2 ring-primary-200'
                              : 'border-transparent hover:border-brown-300'
                          }`}
                        >
                          <img src={img} alt={`示例 ${i + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.imageUrl && (
                    <div className="relative rounded-xl overflow-hidden aspect-video">
                      <img
                        src={formData.imageUrl}
                        alt="预览"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brown-800">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    截止日期
                  </label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleChange('deadline', e.target.value)}
                    error={errors.deadline}
                    min={getMinDate()}
                  />
                </div>

                <Textarea
                  label="产品描述 (选填)"
                  placeholder="简单介绍一下这款试吃品..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                取消
              </Button>
              <Button type="submit" size="lg" className="flex-1">
                <Upload className="w-5 h-5 mr-2" />
                发布试吃
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
