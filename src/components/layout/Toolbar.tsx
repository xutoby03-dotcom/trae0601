import { useState } from 'react';
import { Undo2, Redo2, Save, Download, Film, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/store/useProjectStore';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { ExportModal } from '@/components/export/ExportModal';

export function Toolbar() {
  const navigate = useNavigate();
  const [showExport, setShowExport] = useState(false);
  
  const currentProject = useProjectStore((state) => state.currentProject);
  const saveCurrentProject = useProjectStore((state) => state.saveCurrentProject);
  const saveProjectData = useTimelineStore((state) => state.saveProjectData);
  
  const { tracks, clips } = useTimelineStore();
  const { canUndo, canRedo, undo, redo } = useHistoryStore();

  const handleSave = async () => {
    if (!currentProject) return;
    await saveProjectData(currentProject.id);
    await saveCurrentProject();
  };

  const handleUndo = () => {
    const snapshot = undo();
    if (snapshot) {
      useTimelineStore.getState().setTracks(snapshot.tracks);
      useTimelineStore.getState().setClips(snapshot.clips);
    }
  };

  const handleRedo = () => {
    const snapshot = redo();
    if (snapshot) {
      useTimelineStore.getState().setTracks(snapshot.tracks);
      useTimelineStore.getState().setClips(snapshot.clips);
    }
  };

  return (
    <div className="h-14 flex items-center justify-between px-4 bg-zinc-900 border-b border-zinc-700">
      <div className="flex items-center gap-4">
        <button
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">返回</span>
        </button>
        
        <div className="h-6 w-px bg-zinc-700" />
        
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-cyan-500" />
          <span className="font-semibold text-white">{currentProject?.name || '未命名项目'}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className={`p-2 rounded transition-colors ${
            canUndo()
              ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              : 'text-zinc-600 cursor-not-allowed'
          }`}
          onClick={handleUndo}
          disabled={!canUndo()}
          title="撤销 (Ctrl+Z)"
        >
          <Undo2 className="w-5 h-5" />
        </button>
        
        <button
          className={`p-2 rounded transition-colors ${
            canRedo()
              ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              : 'text-zinc-600 cursor-not-allowed'
          }`}
          onClick={handleRedo}
          disabled={!canRedo()}
          title="重做 (Ctrl+Y)"
        >
          <Redo2 className="w-5 h-5" />
        </button>
        
        <div className="h-6 w-px bg-zinc-700 mx-2" />
        
        <button
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
          onClick={handleSave}
        >
          <Save className="w-4 h-4" />
          保存
        </button>
        
        <button
          className="flex items-center gap-2 px-4 py-1.5 text-sm bg-orange-600 hover:bg-orange-500 rounded transition-colors font-medium"
          onClick={() => setShowExport(true)}
        >
          <Download className="w-4 h-4" />
          导出
        </button>
      </div>

      <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} />
    </div>
  );
}
