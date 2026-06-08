import { useRef } from 'react'
import { exportAllData, importAllData } from '../utils/storage'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const fileRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const handleExport = () => {
    const data = exportAllData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `绿植管家备份_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const success = importAllData(reader.result as string)
      if (success) {
        alert('数据导入成功！')
        navigate('/')
      } else {
        alert('导入失败，请检查文件格式')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div>
      <h2 className="page-title">⚙️ 设置</h2>

      <div style={{ maxWidth: 500 }}>
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--gray-700)' }}>
            💾 数据管理
          </h3>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 16 }}>
            所有数据存储在本地浏览器中，导出备份可防止数据丢失。
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              className="btn btn-primary"
              onClick={handleExport}
              style={{ width: '100%' }}
            >
              📤 导出备份
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => fileRef.current?.click()}
              style={{ width: '100%' }}
            >
              📥 导入备份
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--gray-700)' }}>
            ℹ️ 关于
          </h3>
          <div style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.8 }}>
            <div>🌿 绿植管家 v1.0</div>
            <div>室内植物照料日历</div>
            <div>数据仅存储在本地浏览器中</div>
          </div>
        </div>
      </div>
    </div>
  )
}
