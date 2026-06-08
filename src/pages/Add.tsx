import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScanLine } from "lucide-react";
import { useFridgeStore } from "@/store/useFridgeStore";
import IconPicker from "@/components/IconPicker";
import { getIconForName } from "@/utils/recipeMatcher";
import {
  type FoodCategory,
  type FoodUnit,
  type StorageLocation,
  CATEGORY_LABELS,
  LOCATION_LABELS,
  UNIT_OPTIONS,
} from "@/types";
import { cn } from "@/lib/utils";

const CATEGORY_KEYS = Object.keys(CATEGORY_LABELS) as FoodCategory[];
const LOCATION_KEYS = Object.keys(LOCATION_LABELS) as StorageLocation[];

const DEMO_DATA = {
  name: "鸡蛋",
  category: "dairy" as FoodCategory,
  quantity: 6,
  unit: "个" as FoodUnit,
  purchaseDate: new Date().toISOString().split("T")[0],
  shelfLifeDays: 14,
  storageLocation: "fridge" as StorageLocation,
  icon: "🥚",
  lowThreshold: 2,
};

export default function Add() {
  const navigate = useNavigate();
  const addFoodItem = useFridgeStore((s) => s.addFoodItem);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<FoodCategory>("other");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<FoodUnit>("个");
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [shelfLifeDays, setShelfLifeDays] = useState(7);
  const [storageLocation, setStorageLocation] =
    useState<StorageLocation>("fridge");
  const [icon, setIcon] = useState("📦");
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [lowThreshold, setLowThreshold] = useState(1);

  const handleNameChange = (val: string) => {
    setName(val);
    const matched = getIconForName(val);
    if (matched !== "📦") {
      setIcon(matched);
    }
  };

  const handleScan = () => {
    setName(DEMO_DATA.name);
    setCategory(DEMO_DATA.category);
    setQuantity(DEMO_DATA.quantity);
    setUnit(DEMO_DATA.unit);
    setPurchaseDate(DEMO_DATA.purchaseDate);
    setShelfLifeDays(DEMO_DATA.shelfLifeDays);
    setStorageLocation(DEMO_DATA.storageLocation);
    setIcon(DEMO_DATA.icon);
    setLowThreshold(DEMO_DATA.lowThreshold);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    addFoodItem({
      name: name.trim(),
      category,
      quantity,
      unit,
      purchaseDate,
      shelfLifeDays,
      storageLocation,
      icon,
      photo,
      lowThreshold,
    });

    navigate("/");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">入库</h1>
          <p className="mt-1 text-sm text-gray-400">添加新食材到冰箱</p>
        </div>
        <button
          type="button"
          onClick={handleScan}
          className="flex items-center gap-1.5 rounded-xl bg-[#4ECDC4]/10 px-4 py-2.5 text-sm font-medium text-[#4ECDC4] transition-colors hover:bg-[#4ECDC4]/20 active:bg-[#4ECDC4]/30"
        >
          <ScanLine className="h-4 w-4" />
          扫码入库
        </button>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            食材名称 <span className="text-red-400">*</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="输入食材名称"
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-300 focus:border-[#4ECDC4]"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            分类
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as FoodCategory)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-[#4ECDC4]"
          >
            {CATEGORY_KEYS.map((key) => (
              <option key={key} value={key}>
                {CATEGORY_LABELS[key]}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                数量
              </label>
              <input
                type="number"
                min={0}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-[#4ECDC4]"
              />
            </div>
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                单位
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as FoodUnit)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-[#4ECDC4]"
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            买入日期
          </label>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-[#4ECDC4]"
          />
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            保质期(天)
          </label>
          <input
            type="number"
            min={1}
            value={shelfLifeDays}
            onChange={(e) => setShelfLifeDays(Number(e.target.value))}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-[#4ECDC4]"
          />
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            存放位置
          </label>
          <div className="flex flex-wrap gap-2">
            {LOCATION_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setStorageLocation(key)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all duration-150",
                  storageLocation === key
                    ? "bg-[#4ECDC4] text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                )}
              >
                {LOCATION_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            低量提醒阈值
          </label>
          <input
            type="number"
            min={1}
            value={lowThreshold}
            onChange={(e) => setLowThreshold(Number(e.target.value))}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-[#4ECDC4]"
          />
        </div>

        <IconPicker value={icon} onChange={setIcon} onPhotoChange={setPhoto} />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!name.trim()}
        className={cn(
          "w-full rounded-2xl py-3.5 text-base font-semibold text-white shadow-lg transition-all duration-200",
          name.trim()
            ? "bg-[#4ECDC4] hover:bg-[#3fbdb5] active:bg-[#35aca4]"
            : "cursor-not-allowed bg-gray-300"
        )}
      >
        保存入库
      </button>
    </div>
  );
}
