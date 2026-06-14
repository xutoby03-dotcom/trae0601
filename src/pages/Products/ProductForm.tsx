import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Package } from 'lucide-react';
import { useProductStore } from '@/store/productStore';
import { generateId, formatDate, addDays } from '@/utils/date';

interface BatchFormData {
  id: string;
  batchNumber: string;
  productionDate: string;
  expiryDate: string;
  stock: number;
  initialStock: number;
  isNew?: boolean;
}

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const getProductById = useProductStore((state) => state.getProductById);
  const addProduct = useProductStore((state) => state.addProduct);
  const updateProduct = useProductStore((state) => state.updateProduct);
  const getBatchesByProductId = useProductStore((state) => state.getBatchesByProductId);
  const addBatch = useProductStore((state) => state.addBatch);

  const [formData, setFormData] = useState({
    name: '',
    flavor: '',
    shelfLifeDays: 90,
    openDurationHours: 4,
    photo: '',
  });

  const [batches, setBatches] = useState<BatchFormData[]>([]);

  useEffect(() => {
    if (isEdit && id) {
      const product = getProductById(id);
      if (product) {
        setFormData({
          name: product.name,
          flavor: product.flavor,
          shelfLifeDays: product.shelfLifeDays,
          openDurationHours: product.openDurationHours,
          photo: product.photo,
        });
      }

      const productBatches = getBatchesByProductId(id);
      setBatches(
        productBatches.map((b) => ({
          id: b.id,
          batchNumber: b.batchNumber,
          productionDate: b.productionDate,
          expiryDate: b.expiryDate,
          stock: b.stock,
          initialStock: b.initialStock,
        }))
      );
    }
  }, [isEdit, id, getProductById, getBatchesByProductId]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBatchChange = (index: number, field: string, value: string | number) => {
    setBatches((prev) => {
      const newBatches = [...prev];
      newBatches[index] = { ...newBatches[index], [field]: value };
      
      if (field === 'productionDate') {
        const prodDate = new Date(value as string);
        const expiryDate = addDays(prodDate, formData.shelfLifeDays);
        newBatches[index].expiryDate = formatDate(expiryDate);
      }
      
      return newBatches;
    });
  };

  const addNewBatch = () => {
    const today = formatDate(new Date());
    const expiryDate = formatDate(addDays(new Date(), formData.shelfLifeDays));
    setBatches((prev) => [
      ...prev,
      {
        id: generateId(),
        batchNumber: `B${Date.now().toString().slice(-8)}`,
        productionDate: today,
        expiryDate: expiryDate,
        stock: 0,
        initialStock: 0,
        isNew: true,
      },
    ]);
  };

  const removeBatch = (index: number) => {
    setBatches((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('请输入商品名称');
      return;
    }

    if (isEdit && id) {
      updateProduct(id, formData);
    } else {
      addProduct(formData);
    }

    const productId = isEdit ? id! : useProductStore.getState().products[useProductStore.getState().products.length - 1]?.id || '';
    
    batches
      .filter((b) => b.isNew)
      .forEach((batch) => {
        addBatch({
          productId,
          batchNumber: batch.batchNumber,
          productionDate: batch.productionDate,
          expiryDate: batch.expiryDate,
          stock: batch.stock,
          initialStock: batch.stock,
        });
      });

    navigate('/products');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/products')}
          className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">
            {isEdit ? '编辑商品' : '新增商品'}
          </h1>
          <p className="text-stone-500 mt-1">填写商品信息和批次详情</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-6">基本信息</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                商品图片
              </label>
              <div className="flex items-start gap-4">
                <div className="w-32 h-32 bg-stone-100 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-stone-300">
                  {formData.photo ? (
                    <img
                      src={formData.photo}
                      alt="预览"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-10 h-10 text-stone-400" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="输入图片URL"
                    value={formData.photo}
                    onChange={(e) => handleInputChange('photo', e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                  <p className="text-xs text-stone-500 mt-2">
                    提示：可以使用网络图片URL
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                商品名称 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="例如：坚果混合装"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                口味
              </label>
              <input
                type="text"
                value={formData.flavor}
                onChange={(e) => handleInputChange('flavor', e.target.value)}
                placeholder="例如：原味、番茄味"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                保质期（天）
              </label>
              <input
                type="number"
                min="1"
                value={formData.shelfLifeDays}
                onChange={(e) => handleInputChange('shelfLifeDays', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                开封后可摆放时长（小时）
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={formData.openDurationHours}
                onChange={(e) => handleInputChange('openDurationHours', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-800">批次管理</h2>
            <button
              type="button"
              onClick={addNewBatch}
              className="flex items-center gap-2 px-4 py-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加批次
            </button>
          </div>

          {batches.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500">暂无批次</p>
              <p className="text-stone-400 text-sm mt-1">点击上方按钮添加批次</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {batches.map((batch, index) => (
                <div key={batch.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-stone-700">批次 {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeBatch(index)}
                      className="p-1.5 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-stone-500 mb-1.5">批次号</label>
                      <input
                        type="text"
                        value={batch.batchNumber}
                        onChange={(e) => handleBatchChange(index, 'batchNumber', e.target.value)}
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-500 mb-1.5">生产日期</label>
                      <input
                        type="date"
                        value={batch.productionDate}
                        onChange={(e) => handleBatchChange(index, 'productionDate', e.target.value)}
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-500 mb-1.5">过期日期</label>
                      <input
                        type="date"
                        value={batch.expiryDate}
                        onChange={(e) => handleBatchChange(index, 'expiryDate', e.target.value)}
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-500 mb-1.5">库存数量</label>
                      <input
                        type="number"
                        min="0"
                        value={batch.stock}
                        onChange={(e) => handleBatchChange(index, 'stock', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-6 py-3 border border-stone-200 text-stone-600 rounded-xl font-medium hover:bg-stone-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-550 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all"
          >
            <Save className="w-5 h-5" />
            保存
          </button>
        </div>
      </form>
    </div>
  );
}
