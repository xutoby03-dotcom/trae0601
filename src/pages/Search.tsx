import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Dream, Atmosphere, ATMOSPHERE_LABELS, TAG_TYPE_LABELS, DreamTag } from '../types'
import { searchDreams, getAllDreams } from '../db'
import DreamCard from '../components/DreamCard'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [allDreams, setAllDreams] = useState<Dream[]>([])

  const keyword = searchParams.get('keyword') || ''
  const atmosphere = searchParams.get('atmosphere') || 'all'
  const tagType = searchParams.get('tagType') || 'all'
  const tagValue = searchParams.get('tagValue') || ''
  const startDate = searchParams.get('startDate') || ''
  const endDate = searchParams.get('endDate') || ''
  const selectedTag = tagType !== 'all' && tagValue ? `${tagType}:${tagValue}` : 'all'

  const [results, setResults] = useState<Dream[]>([])
  const [allTags, setAllTags] = useState<{ type: DreamTag['type']; value: string; compositeKey: string }[]>([])

  function updateParams(patch: Record<string, string>) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(patch).forEach(([k, v]) => {
        if (v === '' || v === 'all') {
          next.delete(k)
        } else {
          next.set(k, v)
        }
      })
      return next
    }, { replace: true })
  }

  useEffect(() => {
    getAllDreams().then((dreams) => {
      setAllDreams(dreams)
      const tagSet = new Map<string, DreamTag['type']>()
      dreams.forEach((d) =>
        d.tags.forEach((t) => tagSet.set(`${t.type}:${t.value}`, t.type))
      )
      const tagsArr = Array.from(tagSet.entries()).map(([key, type]) => ({
        type,
        value: key.split(':').slice(1).join(':'),
        compositeKey: key,
      }))
      setAllTags(tagsArr)
    })
  }, [])

  useEffect(() => {
    const filters: Parameters<typeof searchDreams>[0] = {}
    if (keyword.trim()) filters.keyword = keyword.trim()
    if (atmosphere !== 'all') filters.atmosphere = atmosphere
    if (tagType !== 'all' && tagValue) {
      filters.tagType = tagType
      filters.tagValue = tagValue
    } else if (tagType !== 'all') {
      filters.tagType = tagType
    }
    if (startDate) filters.startDate = new Date(startDate).getTime()
    if (endDate) filters.endDate = new Date(endDate).getTime() + 86400000

    searchDreams(filters).then(setResults)
  }, [keyword, atmosphere, tagType, tagValue, startDate, endDate, allDreams])

  const filteredTags = useMemo(() => {
    if (tagType === 'all') return allTags
    return allTags.filter((t) => t.type === tagType)
  }, [allTags, tagType])

  const groupedTags = useMemo(() => {
    const groups: { groupLabel: string; tags: typeof filteredTags }[] = []
    const typeOrder: DreamTag['type'][] = ['person', 'place', 'object']
    typeOrder.forEach((type) => {
      const tags = filteredTags.filter((t) => t.type === type)
      if (type === tagType && tagValue && !tags.some((t) => t.value === tagValue)) {
        tags.unshift({ type: type as DreamTag['type'], value: tagValue, compositeKey: `${tagType}:${tagValue}` })
      }
      if (tags.length > 0) {
        groups.push({ groupLabel: TAG_TYPE_LABELS[type], tags })
      }
    })
    if (tagType === 'all' && tagValue && !filteredTags.some((t) => t.compositeKey === selectedTag)) {
      groups.unshift({
        groupLabel: '当前筛选',
        tags: [{ type: 'person' as DreamTag['type'], value: tagValue, compositeKey: selectedTag }],
      })
    }
    return groups
  }, [filteredTags, tagType, tagValue, selectedTag])

  return (
    <div className="fade-in">
      <h1 className="page-title">🔍 梦境检索</h1>
      <p className="page-subtitle">在梦的迷宫中找到你想重温的片段</p>

      <div
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          padding: '24px',
          marginBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div>
          <input
            type="text"
            value={keyword}
            onChange={(e) => updateParams({ keyword: e.target.value })}
            placeholder="搜索关键词..."
            style={{ width: '100%', fontSize: '1rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              氛围
            </label>
            <select
              value={atmosphere}
              onChange={(e) => updateParams({ atmosphere: e.target.value })}
              style={{ width: '100%' }}
            >
              <option value="all">全部氛围</option>
              {(Object.entries(ATMOSPHERE_LABELS) as [Atmosphere, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              标签类型
            </label>
            <select
              value={tagType}
              onChange={(e) => updateParams({ tagType: e.target.value, tagValue: '' })}
              style={{ width: '100%' }}
            >
              <option value="all">全部类型</option>
              {(Object.entries(TAG_TYPE_LABELS) as [DreamTag['type'], string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              具体标签
            </label>
            <select
              value={selectedTag}
              onChange={(e) => {
                const v = e.target.value
                if (v === 'all') {
                  updateParams({ tagType: tagType !== 'all' ? tagType : 'all', tagValue: '' })
                } else {
                  const sepIdx = v.indexOf(':')
                  updateParams({ tagType: v.slice(0, sepIdx), tagValue: v.slice(sepIdx + 1) })
                }
              }}
              style={{ width: '100%' }}
            >
              <option value="all">全部</option>
              {groupedTags.map((group) => (
                <optgroup key={group.groupLabel} label={group.groupLabel}>
                  {group.tags.map((t) => (
                    <option key={t.compositeKey} value={t.compositeKey}>
                      {t.value}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '140px' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              起始日期
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => updateParams({ startDate: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: '140px' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              结束日期
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => updateParams({ endDate: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        找到 {results.length} 条梦境
      </div>

      {results.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🌫️</div>
          <p>没有找到匹配的梦境</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {results.map((dream) => (
            <DreamCard key={dream.id} dream={dream} />
          ))}
        </div>
      )}
    </div>
  )
}
