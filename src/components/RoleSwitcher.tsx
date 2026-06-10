import { Building2, UserRound, ShieldCheck } from 'lucide-react';
import { useAppStore } from '@/store';

export default function RoleSwitcher() {
  const { currentRole, toggleRole } = useAppStore();

  return (
    <button
      onClick={toggleRole}
      className="group flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:border-brand-500 hover:shadow-pop transition-all text-sm"
      title="切换角色（仅用于演示）"
    >
      {currentRole === 'resident' ? (
        <>
          <UserRound size={16} className="text-brand-500" />
          <span className="text-slate-700 group-hover:text-brand-600 font-medium">住户</span>
        </>
      ) : (
        <>
          <ShieldCheck size={16} className="text-orange-600" />
          <span className="text-slate-700 group-hover:text-orange-600 font-medium">物业</span>
        </>
      )}
      <Building2 size={12} className="text-slate-400" />
    </button>
  );
}
