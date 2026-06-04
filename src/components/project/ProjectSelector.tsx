import { useEffect, useState } from 'react';
import { Plus, Film, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/store/useProjectStore';
import { ProjectCard } from './ProjectCard';

export function ProjectSelector() {
  const navigate = useNavigate();
  const { projects, loadProjects, createProject, deleteProject, isLoading } = useProjectStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreateProject = async () => {
    if (!projectName.trim()) return;
    
    const project = await createProject(projectName.trim());
    navigate(`/editor/${project.id}`);
  };

  const handleOpenProject = (projectId: string) => {
    navigate(`/editor/${projectId}`);
  };

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这个项目吗？此操作不可撤销。')) {
      await deleteProject(projectId);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <Film className="w-10 h-10 text-cyan-500" />
            <h1 className="text-3xl font-bold">视频编辑器</h1>
          </div>
          
          <button
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium transition-colors"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-5 h-5" />
            新建项目
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          </div>
        ) : projects.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold mb-6">最近项目</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={() => handleOpenProject(project.id)}
                  onDelete={(e) => handleDeleteProject(project.id, e)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Film className="w-20 h-20 text-zinc-700 mb-6" />
            <h2 className="text-xl font-semibold text-zinc-400 mb-2">还没有项目</h2>
            <p className="text-zinc-500 mb-6">创建你的第一个视频项目开始编辑</p>
            <button
              className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium transition-colors"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-5 h-5" />
              创建新项目
            </button>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">创建新项目</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                项目名称
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="输入项目名称..."
                className="w-full px-4 py-2.5 bg-zinc-700 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                autoFocus
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
                onClick={() => setShowCreateModal(false)}
              >
                取消
              </button>
              <button
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCreateProject}
                disabled={!projectName.trim()}
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
