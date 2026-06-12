import { FC, useState, useEffect } from 'react';
import { CoffeeBean, FlavorTag, RoastLevel, ProcessMethod, FLAVOR_TAG_LABELS, ROAST_LEVEL_LABELS, PROCESS_METHOD_LABELS } from '../../types';
import Button from '../ui/Button';
import Tag from '../ui/Tag';

interface CoffeeBeanFormProps {
  bean?: CoffeeBean | null;
  onSubmit: (data: Omit<CoffeeBean, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const allFlavorTags: FlavorTag[] = [
  'sour',
  'sweet',
  'bitter',
  'nutty',
  'floral',
  'fruity',
  'chocolate',
  'caramel',
];

const roastLevels: RoastLevel[] = ['light', 'medium-light', 'medium', 'medium-dark', 'dark'];
const processMethods: ProcessMethod[] = ['washed', 'natural', 'honey', 'anaerobic', 'wet-hulled'];

const CoffeeBeanForm: FC<CoffeeBeanFormProps> = ({ bean, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    origin: '',
    processMethod: 'washed' as ProcessMethod,
    roastLevel: 'medium' as RoastLevel,
    purchaseDate: new Date().toISOString().split('T')[0],
    price: 0,
    initialWeight: 200,
    remainingWeight: 200,
    lowStockThreshold: 30,
    recommendedGrind: '',
    photoUrl: '',
    flavorTags: [] as FlavorTag[],
  });

  useEffect(() => {
    if (bean) {
      setFormData({
        name: bean.name,
        origin: bean.origin,
        processMethod: bean.processMethod,
        roastLevel: bean.roastLevel,
        purchaseDate: bean.purchaseDate,
        price: bean.price,
        initialWeight: bean.initialWeight,
        remainingWeight: bean.remainingWeight,
        lowStockThreshold: bean.lowStockThreshold,
        recommendedGrind: bean.recommendedGrind,
        photoUrl: bean.photoUrl,
        flavorTags: bean.flavorTags,
      });
    }
  }, [bean]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleFlavorTag = (tag: FlavorTag) => {
    setFormData((prev) => ({
      ...prev,
      flavorTags: prev.flavorTags.includes(tag)
        ? prev.flavorTags.filter((t) => t !== tag)
        : [...prev.flavorTags, tag],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-[#4A3728] mb-1.5">
          咖啡豆名称 <span className="text-[#C2563B]">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="如：耶加雪菲 科契尔"
          className="w-full px-4 py-2.5 bg-white border border-[#D4A574]/30 rounded-xl text-[#4A3728] placeholder:text-[#B8A99A] focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 focus:border-[#D4A574] transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#4A3728] mb-1.5">
          产地 <span className="text-[#C2563B]">*</span>
        </label>
        <input
          type="text"
          value={formData.origin}
          onChange={(e) => handleChange('origin', e.target.value)}
          placeholder="如：埃塞俄比亚"
          className="w-full px-4 py-2.5 bg-white border border-[#D4A574]/30 rounded-xl text-[#4A3728] placeholder:text-[#B8A99A] focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 focus:border-[#D4A574] transition-colors"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#4A3728] mb-1.5">
            处理法
          </label>
          <select
            value={formData.processMethod}
            onChange={(e) => handleChange('processMethod', e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#D4A574]/30 rounded-xl text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 focus:border-[#D4A574] transition-colors"
          >
            {processMethods.map((method) => (
              <option key={method} value={method}>
                {PROCESS_METHOD_LABELS[method]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#4A3728] mb-1.5">
            烘焙度
          </label>
          <select
            value={formData.roastLevel}
            onChange={(e) => handleChange('roastLevel', e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#D4A574]/30 rounded-xl text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 focus:border-[#D4A574] transition-colors"
          >
            {roastLevels.map((level) => (
              <option key={level} value={level}>
                {ROAST_LEVEL_LABELS[level]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#4A3728] mb-1.5">
            购买日期
          </label>
          <input
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => handleChange('purchaseDate', e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#D4A574]/30 rounded-xl text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 focus:border-[#D4A574] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#4A3728] mb-1.5">
            价格 (元)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.price || ''}
            onChange={(e) => handleChange('price', Number(e.target.value))}
            placeholder="0.00"
            className="w-full px-4 py-2.5 bg-white border border-[#D4A574]/30 rounded-xl text-[#4A3728] placeholder:text-[#B8A99A] focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 focus:border-[#D4A574] transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#4A3728] mb-1.5">
            初始重量 (g)
          </label>
          <input
            type="number"
            min="0"
            value={formData.initialWeight || ''}
            onChange={(e) => handleChange('initialWeight', Number(e.target.value))}
            placeholder="200"
            className="w-full px-4 py-2.5 bg-white border border-[#D4A574]/30 rounded-xl text-[#4A3728] placeholder:text-[#B8A99A] focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 focus:border-[#D4A574] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#4A3728] mb-1.5">
            剩余重量 (g)
          </label>
          <input
            type="number"
            min="0"
            value={formData.remainingWeight || ''}
            onChange={(e) => handleChange('remainingWeight', Number(e.target.value))}
            placeholder="200"
            className="w-full px-4 py-2.5 bg-white border border-[#D4A574]/30 rounded-xl text-[#4A3728] placeholder:text-[#B8A99A] focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 focus:border-[#D4A574] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#4A3728] mb-1.5">
            低库存阈值 (g)
          </label>
          <input
            type="number"
            min="0"
            value={formData.lowStockThreshold || ''}
            onChange={(e) => handleChange('lowStockThreshold', Number(e.target.value))}
            placeholder="30"
            className="w-full px-4 py-2.5 bg-white border border-[#D4A574]/30 rounded-xl text-[#4A3728] placeholder:text-[#B8A99A] focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 focus:border-[#D4A574] transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#4A3728] mb-1.5">
          推荐研磨度
        </label>
        <input
          type="text"
          value={formData.recommendedGrind}
          onChange={(e) => handleChange('recommendedGrind', e.target.value)}
          placeholder="如：中细研磨"
          className="w-full px-4 py-2.5 bg-white border border-[#D4A574]/30 rounded-xl text-[#4A3728] placeholder:text-[#B8A99A] focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 focus:border-[#D4A574] transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#4A3728] mb-1.5">
          包装照片 URL
        </label>
        <input
          type="url"
          value={formData.photoUrl}
          onChange={(e) => handleChange('photoUrl', e.target.value)}
          placeholder="https://..."
          className="w-full px-4 py-2.5 bg-white border border-[#D4A574]/30 rounded-xl text-[#4A3728] placeholder:text-[#B8A99A] focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 focus:border-[#D4A574] transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#4A3728] mb-2">
          风味标签
        </label>
        <div className="flex flex-wrap gap-2">
          {allFlavorTags.map((tag) => (
            <Tag
              key={tag}
              tag={tag}
              selected={formData.flavorTags.includes(tag)}
              onClick={() => toggleFlavorTag(tag)}
              size="md"
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          取消
        </Button>
        <Button type="submit" className="flex-1">
          {bean ? '保存修改' : '添加豆子'}
        </Button>
      </div>
    </form>
  );
};

export default CoffeeBeanForm;
