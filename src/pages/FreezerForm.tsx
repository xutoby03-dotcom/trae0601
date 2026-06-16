import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useFreezerStore } from '@/store/freezerStore';
import type { Zone, Product } from '@/types';
import { generateId } from '@/utils/format';

export default function FreezerForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getFreezerById, addFreezer, updateFreezer } = useFreezerStore();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    minTemp: -22,
    maxTemp: -18,
    manager: '',
    managerPhone: '',
  });

  const [zones, setZones] = useState<Zone[]>([]);

  useEffect(() => {
    if (isEditing && id) {
      const freezer = getFreezerById(id);
      if (freezer) {
        setFormData({
          name: freezer.name,
          location: freezer.location,
          minTemp: freezer.minTemp,
          maxTemp: freezer.maxTemp,
          manager: freezer.manager,
          managerPhone: freezer.managerPhone,
        });
        setZones(freezer.zones);
      }
    }
  }, [isEditing, id, getFreezerById]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'minTemp' || name === 'maxTemp' ? Number(value) : value,
    }));
  };

  const addZone = () => {
    const newZone: Zone = {
      id: generateId(),
      name: '',
      products: [],
    };
    setZones([...zones, newZone]);
  };

  const updateZoneName = (zoneId: string, name: string) => {
    setZones(zones.map((z) => (z.id === zoneId ? { ...z, name } : z)));
  };

  const removeZone = (zoneId: string) => {
    setZones(zones.filter((z) => z.id !== zoneId));
  };

  const addProduct = (zoneId: string) => {
    const newProduct: Product = {
      id: generateId(),
      brand: '',
      flavor: '',
      category: '',
      costPrice: 0,
      retailPrice: 0,
      stock: 0,
    };
    setZones(
      zones.map((z) =>
        z.id === zoneId ? { ...z, products: [...z.products, newProduct] } : z
      )
    );
  };

  const updateProduct = (
    zoneId: string,
    productId: string,
    field: keyof Product,
    value: string | number
  ) => {
    setZones(
      zones.map((z) =>
        z.id === zoneId
          ? {
              ...z,
              products: z.products.map((p) =>
                p.id === productId ? { ...p, [field]: value } : p
              ),
            }
          : z
      )
    );
  };

  const removeProduct = (zoneId: string, productId: string) => {
    setZones(
      zones.map((z) =>
        z.id === zoneId
          ? { ...z, products: z.products.filter((p) => p.id !== productId) }
          : z
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.location || !formData.manager) {
      alert('请填写必填项');
      return;
    }

    if (isEditing && id) {
      updateFreezer(id, {
        ...formData,
        zones,
      });
    } else {
      addFreezer({
        ...formData,
        zones,
      });
    }

    navigate('/freezers');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/freezers')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回列表
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            {isEditing ? '编辑冷柜' : '新增冷柜'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                冷柜名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="例如：1号雪糕柜"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                位置 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="例如：入口左侧"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                最低温度 (°C)
              </label>
              <input
                type="number"
                name="minTemp"
                value={formData.minTemp}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                最高温度 (°C)
              </label>
              <input
                type="number"
                name="maxTemp"
                value={formData.maxTemp}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                负责人 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="manager"
                value={formData.manager}
                onChange={handleInputChange}
                placeholder="例如：张小明"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                联系电话
              </label>
              <input
                type="tel"
                name="managerPhone"
                value={formData.managerPhone}
                onChange={handleInputChange}
                placeholder="例如：13800138000"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">商品分区</h2>
            <button
              type="button"
              onClick={addZone}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加分区
            </button>
          </div>

          <div className="space-y-6">
            {zones.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                暂无商品分区，点击上方按钮添加
              </div>
            ) : (
              zones.map((zone, zoneIndex) => (
                <div
                  key={zone.id}
                  className="border border-slate-200 rounded-xl overflow-hidden"
                >
                  <div className="bg-slate-50 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-sm font-medium text-slate-500">
                        分区 {zoneIndex + 1}
                      </span>
                      <input
                        type="text"
                        value={zone.name}
                        onChange={(e) => updateZoneName(zone.id, e.target.value)}
                        placeholder="分区名称，如：上层-品牌雪糕区"
                        className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeZone(zone.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-slate-500 border-b border-slate-100">
                            <th className="pb-2 font-medium">品牌</th>
                            <th className="pb-2 font-medium">口味</th>
                            <th className="pb-2 font-medium">品类</th>
                            <th className="pb-2 font-medium text-right">成本价</th>
                            <th className="pb-2 font-medium text-right">零售价</th>
                            <th className="pb-2 font-medium text-right">库存</th>
                            <th className="pb-2 w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {zone.products.map((product) => (
                            <tr
                              key={product.id}
                              className="border-b border-slate-50 last:border-0"
                            >
                              <td className="py-2 pr-2">
                                <input
                                  type="text"
                                  value={product.brand}
                                  onChange={(e) =>
                                    updateProduct(
                                      zone.id,
                                      product.id,
                                      'brand',
                                      e.target.value
                                    )
                                  }
                                  placeholder="品牌"
                                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm"
                                />
                              </td>
                              <td className="py-2 pr-2">
                                <input
                                  type="text"
                                  value={product.flavor}
                                  onChange={(e) =>
                                    updateProduct(
                                      zone.id,
                                      product.id,
                                      'flavor',
                                      e.target.value
                                    )
                                  }
                                  placeholder="口味"
                                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm"
                                />
                              </td>
                              <td className="py-2 pr-2">
                                <input
                                  type="text"
                                  value={product.category}
                                  onChange={(e) =>
                                    updateProduct(
                                      zone.id,
                                      product.id,
                                      'category',
                                      e.target.value
                                    )
                                  }
                                  placeholder="品类"
                                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm"
                                />
                              </td>
                              <td className="py-2 pr-2">
                                <input
                                  type="number"
                                  value={product.costPrice}
                                  onChange={(e) =>
                                    updateProduct(
                                      zone.id,
                                      product.id,
                                      'costPrice',
                                      Number(e.target.value)
                                    )
                                  }
                                  placeholder="0"
                                  className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm text-right ml-auto"
                                />
                              </td>
                              <td className="py-2 pr-2">
                                <input
                                  type="number"
                                  value={product.retailPrice}
                                  onChange={(e) =>
                                    updateProduct(
                                      zone.id,
                                      product.id,
                                      'retailPrice',
                                      Number(e.target.value)
                                    )
                                  }
                                  placeholder="0"
                                  className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm text-right ml-auto"
                                />
                              </td>
                              <td className="py-2 pr-2">
                                <input
                                  type="number"
                                  value={product.stock}
                                  onChange={(e) =>
                                    updateProduct(
                                      zone.id,
                                      product.id,
                                      'stock',
                                      Number(e.target.value)
                                    )
                                  }
                                  placeholder="0"
                                  className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm text-right ml-auto"
                                />
                              </td>
                              <td className="py-2">
                                <button
                                  type="button"
                                  onClick={() => removeProduct(zone.id, product.id)}
                                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <button
                      type="button"
                      onClick={() => addProduct(zone.id)}
                      className="mt-3 inline-flex items-center gap-1 text-sm text-sky-600 hover:text-sky-700"
                    >
                      <Plus className="w-4 h-4" />
                      添加商品
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/freezers')}
            className="px-6 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors shadow-sm"
          >
            <Save className="w-5 h-5" />
            {isEditing ? '保存修改' : '创建冷柜'}
          </button>
        </div>
      </form>
    </div>
  );
}
