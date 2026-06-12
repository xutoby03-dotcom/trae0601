import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { usePetStore } from '../store/usePetStore';
import { computeAllPetsWithStatus } from '../utils/status';
import { Pet } from '../../shared/types';
import { PetCard } from '../components/common/PetCard';
import { FilterBar } from '../components/common/FilterBar';
import { Modal } from '../components/common/Modal';
import { PetForm } from '../components/forms/PetForm';

export default function PetsPage() {
  const pets = usePetStore((s) => s.pets);
  const records = usePetStore((s) => s.vaccineRecords);
  const filter = usePetStore((s) => s.filter);

  const petsWithStatus = useMemo(
    () => computeAllPetsWithStatus(pets, records),
    [pets, records]
  );

  const filtered = useMemo(() => {
    const kw = filter.keyword.trim().toLowerCase();
    return petsWithStatus.filter((p) => {
      if (filter.building !== 'all' && p.building !== filter.building) return false;
      if (filter.petType !== 'all' && p.type !== filter.petType) return false;
      if (filter.status !== 'all' && p.status !== filter.status) return false;
      if (kw) {
        const hay = `${p.name} ${p.ownerName} ${p.phone} ${p.building} ${p.breed}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  }, [petsWithStatus, filter]);

  const [showModal, setShowModal] = useState(false);
  const [editPet, setEditPet] = useState<Pet | null>(null);

  const openAdd = () => {
    setEditPet(null);
    setShowModal(true);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          共登记 <span className="font-bold text-slate-900">{pets.length}</span> 只宠物，
          筛选结果 <span className="font-bold text-emerald-600">{filtered.length}</span> 只
        </p>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition hover:shadow-lg active:scale-[0.97]"
        >
          <Plus className="h-4 w-4" />
          新增宠物
        </button>
      </div>

      <FilterBar />

      {filtered.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <PetCard key={p.id} pet={p} />
          ))}
        </div>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-100">
          <p className="text-5xl">🐾</p>
          <p className="text-sm">暂无符合筛选条件的宠物</p>
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editPet ? '编辑宠物档案' : '新增宠物档案'}
        subtitle="建立宠物基本资料，用于后续免疫登记管理"
        width="max-w-xl"
      >
        <PetForm
          initial={editPet ?? undefined}
          onSubmit={() => setShowModal(false)}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}
