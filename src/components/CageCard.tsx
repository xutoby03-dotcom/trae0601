import { Link } from "react-router-dom";
import type { Cage } from "@/types";
import { SPECIES_LABEL } from "@/types";
import { CageStatusTag } from "./StatusTag";
import { useStore } from "@/store";
import { Users, Eye } from "lucide-react";

interface CageCardProps {
  cage: Cage;
}

export function CageCard({ cage }: CageCardProps) {
  const group = useStore((s) => s.getResearchGroupById(cage.researchGroupId));
  const isAlert = cage.status === "warning" || cage.status === "isolated";

  return (
    <Link
      to={`/cages/${cage.id}`}
      className={`card-hover block overflow-hidden group ${
        isAlert ? "ring-2 ring-danger-200 animate-pulse-border" : ""
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={cage.photoUrl}
          alt={cage.cageNumber}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <CageStatusTag status={cage.status} />
        </div>
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-medium text-primary-700">
            {SPECIES_LABEL[cage.species]}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <span className="text-white text-sm font-medium flex items-center gap-1.5">
            <Eye className="w-4 h-4" /> 查看详情
          </span>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 font-mono">
              {cage.cageNumber}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{group?.name}</p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium">{cage.animalCount}</span>
          </span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-500">
            负责人：{cage.responsiblePerson}
          </span>
        </div>
      </div>
    </Link>
  );
}
