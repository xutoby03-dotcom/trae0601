import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "@/store";
import { CATEGORIES, getCategory, getStatus } from "@/data/constants";
import { formatDate } from "@/utils/format";
import {
  ArrowLeft,
  CheckSquare,
  Sparkles,
  Package,
  ChevronDown,
} from "lucide-react";
import type { EquipmentCategory, PackingItem } from "@/types";

interface GroupedItem {
  packingItem: PackingItem;
  equipment: ReturnType<typeof useStore.getState>["equipment"][number];
}

export default function PackingList() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const {
    getTrip,
    getTripPackingItems,
    getEquipment,
    togglePacked,
    generatePackingList,
  } = useStore();

  const trip = tripId ? getTrip(tripId) : undefined;
  const packingItems = tripId ? getTripPackingItems(tripId) : [];

  const itemsWithEquipment = useMemo(() => {
    return packingItems
      .map((pi) => {
        const eq = getEquipment(pi.equipmentId);
        if (!eq) return null;
        return { packingItem: pi, equipment: eq };
      })
      .filter((v): v is GroupedItem => v !== null);
  }, [packingItems, getEquipment]);

  const grouped = useMemo(() => {
    const result: Record<EquipmentCategory, GroupedItem[]> = {} as Record<
      EquipmentCategory,
      GroupedItem[]
    >;
    CATEGORIES.forEach((c) => {
      result[c.id] = [];
    });
    itemsWithEquipment.forEach((item) => {
      result[item.equipment.category].push(item);
    });
    return result;
  }, [itemsWithEquipment]);

  const totalCount = itemsWithEquipment.length;
  const packedCount = itemsWithEquipment.filter(
    (i) => i.packingItem.packed
  ).length;
  const progress = totalCount === 0 ? 0 : Math.round((packedCount / totalCount) * 100);

  if (!trip) {
    return (
      <div className="card p-12 text-center">
        <Package className="w-16 h-16 text-forest-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-forest-700 mb-2">活动不存在</h3>
        <button onClick={() => navigate("/trips")} className="btn btn-primary mt-4">
          <ArrowLeft className="w-4 h-4" />
          返回活动列表
        </button>
      </div>
    );
  }

  const nonEmptyCategories = CATEGORIES.filter(
    (c) => grouped[c.id] && grouped[c.id].length > 0
  );

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
      </div>

      <div className="card p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-forest-800 mb-1">
              装箱清单
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

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-forest-600">
              <CheckSquare className="w-4 h-4 inline mr-1.5" />
              装箱进度
            </span>
            <span className="font-semibold text-forest-800">
              {packedCount} / {totalCount} 件 · {progress}%
            </span>
          </div>
          <div className="h-3 bg-forest-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-forest-500 to-forest-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-forest-100">
          <button
            onClick={() => tripId && generatePackingList(tripId)}
            className="btn btn-sky w-full"
          >
            <Sparkles className="w-5 h-5" />
            一键添加可用装备
          </button>
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-16 h-16 text-forest-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-forest-700 mb-2">
            装箱清单为空
          </h3>
          <p className="text-forest-500 mb-4">
            点击上方"一键添加可用装备"快速添加所有可用装备
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {nonEmptyCategories.map((cat) => {
            const catItems = grouped[cat.id];
            const catPacked = catItems.filter(
              (i) => i.packingItem.packed
            ).length;
            const catProgress =
              catItems.length === 0
                ? 0
                : Math.round((catPacked / catItems.length) * 100);

            return (
              <div key={cat.id} className="card overflow-hidden">
                <div
                  className={`${cat.bgColor} px-5 py-3.5 flex items-center justify-between`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{cat.emoji}</span>
                    <span className={`font-semibold ${cat.color}`}>
                      {cat.name}
                    </span>
                    <span
                      className={`badge ${cat.bgColor} ${cat.color} border border-white/50`}
                    >
                      {catPacked}/{catItems.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-white/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          catProgress === 100 ? "bg-forest-500" : cat.bgColor.replace("bg-", "bg-").replace("-100", "-400")
                        } rounded-full`}
                        style={{ width: `${catProgress}%` }}
                      />
                    </div>
                    <ChevronDown className={`w-4 h-4 ${cat.color}`} />
                  </div>
                </div>

                <div className="divide-y divide-forest-50">
                  {catItems.map(({ packingItem, equipment }) => {
                    const eqStatus = getStatus(equipment.status);
                    const isPacked = packingItem.packed;

                    return (
                      <label
                        key={packingItem.id}
                        className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors hover:bg-forest-50/50 ${
                          isPacked ? "bg-forest-50/30" : ""
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => togglePacked(packingItem.id)}
                          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            isPacked
                              ? "bg-forest-600 border-forest-600 text-white"
                              : "border-forest-300 hover:border-forest-400 bg-white"
                          }`}
                        >
                          {isPacked && (
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-medium transition-colors ${
                              isPacked
                                ? "text-forest-400 line-through"
                                : "text-forest-800"
                            }`}
                          >
                            {equipment.name}
                          </div>
                          <div className="text-xs text-forest-400 mt-0.5">
                            {equipment.storageBox}
                            {equipment.code && ` · ${equipment.code}`}
                          </div>
                        </div>

                        <span
                          className={`badge ${eqStatus.bgColor} ${eqStatus.color} flex-shrink-0 ${
                            isPacked ? "opacity-50" : ""
                          }`}
                        >
                          {eqStatus.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
