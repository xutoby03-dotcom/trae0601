import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, ChevronLeft } from 'lucide-react';
import { useAppStore } from '../store';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { loginAdmin } = useAppStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    const success = loginAdmin(username, password);
    if (success) {
      navigate('/admin/dashboard');
    } else {
      setError('用户名或密码错误');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-600 hover:text-primary-500 mb-6 transition-colors"
        >
          <ChevronLeft size={20} />
          <span>返回首页</span>
        </Link>

        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-table-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🏓</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-800">管理后台</h1>
            <p className="text-gray-500 mt-1">请登录以管理系统</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
              <div className="relative">
                <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  className="input-field pl-12"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="input-field pl-12"
                />
              </div>
            </div>

            <button type="submit" className="w-full btn-primary text-lg py-4">
              登录
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 text-center">
              默认账号: admin / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
