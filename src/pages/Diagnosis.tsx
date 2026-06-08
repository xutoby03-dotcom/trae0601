import { useState } from 'react'
import { SYMPTOM_DIAGNOSIS, DiagnosisResult } from '../types'

const SYMPTOM_ICONS: Record<string, string> = {
  '叶子发黄': '💛',
  '叶子卷边': '🌀',
  '掉叶': '🍂',
  '叶尖发褐': '🟤',
  '茎部徒长': '📏',
  '叶片有斑点': '🔍',
}

export default function Diagnosis() {
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null)
  const [result, setResult] = useState<DiagnosisResult | null>(null)

  const handleSelect = (symptom: string) => {
    setSelectedSymptom(symptom)
    const found = SYMPTOM_DIAGNOSIS.find(d => d.symptom === symptom)
    setResult(found || null)
  }

  return (
    <div>
      <h2 className="page-title">🩺 问题诊断</h2>
      <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 20 }}>
        选择你的植物出现的症状，获取可能原因和护理建议
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 12,
        marginBottom: 24,
      }}>
        {SYMPTOM_DIAGNOSIS.map(d => (
          <button
            key={d.symptom}
            onClick={() => handleSelect(d.symptom)}
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius)',
              border: selectedSymptom === d.symptom ? '2px solid var(--green-500)' : '1px solid var(--gray-200)',
              background: selectedSymptom === d.symptom ? 'var(--green-50)' : 'white',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
              boxShadow: selectedSymptom === d.symptom ? '0 0 0 3px rgba(34, 197, 94, 0.1)' : 'var(--shadow)',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>
              {SYMPTOM_ICONS[d.symptom] || '❓'}
            </div>
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              color: selectedSymptom === d.symptom ? 'var(--green-700)' : 'var(--gray-700)',
            }}>
              {d.symptom}
            </div>
          </button>
        ))}
      </div>

      {result && (
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--green-500), var(--green-600))',
            color: 'white',
            padding: '16px 20px',
          }}>
            <div style={{ fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              {SYMPTOM_ICONS[result.symptom]} {result.symptom}
            </div>
          </div>

          <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                🔎 可能原因
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.possibleCauses.map((cause, i) => (
                  <div key={i} style={{
                    padding: '10px 14px',
                    background: 'var(--red-50)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 14,
                    color: 'var(--gray-700)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <span style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'var(--red-100)',
                      color: 'var(--red-500)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      {i + 1}
                    </span>
                    {cause}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                ✅ 护理建议
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.suggestions.map((suggestion, i) => (
                  <div key={i} style={{
                    padding: '10px 14px',
                    background: 'var(--green-50)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 14,
                    color: 'var(--gray-700)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <span style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'var(--green-100)',
                      color: 'var(--green-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      {i + 1}
                    </span>
                    {suggestion}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!result && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌿</div>
          <div>请选择上方症状卡片开始诊断</div>
        </div>
      )}
    </div>
  )
}
