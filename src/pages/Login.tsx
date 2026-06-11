import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import { Lock, User, ChevronDown } from 'lucide-react'

type RoleTab = 'club' | 'admin'

export default function Login() {
  const [activeTab, setActiveTab] = useState<RoleTab>('club')
  const [clubName, setClubName] = useState('')
  const [adminName, setAdminName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { clubs, login } = useStore()

  const handleLogin = () => {
    setError('')
    const name = activeTab === 'club' ? clubName : adminName
    const success = login(name, password, activeTab)
    if (success) {
      navigate(activeTab === 'club' ? '/apply' : '/review')
    } else {
      setError('用户名或密码错误')
    }
  }

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-brand-orange/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-brand-gold/10 blur-3xl" />
        <div className="absolute top-1/4 right-10 w-3 h-3 rotate-45 bg-brand-orange/20" />
        <div className="absolute top-1/3 left-16 w-4 h-4 rounded-full bg-brand-gold/25" />
        <div className="absolute bottom-1/3 right-1/4 w-5 h-5 rotate-12 bg-brand-orange/15" />
        <div className="absolute bottom-1/4 left-1/4 w-2 h-2 rounded-full bg-brand-red/20" />
        <div className="absolute top-2/3 right-16 w-6 h-6 rounded-lg bg-brand-gold/10 rotate-45" />
      </div>

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl text-brand-orange mb-2">展板管家</h1>
          <p className="text-gray-500 text-sm">食堂展板预约管理系统</p>
        </div>

        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => { setActiveTab('club'); setError('') }}
            className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'club'
                ? 'bg-white text-brand-orange shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            社团登录
          </button>
          <button
            onClick={() => { setActiveTab('admin'); setError('') }}
            className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'admin'
                ? 'bg-white text-brand-orange shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            管理员登录
          </button>
        </div>

        <div className="space-y-4">
          {activeTab === 'club' ? (
            <div className="relative">
              <select
                value={clubName}
                onChange={e => setClubName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none appearance-none bg-white text-gray-700"
              >
                <option value="">请选择社团</option>
                {clubs.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          ) : (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="管理员账号"
                value={adminName}
                onChange={e => setAdminName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none"
              />
            </div>
          )}

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none"
            />
          </div>

          {error && (
            <p className="text-brand-red text-sm text-center">{error}</p>
          )}

          <button
            onClick={handleLogin}
            className="w-full py-3 bg-brand-orange text-white rounded-lg font-medium hover:bg-brand-orange/90 active:scale-[0.98] transition-all"
          >
            登录
          </button>
        </div>
      </div>
    </div>
  )
}
