import { useNavigate } from 'react-router-dom';
import { PawPrint, Sparkles, BarChart3, ArrowRight } from 'lucide-react';
import { useAppStore } from '../store';
import type { UserRole } from '../types';

const roles: {
  id: UserRole;
  title: string;
  desc: string;
  icon: typeof PawPrint;
  gradient: string;
  shadow: string;
}[] = [
  {
    id: 'RESIDENT',
    title: '居民用户',
    desc: '预约洗脚池，为您的爱宠提供清洁服务',
    icon: PawPrint,
    gradient: 'from-teal-400 via-cyan-500 to-blue-500',
    shadow: 'shadow-teal-500/30',
  },
  {
    id: 'CLEANER',
    title: '清洁员',
    desc: '处理清洁任务，维护设备正常运行',
    icon: Sparkles,
    gradient: 'from-orange-400 via-amber-500 to-yellow-500',
    shadow: 'shadow-orange-500/30',
  },
  {
    id: 'ADMIN',
    title: '物业管理员',
    desc: '查看数据统计，管理系统运营',
    icon: BarChart3,
    gradient: 'from-purple-400 via-violet-500 to-indigo-500',
    shadow: 'shadow-purple-500/30',
  },
];

export default function RoleSelect() {
  const navigate = useNavigate();
  const setRole = useAppStore((s) => s.setRole);

  const handleSelect = (role: UserRole) => {
    setRole(role);
    if (role === 'RESIDENT') navigate('/resident');
    else if (role === 'CLEANER') navigate('/cleaner');
    else if (role === 'ADMIN') navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/2 translate-y-1/2 animate-pulse" />
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2 animate-pulse" />

      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-12 animate-[fadeInUp_0.6s_ease-out]">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-400 to-cyan-500 shadow-xl shadow-teal-500/30 mb-6">
            <PawPrint className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent mb-3">
            小区宠物洗脚排队系统
          </h1>
          <p className="text-lg text-slate-500">请选择您的身份</p>
        </div>

        <div className="w-full max-w-md space-y-4">
          {roles.map((role, idx) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => handleSelect(role.id)}
                style={{ animationDelay: `${idx * 100 + 200}ms` }}
                className="group w-full animate-[fadeInUp_0.6s_ease-out_both] relative overflow-hidden rounded-3xl p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl bg-white border border-slate-200 shadow-lg"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative flex items-center gap-5">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${role.gradient} shadow-lg ${role.shadow} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-white transition-colors duration-300">
                      {role.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 group-hover:text-white/80 transition-colors duration-300">
                      {role.desc}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-all duration-300 group-hover:bg-white/20 group-hover:text-white group-hover:translate-x-1">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-12 text-sm text-slate-400 animate-[fadeIn_0.8s_ease-out_1s_both]">
          © 2026 智能宠物服务系统
        </p>
      </div>
    </div>
  );
}
