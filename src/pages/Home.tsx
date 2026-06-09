import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Droplets, Flame, ChevronDown, ChevronRight } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { SIZES, SEASONS, GENDERS, SIZE_LABELS, STATUS_LABELS } from '@/types'
import type { Uniform } from '@/types'

const SIZE_OPTIONS = ['全部', ...SIZES]
const GENDER_OPTIONS = ['全部', ...GENDERS]
const SEASON_OPTIONS = ['全部', ...SEASONS]

function MiniCard({ uniform, onClick }: { uniform: Uniform; onClick: () => void }) {
  return (
    <div
      className="card p-2.5 flex gap-2.5 cursor-pointer"
      onClick={onClick}
    >
      <img
        src={uniform.photos[0]}
        alt={uniform.school}
        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 flex-wrap mb-0.5">
          <span className="tag-blue text-[10px]">{uniform.season}</span>
          <span className="tag-purple text-[10px]">{uniform.gender}</span>
          {uniform.isFree ? (
            <span className="tag-green text-[10px]">免费</span>
          ) : (
            <span className="text-xs font-bold text-orange-500">¥{uniform.price}</span>
          )}
          <span className={`tag text-[10px] ${uniform.status === 'available' ? 'tag-green' : 'tag-orange'}`}>
            {STATUS_LABELS[uniform.status]}
          </span>
        </div>
        <p className="text-xs font-semibold text-gray-800 truncate">{uniform.school} · {uniform.grade}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-gray-500">{uniform.condition}</span>
          {uniform.hasStain && (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-500">
              <Droplets size={9} />有污渍
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

interface SizeGroup {
  size: string
  label: string
  urgentItems: Uniform[]
  subGroups: {
    key: string
    gender: string
    season: string
    items: Uniform[]
  }[]
  totalCount: number
}

function buildGroups(uniforms: Uniform[]): SizeGroup[] {
  const sizeMap = new Map<string, Uniform[]>()
  for (const u of uniforms) {
    const arr = sizeMap.get(u.size) || []
    arr.push(u)
    sizeMap.set(u.size, arr)
  }

  const orderedSizes = SIZES.filter((s) => sizeMap.has(s))

  return orderedSizes.map((size) => {
    const all = sizeMap.get(size) || []
    const urgentItems = all.filter((u) => u.isUrgent && u.status === 'available')
    const rest = all.filter((u) => !(u.isUrgent && u.status === 'available'))

    const subMap = new Map<string, Uniform[]>()
    for (const u of rest) {
      const key = `${u.gender}|${u.season}`
      const arr = subMap.get(key) || []
      arr.push(u)
      subMap.set(key, arr)
    }

    const genderOrder: string[] = [...GENDERS]
    const seasonOrder: string[] = [...SEASONS]

    const subGroups = Array.from(subMap.entries())
      .map(([key, items]) => {
        const parts = key.split('|')
        return { key, gender: parts[0], season: parts[1], items }
      })
      .sort((a, b) => {
        const gi = genderOrder.indexOf(a.gender) - genderOrder.indexOf(b.gender)
        if (gi !== 0) return gi
        return seasonOrder.indexOf(a.season) - seasonOrder.indexOf(b.season)
      })

    return {
      size,
      label: SIZE_LABELS[size] || size,
      urgentItems,
      subGroups,
      totalCount: all.length,
    }
  })
}

function SizeGroupSection({ group, navigate }: { group: SizeGroup; navigate: (path: string) => void }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="animate-slide-up">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-2 mb-2 group"
      >
        <span className="text-base font-bold text-gray-800">{group.label}</span>
        <span className="text-xs text-gray-400 font-medium">({group.totalCount}件)</span>
        {group.urgentItems.length > 0 && (
          <span className="flex items-center gap-0.5 tag-red text-[10px] animate-pulse-soft">
            <Flame size={10} />急需
          </span>
        )}
        <span className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors">
          {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {!collapsed && (
        <div className="pl-1">
          {group.urgentItems.length > 0 && (
            <div className="mb-2 border-l-2 border-red-300 pl-3 py-1">
              <div className="flex items-center gap-1 mb-1.5">
                <Flame size={12} className="text-red-400" />
                <span className="text-[10px] font-semibold text-red-500 uppercase tracking-wider">急需</span>
              </div>
              <div className="space-y-2">
                {group.urgentItems.map((u) => (
                  <MiniCard key={u.id} uniform={u} onClick={() => navigate(`/uniform/${u.id}`)} />
                ))}
              </div>
            </div>
          )}

          {group.subGroups.map((sub) => (
            <div key={sub.key} className="mb-2 border-l-2 border-orange-200 pl-3 py-1">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                  {sub.gender}
                </span>
                <span className="text-[11px] font-semibold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">
                  {sub.season}
                </span>
                <span className="text-[10px] text-gray-400">{sub.items.length}件</span>
              </div>
              <div className="space-y-2">
                {sub.items.map((u) => (
                  <MiniCard key={u.id} uniform={u} onClick={() => navigate(`/uniform/${u.id}`)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { getUniformsByFilter } = useStore()

  const [search, setSearch] = useState('')
  const [sizeFilter, setSizeFilter] = useState('全部')
  const [genderFilter, setGenderFilter] = useState('全部')
  const [seasonFilter, setSeasonFilter] = useState('全部')

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

  const groups = useMemo(() => buildGroups(filteredUniforms), [filteredUniforms])

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

      <div className="px-4 mt-5 pb-6 space-y-5">
        {groups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">暂无匹配的校服</p>
          </div>
        ) : (
          groups.map((g) => (
            <SizeGroupSection key={g.size} group={g} navigate={navigate} />
          ))
        )}
      </div>
    </div>
  )
}
