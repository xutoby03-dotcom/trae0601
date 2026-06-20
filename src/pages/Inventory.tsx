import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Plus, Trash2, Package } from "lucide-react";

export default function Inventory() {
  const { inventory, addBatch, deleteBatch } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    batchNumber: "",
    pageCount: 0,
    startNumber: "",
    endNumber: "",
    packer: "",
    totalQuantity: 0,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addBatch(form);
    setForm({ batchNumber: "", pageCount: 0, startNumber: "", endNumber: "", packer: "", totalQuantity: 0 });
    setShowForm(false);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1e3a5f]">库存管理</h2>
          <p className="text-sm text-slate-500 mt-1">草稿纸批次入库与库存追踪</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1e3a5f] text-white text-sm rounded-lg hover:bg-[#163050] transition-colors shadow-sm"
        >
          <Plus size={16} />
          新增入库
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">批次号</th>
              <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">页数</th>
              <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">编号段</th>
              <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">封包人</th>
              <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">总量</th>
              <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">剩余</th>
              <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">入库时间</th>
              <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((batch, i) => (
              <tr key={batch.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                <td className="px-5 py-3.5 text-sm font-medium text-[#1e3a5f]">{batch.batchNumber}</td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{batch.pageCount} 页</td>
                <td className="px-5 py-3.5 text-sm text-slate-600 font-mono text-xs">
                  {batch.startNumber} — {batch.endNumber}
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{batch.packer}</td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{batch.totalQuantity} 张</td>
                <td className="px-5 py-3.5">
                  <span className={`text-sm font-semibold ${batch.remainingQuantity > batch.totalQuantity * 0.3 ? "text-emerald-600" : batch.remainingQuantity > batch.totalQuantity * 0.1 ? "text-amber-600" : "text-red-600"}`}>
                    {batch.remainingQuantity} 张
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-400">{new Date(batch.createdAt).toLocaleDateString("zh-CN")}</td>
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => deleteBatch(batch.id)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {inventory.length === 0 && (
          <div className="py-16 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
            <Package size={32} className="text-slate-300" />
            暂无库存数据，点击「新增入库」开始
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[480px] p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1e3a5f] mb-5">新增入库</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">批次号</label>
                  <input
                    required
                    type="text"
                    value={form.batchNumber}
                    onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">页数</label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={form.pageCount || ""}
                    onChange={(e) => setForm({ ...form, pageCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">起始编号</label>
                  <input
                    required
                    type="text"
                    value={form.startNumber}
                    onChange={(e) => setForm({ ...form, startNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">结束编号</label>
                  <input
                    required
                    type="text"
                    value={form.endNumber}
                    onChange={(e) => setForm({ ...form, endNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">封包人</label>
                  <input
                    required
                    type="text"
                    value={form.packer}
                    onChange={(e) => setForm({ ...form, packer: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">总数量（张）</label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={form.totalQuantity || ""}
                    onChange={(e) => setForm({ ...form, totalQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1e3a5f] text-white text-sm rounded-lg hover:bg-[#163050] transition-colors"
                >
                  入库
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
