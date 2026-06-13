import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit3,
  Plus,
  Trash2,
  Pill,
  Syringe,
  Scale,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { usePetStore } from "../store/petStore";
import { useState } from "react";
import DewormTimeline from "../components/DewormTimeline";
import {
  getAgeDisplay,
  getPetLatestRecords,
  getSpeciesEmoji,
  getStatusColor,
  getStatusLabel,
  getWeightChangePercent,
  countRecordsThisYear,
} from "../utils/deworm";
import { formatDateDisplay } from "../utils/date";

export default function PetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pet = usePetStore((s) => (id ? s.getPet(id) : undefined));
  const records = usePetStore((s) => s.records);
  const weightHistory = usePetStore((s) => s.weightHistory);
  const deletePet = usePetStore((s) => s.deletePet);
  const checkNeedsDoseReview = usePetStore((s) => s.checkNeedsDoseReview);
  const dismissWeightAlert = usePetStore((s) => s.dismissWeightAlert);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!pet) {
    return (
      <div className="container py-12 text-center">
        <p className="text-ink-500">宠物不存在</p>
        <Link to="/" className="btn-ghost mt-4">
          返回首页
        </Link>
      </div>
    );
  }

  const latest = getPetLatestRecords(pet.id, records);
  const yearCounts = countRecordsThisYear(pet.id, records);

  const petWeightHistory = weightHistory
    .filter((w) => w.petId === pet.id)
    .sort(
      (a, b) =>
        new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    );
  const needsReview = checkNeedsDoseReview(pet.id);

  let weightChange = 0;
  let weightChangePercent = 0;
  if (petWeightHistory.length >= 2) {
    const first = petWeightHistory[0];
    const last = petWeightHistory[petWeightHistory.length - 1];
    weightChange = last.weight - first.weight;
    weightChangePercent = getWeightChangePercent(first.weight, last.weight);
  }

  const handleDelete = () => {
    deletePet(pet.id);
    navigate("/");
  };

  const WeightTrendIcon = () => {
    if (weightChangePercent > 0)
      return <TrendingUp className="w-3.5 h-3.5 text-warm-500" />;
    if (weightChangePercent < 0)
      return <TrendingDown className="w-3.5 h-3.5 text-mint-600" />;
    return <Minus className="w-3.5 h-3.5 text-ink-400" />;
  };

  return (
    <div className="container py-6 pb-28 space-y-6">
      <div className="flex items-center gap-3 animate-fade-in-up">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white transition-colors text-ink-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-2xl font-bold text-ink-800">
          宠物档案
        </h1>
      </div>

      <div className="card overflow-hidden animate-fade-in-up" style={{ animationDelay: "60ms" }}>
        <div className="relative h-52 sm:h-64">
          <img
            src={pet.photoUrl}
            alt={pet.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getSpeciesEmoji(pet.species)}</span>
                  <h2 className="font-display text-3xl font-bold">{pet.name}</h2>
                </div>
                <p className="text-white/80 mt-1 text-sm">
                  {pet.breed} · {getAgeDisplay(pet.birthDate)}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/pet/${pet.id}/edit`}
                  className="p-2.5 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors"
                  title="编辑档案"
                >
                  <Edit3 className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2.5 rounded-full bg-white/20 backdrop-blur-md hover:bg-alert-500/60 transition-colors"
                  title="删除宠物"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl bg-ink-50 p-3">
            <div className="flex items-center gap-1.5 text-ink-400 text-xs font-medium mb-1">
              <Scale className="w-3.5 h-3.5" />
              体重
            </div>
            <p className="font-semibold text-ink-700">
              {pet.weight}
              {pet.weightUnit}
            </p>
            {petWeightHistory.length >= 2 && (
              <p
                className={`text-xs mt-0.5 flex items-center gap-1 ${
                  weightChangePercent > 10 || weightChangePercent < -10
                    ? "text-warm-600"
                    : "text-ink-400"
                }`}
              >
                <WeightTrendIcon />
                {weightChange > 0 ? "+" : ""}
                {weightChange.toFixed(1)}
                {pet.weightUnit} ({weightChangePercent > 0 ? "+" : ""}
                {weightChangePercent}%)
              </p>
            )}
          </div>
          <div className="rounded-xl bg-ink-50 p-3">
            <div className="flex items-center gap-1.5 text-ink-400 text-xs font-medium mb-1">
              <Pill className="w-3.5 h-3.5 text-warm-500" />
              体内驱虫
            </div>
            <p className="font-semibold text-ink-700 text-sm">
              {latest.nextInternalDate
                ? formatDateDisplay(latest.nextInternalDate)
                : "暂无记录"}
            </p>
            {latest.nextInternalStatus && (
              <span
                className={`chip mt-1 text-[10px] ${getStatusColor(
                  latest.nextInternalStatus
                )}`}
              >
                {getStatusLabel(latest.nextInternalStatus)}
              </span>
            )}
          </div>
          <div className="rounded-xl bg-ink-50 p-3">
            <div className="flex items-center gap-1.5 text-ink-400 text-xs font-medium mb-1">
              <Syringe className="w-3.5 h-3.5 text-mint-600" />
              体外驱虫
            </div>
            <p className="font-semibold text-ink-700 text-sm">
              {latest.nextExternalDate
                ? formatDateDisplay(latest.nextExternalDate)
                : "暂无记录"}
            </p>
            {latest.nextExternalStatus && (
              <span
                className={`chip mt-1 text-[10px] ${getStatusColor(
                  latest.nextExternalStatus
                )}`}
              >
                {getStatusLabel(latest.nextExternalStatus)}
              </span>
            )}
          </div>
          <div className="rounded-xl bg-ink-50 p-3">
            <div className="text-ink-400 text-xs font-medium mb-1">
              今年驱虫次数
            </div>
            <p className="font-semibold text-ink-700">
              <span className="text-warm-500">{yearCounts.internal}</span>
              <span className="text-ink-300 mx-1">/</span>
              <span className="text-mint-600">{yearCounts.external}</span>
            </p>
            <p className="text-xs text-ink-400 mt-0.5">体内 / 体外</p>
          </div>
        </div>

        {pet.allergies && (
          <div className="px-5 pb-5">
            <div className="p-3 rounded-xl bg-alert-50 border border-alert-100">
              <p className="text-xs font-semibold text-alert-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                过敏史
              </p>
              <p className="text-sm text-alert-700 mt-1">{pet.allergies}</p>
            </div>
          </div>
        )}

        {needsReview && (
          <div className="mx-5 mb-5 p-4 rounded-xl bg-warm-50 border border-warm-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-warm-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-warm-700">
                    体重变化较大，建议复核驱虫剂量
                  </p>
                  <p className="text-sm text-warm-600 mt-0.5">
                    体重变化了 {weightChangePercent > 0 ? "+" : ""}
                    {weightChangePercent}%，驱虫药剂量通常需要根据体重计算，请确认下次用药剂量是否需要调整
                  </p>
                </div>
              </div>
              <button
                onClick={() => dismissWeightAlert(pet.id)}
                className="text-warm-400 hover:text-warm-600 text-xs font-semibold flex-shrink-0"
              >
                知道了
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">驱虫记录</h2>
          <Link
            to={`/pet/${pet.id}/deworm/new`}
            className="btn-primary text-sm py-2 px-4"
          >
            <Plus className="w-4 h-4" />
            添加记录
          </Link>
        </div>
        <DewormTimeline records={records} petId={pet.id} />
      </div>

      {petWeightHistory.length > 0 && (
        <div className="card p-5 animate-fade-in-up" style={{ animationDelay: "180ms" }}>
          <h3 className="section-title mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-mint-600" />
            体重记录
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {petWeightHistory.map((w) => (
              <div
                key={w.id}
                className="flex-shrink-0 px-4 py-3 rounded-xl bg-ink-50 text-center min-w-[100px]"
              >
                <p className="text-2xl font-bold text-ink-700 font-display">
                  {w.weight}
                </p>
                <p className="text-xs text-ink-400 mt-0.5">{pet.weightUnit}</p>
                <p className="text-xs text-ink-400 mt-1">
                  {formatDateDisplay(w.recordedAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-sm w-full animate-slide-down">
            <h3 className="font-display text-xl font-bold text-ink-800">
              确认删除？
            </h3>
            <p className="text-ink-500 mt-2 text-sm">
              删除 <strong>{pet.name}</strong>{" "}
              的档案将同时清除所有驱虫记录，此操作无法撤销。
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-ghost flex-1"
              >
                取消
              </button>
              <button onClick={handleDelete} className="btn-danger flex-1">
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
