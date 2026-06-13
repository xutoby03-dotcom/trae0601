import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Plus, Pencil, Trash2, Image } from 'lucide-react';
import type { Product } from '@/types';

type FormData = Omit<Product, 'id'>;

const emptyForm: FormData = {
  name: '',
  category: '饮品',
  flavor: [],
  addOns: [],
  prepTime: 0,
  stock: 0,
  photoUrl: '',
};

const CATEGORIES = ['饮品', '主食', '小吃'] as const;

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [flavorInput, setFlavorInput] = useState('');
  const [addOnsInput, setAddOnsInput] = useState('');

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFlavorInput('');
    setAddOnsInput('');
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      category: p.category,
      flavor: p.flavor,
      addOns: p.addOns,
      prepTime: p.prepTime,
      stock: p.stock,
      photoUrl: p.photoUrl,
    });
    setFlavorInput(p.flavor.join(', '));
    setAddOnsInput(p.addOns.join(', '));
    setShowModal(true);
  };

  const handleSubmit = () => {
    const data = {
      ...form,
      flavor: flavorInput
        .split(/[,，]/)
        .map((s) => s.trim())
        .filter(Boolean),
      addOns: addOnsInput
        .split(/[,，]/)
        .map((s) => s.trim())
        .filter(Boolean),
    };
    if (editingId) {
      updateProduct(editingId, data);
    } else {
      addProduct(data);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setDeleteConfirmId(null);
  };

  const stockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600';
    if (stock <= 5) return 'text-orange-500';
    return 'text-emerald-600';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">商品管理</h1>
        <button className="btn-primary flex items-center gap-2" onClick={openAdd}>
          <Plus size={18} />
          添加商品
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((p) => (
          <div key={p.id} className="card p-0 overflow-hidden">
            {p.photoUrl ? (
              <img
                src={p.photoUrl}
                alt={p.name}
                className="w-full h-40 object-cover rounded-xl"
              />
            ) : (
              <div className="w-full h-40 bg-brand-100 flex items-center justify-center rounded-xl">
                <Image size={32} className="text-brand-300" />
              </div>
            )}

            <div className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-serif font-semibold text-brown-800">
                  {p.name}
                </h3>
                <div className="flex gap-1">
                  <button
                    className="p-1.5 rounded-lg hover:bg-brand-100 text-brand-600 transition-colors"
                    onClick={() => openEdit(p)}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                    onClick={() => setDeleteConfirmId(p.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <span className="tag-orange">{p.category}</span>

              {p.flavor.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {p.flavor.map((f) => (
                    <span key={f} className="tag-green">
                      {f}
                    </span>
                  ))}
                </div>
              )}

              {p.addOns.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {p.addOns.map((a) => (
                    <span key={a} className="tag-gray">
                      {a}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-brown-600 pt-1">
                <span>⏱ {p.prepTime} 分钟</span>
                <span
                  className={`font-medium ${
                    p.stock <= 5 ? 'animate-pulse-warn' : ''
                  } ${stockColor(p.stock)}`}
                >
                  库存: {p.stock}
                </span>
              </div>
            </div>

            {deleteConfirmId === p.id && (
              <div className="border-t border-brand-100 p-3 bg-red-50/50 flex items-center justify-between">
                <span className="text-sm text-red-600">确认删除？</span>
                <div className="flex gap-2">
                  <button
                    className="btn-danger px-3 py-1 text-xs"
                    onClick={() => handleDelete(p.id)}
                  >
                    删除
                  </button>
                  <button
                    className="btn-secondary px-3 py-1 text-xs"
                    onClick={() => setDeleteConfirmId(null)}
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl animate-slide-in">
            <div className="p-6">
              <h2 className="section-title mb-5">
                {editingId ? '编辑商品' : '添加商品'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1">
                    商品名称
                  </label>
                  <input
                    className="input-field"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1">
                    分类
                  </label>
                  <select
                    className="input-field"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1">
                    口味（逗号分隔）
                  </label>
                  <input
                    className="input-field"
                    value={flavorInput}
                    onChange={(e) => setFlavorInput(e.target.value)}
                    placeholder="甜, 无糖, 微辣"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1">
                    加料（逗号分隔）
                  </label>
                  <input
                    className="input-field"
                    value={addOnsInput}
                    onChange={(e) => setAddOnsInput(e.target.value)}
                    placeholder="加蛋, 加火腿"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">
                      制作时间（分钟）
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      value={form.prepTime}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          prepTime: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">
                      库存
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      value={form.stock}
                      onChange={(e) =>
                        setForm({ ...form, stock: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1">
                    图片地址
                  </label>
                  <input
                    className="input-field"
                    value={form.photoUrl}
                    onChange={(e) =>
                      setForm({ ...form, photoUrl: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  取消
                </button>
                <button
                  className="btn-primary"
                  onClick={handleSubmit}
                  disabled={!form.name.trim()}
                >
                  {editingId ? '保存' : '添加'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
