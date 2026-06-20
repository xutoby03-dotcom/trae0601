import { useEffect, useState } from "react";
import { useDryingStore } from "@/store/dryingStore";
import { useMemberStore } from "@/store/memberStore";
import { clothingTypes, locations } from "@/data/mockData";
import { nowIso, hoursFromNowIso } from "@/utils/time";
import { X, Camera, Plus } from "lucide-react";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function DryingForm({ onClose, onSuccess }: Props) {
  const { addRecord } = useDryingStore();
  const { members } = useMemberStore();

  const [clothingType, setClothingType] = useState("T恤");
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState(locations[0]);
  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });
  const [expectedHours, setExpectedHours] = useState(4);
  const [ownerId, setOwnerId] = useState(members[0]?.id || "");
  const [photo, setPhoto] = useState<string>("");
  const [customType, setCustomType] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const owner = members.find((m) => m.id === ownerId);
    if (!owner) return;

    const start = new Date(startTime).toISOString();
    const expected = new Date(new Date(start).getTime() + expectedHours * 3600000).toISOString();

    const finalType = showCustom && customType.trim() ? customType.trim() : clothingType;

    addRecord({
      clothingType: finalType,
      quantity,
      location,
      startTime: start || nowIso(),
      expectedTime: expected || hoursFromNowIso(expectedHours),
      owner: owner.name,
      ownerId,
      photo: photo || undefined,
    });
    onSuccess();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-sky-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 pb-3 bg-gradient-to-br from-sky-50 to-sun-400/10 flex justify-between items-start flex-shrink-0">
          <div>
            <h3 className="font-display text-2xl text-sky-800 flex items-center gap-2">
              <Plus className="w-6 h-6" />
              新增晾晒记录
            </h3>
            <p className="text-sky-500 text-sm mt-1">记录衣物信息，开始晾晒计时</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-white/60 flex items-center justify-center text-sky-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="label-text">
                衣物类型 <span className="text-warn-red">*</span>
              </label>
              {!showCustom ? (
                <select
                  className="input-field"
                  value={clothingType}
                  onChange={(e) => setClothingType(e.target.value)}
                >
                  {clothingTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="input-field"
                  placeholder="输入衣物类型"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                />
              )}
              <button
                type="button"
                className="text-xs text-sky-500 hover:text-sky-700 mt-1.5 underline underline-offset-2"
                onClick={() => {
                  setShowCustom(!showCustom);
                  setCustomType("");
                }}
              >
                {showCustom ? "← 选择常见类型" : "自定义类型 →"}
              </button>
            </div>

            <div className="w-28">
              <label className="label-text">
                数量 <span className="text-warn-red">*</span>
              </label>
              <div className="flex items-center bg-white/70 border-2 border-sky-100 rounded-xl overflow-hidden focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-200">
                <button
                  type="button"
                  className="w-10 h-11 text-sky-600 hover:bg-sky-50 text-xl"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  className="flex-1 h-11 text-center outline-none bg-transparent"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                />
                <button
                  type="button"
                  className="w-10 h-11 text-sky-600 hover:bg-sky-50 text-xl"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="label-text">
              晾晒位置 <span className="text-warn-red">*</span>
            </label>
            <select
              className="input-field"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              {locations.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">开始晾晒时间</label>
              <input
                type="datetime-local"
                className="input-field"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="label-text">预计晾晒时长（小时）</label>
              <div className="flex gap-2">
                {[2, 4, 6, 8].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setExpectedHours(h)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                      expectedHours === h
                        ? "bg-sky-400 text-white shadow-md"
                        : "bg-sky-50 text-sky-600 hover:bg-sky-100"
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={1}
                max={72}
                className="input-field mt-2"
                value={expectedHours}
                onChange={(e) => setExpectedHours(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>
          </div>

          <div>
            <label className="label-text">
              负责人 <span className="text-warn-red">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setOwnerId(m.id)}
                  className={`p-3 rounded-2xl border-2 transition-all text-center ${
                    ownerId === m.id
                      ? "shadow-md"
                      : "border-sky-100 bg-white/60 hover:border-sky-200"
                  }`}
                  style={{
                    borderColor: ownerId === m.id ? m.color : undefined,
                    backgroundColor: ownerId === m.id ? `${m.color}15` : undefined,
                  }}
                >
                  <div className="text-2xl mb-1">{m.avatar}</div>
                  <div
                    className="text-xs font-medium"
                    style={{ color: ownerId === m.id ? m.color : "#4A6FA5" }}
                  >
                    {m.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label-text">衣物照片（可选）</label>
            <div
              className="border-2 border-dashed border-sky-200 rounded-2xl p-4 text-center hover:border-sky-300 hover:bg-sky-50/50 transition-all cursor-pointer relative overflow-hidden"
              onClick={() => document.getElementById("photo-upload")?.click()}
            >
              {photo ? (
                <>
                  <img
                    src={photo}
                    alt="preview"
                    className="w-full h-36 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 text-warn-red flex items-center justify-center shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhoto("");
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="py-6">
                  <Camera className="w-10 h-10 text-sky-300 mx-auto mb-2" />
                  <p className="text-sm text-sky-500">点击上传衣物照片</p>
                  <p className="text-xs text-sky-400 mt-1">支持 JPG/PNG 格式</p>
                </div>
              )}
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>
          </div>
        </form>

        <div className="p-5 pt-3 flex gap-3 border-t border-sky-100/60 flex-shrink-0">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>
            取消
          </button>
          <button type="submit" className="btn-primary flex-1" onClick={handleSubmit}>
            <Plus className="w-4 h-4 inline mr-1" />
            开始晾晒
          </button>
        </div>
      </div>
    </div>
  );
}
