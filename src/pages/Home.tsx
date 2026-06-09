import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Flame, Droplets } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { SIZES, SEASONS, GENDERS, SIZE_LABELS, STATUS_LABELS } from '@/types'
import type { Uniform } from '@/types'

const SIZE_OPTIONS = ['全部', ...SIZES]
const GENDER_OPTIONS = ['全部', ...GENDERS]
const SEASON_OPTIONS = ['全部', ...SEASONS]

function UniformCard({ uniform, onClick }: { uniform: Uniform; onClick: () => void }) {
  return (
    <div className="card p-3 flex gap-3 cursor-pointer" onClick={onClick}>
      <img
        src={uniform.photos[0]}
        alt={uniform.school}
        className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          <span className="tag-orange">{SIZE_LABELS[uniform.size] || uniform.size}</span>
          <span className="tag-blue">{uniform.season}</span>
          <span className="tag-purple">{uniform.gender}</span>
        </div>
        <p className="text-sm font-semibold text-gray-800 truncate">{uniform.school} · {uniform.grade}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500">{uniform.condition}</span>
          {uniform.hasStain && (
            <span className="flex items-center gap-0.5 text-xs text-amber-500">
              <Droplets size={10} />
              有污渍
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-1">
          {uniform.isFree ? (
            <span className="tag-green text-xs">免费</span>
          ) : (
            <span className="text-sm font-bold text-orange-500">¥{uniform.price}</span>
          )}
          <span className={`tag ${uniform.status === 'available' ? 'tag-green' : 'tag-orange'}`}>
            {STATUS_LABELS[uniform.status]}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { getUniformsByFilter, getUrgentUniforms } = useStore()

  const [search, setSearch] = useState('')
  const [sizeFilter, setSizeFilter] = useState('全部')
  const [genderFilter, setGenderFilter] = useState('全部')
  const [seasonFilter, setSeasonFilter] = useState('全部')

  const urgentUniforms = useMemo(() => getUrgentUniforms(), [getUrgentUniforms])

  const filteredUniforms = useMemo(
    () =>
      getUniformsByFilter({
        size: sizeFilter === '全部' ? undefined : sizeFilter,
        gender: genderFilter === '全部' ? undefined : genderFilter,
        season: seasonFilter === '全部' ? undefined : seasonFilter,
        search: search || undefined,
      }),
    [getUniformsByFilter, sizeFilter, genderFilter, seasonFilter, search],
  )

  return (
    <div className="max-w-2xl mx-auto">
      <header className="bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 px-5 pt-10 pb-6 rounded-b-3xl shadow-lg">
        <h1 className="text-3xl font-black text-white tracking-wide">校服流转</h1>
        <p className="text-orange-100 text-sm mt-1 font-medium">让校服继续温暖每一个孩子</p>
      </header>

      <div className="px-4 -mt-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-300" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索学校、年级、尺码..."
            className="input-field pl-10 shadow-md"
          />
        </div>
      </div>

      <div className="px-4 mt-4 space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {SIZE_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSizeFilter(s)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                sizeFilter === s
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-orange-50 text-orange-500 hover:bg-orange-100'
              }`}
            >
              {s === '全部' ? '全部尺码' : (SIZE_LABELS[s] || s)}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {GENDER_OPTIONS.map((g) => (
            <button
              key={g}
              onClick={() => setGenderFilter(g)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                genderFilter === g
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-orange-50 text-orange-500 hover:bg-orange-100'
              }`}
            >
              {g === '全部' ? '全部' : g}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {SEASON_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSeasonFilter(s)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                seasonFilter === s
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-orange-50 text-orange-500 hover:bg-orange-100'
              }`}
            >
              {s === '全部' ? '全部季节' : s}
            </button>
          ))}
        </div>
      </div>

      {urgentUniforms.length > 0 && (
        <div className="px-4 mt-5">
          <div className="bg-gradient-to-r from-orange-500 via-red-400 to-orange-400 rounded-2xl p-4 animate-pulse-soft shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="text-white" size={20} />
              <span className="text-white font-bold text-base">急需尺码</span>
            </div>
            <div className="space-y-2">
              {urgentUniforms.map((u) => (
                <div
                  key={u.id}
                  className="bg-white/90 backdrop-blur-sm rounded-xl p-2.5 flex items-center gap-2.5 cursor-pointer hover:bg-white transition-all"
                  onClick={() => navigate(`/uniform/${u.id}`)}
                >
                  <img
                    src={u.photos[0]}
                    alt={u.school}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {SIZE_LABELS[u.size]} · {u.season} · {u.gender}
                    </p>
                    <p className="text-xs text-gray-500">{u.school} {u.grade}</p>
                  </div>
                  {u.isFree ? (
                    <span className="tag-green text-xs">免费</span>
                  ) : (
                    <span className="text-sm font-bold text-orange-500">¥{u.price}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="px-4 mt-5 pb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">校服列表</h2>
        {filteredUniforms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">暂无匹配的校服</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUniforms.map((u) => (
              <UniformCard
                key={u.id}
                uniform={u}
                onClick={() => navigate(`/uniform/${u.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
