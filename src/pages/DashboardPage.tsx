import { useMemo, useState } from 'react';
import {
  PawPrint,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Ban,
  CalendarDays,
  FileWarning,
  Plus,
  Download,
} from 'lucide-react';
import { usePetStore } from '../store/usePetStore';
import { computeAllPetsWithStatus, computeRecordStatus } from '../utils/status';
import { ComplianceStatus, Pet, VaccineRecord } from '../../shared/types';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { FilterBar } from '../components/common/FilterBar';
import { VaccineItem } from '../components/common/VaccineItem';
import { Modal } from '../components/common/Modal';
import { VaccineForm } from '../components/forms/VaccineForm';
import { isSameMonth, parseDate, today, formatDate } from '../utils/date';

interface RecordWithPet extends VaccineRecord {
  pet?: Pet;
}

export default function DashboardPage() {
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

  const filteredPets = useMemo(() => {
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

  const counts = useMemo(() => {
    const c: Record<ComplianceStatus, number> = {
      compliant: 0,
      expiring: 0,
      expired: 0,
      unvaccinated: 0,
    };
    filteredPets.forEach((p) => c[p.status]++);
    return c;
  }, [filteredPets]);

  const { expiringList, expiredList, noProofList, thisMonthDueList } = useMemo(() => {
    const t = today();
    const expiring: RecordWithPet[] = [];
    const expired: RecordWithPet[] = [];
    const noProof: RecordWithPet[] = [];
    const thisMonthDue: RecordWithPet[] = [];

    filteredPets.forEach((p) => {
      const petRecords = records.filter((r) => r.petId === p.id);
      petRecords.forEach((r) => {
        const item: RecordWithPet = { ...r, pet: petMap.get(r.petId) };
        if (!r.proofPhotoUrl) noProof.push(item);
        const due = parseDate(r.nextDueAt);
        if (isSameMonth(due, t)) thisMonthDue.push(item);
        const { status } = computeRecordStatus(r, t);
        if (status === 'expiring') expiring.push(item);
        if (status === 'expired') expired.push(item);
      });
    });

    expiring.sort((a, b) => a.nextDueAt.localeCompare(b.nextDueAt));
    expired.sort((a, b) => a.nextDueAt.localeCompare(b.nextDueAt));
    noProof.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    thisMonthDue.sort((a, b) => a.nextDueAt.localeCompare(b.nextDueAt));
    return { expiringList: expiring, expiredList: expired, noProofList: noProof, thisMonthDueList: thisMonthDue };
  }, [filteredPets, records, petMap]);

  const thisMonthDuePetCount = useMemo(() => {
    const s = new Set(thisMonthDueList.map((x) => x.petId));
    return s.size;
  }, [thisMonthDueList]);

  const [editRecord, setEditRecord] = useState<VaccineRecord | null>(null);
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [focusRecordId, setFocusRecordId] = useState<string | undefined>(undefined);

  const openNoProofEdit = (r: VaccineRecord) => {
    setEditRecord(r);
    setFocusRecordId(r.id);
    setShowVaccineModal(true);
  };

  const exportNoProof = () => {
    const lines = ['未补免疫证明名单', '导出时间：' + formatDate(today()), ''];
    lines.push('序号,楼栋,宠物名,种类,主人,电话,疫苗名称,接种日期,下次到期');
    noProofList.forEach((r, i) => {
      if (!r.pet) return;
      lines.push(
        [
          i + 1,
          r.pet.building,
          r.pet.name,
          r.pet.type,
          r.pet.ownerName,
          r.pet.phone,
          r.vaccineName,
          r.vaccinatedAt,
          r.nextDueAt,
        ].join(',')
      );
    });
    const blob = new Blob(['\ufeff' + lines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `未补证明名单_${formatDate(today())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="宠物总数"
          value={filteredPets.length}
          icon={PawPrint}
          color="blue"
          description={`小区已登记宠物`}
          delay={0}
        />
        <StatCard
          title="已合规"
          value={counts.compliant}
          icon={CheckCircle2}
          color="green"
          description="疫苗在保护期内"
          delay={60}
        />
        <StatCard
          title="即将到期"
          value={counts.expiring}
          icon={AlertTriangle}
          color="orange"
          description="30天内需接种"
          delay={120}
        />
        <StatCard
          title="已过期"
          value={counts.expired}
          icon={AlertCircle}
          color="red"
          description="超出免疫保护期"
          delay={180}
        />
        <StatCard
          title="未接种"
          value={counts.unvaccinated}
          icon={Ban}
          color="slate"
          description="尚无免疫记录"
          delay={240}
        />
      </div>

      <FilterBar />

      <div className="grid grid-cols-1 gap-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-5 shadow-sm ring-1 ring-slate-100 lg:grid-cols-3">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md">
            <CalendarDays className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">本月到期宠物</p>
            <p className="mt-1 font-mono text-3xl font-bold text-slate-900">
              {thisMonthDuePetCount}
              <span className="ml-1 text-sm font-normal text-slate-500">只</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md">
            <FileWarning className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">未补证明条目</p>
            <p className="mt-1 font-mono text-3xl font-bold text-slate-900">
              {noProofList.length}
              <span className="ml-1 text-sm font-normal text-slate-500">条</span>
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 lg:justify-self-end">
          <button
            onClick={exportNoProof}
            disabled={!noProofList.length}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            导出未补名单
          </button>
          <button
            onClick={() => {
              setEditRecord(null);
              setFocusRecordId(undefined);
              setShowVaccineModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition hover:shadow-lg active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" />
            新增疫苗记录
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Section
          title={
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
              提醒区 · 即将到期
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                {expiringList.length}
              </span>
            </span>
          }
          subtitle="30天内到期，请提前通知业主接种"
          empty="暂无即将到期的疫苗 🎉"
        >
          {expiringList.map((r) => (
            <VaccineItem
              key={r.id}
              record={r}
              pet={r.pet}
              accent="orange"
              onEdit={() => {
                setEditRecord(r);
                setFocusRecordId(undefined);
                setShowVaccineModal(true);
              }}
            />
          ))}
        </Section>

        <Section
          title={
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
              过期警示 · 单独标出
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
                {expiredList.length}
              </span>
            </span>
          }
          subtitle="已超期，请立即通知业主补种"
          empty="无过期疫苗记录，表现良好 👍"
        >
          {expiredList.map((r) => (
            <VaccineItem
              key={r.id}
              record={r}
              pet={r.pet}
              accent="red"
              onEdit={() => {
                setEditRecord(r);
                setFocusRecordId(undefined);
                setShowVaccineModal(true);
              }}
            />
          ))}
        </Section>
      </div>

      <Section
        title={
          <span className="flex items-center gap-2">
            <FileWarning className="h-4 w-4 text-amber-600" />
            未补证明名单 · 临检翻不到的重点
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              {noProofList.length}
            </span>
          </span>
        }
        subtitle="点击右侧「补录证明」上传照片，完成资料归档"
        empty="全部记录均已上传证明，资料齐全 ✅"
      >
        {noProofList.map((r) => (
          <div key={r.id} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-amber-100 transition hover:shadow-md">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status="expiring" size="sm" />
                <h4 className="font-semibold text-slate-900">{r.vaccineName}</h4>
                {r.pet && (
                  <span className="text-xs text-slate-500">
                    🐾 {r.pet.name} · {r.pet.building} · {r.pet.ownerName} · {r.pet.phone}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                接种 {r.vaccinatedAt} · 到期 {r.nextDueAt} · {r.hospital}
              </p>
            </div>
            <button
              onClick={() => openNoProofEdit(r)}
              className="shrink-0 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-600 active:scale-[0.97]"
            >
              补录证明 →
            </button>
          </div>
        ))}
      </Section>

      <Modal
        open={showVaccineModal}
        onClose={() => setShowVaccineModal(false)}
        title={editRecord ? '编辑疫苗记录' : '新增疫苗记录'}
        subtitle="请完整填写接种信息与证明照片"
        width="max-w-xl"
      >
        <VaccineForm
          initial={editRecord ?? undefined}
          focusProof={!!focusRecordId && (!editRecord?.proofPhotoUrl)}
          onSubmit={() => setShowVaccineModal(false)}
          onCancel={() => setShowVaccineModal(false)}
        />
      </Modal>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
  empty,
}: {
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  empty: string;
}) {
  const arr = Array.isArray(children) ? children : [children];
  const hasItems = arr.some((c) => c);
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <header className="mb-4 border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </header>
      {hasItems ? (
        <div className="space-y-3">{children}</div>
      ) : (
        <div className="flex h-32 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
          {empty}
        </div>
      )}
    </section>
  );
}
