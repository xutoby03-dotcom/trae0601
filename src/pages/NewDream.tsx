import { useState } from 'react'
import { Atmosphere, DreamTag, ATMOSPHERE_LABELS, TAG_TYPE_LABELS } from '../types'
import { addDream, generateId } from '../db'
import { ATMOSPHERE_STYLES } from '../atmosphere'
import { useNavigate } from 'react-router-dom'

export default function NewDream() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [atmosphere, setAtmosphere] = useState<Atmosphere>('absurd')
  const [fragments, setFragments] = useState<string[]>([''])
  const [tags, setTags] = useState<DreamTag[]>([])
  const [tagInput, setTagInput] = useState('')
  const [tagType, setTagType] = useState<DreamTag['type']>('person')

  const currentStyle = ATMOSPHERE_STYLES[atmosphere]

  function addFragment() {
    setFragments([...fragments, ''])
  }

  function updateFragment(index: number, value: string) {
    const updated = [...fragments]
    updated[index] = value
    setFragments(updated)
  }

  function removeFragment(index: number) {
    if (fragments.length <= 1) return
    setFragments(fragments.filter((_, i) => i !== index))
  }

  function addTag() {
    const val = tagInput.trim()
    if (!val) return
    if (tags.some((t) => t.type === tagType && t.value === val)) return
    setTags([...tags, { type: tagType, value: val }])
    setTagInput('')
  }

  function removeTag(index: number) {
    setTags(tags.filter((_, i) => i !== index))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  async function handleSubmit() {
    if (!title.trim()) return
    const validFragments = fragments.filter((f) => f.trim())
    if (validFragments.length === 0) return

    const dream = {
      id: generateId(),
      title: title.trim(),
      atmosphere,
      fragments: validFragments,
      tags,
      createdAt: Date.now(),
    }

    await addDream(dream)
    navigate(`/dream/${dream.id}`)
  }

  return (
    <div className="fade-in" style={{ maxWidth: '720px' }}>
      <h1 className="page-title">✨ 记录梦境</h1>
      <p className="page-subtitle">趁着记忆还没散去，把梦的碎片留下来</p>

      <div style={{ marginBottom: '32px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
          梦的氛围
        </label>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {(Object.entries(ATMOSPHERE_LABELS) as [Atmosphere, string][]).map(([key, label]) => {
            const s = ATMOSPHERE_STYLES[key]
            const isActive = atmosphere === key
            return (
              <button
                key={key}
                onClick={() => setAtmosphere(key)}
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: isActive ? s.card : 'var(--bg-secondary)',
                  color: isActive ? s.text : 'var(--text-secondary)',
                  border: isActive ? `2px solid ${s.border}` : '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: isActive ? `0 0 24px ${s.glow}` : 'none',
                }}
              >
                <span>{s.emoji}</span>
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ marginBottom: '28px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
          梦的标题
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="给这段梦起个名字..."
          style={{ width: '100%', fontSize: '1.05rem' }}
        />
      </div>

      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            碎片描述
          </label>
          <button
            className="btn-secondary"
            onClick={addFragment}
            style={{ padding: '4px 14px', fontSize: '0.75rem' }}
          >
            + 添加片段
          </button>
        </div>
        {fragments.map((frag, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '10px',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                marginTop: '10px',
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            <textarea
              value={frag}
              onChange={(e) => updateFragment(i, e.target.value)}
              placeholder={`第 ${i + 1} 段碎片...`}
              style={{ flex: 1, minHeight: '60px' }}
            />
            {fragments.length > 1 && (
              <button
                onClick={() => removeFragment(i)}
                style={{
                  background: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '1.2rem',
                  padding: '8px',
                  marginTop: '4px',
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '36px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
          梦里的元素标签
        </label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {(['person', 'place', 'object'] as DreamTag['type'][]).map((type) => (
            <button
              key={type}
              onClick={() => setTagType(type)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: tagType === type ? `var(--accent)` : 'var(--bg-secondary)',
                color: tagType === type ? '#fff' : 'var(--text-secondary)',
                border: tagType === type ? 'none' : '1px solid var(--border)',
              }}
            >
              {TAG_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`输入${TAG_TYPE_LABELS[tagType]}名称，回车添加...`}
            style={{ flex: 1 }}
          />
          <button className="btn-secondary" onClick={addTag} style={{ padding: '8px 18px' }}>
            添加
          </button>
        </div>
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            {tags.map((tag, i) => (
              <span
                key={i}
                className={`tag tag-${tag.type}`}
                style={{ cursor: 'pointer' }}
                onClick={() => removeTag(i)}
              >
                {TAG_TYPE_LABELS[tag.type]}: {tag.value} ×
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          className="btn-primary"
          onClick={handleSubmit}
          style={{ padding: '14px 32px', fontSize: '1rem' }}
        >
          🌙 入馆收藏
        </button>
        <button
          className="btn-secondary"
          onClick={() => navigate('/')}
        >
          取消
        </button>
      </div>
    </div>
  )
}
