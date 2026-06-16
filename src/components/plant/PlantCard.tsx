import { Link } from 'react-router-dom';
import {
  Droplets,
  Sun,
  MapPin,
  Ruler,
  Layers,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { usePlantStore } from '../../store/plantStore';
import type { Plant } from '../../types';
import PlantPhoto from './PlantPhoto';

interface PlantCardProps {
  plant: Plant;
}

export default function PlantCard({ plant }: PlantCardProps) {
  const getSoilMixById = usePlantStore((s) => s.getSoilMixById);
  const isPlantInRecovery = usePlantStore((s) => s.isPlantInRecovery);
  const getRecoveryDaysLeft = usePlantStore((s) => s.getRecoveryDaysLeft);

  const soilMix = getSoilMixById(plant.currentSoilMixId);
  const inRecovery = isPlantInRecovery(plant.id);
  const recoveryDaysLeft = getRecoveryDaysLeft(plant.id);

  const lightIcon = () => {
    switch (plant.lightRequirement) {
      case '全日照':
        return <Sun className="w-3 h-3" />;
      case '半日照':
        return <Sun className="w-3 h-3 opacity-70" />;
      case '散射光':
        return <Sun className="w-3 h-3 opacity-50" />;
      case '低光':
        return <Sun className="w-3 h-3 opacity-30" />;
    }
  };

  return (
    <Link
      to={`/plants/${plant.id}`}
      className={`card-hover group block animate-slide-up ${
        inRecovery ? 'ring-2 ring-leaf-400 ring-offset-2 ring-offset-cream-100' : ''
      } ${!plant.isAlive ? 'opacity-60 grayscale' : ''}`}
    >
      <div className="relative overflow-hidden">
        <PlantPhoto
          photoUrl={plant.latestPhotoUrl}
          alt={plant.name}
          aspect="4/3"
          showHoverZoom
        />

        {inRecovery && (
          <div className="absolute top-3 left-3">
            <span className="tag-leaf">
              <Clock className="w-3 h-3" />
              缓苗中 {recoveryDaysLeft}天
            </span>
          </div>
        )}

        {!plant.isAlive && (
          <div className="absolute top-3 left-3">
            <span className="tag bg-gray-100 text-gray-600 border border-gray-200">
              已枯萎
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
          <h3 className="font-serif text-xl font-semibold text-white leading-tight">
            {plant.name}
          </h3>
          {plant.species && (
            <p className="text-xs text-white/80">{plant.species}</p>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5 text-xs text-forest-600">
            <MapPin className="w-3 h-3 text-forest-400" />
            <span className="truncate">{plant.position}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-forest-600">
            <Ruler className="w-3 h-3 text-clay-500" />
            <span>{plant.potDiameterCm}cm 盆径</span>
          </div>
        </div>

        {soilMix && (
          <div className="flex items-start gap-1.5 text-xs text-forest-600">
            <Layers className="w-3 h-3 text-forest-400 mt-0.5 flex-shrink-0" />
            <span className="truncate">
              {soilMix.name}（颗粒{soilMix.granularRatio}%/营养{soilMix.nutrientRatio}%/珍珠岩{soilMix.perliteRatio}%）
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <div className="flex items-center gap-1 text-xs text-forest-600">
            {lightIcon()}
            <span>{plant.lightRequirement}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-forest-600">
            <Droplets className="w-3 h-3 text-forest-400" />
            <span>{plant.wateringRhythm}</span>
          </div>
        </div>

        {plant.lastWatered && (
          <div className="pt-2 border-t border-cream-200">
            <p className="text-xs text-forest-500">
              上次浇水：
              {formatDistanceToNow(parseISO(plant.lastWatered), {
                addSuffix: true,
                locale: zhCN,
              })}
            </p>
          </div>
        )}

        {inRecovery && (
          <div className="flex items-start gap-2 p-3 bg-leaf-50 rounded-xl border border-leaf-200">
            <AlertTriangle className="w-4 h-4 text-leaf-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-leaf-700">
              <p className="font-medium mb-0.5">缓苗期提醒</p>
              <p className="text-leaf-600">少浇水，注意观察黄叶和掉叶</p>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
