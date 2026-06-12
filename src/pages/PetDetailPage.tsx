import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Phone,
  User,
  Edit3,
  Trash2,
  Plus,
  Syringe,
  Calendar,
  Hospital,
} from 'lucide-react';
import { usePetStore } from '../store/usePetStore';
import { computePetStatus } from '../utils/status';
import { parseDate, today } from '../utils/date';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { PetForm } from '../components/forms/PetForm';
import { VaccineForm } from '../components/forms/VaccineForm';
import { VaccineRecord } from '../../shared/types';

export default function PetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const pets = usePetStore((s) => s.pets);
  const records = usePetStore((s) => s.vaccineRecords);
  const removePet = usePetStore((s) => s.removePet);
  const removeVaccine = usePetStore((s) => s.removeVaccineRecord);

  const pet = pets.find((p) => p.id === id);
  const petWithStatus = useMemo(
    () => (pet ? computePetStatus(pet, records, today()) : null),
    [pet, records]
  );
  const petRecords = useMemo(
    () =>
      records
        .filter((r) => r.petId === id)
        .sort((a, b) => b.vaccinatedAt.localeCompare(a.vaccinatedAt)),
    [records, id]
  );

  const [showPetModal, setShowPetModal] = useState(false);
  const [showVacModal, setShowVacModal] = useState(false);
  const [editVac, setEditVac] = useState<VaccineRecord | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [delVacId, setDelVacId] = useState<string | null>(null);

  if (!pet || !petWithStatus) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-slate-500">
        <p className="text-6xl">🐾</p>
        <h3 className="text-lg font-semibold">找不到该宠物档案</h3>
        <Link
          to="/pets"
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          返回档案列表
        </Link>
      </div>
    );
  }

  const typeEmoji = pet.type === 'dog' ? '🐶' : pet.type === 'cat' ? '🐱' : '🐾';

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        to="/pets"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-emerald-600"
      >
        <ArrowLeft className="h-4 w-4" />
        返回宠物档案
      </Link>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="relative h-32 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500">
          <div className="absolute inset-0 opacity-30 mix-blend-overlay"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        <div className="px-6 pb-6">
          <div className="-mt-16 flex flex-wrap items-end gap-5">
            <div className="relative">
              {pet.photoUrl ? (
                <img
                  src={pet.photoUrl}
                  alt={pet.name}
                  className="h-32 w-32 rounded-2xl border-4 border-white object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-2xl border-4 border-white bg-slate-100 text-6xl shadow-lg">
                  {typeEmoji}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 pb-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  {typeEmoji} {pet.name}
                </h1>
                <StatusBadge status={petWithStatus.status} />
                {!petWithStatus.hasProofPhoto &&
                  petWithStatus.status !== 'unvaccinated' && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                      ⚠️ 缺少证明照片
                    </span>
                  )}
              </div>
              <p className="mt-1 text-sm text-slate-500">{pet.breed}</p>
            </div>
            <div className="flex flex-wrap gap-2 pb-2">
              <button
                onClick={() => setShowPetModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Edit3 className="h-4 w-4" />
                编辑档案
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100"
              >
                <Trash2 className="h-4 w-4" />
                删除
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Info icon={User} label="主人姓名" value={pet.ownerName} />
            <Info icon={Building2} label="所在楼栋" value={pet.building} />
            <Info
              icon={Phone}
              label="联系电话"
              value={pet.phone}
              mono
            />
            <Info
              icon={Calendar}
              label="登记时间"
              value={pet.createdAt}
            />
          </div>

          {petWithStatus.latestRecord && (
            <div className="mt-5 rounded-xl bg-gradient-to-r from-slate-50 to-emerald-50/50 p-4 ring-1 ring-slate-100">
              <p className="text-xs font-medium text-slate-500">最近一次疫苗</p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
                <span className="font-semibold text-slate-900">
                  💉 {petWithStatus.latestRecord.vaccineName}
                </span>
                <span className="text-slate-500">
                  接种于 {petWithStatus.latestRecord.vaccinatedAt}
                </span>
                <span className="text-slate-500">
                  · 到期 {petWithStatus.latestRecord.nextDueAt}
                </span>
                {typeof petWithStatus.daysUntilDue === 'number' && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      petWithStatus.daysUntilDue < 0
                        ? 'bg-rose-100 text-rose-700'
                        : petWithStatus.daysUntilDue <= 30
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {petWithStatus.daysUntilDue < 0
                      ? `已超期 ${Math.abs(petWithStatus.daysUntilDue)} 天`
                      : petWithStatus.daysUntilDue === 0
                      ? '今天到期'
                      : `还剩 ${petWithStatus.daysUntilDue} 天`}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Syringe className="h-4.5 w-4.5 text-emerald-600" />
              疫苗接种记录
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              共 {petRecords.length} 条接种记录
            </p>
          </div>
          <button
            onClick={() => {
              setEditVac(null);
              setShowVacModal(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition hover:shadow-lg active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" />
            新增疫苗记录
          </button>
        </div>

        {petRecords.length ? (
          <div className="relative">
            <div className="absolute left-[14px] top-1 bottom-1 w-0.5 bg-gradient-to-b from-emerald-200 via-slate-200 to-slate-200" />
            <ul className="space-y-5">
              {petRecords.map((r, idx) => {
                const due = parseDate(r.nextDueAt);
                const diff = Math.ceil(
                  (due.getTime() - today().getTime()) / (1000 * 60 * 60 * 24)
                );
                const accent =
                  diff < 0 ? 'rose' : diff <= 30 ? 'orange' : 'emerald';
                return (
                  <li key={r.id} className="relative pl-10">
                    <div
                      className={`absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-white bg-${accent}-500 text-white`}
                    >
                      <Syringe className="h-3.5 w-3.5" />
                    </div>
                    <div className="rounded-xl bg-slate-50/60 p-4 ring-1 ring-slate-100 transition hover:bg-white hover:shadow-md">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-semibold text-slate-900">
                              💉 {r.vaccineName}
                            </h4>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                diff < 0
                                  ? 'bg-rose-100 text-rose-700'
                                  : diff <= 30
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {diff < 0
                                ? `已过期 ${Math.abs(diff)} 天`
                                : diff === 0
                                ? '今天到期'
                                : `还剩 ${diff} 天`}
                            </span>
                            {!r.proofPhotoUrl && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                缺证明
                              </span>
                            )}
                          </div>
                          <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 text-xs text-slate-500 sm:grid-cols-3">
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              接种：{r.vaccinatedAt}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              到期：{r.nextDueAt}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Hospital className="h-3.5 w-3.5" />
                              {r.hospital}
                            </span>
                          </div>
                          {r.remark && (
                            <p className="mt-2 rounded-lg bg-white px-2.5 py-1.5 text-xs text-slate-600 ring-1 ring-slate-100">
                              💬 {r.remark}
                            </p>
                          )}
                          {r.proofPhotoUrl && (
                            <div className="mt-3">
                              <img
                                src={r.proofPhotoUrl}
                                alt="证明"
                                className="h-28 w-auto max-w-full rounded-lg object-cover ring-1 ring-slate-200 hover:opacity-90"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-1.5">
                          <button
                            onClick={() => {
                              setEditVac(r);
                              setShowVacModal(true);
                            }}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 transition hover:bg-slate-50"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => setDelVacId(r.id)}
                            className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs text-rose-600 transition hover:bg-rose-100"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 text-[11px] text-slate-400">
                        记录编号 #{idx + 1} · 登记于 {r.createdAt}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-slate-50 py-14 text-slate-400">
            <p className="text-5xl">💉</p>
            <p className="text-sm">暂无疫苗记录，状态显示为「未接种」</p>
            <p className="text-xs">新增免疫记录后，合规状态会自动更新</p>
          </div>
        )}
      </section>

      <Modal
        open={showPetModal}
        onClose={() => setShowPetModal(false)}
        title="编辑宠物档案"
        width="max-w-xl"
      >
        <PetForm
          initial={pet}
          onSubmit={() => setShowPetModal(false)}
          onCancel={() => setShowPetModal(false)}
        />
      </Modal>

      <Modal
        open={showVacModal}
        onClose={() => setShowVacModal(false)}
        title={editVac ? '编辑疫苗记录' : `新增 ${pet.name} 的疫苗记录`}
        width="max-w-xl"
      >
        <VaccineForm
          initial={editVac ?? undefined}
          defaultPetId={pet.id}
          onSubmit={() => setShowVacModal(false)}
          onCancel={() => setShowVacModal(false)}
        />
      </Modal>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={`删除「${pet.name}」档案`}
        subtitle="删除后，该宠物相关的所有疫苗记录也将一并删除，此操作不可撤销"
      >
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setConfirmDelete(false)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            取消
          </button>
          <button
            onClick={() => {
              removePet(pet.id);
              setConfirmDelete(false);
              nav('/pets');
            }}
            className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-600"
          >
            确认删除
          </button>
        </div>
      </Modal>

      <Modal
        open={!!delVacId}
        onClose={() => setDelVacId(null)}
        title="删除疫苗记录"
        subtitle="删除后，合规状态可能发生变化"
      >
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setDelVacId(null)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            取消
          </button>
          <button
            onClick={() => {
              if (delVacId) removeVaccine(delVacId);
              setDelVacId(null);
            }}
            className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
          >
            确认删除
          </button>
        </div>
      </Modal>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: any;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl bg-slate-50/60 p-3 ring-1 ring-slate-100">
      <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-semibold text-slate-900 ${
          mono ? 'font-mono tracking-tight' : ''
        }`}
      >
        {value}
      </p>
    </div>
  );
}
