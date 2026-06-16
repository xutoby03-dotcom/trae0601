import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Ruler,
  Layers,
  Sun,
  Droplets,
  Leaf,
  Plus,
  Repeat,
  Droplets as WaterIcon,
  Move,
  Scissors,
  Flower2,
  Camera,
  MoreHorizontal,
  Calendar,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { usePlantStore } from '../store/plantStore';
import Timeline from '../components/timeline/Timeline';
import RepotHistory from '../components/repot/RepotHistory';
import RecoveryAlert from '../components/repot/RecoveryAlert';
import type { TimelineEventType } from '../types';

const eventTypes: { key: TimelineEventType; label: string; icon: typeof Droplets }[] = [
  { key: 'water', label: '浇水', icon: WaterIcon },
  { key: 'move', label: '移位', icon: Move },
  { key: 'prune', label: '修剪', icon: Scissors },
  { key: 'fertilize', label: '施肥', icon: Flower2 },
  { key: 'photo', label: '拍照', icon: Camera },
  { key: 'other', label: '其他', icon: MoreHorizontal },
];

export default function PlantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventType, setNewEventType] = useState<TimelineEventType>('water');
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEventDesc, setNewEventDesc] = useState('');

  const getPlantById = usePlantStore((s) => s.getPlantById);
  const getSoilMixById = usePlantStore((s) => s.getSoilMixById);
  const getRepotRecordsByPlantId = usePlantStore((s) => s.getRepotRecordsByPlantId);
  const getTimelineEventsByPlantId = usePlantStore((s) => s.getTimelineEventsByPlantId);
  const isPlantInRecovery = usePlantStore((s) => s.isPlantInRecovery);
  const getRecoveryDaysLeft = usePlantStore((s) => s.getRecoveryDaysLeft);
  const addTimelineEvent = usePlantStore((s) => s.addTimelineEvent);
  const updatePlant = usePlantStore((s) => s.updatePlant);

  if (!id) return <div>无效的植物ID</div>;

  const plant = getPlantById(id);
  if (!plant) return <div className="text-forest-600">未找到该植物</div>;

  const soilMix = getSoilMixById(plant.currentSoilMixId);
  const repotRecords = getRepotRecordsByPlantId(id);
  const timelineEvents = getTimelineEventsByPlantId(id);
  const inRecovery = isPlantInRecovery(id);
  const recoveryDaysLeft = getRecoveryDaysLeft(id);

  const handleAddEvent = () => {
    if (!newEventDesc.trim() && newEventType !== 'water') return;

    addTimelineEvent({
      plantId: id,
      type: newEventType,
      date: newEventDate,
      description: newEventDesc || undefined,
    });

    if (newEventType === 'water') {
      updatePlant(id, { lastWatered: newEventDate });
    }

    setNewEventDesc('');
    setShowAddEvent(false);
  };

  const lightIcon = () => {
    switch (plant.lightRequirement) {
      case '全日照':
        return <Sun className="w-4 h-4" />;
      case '半日照':
        return <Sun className="w-4 h-4 opacity-70" />;
      case '散射光':
        return <Sun className="w-4 h-4 opacity-50" />;
      case '低光':
        return <Sun className="w-4 h-4 opacity-30" />;
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-flex items-center gap-2 text-forest-600 hover:text-forest-800 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">返回盆栽列表</span>
      </Link>

      <div className="card overflow-hidden animate-slide-up">
        <div className="relative h-56 md:h-72 bg-forest-100">
          {plant.latestPhotoUrl ? (
            <img
              src={plant.latestPhotoUrl}
              alt={plant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-forest-100 to-forest-200">
              <Leaf className="w-20 h-20 text-forest-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <h2 className="font-serif text-3xl font-semibold">{plant.name}</h2>
            {plant.species && (
              <p className="text-white/80 mt-1">{plant.species}</p>
            )}
            <p className="text-white/70 text-sm mt-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              入养于 {format(parseISO(plant.createdAt), 'yyyy年M月', { locale: zhCN })}
            </p>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-3 bg-cream-50 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs text-forest-500 mb-1">
                <MapPin className="w-3 h-3" />
                位置
              </div>
              <p className="font-medium text-forest-800 text-sm">{plant.position}</p>
            </div>

            <div className="p-3 bg-cream-50 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs text-forest-500 mb-1">
                <Ruler className="w-3 h-3" />
                盆径
              </div>
              <p className="font-medium text-forest-800 text-sm">{plant.potDiameterCm} cm</p>
            </div>

            <div className="p-3 bg-cream-50 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs text-forest-500 mb-1">
                <Layers className="w-3 h-3" />
                土壤
              </div>
              <p className="font-medium text-forest-800 text-sm truncate">
                {soilMix ? soilMix.name : '未记录'}
              </p>
            </div>

            <div className="p-3 bg-cream-50 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs text-forest-500 mb-1">
                {lightIcon()}
                光照
              </div>
              <p className="font-medium text-forest-800 text-sm">{plant.lightRequirement}</p>
            </div>

            <div className="p-3 bg-cream-50 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs text-forest-500 mb-1">
                <Droplets className="w-3 h-3" />
                浇水节奏
              </div>
              <p className="font-medium text-forest-800 text-sm">{plant.wateringRhythm}</p>
            </div>
          </div>

          {soilMix && (
            <div className="mt-4 p-3 bg-forest-50 rounded-xl border border-forest-100">
              <p className="text-xs text-forest-500 mb-1">土壤配比详情</p>
              <p className="text-sm text-forest-700">
                颗粒土 {soilMix.granularRatio}% · 营养土 {soilMix.nutrientRatio}% · 珍珠岩 {soilMix.perliteRatio}%
                {soilMix.otherIngredients && ` · ${soilMix.otherIngredients}`}
              </p>
            </div>
          )}
        </div>
      </div>

      {inRecovery && repotRecords.length > 0 && (
        <RecoveryAlert
          daysLeft={recoveryDaysLeft}
          recoveryEndDate={repotRecords[0].recoveryEndDate}
        />
      )}

      {!plant.isAlive && (
        <div className="card p-5 bg-gray-50 border-gray-200">
          <h3 className="font-serif text-lg font-semibold text-gray-700 mb-2">已枯萎</h3>
          {plant.deathDate && (
            <p className="text-sm text-gray-500 mb-1">
              {format(parseISO(plant.deathDate), 'yyyy年M月d日', { locale: zhCN })}
            </p>
          )}
          {plant.deathReason && (
            <p className="text-sm text-gray-600">{plant.deathReason}</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="section-title !mb-0">养护时间线</h3>
        <div className="flex items-center gap-2">
          {plant.isAlive && (
            <>
              <button onClick={() => setShowAddEvent(!showAddEvent)} className="btn-secondary !py-2 !px-4 text-sm">
                <Plus className="w-4 h-4" />
                添加记录
              </button>
              <Link to={`/plants/${id}/repot`} className="btn-primary !py-2 !px-4 text-sm">
                <Repeat className="w-4 h-4" />
                记录换盆
              </Link>
            </>
          )}
        </div>
      </div>

      {showAddEvent && (
        <div className="card p-5 animate-slide-up">
          <div className="space-y-4">
            <div>
              <label className="label">事件类型</label>
              <div className="flex flex-wrap gap-2">
                {eventTypes.map((et) => {
                  const Icon = et.icon;
                  return (
                    <button
                      key={et.key}
                      onClick={() => setNewEventType(et.key)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        newEventType === et.key
                          ? 'bg-forest-600 text-white'
                          : 'bg-cream-100 text-forest-600 hover:bg-cream-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {et.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="label">日期</label>
              <input
                type="date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">描述（可选）</label>
              <textarea
                value={newEventDesc}
                onChange={(e) => setNewEventDesc(e.target.value)}
                placeholder="记录一下这次操作的细节..."
                rows={2}
                className="input-field resize-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowAddEvent(false)} className="btn-ghost">
                取消
              </button>
              <button onClick={handleAddEvent} className="btn-primary">
                保存记录
              </button>
            </div>
          </div>
        </div>
      )}

      <Timeline events={timelineEvents} />

      <div>
        <h3 className="section-title">换盆历史</h3>
        <RepotHistory records={repotRecords} />
      </div>

      <div className="flex justify-end">
        <button onClick={() => navigate('/')} className="btn-ghost">
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </button>
      </div>
    </div>
  );
}
