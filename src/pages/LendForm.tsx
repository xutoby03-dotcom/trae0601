import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Building2,
  FileText,
  MapPin,
  Calendar,
  Package,
  Plus,
  Minus,
  Star,
  AlertCircle,
  CheckCircle,
  ShoppingBasket,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { DEPARTMENTS, MEETING_ROOMS, LOCATIONS } from "@/types";
import type { Basket, ItemEntry } from "@/types";
import {
  sizeLabel,
  basketStatusLabel,
  basketStatusClass,
  formatDateTime,
} from "@/utils/format";

export default function LendForm() {
  const navigate = useNavigate();
  const baskets = useStore((s) => s.baskets);
  const createLendRecord = useStore((s) => s.createLendRecord);

  const availableBaskets = useMemo(
    () => baskets.filter((b) => b.status === "available"),
    [baskets]
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [borrowerName, setBorrowerName] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [purpose, setPurpose] = useState("");
  const [destination, setDestination] = useState(MEETING_ROOMS[0]);
  const [expectedReturnTime, setExpectedReturnTime] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 16);
  });
  const [items, setItems] = useState<ItemEntry[]>([
    { id: "new-1", itemName: "", quantity: 1, isValuable: false, remark: "" },
  ]);
  const [toast, setToast] = useState<string>("");

  const selectedBaskets = availableBaskets.filter((b) =>
    selectedIds.includes(b.id)
  );
  const hasValuable = items.some((i) => i.isValuable);

  const toggleBasket = (b: Basket) => {
    setSelectedIds((prev) =>
      prev.includes(b.id) ? prev.filter((i) => i !== b.id) : [...prev, b.id]
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        itemName: "",
        quantity: 1,
        isValuable: false,
        remark: "",
      },
    ]);
  };
  const removeItem = (id: string) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));
  };
  const updateItem = (id: string, patch: Partial<ItemEntry>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const validate = () => {
    if (selectedIds.length === 0) return "请至少选择一只篮子";
    if (!borrowerName.trim()) return "请填写借用人姓名";
    if (!purpose.trim()) return "请填写借出用途";
    if (!expectedReturnTime) return "请选择预计归还时间";
    if (items.every((i) => !i.itemName.trim())) return "请至少填写一项物品";
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setToast(err);
      setTimeout(() => setToast(""), 3000);
      return;
    }
    const validItems = items.filter((i) => i.itemName.trim());
    createLendRecord({
      basketIds: selectedIds,
      borrowerName: borrowerName.trim(),
      department,
      purpose: purpose.trim(),
      destination,
      expectedReturnTime: new Date(expectedReturnTime).toISOString(),
      items: validItems,
      hasValuable,
    });
    setToast("借出登记成功！");
    setTimeout(() => {
      setToast("");
      navigate("/");
    }, 1200);
  };

  return (
    <div className="space-y-5 animate-slide-up max-w-6xl mx-auto">
      {toast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg bg-steel-700 text-white text-sm font-medium animate-slide-up flex items-center gap-2">
          {toast.includes("成功") ? (
            <CheckCircle className="w-4 h-4 text-forest-300" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-300" />
          )}
          {toast}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="card overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-steel-50 to-white border-b border-slate2-200 flex items-center justify-between">
              <h3 className="font-display font-semibold text-slate2-800 flex items-center gap-2">
                <ShoppingBasket className="w-5 h-5 text-steel-600" />
                选择可用储物篮
              </h3>
              <span className="text-xs text-slate2-500">
                已选{" "}
                <b className="font-mono text-steel-600">{selectedIds.length}</b> /{" "}
                {availableBaskets.length} 只
              </span>
            </div>
            <div className="p-4 max-h-[420px] overflow-y-auto scrollbar-thin">
              {availableBaskets.length === 0 ? (
                <div className="py-12 text-center">
                  <Package className="w-12 h-12 text-slate2-300 mx-auto mb-3" />
                  <p className="text-slate2-500 text-sm">
                    当前没有可用的储物篮，请先处理归还或新增篮子
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableBaskets.map((b) => {
                    const selected = selectedIds.includes(b.id);
                    return (
                      <div
                        key={b.id}
                        onClick={() => toggleBasket(b)}
                        className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selected
                            ? "border-steel-500 bg-steel-50/60 shadow-industrial"
                            : "border-slate2-200 bg-white hover:border-steel-300 hover:bg-steel-50/30"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-14 h-14 rounded-lg border-2 border-white shadow-md flex-shrink-0"
                            style={{ background: b.colorHex }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-mono text-sm font-bold text-slate2-800 truncate">
                                {b.code}
                              </p>
                              <span className="px-1.5 py-0.5 rounded bg-steel-100 text-steel-700 text-[10px] font-mono font-bold">
                                {b.size}
                              </span>
                              {b.hasValuableTag && (
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-slate2-500 truncate">
                              {b.color} · {sizeLabel[b.size]}
                            </p>
                            <p className="text-xs text-slate2-400 truncate mt-0.5">
                              {b.defaultLocation} · ≤{b.maxLoadKg}kg
                            </p>
                          </div>
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              selected
                                ? "bg-steel-600 border-steel-600"
                                : "border-slate2-300 bg-white"
                            }`}
                          >
                            {selected && (
                              <span className="text-white text-xs">✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div
              className={`px-5 py-4 border-b border-slate2-200 flex items-center justify-between ${
                hasValuable
                  ? "bg-gradient-to-r from-amber-50 to-white"
                  : "bg-gradient-to-r from-slate2-50 to-white"
              }`}
            >
              <h3 className="font-display font-semibold text-slate2-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate2-600" />
                物品清单
              </h3>
              {hasValuable && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                  <Star className="w-3 h-3 fill-amber-500" />
                  含贵重物品
                </span>
              )}
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate2-500 px-2 border-b border-slate2-100 pb-2">
                <div className="col-span-1">#</div>
                <div className="col-span-5">物品名称</div>
                <div className="col-span-2 text-center">数量</div>
                <div className="col-span-3">备注</div>
                <div className="col-span-1" />
              </div>
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className={`grid grid-cols-12 gap-2 items-center p-2 rounded-md transition-all ${
                    item.isValuable ? "bg-amber-50/70" : "hover:bg-slate2-50"
                  }`}
                >
                  <div className="col-span-1 flex items-center gap-1">
                    <span className="text-sm font-mono text-slate2-400 w-6">
                      {idx + 1}
                    </span>
                    <button
                      type="button"
                      title={item.isValuable ? "取消贵重" : "标记为贵重物品"}
                      onClick={() =>
                        updateItem(item.id, { isValuable: !item.isValuable })
                      }
                      className={`p-1 rounded transition ${
                        item.isValuable
                          ? "text-amber-500 hover:bg-amber-100"
                          : "text-slate2-300 hover:text-amber-500 hover:bg-amber-50"
                      }`}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          item.isValuable ? "fill-amber-500" : ""
                        }`}
                      />
                    </button>
                  </div>
                  <div className="col-span-5">
                    <input
                      value={item.itemName}
                      onChange={(e) =>
                        updateItem(item.id, { itemName: e.target.value })
                      }
                      placeholder="物品名称"
                      className="input-base !py-1.5 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, {
                          quantity: Math.max(1, Number(e.target.value) || 1),
                        })
                      }
                      className="input-base !py-1.5 text-sm text-center font-mono"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      value={item.remark || ""}
                      onChange={(e) =>
                        updateItem(item.id, { remark: e.target.value })
                      }
                      placeholder="备注"
                      className="input-base !py-1.5 text-sm"
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 rounded text-slate2-400 hover:text-signal-500 hover:bg-signal-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="w-full py-2.5 rounded-md border-2 border-dashed border-slate2-200 text-sm text-slate2-500 hover:border-steel-400 hover:text-steel-600 hover:bg-steel-50/30 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                添加物品
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5 space-y-4 sticky top-24">
            <h3 className="font-display font-semibold text-slate2-800 border-b border-slate2-100 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-steel-600" />
              借用信息登记
            </h3>

            <div>
              <label className="label-base flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                借用人 <span className="text-signal-500">*</span>
              </label>
              <input
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                placeholder="请输入姓名"
                className="input-base"
              />
            </div>

            <div>
              <label className="label-base flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                所属部门
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="input-base"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-base flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                借出用途 <span className="text-signal-500">*</span>
              </label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={3}
                placeholder="如：季度营销会议物料、客户拜访礼品等"
                className="input-base resize-none"
              />
            </div>

            <div>
              <label className="label-base flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                目的地会议室
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="input-base"
              >
                {MEETING_ROOMS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-base flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                预计归还时间 <span className="text-signal-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={expectedReturnTime}
                onChange={(e) => setExpectedReturnTime(e.target.value)}
                className="input-base font-mono text-sm"
              />
            </div>

            {selectedBaskets.length > 0 && (
              <div className="p-3 rounded-lg bg-slate2-50 border border-slate2-200">
                <p className="text-xs font-semibold text-slate2-600 mb-2">
                  待借出篮子汇总
                </p>
                <div className="space-y-1.5">
                  {selectedBaskets.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span
                        className={`status-badge !text-[10px] !py-0.5 ${basketStatusClass.available}`}
                      >
                        {basketStatusLabel[b.status]}
                      </span>
                      <span className="font-mono font-semibold text-slate2-700 flex-1">
                        {b.code}
                      </span>
                      {b.hasValuableTag && (
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate2-100 space-y-2">
              <div className="text-xs text-slate2-500">
                借出时间：
                <span className="font-mono text-slate2-700 ml-1">
                  {formatDateTime(new Date().toISOString())}
                </span>
              </div>
              <button
                type="submit"
                className="btn-primary w-full !py-3"
              >
                <ArrowRight className="w-4 h-4" />
                确认借出登记
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
