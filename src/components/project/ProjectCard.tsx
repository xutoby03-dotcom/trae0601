import { Trash2, Video } from 'lucide-react';
import type { Project } from '@/types/project';

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export function ProjectCard({ project, onOpen, onDelete }: ProjectCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className="group relative bg-zinc-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-cyan-500 transition-all"
      onClick={onOpen}
    >
      <div className="aspect-video bg-zinc-900 flex items-center justify-center">
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Video className="w-16 h-16 text-zinc-600" />
        )}
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-white truncate">{project.name}</h3>
        <p className="text-xs text-zinc-400 mt-1">
          {project.width}x{project.height} • {project.fps}fps
        </p>
        <p className="text-xs text-zinc-500 mt-1">
          {formatDate(project.updatedAt)}
        </p>
      </div>
      
      <button
        className="absolute top-2 right-2 p-2 bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-red-500"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(e);
        }}
      >
        <Trash2 className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}
