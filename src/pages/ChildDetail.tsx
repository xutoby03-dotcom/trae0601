import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import {
  ArrowLeft,
  Edit,
  Phone,
  MapPin,
  AlertCircle,
  Baby,
  Calendar,
  Clock,
  CalendarCheck,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { calculateAge, formatDate } from '@/utils/date';
import VaccineCard from '@/components/vaccine/VaccineCard';
import StatusBadge from '@/components/ui/StatusBadge';
import type { Vaccine } from '@/types';
import { useState } from 'react';
import VaccineFormModal from '@/components/vaccine/VaccineFormModal';
import AppointModal from '@/components/vaccine/AppointModal';
import CompleteModal from '@/components/vaccine/CompleteModal';
import DelayModal from '@/components/vaccine/DelayModal';
import PhotoUpload from '@/components/ui/PhotoUpload';

const STATUS_ICONS = {
  pending: Clock,
  appointed: CalendarCheck,
  completed: CheckCircle,
  overdue: AlertTriangle,
};

const STATUS_COLORS = {
  pending: 'bg-info-500',
  appointed: 'bg-accent-500',
  completed: 'bg-primary-500',
  overdue: 'bg-danger-500',
};

export default function ChildDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const initialize = useAppStore((s) => s.initialize);
  const getChildById = useAppStore((s) => s.getChildById);
  const getVaccinesByChildId = useAppStore((s) => s.getVaccinesByChildId);
  const updateChild = useAppStore((s) => s.updateChild);
  const addVaccine = useAppStore((s) => s.addVaccine);
  const updateVaccine = useAppStore((s) => s.updateVaccine);
  const deleteVaccine = useAppStore((s) => s.deleteVaccine);
  const appointVaccine = useAppStore((s) => s.appointVaccine);
  const completeVaccine = useAppStore((s) => s.completeVaccine);
  const delayVaccine = useAppStore((s) => s.delayVaccine);
  const children = useAppStore((s) => s.children);

  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [showAppointModal, setShowAppointModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState<Vaccine | null>(null);
  const [targetVaccine, setTargetVaccine] = useState<Vaccine | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const child = id ? getChildById(id) : undefined;
  const vaccines = id ? getVaccinesByChildId(id) : [];

  if (!child) {
    return (
      <div className="card p-16 flex flex-col items-center justify-center text-center">
        <Baby className="w-16 h-16 text-slate-300 mb-4" />
        <h3 className="font-medium text-slate-700 mb-2">未找到该孩子档案</h3>
        <button onClick={() => navigate('/children')} className="btn-secondary btn-sm">
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </button>
      </div>
    );
  }

  const age = calculateAge(child.birthday);
  const completedCount = vaccines.filter((v) => v.status === 'completed').length;
  const progress = vaccines.length > 0 ? Math.round((completedCount / vaccines.length) * 100) : 0;

  const handlePhotoChange = (field: 'avatar' | 'vaccineBookPhoto', value: string) => {
    updateChild(child.id, { [field]: value });
  };

  return (
    <div className="space-y-6 pb-8">
      <button
        onClick={() => navigate('/children')}
        className="flex items-center gap-2 text-slate-600 hover:text-primary-600 transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        返回孩子列表
      </button>

      <div className="card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary-400 via-emerald-400 to-teal-400 relative">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/20" />
          <div className="absolute left-1/4 -bottom-6 w-24 h-24 rounded-full bg-white/15" />
        </div>
        <div className="px-8 pb-8">
          <div className="flex items-end gap-6 -mt-12 flex-wrap md:flex-nowrap">
            <div className="shrink-0">
              <div className="w-28 h-28 rounded-3xl bg-white p-1.5 shadow-soft relative group">
                <img
                  src={
                    child.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(child.name)}`
                  }
                  alt={child.name}
                  className="w-full h-full rounded-2xl object-cover bg-slate-100 cursor-pointer"
                  onClick={() => {}}
                />
                <label className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-white shadow-card flex items-center justify-center cursor-pointer hover:bg-primary-50 transition-colors border border-slate-100">
                  <Edit className="w-4 h-4 text-primary-600" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const reader = new FileReader();
                      reader.onload = () => handlePhotoChange('avatar', reader.result as string);
                      reader.readAsDataURL(f);
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="flex-1 min-w-0 pb-2">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="font-display text-3xl text-slate-800">{child.name}</h1>
                <span className="chip bg-slate-100 text-slate-600 text-sm py-1.5 px-4">
                  {child.gender}
                </span>
                {child.allergyHistory && (
                  <span className="chip bg-danger-50 text-danger-600 border border-danger-100 py-1.5 px-4">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {child.allergyHistory}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-5 flex-wrap text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{child.birthday} · {age}</span>
                </div>
                {child.vaccinationSite && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{child.vaccinationSite}</span>
                  </div>
                )}
                {child.guardianPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{child.guardianPhone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 flex flex-col gap-2">
              <button
                onClick={() => navigate(`/children/${child.id}/edit`)}
                className="btn-secondary btn-sm"
              >
                <Edit className="w-4 h-4" />
                编辑档案
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-600">疫苗接种进度</span>
              <span className="text-sm font-medium text-slate-700">
                {completedCount} / {vaccines.length} · {progress}%
              </span>
            </div>
            <div className="relative h-3 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="section-title !mb-0">疫苗时间线</h2>
              <button
                onClick={() => {
                  setEditingVaccine(null);
                  setShowVaccineModal(true);
                }}
                className="btn-primary btn-sm"
              >
                添加疫苗
              </button>
            </div>

            {vaccines.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Baby className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">暂无疫苗计划，点击上方按钮添加</p>
              </div>
            ) : (
              <div className="relative pl-8">
                <div className="absolute left-[14px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary-200 via-accent-200 to-slate-200 rounded-full" />
                <div className="space-y-4">
                  {vaccines.map((v, idx) => {
                    const Icon = STATUS_ICONS[v.status];
                    return (
                      <div
                        key={v.id}
                        className="relative animate-fade-in-up"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div
                          className={`absolute -left-1 top-5 w-7 h-7 rounded-full ${STATUS_COLORS[v.status]} text-white flex items-center justify-center shadow-soft z-10`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <VaccineCard
                          vaccine={v}
                          child={child}
                          onEdit={() => {
                            setEditingVaccine(v);
                            setShowVaccineModal(true);
                          }}
                          onDelete={() => deleteVaccine(v.id)}
                          onAppoint={() => {
                            setTargetVaccine(v);
                            setShowAppointModal(true);
                          }}
                          onComplete={() => {
                            setTargetVaccine(v);
                            setShowCompleteModal(true);
                          }}
                          onDelay={() => {
                            setTargetVaccine(v);
                            setShowDelayModal(true);
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="section-title !mb-4">疫苗本照片</h2>
            <PhotoUpload
              value={child.vaccineBookPhoto}
              onChange={(v) => handlePhotoChange('vaccineBookPhoto', v)}
              label="疫苗本封面 / 内页"
              placeholder="点击上传疫苗本照片"
            />
            <p className="mt-3 text-xs text-slate-500 leading-relaxed">
              建议拍摄疫苗本封面和已接种记录页，便于线下核对。
            </p>
          </div>

          <div className="card p-5">
            <h2 className="section-title !mb-4">状态概览</h2>
            <div className="space-y-3">
              {(['completed', 'appointed', 'pending', 'overdue'] as const).map((st) => {
                const count = vaccines.filter((v) => v.status === st).length;
                return (
                  <div key={st} className="flex items-center justify-between py-1">
                    <StatusBadge status={st} />
                    <span className="text-sm font-medium text-slate-700">{count} 针</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="section-title !mb-4">下次接种</h2>
            {(() => {
              const next = vaccines
                .filter((v) => v.status !== 'completed')
                .sort(
                  (a, b) =>
                    new Date(a.suggestedDate).getTime() -
                    new Date(b.suggestedDate).getTime(),
                )[0];
              if (!next) {
                return (
                  <p className="text-sm text-slate-500 text-center py-4">
                    🎉 全部疫苗已完成
                  </p>
                );
              }
              return (
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-100">
                  <div className="font-medium text-slate-800 mb-1">
                    {next.name} 第{next.dose}剂
                  </div>
                  <div className="text-xs text-slate-600 mb-3">
                    建议 {formatDate(next.suggestedDate)} 接种
                  </div>
                  <StatusBadge status={next.status} />
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      <VaccineFormModal
        open={showVaccineModal}
        onClose={() => {
          setShowVaccineModal(false);
          setEditingVaccine(null);
        }}
        onSubmit={(data) => {
          if (editingVaccine) {
            updateVaccine(editingVaccine.id, data);
          } else {
            addVaccine(data);
          }
        }}
        children={children.map((c) => ({ id: c.id, name: c.name }))}
        initialData={editingVaccine}
        defaultChildId={child.id}
      />

      <AppointModal
        open={showAppointModal}
        onClose={() => {
          setShowAppointModal(false);
          setTargetVaccine(null);
        }}
        onSubmit={(data) => {
          if (targetVaccine) appointVaccine(targetVaccine.id, data);
        }}
        vaccine={targetVaccine}
        defaultLocation={child.vaccinationSite}
      />

      <CompleteModal
        open={showCompleteModal}
        onClose={() => {
          setShowCompleteModal(false);
          setTargetVaccine(null);
        }}
        onSubmit={(data) => {
          if (targetVaccine) completeVaccine(targetVaccine.id, data);
        }}
        vaccine={targetVaccine}
      />

      <DelayModal
        open={showDelayModal}
        onClose={() => {
          setShowDelayModal(false);
          setTargetVaccine(null);
        }}
        onSubmit={(data) => {
          if (targetVaccine) delayVaccine(targetVaccine.id, data);
        }}
        vaccine={targetVaccine}
      />
    </div>
  );
}
