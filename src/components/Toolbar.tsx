import React from 'react'
import { useWeddingStore } from '../store'
import { RELATIONSHIP_COLORS, RelationshipGroup } from '../types'
import { Wand2, Download, FileText, Image, ClipboardList } from 'lucide-react'

export default function Toolbar() {
  const { guests, tables, autoGroup, conflicts } = useWeddingStore()

  const handleExportCards = () => {
    let content = '═══════════════════════════════\n'
    content += '         婚礼桌卡名单\n'
    content += '═══════════════════════════════\n\n'

    tables.forEach((table) => {
      const tableGuests = guests.filter((g) => g.tableId === table.id)
      content += `┌─────────────────────────────┐\n`
      content += `│  ${table.name}（${tableGuests.reduce((s, g) => s + g.partySize, 0)}/${table.maxSeats}人）\n`
      content += `├─────────────────────────────┤\n`
      tableGuests.forEach((g) => {
        const tags: string[] = []
        if (g.isChild) tags.push('儿童')
        if (g.isElderly) tags.push('长辈')
        if (g.dietaryRestrictions) tags.push(`忌口:${g.dietaryRestrictions}`)
        const tagStr = tags.length ? ` [${tags.join(',')}]` : ''
        content += `│  ${g.name}${g.partySize > 1 ? ` ×${g.partySize}` : ''}${tagStr}\n`
      })
      content += `└─────────────────────────────┘\n\n`
    })

    downloadText(content, '婚礼桌卡名单.txt')
  }

  const handleExportCheckin = () => {
    let content = '═══════════════════════════════════\n'
    content += '         婚礼迎宾签到表\n'
    content += '═══════════════════════════════════\n\n'

    tables.forEach((table) => {
      const tableGuests = guests.filter((g) => g.tableId === table.id)
      content += `${table.name}\n`
      content += '───────────────────────────────────\n'
      content += '  姓名          | 人数 | 关系   | 签到\n'
      content += '───────────────────────────────────\n'
      tableGuests.forEach((g) => {
        const name = g.name.padEnd(8, '　')
        const size = String(g.partySize).padEnd(4)
        const rel = g.relationship.padEnd(4, '　')
        content += `  ${name} | ${size} | ${rel} | □\n`
      })
      content += '\n'
    })

    downloadText(content, '婚礼迎宾签到表.txt')
  }

  const handleExportOverview = () => {
    const canvas = document.createElement('canvas')
    const scale = 2
    const w = 800
    const h = 700
    canvas.width = w * scale
    canvas.height = h * scale
    const ctx = canvas.getContext('2d')!
    ctx.scale(scale, scale)

    ctx.fillStyle = '#faf7f2'
    ctx.fillRect(0, 0, w, h)

    ctx.fillStyle = '#8B7355'
    ctx.font = 'bold 28px serif'
    ctx.textAlign = 'center'
    ctx.fillText('💒 婚礼座位总览图', w / 2, 40)

    ctx.fillStyle = '#c9a87c'
    ctx.fillRect(w / 2 - 60, 55, 120, 30)
    ctx.fillStyle = 'white'
    ctx.font = '14px sans-serif'
    ctx.fillText('主舞台', w / 2, 75)

    ctx.font = '11px sans-serif'
    ctx.textAlign = 'left'

    tables.forEach((table) => {
      const tx = table.x + 70
      const ty = table.y + 90
      const tableGuests = guests.filter((g) => g.tableId === table.id)
      const total = tableGuests.reduce((s, g) => s + g.partySize, 0)

      ctx.beginPath()
      ctx.arc(tx, ty, 30, 0, Math.PI * 2)
      ctx.fillStyle = table.zone ? RELATIONSHIP_COLORS[table.zone] : '#f0ebe4'
      ctx.fill()
      ctx.strokeStyle = '#c9a87c'
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.fillStyle = '#5a4a3a'
      ctx.textAlign = 'center'
      ctx.font = 'bold 11px sans-serif'
      ctx.fillText(table.name, tx, ty - 5)
      ctx.font = '9px sans-serif'
      ctx.fillText(`${total}/${table.maxSeats}人`, tx, ty + 8)

      tableGuests.forEach((g, i) => {
        const angle = (i / Math.max(tableGuests.length, 1)) * 2 * Math.PI - Math.PI / 2
        const sx = tx + 38 * Math.cos(angle)
        const sy = ty + 38 * Math.sin(angle)
        ctx.fillStyle = RELATIONSHIP_COLORS[g.relationship]
        ctx.beginPath()
        ctx.arc(sx, sy, 4, 0, Math.PI * 2)
        ctx.fill()
      })
    })

    ctx.textAlign = 'left'
    ctx.font = '11px sans-serif'
    const legendY = h - 30
    ;(['亲戚', '同学', '同事', '朋友', '其他'] as RelationshipGroup[]).forEach((r, i) => {
      ctx.fillStyle = RELATIONSHIP_COLORS[r]
      ctx.beginPath()
      ctx.arc(30 + i * 100, legendY, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#5a4a3a'
      ctx.fillText(r, 40 + i * 100, legendY + 4)
    })

    const link = document.createElement('a')
    link.download = '婚礼座位总览图.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const downloadText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="toolbar-panel">
      <div className="toolbar-section">
        <h3>智能排座</h3>
        <button className="btn btn-accent" onClick={autoGroup}>
          <Wand2 size={16} /> 按关系自动分组
        </button>
        <p className="toolbar-hint">自动将宾客按亲戚、同学、同事、朋友分区安排</p>
      </div>

      <div className="toolbar-section">
        <h3>导出</h3>
        <button className="btn btn-secondary" onClick={handleExportCards}>
          <FileText size={16} /> 桌卡名单
        </button>
        <button className="btn btn-secondary" onClick={handleExportCheckin}>
          <ClipboardList size={16} /> 迎宾签到表
        </button>
        <button className="btn btn-secondary" onClick={handleExportOverview}>
          <Image size={16} /> 座位总览图
        </button>
      </div>

      <div className="toolbar-section">
        <h3>统计</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{guests.length}</span>
            <span className="stat-label">总宾客</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{guests.reduce((s, g) => s + g.partySize, 0)}</span>
            <span className="stat-label">总人数</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{tables.length}</span>
            <span className="stat-label">桌数</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{guests.filter((g) => !g.tableId).length}</span>
            <span className="stat-label">未安排</span>
          </div>
        </div>
      </div>
    </div>
  )
}
