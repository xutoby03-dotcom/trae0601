import { Link } from 'react-router-dom';
import { MapPin, Navigation, Mountain, TrendingUp, Clock, Users } from 'lucide-react';
import type { Route } from '@/types';
import { CATEGORY_LABELS, ROAD_CONDITION_LABELS } from '@/utils/constants';
import RiskBadge from './RiskBadge';
import { useStore } from '@/store/useStore';

interface RouteCardProps {
  route: Route;
  index?: number;
}

export default function RouteCard({ route, index = 0 }: RouteCardProps) {
  const { getCheckinsByRouteId, getEventsByRouteId } = useStore();
  const checkins = getCheckinsByRouteId(route.id);
  const events = getEventsByRouteId(route.id);
  const cat = CATEGORY_LABELS[route.category];
  const avgSpeed =
    checkins.length > 0
      ? (checkins.reduce((s, c) => s + c.avgSpeed, 0) / checkins.length).toFixed(1)
      : null;

  return (
    <Link
      to={`/route/${route.id}`}
      className="card-base group overflow-hidden hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300"
      style={{ animation: `staggerIn 0.5s ease-out ${index * 60}ms both` }}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
        <img
          src={route.coverImage}
          alt={route.name}
          loading="lazy"
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r ${cat.color} shadow-lg`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </div>
        </div>

        {route.risks.length > 0 && (
          <div className="absolute top-3 right-3 flex gap-1.5">
            {route.risks.slice(0, 2).map((r) => (
              <RiskBadge key={r} type={r} compact />
            ))}
            {route.risks.length > 2 && (
              <div className="inline-flex items-center justify-center rounded-full bg-slate-900/80 px-2 py-1 text-xs text-slate-300 border border-slate-700">
                +{route.risks.length - 2}
              </div>
            )}
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-display text-lg font-bold text-white line-clamp-1">
            {route.name}
          </h3>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-start gap-2 text-sm text-slate-400">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-emerald-400" />
          <div className="space-y-0.5 min-w-0">
            <p className="truncate flex items-center gap-1">
              <span className="text-emerald-400/70">起:</span>
              {route.startPoint}
            </p>
            <p className="truncate flex items-center gap-1">
              <span className="text-rose-400/70">终:</span>
              {route.endPoint}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-700/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
              <Navigation className="h-3.5 w-3.5" />
              <span className="text-[11px]">距离</span>
            </div>
            <p className="font-display font-bold text-white">
              {route.distance}
              <span className="text-xs font-normal text-slate-400 ml-0.5">km</span>
            </p>
          </div>
          <div className="text-center border-x border-slate-700/50">
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
              <Mountain className="h-3.5 w-3.5" />
              <span className="text-[11px]">爬升</span>
            </div>
            <p className="font-display font-bold text-white">
              {route.elevation}
              <span className="text-xs font-normal text-slate-400 ml-0.5">m</span>
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-[11px]">均速</span>
            </div>
            <p className="font-display font-bold text-white">
              {avgSpeed || '--'}
              <span className="text-xs font-normal text-slate-400 ml-0.5">
                {avgSpeed ? 'km/h' : ''}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              {ROAD_CONDITION_LABELS[route.roadCondition].emoji}
              {ROAD_CONDITION_LABELS[route.roadCondition].label}
            </span>
            {route.hasSupply && (
              <span className="inline-flex items-center gap-1 text-emerald-400">
                🏪 有补给
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {checkins.length}次
            </span>
            {events.length > 0 && (
              <span className="inline-flex items-center gap-1 text-sky-400">
                <Users className="h-3 w-3" />
                {events.length}约骑
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
