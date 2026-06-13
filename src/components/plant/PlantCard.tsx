import { useNavigate } from "react-router-dom";
import { MapPin, Calendar } from "lucide-react";
import { Plant, PLANT_STATUS_LABELS } from "@/types";
import { formatDate } from "@/utils/date";

const STATUS_STYLES: Record<Plant["status"], string> = {
  healthy: "bg-forest-100 text-forest-700 border-forest-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  problem: "bg-red-100 text-red-700 border-red-200",
};

export default function PlantCard({ plant }: { plant: Plant }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/plants/${plant.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-card card-hover cursor-pointer border border-forest-50"
    >
      <div className="relative h-48 bg-cream-100 overflow-hidden">
        <img
          src={plant.photoUrl}
          alt={plant.species}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        <span
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[plant.status]}`}
        >
          {PLANT_STATUS_LABELS[plant.status]}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-serif text-lg font-semibold text-forest-800">
            {plant.species}
          </h3>
          <span className="text-xs text-forest-500 bg-forest-50 px-2 py-1 rounded-lg">
            Ø{plant.potDiameter}cm
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-forest-600">
            <MapPin className="w-4 h-4 text-forest-400" />
            <span className="truncate">{plant.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-forest-500">
            <Calendar className="w-4 h-4 text-forest-400" />
            <span>
              上次养护：
              {plant.lastServiceAt ? formatDate(plant.lastServiceAt) : "未记录"}
            </span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-forest-50">
          <p className="text-xs text-forest-500">
            养护频率：
            <span className="text-forest-700 font-medium">
              {plant.maintenanceFrequency}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
