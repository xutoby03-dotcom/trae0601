import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "@/store";
import { getCategory } from "@/data/constants";
import { formatDate } from "@/utils/format";
import EquipmentPhoto from "@/components/EquipmentPhoto";
import {
  ArrowLeft,
  CheckCircle,
  Droplets,
  PackageOpen,
  AlertTriangle,
  Battery,
  FileText,
  Send,
  Sun,
  Wrench,
  ShoppingCart,
  CheckCircle2,
  X,
} from "lucide-react";

interface CheckItemState {
  equipmentId: string;
  hasDirt: boolean;
  isWet: boolean;
  isMissingParts: boolean;
  isDamaged: boolean;
  batteryLevel?: number;
  notes: string;
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0 ${
        checked ? "bg-forest-600" : "bg-gray-300"
      } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 flex items-center justify-center ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function CheckToggleRow({
  icon: Icon,
  label,
  checked,
  onChange,
  color,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  color?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-2 flex-1 ${
          color || (checked ? "text-forest-700" : "text-forest-500")
        }`}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

export default function ReturnCheck() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const {
    getTrip,
    getTripPackingItems,
    getEquipment,
    getTripReturnChecks,
    completeReturnCheck,
  } = useStore();

  const trip = tripId ? getTrip(tripId) : undefined;
  const existingChecks = tripId ? getTripReturnChecks(tripId) : [];
  const isViewMode = existingChecks.length > 0;

  const packingItems = tripId ? getTripPackingItems(tripId) : [];

  const equipmentList = useMemo(() => {
    return packingItems
      .map((pi) => getEquipment(pi.equipmentId))
      .filter((e): e is NonNullable<typeof e> => e !== undefined);
  }, [packingItems, getEquipment]);

  const [checkStates, setCheckStates] = useState<Record<string, CheckItemState>>(() => {
    const result: Record<string, CheckItemState> = {};
    equipmentList.forEach((eq) => {
      const existing = existingChecks.find((c) => c.equipmentId === eq.id);
      if (existing) {
        result[eq.id] = {
          equipmentId: eq.id,
          hasDirt: existing.hasDirt,
          isWet: existing.isWet,
          isMissingParts: existing.isMissingParts,
          isDamaged: existing.isDamaged,
          batteryLevel: existing.batteryLevel,
          notes: existing.notes || "",
        };
      } else {
        result[eq.id] = {
          equipmentId: eq.id,
          hasDirt: false,
          isWet: false,
          isMissingParts: false,
          isDamaged: false,
          batteryLevel: eq.batteryLevel,
          notes: "",
        };
      }
    });
    return result;
  });

  const [showResult, setShowResult] = useState(false);
  const [resultStats, setResultStats] = useState({
    wet: 0,
    damaged: 0,
    missing: 0,
    normal: 0,
    total: 0,
  });

  const updateCheck = (equipmentId: string, patch: Partial<CheckItemState>) => {
    setCheckStates((prev) => ({
      ...prev,
      [equipmentId]: { ...prev[equipmentId], ...patch },
    }));
  };

  const handleSubmit = () => {
    if (!tripId) return;

    const checks = Object.values(checkStates).map((c) => ({
      equipmentId: c.equipmentId,
      hasDirt: c.hasDirt,
      isWet: c.isWet,
      isMissingParts: c.isMissingParts,
      isDamaged: c.isDamaged,
      batteryLevel: c.batteryLevel,
      notes: c.notes || undefined,
    }));

    let wetCount = 0;
    let damagedCount = 0;
    let missingCount = 0;
    let normalCount = 0;
    checks.forEach((c) => {
      if (c.isWet) wetCount++;
      if (c.isDamaged) damagedCount++;
      if (c.isMissingParts) missingCount++;
      if (!c.isWet && !c.isDamaged && !c.isMissingParts) normalCount++;
    });

    completeReturnCheck(tripId, checks);

    setResultStats({
      wet: wetCount,
      damaged: damagedCount,
      missing: missingCount,
      normal: normalCount,
      total: checks.length,
    });
    setShowResult(true);
  };

  if (!trip) {
    return (
      <div className="card p-12 text-center">
        <PackageOpen className="w-16 h-16 text-forest-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-forest-700 mb-2">活动不存在</h3>
        <button onClick={() => navigate("/trips")} className="btn btn-primary mt-4">
          <ArrowLeft className="w-4 h-4" />
          返回活动列表
        </button>
      </div>
    );
  }

  if (equipmentList.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-forest-500">
          <button
            onClick={() => navigate("/trips")}
            className="hover:text-forest-700 flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            露营活动
          </button>
          <span>/</span>
          <span className="text-forest-700 font-medium truncate">{trip.name}</span>
          <span>/</span>
          <span>归还检查</span>
        </div>

        <div className="card p-12 text-center">
          <PackageOpen className="w-16 h-16 text-forest-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-forest-700 mb-2">
            没有需要检查的装备
          </h3>
          <p className="text-forest-500 mb-4">该活动的装箱清单为空</p>
          <button onClick={() => navigate("/trips")} className="btn btn-primary">
            <ArrowLeft className="w-4 h-4" />
            返回活动列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28">
      <div className="flex items-center gap-2 text-sm text-forest-500">
        <button
          onClick={() => navigate("/trips")}
          className="hover:text-forest-700 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          露营活动
        </button>
        <span>/</span>
        <span className="text-forest-700 font-medium truncate">{trip.name}</span>
        <span>/</span>
        <span className="text-forest-700 font-medium">
          {isViewMode ? "查看归还" : "归还检查"}
        </span>
      </div>

      <div className="card p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-forest-800 mb-1">
              {isViewMode ? "查看归还检查" : "归还检查"}
            </h1>
            <p className="text-forest-500 text-sm">
              {trip.location} · {formatDate(trip.startDate)} ~{" "}
              {formatDate(trip.endDate)}
            </p>
          </div>
          <button
            onClick={() => navigate("/trips")}
            className="btn btn-ghost btn-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-forest-500">
          <span className="badge bg-forest-50 text-forest-700">
            共 {equipmentList.length} 件装备待检查
          </span>
          {isViewMode && (
            <span className="badge bg-gray-100 text-gray-600">
              已完成检查 · {formatDate(existingChecks[0]?.checkedAt)}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4 max-h-[calc(100vh-420px)] overflow-y-auto pr-1 scrollbar-thin">
        {equipmentList.map((equipment) => {
          const cat = getCategory(equipment.category);
          const state = checkStates[equipment.id];
          const isLighting = equipment.category === "lighting";
          const anyIssue =
            state?.hasDirt ||
            state?.isWet ||
            state?.isMissingParts ||
            state?.isDamaged;

          return (
            <div
              key={equipment.id}
              className={`card overflow-hidden ${
                isViewMode && anyIssue ? "ring-1 ring-amber-200" : ""
              }`}
            >
              <div className="flex gap-4 p-4">
                <EquipmentPhoto
                  photo={equipment.photo}
                  category={equipment.category}
                  className="w-24 h-24 rounded-xl flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <div className="font-semibold text-forest-800 truncate">
                        {equipment.name}
                      </div>
                      <div className="text-xs text-forest-400 mt-0.5">
                        {equipment.code} · {equipment.storageBox}
                      </div>
                    </div>
                    <span
                      className={`badge ${cat.bgColor} ${cat.color} flex-shrink-0`}
                    >
                      {cat.emoji} {cat.name}
                    </span>
                  </div>

                  {isViewMode && anyIssue && (
                    <div className="inline-flex items-center gap-1 mt-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      <AlertTriangle className="w-3 h-3" />
                      发现问题
                    </div>
                  )}
                </div>
              </div>

              <div className="px-4 pb-4 space-y-3 border-t border-forest-50 pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <CheckToggleRow
                    icon={PackageOpen}
                    label="有泥土"
                    checked={state?.hasDirt || false}
                    onChange={(v) => updateCheck(equipment.id, { hasDirt: v })}
                    disabled={isViewMode}
                    color={state?.hasDirt ? "text-amber-700" : undefined}
                  />
                  <CheckToggleRow
                    icon={Droplets}
                    label="潮湿"
                    checked={state?.isWet || false}
                    onChange={(v) => updateCheck(equipment.id, { isWet: v })}
                    disabled={isViewMode}
                    color={state?.isWet ? "text-sky2-700" : undefined}
                  />
                  <CheckToggleRow
                    icon={AlertTriangle}
                    label="缺件"
                    checked={state?.isMissingParts || false}
                    onChange={(v) =>
                      updateCheck(equipment.id, { isMissingParts: v })
                    }
                    disabled={isViewMode}
                    color={state?.isMissingParts ? "text-amber-700" : undefined}
                  />
                  <CheckToggleRow
                    icon={CheckCircle}
                    label="破损"
                    checked={state?.isDamaged || false}
                    onChange={(v) => updateCheck(equipment.id, { isDamaged: v })}
                    disabled={isViewMode}
                    color={state?.isDamaged ? "text-red-600" : undefined}
                  />
                </div>

                {isLighting && (
                  <div className="pt-2 border-t border-forest-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-forest-600">
                        <Battery className="w-4 h-4" />
                        <span className="text-sm font-medium">剩余电量</span>
                      </div>
                      <span className="text-sm font-semibold text-forest-800">
                        {state?.batteryLevel ?? 0}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={state?.batteryLevel ?? 0}
                      onChange={(e) =>
                        updateCheck(equipment.id, {
                          batteryLevel: Number(e.target.value),
                        })
                      }
                      disabled={isViewMode}
                      className="w-full h-2 bg-forest-100 rounded-lg appearance-none cursor-pointer accent-forest-600 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                )}

                <div className="pt-2 border-t border-forest-50">
                  <label className="label flex items-center gap-1.5 mb-1.5">
                    <FileText className="w-4 h-4 text-forest-400" />
                    备注
                  </label>
                  <textarea
                    className="input min-h-[60px] resize-y text-sm"
                    value={state?.notes || ""}
                    onChange={(e) =>
                      updateCheck(equipment.id, { notes: e.target.value })
                    }
                    placeholder="描述发现的问题或其他备注..."
                    disabled={isViewMode}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!isViewMode && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 lg:right-0 p-4 bg-gradient-to-t from-cream via-cream/95 to-transparent">
          <div className="container max-w-6xl mx-auto">
            <button
              onClick={handleSubmit}
              className="btn btn-primary w-full lg:w-auto lg:ml-auto py-3 text-base shadow-lg"
            >
              <Send className="w-5 h-5" />
              提交检查结果
            </button>
          </div>
        </div>
      )}

      {showResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-md animate-count-up shadow-2xl">
            <div className="p-6 border-b border-forest-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-6 h-6 text-forest-600" />
                    <h2 className="text-xl font-bold text-forest-800 font-serif">
                      检查完成
                    </h2>
                  </div>
                  <p className="text-forest-500 text-sm">
                    共检查 {resultStats.total} 件装备，已自动生成后续处理记录
                  </p>
                </div>
                <button
                  onClick={() => setShowResult(false)}
                  className="p-1.5 rounded-lg hover:bg-forest-100 text-forest-400 hover:text-forest-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-3">
              {resultStats.wet > 0 && (
                <button
                  onClick={() => navigate("/drying")}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-sky2-50 border border-sky2-200 hover:bg-sky2-100 hover:border-sky2-300 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-sky2-400 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Sun className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-sky2-800">
                      需晾晒
                    </div>
                    <div className="text-xs text-sky2-600">
                      点击进入晾晒管理页面
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-sky2-700 font-serif">
                      {resultStats.wet}
                    </div>
                    <div className="text-xs text-sky2-500">件</div>
                  </div>
                </button>
              )}

              {resultStats.damaged > 0 && (
                <button
                  onClick={() => navigate("/maintenance?tab=repair")}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Wrench className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-red-800">
                      需维修
                    </div>
                    <div className="text-xs text-red-600">
                      点击进入维修管理
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-700 font-serif">
                      {resultStats.damaged}
                    </div>
                    <div className="text-xs text-red-500">件</div>
                  </div>
                </button>
              )}

              {resultStats.missing > 0 && (
                <button
                  onClick={() => navigate("/maintenance?tab=purchase")}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 hover:border-amber-300 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-amber-800">
                      需补购
                    </div>
                    <div className="text-xs text-amber-600">
                      点击进入补购清单
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-amber-700 font-serif">
                      {resultStats.missing}
                    </div>
                    <div className="text-xs text-amber-500">件</div>
                  </div>
                </button>
              )}

              {resultStats.normal > 0 && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-forest-50 border border-forest-200">
                  <div className="w-12 h-12 rounded-xl bg-forest-500 flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-forest-800">
                      正常入库
                    </div>
                    <div className="text-xs text-forest-600">
                      状态良好，无需额外处理
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-forest-700 font-serif">
                      {resultStats.normal}
                    </div>
                    <div className="text-xs text-forest-500">件</div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 pt-2 border-t border-forest-100 flex gap-3">
              <button
                onClick={() => setShowResult(false)}
                className="btn btn-secondary flex-1"
              >
                留在此页
              </button>
              <button
                onClick={() => navigate("/trips")}
                className="btn btn-primary flex-1"
              >
                返回活动列表
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
