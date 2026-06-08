import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { ProjectStatus } from '@/types'

export default function ProjectForm() {
  const navigate = useNavigate()
  const addProject = useStore((s) => s.addProject)

  const [form, setForm] = useState({
    name: '',
    description: '',
    status: '进行中' as ProjectStatus,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const id = addProject(form)
    navigate(`/projects/${id}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-secondary p-2.5">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="font-serif text-2xl font-bold text-bark">创建项目</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <h3 className="section-title">项目信息</h3>
          <div>
            <label className="block text-sm font-medium text-bark mb-1.5">项目名称 *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="如：星空滴胶手机壳、布艺口金包"
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-bark mb-1.5">项目描述</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="记录项目灵感、设计方案等..."
              className="input-field min-h-[100px] resize-y"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-bark mb-1.5">状态</label>
            <div className="flex gap-3">
              {(['进行中', '已完成'] as ProjectStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, status }))}
                  className={`px-5 py-2.5 rounded-full font-medium transition-all duration-200 ${
                    form.status === status
                      ? 'bg-caramel text-white shadow-craft'
                      : 'bg-parchment text-caramel-dark hover:bg-sand-light'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            取消
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />创建项目
          </button>
        </div>
      </form>
    </div>
  )
}
