import { useState, useEffect } from 'react';
import { Material } from '@/types';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { defaultRooms, defaultCategories } from '@/utils/helpers';
import { ImagePlus, X } from 'lucide-react';

interface MaterialFormProps {
  material?: Material | null;
  onSubmit: (data: Partial<Material>) => void;
  onCancel: () => void;
}

const MaterialForm = ({ material, onSubmit, onCancel }: MaterialFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    specification: '',
    orderQuantity: 0,
    unit: '个',
    supplier: '',
    expectedDate: '',
    photo: '',
    room: '',
    category: '',
    remark: '',
  });

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name,
        brand: material.brand,
        specification: material.specification,
        orderQuantity: material.orderQuantity,
        unit: material.unit,
        supplier: material.supplier,
        expectedDate: material.expectedDate,
        photo: material.photo,
        room: material.room,
        category: material.category,
        remark: material.remark,
      });
    }
  }, [material]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'orderQuantity' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          photo: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData((prev) => ({ ...prev, photo: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        {formData.photo ? (
          <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={formData.photo}
              alt="预览"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={removePhoto}
              className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 transition-colors">
            <ImagePlus className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">点击上传照片</span>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="品名"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="如：通体大理石瓷砖"
          className="col-span-2"
          required
        />

        <Input
          label="品牌"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          placeholder="如：东鹏"
        />

        <Select
          label="分类"
          name="category"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="">请选择分类</option>
          {defaultCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>

        <Input
          label="规格"
          name="specification"
          value={formData.specification}
          onChange={handleChange}
          placeholder="如：800x800mm 浅灰色"
          className="col-span-2"
        />

        <Input
          label="订购数量"
          name="orderQuantity"
          type="number"
          min="0"
          value={formData.orderQuantity || ''}
          onChange={handleChange}
        />

        <Input
          label="单位"
          name="unit"
          value={formData.unit}
          onChange={handleChange}
          placeholder="如：片、个、㎡"
        />

        <Input
          label="供应商"
          name="supplier"
          value={formData.supplier}
          onChange={handleChange}
          placeholder="如：东鹏瓷砖专卖店"
          className="col-span-2"
        />

        <Input
          label="预计到货日"
          name="expectedDate"
          type="date"
          value={formData.expectedDate}
          onChange={handleChange}
        />

        <Select
          label="存放房间"
          name="room"
          value={formData.room}
          onChange={handleChange}
        >
          <option value="">请选择房间</option>
          {defaultRooms.map((room) => (
            <option key={room} value={room}>
              {room}
            </option>
          ))}
        </Select>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            备注
          </label>
          <textarea
            name="remark"
            value={formData.remark}
            onChange={handleChange}
            rows={3}
            placeholder="填写备注信息..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {material ? '保存修改' : '添加材料'}
        </Button>
      </div>
    </form>
  );
};

export default MaterialForm;
