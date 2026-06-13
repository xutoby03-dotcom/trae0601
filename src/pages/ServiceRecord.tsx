import { useState } from "react";
import {
  MapPin,
  Clock,
  User,
  Check,
  Camera,
  Upload,
  Droplets,
  Scissors,
  Leaf,
  Flower2,
  Bug,
  AlertCircle,
} from "lucide-react";
import { useStore } from "@/store";
import { OperationType, OPERATION_LABELS } from "@/types";
import { formatDateTime, generateId } from "@/utils/date";

const OPERATION_CONFIG: {
  type: OperationType;
  icon: typeof Droplets;
  label: string;
  color: string;
}[] = [
  { type: "watering", icon: Droplets, label: "浇水", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { type: "pruning", icon: Scissors, label: "修剪", color: "bg-forest-50 border-forest-200 text-forest-700" },
  { type: "fertilizing", icon: Leaf, label: "施肥", color: "bg-moss-50 border-moss-200 text-moss-700" },
  { type: "repotting", icon: Flower2, label: "换盆", color: "bg-amber-50 border-amber-200 text-amber-700" },
  { type: "pest_control", icon: Bug, label: "病虫处理", color: "bg-red-50 border-red-200 text-red-700" },
];

const SAMPLE_PHOTOS = [
  "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=plant%20care%20watering%20service%20green%20leaves%20office&image_size=square",
  "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=gardener%20pruning%20indoor%20plant%20professional%20service&image_size=square",
  "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=plant%20fertilizing%20nutrient%20soil%20green%20foliage&image_size=square",
];

export default function ServiceRecordPage() {
  const plants = useStore((s) => s.plants);
  const staffs = useStore((s) => s.staffs.filter((s) => s.role === "maintenance"));
  const records = useStore((s) => s.serviceRecords);
  const getStaffById = useStore((s) => s.getStaffById);
  const addServiceRecord = useStore((s) => s.addServiceRecord);

  const [checkedIn, setCheckedIn] = useState(false);
  const [checkinTime, setCheckinTime] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(staffs[0]?.id || "");
  const [selectedPlant, setSelectedPlant] = useState("");
  const [operations, setOperations] = useState<OperationType[]>([]);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const toggleOperation = (op: OperationType) => {
    setOperations((prev) =>
      prev.includes(op) ? prev.filter((o) => o !== op) : [...prev, op]
    );
  };

  const handleCheckin = () => {
    setCheckinTime(new Date().toISOString());
    setCheckedIn(true);
  };

  const handleAddPhoto = () => {
    const sampleUrl = SAMPLE_PHOTOS[photos.length % SAMPLE_PHOTOS.length];
    setPhotos([...photos, sampleUrl]);
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (!selectedPlant || operations.length === 0) return;

    addServiceRecord({
      plantId: selectedPlant,
      staffId: selectedStaff,
      checkinAt: checkinTime,
      operations,
      notes,
      photos: photos.map((url, idx) => ({
        id: generateId(),
        url,
        type: (["before", "after", "detail"] as const)[idx % 3],
      })),
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setCheckedIn(false);
      setSelectedPlant("");
      setOperations([]);
      setNotes("");
      setPhotos([]);
    }, 2000);
  };

  const selectedPlantData = plants.find((p) => p.id === selectedPlant);

  return (
    <div className="grid grid-cols-5 gap-6">
      <div className="col-span-3 space-y-6">
        <div className="bg-white rounded-3xl shadow-card border border-forest-50 overflow-hidden">
          <div className="p-8 bg-gradient-to-br from-forest-700 via-forest-800 to-forest-900 text-white">
            <h2 className="font-serif text-2xl font-semibold">养护服务打卡</h2>
            <p className="text-forest-200 mt-1">
              记录到场时间、养护操作和现场照片
            </p>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-2">
                  养护人员
                </label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  disabled={checkedIn}
                  className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-white disabled:bg-cream-50 disabled:text-forest-500"
                >
                  {staffs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-2">
                  到场时间
                </label>
                <div className="px-4 py-3 rounded-xl border border-forest-200 bg-cream-50 text-forest-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-forest-400" />
                  {checkinTime ? formatDateTime(checkinTime) : "未打卡"}
                </div>
              </div>
            </div>

            {!checkedIn ? (
              <button
                onClick={handleCheckin}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-forest-600 to-forest-800 text-white font-semibold text-lg hover:shadow-lg hover:shadow-forest-200 transition-all flex items-center justify-center gap-3"
              >
                <User className="w-6 h-6" />
                到场打卡
              </button>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-2">
                    选择服务绿植
                  </label>
                  <select
                    value={selectedPlant}
                    onChange={(e) => setSelectedPlant(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-white"
                  >
                    <option value="">请选择...</option>
                    {plants.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.species} - {p.location}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPlantData && (
                  <div className="p-4 rounded-xl bg-cream-50 border border-cream-200 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white flex-shrink-0">
                      <img
                        src={selectedPlantData.photoUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-forest-800">
                        {selectedPlantData.species}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-forest-500">
                        <MapPin className="w-3.5 h-3.5" />
                        {selectedPlantData.location}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-3">
                    养护操作
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {OPERATION_CONFIG.map(({ type, icon: Icon, label, color }) => (
                      <button
                        key={type}
                        onClick={() => toggleOperation(type)}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                          operations.includes(type)
                            ? color + " border-current shadow-md"
                            : "bg-white border-forest-100 text-forest-400 hover:border-forest-300 hover:text-forest-600"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-sm font-medium">{label}</span>
                        {operations.includes(type) && (
                          <Check className="w-4 h-4 absolute top-2 right-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-3">
                    现场照片（{photos.length}）
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {photos.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative w-24 h-24 rounded-xl overflow-hidden border border-forest-200"
                      >
                        <img
                          src={url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={handleAddPhoto}
                      className="w-24 h-24 rounded-xl border-2 border-dashed border-forest-300 bg-cream-50 hover:bg-cream-100 flex flex-col items-center justify-center gap-1 text-forest-500 transition-colors"
                    >
                      <Camera className="w-6 h-6" />
                      <span className="text-xs">添加照片</span>
                    </button>
                  </div>
                  {photos.length === 0 && (
                    <p className="text-xs text-amber-warning mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      建议上传至少1张现场照片
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-2">
                    备注
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="记录特殊情况或其他说明..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-white resize-none focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!selectedPlant || operations.length === 0}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-forest-600 to-forest-800 text-white font-semibold hover:shadow-lg hover:shadow-forest-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-5 h-5" />
                  提交养护记录
                </button>
              </>
            )}
          </div>
        </div>

        {showSuccess && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-4 bg-forest-700 text-white rounded-2xl shadow-lg animate-slide-up flex items-center gap-2 z-50">
            <Check className="w-5 h-5" />
            养护记录提交成功！
          </div>
        )}
      </div>

      <div className="col-span-2">
        <div className="bg-white rounded-2xl shadow-card border border-forest-50 overflow-hidden sticky top-28">
          <div className="p-5 border-b border-forest-50 bg-cream-50">
            <h3 className="font-serif text-lg font-semibold text-forest-800">
              历史记录
            </h3>
            <p className="text-sm text-forest-500 mt-0.5">最近 10 条服务记录</p>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {records.slice(0, 10).map((r, idx) => {
              const plant = plants.find((p) => p.id === r.plantId);
              const staff = getStaffById(r.staffId);
              return (
                <div
                  key={r.id}
                  className="p-4 border-b border-forest-50 last:border-0 hover:bg-cream-50 transition-colors animate-slide-up"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                      {plant?.photoUrl && (
                        <img
                          src={plant.photoUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-forest-800 text-sm truncate">
                          {plant?.species}
                        </span>
                        <span className="text-xs text-forest-400 flex-shrink-0 ml-2">
                          {formatDateTime(r.checkinAt)}
                        </span>
                      </div>
                      <p className="text-xs text-forest-500 mt-0.5">
                        {staff?.name} · {plant?.location}
                      </p>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {r.operations.map((op) => (
                          <span
                            key={op}
                            className="text-[10px] px-1.5 py-0.5 bg-forest-50 text-forest-600 rounded"
                          >
                            {OPERATION_LABELS[op]}
                          </span>
                        ))}
                        {r.photos.length > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-cream-100 text-moss-600 rounded flex items-center gap-0.5">
                            <Camera className="w-2.5 h-2.5" />
                            {r.photos.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
