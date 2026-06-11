import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function AdminLogin() {
  const navigate = useNavigate();
  const setIsAdmin = useStore(state => state.setIsAdmin);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (password === 'admin123') {
        setIsAdmin(true);
        navigate('/admin/tables');
      } else {
        setError('密码错误，请重试');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          返回首页
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="text-primary-600" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">管理员登录</h1>
            <p className="text-gray-500 mt-2">请输入管理员密码</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                管理员密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="请输入密码"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all"
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-6">
            默认密码：admin123
          </p>
        </div>
      </div>
    </div>
  );
}
