import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { apiClient } from '../api/client';
import { useAppStore } from '../store/useStore';
import { cn } from '../lib/utils';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { setAdmin } = useAppStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('请输入管理员密码');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.adminLogin(password);
      if (res.success) {
        setAdmin(true);
        navigate('/admin');
      }
    } catch (e) {
      setError((e as Error).message || '密码错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-teal-300 hover:text-teal-200 text-sm font-medium mb-6 transition">
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">管理员登录</h1>
            <p className="text-teal-200 text-sm">登录后可处理争议反馈、管理座位状态</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-teal-100 mb-2">管理员密码</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-300" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入管理员密码"
                  className={cn(
                    'w-full bg-white/10 border border-white/20 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-teal-300/60',
                    'focus:outline-none focus:bg-white/15 focus:border-amber-400/60 focus:ring-4 focus:ring-amber-400/20 transition-all',
                  )}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-rose-500/20 border border-rose-400/40 text-rose-200 rounded-xl p-3 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-amber-950 font-bold shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  验证中...
                </>
              ) : (
                <>登录管理后台</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-teal-300/70 text-center">
              演示密码：<span className="font-mono font-semibold text-teal-200">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
