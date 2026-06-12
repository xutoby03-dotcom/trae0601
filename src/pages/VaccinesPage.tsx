import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { usePetStore } from '../store/usePetStore';
import { Pet, VaccineRecord } from '../../shared/types';
import { FilterBar } from '../components/common/FilterBar';
import { VaccineItem } from '../components/common/VaccineItem';
import { Modal } from '../components/common/Modal';
import { VaccineForm } from '../components/forms/VaccineForm';
import { computeAllPetsWithStatus, computeRecordStatus } from '../utils/status';
import { today } from '../utils/date';

export default function VaccinesPage() {
  const pets = usePetStore((s) => s.pets);
  const records = usePetStore((s) => s.vaccineRecords);
  const filter = usePetStore((s) => s.filter);

  const petsWithStatus = useMemo(
    () => computeAllPetsWithStatus(pets, records),
    [pets, records]
  );

  const petMap = useMemo(() => {
    const m = new Map<string, Pet>();
    pets.forEach((p) => m.set(p.id, p));
    return m;
  }, [pets]);

  const filteredRecords = useMemo(() => {
    const kw = filter.keyword.trim().toLowerCase();
    const filteredPets = petsWithStatus.filter((p) => {
      if (filter.building !== 'all' && p.building !== filter.building) return false;
      if (filter.petType !== 'all' && p.type !== filter.petType) return false;
      if (filter.status !== 'all' && p.status !== filter.status) return false;
      return true;
    });
    const ids = new Set(filteredPets.map((p) => p.id));

    return records
      .filter((r) => ids.has(r.petId))
      .filter((r) => {
        if (!kw) return true;
        const pet = petMap.get(r.petId);
        const hay = `${r.vaccineName} ${r.hospital} ${r.remark ?? ''} ${
          pet ? `${pet.name} ${pet.ownerName} ${pet.building} ${pet.phone}` : ''
        }`.toLowerCase();
        return hay.includes(kw);
      })
      .sort((a, b) => b.nextDueAt.localeCompare(a.nextDueAt));
  }, [records, petsWithStatus, petMap, filter]);

  const grouped = useMemo(() => {
    const t = today();
    const g: {
      expired: VaccineRecord[];
      expiring: VaccineRecord[];
      normal: VaccineRecord[];
    } = { expired: [], expiring: [], normal: [] };
    filteredRecords.forEach((r) => {
      const { status } = computeRecordStatus(r, t);
      if (status === 'expired') g.expired.push(r);
      else if (status === 'expiring') g.expiring.push(r);
      else g.normal.push(r);
    });
    return g;
  }, [filteredRecords]);

  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState<VaccineRecord | null>(null);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          共 <span className="font-bold text-slate-900">{records.length}</span> 条记录，
          筛选结果{' '}
          <span className="font-bold text-emerald-600">{filteredRecords.length}</span>{' '}
          条
        </p>
        <button
          onClick={() => {
            setEditRecord(null);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition hover:shadow-lg active:scale-[0.97]"
        >
          <Plus className="h-4 w-4" />
          新增疫苗记录
        </button>
      </div>

      <FilterBar />

      <Group
        title={
          <span className="flex items-center gap-2 text-rose-600">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
            已过期 · 请立即通知
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold">
              {grouped.expired.length}
            </span>
          </span>
        }
        empty="无过期记录，表现出色 👍"
      >
        {grouped.expired.map((r) => (
          <VaccineItem
            key={r.id}
            record={r}
            pet={petMap.get(r.petId)}
            accent="red"
            onEdit={() => {
              setEditRecord(r);
              setShowModal(true);
            }}
          />
        ))}
      </Group>

      <Group
        title={
          <span className="flex items-center gap-2 text-orange-600">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
            即将到期 · 30 天内
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold">
              {grouped.expiring.length}
            </span>
          </span>
        }
        empty="暂无即将到期的疫苗 🎉"
      >
        {grouped.expiring.map((r) => (
          <VaccineItem
            key={r.id}
            record={r}
            pet={petMap.get(r.petId)}
            accent="orange"
            onEdit={() => {
              setEditRecord(r);
              setShowModal(true);
            }}
          />
        ))}
      </Group>

      <Group
        title={
          <span className="flex items-center gap-2 text-emerald-700">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            合规有效 · 正常
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold">
              {grouped.normal.length}
            </span>
          </span>
        }
        empty="暂无正常有效的记录"
      >
        {grouped.normal.map((r) => (
          <VaccineItem
            key={r.id}
            record={r}
            pet={petMap.get(r.petId)}
            accent="none"
            onEdit={() => {
              setEditRecord(r);
              setShowModal(true);
            }}
          />
        ))}
      </Group>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editRecord ? '编辑疫苗记录' : '新增疫苗记录'}
        width="max-w-xl"
      >
        <VaccineForm
          initial={editRecord ?? undefined}
          focusProof={!!editRecord && !editRecord.proofPhotoUrl}
          onSubmit={() => setShowModal(false)}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}

function Group({
  title,
  children,
  empty,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  empty: string;
}) {
  const arr = Array.isArray(children) ? children : [children];
  const has = arr.some((c) => c);
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h3 className="mb-4 border-b border-slate-100 pb-3 text-base font-bold">
        {title}
      </h3>
      {has ? (
        <div className="space-y-3">{children}</div>
      ) : (
        <div className="flex h-24 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
          {empty}
        </div>
      )}
    </section>
  );
}
