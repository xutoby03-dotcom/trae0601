import { useState } from 'react'
import { useGameStore } from '@/store/useGameStore'

export default function UserSetup() {
  const initUser = useGameStore(s => s.initUser)
  const seedDemoData = useGameStore(s => s.seedDemoData)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [wechat, setWechat] = useState('')

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim()) return
    seedDemoData()
    initUser(name.trim(), phone.trim(), wechat.trim())
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <span className="text-6xl block mb-4">🏀</span>
          <h1 className="text-white text-2xl font-bold">小区约场</h1>
          <p className="text-zinc-400 text-sm mt-2">填写信息，开始约球</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-sm mb-2">昵称 *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="球场上叫你什么"
              className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-orange-500 placeholder-zinc-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-2">手机号 *</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="方便球友联系"
              className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-orange-500 placeholder-zinc-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-2">微信号</label>
            <input
              type="text"
              value={wechat}
              onChange={e => setWechat(e.target.value)}
              placeholder="选填"
              className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-orange-500 placeholder-zinc-500"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!name.trim() || !phone.trim()}
          className="w-full bg-orange-500 rounded-xl text-white font-bold h-12 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          进入球场
        </button>
      </div>
    </div>
  )
}
