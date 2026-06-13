import { Link } from "react-router-dom";
import { ChevronRight, Pill, Syringe } from "lucide-react";
import type { Pet } from "../types";
import { usePetStore } from "../store/petStore";
import {
  getAgeDisplay,
  getPetLatestRecords,
  getSpeciesEmoji,
  getStatusColor,
  getStatusLabel,
  getWorstStatus,
} from "../utils/deworm";
import { formatDateDisplay } from "../utils/date";

interface PetCardProps {
  pet: Pet;
  index?: number;
}

export default function PetCard({ pet, index = 0 }: PetCardProps) {
  const records = usePetStore((s) => s.records);
  const latest = getPetLatestRecords(pet.id, records);
  const overallStatus = getWorstStatus(
    latest.nextInternalStatus,
    latest.nextExternalStatus
  );

  return (
    <Link
      to={`/pet/${pet.id}`}
      className="card-hover overflow-hidden animate-fade-in-up block"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={pet.photoUrl}
          alt={pet.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="text-white">
            <div className="flex items-center gap-2">
              <span className="text-xl">{getSpeciesEmoji(pet.species)}</span>
              <h3 className="font-display text-xl font-bold">{pet.name}</h3>
            </div>
            <p className="text-xs opacity-90 mt-0.5">
              {pet.breed} · {getAgeDisplay(pet.birthDate)}
            </p>
          </div>
          {overallStatus && overallStatus !== "normal" && (
            <span className={`chip ${getStatusColor(overallStatus)}`}>
              {getStatusLabel(overallStatus)}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-warm-50 p-2.5">
            <div className="flex items-center gap-1.5 text-warm-600 mb-1">
              <Pill className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">体内</span>
            </div>
            <p className="text-xs text-ink-600">
              {latest.nextInternalDate
                ? formatDateDisplay(latest.nextInternalDate)
                : "暂无记录"}
            </p>
            {latest.nextInternalStatus && (
              <span className={`chip mt-1 text-[10px] ${getStatusColor(latest.nextInternalStatus)}`}>
                {getStatusLabel(latest.nextInternalStatus)}
              </span>
            )}
          </div>
          <div className="rounded-xl bg-mint-50 p-2.5">
            <div className="flex items-center gap-1.5 text-mint-700 mb-1">
              <Syringe className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">体外</span>
            </div>
            <p className="text-xs text-ink-600">
              {latest.nextExternalDate
                ? formatDateDisplay(latest.nextExternalDate)
                : "暂无记录"}
            </p>
            {latest.nextExternalStatus && (
              <span className={`chip mt-1 text-[10px] ${getStatusColor(latest.nextExternalStatus)}`}>
                {getStatusLabel(latest.nextExternalStatus)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-ink-400">
            {pet.weight}
            {pet.weightUnit}
          </p>
          <span className="flex items-center gap-1 text-xs text-warm-500 font-semibold group-hover:gap-2 transition-all">
            查看详情
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
